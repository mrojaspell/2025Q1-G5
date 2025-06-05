# Terraform

## Terraform Modules (`terraform/modules/*`)

Below is a list of the Terraform modules used to deploy the AWS infrastructure. Each module encapsulates one responsibility.  

### `modules/vpc`
- **Primary VPC** with public & private subnets  
- Security Groups for API, ALB, Typesense, scraper, Lambda, and VPC endpoints  
- **Gateway Endpoints**: DynamoDB & S3 in private route tables (keeps traffic inside the VPC)

### `modules/cognito`
- **Cognito User Pool** + **User Pool Client**  
- S3 bucket storing **JWKS** (JSON Web Key Set) files  
- **Daily JWKS refresh Lambda** triggered by an EventBridge rule (24-hour schedule)

### `modules/ecs-api`
- ECS **Fargate Task Definition** & **Service** for the FastAPI backend  
- Environment variables injected: DynamoDB tables, Cognito IDs, JWKS bucket/key, Typesense endpoint, etc.  
- Registers in an **Application Load Balancer** (Target Group on port 8000)

### `modules/ecs-scraper`
- EventBridge-scheduled **Fargate tasks** for each store defined in `var.stores`  
- Scraper container fetches websites, transforms data, pushes products to an SQS queue

### `modules/ecs-typesense`
- **Typesense cluster** on Fargate:  
  - Containers: `typesense` (main) + `sidecar` (peer discovery)  
  - Ports exposed: **8108** (API) & **8107** (clustering)
- DynamoDB table for **peer discovery**   
- Attached to an **internal ALB**

### `modules/lambda-pipeline`
- **Lambda #1 – SQS → DynamoDB**  
  - Consumes SQS messages, writes to the “products” table  
- **Lambda #2 – DynamoDB → Typesense**  
  - Processes DynamoDB Streams from “products”, indexes into Typesense  
  - Runs **inside the VPC** with proper subnets and SGs  
- Event-source mappings for both functions

### `modules/load-balancer`
- Provisions an **Application Load Balancer** (ALB)  
- Target Group + HTTP Listener on **port 80**  
- Configures healtchecks on the desired path

### `modules/sqs`
- Single SQS queue (e.g., `unimart-products-queue`)  
- Custom visibility timeout  
- Used by scrapers (producer) and the SQS → DynamoDB Lambda (consumer)

### `modules/static-s3`
- Public S3 bucket **static website**  
- Configures `index.html` & `error.html` 
- “Public read” bucket policy for frontend hosting

---
## 2. Production Deployment `terraform/prod/main.tf`

`prod/main.tf` is the **root** module for the deployment.  

It does two things:
1. **Invokes every module**
2. **Declares a small set of standalone AWS resources** that do not belong inside a reusable module but are still needed.

The Resources declared **outside** any module invocation are the following:

### 2.1 DynamoDB Tables
| Name (`aws_dynamodb_table`) | Keys & Streams | Purpose |
|-----------------------------|----------------|---------|
| `unimart_products` | • **PK:** `ean` (string)  <br>• **SK:** `SK` (string) <br>• **Streams:** NEW_IMAGE | Stores product data; stream feeds DynamoDB → Typesense Lambda |
| `unimart_carts` | • **PK:** `user_id` (string) <br>• **SK:** `SK` (string) <br>• **Streams:** Disabled | Stores user cart data |

### 2.2 ECS Cluster
- `aws_ecs_cluster.main` → **unimart-cluster** for all Fargate services (API, scraper, Typesense)

### 2.3 VPC Interface Endpoints
| Endpoint | ID in Terraform | Rationale |
|----------|-----------------|-----------|
| **ECR API** | `ecr_api` | Private image-metadata traffic |
| **ECR DKR (registry)** | `ecr_dkr` | Private Docker push/pull traffic |
| **CloudWatch Logs** | `cloudwatch_logs` | Private log ingestion & retrieval |

### 2.4 CloudWatch Log Groups (1-day retention)
| Log Group | Terraform Name | Tags |
|-----------|----------------|------|
| `/ecs/unimart-api` | `unimart_api` | `Service = "api"`, `Project = "unimart"` |
| `/ecs/unimart-scraper` | `unimart_scraper` | `Service = "scraper"`, `Project = "unimart"` |
| `/ecs/unimart-typesense` | `unimart_typesense` | `Service = "typesense"`, `Project = "unimart"` |

---

## ECR Repositories (`terraform/ecr-setup/main.tf`)

These repositories **must exist before the first deployment** so we can push images to them before the ecs services are created.

| Repository (`aws_ecr_repository`) | Terraform Name | Force Delete | Purpose |
|----------------------------------|----------------|--------------|---------|
| `unimart-api` | `api` | `true` | Holds FastAPI backend images |
| `unimart-scraper` | `scraper` | `true` | Holds scraper job images |
| `unimart-typesense` | `typesense` | `true` | Typesense server images |
| `unimart-typesense-sidecar` | `typesense_sidecar` | `true` | Sidecar for peer-discovery coordination |

---
