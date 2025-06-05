# Unimart Cloud

A cloud application for scraping supermarket data, indexing it, and exposing it via an API.



---

## Project Structure

| Module               | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `api/`               | FastAPI backend querying DynamoDB and Typesense with cognito authentication |
| `lambdas/`           | Lambda functions for JWKS sync, SQS-to-DynamoDB ans DynamoDB-to-Typesense pipelines |
| `scraping/`          | Scrapy spiders for supermarket product data                            |
| `web-client/`        | Next.js SPA frontend                                                   |
| `terraform/`         | Infrastructure as Code with Terraform                                  |
| `typesense-cluster/` | Dockerfiles and peer discovery logic for Typesense ECS deployment      |
| `local-deploy/`      | Local development scripts and Docker Compose with LocalStack           |

---

## Terraform Documentation

The detailed explanation of the infrastructure and Terraform modules can be found in the `terraform/README.md` file. Please refer to that document for an overview of resources and module structure.


---

> [!NOTE]
>  This project uses a `Makefile` to automate common tasks. Below are the main targets you can use:
> ```sh
> make deploy
> make destroy
> ```


## Local Development

Spin up a complete local stack (except frontend):

```sh
make dev-up
```

* API: [http://localhost:8000](http://localhost:8000)
* Typesense: [http://localhost:8108](http://localhost:8108)
* LocalStack mocks AWS services

To shut down the stack:

```sh
make dev-down
```

> [!NOTE]
> The frontend is not included in `dev-up`. Run it manually:
> ```sh
> cd web-client
> npm install
> npm run dev
> ```

---

## Production Deployment

### ⚠️ Important

> Due to path resolution issues, Docker images built using the Makefile  
> **do not work correctly on WSL** (Windows Subsystem for Linux).  
>
> The Makefile scripts have been tested and confirmed to work properly on  
> **Linux** and **macOS**.

You can deploy the application to AWS with:



```sh
make deploy       # Full deploy: ecr + app + frontend
```

This runs:

* `make check-deps` Checks that needed programs are installed
* `make docker` Builds docker files
* `make ecr` Creates ecr and pushes images
* `make prod-deploy`, which includes:

  * `make zip` Zips lambdas
  * `make prod` Deploys application to AWS
  * `make prod-sync-jwks` Puts cognito's public keys to an S3 bucket
  * `make prod-spa` Builds next app and uploads it to public S3 bucket


### Destroy Infrastructure

```sh
make destroy        # Destroy ECR and prod infrastructure
make destroy-prod   # Destroy only application infra
make destroy-ecr    # Destroy only ECR resources
```

### Other targets

```sh
make prod-plan      # Run terraform plan with current config
```


### Additional Notes

* Uses `make generate-prod-vars` internally to write ECR image and Lambda paths to `prod-generated.tfvars`
* AWS credentials and region are sourced from your configured AWS profile (default: `default`). Override using `PROFILE=your-profile`.
* When deployed, scrapers are limited in the amount of products scrapped to avoid extra AWS charges. To remove the limit, remove the **LIMIT** environment variable in the `ecs-scrapers` module.

---
