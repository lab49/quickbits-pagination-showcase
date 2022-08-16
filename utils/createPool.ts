import { createQueryLoggingInterceptor } from "slonik-interceptor-query-logging";
import { createPool as slonikCreatePool } from "slonik";

const { DATABASE_URL } = process.env;

const interceptors = [createQueryLoggingInterceptor()];

export const createPool = async () => {
  return await slonikCreatePool(`${DATABASE_URL}`, {
    interceptors,
  });
};
