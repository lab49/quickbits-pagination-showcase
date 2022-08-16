import { sql } from "slonik";

import { FilterableFields } from "../domain/FilterableFields";
import { Transaction } from "../domain/Transaction";

export const createWhereFragment = (
  cursor: Transaction["id"],
  filterable: [FilterableFields, string][]
) => {
  const fragments = [];

  if (cursor) {
    const subQuery = sql<Transaction>`SELECT id FROM transactions WHERE id = ${cursor}`;

    fragments.push(sql`id >= (${subQuery})`);
  }

  filterable.forEach((field) => {
    const [key, value] = field;

    fragments.push(sql`${sql.identifier([key])} LIKE ${`%${value}%`}`);
  });

  return sql`WHERE ${sql.join(fragments, sql` AND `)}`;
};
