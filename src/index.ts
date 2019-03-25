import { Expression, RangeSet, WildcardRangeSet, Comparator } from './type';
import { getExprMin, getExprMax, isExprMinEqual, isExprMaxEqual,
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
          const compResult = compare(getExprMax(activeExpr), max);
          // Check for its excludes list.
          // Check if we can expand upon it.
          if (compResult < 0) {
            // If activeExpr is '=', escalate itself into minEqual: true.
            switch (activeExpr.type) {
              case '=':
                switch (expr.type) {
                  case 'range':
                    activeExpr = { ...expr, minEqual: true };
                    break;
                  case '<':
                    activeExpr = { ...expr, equal: true };
                    break;
                  default:
                    activeExpr = expr;
                    break;
                }
                break;
            }
          } else if (compResult === 0) {
            // If activeExpr is not '=', and itself is '=', set maxEqual: true.
            const isMaxEqual = isExprMaxEqual(expr);
            switch (activeExpr.type) {
              case '<':
                activeExpr.equal = activeExpr.equal || isMaxEqual;
                break;
              case 'range':
                activeExpr.maxEqual = activeExpr.maxEqual || isMaxEqual;
                break;
            }
          }
        }
      }
    },
    and: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      let output: RangeSet<T> = [];
    },
    not: (a: RangeSet<T>, b: RangeSet<T>): RangeSet<T> => {
      let output: RangeSet<T> = [];
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
