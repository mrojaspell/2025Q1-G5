import { Autocomplete, createStyles } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import { useHits, InstantSearch, Configure } from "react-instantsearch-hooks";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { searchClient } from "../../api/search";
import { useSearchBox } from "react-instantsearch-hooks-web";

const useStyles = createStyles((theme) => ({
  search: {
    [theme.fn.smallerThan("xs")]: {
      width: 50,
    },
    maxWidth: 500,
    flexGrow: 1,
  },
}));

function AutocompleteSearchBox() {
  const router = useRouter();
  const { hits } = useHits();
  const { query, refine } = useSearchBox();
  const [value, setValue] = useState(query);
  const itemJustSubmitted = useRef(false);

  // Update Typesense query as user types
  useEffect(() => {
    refine(value);
  }, [value, refine]);

  const { classes } = useStyles();

  const suggestions =
    value !== ""
      ? hits.slice(0, 5).map((hit: any) => ({
        value: hit.name,
        group: "Productos",
      }))
      : [];

  return (
    <Autocomplete
      className={classes.search}
      placeholder="Buscar"
      icon={<IconSearch size={16} stroke={1.5} />}
      limit={5}
      data={suggestions}
      transition="fade"
      transitionDuration={200}
      transitionTimingFunction="ease"
      value={value}
      onChange={(value) => setValue(value)}
      onItemSubmit={(item) => {
        itemJustSubmitted.current = true;
        router.push({
          pathname: "/search",
          query: { q: item.value },
        });
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          if (itemJustSubmitted.current || value.trim() === "") {
            itemJustSubmitted.current = false;
            return;
          }

          router.push({
            pathname: "/search",
            query: { q: value.trim() },
          });
        }
      }}
    />
  );
}

export default function AutocompleteWithSearch() {
  return (
    <InstantSearch searchClient={searchClient} indexName="products">
      <Configure hitsPerPage={5} />
      <AutocompleteSearchBox />
    </InstantSearch>
  );
}
