import { useConnector } from 'react-instantsearch-hooks-web';
import connectRange from 'instantsearch.js/es/connectors/range/connectRange';

import type {
  RangeConnectorParams,
  RangeWidgetDescription,
} from 'instantsearch.js/es/connectors/range/connectRange';

export type UseRangeSliderProps = RangeConnectorParams;

export function useRangeSlider(props?: UseRangeSliderProps) {
  return useConnector<RangeConnectorParams, RangeWidgetDescription>(
    connectRange,
    props
  );
}