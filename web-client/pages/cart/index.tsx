import { Button, Container, Space, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CartItemWithDetails, TableScrollArea } from "../../components/cart-table";
import { NoAccess } from "../../components/NoAccess";
import { Layout } from "../../components/layout";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartContext";
import { fetchProductByEAN } from "../../api/products";

const Cart: NextPage = () => {
  const { Items, deleteCart } = useCart();
  const { isLoggedIn, session } = useAuth();
  const [cartWithDetails, setCartWithDetails] = useState<CartItemWithDetails[]>([])
  const router = useRouter();

  useEffect(() => {
    isLoggedIn ? router.push("/cart") : router.push("/");
  }, []);

  // For each ean in items, fetch the product
  // and update the items with the product details
  useEffect(() => {
    const fetchCartItems = async () => {

      const cartItemsWithDetails: CartItemWithDetails[] = [];
      for (const item of Items) {
        try {
          const productDetails = await fetchProductByEAN(item.ean);
          if (productDetails == null) {
            console.error(`Product with EAN ${item.ean} not found`);
            continue;
          }
          cartItemsWithDetails.push({ item, details: productDetails });
        } catch (error) {
          console.error(error);
        }
      }
      setCartWithDetails(cartItemsWithDetails);
      
    };
    fetchCartItems();
  }, [Items]);

  if (!isLoggedIn) {
    return <div></div>;
  }
  if (session == null) {
    return <NoAccess />;
  }

  return (
    <Layout title="Carrito">
      <Container my="md" size={"xl"} pt={32}>
        <Text size={32}>Carrito</Text>
        <Space h={32} />
        <TableScrollArea Items={cartWithDetails}></TableScrollArea>

        {Object.keys(Items).length != 0 && (
          <Button onClick={deleteCart}>
            Eliminar Carrito
            <IconTrash />
          </Button>
        )}
      </Container>
    </Layout>
  );
};

export default Cart;
