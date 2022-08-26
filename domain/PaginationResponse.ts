import { Result } from "../utils/createPool";
import { Transaction } from "./Transaction";

export interface PaginationResponse {
  data: readonly Transaction[];
  performance: Result & {
    requestTime: number;
  };
}
