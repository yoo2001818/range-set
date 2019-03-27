import { Expression, RangeSet, WildcardRangeSet, Comparator } from './type';
import { POSITIVE_INFINITY, NEGATIVE_INFINITY, TWithInfinity,
  getExprMin, getExprMax, isExprMinEqual, isExprMaxEqual,
  mergeRangeSet, comparatorWithInfinity } from './util';

function isWildcard<T>(set: RangeSet<T>): set is WildcardRangeSet<T> {
  return typeof set === 'object' && 'type' in set && set.type === '*';
}

export default function createRangeSet<T>(comparator: Comparator<T>) {
  const compare = comparatorWithInfinity(comparator);
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
    range: (
      min: TWithInfinity<T>,
      max: TWithInfinity<T>,
      minEqual: boolean = false,
      maxEqual: boolean = false,
    ): RangeSet<T> => {
      if (min === NEGATIVE_INFINITY && max === POSITIVE_INFINITY) {
        return true;
      }
      if (min === NEGATIVE_INFINITY) {
        return [{ type: '<', value: max as T, equal: maxEqual }];
      }
      if (max === POSITIVE_INFINITY) {
        return [{ type: '>', value: min as T, equal: minEqual }];
      }
      return [{
        type: 'range',
        min: min as T,
        max: max as T,
        minEqual,
        maxEqual,
      }];
    },
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
      for (const expr of mergeRangeSet(comparator, a, b)) {
        const max = getExprMax(expr);
        const min = getExprMin(expr);
        // If active expression doesn't include current expression at all,
        // commit the expression and overwrite it.
        if (activeExpr == null || compare(getExprMax(activeExpr), min) < 0) {
          if (activeExpr != null) {
            output.push(activeExpr);
          }
          activeExpr = expr;
        } else {
          let newMin = getExprMin(activeExpr);
          let newMax = getExprMax(activeExpr);
          let newMinEqual = isExprMinEqual(activeExpr);
          let newMaxEqual = isExprMaxEqual(activeExpr);
          const compResult = compare(getExprMax(activeExpr), max);
          // Check for its excludes list.
          // Check if we can expand upon it.
          if (compResult < 0) {
            newMax = max;
            newMaxEqual = isExprMaxEqual(expr);
          } else if (compResult === 0) {
            newMaxEqual = newMaxEqual || isExprMaxEqual(expr);
          }
          activeExpr =
            module.range(newMin, newMax, newMinEqual, newMaxEqual)[0];
        }
      }
      if (activeExpr != null) {
        output.push(activeExpr);
      }
      return output;
    },
    and: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      let output: RangeSet<T> = [];
      return output;
    },
    not: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      let output: RangeSet<T> = [];
      return output;
    },
    filter: (set: RangeSet<T>, values: T[], inverted?: boolean): T[] => {
      return [];
    },
    testSeries: (set: RangeSet<T>, values: T[]): boolean[] => {
      return [];
    },
    test: (set: RangeSet<T>, value: T): boolean => {
      return false;
    },
  };
  return module;
}
