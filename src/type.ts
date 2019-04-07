export type SetDescriptor<T> = {
  compare: (a: T, b: T) => number,
  isPositiveInfinity: (value: T) => boolean,
  isNegativeInfinity: (value: T) => boolean,
  positiveInfinity: T,
  negativeInfinity: T,
};
