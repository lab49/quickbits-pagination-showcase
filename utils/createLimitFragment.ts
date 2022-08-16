import { sql } from "slonik";

export const createLimitFragment = (limit: number = 10, offset?: number) => {
  if (offset) {
    return sql`LIMIT ${limit} OFFSET ${offset}`;
  }

  return sql`LIMIT ${limit}`;
};
