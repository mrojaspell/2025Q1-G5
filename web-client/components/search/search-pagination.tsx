import { Pagination } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { usePagination } from "react-instantsearch-hooks-web";

export const SearchPagination = () => {
  const { currentRefinement, nbPages, refine, canRefine, nbHits } =
    usePagination();
  const [, scrollTo] = useWindowScroll();

  const onPageSelect = (page: number) => {
    refine(page - 1);
    scrollTo({ y: 0 });
  };

  return (
    <>
      {nbHits > 0 && (
        <Pagination
          page={currentRefinement + 1}
          onChange={onPageSelect}
          total={nbPages}
          disabled={!canRefine}
        />
      )}
    </>
  );
};
