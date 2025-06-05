import React, { createContext, useEffect, useState, ReactNode } from "react";
import { CartItem, getCart, upsertCart } from "../api/carts";
import { useAuth } from "./authContext";

interface Props {
  children?: ReactNode;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

interface CartContextProps {
  Items: CartItem[];
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (ean: string, count: number) => void;
  increaseItem: (ean: string) => void;
  decreaseItem: (ean: string) => void;
  deleteItem: (ean: string) => void;
  deleteCart: () => void;
}

export function CartContextProvider({ children }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { session } = useAuth();

  // Fetch cart items when session is available
  useEffect(() => {
    const fetchCart = async () => {
      if (session?.accessToken) {
        const accessToken = session.accessToken;
        try {
          const cartItems = await getCart(accessToken);
          setItems(cartItems);
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      }
    };

    fetchCart();
  }, [session]);

  // Update cart in backend when Items change
  useEffect(() => {
    const updateCart = async () => {
      if (session?.accessToken) {
        const accessToken = session.accessToken;
        try {
          await upsertCart(accessToken, items);
        } catch (error) {
          console.error("Error updating cart:", error);
        }
      }
    };

    updateCart();
  }, [items, session]);

  const addToCart = (ean: string, count: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.ean === ean);
      if (existingItem) {
        return prevItems.map((item) =>
          item.ean === ean ? { ...item, count: count } : item,
        );
      } else {
        return [...prevItems, { ean, count }];
      }
    });
  };

  const increaseItem = (ean: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.ean === ean ? { ...item, count: item.count + 1 } : item,
      ),
    );
  };

  const decreaseItem = (ean: string) => {
    setItems((prevItems) =>
      prevItems
        .map((item) =>
          item.ean === ean ? { ...item, count: item.count - 1 } : item,
        )
        .filter((item) => item.count > 0),
    );
  };

  const deleteItem = (ean: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.ean !== ean));
  };

  const deleteCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        Items: items,
        setItems,
        addToCart,
        increaseItem,
        decreaseItem,
        deleteItem,
        deleteCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartContextProvider");
  }
  return context;
}
