"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

/**
 * Calculates and returns the best rational approximation of the given real number.
 * @private
 * @param {string|number|BigNumber} number
 * @throws Error Throws `Error` when the best rational approximation cannot be found.
 * @returns {array} first element is n (numerator), second element is d (denominator)
 */
exports.best_r = best_r;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var BigNumber = _interopRequire(require("bignumber.js"));

var MAX_INT = (1 << 31 >>> 0) - 1;
function best_r(number) {
  number = new BigNumber(number);
  var a;
  var f;
  var fractions = [[new BigNumber(0), new BigNumber(1)], [new BigNumber(1), new BigNumber(0)]];
  var i = 2;
  while (true) {
    if (number.gt(MAX_INT)) {
      break;
    }
    a = number.floor();
    f = number.sub(a);
    var h = a.mul(fractions[i - 1][0]).add(fractions[i - 2][0]);
    var k = a.mul(fractions[i - 1][1]).add(fractions[i - 2][1]);
    if (h.gt(MAX_INT) || k.gt(MAX_INT)) {
      break;
    }
    fractions.push([h, k]);
    if (f.eq(0)) {
      break;
    }
    number = new BigNumber(1).div(f);
    i++;
  }

  var _fractions = _slicedToArray(fractions[fractions.length - 1], 2);

  var n = _fractions[0];
  var d = _fractions[1];

  if (n.isZero() || d.isZero()) {
    throw new Error("Couldn't find approximation");
  }

  return [n.toNumber(), d.toNumber()];
}