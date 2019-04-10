import createRangeSetModule from '../index';

describe('index', () => {
  const module = createRangeSetModule({
    compare: (a: number, b: number) => a - b,
    isPositiveInfinity: (v: number) => v === Infinity,
    isNegativeInfinity: (v: number) => v === -Infinity,
    positiveInfinity: Infinity,
    negativeInfinity: -Infinity,
  });
  describe('or', () => {
    it('should merge gte / range', () => {
      expect(module.or(
        module.range(1, 5),
        module.gte(5),
      )).toEqual(module.gt(1));
    });
    it('should merge two ranges without minEqual / maxEqual', () => {
      expect(module.or(
        module.range(1, 5),
        module.range(5, 10),
      )).toEqual([
        module.rangeModule.range(1, 5),
        module.rangeModule.range(5, 10),
      ]);
    });
    it('should merge two ranges with excludes', () => {
      expect(module.or(
        module.range(1, 5),
        module.range(5, 10, true, true),
      )).toEqual(module.range(1, 10, false, true));
    });
    it('should merge multiple instances', () => {
      expect(module.or(
        module.range(1, 10),
        [
          module.rangeModule.range(-1, 5),
          module.rangeModule.range(5, 8),
          module.rangeModule.range(10, 12, true),
          module.rangeModule.range(20, 30),
        ]
      )).toEqual([
        module.rangeModule.range(-1, 12),
        module.rangeModule.range(20, 30),
      ]);
    });
  });
  describe('and', () => {
    it('should merge gt / lt', () => {
      expect(module.and(
        module.gte(1),
        module.lt(10),
      )).toEqual(module.range(1, 10, true, false));
    });
    it('should merge two ranges', () => {
      expect(module.and(
        module.range(1, 5),
        module.range(3, 4, true, true),
      )).toEqual(module.range(3, 4, true, true));
    });
    it('should merge one long range / list of short ranges', () => {
      expect(module.and(
        module.range(1, 10, true),
        [
          module.rangeModule.range(-1, 5),
          module.rangeModule.range(5, 6),
          module.rangeModule.range(7, 10, false, true),
          module.rangeModule.range(10, 12),
        ]
      )).toEqual([
        module.rangeModule.range(1, 5, true),
        module.rangeModule.range(5, 6),
        module.rangeModule.range(7, 10),
      ]);
    });
  });
  describe('test', () => {
    it('should return correct result', () => {
      expect(module.test([
        module.rangeModule.range(1, 2),
        module.rangeModule.range(2, 3),
        module.rangeModule.range(4, 100),
        module.rangeModule.range(1000, 1005),
      ], 2)).toBe(false);
      expect(module.test([
        module.rangeModule.range(1, 2, false, true),
        module.rangeModule.range(2, 3),
        module.rangeModule.range(4, 100),
        module.rangeModule.range(1000, 1005),
      ], 2)).toBe(true);
      expect(module.test([
        module.rangeModule.range(1, 2),
        module.rangeModule.range(2, 3, true),
        module.rangeModule.range(4, 100),
        module.rangeModule.range(1000, 1005),
      ], 2)).toBe(true);
    });
  });
});
