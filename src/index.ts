import { Expression, RangeSet, WildcardRangeSet } from './type';

type Comparator<T> = (a: T, b: T) => number;

function isWildcard<T>(set: RangeSet<T>): set is WildcardRangeSet<T> {
  return typeof set === 'object' && 'type' in set && set.type === '*';
}

export default function createRangeSet<T>(comparator: Comparator<T>) {
  const module = {
    eq: (value: T): RangeSet<T> => [{ type: '=', value }],
    gt: (value: T): RangeSet<T> =>
      [{ type: '>', value, equal: false }],
    gte: (value: T): RangeSet<T> =>
      [{ type: '>', value, equal: true }],
    lt: (value: T): RangeSet<T> =>
      [{ type: '<', value, equal: false }],
    lte: (value: T): RangeSet<T> =>
      [{ type: '<', value, equal: true }],
    neq: (value: T): RangeSet<T> => ({ type: '*', excludes: [value] }),
    in: (values: T[]): RangeSet<T> =>
      values.map(value => ({ type: '=' as '=', value })),
    notIn: (values: T[]): RangeSet<T> => ({ type: '*', excludes: values }),
    wildcard: (): RangeSet<T> => ({ type: '*' }),
    or: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      // If one of them is entirely false, ignore them entirely.
      if (a === false) {
        return b;
      }
      if (b === false) {
        return a;
      }
      // If one of them is true, always return true.
      if (a === true || b === true) {
        return true;
      }
      // Wildcard is handled differently than the others - its 'excludes' is
      // tested against the other set, and failing values are re-added to the
      // set.
      if (isWildcard(a)) {
        return {
          type: '*',
          excludes: module.filter(b, a.excludes, true),
        };
      }
      if (isWildcard(b)) {
        return {
          type: '*',
          excludes: module.filter(a, b.excludes, true),
        };
      }
      // The sole objective of this algorithm is merging two overlapping
      // expressions into one, so we have to traverse two sets at the same time,
      // and merge possible candidates.
      // Since this operates on ordered set, it can be written in a sweeping
      // algorithm.
      //
      // To do that, we store 'currently active expression' in the memory.
      // It can be changed to expand more while traversing through them. After
      // the current value has surpassed active expression, the resulting
      // expression is discarded to output set.
      //
      // After traversing them, the output set should contain the merged
      // range sets.
      //
      // Traverse both range set in order, to do that compare two range sets
      // and use smaller one.
      let activeExpr: Expression<T> | null = null;
      let output: RangeSet<T> = [];
      let aIndex = 0;
      let bIndex = 0;
      while (aIndex < a.length && bIndex < b.length) {
        const aExpr = a[aIndex];
        const bExpr = b[bIndex];
        const aMin = module.getExprMin(aExpr);
        const aMax = module.getExprMax(aExpr);
        const bMin = module.getExprMin(bExpr);
        const bMax = module.getExprMin(bExpr);
        // Compare both values and advance smaller one.
        const compared = comparator(aMin, bMin);
        if (compared < 0) {
          aIndex += 1;
          // If aMax is larger than activeExpr's max value, replace activeExpr.
          if (comparator(aMax, module.getExprMax(activeExpr)) > 0) {
            activeExpr = aExpr;
          }
        } else if (compared > 0) {
          bIndex += 1;
          // If bMax is larger than activeExpr's max value, replace activeExpr.
          if (comparator(bMax, module.getExprMax(activeExpr)) > 0) {
            activeExpr = bExpr;
          }
        } else {
        }
      }
    },
    and: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      let output: RangeSet<T> = [];
    },
    not: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      let output: RangeSet<T> = [];
    },
    getExprMin: (expr: Expression<T>): T => {

    },
    getExprMax: (expr: Expression<T>): T => {

    },
    filter: (set: RangeSet<T>, values: T[], inverted?: boolean): T[] => {

    },
    testSeries: (set: RangeSet<T>, values: T[]): boolean[] => {

    },
    test: (set: RangeSet<T>, value: T): boolean => {

    },
  };
  return module;
}
