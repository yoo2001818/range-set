import { SetDescriptor } from './type';
import createRangeModule, { Range } from './range';

export type RangeSet<T> = Range<T>[];

export default function createRangeSetModule<T>(descriptor: SetDescriptor<T>) {
  const rangeModule = createRangeModule(descriptor);
  const module = {
    rangeModule,
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
      function process(current: Range<T>) {
        if (active != null) {
          const compared = descriptor.compare(active.max, current.min);
          if (compared > 0 ||
            (compared === 0 && (active.maxEqual || current.minEqual))
          ) {
            active = rangeModule.union(active, current);
            return;
          }
          output.push(active);
        }
        active = current;
      }
      let active: Range<T> | null = null;
      let aPos = 0;
      let bPos = 0;
      const output: Range<T>[] = [];
      while (aPos < a.length && bPos < b.length) {
        const comp = descriptor.compare(a[aPos].min, b[bPos].min);
        if (comp <= 0) {
          process(a[aPos]);
          aPos += 1;
        }
        if (comp >= 0) {
          process(b[bPos]);
          bPos += 1;
        }
      }
      while (aPos < a.length) {
        process(a[aPos]);
        aPos += 1;
      }
      while (bPos < b.length) {
        process(b[bPos]);
        bPos += 1;
      }
      if (active != null) output.push(active);
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
      while (aPos < a.length) {
        aActive = a[aPos];
        aPos += 1;
        if (bActive != null &&
          descriptor.compare(bActive.max, aActive.min) > 0
        ) {
          output.push(rangeModule.intersection(aActive, bActive));
        }
      }
      while (bPos < b.length) {
        bActive = b[bPos];
        bPos += 1;
        if (aActive != null &&
          descriptor.compare(aActive.max, bActive.min) > 0
        ) {
          output.push(rangeModule.intersection(aActive, bActive));
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
