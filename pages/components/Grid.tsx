import { useMemo } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry, IServerSideDatasource } from "@ag-grid-community/core";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";

import { Transaction } from "../../domain/Transaction";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.register(ServerSideRowModelModule);

const PER_PAGE_COUNT = 15;

const fetchTransactions = async (url: URL): Promise<Transaction[]> => {
  const resp = await fetch(url);
  const { data, errors } = await resp.json();
  const txn = data as Transaction[];
  const sorted = txn.sort((a, b) => a.id - b.id);

  if (resp.ok) {
    return Promise.resolve(sorted);
  } else {
    return Promise.reject(`some error: ${errors}`);
  }
};

const createOffsetDatasource = () => {
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

      fetchTransactions(url)
        .then((rowData) => {
          success({ rowData });
        })
        .catch((err) => {
          console.log("error fetching data", err);
          fail();
        });
    },
  };

  return offsetDatasource;
};

const createCursorDatasource = () => {
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

      fetchTransactions(url)
        .then((rowData) => {
          success({ rowData });
        })
        .catch((err) => {
          console.log("error fetching data", err);
          fail();
        });
    },
  };

  return datasource;
};

interface Props {
  type?: "cursor";
}

const columnDefs = [
  { field: "id", sortable: true },
  { field: "type" },
  { field: "amount" },
  { field: "description" },
  { field: "date" },
];

export const Grid = ({ type }: Props) => {
  const hasSortableColumns = type !== "cursor";
  const datasource =
    type === "cursor" ? createCursorDatasource() : createOffsetDatasource();
  const defaultColDef = useMemo(
    () => ({
      sortable: hasSortableColumns,
      filter: true,
    }),
    [hasSortableColumns]
  );

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
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
  );
};
