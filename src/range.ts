import { SetDescriptor } from './type';
import { findValue } from './util';

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
      excludes: range.excludes != null ?
        module.sliceExcludes(range.excludes, range.min, max) :
        [],
    }),
    setMin: (
      range: Range<T>,
      min: T,
      minEqual: boolean = false,
    ): Range<T> => ({
      ...range,
      min,
      minEqual,
      excludes: range.excludes != null ?
        module.sliceExcludes(range.excludes, min, range.max) :
        [],
    }),
    test: (range: Range<T>, value: T): boolean => {

    },
    sliceExcludes: (excludes: T[], min: T, max: T): T[] => {
      const minPos = findValue(excludes, min, descriptor.compare);
      const maxPos = findValue(excludes, min, descriptor.compare);
      return excludes.slice(minPos.pos, maxPos.pos + 1);
    },
  };
}
