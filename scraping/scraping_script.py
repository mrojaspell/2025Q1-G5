import os
import argparse
from multiprocessing import Process
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from scrapy.spiders import Spider
from typing import Type, Dict, TypedDict

from src.scrapers.carrefour_scraper import carrefour_scraper
from src.scrapers.disco_scraper import disco_scraper
from src.scrapers.jumbo_scraper import jumbo_scraper
from src.scrapers.dia_scraper import dia_scraper

from src.process_elems import process_all
from src.aws import load_json_to_dynamodb, upload_to_s3

from typing import Dict, TypedDict


class ScraperConfig(TypedDict):
    spider: Type[Spider]
    output: str


DATA_DIR = "data"
FINAL_OUTPUT = f"{DATA_DIR}/products.json"

SCRAPERS: Dict[str, ScraperConfig] = {
    "dia": {"spider": dia_scraper, "output": f"{DATA_DIR}/dia_items.json"},
    "disco": {"spider": disco_scraper, "output": f"{DATA_DIR}/disco_items.json"},
    "carrefour": {
        "spider": carrefour_scraper,
        "output": f"{DATA_DIR}/carrefour_items.json",
    },
    "jumbo": {"spider": jumbo_scraper, "output": f"{DATA_DIR}/jumbo_items.json"},
}


def get_settings(output_path, limit=None, concurrency=2):
    return {
        "CONCURRENT_REQUESTS": concurrency,
        "CONCURRENT_REQUESTS_PER_DOMAIN": concurrency,
        "AUTOTHROTTLE_ENABLED": False,
        "DOWNLOAD_TIMEOUT": 30,
        "RANDOMIZE_DOWNLOAD_DELAY": True,
        "LOG_ENABLED": False,
        "FEEDS": {output_path: {"format": "json", "encoding": "utf-8"}},
        "CLOSESPIDER_PAGECOUNT": int(limit) if limit else 0,
    }


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run selected scrapers, merge results, and optionally push to DynamoDB."
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limit number of items per scraper (CLOSESPIDER_PAGECOUNT)",
    )
    parser.add_argument(
        "--scrapers",
        nargs="+",
        choices=SCRAPERS.keys(),
        help="Scrapers to run (default: all)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=2,
        help="Number of concurrent requests per scraper (default: 2)",
    )
    parser.add_argument(
        "--no-scrape",
        action="store_true",
        help="Skip scraping step and only process + optionally upload",
    )

    parser.add_argument(
        "--dynamo",
        action="store_true",
        help="Upload the final JSON to DynamoDB (default is no upload)",
    )
    parser.add_argument(
        "--s3-bucket",
        type=str,
        help="If set, upload the final JSON to this S3 bucket instead of DynamoDB.",
    )
    parser.add_argument(
        "--parallel",
        action="store_true",
        help="Run scrapers in parallel (default is sequential)",
    )
    return parser.parse_args()


def run_scrapers_sequential(selected, limit, concurrency):
    process = CrawlerProcess(get_project_settings())

    for name in selected:
        print(f"Queuing {name.capitalize()} spider...")
        spider_cls = SCRAPERS[name]["spider"]
        output_path = SCRAPERS[name]["output"]
        custom_settings = get_settings(
            output_path, limit=limit, concurrency=concurrency
        )
        process.settings.update(custom_settings)
        process.crawl(spider_cls)

    print("Starting all spiders sequentially...")
    process.start()


def run_spider_in_process(spider: Type[Spider], settings: dict):
    process = CrawlerProcess(settings)
    process.crawl(spider)
    process.start()


def run_scrapers_parallel(selected, limit, concurrency):
    processes = []
    for name in selected:
        print(f"Running {name.capitalize()} scraper in parallel...")
        spider = SCRAPERS[name]["spider"]
        output_path = SCRAPERS[name]["output"]
        settings = get_settings(output_path, limit=limit, concurrency=concurrency)
        p = Process(target=run_spider_in_process, args=(spider, settings))
        p.start()
        processes.append(p)

    for p in processes:
        p.join()


if __name__ == "__main__":
    import multiprocessing

    multiprocessing.set_start_method("fork")

    args = parse_args()
    selected = args.scrapers or list(SCRAPERS.keys())

    os.makedirs(DATA_DIR, exist_ok=True)

    if not args.no_scrape:
        print("Cleaning up old files...")
        for name in selected:
            output_path = SCRAPERS[name]["output"]
            if os.path.exists(output_path):
                os.remove(output_path)

        if args.parallel:
            run_scrapers_parallel(selected, args.limit, args.concurrency)
        else:
            run_scrapers_sequential(selected, args.limit, args.concurrency)

    print("Processing merged items...")
    process_all(output_path=FINAL_OUTPUT, data_dir=DATA_DIR)
    print("✔ Merged output saved to:", FINAL_OUTPUT)

    if args.s3_bucket:
        print(f"Uploading to S3 bucket: {args.s3_bucket}...")
        upload_to_s3(FINAL_OUTPUT, args.s3_bucket, "products.json")
    elif args.dynamo:
        print("Pushing to DynamoDB...")
        load_json_to_dynamodb(FINAL_OUTPUT)
        print("DynamoDB upload complete.")
    else:
        print("Skipping upload step.")
