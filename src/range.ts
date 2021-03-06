import { SetDescriptor } from './type';

export type Range<T> = {
  min: T,
  max: T,
  minEqual: boolean,
  maxEqual: boolean,
};

export default function createRangeModule<T>(descriptor: SetDescriptor<T>) {
  const module = {
    eq: (value: T): Range<T> => ({
      min: value,
      max: value,
      minEqual: true,
      maxEqual: true,
    }),
    gt: (value: T): Range<T> => ({
      min: value,
      max: descriptor.positiveInfinity,
      minEqual: false,
      maxEqual: true,
    }),
    gte: (value: T): Range<T> => ({
      min: value,
      max: descriptor.positiveInfinity,
      minEqual: true,
      maxEqual: true,
    }),
    lt: (value: T): Range<T> => ({
      min: descriptor.negativeInfinity,
      max: value,
      minEqual: true,
      maxEqual: false,
    }),
    lte: (value: T): Range<T> => ({
      min: descriptor.negativeInfinity,
      max: value,
      minEqual: true,
      maxEqual: true,
    }),
    all: (): Range<T> => ({
      min: descriptor.negativeInfinity,
      max: descriptor.positiveInfinity,
      minEqual: true,
      maxEqual: true,
    }),
    range: (
      min: T,
      max: T,
      minEqual: boolean = false,
      maxEqual: boolean = false,
    ): Range<T> => ({
      min, max, minEqual, maxEqual,
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
    or: (a: Range<T>, b: Range<T>): Range<T> => {
      const compMin = descriptor.compare(a.min, b.min);
      const compMax = descriptor.compare(a.max, b.max);
      const minMin = compMin < 0 ? a.min : b.min;
      const maxMax = compMax > 0 ? a.max : b.max;
      return {
        min: minMin,
        max: maxMax,
        minEqual: compMin < 0 ? a.minEqual :
          (compMin > 0 ? b.minEqual : a.minEqual || b.minEqual),
        maxEqual: compMax > 0 ? a.maxEqual :
          (compMax < 0 ? b.maxEqual : a.maxEqual || b.maxEqual),
      };
    },
    and: (...ranges: Range<T>[]): Range<T> | null => {
      let min = ranges[0].min;
      let minEqual = ranges[0].minEqual;
      let max = ranges[0].max;
      let maxEqual = ranges[0].maxEqual;
      for (let i = 1; i < ranges.length; i += 1) {
        const range = ranges[i];
        const compMin = descriptor.compare(min, range.min);
        if (compMin < 0) {
          min = range.min;
          minEqual = range.minEqual;
        } else if (compMin === 0) {
          minEqual = minEqual && range.minEqual;
        }
        const compMax = descriptor.compare(max, range.max);
        if (compMax > 0) {
          max = range.max;
          maxEqual = range.maxEqual;
        } else if (compMax === 0) {
          maxEqual = maxEqual && range.maxEqual;
        }
      }
      const comp = descriptor.compare(min, max);
      if (comp > 0) return null;
      if (comp === 0 && !(minEqual && maxEqual)) return null;
      return { min, max, minEqual, maxEqual };
    },
    isValid: (range: Range<T>): boolean => {
      const comp = descriptor.compare(range.min, range.max);
      if (comp > 0) {
        return false;
      }
      if (comp === 0) {
        return range.minEqual && range.maxEqual;
      }
      return true;
    },
    test: (range: Range<T>, value: T): boolean => {
      const compMin = descriptor.compare(range.min, value);
      const compMax = descriptor.compare(value, range.max);
      return (range.minEqual ? compMin <= 0 : compMin < 0) &&
        (range.maxEqual ? compMax <= 0 : compMax < 0);
    },
  };
  return module;
}
