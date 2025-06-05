import {
  createStyles,
  Title,
  Text,
  Button,
  Group,
  Center,
  Stack,
} from "@mantine/core";
import Link from "next/link";
import { ConfusedUni } from "./confused-uni";

const useStyles = createStyles((theme) => ({
  root: {
    height: "80vh",
  },

  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: 220,
    lineHeight: 1,
    marginRight: 48,
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

export default function NoResultsTitle() {
  const { classes } = useStyles();

  return (
    <Center className={classes.root}>
      <Stack justify={"start"}>
        <Center pr={"xl"} mb="xl">
          <ConfusedUni />
        </Center>

        <Title className={classes.title}>¡Caracoles!</Title>
        <Text
          color="dimmed"
          size="lg"
          align="center"
          className={classes.description}
        >
          Parece que no hay productos que coincidan con tu búsqueda. Comprobá
          los datos introducidos.
        </Text>
        <Group position="center">
          <Link href={"/categories"}>
            <Button variant="subtle" size="md">
              Ir a Categorías
            </Button>
          </Link>
        </Group>
      </Stack>
    </Center>
  );
}
