import { SetDescriptor } from './type';
import createRangeModule, { Range } from './range';

export type RangeSet<T> = Range<T>[] | true | false;

export default function createRangeSetModule<T>(descriptor: SetDescriptor<T>) {
  const rangeModule = createRangeModule(descriptor);
  const module = {
    eq: (value: T): RangeSet<T> => [rangeModule.eq(value)],
    gt: (value: T): RangeSet<T> => [rangeModule.gt(value)],
    gte: (value: T): RangeSet<T> => [rangeModule.gte(value)],
    lt: (value: T): RangeSet<T> => [rangeModule.lt(value)],
    lte: (value: T): RangeSet<T> => [rangeModule.lte(value)],
    all: (): RangeSet<T> => [rangeModule.all()],
    range: (
      min: T,
      max: T,
      minEqual: boolean = false,
      maxEqual: boolean = false,
    ): RangeSet<T> => [rangeModule.range(min, max, minEqual, maxEqual)],
    invert: (input: RangeSet<T>): RangeSet<T> => {
      return [];
    },
    union: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      return [];
    },
    intersection: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      return [];
    },
    test: (rangeSet: RangeSet<T>, value: T): boolean => {
      return false;
    },
  };
  return module;
}
