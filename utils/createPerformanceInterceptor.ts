import { Interceptor } from "slonik";
import { PrimitiveValueExpression } from "slonik/dist/src/types";

interface Connections {
  [key: string]: {
    queries: {
      [key: string]: { start: number };
    }
  };
}

export interface Result {
  sql: string;
  queryTime: number;
  vals: readonly PrimitiveValueExpression[];
}

export type PerfCallback = (res: Result) => void;

export const createPerformanceInterceptor = (cb?: PerfCallback): Interceptor => {
  const connections: Connections = {};

  return {
    afterPoolConnection: (context) => {
      connections[context.connectionId] = { queries: {} };

      return null;
    },
    afterQueryExecution: async (context, query) => {
      const { connectionId, queryId } = context;
      const connection = connections[connectionId];

      if (!connection) {
        return null;
      }

      const { start } = connection.queries[queryId];

      if (cb) {
        cb({
          sql: query.sql,
          vals: query.values,
          queryTime: performance.now() - start,
        });
      }

      return null;
    },
    beforePoolConnectionRelease: ({ connectionId }) => {
      if (!connections[connectionId]) {
        return null;
      }

      delete connections[connectionId];

      return null;
    },
    beforeQueryExecution: async (context) => {
      const { connectionId, queryId } = context;
      const connection = connections[connectionId];

      if (!connection) {
        return null;
      }

      const { queries } = connection;

      if (!queries[queryId]) {
        queries[queryId] = { start: performance.now() };
      }

      return null;
    },
  };
};
