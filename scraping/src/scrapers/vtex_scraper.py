import scrapy
from src.lib import category_from_url, extract_state


class VTEXSpider(scrapy.Spider):
    categories = []
    site_name = ""
    base_url = ""
    sku_filter = "FIRST_AVAILABLE"  # Default value (Carrefour necesita ALL_AVAILABLE)

    def start_requests(self):
        for base_url in self.categories:
            yield scrapy.Request(
                f"{base_url}?page=1",
                callback=self.parse,
                meta={"base_url": base_url, "page": 1},
            )

    def parse(self, response):
        page = response.meta["page"]
        base_url = response.meta["base_url"]
        self.logger.info(f"Parsing page {page} from {base_url}")

        state_json = extract_state(response)
        if not state_json:
            self.logger.warning(f"STATE not found in {response.url}")
            return

        found_products = False

        for key, value in state_json.items():
            if not isinstance(value, dict) or value.get("__typename") != "Product":
                continue

            product = value
            sku_refs = product.get(f'items({{"filter":"{self.sku_filter}"}})', [])
            if not sku_refs:
                continue

            sku = state_json.get(sku_refs[0]["id"])
            if not sku:
                continue

            ean = sku.get("ean")
            sellers = sku.get("sellers", [])
            if not sellers:
                continue

            seller = state_json.get(sellers[0]["id"])
            offer_id = seller.get("commertialOffer", {}).get("id")
            offer = state_json.get(offer_id, {})

            if offer.get("AvailableQuantity", 0) == 0:
                continue

            price = offer.get("Price") or offer.get("spotPrice")
            image = ""
            image_refs = sku.get("images", [])
            if image_refs:
                image_data = state_json.get(image_refs[0].get("id"))
                if image_data:
                    image = image_data.get("imageUrl", "")

            item = {
                "ean": ean,
                "name": product.get("productName"),
                "image": image,
                "brand": product.get("brand", "SIN MARCA"),
                "category": category_from_url(base_url),
                "price": price,
                "link": f"{self.base_url}/{product.get('linkText')}/p",
                "store": self.site_name,
            }

            yield item
            found_products = True

        if found_products:
            yield scrapy.Request(
                f"{base_url}?page={page + 1}",
                callback=self.parse,
                meta={"base_url": base_url, "page": page + 1},
            )
