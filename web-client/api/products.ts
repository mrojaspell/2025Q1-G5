import axios from "axios";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
const API_PORT = process.env.NEXT_PUBLIC_API_PORT;
const BASE_PATH = 'api/products'

export const fetchProductByEAN = async (ean: string):  Promise<ProductDetails | null> => {
  try {
    const url = `http://${API_HOST}:${API_PORT}/${BASE_PATH}/${ean}/`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by EAN:", error);
    return null;
  }
};


export interface StorePrice {
  store: string;
  price: number;
  link: string;
  date: string; // ISO format e.g. "2024-05-12"
};

export interface ProductDetails {
  name: string;
  brand: string;
  image: string;
  category: string;
  prices: StorePrice[];
};
