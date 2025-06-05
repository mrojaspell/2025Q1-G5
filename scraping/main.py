import os
import time
from typing import Type, Dict

from scrapy import Spider
from scrapy.crawler import CrawlerProcess

from src.scrapers.carrefour_scraper import carrefour_scraper
from src.scrapers.disco_scraper import disco_scraper
from src.scrapers.jumbo_scraper import jumbo_scraper
from src.scrapers.dia_scraper import dia_scraper

SCRAPERS: Dict[str, Type[Spider]] = {
    "dia": dia_scraper,
    "disco": disco_scraper,
    "carrefour": carrefour_scraper,
    "jumbo": jumbo_scraper,
}

SETTINGS = {
    "CONCURRENT_REQUESTS": 20,
    "CONCURRENT_REQUESTS_PER_DOMAIN": 20,
    "AUTOTHROTTLE_ENABLED": False,
    "DOWNLOAD_TIMEOUT": 30,
    "RANDOMIZE_DOWNLOAD_DELAY": True,
    "LOG_ENABLED": True,
    "LOG_LEVEL": "INFO",
    "ITEM_PIPELINES": {
        "src.pipelines.sqs_pipeline.SQSPipeline": 100,
    },
    "CLOSESPIDER_ITEMCOUNT": os.getenv("LIMIT") or -1,
}

if __name__ == "__main__":

    store = os.getenv("SCRAPER_STORE")

    if store not in SCRAPERS:
        raise ValueError(
            f"Invalid store name: {store}. Available stores: {list(SCRAPERS.keys())}"
        )

    time.sleep(20)

    spider = SCRAPERS[store]
    process = CrawlerProcess(settings=SETTINGS)
    process.crawl(spider)
    process.start()
