import { Comparator } from './type';
import { POSITIVE_INFINITY, NEGATIVE_INFINITY, TWithInfinity,
  comparatorWithInfinity } from './util';

export type AllRange<T> = {
  type: '*',
  excludes?: T[],
};

export type InfiniteRange<T> = {
  type: '<' | '>',
  value: T,
  equal: boolean,
  excludes?: T[],
};

export type FiniteRange<T> = {
  type: 'range',
  min: T,
  max: T,
  minEqual: boolean,
  maxEqual: boolean,
  excludes?: T[],
};

export type EqRange<T> = { type: '=', value: T };

export type Range<T> = AllRange<T> | InfiniteRange<T> | FiniteRange<T> |
  EqRange<T>;

export default function createRangeSet<T>(comparator: Comparator<T>) {
  const compare = comparatorWithInfinity(comparator);
  const module = {
    eq: (value: T): EqRange<T> => ({ type: '=', value }),
    gt: (value: T): InfiniteRange<T> => ({ type: '>', value, equal: false }),
    gte: (value: T): InfiniteRange<T> => ({ type: '>', value, equal: true }),
    lt: (value: T): InfiniteRange<T> => ({ type: '<', value, equal: false }),
    lte: (value: T): InfiniteRange<T> => ({ type: '<', value, equal: true }),
    all: (): AllRange<T> => ({ type: '*' }),
    range: (
      min: T,
      max: T,
      minEqual: boolean = false,
      maxEqual: boolean = false,
    ): FiniteRange<T> => ({
      type: 'range', min, max, minEqual, maxEqual,
    }),
    setMax: (
      range: Range<T>,
      max: TWithInfinity<T>,
      maxEqual: boolean = false,
    ): Range<T> => {},
    setMin: (
      range: Range<T>,
      max: TWithInfinity<T>,
      maxEqual: boolean = false,
    ): Range<T> => {},
  };
}
