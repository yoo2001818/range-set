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
    union: (a: Range<T>, b: Range<T>): Range<T> => {
      const compMin = descriptor.compare(a.min, b.min);
      const compMax = descriptor.compare(a.max, b.max);
      const minMin = compMin < 0 ? a.min : b.min;
      const minMax = compMin > 0 ? a.min : b.min;
      const maxMax = compMax > 0 ? a.max : b.max;
      const maxMin = compMax < 0 ? a.max : b.max;
      return {
        min: minMin,
        max: maxMax,
        minEqual: compMin < 0 ? a.minEqual :
          (compMin > 0 ? b.minEqual : a.minEqual || b.minEqual),
        maxEqual: compMax > 0 ? a.maxEqual :
          (compMax < 0 ? b.maxEqual : a.maxEqual || b.maxEqual),
      };
    },
    intersection: (a: Range<T>, b: Range<T>): Range<T> => {
      const compMin = descriptor.compare(a.min, b.min);
      const compMax = descriptor.compare(a.max, b.max);
      const minMax = compMin > 0 ? a.min : b.min;
      const maxMin = compMax < 0 ? a.max : b.max;
      return {
        min: minMax,
        max: maxMin,
        minEqual: compMin > 0 ? a.minEqual :
          (compMin < 0 ? b.minEqual : a.minEqual && b.minEqual),
        maxEqual: compMax < 0 ? a.maxEqual :
          (compMax > 0 ? b.maxEqual : a.maxEqual && b.maxEqual),
      };
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
