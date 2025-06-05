import { BaseHit } from "instantsearch.js";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
const API_PORT = process.env.NEXT_PUBLIC_API_PORT;

const typesenseAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "dummy", // As typesense is protected by a proxy, we can use a dummy key
    nodes: [
      {
        host: API_HOST!,
        port: Number(API_PORT!),
        protocol: "http",
        path: "/api/search",
      },
    ],
    cacheSearchResultsForSeconds: 120,
  },
  additionalSearchParameters: {
    query_by: "name,category,brand,best_store",
    sort_by: "best_price:asc",
  },
});

export const searchClient = typesenseAdapter.searchClient;
export const searchIndex = "products/sort/best_price:asc";


export interface Product extends BaseHit {
  objectID: string;
  ean: string;
  name: string;
  brand: string;
  image: string;
  best_price: number;
  best_store: string;
  amount_stores: number;
}
