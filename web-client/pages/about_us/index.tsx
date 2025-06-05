import {
  Container,
  Group,
  SimpleGrid,
  Space,
  Text,
  createStyles,
} from "@mantine/core";
import type { NextPage } from "next";
import Andres from "../../assets/images/Andres.jpg";
import Carcos from "../../assets/images/Carcos.png";
import Elian from "../../assets/images/Elian.png";
import Juan from "../../assets/images/Juan.jpg";
import Nico from "../../assets/images/Nico.jpg";
import Saul from "../../assets/images/Saul.jpg";
import garcos from "../../assets/images/garcos.jpg";

import { CategoryCard } from "../../components/category-card";
import { Layout } from "../../components/layout";


export const teamData = [
  {
    title: "Nico",
    image: Nico,
    desc: "Back-end Developer",
  },
  {
    title: "Marcos",
    image: garcos,
    desc: "Back-end Developer",
  },
  {
    title: "Saul",
    image: Saul,
    desc: "Back-end Developer",
  },
  {
    title: "Juan",
    image: Juan,
    desc: "Back-end Developer",
  },
  {
    title: "Elian",
    image: Elian,
    desc: "Front-end Developer",
  },
  {
    title: "Andres",
    image: Andres,
    desc: "Front-end Developer",
  },
  {
    title: "Marcos",
    image: Carcos,
    desc: "Front-end Developer",
  },
];

const useStyles = createStyles((theme) => ({
  highlight: {
    color:
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6],
  },
}));

const About_Us: NextPage = () => {
  const { classes } = useStyles();

  return (
    <Layout title="Sobre Nosotros">
      <Container my={64}>
        <Text size={32} weight={500}>
          Nuestro objetivo
        </Text>
        <Space h={32} />
        <Group display={"inline"}>
          <Text ta="justify" size={"xl"}>
            <Text component="span">
              Dada la gran oferta y disparidad de precios a lo largo de
              distintos supermercados, entendemos que puede ser muy difícil
              encontrar el mejor precio al momento de comprar.
            </Text>
            <br />
            <Text
              component="span"
              size={"xl"}
              weight={700}
              className={classes.highlight}
            >
              Unimart
            </Text>{" "}
            <Text component="span" inherit size={30}>
              viene a resolver este problema: te brindamos un lugar que funciona
              como una página de supermercado, pero que facilita la comparación
              de precios.
            </Text>
            <br />
            <br />
            <Text
              component="span"
              size={"xl"}
              weight={700}
              className={classes.highlight}
            >
              ¡Obtener el mejor precio nunca fue tan fácil!
            </Text>
          </Text>
        </Group>
        <br />
        <Space h={32} />
        <Text size={32} weight={500}>
          El equipo
        </Text>
        <Space h={32} />
        <Group display={"inline"}>
          <Text
            size="xl"
            component="span"
            weight={700}
            className={classes.highlight}
          >
            Unimart
          </Text>{" "}
          <Text component="span" size="xl">
            surge como un proyecto de ingeniería por un grupo de alumnos del
            Instituto Tecnológico Buenos Aires. Se nos encargó encontrar un
            problema actual y plantear una solución.
          </Text>
        </Group>
        <Space h={40} />
        <SimpleGrid cols={3}>
          {teamData.map((member, index) => (
            <CategoryCard
              key={index}
              title={member.title}
              desc={member.desc}
              img={member.image}
              category={""}
              clickable={false}
            />
          ))}
        </SimpleGrid>
      </Container>
    </Layout>
  );
};

export default About_Us;
