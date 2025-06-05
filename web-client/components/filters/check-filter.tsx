import { Checkbox, Card, Text, Group } from "@mantine/core";

interface CheckFilterProps {
  label: string;
  facet: string;
  items: Record<string, number> | undefined;
  value: string[];
  onChange: (value: string[]) => void;
}

export const CheckFilter = ({
  label,
  facet,
  items,
  value,
  onChange,
}: CheckFilterProps) => {
  return (
    <Card withBorder p={32} radius="md">
      <Checkbox.Group
        defaultValue={[]}
        orientation="vertical"
        label={<Text size={"xl"}>{label}</Text>}
        offset="lg"
        size="sm"
        value={value}
        onChange={onChange}
      >
        {items !== undefined &&
          Object.keys(items).map((label, index) => (
            <Group key={index}>
              <Checkbox label={label} value={`${facet}:${label}`} size="sm" />
              <Text color="dimmed" size="xs">
                {items[label]}
              </Text>
            </Group>
          ))}
      </Checkbox.Group>
    </Card>
  );
};
