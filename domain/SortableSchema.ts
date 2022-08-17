import { z } from "zod";

import { OffsetFilterableEnum } from "./FilterableSchema";

export const DEFAULT_SORT_KEY = "id";

export const SortableSchema = z.strictObject({
  sortBy: OffsetFilterableEnum.optional().default(DEFAULT_SORT_KEY),
  sortDir: z.enum(['asc', 'desc']).optional(),
});
