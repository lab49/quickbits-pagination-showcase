import { RequestPerf } from "./RequestPerf";
import { Transaction } from "./Transaction";

export interface PaginationResponse {
  data: readonly Transaction[];
  performance: RequestPerf;
}
