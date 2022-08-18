import { sql } from "slonik";

import { FilterableFields } from "../domain/FilterableFields";
import { Transaction } from "../domain/Transaction";

interface Args {
  filterable?: [FilterableFields, string][];
  cursor?: Transaction["id"];
  sortDir?: 'asc' | 'desc';
}

export const createWhereFragment = ({ filterable, cursor, sortDir }: Args) => {
  if ((!filterable || !filterable.length) && !cursor) {
    return sql``;
  }

  const fragments = [];

  if (cursor) {
    const subQuery = sql<Transaction>`SELECT id FROM transactions WHERE id = ${cursor}`;

    if (sortDir === 'asc') {
      fragments.push(sql`id >= (${subQuery})`);
    } else if (sortDir === 'desc') {
      fragments.push(sql`id <= (${subQuery} ORDER BY id ASC)`);
    }
  }

  if (filterable) {
    filterable.forEach((field) => {
      const [key, value] = field;

      fragments.push(sql`${sql.identifier([key])} LIKE ${`%${value}%`}`);
    });
  }

  return sql`WHERE ${sql.join(fragments, sql` AND `)}`;
};
