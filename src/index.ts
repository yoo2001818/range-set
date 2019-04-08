import { SetDescriptor } from './type';
import createRangeModule, { Range } from './range';

export type RangeSet<T> = Range<T>[];

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
      let active: Range<T> | null = null;
      let aPos = 0;
      let bPos = 0;
      const output: Range<T>[] = [];
      while (aPos < a.length && bPos < b.length) {
        const comp = descriptor.compare(a[aPos].min, b[bPos].min);
        if (comp <= 0) {
          const current = a[aPos];
          aPos += 1;
          if (active != null &&
            descriptor.compare(active.max, current.min) < 0
          ) {
            active = rangeModule.union(active, current);
          } else {
            if (active != null) output.push(active);
            active = current;
          }
        }
        if (comp >= 0) {
          const current = b[bPos];
          bPos += 1;
          if (active != null &&
            descriptor.compare(active.max, current.min) < 0
          ) {
            active = rangeModule.union(active, current);
          } else {
            if (active != null) output.push(active);
            active = current;
          }
        }
      }
      return output;
    },
    intersection: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      let aActive: Range<T> | null = null;
      let bActive: Range<T> | null = null;
      let aPos = 0;
      let bPos = 0;
      const output: Range<T>[] = [];
      while (aPos < a.length && bPos < b.length) {
        const comp = descriptor.compare(a[aPos].min, b[bPos].min);
        if (comp <= 0) {
          aActive = a[aPos];
          aPos += 1;
          if (bActive != null &&
            descriptor.compare(bActive.max, aActive.min) > 0
          ) {
            output.push(rangeModule.intersection(aActive, bActive));
          }
        }
        if (comp >= 0) {
          bActive = b[bPos];
          bPos += 1;
          if (aActive != null &&
            descriptor.compare(aActive.max, bActive.min) > 0
          ) {
            output.push(rangeModule.intersection(aActive, bActive));
          }
        }
      }
      return output;
    },
    test: (rangeSet: RangeSet<T>, value: T): boolean => {
      return false;
    },
  };
  return module;
}
