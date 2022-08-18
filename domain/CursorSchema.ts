import { z } from "zod";

export const CursorSchema = z.strictObject({
  cursor: z.string().optional(),
});
