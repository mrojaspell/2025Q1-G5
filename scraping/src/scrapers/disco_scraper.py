from src.scrapers.vtex_scraper import VTEXSpider


class disco_scraper(VTEXSpider):
    name = "disco_scraper"
    site_name = "disco"
    base_url = "https://www.disco.com.ar"
    categories = [
        "https://www.disco.com.ar/electro",
        "https://www.disco.com.ar/despensa",
        "https://www.disco.com.ar/bebidas",
        "https://www.disco.com.ar/lacteos",
        "https://www.disco.com.ar/frutas-y-verduras",
        "https://www.disco.com.ar/tiempo-libre",
        "https://www.disco.com.ar/almacen",
        "https://www.disco.com.ar/carnes",
        "https://www.disco.com.ar/perfumeria",
        "https://www.disco.com.ar/bebes-y-ninos",
        "https://www.disco.com.ar/limpieza",
        "https://www.disco.com.ar/quesos-y-fiambres",
        "https://www.disco.com.ar/congelados",
        "https://www.disco.com.ar/panaderia-y-reposteria",
        "https://www.disco.com.ar/comidas-preparadas",
        "https://www.disco.com.ar/mascotas",
        "https://www.disco.com.ar/hogar-y-textil",
    ]
