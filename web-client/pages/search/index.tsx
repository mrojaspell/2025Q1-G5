import { Box, Container, Space, useMantineTheme } from "@mantine/core";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Configure, InstantSearch } from "react-instantsearch-hooks-web";
import { SearchResults } from "../../components/search/search-results";
import { Layout } from "../../components/layout";
import { searchClient, searchIndex } from "../../api/search";

const Search: NextPage = () => {
  const theme = useMantineTheme();
  const router = useRouter();
  const q = router.query.q as string;

  return (
    <Layout title={`Resultados de "${q}"`}>
      <Box
        style={{ minHeight: "100vh", backgroundColor: theme.colors.gray[0] }}
        pb={64}
      >
        <Space h={"xl"} />

        <Container size="xl">
          <Space h={32} />

          <InstantSearch
            key={q}
            searchClient={searchClient}
            indexName={searchIndex}
            initialUiState={{
              [searchIndex]: {
                query: q || "",
              },
            }}
          >
            <Configure hitsPerPage={15} typoTolerance={"min"} />
            <SearchResults query={q} title={`Resultados de "${q}"`} />
          </InstantSearch>
        </Container>
      </Box>
    </Layout>
  );
};

export default Search;
