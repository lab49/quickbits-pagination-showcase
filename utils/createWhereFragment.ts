import { sql } from "slonik";

import { FilterableFields } from "../domain/FilterableFields";
import { Transaction } from "../domain/Transaction";

interface Args {
  filterable?: [FilterableFields, string][];
  cursor?: Transaction["id"];
}

export const createWhereFragment = ({ filterable, cursor }: Args) => {
  if ((!filterable || !filterable.length) && !cursor) {
    return sql``;
  }

  const fragments = [];

  if (cursor) {
    const subQuery = sql<Transaction>`SELECT id FROM transactions WHERE id = ${cursor}`;

    fragments.push(sql`id >= (${subQuery})`);
  }

  if (filterable) {
    filterable.forEach((field) => {
      const [key, value] = field;

      fragments.push(sql`${sql.identifier([key])} LIKE ${`%${value}%`}`);
    });
  }

  return sql`WHERE ${sql.join(fragments, sql` AND `)}`;
};
