import { Transaction } from "./Transaction";

export interface PaginationResponse {
  data: readonly Transaction[];
  performance: {
    requestTime: number;
  };
}
