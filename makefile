# ---------------------------------------
# BASE PATHS (ABSOLUTE)
# ---------------------------------------
ROOT_DIR              := $(CURDIR)
LOCAL_DIR             := $(ROOT_DIR)/local-deploy
LAMBDA_DIR            := $(ROOT_DIR)/lambdas
ARTIFACTS_DIR         := $(ROOT_DIR)/artifacts
TERRAFORM_DIR         := $(ROOT_DIR)/terraform
TERRAFORM_PROD_DIR    := $(TERRAFORM_DIR)/prod
TERRAFORM_ECR_DIR     := $(TERRAFORM_DIR)/ecr-setup
FRONTEND_DIR          := $(ROOT_DIR)/web-client
TFVARS_FILE           := $(TERRAFORM_PROD_DIR)/prod.tfvars
GENERATED_TFVARS_FILE := $(TERRAFORM_PROD_DIR)/prod-generated.tfvars

# ---------------------------------------
# CONFIGURABLE INPUTS
# ---------------------------------------
PROFILE               ?= default

IMAGES = \
	unimart-api \
	unimart-scraper \
	unimart-typesense \
	unimart-typesense-sidecar

SQS_ZIP_PATH          := $(ARTIFACTS_DIR)/sqs_to_dynamo.zip
TYPESENSE_ZIP_PATH    := $(ARTIFACTS_DIR)/dynamo_to_typesense.zip
COGNITO_KEYS_ZIP_PATH := $(ARTIFACTS_DIR)/cognito_keys_to_s3.zip

ACCOUNT_ID            := $(shell aws sts get-caller-identity --profile $(PROFILE) --query Account --output text)
REGION                := $(shell aws configure get region --profile $(PROFILE))

# ---------------------------------------
# COLORS FOR LOGGING
# ---------------------------------------
GREEN  := \033[0;32m
YELLOW := \033[1;33m
RED    := \033[0;31m
BLUE   := \033[1;34m
RESET  := \033[0m

# ---------------------------------------
# PHONY TARGETS
# ---------------------------------------
.PHONY: \
	all deploy docker ecr push-images zip \
	prod prod-plan prod-spa prod-sync-jwks prod-deploy generate-prod-vars \
	destroy destroy-prod destroy-ecr check-deps

# ---------------------------------------
# HIGH-LEVEL TARGETS
# ---------------------------------------
all: deploy

deploy: check-deps docker ecr prod-deploy

prod-deploy: zip prod prod-sync-jwks prod-spa

destroy: destroy-prod destroy-ecr

# ---------------------------------------
# VALIDATE DEPENDENCIES
# ---------------------------------------
check-deps:
	@echo -e "$(BLUE)[INFO]$(RESET) Checking required tools..."
	@command -v terraform >/dev/null 2>&1 || (echo -e "$(RED)[ERROR]$(RESET) terraform not found." && exit 1)
	@command -v aws >/dev/null 2>&1 || (echo -e "$(RED)[ERROR]$(RESET) aws CLI not found." && exit 1)
	@command -v docker >/dev/null 2>&1 || (echo -e "$(RED)[ERROR]$(RESET) docker not found." && exit 1)
	@command -v npm >/dev/null 2>&1 || (echo -e "$(RED)[ERROR]$(RESET) npm not found." && exit 1)
	@echo -e "$(GREEN)[DONE]$(RESET) All required tools found."

# ---------------------------------------
# BUILD: Lambda Artifacts & Docker Images
# ---------------------------------------
zip:
	@echo -e "$(BLUE)[INFO]$(RESET) Cleaning up old artifacts..."
	rm -rf $(ARTIFACTS_DIR)
	@echo -e "$(GREEN)[DONE]$(RESET) Old artifacts cleaned up."

	@echo -e "$(BLUE)[INFO]$(RESET) Creating Lambda zip files..."
	mkdir -p $(ARTIFACTS_DIR)
	zip -j $(COGNITO_KEYS_ZIP_PATH) $(LAMBDA_DIR)/cognito_keys_to_s3.py >/dev/null
	zip -j $(SQS_ZIP_PATH) $(LAMBDA_DIR)/sqs_to_dynamo.py >/dev/null
	zip -j $(TYPESENSE_ZIP_PATH) $(LAMBDA_DIR)/dynamo_to_typesense.py >/dev/null
	@echo -e "$(GREEN)[DONE]$(RESET) Lambda zips created in $(ARTIFACTS_DIR)"

docker:
	@echo -e "$(BLUE)[INFO]$(RESET) Building Docker images..."
	docker build -t unimart-api --platform=linux/amd64 ./api
	docker build -t unimart-scraper --platform=linux/amd64 ./scraping
	docker build -t unimart-typesense -f ./typesense-cluster/Dockerfile.typesense --platform=linux/amd64 ./typesense-cluster
	docker build -t unimart-typesense-sidecar -f ./typesense-cluster/Dockerfile.sidecar --platform=linux/amd64 ./typesense-cluster
	@echo -e "$(GREEN)[DONE]$(RESET) Docker builds complete"

# ---------------------------------------
# DEPLOY: ECR Setup & Push Docker Images
# ---------------------------------------
ecr:
	@echo -e "$(BLUE)[INFO]$(RESET) Provisioning ECR repositories..."
	terraform -chdir=$(TERRAFORM_ECR_DIR) init
	terraform -chdir=$(TERRAFORM_ECR_DIR) apply -var="profile=$(PROFILE)" -auto-approve
	aws ecr get-login-password --region $(REGION) --profile $(PROFILE) | \
		docker login --username AWS --password-stdin $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com
	$(MAKE) push-images

push-images:
	@echo -e "$(BLUE)[INFO]$(RESET) Tagging and pushing Docker images to ECR..."
	@API=$$(terraform -chdir=$(TERRAFORM_ECR_DIR) output -raw api_image_url):latest && \
	SCRAPER=$$(terraform -chdir=$(TERRAFORM_ECR_DIR) output -raw scraper_image_url):latest && \
	TYPESENSE=$$(terraform -chdir=$(TERRAFORM_ECR_DIR) output -raw typesense_image_url):latest && \
	SIDECAR=$$(terraform -chdir=$(TERRAFORM_ECR_DIR) output -raw sidecar_image_url):latest && \
	docker tag unimart-api $$API && docker push $$API && \
	docker tag unimart-scraper $$SCRAPER && docker push $$SCRAPER && \
	docker tag unimart-typesense $$TYPESENSE && docker push $$TYPESENSE && \
	docker tag unimart-typesense-sidecar $$SIDECAR && docker push $$SIDECAR
	@echo -e "$(GREEN)[DONE]$(RESET) Images pushed successfully"

# ---------------------------------------
# GENERATE TFVARS FOR PROD
# ---------------------------------------
generate-prod-vars:
	@echo -e "$(BLUE)[INFO]$(RESET) Generating $(GENERATED_TFVARS_FILE) with ECR + ZIP variables..."
	@cd $(TERRAFORM_ECR_DIR) && \
	API=$$(terraform output -raw api_image_url 2>&1); \
	SCRAPER=$$(terraform output -raw scraper_image_url 2>&1); \
	TYPESENSE=$$(terraform output -raw typesense_image_url 2>&1); \
	SIDECAR=$$(terraform output -raw sidecar_image_url 2>&1); \
	echo "$$API"     | grep -E "Warning|Error" && { echo -e "$(RED)[ERROR]$(RESET) Invalid output for api_image_url"; exit 1; } || true; \
	echo "$$SCRAPER" | grep -E "Warning|Error" && { echo -e "$(RED)[ERROR]$(RESET) Invalid output for scraper_image_url"; exit 1; } || true; \
	echo "$$TYPESENSE" | grep -E "Warning|Error" && { echo -e "$(RED)[ERROR]$(RESET) Invalid output for typesense_image_url"; exit 1; } || true; \
	echo "$$SIDECAR" | grep -E "Warning|Error" && { echo -e "$(RED)[ERROR]$(RESET) Invalid output for sidecar_image_url"; exit 1; } || true; \
	echo "profile = \"$(PROFILE)\"" > $(GENERATED_TFVARS_FILE); \
	echo "api_image = \"$$API:latest\"" >> $(GENERATED_TFVARS_FILE); \
	echo "scraper_image = \"$$SCRAPER:latest\"" >> $(GENERATED_TFVARS_FILE); \
	echo "typesense_image = \"$$TYPESENSE:latest\"" >> $(GENERATED_TFVARS_FILE); \
	echo "typesense_sidecar_image = \"$$SIDECAR:latest\"" >> $(GENERATED_TFVARS_FILE); \
	echo "sqs_zip_path = \"$(SQS_ZIP_PATH)\"" >> $(GENERATED_TFVARS_FILE); \
	echo "typesense_zip_path = \"$(TYPESENSE_ZIP_PATH)\"" >> $(GENERATED_TFVARS_FILE); \
	echo "cognito_keys_to_s3_zip_path = \"$(COGNITO_KEYS_ZIP_PATH)\"" >> $(GENERATED_TFVARS_FILE)
	@echo -e "$(GREEN)[DONE]$(RESET) $(GENERATED_TFVARS_FILE) created successfully"

# ---------------------------------------
# DEPLOY: Terraform PROD Stack
# ---------------------------------------
prod: generate-prod-vars
	@echo -e "$(BLUE)[INFO]$(RESET) Deploying with $(TFVARS_FILE) + generated-vars.tfvars..."
	terraform -chdir=$(TERRAFORM_PROD_DIR) init
	terraform -chdir=$(TERRAFORM_PROD_DIR) apply \
	  -var-file="$(TFVARS_FILE)" \
	  -var-file="$(GENERATED_TFVARS_FILE)" \
	  -auto-approve

prod-plan: generate-prod-vars
	@echo -e "$(BLUE)[INFO]$(RESET) Planning changes with $(TFVARS_FILE) + generated-vars.tfvars..."
	terraform -chdir=$(TERRAFORM_PROD_DIR) init
	terraform -chdir=$(TERRAFORM_PROD_DIR) plan \
	  -var-file="$(TFVARS_FILE)" \
	  -var-file="$(GENERATED_TFVARS_FILE)"

prod-spa:
	@echo -e "$(BLUE)[INFO]$(RESET) Deploying SPA to S3..." && \
	API_HOST=$$(terraform -chdir=$(TERRAFORM_PROD_DIR) output -raw api_dns_name) && \
	BUCKET_NAME=$$(terraform -chdir=$(TERRAFORM_PROD_DIR) output -raw static_site_bucket) && \
	COGNITO_POOL_ID=$$(terraform -chdir=$(TERRAFORM_PROD_DIR) output -raw cognito_user_pool_id) && \
	COGNITO_USER_POOL_CLIENT_ID=$$(terraform -chdir=$(TERRAFORM_PROD_DIR) output -raw cognito_user_pool_client_id) && \
	echo "NEXT_PUBLIC_API_HOST=$$API_HOST" > $(FRONTEND_DIR)/.env && \
	echo "NEXT_PUBLIC_API_PORT=80" >> $(FRONTEND_DIR)/.env && \
	echo "NEXT_PUBLIC_USER_POOL_ID=$$COGNITO_POOL_ID" >> $(FRONTEND_DIR)/.env && \
	echo "NEXT_PUBLIC_USER_POOL_CLIENT_ID=$$COGNITO_USER_POOL_CLIENT_ID" >> $(FRONTEND_DIR)/.env && \
	npm install && \
	npm run build && \
	aws s3 sync $(FRONTEND_DIR)/out s3://$$BUCKET_NAME --delete && \
	echo -e "$(GREEN)[DONE]$(RESET) SPA deployed to S3."

prod-sync-jwks:
	@terraform -chdir=$(TERRAFORM_PROD_DIR) output -raw cognito_user_pool_id 2>/dev/null | grep -q "Warning\|Error" && \
	echo -e "$(RED)[ERROR]$(RESET) Failed to get cognito_user_pool_id" && exit 1 || true && \
	POOL_ID=$$(terraform -chdir=$(TERRAFORM_PROD_DIR) output -raw cognito_user_pool_id) && \
	BUCKET=$$(terraform -chdir=$(TERRAFORM_PROD_DIR) output -raw jwks_bucket) && \
	echo -e "$(BLUE)[INFO]$(RESET) Syncing JWKS from Cognito → S3..." && \
	curl -s "https://cognito-idp.$(REGION).amazonaws.com/$$POOL_ID/.well-known/jwks.json" | \
	aws s3 cp - "s3://$$BUCKET/jwks.json" \
	  --profile $(PROFILE) --region $(REGION) \
	  --content-type application/json && \
	echo -e "$(GREEN)[DONE]$(RESET) JWKS synced successfully"

# ---------------------------------------
# destroy infrastructure
# ---------------------------------------
destroy-prod: generate-prod-vars
	@echo -e "$(YELLOW)[WARN]$(RESET) destroying infrastructure with $(TFVARS_FILE) + generated-vars.tfvars..."
	terraform -chdir=$(TERRAFORM_PROD_DIR) init
	terraform -chdir=$(TERRAFORM_PROD_DIR) destroy \
	  -var-file="$(TFVARS_FILE)" \
	  -var-file="$(GENERATED_TFVARS_FILE)"
	@echo -e "$(GREEN)[DONE]$(RESET) prod infrastructure destroyed"

destroy-ecr:
	@echo -e "$(YELLOW)[WARN]$(RESET) destroying ecr repositories..."
	terraform -chdir=$(TERRAFORM_ECR_DIR) destroy -var="profile=$(PROFILE)"
	@echo -e "$(GREEN)[DONE]$(RESET) ecr destroyed"


# ---------------------------------------
# dev local deployments
# ---------------------------------------

dev-up:
	@echo -e "$(BLUE)[INFO]$(RESET) Deploying local development environment..."
	cd $(LOCAL_DIR) && \
		docker compose up -d --build && \
		echo -e "$(GREEN)[DONE]$(RESET) Local development environment deployed."

dev-down:
	@echo -e "$(BLUE)[INFO]$(RESET) Shutting down local development environment..."
	cd $(LOCAL_DIR) && \
		docker compose down && \
		echo -e "$(GREEN)[DONE]$(RESET) Local development environment shut down."
