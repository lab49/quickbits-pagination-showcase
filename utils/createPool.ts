import { createQueryLoggingInterceptor } from "slonik-interceptor-query-logging";
import { createPool as slonikCreatePool } from "slonik";

import { createPerformanceInterceptor, PerfCallback } from "./createPerformanceInterceptor";

const { DATABASE_URL } = process.env;

export const createPool = async (perfCallback?: PerfCallback) => {
  const interceptors = [
    createQueryLoggingInterceptor(),
    createPerformanceInterceptor(perfCallback),
  ];

  return slonikCreatePool(`${DATABASE_URL}`, {
    interceptors,
  });
};
