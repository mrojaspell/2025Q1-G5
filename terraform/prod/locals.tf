locals {
  vpc_cidr_block = "10.0.0.0/16"

  # Constants
  az_count               = length(var.azs)
  scraper_subnet_count   = 1
  lambda_subnet_count    = 1
  interface_ep_subnet_count = local.az_count # one per AZ

  # Role-based subnet allocations
  ext_alb_count     = local.az_count
  int_alb_count     = local.az_count
  api_count         = local.az_count
  typesense_count   = local.az_count

  total_subnets = (
    local.ext_alb_count +
    local.int_alb_count +
    local.scraper_subnet_count +
    local.api_count +
    local.typesense_count +
    local.lambda_subnet_count +
    local.interface_ep_subnet_count
  )

  subnet_cidrs = cidrsubnets(local.vpc_cidr_block, [for _ in range(local.total_subnets) : 8]...)

  # Indexing
  ext_alb_start      = 0
  ext_alb_end        = local.ext_alb_start + local.ext_alb_count

  int_alb_start      = local.ext_alb_end
  int_alb_end        = local.int_alb_start + local.int_alb_count

  scraper_start      = local.int_alb_end
  scraper_end        = local.scraper_start + local.scraper_subnet_count

  api_start          = local.scraper_end
  api_end            = local.api_start + local.api_count

  typesense_start    = local.api_end
  typesense_end      = local.typesense_start + local.typesense_count

  lambda_start       = local.typesense_end
  lambda_end         = local.lambda_start + local.lambda_subnet_count

  interface_ep_start = local.lambda_end
  interface_ep_end   = local.interface_ep_start + local.interface_ep_subnet_count

  # Subnet slices
  ext_alb_subnets       = slice(local.subnet_cidrs, local.ext_alb_start,      local.ext_alb_end)
  int_alb_subnets       = slice(local.subnet_cidrs, local.int_alb_start,      local.int_alb_end)
  scraper_subnets       = slice(local.subnet_cidrs, local.scraper_start,      local.scraper_end)
  api_subnets           = slice(local.subnet_cidrs, local.api_start,          local.api_end)
  typesense_subnets     = slice(local.subnet_cidrs, local.typesense_start,    local.typesense_end)
  lambda_subnets        = slice(local.subnet_cidrs, local.lambda_start,       local.lambda_end)
  interface_ep_subnets  = slice(local.subnet_cidrs, local.interface_ep_start, local.interface_ep_end)

  public_subnets  = concat(local.ext_alb_subnets, local.scraper_subnets)
  private_subnets = concat(local.int_alb_subnets, local.api_subnets, local.typesense_subnets, local.lambda_subnets, local.interface_ep_subnets)
}
