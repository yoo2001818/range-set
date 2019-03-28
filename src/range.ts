export type AllRange<T> = {
  type: '*',
  excludes?: T[],
};

export type InfiniteRange<T> = {
  type: '<' | '>',
  value: T,
  equal: boolean,
  excludes?: T[],
};

export type FiniteRange<T> = {
  type: 'range',
  min: T,
  max: T,
  minEqual: boolean,
  maxEqual: boolean,
  excludes?: T[],
};

export type EqRange<T> = { type: '=', value: T };

export type Range<T> = AllRange<T> | InfiniteRange<T> | FiniteRange<T> |
  EqRange<T>;

export function eq<T>(value: T): EqRange<T> {
  return { type: '=', value };
}
export function gt<T>(value: T): InfiniteRange<T> {
  return { type: '>', value, equal: false };
}
export function gte<T>(value: T): InfiniteRange<T> {
  return { type: '>', value, equal: true };
}
export function lt<T>(value: T): InfiniteRange<T> {
  return { type: '<', value, equal: false };
}
export function lte<T>(value: T): InfiniteRange<T> {
  return { type: '<', value, equal: true };
}
export function all<T>(value: T): AllRange<T> {
  return { type: '*' };
}
export function range<T>(
  min: T, max: T, minEqual: boolean = false, maxEqual: boolean = false,
): FiniteRange<T> {
  return {
    type: 'range', min, max, minEqual, maxEqual,
  };
}

export function setMax<T>(
  range: Range<T>, max: T, maxEqual: boolean = false,
): Range<T> {

}
export function setMaxInfinite<T>(range: Range<T>): Range<T> {

}

export function setMin<T>(
  range: Range<T>, min: T, minEqual: boolean = false,
): Range<T> {

}
export function setMinInfinite<T>(range: Range<T>): Range<T> {

}
