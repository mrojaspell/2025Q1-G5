import json
import os
import re

from src.lib import normalize_price

def process_all(output_path="data/products.json", data_dir="."):
    amount_of_stores = 0

    # Detect all *_items.json files
    json_files_names = [
        f for f in os.listdir(data_dir)
        if re.search(r'_items\.json$', f)
    ]
    amount_of_stores = len(json_files_names)

    # Load JSON data
    allItems = []
    for json_file in json_files_names:
        with open(os.path.join(data_dir, json_file)) as file:
            allItems.append(json.load(file))

    # Merge products by EAN
    completeDictionary = {}
    for items in allItems:
        for item in items:
            ean = list(item.keys())[0]
            if ean.isnumeric() and len(ean) >= 8:
                if ean not in completeDictionary:
                    completeDictionary[ean] = {
                        "ean": ean,
                        "name": item[ean].get("name", ""),
                        "image": item[ean].get("image", ""),
                        "brand": item[ean].get("brand", ""),
                        "category": item[ean].get("category", "")
                    }
                for key, value in item[ean].items():
                    if key not in {"name", "image", "brand", "category"}:
                        completeDictionary[ean][key] = {
                            "price": str(value.get("price", "")),
                            "link": value.get("link", "")
                        }

    # Extract most popular items
    mostPopularItems = []
    for product in completeDictionary.values():
        supermarkets = [
            k for k in product.keys()
            if k not in {"ean", "name", "image", "brand", "category"}
        ]
        if len(supermarkets) > 1:
            min_price = float("inf")
            min_price_name = None
            for market in supermarkets:
                try:
                    price = float(product[market]["price"])
                    if price < min_price:
                        min_price = price
                        min_price_name = market
                except:
                    continue

            product["best_price"] = {
                "price": str(min_price),
                "name": min_price_name
            }
            product["amount_stores"] = len(supermarkets)
            mostPopularItems.append(product)

    # Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding="utf-8") as f:
        json.dump(mostPopularItems, f, indent=2)

    print(f"Saved {len(mostPopularItems)} items to {output_path}")
