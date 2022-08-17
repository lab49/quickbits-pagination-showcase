import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "slonik";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

import {
  FilterableFields,
  isFilterableField,
} from "../../domain/FilterableFields";
import { Transaction } from "../../domain/Transaction";
import { createLimitFragment } from "../../utils/createLimitFragment";
import { createOrderByFragment } from "../../utils/createOrderByFragment";
import { createPool } from "../../utils/createPool";
import { createWhereFragment } from "../../utils/createWhereFragment";
import { PaginationSchema } from "../../domain/PaginationSchema";
import { CursorSchema } from "../../domain/CursorSchema";
import { FilterableSchema } from "../../domain/FilterableSchema";

const QuerySchema =
  PaginationSchema.merge(CursorSchema).merge(FilterableSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const query = QuerySchema.parse(req.query);
    const { cursor, order, limit, offset } = query;
    const pool = await createPool();
    const toFilter = Object.entries(query).filter<[FilterableFields, string]>(
      (val): val is [FilterableFields, string] => isFilterableField(val[0])
    );

    pool.connect(async (conn) => {
      const query = sql<Transaction>`
        SELECT * FROM transactions
        ${createWhereFragment(parseInt(cursor, 10), toFilter)}
        ${createOrderByFragment("id", order)}
        ${createLimitFragment(parseInt(limit, 10), parseInt(offset, 10))}
      `;
      const data = await conn.many(query);

      res.status(StatusCodes.OK).json({ data });
    });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send(getReasonPhrase(StatusCodes.BAD_REQUEST));
  }
}
