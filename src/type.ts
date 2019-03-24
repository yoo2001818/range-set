export type CompareExpression<T> = {
  type: '<' | '>',
  value: T,
  equal: boolean,
  excludes?: T[],
};
export type RangeExpression<T> = {
  type: 'range',
  min: T,
  max: T,
  minEqual: boolean,
  maxEqual: boolean,
  excludes?: T[],
};
export type EqExpression<T> = { type: '=', value: T };

export type Expression<T> = CompareExpression<T> | RangeExpression<T> |
  EqExpression<T>;

export type WildcardRangeSet<T> = { type: '*', excludes?: T[] };

export type RangeSet<T> = Expression<T>[] | WildcardRangeSet<T> | true | false;

export type Comparator<T> = (a: T, b: T) => number;
