import BigInteger from './BigInteger';
describe('BigInteger', function () {
  describe('.toString(radix)', function () {
    it('should support positive numbers', function () {
      expect(new BigInteger('abcd1234', 16).toString(4)).toBe('2223303101020310');
    });
    it('should support negative numbers', function () {
      expect(new BigInteger('-abcd1234', 16).toString(4)).toBe('-2223303101020310');
    });
  });
});