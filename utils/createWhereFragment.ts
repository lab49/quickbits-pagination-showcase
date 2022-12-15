import { constants } from "buffer";
import { sql } from "slonik";

import { FilterableFields } from "../domain/FilterableFields";
import { Transaction } from "../domain/Transaction";

interface Args {
  filterable?: any;
  cursor?: Transaction["id"];
  sortDir?: 'asc' | 'desc';
}

export const createWhereFragment = ({ filterable, cursor, sortDir }: Args)=>{
  
  if ((!filterable || Object.keys(filterable).length==0) && !cursor) {
    return sql``;
  }

  var whereParts: any[] = [];
  var filterModel = filterable;

  if (cursor) {
    const subQuery = sql<Transaction>`SELECT id FROM transactions WHERE id = ${cursor}`;

    if (sortDir === 'asc') {
      whereParts.push(sql`id >= (${subQuery})`);
    } else if (sortDir === 'desc') {
      whereParts.push(sql`id <= (${subQuery} ORDER BY id ASC)`);
    }
  }


  if (filterModel) {
    Object.keys(filterModel).forEach(function (key) {
      var item = filterModel[key];

      switch (item.filterType) {
        case 'text':
          whereParts.push(createFilterSql(textFilterMapper, key, item));
          break;
        case 'number':
          whereParts.push(createFilterSql(numberFilterMapper, key, item));
          break;
        default:
          console.log('unknown filter type: ' + item.filterType);
          break;
      }
    });
  }

  if (whereParts.length > 0) {
    return sql`WHERE ${sql.join(whereParts, sql` AND `)}`;
  }

  return sql``;
}

const textFilterMapper = (key: any, item: any)=>{
  switch (item.type) {
    case 'equals':
      return key + " = '" + item.filter + "'";
    case 'notEqual':
      return key + "' != '" + item.filter + "'";
    case 'contains':
      return key + " LIKE '%" + item.filter + "%'";
    case 'notContains':
      return key + " NOT LIKE '%" + item.filter + "%'";
    case 'startsWith':
      return key + " LIKE '" + item.filter + "%'";
    case 'endsWith':
      return key + " LIKE '%" + item.filter + "'";
    default:
      console.log('unknown text filter type: ' + item.type);
  }
}

const numberFilterMapper = (key: any, item: any)=>{
  switch (item.type) {
    case 'equals':
      return key + ' = ' + item.filter;
    case 'notEqual':
      return key + ' != ' + item.filter;
    case 'greaterThan':
      return key + ' > ' + item.filter;
    case 'greaterThanOrEqual':
      return key + ' >= ' + item.filter;
    case 'lessThan':
      return key + ' < ' + item.filter;
    case 'lessThanOrEqual':
      return key + ' <= ' + item.filter;
    case 'inRange':
      return (
        '(' +
        key +
        ' >= ' +
        item.filter +
        ' and ' +
        key +
        ' <= ' +
        item.filterTo +
        ')'
      );
    default:
      console.log('unknown number filter type: ' + item.type);
  }
}

function createFilterSql(mapper: any, key: any, item: any) {
  if (item.operator) {
    var condition1 = mapper(key, item.condition1);
    var condition2 = mapper(key, item.condition2);

    return '(' + condition1 + ' ' + item.operator + ' ' + condition2 + ')';
  }

  return mapper(key, item);
}