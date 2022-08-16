export const FilterableFields = {
  code: "code",
  type: "type",
  amount: "amount",
  description: "description",
  date: "date",
} as const;

const FilterableFieldsKeys = Object.keys(FilterableFields);

export type FilterableFields = typeof FilterableFields[keyof typeof FilterableFields];

export const isFilterableField = (field: string): field is FilterableFields => {
  return FilterableFieldsKeys.includes(field);
};
