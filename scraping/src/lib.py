import os
import tempfile
import requests
import re
import json
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

def extract_state(response):
    # Attempt <template data-varname="__STATE__">
    template = response.css('template[data-varname="__STATE__"] script::text').get()
    if template:
        try:
            return json.loads(template)
        except Exception as e:
            print(f"Error parsing template JSON: {e}")

    # Fallback to <script> with __STATE__ assignment
    scripts = response.xpath("//script/text()").getall()
    for script in scripts:
        if "__STATE__" in script:
            match = re.search(r"__STATE__\s*=\s*(\{.*?\})\s*(?:;|\n|$)", script.strip(), re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception as e:
                    print(f"Error parsing script JSON: {e}")
            break

    print("No __STATE__ found")
    return None

def category_from_url(url):
    """
    Extrae segmento de categoría desde la URL base, como /electro → ['Electro']
    """
    path = urlparse(url).path.strip("/")
    parts = path.split("/")
    if parts:
        return normalize_category([parts[0].capitalize()])
    return "Sin categoría"

def download_xml_files(base_url, tmpdir):
    print(f"Downloading main sitemap from {base_url}")
    sitemap_path = os.path.join(tmpdir, "sitemap.xml")

    response = requests.get(base_url)
    response.raise_for_status()

    with open(sitemap_path, "wb") as f:
        f.write(response.content)

    print("Parsing main sitemap...")
    tree = ET.parse(sitemap_path)
    root = tree.getroot()

    product_xml_urls = [
        child[0].text for child in root if "product" in child[0].text
    ]
    print(f"Downloading {len(product_xml_urls)} product XML links.")

    downloaded_files = []
    for i, url in enumerate(product_xml_urls):
        file_path = os.path.join(tmpdir, f"product_{i}.xml")
        resp = requests.get(url)
        resp.raise_for_status()

        with open(file_path, "wb") as f:
            f.write(resp.content)

        downloaded_files.append(file_path)

    return downloaded_files

def extract_links_from_files(xml_files):
    print("Extracting product URLs from XML files...")
    product_links = []
    for file in xml_files:
        tree = ET.parse(file)
        root = tree.getroot()

        for child in root:
            if child[0].text:
                product_links.append(child[0].text)

    print(f"Extracted {len(product_links)} product URLs.")
    return product_links

def get_links(sitemap_url):
    with tempfile.TemporaryDirectory() as tmpdir:
        xml_files = download_xml_files(sitemap_url, tmpdir)
        links = extract_links_from_files(xml_files)
        return links



def normalize_price(price,delimiter,isAmericanFmt, hasThousandDelimiter):

    if delimiter != None:
        price = price[price.find(delimiter) + len(delimiter):]

    if isAmericanFmt:
        dot_index = price.find('.')
        comma_index = price.find(',')
        if(dot_index != -1):
            price = price[:dot_index] + ',' + price[dot_index+1:]
        if(comma_index != -1):
            price = price[:comma_index] + '.' + price[comma_index+1:]

    if  not hasThousandDelimiter:
        index = price.find(',')
        index = index if index != -1 else len(price)

        int_part = price[:index]
        decimal_part = price[index:]

        i = len(int_part) - 1
        c = 0
        while i > 0:
            if c % 3 == 2:
                int_part = int_part[:i] + "." + int_part[i:]
            i-=1
            c+=1

        return int_part + decimal_part

    return price


def normalize_category(categories):
    primary = categories[0].lower().strip()
    secondary = categories[1].lower().strip() if len(categories) > 1 else ""

    mapping = {
        "almacén": "Almacén",
        "almacen": "Almacén",
        "almacén/libre de gluten": "Almacén",
        "despensa":  "Almacén",

        "bazar y textil": "Bazar y textil",
        "bazar-y-textil": "Bazar y textil",
        "hogar y textil": "Bazar y textil",
        "hogar-y-textil": "Bazar y textil",
        "textil": "Bazar y textil",

        "bebidas": "Bebidas",

        "carnes": "Carnes y pescados",
        "pescados y mariscos": "Carnes y pescados",
        "pescados-y-mariscos": "Carnes y pescados",
        "carnes y pescados": "Carnes y pescados",
        "carnes-y-pescados": "Carnes y pescados",

        "comidas preparadas": "Congelados",
        "congelados": "Congelados",
        "congelados/preparados": "Congelados",
        "comidas-preparadas": "Congelados",

        "desayuno": "Desayuno y merienda",
        "desayuno y merienda": "Desayuno y merienda",
        "desayuno-y-merienda": "Desayuno y merienda",
        "kiosco": "Desayuno y merienda",

        "electro hogar": "Electro y tecnología",
        "electro-hogar": "Electro y tecnología",
        "electro y tecnología": "Electro y tecnología",
        "electro-y-tecnologia": "Electro y tecnología",
        "electro": "Electro y tecnología",

        "frutas y verduras": "Frutas y verduras",
        "frutas-y-verduras": "Frutas y verduras",

        "hogar y deco": "Hogar",
        "hogar-y-deco": "Hogar",
        "hogar": "Hogar",

        "limpieza": "Limpieza",

        "lácteos": "Lácteos y productos frescos",
        "quesos y fiambres": "Lácteos y productos frescos",
        "quesos-y-fiambres": "Lácteos y productos frescos",
        "frescos": "Lácteos y productos frescos",
        "lácteos y productos frescos": "Lácteos y productos frescos",
        "lacteos-y-productos-frescos": "Lácteos y productos frescos",
        "lacteos": "Lácteos y productos frescos",

        "mascotas": "Mascotas",

        "mundo bebé": "Mundo Bebé",
        "mundo-bebe": "Mundo Bebé",
        "bebés y niños": "Mundo Bebé",
        "bebes-y-ninos": "Mundo Bebé",

        "panadería y repostería": "Panadería y repostería",
        "panaderia-y-reposteria": "Panadería y repostería",
        "panadería": "Panadería y repostería",
        "panaderia": "Panadería y repostería",

        "perfumería": "Perfumería",
        "perfumeria": "Perfumería",

        "tiempo libre": "Aire libre",
        "tiempo-libre": "Aire libre",
        "aire libre": "Aire libre",

        "felices fiestas": "Almacén",
        "huevos de pascua": "Almacén",
    }

    blacklist = {"sin categoría", "test category", ""}

    if primary in blacklist:
        return "Otros"

    return mapping.get(primary, primary.capitalize())

