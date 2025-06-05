import { Center, Divider, Grid, Stack } from "@mantine/core";
import { ProductGrid } from "./product-grid";
import { useEffect, useState } from "react";
import { SearchLoader } from "../loaders/search-loader";
import { SearchFilters } from "./search-filters";
import { SearchPagination } from "./search-pagination";
import { SearchStats } from "./search-stats";
import { useInstantSearch, useSearchBox } from "react-instantsearch-hooks-web";
import { useStats } from "../../hooks/use-stats";

export type SearchResultsProps = {
  title: string;
  query?: string;
  showCategoriesFilter?: boolean;
};

export const SearchResults = ({
  query,
  title,
  showCategoriesFilter = true,
}: SearchResultsProps) => {

  const { results } = useInstantSearch();
  const stats = useStats();

  const [isLoading, setLoading] = useState(true);


  const { refine } = useSearchBox();

  useEffect(() => {
    if (query) {
      refine(query); // forces update to Typesense query
    }
  }, [query, refine]);

  useEffect(() => {
    if (results.nbHits > 0) setLoading(false);
  }, [results.nbHits]);

  if (isLoading) return <SearchLoader />;

  return (
    <Grid columns={4} gutter={32}>
      <Grid.Col span={1}>
        <Stack spacing={"xl"}>
          <SearchStats stats={stats} title={title} />
          <Divider />
          <SearchFilters categoriesFilter={showCategoriesFilter} />
        </Stack>
      </Grid.Col>

      <Grid.Col span={3}>
        <>
          <ProductGrid cols={3} />
          <Center py={64}>
            <SearchPagination />
          </Center>
        </>
      </Grid.Col>
    </Grid>

  );
};
