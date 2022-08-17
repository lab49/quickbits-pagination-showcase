import { z } from "zod";

export const OffsetFilterableEnum = z.enum([
  "id",
  "code",
  "type",
  "amount",
  "description",
  "date",
]);

export const FilterableSchema = z.strictObject({
  code: z.string().optional(),
  type: z.string().optional(),
  amount: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});
