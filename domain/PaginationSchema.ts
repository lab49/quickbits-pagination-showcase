import { z } from "zod";

export const PaginationSchema = z.strictObject({
  offset: z.string().optional().default("0"),
  limit: z.string().optional().default("10"),
  order: z.enum(["asc", "desc"]).optional(),
});
