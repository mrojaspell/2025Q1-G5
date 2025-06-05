import {
  createStyles,
  Title,
  Text,
  Button,
  Container,
  Group,
} from "@mantine/core";
import Link from "next/link";
import { Layout } from "../components/layout";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 80,
  },

  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: 220,
    lineHeight: 1,
    marginBottom: theme.spacing.xl * 1.5,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[2],

    [theme.fn.smallerThan("sm")]: {
      fontSize: 120,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: "center",
    fontWeight: 900,
    fontSize: 38,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 32,
    },
  },

  description: {
    maxWidth: 500,
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl * 1.5,
  },
}));

export default function NotFoundTitle() {
  const { classes } = useStyles();

  return (
    <Layout title="Oops...">
      <Container className={classes.root}>
        <div className={classes.label}>404</div>
        <Title className={classes.title}>Oops...</Title>
        <Text
          color="dimmed"
          size="lg"
          align="center"
          className={classes.description}
        >
          Parece que no hay nada por acá, pero podes seguir comparando los
          mejores precios.
        </Text>
        <Group position="center">
          <Link href={"/"}>
            <Button variant="subtle" size="md">
              Volver a la página de inicio
            </Button>
          </Link>
        </Group>
      </Container>
    </Layout>
  );
}
