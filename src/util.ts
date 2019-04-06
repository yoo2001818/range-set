import { RangeSet, Expression } from './type';

export const POSITIVE_INFINITY = Symbol('+Infinity');
export const NEGATIVE_INFINITY = Symbol('-Infinity');

export function findValue<T>(
  list: T[], value: T, compare: (a: T, b: T) => number,
): { pos: number, match: boolean } {
  let min = 0;
  let max = list.length - 1;
  while (min <= max) {
    const mid = Math.floor((min + max) / 2);
    const comp = compare(list[mid], value);
    if (comp < 0) {
      min = mid + 1;
    } else if (comp > 0) {
      max = mid - 1;
    } else {
      return { pos: mid, match: true };
    }
  }
  return { pos: min, match: false };
}

export function unionValues<T>(
  a: T[], b: T[], compare: (a: T, b: T) => number,
): T[] {
  let aPos = 0;
  let bPos = 0;
  const output: T[] = [];
  while (aPos < a.length && bPos < b.length) {
    const comp = compare(a[aPos], b[bPos]);
    if (comp < 0) {
      output.push(a[aPos]);
      aPos += 1;
    } else if (comp > 0) {
      output.push(b[bPos]);
      bPos += 1;
    } else {
      output.push(a[aPos]);
      aPos += 1;
      bPos += 1;
    }
  }
  while (aPos < a.length) {
    output.push(a[aPos]);
    aPos += 1;
  }
  while (bPos < b.length) {
    output.push(b[bPos]);
    bPos += 1;
  }
  return output;
}

export function intersectionValues<T>(
  a: T[], b: T[], compare: (a: T, b: T) => number,
): T[] {
  let aPos = 0;
  let bPos = 0;
  const output: T[] = [];
  while (aPos < a.length && bPos < b.length) {
    const comp = compare(a[aPos], b[bPos]);
    if (comp < 0) {
      aPos += 1;
    } else if (comp > 0) {
      bPos += 1;
    } else {
      output.push(a[aPos]);
      aPos += 1;
      bPos += 1;
    }
  }
  return output;
}

export function unionFilterValues<T>(
  a: T[],
  b: T[],
  compare: (a: T, b: T) => number,
  filter: (value: T, a: boolean, b: boolean) => boolean,
): T[] {
  let aPos = 0;
  let bPos = 0;
  const output: T[] = [];
  while (aPos < a.length && bPos < b.length) {
    const comp = compare(a[aPos], b[bPos]);
    if (comp < 0) {
      if (filter(a[aPos], true, false)) output.push(a[aPos]);
      aPos += 1;
    } else if (comp > 0) {
      if (filter(b[bPos], false, true)) output.push(b[bPos]);
      bPos += 1;
    } else {
      if (filter(a[aPos], true, true)) output.push(a[aPos]);
      aPos += 1;
      bPos += 1;
    }
  }
  while (aPos < a.length) {
    if (filter(a[aPos], true, false)) output.push(a[aPos]);
    aPos += 1;
  }
  while (bPos < b.length) {
    if (filter(b[bPos], false, true)) output.push(b[bPos]);
    bPos += 1;
  }
  return output;
}

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

/*
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
*/
