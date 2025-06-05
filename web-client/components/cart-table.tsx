import { useState } from "react";
import { createStyles, Table, ScrollArea, Button, Image } from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import { useCart } from "../context/cartContext";
import { CartItem } from "../api/carts";
import { ProductDetails } from "../api/products";

export const STORES = ["dia", "jumbo", "carrefour", "disco"] as const;
type StoreName = typeof STORES[number];

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    top: 0,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease",
    zIndex: 10,
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
      }`,
    },
  },
  scrolled: {
    boxShadow: theme.shadows.sm,
  },
  footer: {
    position: "sticky",
  },
}));

export interface CartItemWithDetails {
  item: CartItem;
  details: ProductDetails;
}

interface TableScrollAreaProps {
  Items: CartItemWithDetails[];
}

export function TableScrollArea({ Items }: TableScrollAreaProps) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const { increaseItem, decreaseItem, deleteItem } = useCart();

  // Dynamically build total object for all stores
  const total: Record<StoreName, number> = Object.fromEntries(
    STORES.map((store) => [store, 0])
  ) as Record<StoreName, number>;

  // Track missing price for each store
  const priceMissing: Record<StoreName, boolean> = Object.fromEntries(
    STORES.map((store) => [store, false])
  ) as Record<StoreName, boolean>;

  const rows = Items.map(({ item, details }) => {
    const count = item.count;
    const prices = details.prices;

    // Ensure each store is always shown, even if missing price
    const priceMap: Partial<Record<StoreName, number>> = {};
    prices.forEach((storePrice) => {
      if (STORES.includes(storePrice.store as StoreName)) {
        priceMap[storePrice.store as StoreName] = storePrice.price;
      }
    });

    STORES.forEach((store) => {
      const price = priceMap[store];
      if (typeof price === "number") {
        total[store] += price * count;
      } else {
        priceMissing[store] = true;
      }
    });

    return (
      <tr key={item.ean}>
        <td>
          <Image src={details.image} alt="cart_image" width={80}></Image>
          {details.name}
        </td>
        {STORES.map((store) => {
          const price = priceMap[store];
          return (
            <td key={store}>
              {typeof price === "number"
                ? `$${parseFloat((price * count).toFixed(2))}`
                : "~"}
              <br />
              {typeof price === "number" ? `$${price} C/U` : "~"}
            </td>
          );
        })}
        <td>
          <Button
            size="md"
            variant="subtle"
            onClick={() => decreaseItem(item.ean)}
          >
            -
          </Button>
          {count}
          <Button
            size="md"
            variant="subtle"
            onClick={() => increaseItem(item.ean)}
          >
            +
          </Button>
        </td>
        <td>
          <Button onClick={() => deleteItem(item.ean)}>
            <IconTrash />
          </Button>
        </td>
      </tr>
    );
  });

  return (
    <ScrollArea
      sx={{ height: 400 }}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table sx={{ minWidth: 700 }}>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Producto</th>
            {STORES.map((store) => (
              <th key={store}>{store.charAt(0).toUpperCase() + store.slice(1)}</th>
            ))}
            <th>Cantidad</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
        <tfoot className={cx(classes.header)}>
          <tr>
            <th>Total</th>
            {STORES.map((store) => (
              <th key={store}>
                ${total[store]}
                {priceMissing[store] ? "*" : ""}
              </th>
            ))}
          </tr>
        </tfoot>
      </Table>
    </ScrollArea>
  );
}
