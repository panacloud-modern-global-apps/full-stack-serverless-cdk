"use strict";

var _BigInteger = _interopRequireDefault(require("./BigInteger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('BigInteger', function () {
  describe('.toString(radix)', function () {
    it('should support positive numbers', function () {
      expect(new _BigInteger["default"]('abcd1234', 16).toString(4)).toBe('2223303101020310');
    });
    it('should support negative numbers', function () {
      expect(new _BigInteger["default"]('-abcd1234', 16).toString(4)).toBe('-2223303101020310');
    });
  });
});