import {
  Badge,
  Box,
  Button,
  Card,
  createStyles,
  Group,
  Menu,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconExternalLink,
  IconShoppingCartDiscount,
} from "@tabler/icons";
import startCase from "lodash.startcase";
import Image from "next/image";
import Link from "next/link";
import React, {  useState } from "react";
import capitalize from "lodash.capitalize";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "transform 150ms ease, box-shadow 150ms ease",
    cursor: "pointer",
    "&:hover": {
      boxShadow: theme.shadows.md,
    },
  },

  imageSection: {
    padding: theme.spacing.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  label: {
    marginBottom: theme.spacing.xs,
    lineHeight: 1,
    fontWeight: 700,
    fontSize: theme.fontSizes.xs,
    letterSpacing: -0.25,
    textTransform: "uppercase",
  },

  section: {
    padding: theme.spacing.md,

    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  icon: {
    marginRight: 5,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[5],
  },

  image: {
    transition: "all 250ms ease-in-out",
  },

  counter: {
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
}));

var formatter = new Intl.NumberFormat("es-ar", {
  style: "currency",
  currency: "ARS",
});

type CardProps = {
  name: string;
  price: number;
  image?: string;
  desc: string;
  offer: string;
  link: string;
  market: string;
  prices: any;
  entireItem: any;
  storeCount: any;
  ean: string;
};

export function ProductCard({
  name,
  price,
  image,
  desc,
  offer,
  market,
  prices,
  storeCount,
  ean,
}: CardProps) {
  const { classes } = useStyles();
  const [isLoading, setLoading] = useState(true);

  return (
    <Link
      href={{
        pathname: "/product",
        query: { name: name, ean: ean, brand: desc },
      }}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card withBorder radius="md" className={classes.card}>
        <Card.Section className={classes.imageSection}>
          <Box style={{ width: "100%", height: "200px", position: "relative" }}>
            {image && (
              <Image
                unoptimized
                src={image}
                alt={name}
                layout="fill"
                objectFit="contain"
                onLoadingComplete={() => {
                  setLoading(false);
                }}
                className={classes.image}
                style={isLoading ? { opacity: 0 } : { opacity: 100 }}
                priority
              />
            )}
          </Box>
        </Card.Section>

        <Group position="apart" my="md">
          <div>
            <Text size="xs" color="dimmed">
              {capitalize(desc)}
            </Text>
            <Group style={{ height: "3em" }} align="baseline">
              <Tooltip
                position="top"
                color={"gray"}
                multiline
                openDelay={500}
                width={220}
                transition="fade"
                transitionDuration={200}
                label={name}
              >
                <Text weight={500} lineClamp={2}>
                  {name}
                </Text>
              </Tooltip>
            </Group>
          </div>
        </Group>

        <Card.Section className={classes.section} py={"sm"}>
          <Stack spacing={"md"}>
            <Menu
              trigger="hover"
              openDelay={400}
              closeDelay={100}
              position="top-start"
            >
              <Menu.Target>
                <Stack spacing={4}>
                  <Group position="apart">
                    <Group spacing={1}>
                      <IconShoppingCartDiscount
                        size={16}
                        style={{ marginRight: "4px" }}
                        color="gray"
                      />
                      <Text weight={600} size="md">
                        {startCase(market)}
                      </Text>
                    </Group>

                    {offer ? (
                      <Badge variant="light" size="lg">
                        {offer}
                      </Badge>
                    ) : (
                      <></>
                    )}
                  </Group>

                  <Text size={24} weight={700} sx={{ lineHeight: 1 }}>
                    {formatter.format(price)}
                  </Text>

                  <Text size={"xs"}>
                    Disponible en {storeCount} comercio
                    {storeCount > 1 ? "s" : ""}
                  </Text>
                </Stack>
              </Menu.Target>

              <Menu.Dropdown>
                {prices.slice(1).map((item: any, i: number) => (
                  <Menu.Item
                    key={i}
                    component="a"
                    href={item.link}
                    icon={<IconExternalLink size={16} color="gray" />}
                  >
                    <Group position="apart">
                      <Text size="sm">{startCase(item.store)}</Text>

                      <Text size="sm" weight={600}>
                        {formatter.format(item.price)}
                      </Text>
                    </Group>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
            <Group position="apart" align={"stretch"} spacing={8}>
              <Button
                style={{ flex: 1 }}
                radius="xl"
              >
                Ver Producto
              </Button>
            </Group>
          </Stack>
        </Card.Section>
      </Card>
    </Link>
  );
}
