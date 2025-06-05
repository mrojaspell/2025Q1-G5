import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { Box, Container, Space, useMantineTheme } from "@mantine/core";
import { Layout } from "../../components/layout";
import { SearchResults } from "../../components/search/search-results";
import capitalize from "lodash.capitalize";
import { categoriesData } from "../../components/category-card";
import { searchClient, searchIndex } from "../../api/search";
import { Configure, InstantSearch } from "react-instantsearch-hooks-web";

type Props = {
  category: string;
};

const CategoryPage: NextPage<Props> = ({ category }) => {
  const theme = useMantineTheme();

  return (
    <Layout title={capitalize(category)}>
      <Box
        style={{ minHeight: "100vh", backgroundColor: theme.colors.gray[0] }}
        pb={64}
      >
        <Space h="xl" />
        <Container size="xl">
          <Space h={32} />

          <InstantSearch
            key={category}
            searchClient={searchClient}
            indexName={searchIndex}
            initialUiState={{
              unimart_test: {
                query: "",
                menu: {
                  category: category,
                },
              },
            }}
          >
            <Configure hitsPerPage={15} typoTolerance={"min"} />

            <SearchResults
              query={category}
              title={capitalize(category)}
              showCategoriesFilter={false}
            />
          </InstantSearch>
        </Container>
      </Box>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = categoriesData.map((c) => ({
    params: {
      category: c.category, // ⬅️ No slug conversion
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const rawCategory = params?.category as string;

  const matched = categoriesData.find((c) => c.category === rawCategory);

  if (!matched) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      category: matched.category,
    },
  };
};

export default CategoryPage;
