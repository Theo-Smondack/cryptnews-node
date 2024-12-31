include .env

.DEFAULT_GOAL:=help
PWD=$(shell pwd)
IMAGE_NAME = node-boilerplate-image
CONTAINER_NAME = node-boilerplate-container
NPM_RUN = npm run

##@ Helper
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nAll commands available in the Makefile\n \nUsage:\n  make \033[36m<target>\033[0m\n"} /^[.a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Starting/stopping the project
start: ## Rebuild the image and restart the container
	make stop
	make build
	make run

build: ## Build the Docker image
	docker build -t $(IMAGE_NAME) .


run: ## Run the Docker container
	docker run --name $(CONTAINER_NAME) -p $(PORT):$(PORT) -d $(IMAGE_NAME)


stop: ## Stop the running container
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

ssh: ## SSH into the running container
	docker exec -it $(CONTAINER_NAME) sh

##@ Project development
dev: ## Run project in development mode
	make stop
	$(NPM_RUN) dev

test: ## Run project tests
	$(NPM_RUN) test



