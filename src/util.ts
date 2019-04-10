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
