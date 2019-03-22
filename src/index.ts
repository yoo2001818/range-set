import { RangeSet, WildcardRangeSet } from './type';

export default function createRangeSet<T>() {
  return {
    eq: (value: T): RangeSet<T> => [{ value, type: '=' }],
    gt: (value: T): RangeSet<T> =>
      [{ value, type: '>', equal: false }],
    gte: (value: T): RangeSet<T> =>
      [{ value, type: '>', equal: true }],
    lt: (value: T): RangeSet<T> =>
      [{ value, type: '<', equal: false }],
    lte: (value: T): RangeSet<T> =>
      [{ value, type: '<', equal: true }],
    neq: (value: T): WildcardRangeSet<T> => ({ type: '*', excludes: [value] }),
  };
}
