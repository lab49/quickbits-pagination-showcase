import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "slonik";

import { createLimitFragment } from "../../utils/createLimitFragment";
import { createOrderByFragment } from "../../utils/createOrderByFragment";
import { createPool } from "../../utils/createPool";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.time("request");

  const {
    offset = "0",
    limit = "10",
    amount,
    description,
    order = "asc",
  } = req.query;
  const pool = await createPool();

  if (
    Array.isArray(order) ||
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

  pool.connect(async (conn) => {
    const query = sql`
      SELECT
        *
      FROM
        transactions
      ${createOrderByFragment("id", order)}
      ${createLimitFragment(parseInt(limit, 10), parseInt(offset, 10))}
    `;
    const data = await conn.many(query);

    res.status(200).json({ data });

    console.timeEnd("request");
  });
}
