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
import { PaginationResponse } from "../../domain/PaginationResponse";
import { Result } from "../../utils/createPerformanceInterceptor";

const QuerySchema =
  PaginationSchema.merge(FilterableSchema).merge(SortableSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginationResponse | string>
) {
  try {
    // Gather up details from the input.
    const start = performance.now();
    const query = QuerySchema.parse(req.query);
    const filterable = getFilterableFieldsFromQuery(query);
    const { limit, offset, sortBy, sortDir } = query;

    // TODO (brianmcallister) - Not sure how else to structure this
    // for the time being to make the indirection less confusing.
    let details: Result;

    // Make the database queries.
    const pool = await createPool((perf) => (details = perf));
    const data = await pool.connect(async (conn) =>
      conn.many(sql<Transaction>`
        SELECT * FROM transactions
        ${createWhereFragment({ filterable })}
        ${createOrderByFragment(sortBy, sortDir)}
        ${createLimitFragment(parseInt(limit, 10), parseInt(offset, 10))}
      `)
    );

    // Respond to the request.
    res.status(StatusCodes.OK).json({
      data,
      performance: {
        requestTime: performance.now() - start,
        // @ts-expect-error
        ...details,
      },
    });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send(getReasonPhrase(StatusCodes.BAD_REQUEST));
  }
}
