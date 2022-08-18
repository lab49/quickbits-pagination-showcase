import { useMemo, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry, IServerSideDatasource } from "@ag-grid-community/core";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";

import { Transaction } from "../../domain/Transaction";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.register(ServerSideRowModelModule);

const PER_PAGE_COUNT = 50;

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

    fetch(url)
      .then((resp) => resp.json())
      .then((resp) => {
        success({ rowData: resp.data });
      })
      .catch((err) => {
        console.log("error fetching data", err);
        fail();
      });
  },
};

const cursorDatasource: IServerSideDatasource = {
  getRows: ({ request, api, success, fail }) => {
    const url = new URL("/api/cursor", window.location.origin);
    const { sortModel } = request;
    const params = new URLSearchParams();
    // TODO (brianmcallister) - This is incorrect. AG Grid gets confused because
    // when we run this line of code, we don't know if we're scrolling up or down.
    // Which means we don't know what the _next_ page of data to actually
    // get would be (i.e. if we're scrolling up we want to get the previous page
    // and if we're scrolling down we want the next page).
    const cursor = api.getDisplayedRowAtIndex(api.getLastDisplayedRow() - 1)
      ?.data?.id;

    if (cursor) {
      params.set("cursor", cursor);
    }

    params.set("limit", `${PER_PAGE_COUNT}`);

    if (sortModel.length) {
      const { sort } = sortModel[0];

      params.set("sortDir", sort);
    }

    url.search = params.toString();

    fetch(url)
      .then((resp) => resp.json())
      .then((resp) => {
        success({ rowData: resp.data });
      })
      .catch((err) => {
        console.log("error fetching data", err);
        fail();
      });
  },
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
  const datasource = type === "cursor" ? cursorDatasource : offsetDatasource;
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
        debug={true}
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
