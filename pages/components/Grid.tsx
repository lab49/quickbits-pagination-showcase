import { useMemo, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry, IServerSideDatasource } from "@ag-grid-community/core";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";

import { Transaction } from "../../domain/Transaction";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.register(ServerSideRowModelModule);

const PER_PAGE_COUNT = 50;

const datasource: IServerSideDatasource = {
  // called by the grid when more rows are required
  getRows: ({ request, success, fail }) => {
    const url = new URL('/api/offset', window.location.origin);
    const { startRow, sortModel } = request;
    const params = new URLSearchParams();

    params.set('limit', `${PER_PAGE_COUNT}`);
    params.set('offset', `${startRow}`);

    if (sortModel.length) {
      const { sort, colId } = sortModel[0];

      params.set('sortBy', colId);
      params.set('sortDir', sort);
    }

    url.search = params.toString();

    fetch(url)
      .then((resp) => resp.json())
      .then((resp) => {
        success({ rowData: resp.data });
      })
      .catch((err) => {
        console.log('error fetching data', err);
        fail();
      })
  },
};

export const Grid = () => {
  const [rowData] = useState();

  const [columnDefs] = useState([
    { field: "id", filter: true },
    { field: "type", filter: true },
    { field: "amount", filter: true },
    { field: "description", filter: true },
    { field: "date", filter: true },
  ]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
    }),
    []
  );

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
      <AgGridReact<Transaction>
        rowData={rowData}
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
