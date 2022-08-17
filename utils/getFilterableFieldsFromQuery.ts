import { NextApiRequest } from "next";
import {
  FilterableFields,
  isFilterableField,
} from "../domain/FilterableFields";

export const getFilterableFieldsFromQuery = (query: NextApiRequest['query']) =>
  Object.entries(query).filter<[FilterableFields, string]>(
    (val): val is [FilterableFields, string] => isFilterableField(val[0])
  );
