import scrapy
from scrapy.crawler import CrawlerRunner
from twisted.internet import reactor, defer

class CotoScraper(scrapy.Spider):
    name = "coto_spider"
    start_urls = ["https://www.cotodigital3.com.ar/sitios/cdigi/browse"]

    def parse(self, response):
        base_url = "https://www.cotodigital3.com.ar"
        containers = response.css('ul#products.grid > li div.product_info_container a::attr(href)').getall()

        hasNext = response.css('ul#atg_store_pagination > li.even > a::attr(href)').get()
        if hasNext:
            yield scrapy.Request(base_url + hasNext, callback=self.parse)

        for link in containers:
            yield scrapy.Request(base_url + link, callback=self.parseItems)

    def parseItems(self, response):
        print(f"[COTO] Visiting: {response.url}")
        ean_text = response.css("div #brandText :nth-child(2)::text").get()
        ean = int(ean_text.strip()) if ean_text and ean_text.strip().isdigit() else 0

        price = response.css("div #productInfoContainer span.atg_store_newPrice::text").get()
        if price:
            price = price.strip().replace("$", "").replace('.', '').replace(',', '.')

        name = response.css("div #productInfoContainer > div > h1.product_page::text").get()
        if name:
            name = name.strip()

        brand = response.css("table.tblData > tr.mute > td.firstborder > span.texto::text").get() or "SIN MARCA"
        item_link = response.css("link[rel=canonical]::attr(href)").get()
        image_link = response.css("div #zoomContent img::attr(src)").get()

        aux = response.css("div#atg_store_breadcrumbs > a > p::text").getall()
        categories = [aux[1].strip(), aux[3].strip()] if len(aux) > 3 else ["Unknown", "Unknown"]
        
        item = {
            "ean": ean,
            "name": name,
            "image": image_link,
            "brand": brand,
            "category": categories,
            "price": price,
            "link": item_link,
            "store": "coto",
        }

        yield item
