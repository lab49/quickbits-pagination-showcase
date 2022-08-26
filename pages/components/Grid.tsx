import { useMemo, useCallback, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry, IServerSideDatasource } from "@ag-grid-community/core";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";

import { Transaction } from "../../domain/Transaction";
import { PaginationResponse } from "../../domain/PaginationResponse";
import { RequestPerf } from "../../domain/RequestPerf";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";

ModuleRegistry.register(ServerSideRowModelModule);

const PER_PAGE_COUNT = 25;

const fetchTransactions = async (
  url: URL
): Promise<PaginationResponse & { data: Transaction[] }> => {
  const resp = await fetch(url);

  if (resp.ok) {
    const { data: unsortedData, performance } =
      (await resp.json()) as PaginationResponse;
    const data = unsortedData.slice().sort((a, b) => a.id - b.id);

    return Promise.resolve({
      data,
      performance,
    });
  } else {
    return Promise.reject(`some error`);
  }
};

type AgGridSuccess = Parameters<IServerSideDatasource["getRows"]>[0]["success"];
type AgGridFail = Parameters<IServerSideDatasource["getRows"]>[0]["fail"];

const getRowData = (
  url: URL,
  agGridSuccess: AgGridSuccess,
  agGridFail: AgGridFail,
  onGetRows: OnGetRows
) => {
  fetchTransactions(url)
    .then(({ data: rowData, performance }) => {
      onGetRows(performance);
      agGridSuccess({ rowData });
    })
    .catch((err) => {
      console.log("error fetching data", err);
      agGridFail();
    });
};

const createOffsetDatasource = (onGetRows: OnGetRows) => {
  const offsetDatasource: IServerSideDatasource = {
    getRows: ({ request, success, fail }) => {
      const url = new URL("/api/offset", window.location.origin);
      const { startRow, sortModel } = request;
      const params = new URLSearchParams();

      params.set("limit", `${PER_PAGE_COUNT}`);
      params.set("offset", `${startRow}`);

      if (sortModel.length) {
        const { sort, colId } = sortModel[0];

        params.set("sortBy", colId);
        params.set("sortDir", sort);
      }

      url.search = params.toString();

      getRowData(url, success, fail, onGetRows);
    },
  };

  return offsetDatasource;
};

const createCursorDatasource = (onGetRows: OnGetRows) => {
  let previousHighestCacheBlock: number = 0;

  const datasource: IServerSideDatasource = {
    getRows: ({ request, api, success, fail }) => {
      const url = new URL("/api/cursor", window.location.origin);
      const { sortModel } = request;
      const params = new URLSearchParams();

      params.set("limit", `${PER_PAGE_COUNT}`);

      // Calculate if the user is scrolling up or down. We need to know this
      // information in order to request the next or previous page
      // of data.
      const sorted = Object.keys(api.getCacheBlockState()).sort(
        (a, b) => parseInt(a, 10) - parseInt(b, 10)
      );
      const highestCacheBlock = parseInt(sorted[sorted.length - 1], 10);
      const isScrollingDown = previousHighestCacheBlock < highestCacheBlock;

      // Cache for the next getRows call.
      previousHighestCacheBlock = highestCacheBlock;

      // Find the id of the extant row to use as a cursor, depending on direction.
      const nextIndex = isScrollingDown
        ? api.getLastRenderedRow() - 1
        : api.getFirstRenderedRow() + 1;
      const cursor = api.getDisplayedRowAtIndex(nextIndex)?.data?.id;

      if (cursor) {
        params.set("cursor", cursor);
        params.set("offset", "1");
        params.set("sortDir", isScrollingDown ? "asc" : "desc");
      }

      if (sortModel.length) {
        const { sort } = sortModel[0];

        params.set("sortDir", sort);
      }

      url.search = params.toString();

      getRowData(url, success, fail, onGetRows);
    },
  };

  return datasource;
};

interface Props {
  type?: "cursor";
}

type OnGetRows = (perf: RequestPerf) => void;

const columnDefs = [
  { field: "id", sortable: true, width: 65 },
  { field: "type" },
  { field: "amount" },
  { field: "description" },
  { field: "date" },
];

const defaultColDefs = {
  filter: true,
  resizeable: false,
  width: 150,
}

export const Grid = ({ type }: Props) => {
  const [log, setLog] = useState<RequestPerf[]>([]);
  const onGetRows = useCallback(
    (perf: RequestPerf) => {
      setLog((prevLog) => [...prevLog, perf].slice(-5));
    },
    [setLog]
  );
  const datasource = useMemo(() => {
    return type === "cursor"
      ? createCursorDatasource(onGetRows)
      : createOffsetDatasource(onGetRows);
  }, [type, onGetRows]);
  const hasSortableColumns = type !== "cursor";
  const defaultColDef = useMemo(
    () => ({
      ...defaultColDefs,
      sortable: hasSortableColumns,
    }),
    [hasSortableColumns]
  );

  return (
    <div className="flex">
      <div
        className="ag-theme-balham-dark m-4 grow-0 shrink-0 shadow-lg"
        style={{ height: 400, width: 667 }}
      >
        <AgGridReact<Transaction>
          debug={false}
          getRowId={(row) => `${row.data.id}`}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowModelType="serverSide"
          serverSideDatasource={datasource}
          serverSideInfiniteScroll={true}
          cacheBlockSize={PER_PAGE_COUNT}
          maxBlocksInCache={5}
        />
      </div>

      <div>
        <button onClick={() => setLog([])}>clear</button>
        <div className="font-mono text-green-400 bg-slate-900">
          {log.map((el) => (
            <div className="px-2 py-4 odd:bg-slate-800/50" key={el.requestTime + el.sql}>
              <p className="mb-1 text-xs text-green-600">
                <span className="mr-4"><span className="text-slate-500">Request:</span> {`${el.requestTime.toFixed(2)}ms`}</span>
                <span><span className="text-slate-500">SQL:</span> {`${el.queryTime.toFixed(2)}ms`}</span>
              </p>

              <p className="text-sm">
                {el.sql.replace(
                  /\$[\d]+/g,
                  (match) =>
                    `${el.vals.slice()[parseInt(match.slice(1), 10) - 1]}`
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
