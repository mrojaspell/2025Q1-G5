from src.scrapers.vtex_scraper import VTEXSpider

class carrefour_scraper(VTEXSpider):
    name = "carrefour_scraper"
    site_name = "carrefour"
    base_url = "https://www.carrefour.com.ar"
    sku_filter = "ALL_AVAILABLE"  # Para carrefor es distinmto
    categories = [
        "https://www.carrefour.com.ar/Electro-y-tecnologia",
        "https://www.carrefour.com.ar/Bazar-y-textil",
        "https://www.carrefour.com.ar/Almacen",
        "https://www.carrefour.com.ar/Desayuno-y-merienda",
        "https://www.carrefour.com.ar/Bebidas",
        "https://www.carrefour.com.ar/Lacteos-y-productos-frescos",
        "https://www.carrefour.com.ar/Carnes-y-Pescados",
        "https://www.carrefour.com.ar/Frutas-y-Verduras",
        "https://www.carrefour.com.ar/Panaderia",
        "https://www.carrefour.com.ar/Congelados",
        "https://www.carrefour.com.ar/Limpieza",
        "https://www.carrefour.com.ar/Perfumeria",
        "https://www.carrefour.com.ar/Mundo-Bebe",
        "https://www.carrefour.com.ar/Mascotas",
        "https://www.carrefour.com.ar/bazar-y-textil/indumentaria",
    ]
