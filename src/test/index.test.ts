import createRangeSet from '../index';

describe('index', () => {
  const rangeSet = createRangeSet((a: number, b: number) => a - b);
  describe('or', () => {
    it('should merge gte / range', () => {
      expect(rangeSet.or(
        rangeSet.range(1, 5),
        rangeSet.gte(5),
      )).toEqual({});
    });
    it('should merge two ranges with excludes', () => {
      expect(rangeSet.or(
        rangeSet.range(1, 5),
        rangeSet.range(5, 10),
      )).toEqual({});
    });
    it('should merge two ranges with excludes', () => {
      expect(rangeSet.or(
        rangeSet.range(1, 5),
        rangeSet.range(5, 10, true),
      )).toEqual({});
    });
  });
});
