import { sql } from "slonik";

export const createOrderByFragment = (
  field: string,
  order: "asc" | "desc" = "asc"
) => {
  // slonik seemingly doesn't not allow you to interpolate ASC or DESC into a query.
  // I'd like to do sql`ORDER BY ${field} ${order}`, but it keeps throwing errors.
  const fragment = sql`ORDER BY ${sql.identifier([field])}`;

  return order === "asc" ? sql`${fragment} ASC` : sql`${fragment} DESC`;
};
