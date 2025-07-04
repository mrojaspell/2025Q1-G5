import { useConnector } from "react-instantsearch-hooks-web";
import connectStats from "instantsearch.js/es/connectors/stats/connectStats";

import type {
  StatsConnectorParams,
  StatsWidgetDescription,
} from "instantsearch.js/es/connectors/stats/connectStats";

export type UseStatsProps = StatsConnectorParams;

export function useStats(props?: UseStatsProps) {
  return useConnector<StatsConnectorParams, StatsWidgetDescription>(
    connectStats,
    props
  );
}
