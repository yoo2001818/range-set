import { SetDescriptor } from './type';
import { findValue, unionValues, intersectionValues } from './util';

export type Range<T> = {
  min: T,
  max: T,
  minEqual: boolean,
  maxEqual: boolean,
  excludes: T[],
};

export default function createRangeModule<T>(descriptor: SetDescriptor<T>) {
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
      max: descriptor.positiveInfinity,
      minEqual: false,
      maxEqual: true,
      excludes: [],
    }),
    gte: (value: T): Range<T> => ({
      min: value,
      max: descriptor.positiveInfinity,
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
    all: (): Range<T> => ({
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
    union: (a: Range<T>, b: Range<T>): Range<T> => {
      const compMin = descriptor.compare(a.min, b.min);
      const compMax = descriptor.compare(a.max, b.max);
      return {
        min: compMin < 0 ? a.min : b.min,
        max: compMax > 0 ? a.max : b.max,
        minEqual: compMin < 0 ? a.minEqual :
          (compMin > 0 ? b.minEqual : a.minEqual || b.minEqual),
        maxEqual: compMax > 0 ? a.maxEqual :
          (compMax < 0 ? b.maxEqual : a.maxEqual || b.maxEqual),
        excludes: a.excludes != null && b.excludes != null ?
          unionValues(a.excludes, b.excludes, descriptor.compare) :
          (a.excludes != null ? a.excludes : b.excludes),
      };
    },
    intersection: (a: Range<T>, b: Range<T>): Range<T> => {
      const compMin = descriptor.compare(a.min, b.min);
      const compMax = descriptor.compare(a.max, b.max);
      return {
        min: compMin > 0 ? a.min : b.min,
        max: compMax < 0 ? a.max : b.max,
        minEqual: compMin > 0 ? a.minEqual :
          (compMin < 0 ? b.minEqual : a.minEqual && b.minEqual),
        maxEqual: compMax < 0 ? a.maxEqual :
          (compMax > 0 ? b.maxEqual : a.maxEqual && b.maxEqual),
        excludes: a.excludes != null && b.excludes != null ?
          intersectionValues(a.excludes, b.excludes, descriptor.compare) :
          (a.excludes != null ? a.excludes : b.excludes),
      };
    },
    isValid: (range: Range<T>): boolean => {
      const comp = descriptor.compare(range.min, range.max);
      if (comp > 0) {
        return false;
      }
      if (comp === 0) {
        return range.minEqual && range.maxEqual &&
          (range.excludes == null || range.excludes.length === 0);
      }
      return true;
    },
    test: (range: Range<T>, value: T): boolean => {
      const compMin = descriptor.compare(range.min, value);
      const compMax = descriptor.compare(value, range.max);
      return (range.minEqual ? compMin <= 0 : compMin < 0) &&
        (range.maxEqual ? compMax <= 0 : compMax < 0) &&
        !(findValue(range.excludes, value, descriptor.compare).match);
    },
    sliceExcludes: (excludes: T[], min: T, max: T): T[] => {
      const minPos = findValue(excludes, min, descriptor.compare);
      const maxPos = findValue(excludes, max, descriptor.compare);
      return excludes.slice(minPos.pos, maxPos.pos + 1);
    },
  };
  return module;
}
