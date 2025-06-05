
import { JWT } from "@aws-amplify/auth";
import axios from "axios";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
const API_PORT = process.env.NEXT_PUBLIC_API_PORT;
const BASE_PATH = "api/carts/me";

export interface CartItem {
  ean: string;
  count: number;
}

/**
 * Fetch the authenticated user's cart
 */
export const getCart = async (session: JWT): Promise<CartItem[]> => {

  try {
    const url = `http://${API_HOST}:${API_PORT}/${BASE_PATH}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${session.toString()}`,
      },
    });
    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching user cart:", error);
    throw error;
  }
};

/**
 * Upsert the authenticated user's cart with a new list of items
 */
export const upsertCart = async (
  session: JWT,
  items: CartItem[]
): Promise<void> => {

  try {
    const url = `http://${API_HOST}:${API_PORT}/${BASE_PATH}`;
    await axios.post(url, items, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.toString()}`,
      },
    });
  } catch (error) {
    console.error("Error updating user cart:", error);
    throw error;
  }
};
