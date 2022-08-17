import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "slonik";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

import { createLimitFragment } from "../../utils/createLimitFragment";
import { createOrderByFragment } from "../../utils/createOrderByFragment";
import { createPool } from "../../utils/createPool";
import { FilterableSchema } from "../../domain/FilterableSchema";
import { PaginationSchema } from "../../domain/PaginationSchema";
import { Transaction } from "../../domain/Transaction";
import { getFilterableFieldsFromQuery } from "../../utils/getFilterableFieldsFromQuery";
import { createWhereFragment } from "../../utils/createWhereFragment";
import { SortableSchema } from "../../domain/SortableSchema";

const QuerySchema = PaginationSchema.merge(FilterableSchema).merge(SortableSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const query = QuerySchema.parse(req.query);
    const { limit, offset, sortBy, sortDir } = query;
    const pool = await createPool();
    const filterable = getFilterableFieldsFromQuery(query);

    pool.connect(async (conn) => {
      const query = sql<Transaction>`
        SELECT * FROM transactions
        ${createWhereFragment({ filterable })}
        ${createOrderByFragment(sortBy, sortDir)}
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
