import {
  ActionIcon,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Space,
  Text,
} from "@mantine/core";
import Image from "next/image";
import { capitalizeFirstLetter, TableScrollArea } from "../pages/product";
import { useEffect } from "react";
import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconShoppingCartDiscount,
} from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { useCounter } from "@mantine/hooks";
import { ProductDetails } from "../api/products";
import { useCart } from "../context/cartContext";
import { useAuth } from "../context/authContext";

var formatter = new Intl.NumberFormat("es-ar", {
  style: "currency",
  currency: "ARS",
});

interface ProductDetailProps {
  ean: string;
  data: ProductDetails;
}

export function ProductDetail({ ean, data }: ProductDetailProps) {
  const { addToCart, Items } = useCart();
  const { isLoggedIn } = useAuth();

  const [count, handlers] = useCounter(1, {
    min: 1,
    max: 99,
  });

  useEffect(() => {
    const currentItemCount = Items.find((item) => item.ean === ean)?.count;
    if (currentItemCount !== undefined) {
      handlers.set(currentItemCount);
    }
  }, [Items, ean]);

  const handleClick = (
    event: React.MouseEvent<HTMLElement>,
    action: () => void,
  ) => {
    event.stopPropagation();
    action();
  };

  const best = data.prices.reduce((min, curr) =>
    curr.price < min.price ? curr : min,
  );

  return (
    <Container>
      {data !== undefined && (
        <>
          <Container>
            <h1>{data.name}</h1>
          </Container>
          <Container size="xl">
            <Space h={10} />
            <Container my="md">
              <SimpleGrid
                cols={2}
                spacing="md"
                breakpoints={[{ maxWidth: "sm", cols: 1 }]}
              >
                <Card withBorder radius="md">
                  <Card.Section>
                    <Box
                      style={{
                        height: "450px",
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      <Image
                        unoptimized
                        src={data.image}
                        alt={data.name}
                        layout="fill"
                        objectFit="contain"
                        priority
                      />
                    </Box>
                  </Card.Section>
                </Card>
                <Grid gutter="md">
                  <Grid.Col>
                    <TableScrollArea data={data} />
                    <Space h={5} />
                    <Container>
                      <Text size="sm" weight={250}>
                        {"Marca: " + data.brand}
                      </Text>
                    </Container>
                    <Container>
                      <Group>
                        <Text size="sm" weight={250}>
                          {"Mejor Precio: " + formatter.format(best.price)}
                        </Text>
                        <IconShoppingCartDiscount
                          size={16}
                          style={{ marginRight: "4px" }}
                          color="gray"
                        />
                        <Text weight={600} size="lg">
                          {capitalizeFirstLetter(best.store)}
                        </Text>
                      </Group>
                    </Container>
                    <Space h={5} />
                    {isLoggedIn && (
                      <Group position="apart" align={"stretch"} spacing={8}>
                        <Paper
                          radius={"xl"}
                          withBorder
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <Group position="center" spacing={4} px={4}>
                            <ActionIcon
                              variant="transparent"
                              onClick={(
                                event: React.MouseEvent<HTMLButtonElement>,
                              ) => handleClick(event, handlers.decrement)}
                            >
                              <IconMinus size={16} />
                            </ActionIcon>
                            <Text
                              size={15}
                              style={{ width: "2ch" }}
                              align="center"
                            >
                              {count}
                            </Text>
                            <ActionIcon
                              variant="transparent"
                              onClick={(
                                event: React.MouseEvent<HTMLButtonElement>,
                              ) => handleClick(event, handlers.increment)}
                            >
                              <IconPlus size={16} />
                            </ActionIcon>
                          </Group>
                        </Paper>
                        <Button
                          style={{ flex: 1 }}
                          radius="xl"
                          onClick={(
                            event: React.MouseEvent<HTMLButtonElement>,
                          ) => {
                            event.stopPropagation();
                            addToCart(ean, count);
                            showNotification({
                              title: "Se añadió al carrito",
                              message: data.name,
                              icon: <IconCheck size={18} />,
                            });
                            // }
                          }}
                        >
                          Añadir al carrito
                        </Button>
                      </Group>
                    )}
                  </Grid.Col>
                </Grid>
              </SimpleGrid>
            </Container>
          </Container>
        </>
      )}
    </Container>
  );
}
