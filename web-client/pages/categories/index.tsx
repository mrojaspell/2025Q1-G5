import { Container, Space, Text } from "@mantine/core";
import type { NextPage } from "next";
import { ArticlesCardsGrid } from "../../components/category-card";
import { Layout } from "../../components/layout";

const Categories: NextPage = () => {
  return (
    <Layout title="Categorías">
      <Container my="md" size={"xl"} pt={32}>
        <Text size={32}>Categorías</Text>
        <Space h={32} />
        <ArticlesCardsGrid />
        <Space h={32} />
      </Container>
    </Layout>
  );
};

export default Categories;
