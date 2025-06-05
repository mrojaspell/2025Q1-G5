import {
  createStyles,
  SimpleGrid,
  Card,
  Text,
  AspectRatio,
  Box,
  Divider,
} from "@mantine/core";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";

import groceryImage from "../assets/images/grocery.png";
import fruitsImage from "../assets/images/fruits.png";
import drinksImage from "../assets/images/drinks.png";
import meatImage from "../assets/images/meat.png";
import dairyImage from "../assets/images/dairy.png";
import icedImage from "../assets/images/iced.png";
import babysImage from "../assets/images/babys.png";
import personalCareImage from "../assets/images/care.png";
import textilImage from "../assets/images/textil.png";
import teaCoffeeImage from "../assets/images/tea_coffee.png";
import electroImage from "../assets/images/electro.png";
import lightbulbImage from "../assets/images/lightbulbs.png";
import cleaningImage from "../assets/images/cleaning.png";
import petImage from "../assets/images/pet.png";
import bakerImage from "../assets/images/panaderia.png";

export const categoriesData = [
  {
    title: "Almacén",
    image: groceryImage,
    desc: "Fideos, arroz, café, pan...",
    category: "Almacén",
  },
  {
    title: "Bazar y textil",
    image: textilImage,
    desc: "Pegamento, cinta adhesiva, papel...",
    category: "Bazar y textil",
  },
  {
    title: "Bebidas",
    image: drinksImage,
    desc: "Gaseosas, jugos naturales...",
    category: "Bebidas",
  },
  {
    title: "Carnes y pescados",
    image: meatImage,
    desc: "Carne, pollo, pescado...",
    category: "Carnes y pescados",
  },
  {
    title: "Congelados",
    image: icedImage,
    desc: "Precocinados, helados, postres...",
    category: "Congelados",
  },
  {
    title: "Desayuno y merienda",
    image: teaCoffeeImage,
    desc: "Té, café, galletitas...",
    category: "Desayuno y merienda",
  },
  {
    title: "Electro y tecnología",
    image: electroImage,
    desc: "Lavarropas, heladeras...",
    category: "Electro y tecnología",
  },
  {
    title: "Frutas y Verduras",
    image: fruitsImage,
    desc: "Manzana, pera, banana...",
    category: "Frutas y verduras",
  },
  {
    title: "Hogar",
    image: lightbulbImage,
    desc: "Lamparas, muebles, decoración...",
    category: "Hogar",
  },
  {
    title: "Limpieza",
    image: cleaningImage,
    desc: "Limpieza, cuidado personal...",
    category: "Limpieza",
  },
  {
    title: "Lácteos y productos frescos",
    image: dairyImage,
    desc: "Leche, yogurt, queso...",
    category: "Lácteos y productos frescos",
  },
  {
    title: "Mascotas",
    image: petImage,
    desc: "Comida balanceada, accesorios...",
    category: "Mascotas",
  },
  {
    title: "Mundo Bebé",
    image: babysImage,
    desc: "Juguetes, pañales, fórmula...",
    category: "Mundo Bebé",
  },
  {
    title: "Panadería",
    image: bakerImage,
    desc: "Pan, tortas, postres...",
    category: "Panadería",
  },
  {
    title: "Perfumería",
    image: personalCareImage,
    desc: "Desodorantes, jabones...",
    category: "perfumería",
  },
];

const useStyles = createStyles((theme) => ({
  card: {
    transition: "transform 150ms ease, box-shadow 150ms ease",
    cursor: "pointer",
    "&:hover": {
      transform: "scale(1.00)",
      boxShadow: theme.shadows.md,
    },
  },

  title: {
    fontFamily: `${theme.fontFamily}`,
    fontWeight: 600,
  },
}));

type CategoryProps = {
  category: string;
  title: string;
  desc: string;
  img: StaticImageData;
  clickable: boolean;
};

export function CategoryCard({
  category,
  title,
  desc,
  img,
  clickable,
}: CategoryProps) {
  const { classes } = useStyles();
  if (!clickable) {
    return (
      <Card
        p="md"
        radius="md"
        // component="a"
        className={classes.card}
        withBorder
        sx={{
          minWidth: "260px",
          gap: 2,
        }}
      >
        <Card.Section>
          <AspectRatio ratio={1920 / 1080} sx={{ width: "100%"}}>
            <Box style={{ backgroundColor: "#D6E1D8" }}>
              <Image src={img} alt={title} priority unoptimized style={{ maxHeight: 200, width: "auto"}} />
            </Box>
          </AspectRatio>
          <Divider />
        </Card.Section>

        <Text className={classes.title} mt={"md"}>
          {title}
        </Text>
        <Text color="dimmed" size="md">
          {desc}
        </Text>
      </Card>
    );
  }
  return (
    <Link href={`/categories/${category}`} key={desc} style={{ textDecoration: "none", color: "inherit" }}>
      <Card
        p="md"
        radius="md"
        // component={Link}
        className={classes.card}
        withBorder
        sx={{
          minWidth: "260px",
          gap: 2,
        }}
      >
        <Card.Section>
          <AspectRatio ratio={1920 / 1080} sx={{ width: "100%" }}>
            <Box style={{ backgroundColor: "#D6E1D8" }}>
              <Image src={img} alt={title} priority unoptimized style={{ maxHeight: 200, width: "auto"}} />
            </Box>
          </AspectRatio>
          <Divider />
        </Card.Section>

        <Text className={classes.title} mt={"md"}>
          {title}
        </Text>
        <Text color="dimmed" size="md">
          {desc}
        </Text>
      </Card>
    </Link>
  );
}

export function ArticlesCardsGrid() {
  const cards = categoriesData.map((article) => (
    <CategoryCard
      key={article.desc}
      title={article.title}
      desc={article.desc}
      img={article.image}
      category={article.category}
      clickable={true}
    />
  ));

  return (
    <SimpleGrid
      cols={3}
      spacing={64}
      breakpoints={[{ maxWidth: "sm", cols: 1 }]}
    >
      {cards}
    </SimpleGrid>
  );
}
