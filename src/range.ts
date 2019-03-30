import { SetDescriptor } from './type';

export type Range<T> = {
  min: T,
  max: T,
  minEqual: boolean,
  maxEqual: boolean,
  excludes: T[],
};

export default function createRangeSet<T>(descriptor: SetDescriptor<T>) {
  const module = {
    eq: (value: T): Range<T> => ({
      min: value,
      max: value,
      minEqual: true,
      maxEqual: true,
      excludes: [],
    }),
    gt: (value: T): Range<T> => ({
      min: value,
      max: descriptor.negativeInfinity,
      minEqual: false,
      maxEqual: true,
      excludes: [],
    }),
    gte: (value: T): Range<T> => ({
      min: value,
      max: descriptor.negativeInfinity,
      minEqual: true,
      maxEqual: true,
      excludes: [],
    }),
    lt: (value: T): Range<T> => ({
      min: descriptor.negativeInfinity,
      max: value,
      minEqual: true,
      maxEqual: false,
      excludes: [],
    }),
    lte: (value: T): Range<T> => ({
      min: descriptor.negativeInfinity,
      max: value,
      minEqual: true,
      maxEqual: true,
      excludes: [],
    }),
    all: (value: T): Range<T> => ({
      min: descriptor.negativeInfinity,
      max: descriptor.positiveInfinity,
      minEqual: true,
      maxEqual: true,
      excludes: [],
    }),
    range: (
      min: T,
      max: T,
      minEqual: boolean = false,
      maxEqual: boolean = false,
    ): Range<T> => ({
      min, max, minEqual, maxEqual, excludes: [],
    }),
    setMax: (
      range: Range<T>,
      max: T,
      maxEqual: boolean = false,
    ): Range<T> => ({
      ...range,
      max,
      maxEqual,
    }),
    setMin: (
      range: Range<T>,
      min: T,
      minEqual: boolean = false,
    ): Range<T> => ({
      ...range,
      min,
      minEqual,
    }),
  };
}
