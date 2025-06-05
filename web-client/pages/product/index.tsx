import {
  Box,
  Space,
  createStyles,
  Table,
  useMantineTheme,
  ScrollArea,
} from "@mantine/core";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ProductDetail } from "../../components/product-detail";
import { Layout } from "../../components/layout";
import { fetchProductByEAN, ProductDetails } from "../../api/products";


const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    top: 0,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease",

    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
        }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

export function capitalizeFirstLetter(string: String) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var formatter = new Intl.NumberFormat("es-ar", {
  style: "currency",
  currency: "ARS",
});

interface TableScrollAreaProps {
  data: ProductDetails;
}

export function TableScrollArea({ data }: TableScrollAreaProps ) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  let rows;
  if (data !== undefined) {
    const dataStores = data.prices;
    rows = dataStores.map((row) => (
      <tr key={row.store}>
        <td>{formatter.format(row.price)}</td>
        <td
          onClick={() => window.open(row.link, "_blank")}
          style={{
            cursor: "pointer",
            color: "#13AE85", // Color de unimart
            textDecoration: "underline",
            fontWeight: 500,
          }}
        >
          {capitalizeFirstLetter(row.store)}
        </td>
      </tr>
    ));
  }

  return (
    <ScrollArea
      sx={{ height: 300 }}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      {data !== undefined && (
        <Table sx={{ minWidth: 500 }}>
          <thead
            className={cx(classes.header, { [classes.scrolled]: scrolled })}
          >
            <tr>
              <th>Precio</th>
              <th>Supermercado</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}
    </ScrollArea>
  );
}

const Product: NextPage = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const ean = router.query.ean as string;

  const theme = useMantineTheme();
  const [data, setData] = useState<ProductDetails | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ean) {
      setLoading(true);
      fetchProductByEAN(ean).then((response) => {
        setData(response);
      });
      setLoading(false);
    }
  }, [ean]);

  return (
    <Layout title={name}>
      <Box
        style={{ minHeight: "100vh", backgroundColor: theme.colors.gray[0] }}
        pb={64}
      >
        <Space h={10} />
        {!loading && !!data && <ProductDetail ean={ean} data={data} />}
        <Space h={10} />
      </Box>
    </Layout>
  );
};

export default Product;
