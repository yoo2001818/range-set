import createRangeModule from '../range';

describe('range', () => {
  const module = createRangeModule({
    compare: (a: number, b: number) => a - b,
    isPositiveInfinity: (v: number) => v === Infinity,
    isNegativeInfinity: (v: number) => v === -Infinity,
    positiveInfinity: Infinity,
    negativeInfinity: -Infinity,
  });
  describe('eq', () => {
    it('should return correct value', () => {
      expect(module.eq(34)).toEqual({
        min: 34,
        max: 34,
        minEqual: true,
        maxEqual: true,
        excludes: [],
      });
    });
  });
  describe('gt', () => {
    it('should return correct value', () => {
      expect(module.gt(1)).toEqual({
        min: 1,
        max: Infinity,
        minEqual: false,
        maxEqual: true,
        excludes: [],
      });
    });
  });
  describe('gte', () => {
    it('should return correct value', () => {
      expect(module.gte(1)).toEqual({
        min: 1,
        max: Infinity,
        minEqual: true,
        maxEqual: true,
        excludes: [],
      });
    });
  });
  describe('lt', () => {
    it('should return correct value', () => {
      expect(module.lt(1)).toEqual({
        min: -Infinity,
        max: 1,
        minEqual: true,
        maxEqual: false,
        excludes: [],
      });
    });
  });
  describe('lte', () => {
    it('should return correct value', () => {
      expect(module.lte(1)).toEqual({
        min: -Infinity,
        max: 1,
        minEqual: true,
        maxEqual: true,
        excludes: [],
      });
    });
  });
  describe('all', () => {
    it('should return correct value', () => {
      expect(module.all()).toEqual({
        min: -Infinity,
        max: Infinity,
        minEqual: true,
        maxEqual: true,
        excludes: [],
      });
    });
  });
  describe('range', () => {
    it('should return correct value', () => {
      expect(module.range(1, 5, true, false)).toEqual({
        min: 1,
        max: 5,
        minEqual: true,
        maxEqual: false,
        excludes: [],
      });
    });
  });
  describe('setMax', () => {
    it('should expand range', () => {
      expect(module.setMax(module.range(1, 5, true, false), 10, true)).toEqual({
        min: 1,
        max: 10,
        minEqual: true,
        maxEqual: true,
        excludes: [],
      });
    });
    it('should shrink range', () => {
      expect(module.setMax(module.range(1, 5, true, false), 2, false)).toEqual({
        min: 1,
        max: 2,
        minEqual: true,
        maxEqual: false,
        excludes: [],
      });
    });
    it('should re-adjust excludes list', () => {
      expect(module.setMax({
        min: 1,
        max: 10,
        minEqual: false,
        maxEqual: false,
        excludes: [1, 2, 7, 10],
      }, 7, true)).toEqual({
        min: 1,
        max: 7,
        minEqual: false,
        maxEqual: true,
        excludes: [1, 2, 7],
      });
    });
  });
  describe('setMin', () => {
    it('should expand range', () => {
      expect(module.setMin(module.range(1, 5, true, false), -5, true)).toEqual({
        min: -5,
        max: 5,
        minEqual: true,
        maxEqual: false,
        excludes: [],
      });
    });
    it('should shrink range', () => {
      expect(module.setMin(module.range(1, 5, true, false), 4, false)).toEqual({
        min: 4,
        max: 5,
        minEqual: false,
        maxEqual: false,
        excludes: [],
      });
    });
    it('should re-adjust excludes list', () => {
      expect(module.setMin({
        min: 1,
        max: 10,
        minEqual: false,
        maxEqual: false,
        excludes: [1, 2, 7, 10],
      }, 7, true)).toEqual({
        min: 7,
        max: 10,
        minEqual: true,
        maxEqual: false,
        excludes: [7, 10],
      });
    });
  });
  describe('isValid', () => {
    it('should pass correct ranges', () => {
      expect(module.isValid(module.range(1, 5, false, false))).toBe(true);
      expect(module.isValid(module.range(5, 5, true, true))).toBe(true);
    });
    it('should reject inverted ranges', () => {
      expect(module.isValid(module.range(5, 1, false, false))).toBe(false);
    });
    it('should reject non-equal point ranges', () => {
      expect(module.isValid(module.range(1, 1, true, false))).toBe(false);
      expect(module.isValid(module.range(1, 1, false, true))).toBe(false);
      expect(module.isValid(module.range(1, 1, false, false))).toBe(false);
    });
    it('should reject self-excluding point ranges', () => {
      expect(module.isValid({
        min: 1,
        max: 1,
        minEqual: true,
        maxEqual: true,
        excludes: [1],
      })).toBe(false);
    });
  });
  describe('test', () => {
    it('should pass correct ranges', () => {
      expect(module.test(module.range(1, 5, false, false), 2)).toBe(true);
      expect(module.test(module.range(1, 5, true, false), 1)).toBe(true);
      expect(module.test(module.range(1, 5, false, true), 5)).toBe(true);
      expect(module.test(module.range(1, 1, true, true), 1)).toBe(true);
    });
    it('should pass incorrect ranges', () => {
      expect(module.test(module.range(1, 1, false, true), 1)).toBe(false);
      expect(module.test({
        min: 1,
        max: 1,
        minEqual: true,
        maxEqual: true,
        excludes: [1],
      }, 1)).toBe(false);
      expect(module.test(module.range(1, 5, false, false), -10)).toBe(false);
    });
  });
});
