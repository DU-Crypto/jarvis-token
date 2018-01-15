"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var xdr = _interopRequire(require("./generated/stellar-xdr_generated"));

var isUndefined = _interopRequire(require("lodash/isUndefined"));

var isNull = _interopRequire(require("lodash/isNull"));

var isString = _interopRequire(require("lodash/isString"));

var clone = _interopRequire(require("lodash/clone"));

var UnsignedHyper = require("js-xdr").UnsignedHyper;

var BigNumber = _interopRequire(require("bignumber.js"));

/**
 * Type of {@link Memo}.
 */
var MemoNone = "none";
exports.MemoNone = MemoNone;
/**
 * Type of {@link Memo}.
 */
var MemoID = "id";
exports.MemoID = MemoID;
/**
 * Type of {@link Memo}.
 */
var MemoText = "text";
exports.MemoText = MemoText;
/**
 * Type of {@link Memo}.
 */
var MemoHash = "hash";
exports.MemoHash = MemoHash;
/**
 * Type of {@link Memo}.
 */
var MemoReturn = "return";

exports.MemoReturn = MemoReturn;
/**
 * `Memo` represents memos attached to transactions.
 *
 * @param {string} type - `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`
 * @param {*} value - `string` for `MemoID`, `MemoText`, buffer of hex string for `MemoHash` or `MemoReturn`
 * @see [Transactions concept](https://www.stellar.org/developers/learn/concepts/transactions.html)
 * @class Memo
 */

var Memo = exports.Memo = (function () {
  function Memo(type) {
    var value = arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, Memo);

    this._type = type;
    this._value = value;

    switch (this._type) {
      case MemoNone:
        break;
      case MemoID:
        Memo._validateIdValue(value);
        break;
      case MemoText:
        Memo._validateTextValue(value);
        break;
      case MemoHash:
      case MemoReturn:
        Memo._validateHashValue(value);
        // We want MemoHash and MemoReturn to have Buffer as a value
        if (isString(value)) {
          this._value = new Buffer(value, "hex");
        }
        break;
      default:
        throw new Error("Invalid memo type");
    }
  }

  _createClass(Memo, {
    type: {

      /**
       * Contains memo type: `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`
       */

      get: function () {
        return clone(this._type);
      },
      set: function (type) {
        throw new Error("Memo is immutable");
      }
    },
    value: {

      /**
       * Contains memo value:
       * * `null` for `MemoNone`,
       * * `string` for `MemoID`, `MemoText`,
       * * `Buffer` for `MemoHash`, `MemoReturn`
       */

      get: function () {
        switch (this._type) {
          case MemoNone:
            return null;
          case MemoID:
          case MemoText:
            return clone(this._value);
          case MemoHash:
          case MemoReturn:
            return new Buffer(this._value);
          default:
            throw new Error("Invalid memo type");
        }
      },
      set: function (value) {
        throw new Error("Memo is immutable");
      }
    },
    toXDRObject: {

      /**
       * Returns XDR memo object.
       * @returns {xdr.Memo}
       */

      value: function toXDRObject() {
        switch (this._type) {
          case MemoNone:
            return xdr.Memo.memoNone();
          case MemoID:
            return xdr.Memo.memoId(UnsignedHyper.fromString(this._value));
          case MemoText:
            return xdr.Memo.memoText(this._value);
          case MemoHash:
            return xdr.Memo.memoHash(this._value);
          case MemoReturn:
            return xdr.Memo.memoReturn(this._value);
        }
      }
    }
  }, {
    _validateIdValue: {
      value: function _validateIdValue(value) {
        var error = new Error("Expects a int64 as a string. Got " + value);

        if (!isString(value)) {
          throw error;
        }

        var number = undefined;
        try {
          number = new BigNumber(value);
        } catch (e) {
          throw error;
        }

        // Infinity
        if (!number.isFinite()) {
          throw error;
        }

        // NaN
        if (number.isNaN()) {
          throw error;
        }
      }
    },
    _validateTextValue: {
      value: function _validateTextValue(value) {
        if (!isString(value)) {
          throw new Error("Expects string type got " + typeof value);
        }
        if (Buffer.byteLength(value, "utf8") > 28) {
          throw new Error("Text should be <= 28 bytes. Got " + Buffer.byteLength(value, "utf8"));
        }
      }
    },
    _validateHashValue: {
      value: function _validateHashValue(value) {
        var error = new Error("Expects a 32 byte hash value or hex encoded string. Got " + value);

        if (value === null || isUndefined(value)) {
          throw error;
        }

        var valueBuffer = undefined;
        if (isString(value)) {
          if (!/^[0-9A-Fa-f]{64}$/g.test(value)) {
            throw error;
          }
          valueBuffer = new Buffer(value, "hex");
        } else if (Buffer.isBuffer(value)) {
          valueBuffer = new Buffer(value);
        } else {
          throw error;
        }

        if (!valueBuffer.length || valueBuffer.length != 32) {
          throw error;
        }
      }
    },
    none: {

      /**
       * Returns an empty memo (`MemoNone`).
       * @returns {Memo}
       */

      value: function none() {
        return new Memo(MemoNone);
      }
    },
    text: {

      /**
       * Creates and returns a `MemoText` memo.
       * @param {string} text - memo text
       * @returns {Memo}
       */

      value: (function (_text) {
        var _textWrapper = function text(_x) {
          return _text.apply(this, arguments);
        };

        _textWrapper.toString = function () {
          return _text.toString();
        };

        return _textWrapper;
      })(function (text) {
        return new Memo(MemoText, text);
      })
    },
    id: {

      /**
       * Creates and returns a `MemoID` memo.
       * @param {string} id - 64-bit number represented as a string
       * @returns {Memo}
       */

      value: (function (_id) {
        var _idWrapper = function id(_x2) {
          return _id.apply(this, arguments);
        };

        _idWrapper.toString = function () {
          return _id.toString();
        };

        return _idWrapper;
      })(function (id) {
        return new Memo(MemoID, id);
      })
    },
    hash: {

      /**
       * Creates and returns a `MemoHash` memo.
       * @param {array|string} hash - 32 byte hash or hex encoded string
       * @returns {Memo}
       */

      value: (function (_hash) {
        var _hashWrapper = function hash(_x3) {
          return _hash.apply(this, arguments);
        };

        _hashWrapper.toString = function () {
          return _hash.toString();
        };

        return _hashWrapper;
      })(function (hash) {
        return new Memo(MemoHash, hash);
      })
    },
    "return": {

      /**
       * Creates and returns a `MemoReturn` memo.
       * @param {array|string} hash - 32 byte hash or hex encoded string
       * @returns {Memo}
       */

      value: function _return(hash) {
        return new Memo(MemoReturn, hash);
      }
    },
    fromXDRObject: {

      /**
       * Returns {@link Memo} from XDR memo object.
       * @param {xdr.Memo}
       * @returns {Memo}
       */

      value: function fromXDRObject(object) {
        switch (object.arm()) {
          case "id":
            return Memo.id(object.value().toString());
          case "text":
            return Memo.text(object.value());
          case "hash":
            return Memo.hash(object.value());
          case "retHash":
            return Memo["return"](object.value());
        }

        if (typeof object.value() === "undefined") {
          return Memo.none();
        }

        throw new Error("Unknown type");
      }
    }
  });

  return Memo;
})();