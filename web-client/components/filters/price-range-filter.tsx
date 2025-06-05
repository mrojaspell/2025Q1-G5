import {
  Card,
  Group,
  NumberInput,
  RangeSlider,
  Stack,
  Text,
} from "@mantine/core";
import { IconCurrencyDollar } from "@tabler/icons";
import { useState } from "react";
import { useRangeSlider } from "../../hooks/use-range-slider";
import {
  Range,
  RangeBoundaries,
} from "instantsearch.js/es/connectors/range/connectRange";

function convertToValue(
  start: RangeBoundaries,
  range: Range
): [number, number] {
  const domain =
    range.min === 0 && range.max === 0
      ? { min: undefined, max: undefined }
      : range;

  return [
    start[0] === -Infinity ? domain.min! : start[0]!,
    start[1] === Infinity ? domain.max! : start[1]!,
  ];
}

export const PriceRangeFilter = () => {
  const { range, refine, start } = useRangeSlider({
    attribute: "best_price",
  });

  const [value, setValue] = useState<[number, number]>(
    convertToValue(start, range)
  );

  const [prevStart, setPrevStart] = useState(start);

  if (start !== prevStart) {
    setValue(convertToValue(start, range));
    setPrevStart(start);
  }

  const onChange = (values: [number, number]) => {
    refine(values as [number, number]);
  };

  const onUpdate = (values: [number, number]) => {
    setValue(values as [number, number]);
  };

  return (
    <Card withBorder p={32} radius="md">
      <Stack spacing={"xl"}>
        <Text size={"md"} weight={500}>
          Precio
        </Text>
        <RangeSlider
          min={range.min!}
          max={range.max!}
          value={value}
          step={1}
          onChange={onUpdate}
          onChangeEnd={onChange}
          showLabelOnHover={false}
          label={null}
        />
        {
          <Group grow>
            <NumberInput
              value={value[0]}
              label="Desde"
              hideControls
              max={value[1]}
              icon={<IconCurrencyDollar size={18} />}
              size="sm"
              onBlur={(event) => {
                const newValue: [number, number] = [
                  Number(event.target.value),
                  value[1],
                ];
                onUpdate(newValue);
                onChange(newValue);
              }}
            />
            <NumberInput
              value={value[1]}
              label="Hasta"
              hideControls
              min={value[0]}
              size="sm"
              icon={<IconCurrencyDollar size={18} />}
              onBlur={(event) => {
                const newValue: [number, number] = [
                  value[0],
                  Number(event.target.value),
                ];
                onUpdate(newValue);
                onChange(newValue);
              }}
            />
          </Group>
        }
      </Stack>
    </Card>
  );
};
