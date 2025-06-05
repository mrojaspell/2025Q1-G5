import {
  Grid,
  SimpleGrid,
  Skeleton,
  Space,
  Stack,
} from "@mantine/core";
import type { NextPage } from "next";
import { ProductCard } from "../../components/product-card";

export const SearchLoader: NextPage = () => {
  const loading = true;

  return (
    <Grid columns={4} gutter={64}>
      <Grid.Col span={1}>
        <Skeleton height={16} radius="md" />
        <Space h="md" />
        <Skeleton height={16} width={"50%"} radius="md" />
        <Space h={32} />
        <Skeleton height={"100%"} radius="md" visible={loading} />
      </Grid.Col>

      <Grid.Col span={3}>
        <Stack>
          <SimpleGrid
            cols={3}
            spacing={"xl"}
            breakpoints={[
              { maxWidth: 1300, cols: 3, spacing: "sm" },
              { maxWidth: 1000, cols: 2, spacing: "xs" },
              { maxWidth: 755, cols: 2, spacing: "xs" },
              { maxWidth: 600, cols: 1, spacing: "xs" },
            ]}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Skeleton visible={loading} key={n} radius="md">
                <ProductCard
                  price={0}
                  name={""}
                  desc={""}
                  offer={""}
                  link={""}
                  market={""}
                  prices={[]}
                  entireItem={undefined}
                  storeCount={0}
                  ean={""}
                />
              </Skeleton>
            ))}
          </SimpleGrid>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
