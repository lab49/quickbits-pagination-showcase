import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "slonik";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

import { Transaction } from "../../domain/Transaction";
import { createLimitFragment } from "../../utils/createLimitFragment";
import { createOrderByFragment } from "../../utils/createOrderByFragment";
import { createPool } from "../../utils/createPool";
import { createWhereFragment } from "../../utils/createWhereFragment";
import { PaginationSchema } from "../../domain/PaginationSchema";
import { CursorSchema } from "../../domain/CursorSchema";
import { FilterableSchema } from "../../domain/FilterableSchema";
import { getFilterableFieldsFromQuery } from "../../utils/getFilterableFieldsFromQuery";
import { DEFAULT_SORT_KEY, SortableSchema } from "../../domain/SortableSchema";

const QuerySchema = PaginationSchema.merge(CursorSchema)
  .merge(FilterableSchema)
  .merge(SortableSchema.pick({ sortDir: true }));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const query = QuerySchema.parse(req.query);
    const { cursor, limit, offset, sortDir } = query;
    const pool = await createPool();
    const filterable = getFilterableFieldsFromQuery(query);

    pool.connect(async (conn) => {
      const query = sql<Transaction>`
        SELECT * FROM transactions
        ${createWhereFragment({ filterable, cursor: parseInt(`${cursor}`, 10), sortDir })}
        ${createOrderByFragment(DEFAULT_SORT_KEY, sortDir)}
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
