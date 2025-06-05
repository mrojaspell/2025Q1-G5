from src.scrapers.vtex_scraper import VTEXSpider

class dia_scraper(VTEXSpider):
    name = "dia_scraper"
    site_name = "dia"
    base_url = "https://diaonline.supermercadosdia.com.ar"
    categories = [
        "https://diaonline.supermercadosdia.com.ar/almacen",
        "https://diaonline.supermercadosdia.com.ar/bebidas",
        "https://diaonline.supermercadosdia.com.ar/frescos",
        "https://diaonline.supermercadosdia.com.ar/desayuno",
        "https://diaonline.supermercadosdia.com.ar/limpieza",
        "https://diaonline.supermercadosdia.com.ar/perfumeria",
        "https://diaonline.supermercadosdia.com.ar/congelados",
        "https://diaonline.supermercadosdia.com.ar/bebes-y-ninos",
        "https://diaonline.supermercadosdia.com.ar/hogar-y-deco",
        "https://diaonline.supermercadosdia.com.ar/mascotas",
        "https://diaonline.supermercadosdia.com.ar/frescos/frutas-y-verduras",
        "https://diaonline.supermercadosdia.com.ar/almacen/golosinas-y-alfajores",
        "https://diaonline.supermercadosdia.com.ar/electro-hogar",
    ]
