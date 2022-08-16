import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "slonik";
import { FilterableFields, isFilterableField } from "../../domain/FilterableFields";
import { Transaction } from "../../domain/Transaction";
import { createPool } from "../../utils/createPool";

const createLimitFragment = (limit: number = 10, offset?: number) => {
  if (offset) {
    return sql`LIMIT ${limit} OFFSET ${offset}`;
  }

  return sql`LIMIT ${limit}`;
};

const createOrderByFragment = (
  field: string,
  order: "asc" | "desc" = "asc"
) => {
  // slonik seemingly doesn't not allow you to interpolate ASC or DESC into a query.
  // I'd like to do sql`ORDER BY ${field} ${order}`, but it keeps throwing errors.
  const fragment = sql`ORDER BY ${sql.identifier([field])}`;

  return order === "asc" ? sql`${fragment} ASC` : sql`${fragment} DESC`;
};

const createWhereFragment = (
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    cursor = "1",
    offset = "0",
    limit = "10",
    amount,
    description,
    order = "asc",
    code = "",
  } = req.query;

  const pool = await createPool();

  if (
    Array.isArray(req.query.code) ||
    Array.isArray(req.query.type) ||
    Array.isArray(req.query.amount) ||
    Array.isArray(req.query.description) ||
    Array.isArray(req.query.date) ||
    Array.isArray(order) ||
    Array.isArray(cursor) ||
    Array.isArray(offset) ||
    Array.isArray(limit) ||
    Array.isArray(amount) ||
    Array.isArray(description)
  ) {
    throw new Error("bad request");
  }

  if (order !== "asc" && order !== "desc") {
    throw new Error("bad request");
  }

  const toFilter = Object.keys(req.query)
    .filter<FilterableFields>(isFilterableField)
    .map<[FilterableFields, string]>((field) => {
      const f = req.query[field];

      if (!f) {
        throw new Error("bad request");
      }

      return [field, Array.isArray(f) ? f.join() : f];
    });

  pool.connect(async (conn) => {
    const query = sql<Transaction>`
      SELECT * FROM transactions
      ${createWhereFragment(parseInt(cursor, 10), toFilter)}
      ${createOrderByFragment("id", order)}
      ${createLimitFragment(parseInt(limit, 10), parseInt(offset, 10))}
    `;
    const data = await conn.many(query);

    res.status(200).json({ data });
  });
}
