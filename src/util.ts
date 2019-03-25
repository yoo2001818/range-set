import { Comparator, RangeSet, Expression } from './type';

export const POSITIVE_INFINITY = Symbol('+Infinity');
export const NEGATIVE_INFINITY = Symbol('-Infinity');

export function getExprMin<T>(
  expr: Expression<T>,
): T | typeof NEGATIVE_INFINITY {
  switch (expr.type) {
    case '<':
      return NEGATIVE_INFINITY;
    case '>':
    case '=':
      return expr.value;
    case 'range':
      return expr.min;
  }
}

export function getExprMax<T>(
  expr: Expression<T>,
): T | typeof POSITIVE_INFINITY {
  switch (expr.type) {
    case '>':
      return POSITIVE_INFINITY;
    case '<':
    case '=':
      return expr.value;
    case 'range':
      return expr.max;
  }
}

export function isExprMinEqual<T>(expr: Expression<T>): boolean {
  switch (expr.type) {
    case '>':
      return expr.equal;
    case '<':
    case '=':
      return true;
    case 'range':
      return expr.minEqual;
  }
}

export function isExprMaxEqual<T>(expr: Expression<T>): boolean {
  switch (expr.type) {
    case '<':
      return expr.equal;
    case '>':
    case '=':
      return true;
    case 'range':
      return expr.maxEqual;
  }
}

type TWithInfinity<T> = T | typeof NEGATIVE_INFINITY | typeof POSITIVE_INFINITY;

export const comparatorWithInfinity = <T>(comparator: Comparator<T>) =>
  (a: TWithInfinity<T>, b: TWithInfinity<T>): number => {
    if (a === NEGATIVE_INFINITY) {
      return -1;
    }
    if (a === POSITIVE_INFINITY) {
      return 1;
    }
    if (b === NEGATIVE_INFINITY) {
      return -1;
    }
    if (b === POSITIVE_INFINITY) {
      return 1;
    }
    return comparator(a, b);
  };

export function * mergeRangeSet<T>(
  comparator: Comparator<T>,
  ...exprs: Expression<T>[][]
): IterableIterator<Expression<T>> {
  const compare = comparatorWithInfinity(comparator);
  const currentExprs = exprs.filter(v => v.length > 0);
  const currentIndexes = currentExprs.map(() => 0);
  while (currentExprs.length > 0) {
    let lowestIndex = 0;
    let lowestExpr = currentExprs[0][currentIndexes[0]];
    let lowestValue = getExprMin(lowestExpr);
    for (let i = 1; i < currentExprs.length; i += 1) {
      const expr = currentExprs[i][currentIndexes[i]];
      const value = getExprMin(expr);
      if (compare(value, lowestValue) < 0) {
        lowestIndex = i;
        lowestExpr = expr;
        lowestValue = value;
      }
    }
    yield lowestExpr;
    const currentPos = (currentIndexes[lowestIndex] += 1);
    if (currentExprs[lowestIndex].length >= currentPos) {
      currentExprs.splice(lowestIndex, 1);
      currentIndexes.splice(lowestIndex, 1);
    }
  }
}
