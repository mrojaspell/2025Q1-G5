import {
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons";
import capitalize from "lodash.capitalize";
import {
  useClearRefinements,
  useMenu,
  useRefinementList,
  useSortBy,
} from "react-instantsearch-hooks-web";
import { PriceRangeFilter } from "../filters/price-range-filter";

export type SearchFiltersProps = {
  label: string;
  attribute: string;
};

export const SearchFilters = ({
  categoriesFilter = true,
}: {
  categoriesFilter?: boolean;
}) => {

  const {
    options: sortOptions,
    currentRefinement,
    refine: refineSort,
  } = useSortBy({
    items: [
      { value: "products/sort/best_price:asc", label: "Mejor precio" },
      {
        value: "products/sort/amount_stores:desc",
        label: "Mayor disponibilidad",
      },
    ],
  });

  const { items: brands, refine: refineBrands } = useRefinementList({
    attribute: "brand",
    sortBy: ["count"],
  });

  const {
    items: categories,
    refine: refineCategories,
    canRefine,
  } = useMenu({
    attribute: "category",
    sortBy: ["count"],
  });

  const { refine: clearFilters } = useClearRefinements();

  // if (status === "loading") return <p>Loading Filters..</p>;

  return (
    <Stack spacing={"xl"}>
      <Group position="apart">
        <Text weight={500}>Filtros</Text>
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          leftIcon={<IconRefresh size={16} />}
          onClick={clearFilters}
        >
          Limpiar filtros
        </Button>
      </Group>

      <Select
        label="Ordenar por"
        value={currentRefinement}
        onChange={(val) => refineSort(val!)}
        data={sortOptions}
        clearable={false}
      />

      {categoriesFilter && (
        <Card withBorder p={32} radius="md">
          <Stack spacing={"sm"}>
            <Text size={"md"} weight={500} mb={"xl"}>
              Categorías
            </Text>

            <Stack>
              {canRefine &&
                categories.map((category, index) => (
                  <Checkbox
                    key={index}
                    label={
                      <Group spacing={"xs"}>
                        <Text
                          style={{
                            maxWidth: "18ch",
                            maxLines: 1,
                            wordBreak: "break-all",
                          }}
                          lineClamp={1}
                        >
                          {category.label == "congeladosypreparados"
                            ? "Congelados y Preparados"
                            : capitalize(category.label)}
                        </Text>
                        <Badge
                          color="gray"
                          variant="light"
                          size="sm"
                          radius={"sm"}
                        >
                          {category.count}
                        </Badge>
                      </Group>
                    }
                    value={category.value}
                    checked={category.isRefined}
                    onChange={() => refineCategories(category.value)}
                    size={"sm"}
                  />
                ))}
            </Stack>
          </Stack>
        </Card>
      )}
      <Card withBorder p={32} radius="md">
        <Stack spacing={"sm"}>
          <Text size={"md"} weight={500} mb={"xl"}>
            {"Marcas"}
          </Text>

          {brands.map((brand, index) => (
            <Checkbox
              key={index}
              label={
                <Group spacing={"xs"}>
                  <Text>{capitalize(brand.label)}</Text>
                  <Badge color="gray" variant="light" size="sm" radius={"sm"}>
                    {brand.count}
                  </Badge>
                </Group>
              }
              value={brand.value}
              checked={brand.isRefined}
              onChange={() => refineBrands(brand.value)}
              size={"sm"}
            />
          ))}
        </Stack>
      </Card>
      <PriceRangeFilter />
    </Stack>
  );
};
