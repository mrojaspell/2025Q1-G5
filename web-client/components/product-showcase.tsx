import { Configure, InstantSearch } from "react-instantsearch-hooks-web";
import { ProductGrid } from "./search/product-grid";
import { Anchor, Group, Space, Text } from "@mantine/core";
import { searchClient, searchIndex } from "../api/search";

export const ProductShowcase = ({
  query,
  cols,
}: {
  query: string;
  cols: number;
}) => {
  return (
    <>
      <Group position="apart">
        <Text size={"xl"} weight={700}>
          Ofertas del día
        </Text>
        <Anchor size="md">Ver todas</Anchor>
      </Group>

      <Space h={"xl"} />
      <InstantSearch
        key={query}
        searchClient={searchClient}
        indexName={searchIndex}
        initialUiState={{
          [searchIndex]: {
            query: query || "",
          },
        }}
      >
        <Configure hitsPerPage={8} />
        <ProductGrid cols={cols} />
      </InstantSearch>
    </>
  );
};
