import {
  Anchor,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Container,
  Divider,
  Drawer,
  Group,
  Header,
  HoverCard,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
  createStyles,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconApple,
  IconBottle,
  IconBread,
  IconBuildingStore,
  IconBuildingWarehouse,
  IconChevronDown,
  IconFlask,
  IconFridge,
  IconHome,
  IconMeat,
  IconMilk,
  IconMoodKid,
  IconMug,
  IconPaw,
  IconShoppingCart,
  IconSnowflake,
  IconUser,
  IconWand,
} from "@tabler/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/authContext";
import AutocompleteWithSearch from "./search/search-bar";
import { UnimartLogo } from "./unimart-logo";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: 42,
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: -theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md}px ${theme.spacing.md * 2}px`,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
      }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  search: {
    [theme.fn.smallerThan("xs")]: {
      width: 50,
    },
    maxWidth: 500,
    flexGrow: 1,
  },

  hiddenDesktop: {
    [theme.fn.largerThan("md")]: {
      display: "none",
    },
  },

  headerMobile: {
    [theme.fn.smallerThan("sm")]: {
      padding: 0,
    },
  },
}));

const mockdata = [
  {
    icon: IconBuildingStore,
    title: "Almacén",
    description: "Fideos, arroz, café, pan...",
    category: "Almacén",
  },
  {
    icon: IconBuildingWarehouse,
    title: "Bazar y textil",
    description: "Pegamento, cinta adhesiva, papel...",
    category: "Bazar y textil",
  },
  {
    icon: IconBottle,
    title: "Bebidas",
    description: "Gaseosas, jugos naturales...",
    category: "Bebidas",
  },
  {
    icon: IconMeat,
    title: "Carnes y pescados",
    description: "Carne, pollo, pescado...",
    category: "Carnes y pescados",
  },
  {
    icon: IconSnowflake,
    title: "Congelados",
    description: "Precocinados, helados, postres...",
    category: "Congelados",
  },
  {
    icon: IconMug,
    title: "Desayuno y merienda",
    description: "Té, café, galletitas...",
    category: "Desayuno y merienda",
  },
  {
    icon: IconFridge,
    title: "Electro y tecnología",
    description: "Lavarropas, heladeras...",
    category: "Electro y tecnología",
  },
  {
    icon: IconApple,
    title: "Frutas y Verduras",
    description: "Manzana, pera, banana...",
    category: "Frutas y verduras",
  },
  {
    icon: IconHome,
    title: "Hogar",
    description: "Lamparas, muebles, decoración...",
    category: "Hogar",
  },
  {
    icon: IconWand,
    title: "Limpieza",
    description: "Limpieza, cuidado personal...",
    category: "limpieza",
  },
  {
    icon: IconMilk,
    title: "Lácteos y productos frescos",
    description: "Leche, yogur, queso...",
    category: "Lácteos y productos frescos",
  },
  {
    icon: IconPaw,
    title: "Mascotas",
    description: "Comida balanceada, accesorios...",
    category: "Mascotas",
  },
  {
    icon: IconMoodKid,
    title: "Mundo bebé",
    description: "Juguetes, pañales, fórmula...",
    category: "Mundo bebé",
  },
  {
    icon: IconBread,
    title: "Panadería y Repostería",
    description: "Pan, tortas, postres...",
    category: "panadería y repostería",
  },
  {
    icon: IconFlask,
    title: "Perfumería",
    description: "Desodorantes, jabones...",
    category: "perfumería",
  }
];

export const HeaderMegaMenu: React.FC = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { classes, theme } = useStyles();
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const links = mockdata.map((item) => (
    <UnstyledButton
      className={classes.subLink}
      key={item.title}
      onClick={() => router.push(`/categories/${item.category}`)}
    >
      <Group noWrap align="flex-start" onClick={closeDrawer}>
        <ThemeIcon size={34} variant="outline" radius="md">
          <item.icon size={22} color={theme.fn.primaryColor()} />
        </ThemeIcon>
        <div>
          <Text size="sm" weight={500}>
            {item.title}
          </Text>
          <Text size="xs" color="dimmed" lineClamp={1}>
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Box>
      <Header height={60} className={classes.headerMobile}>
        <Container size={"xl"} style={{ height: "100%" }}>
          <Group spacing="xl" position="apart" sx={{ height: "100%" }}>
            <Link href={"/"} style={{ display: "flex" }}>
              <UnimartLogo />
            </Link>
            <AutocompleteWithSearch />
            <Group sx={{ height: "100%" }} className={classes.hiddenMobile}>
              <Link href="/" className={classes.link}>
                Inicio
              </Link>
              <HoverCard
                width={600}
                position="bottom"
                radius="md"
                shadow="md"
                withinPortal
              >
                <HoverCard.Target>
                  <Link href="/categories" className={classes.link} style={{ display: "flex", alignItems: "center" }}>
                    <Center inline>
                      <Box component="span" mr={5}>
                        Categorías
                      </Box>
                      <IconChevronDown size={16} color={theme.fn.primaryColor()} />
                    </Center>
                  </Link>
                </HoverCard.Target>

                <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
                  <Group position="apart" px="md">
                    <Text weight={500}>Categorías</Text>
                    <Anchor href="/categories" size="xs">
                      Ver todas
                    </Anchor>
                  </Group>

                  <Divider
                    my="sm"
                    mx="-md"
                    color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
                  />

                  <SimpleGrid cols={2} spacing={0}>
                    {links}
                  </SimpleGrid>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>

            {!isLoggedIn && (
              <Link href={"/access"}>
                <Group className={classes.hiddenMobile}>
                  <Button>Acceder</Button>
                </Group>
              </Link>
            )}

            {isLoggedIn && (
              <Group className={classes.hiddenMobile}>
                <Link href={"/cart"}>
                  <Button>
                    <IconShoppingCart></IconShoppingCart>
                  </Button>
                </Link>
                <Link href={"/profile"}>
                  <Button variant="outline">
                    <IconUser></IconUser>
                  </Button>
                </Link>
              </Group>
            )}

            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              className={classes.hiddenDesktop}
            />
          </Group>
        </Container>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="full"
        padding="md"
        title="Navegación"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea sx={{ height: "calc(100vh - 60px)" }} mx="-md">
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />
          <Link href="/" className={classes.link} onClick={closeDrawer}>
            Inicio
          </Link>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Categorias
              </Box>
              <IconChevronDown size={16} color={theme.fn.primaryColor()} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Group position="center" grow pb="xl" px="md">
            <Link href={"/access"}>
              <Button>Acceder</Button>
            </Link>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};
