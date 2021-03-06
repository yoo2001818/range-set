import createRangeSetModule from '../index';

describe('index', () => {
  const module = createRangeSetModule({
    compare: (a: number, b: number) => a - b,
    isPositiveInfinity: (v: number) => v === Infinity,
    isNegativeInfinity: (v: number) => v === -Infinity,
    positiveInfinity: Infinity,
    negativeInfinity: -Infinity,
  });
  describe('not', () => {
    it('should invert the given input', () => {
      expect(module.not([
        module.rangeModule.range(1, 5, false, true),
        module.rangeModule.range(8, 10),
      ])).toEqual([
        module.rangeModule.lte(1),
        module.rangeModule.range(5, 8, false, true),
        module.rangeModule.gte(10),
      ]);
    });
    it('should invert lt / gt', () => {
      expect(module.not([
        module.rangeModule.lte(3),
        module.rangeModule.gte(10),
      ])).toEqual([
        module.rangeModule.range(3, 10),
      ]);
      expect(module.not([
        module.rangeModule.lt(3),
        module.rangeModule.gt(10),
      ])).toEqual([
        module.rangeModule.range(3, 10, true, true),
      ]);
    });
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
        ],
      )).toEqual([
        module.rangeModule.range(-1, 12),
        module.rangeModule.range(20, 30),
      ]);
    });
    it('should merge multiple sets', () => {
      expect(module.or(
        module.range(1, 5),
        module.range(4, 10),
        module.range(15, 20),
        module.range(19, 22, false, true),
        module.range(22, 24),
      )).toEqual([
        module.rangeModule.range(1, 10),
        module.rangeModule.range(15, 24),
      ]);
    });
    it('should merge non-eq and eq', () => {
      expect(module.or(
        module.neq(1),
        module.eq(1),
      )).toEqual(module.range(-Infinity, Infinity, true, true));
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
        ],
      )).toEqual([
        module.rangeModule.range(1, 5, true),
        module.rangeModule.range(5, 6),
        module.rangeModule.range(7, 10),
      ]);
    });
    it('should merge multiple sets', () => {
      expect(module.and(
        module.range(1, 20),
        module.gt(4),
        module.lt(19),
        module.range(3, 10),
        module.gte(6),
      )).toEqual(module.range(6, 10, true, false));
    });
    it('should not merge non-eq and eq', () => {
      expect(module.and(
        module.gt(1),
        module.eq(1),
      )).toEqual([]);
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
