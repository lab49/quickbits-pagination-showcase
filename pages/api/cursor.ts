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
import { PaginationResponse } from "../../domain/PaginationResponse";
import { Result } from "../../utils/createPerformanceInterceptor";

const QuerySchema = PaginationSchema.merge(CursorSchema)
  .merge(FilterableSchema)
  .merge(SortableSchema.pick({ sortDir: true }));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginationResponse | string>
) {
  try {
    // Gather up details from the input.
    const start = performance.now();
    const query = QuerySchema.parse(req.query);
    const filterable = getFilterableFieldsFromQuery(query);
    const { cursor, limit, offset, sortDir } = query;

    // TODO (brianmcallister) - Not sure how else to structure this
    // for the time being to make the indirection less confusing.
    let details: Result;

    // Make the database queries.
    const pool = await createPool((perf) => (details = perf));
    const data = await pool.connect(async (conn) =>
      conn.many(sql<Transaction>`
        SELECT * FROM transactions
        ${createWhereFragment({
          filterable,
          cursor: parseInt(`${cursor}`, 10),
          sortDir,
        })}
        ${createOrderByFragment(DEFAULT_SORT_KEY, sortDir)}
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
