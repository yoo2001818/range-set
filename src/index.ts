import { SetDescriptor } from './type';
import createRangeModule, { Range } from './range';
import { findValue } from './util';

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
    neq: (value: T): RangeSet<T> => [
      rangeModule.lt(value),
      rangeModule.gt(value),
    ],
    range: (
      min: T,
      max: T,
      minEqual: boolean = false,
      maxEqual: boolean = false,
    ): RangeSet<T> => [rangeModule.range(min, max, minEqual, maxEqual)],
    not: (input: RangeSet<T>): RangeSet<T> => {
      const output: RangeSet<T> = [];
      let lastValue = descriptor.negativeInfinity;
      let lastEqual = true;
      for (let i = 0; i < input.length; i += 1) {
        const entry = input[i];
        if (!(descriptor.isNegativeInfinity(entry.min) && entry.minEqual)) {
          output.push({
            min: lastValue,
            max: entry.min,
            minEqual: lastEqual,
            maxEqual: !entry.minEqual,
          });
        }
        lastValue = entry.max;
        lastEqual = !entry.maxEqual;
      }
      if (!(descriptor.isPositiveInfinity(lastValue) && !lastEqual)) {
        output.push({
          min: lastValue,
          max: descriptor.positiveInfinity,
          minEqual: lastEqual,
          maxEqual: true,
        });
      }
      return output;
    },
    or: (...ranges: RangeSet<T>[]): RangeSet<T> => {
      if (ranges.length <= 1) {
        return ranges[0];
      }
      let a;
      let b;
      if (ranges.length > 2) {
        // Bisect the range array into two to perform this in log n level.
        // Of course, this'll create lots of temporary objects... but
        // better optimization can be done later.
        const mid = Math.floor(ranges.length / 2);
        a = module.or(...ranges.slice(0, mid));
        b = module.or(...ranges.slice(mid));
      } else {
        a = ranges[0];
        b = ranges[1];
      }
      function process(current: Range<T>) {
        if (active != null) {
          const compared = descriptor.compare(active.max, current.min);
          if (compared > 0 ||
            (compared === 0 && (active.maxEqual || current.minEqual))
          ) {
            active = rangeModule.or(active, current);
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
    and: (...ranges: RangeSet<T>[]): RangeSet<T> => {
      if (ranges.length <= 1) {
        return ranges[0];
      }
      let a;
      let b;
      if (ranges.length > 2) {
        // Bisect the range array into two to perform this in log n level.
        // Of course, this'll create lots of temporary objects... but
        // better optimization can be done later.
        const mid = Math.floor(ranges.length / 2);
        a = module.and(...ranges.slice(0, mid));
        b = module.and(...ranges.slice(mid));
      } else {
        a = ranges[0];
        b = ranges[1];
      }
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
            output.push(rangeModule.and(aActive, bActive));
          }
        }
        if (comp >= 0) {
          bActive = b[bPos];
          bPos += 1;
          if (aActive != null &&
            descriptor.compare(aActive.max, bActive.min) > 0
          ) {
            output.push(rangeModule.and(aActive, bActive));
          }
        }
      }
      while (aPos < a.length) {
        aActive = a[aPos];
        aPos += 1;
        if (bActive != null &&
          descriptor.compare(bActive.max, aActive.min) > 0
        ) {
          output.push(rangeModule.and(aActive, bActive));
        }
      }
      while (bPos < b.length) {
        bActive = b[bPos];
        bPos += 1;
        if (aActive != null &&
          descriptor.compare(aActive.max, bActive.min) > 0
        ) {
          output.push(rangeModule.and(aActive, bActive));
        }
      }
      return output;
    },
    test: (rangeSet: RangeSet<T>, value: T): boolean => {
      const { pos } = findValue(
        rangeSet,
        value,
        descriptor.compare,
        (v: Range<T>) => v.min,
      );
      let current = rangeSet[pos];
      if (descriptor.compare(current.min, value) === 0 && !current.minEqual) {
        current = rangeSet[pos - 1];
      }
      return rangeModule.test(current, value);
    },
  };
  return module;
}
