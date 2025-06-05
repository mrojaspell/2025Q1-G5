import { Carousel } from "@mantine/carousel";
import {
  createStyles,
  Title,
  Text,
  Container,
  Space,
  useMantineTheme,
  Box,
} from "@mantine/core";
import { categoriesData, CategoryCard } from "./category-card";
import { HeroSectionDrawing } from "./grocery-drawing";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: 120,
    paddingBottom: 120,

    "@media (max-width: 755px)": {
      paddingTop: 80,
      paddingBottom: 60,
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
    "@media (max-width: 1200px)": {
      marginBottom: 64,
      padding: 16,
    },
  },

  title: {
    textAlign: "left",
    fontWeight: 800,
    fontSize: 64,
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `${theme.fontFamily}`,

    "@media (max-width: 520px)": {
      fontSize: 36,
      marginBottom: theme.spacing.xl,
      textAlign: "left",
    },
  },

  highlight: {
    color:
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6],
  },

  description: {
    textAlign: "left",

    "@media (max-width: 520px)": {
      textAlign: "left",
      fontSize: theme.fontSizes.md,
    },
  },

  controls: {
    marginTop: theme.spacing.lg,
    display: "flex",
    justifyContent: "left",

    "@media (max-width: 520px)": {
      flexDirection: "column",
    },
  },

  control: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    "@media (max-width: 520px)": {
      height: 42,
      fontSize: theme.fontSizes.md,

      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },

  drawingl: {
    color: theme.colors.gray[3],
    position: "absolute",
    left: -1200,
    top: -15,
    "@media (max-width: 1400px)": {
      left: -1000,
      top: 0,
    },
  },

  drawingr: {
    color: theme.colors.gray[3],
    position: "absolute",
    right: -1200,
    top: -15,
    "@media (max-width: 1400px)": {
      right: -1000,
      top: 0,
    },
  },

  container: {
    marginTop: -196,
    "@media (max-width: 1400px)": {
      marginTop: -120,
    },
  },
}));

export function HeroText() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const autoplay = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, active: true })
  );
  
  return (
    <Box pb={120}>
      <Box
        pb={256}
        className={classes.wrapper}
        style={{
          backgroundColor: theme.colors.gray[1],
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        <HeroSectionDrawing className={classes.drawingr} />

        <HeroSectionDrawing className={classes.drawingl} />

        <div className={classes.inner}>
          <Container p={0} size={"sm"}>
            <Title className={classes.title}>
              Los{" "}
              <Text component="span" className={classes.highlight} inherit>
                mejores precios
              </Text>{" "}
              para vos, en un{" "}
              <Text component="span" className={classes.highlight} inherit>
                único
              </Text>{" "}
              lugar.
            </Title>
            <Space h={"xl"} />
            <Text size="xl" color="dimmed" className={classes.description}>
              Encontrá los productos que comprás habitualmente en los comercios
              más cercanos, al precio más barato.
            </Text>
            <Space h={64} />
          </Container>
        </div>
      </Box>
      <Container size={"xl"} className={classes.container} px="xl">
        <Text size={"xl"} weight={700}>
          Categorías
        </Text>
        <Carousel
          slideSize="33%"
          skipSnaps
          slideGap="md"
          controlSize={32}
          breakpoints={[
            { maxWidth: "md", slideSize: "50%" },
            { maxWidth: "sm", slideSize: "100%", slideGap: "md" },
          ]}
          py="xl"
          loop
          plugins={[autoplay.current as any]}
        >
          {categoriesData.map((category: any) => (
            <Carousel.Slide key={category.desc}>
              <CategoryCard
                title={category.title}
                desc={category.desc}
                img={category.image}
                category={category.category}
                clickable={true}
              />
            </Carousel.Slide>
          ))}
        </Carousel>

        <Space h={64} />

        {/* <ProductShowcase query="lays" cols={4} /> */}
      </Container>
    </Box>
  );
}
