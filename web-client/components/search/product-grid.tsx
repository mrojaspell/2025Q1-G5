import { SimpleGrid } from "@mantine/core";
import {
  HitsProps,
  useHits,
} from "react-instantsearch-hooks-web";
import { Product } from "../../api/search";

import { ProductCard } from "../product-card";

export type ProductGridProps = {
  hitProps?: HitsProps<Product>;
  cols?: number
};

export const ProductGrid = ({ hitProps, cols }: ProductGridProps) => {
  const { hits } = useHits<Product>(hitProps);

  return (
    <>
      <SimpleGrid
        cols={cols}
        spacing={"xl"}
        breakpoints={[
          { maxWidth: 1300, cols: 3, spacing: "sm" },
          { maxWidth: 1000, cols: 2, spacing: "xs" },
          { maxWidth: 755, cols: 2, spacing: "xs" },
          { maxWidth: 600, cols: 1, spacing: "xs" },
        ]}
      >
        {hits.map((product) => (
          <ProductCard
            key={product.ean}
            price={product.best_price}
            market={product.best_store}
            name={product.name}
            desc={product.brand}
            image={product.image}
            offer={""}
            link={""}
            prices={[]}
            entireItem={product}
            storeCount={product.amount_stores}
            ean={product.ean}
          />
        ))}
      </SimpleGrid>
    </>
  );
};
