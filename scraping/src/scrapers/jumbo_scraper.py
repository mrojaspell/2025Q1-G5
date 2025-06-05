from src.scrapers.vtex_scraper import VTEXSpider

class jumbo_scraper(VTEXSpider):
    name = "jumbo_scraper"
    site_name = "jumbo"
    base_url = "https://www.jumbo.com.ar"
    categories = [
        "https://www.jumbo.com.ar/electro",
        "https://www.jumbo.com.ar/despensa",
        "https://www.jumbo.com.ar/bebidas",
        "https://www.jumbo.com.ar/lacteos",
        "https://www.jumbo.com.ar/frutas-y-verduras",
        "https://www.jumbo.com.ar/tiempo-libre",
        "https://www.jumbo.com.ar/almacen",
        "https://www.jumbo.com.ar/carnes",
        "https://www.jumbo.com.ar/perfumeria",
        "https://www.jumbo.com.ar/bebes-y-ninos",
        "https://www.jumbo.com.ar/limpieza",
        "https://www.jumbo.com.ar/quesos-y-fiambres",
        "https://www.jumbo.com.ar/congelados",
        "https://www.jumbo.com.ar/panaderia-y-reposteria",
        "https://www.jumbo.com.ar/comidas-preparadas",
        "https://www.jumbo.com.ar/mascotas",
        "https://www.jumbo.com.ar/hogar-y-textil",
        "https://www.jumbo.com.ar/pescados-y-mariscos",
    ]
