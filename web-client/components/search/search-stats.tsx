import { Stack, Text } from "@mantine/core";

export const SearchStats = ({ stats, title }: any) => {
  return (
    <Stack spacing={"sm"}>
      <Text size={"xl"}>{title}</Text>
      <Text size={"sm"}>{stats.nbHits} productos encontrados</Text>
    </Stack>
  );
};
