"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.decodeCheck = decodeCheck;
exports.encodeCheck = encodeCheck;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var base32 = _interopRequire(require("base32.js"));

var crc = _interopRequire(require("crc"));

var contains = _interopRequire(require("lodash/includes"));

var isUndefined = _interopRequire(require("lodash/isUndefined"));

var isNull = _interopRequire(require("lodash/isNull"));

var isString = _interopRequire(require("lodash/isString"));

var versionBytes = {
  ed25519PublicKey: 6 << 3, // G
  ed25519SecretSeed: 18 << 3, // S
  preAuthTx: 19 << 3, // T
  sha256Hash: 23 << 3 // X
};

/**
 * StrKey is a helper class that allows encoding and decoding strkey.
 */

var StrKey = exports.StrKey = (function () {
  function StrKey() {
    _classCallCheck(this, StrKey);
  }

  _createClass(StrKey, null, {
    encodeEd25519PublicKey: {
      /**
       * Encodes data to strkey ed25519 public key.
       * @param {Buffer} data data to encode
       * @returns {string}
       */

      value: function encodeEd25519PublicKey(data) {
        return encodeCheck("ed25519PublicKey", data);
      }
    },
    decodeEd25519PublicKey: {

      /**
       * Decodes strkey ed25519 public key to raw data.
       * @param {string} data data to decode
       * @returns {Buffer}
       */

      value: function decodeEd25519PublicKey(data) {
        return decodeCheck("ed25519PublicKey", data);
      }
    },
    isValidEd25519PublicKey: {

      /**
       * Returns true if the given Stellar public key is a valid ed25519 public key.
       * @param {string} publicKey public key to check
       * @returns {boolean}
       */

      value: function isValidEd25519PublicKey(publicKey) {
        return isValid("ed25519PublicKey", publicKey);
      }
    },
    encodeEd25519SecretSeed: {

      /**
       * Encodes data to strkey ed25519 seed.
       * @param {Buffer} data data to encode
       * @returns {string}
       */

      value: function encodeEd25519SecretSeed(data) {
        return encodeCheck("ed25519SecretSeed", data);
      }
    },
    decodeEd25519SecretSeed: {

      /**
       * Decodes strkey ed25519 seed to raw data.
       * @param {string} data data to decode
       * @returns {Buffer}
       */

      value: function decodeEd25519SecretSeed(data) {
        return decodeCheck("ed25519SecretSeed", data);
      }
    },
    isValidEd25519SecretSeed: {

      /**
       * Returns true if the given Stellar secret key is a valid ed25519 secret seed.
       * @param {string} seed seed to check
       * @returns {boolean}
       */

      value: function isValidEd25519SecretSeed(seed) {
        return isValid("ed25519SecretSeed", seed);
      }
    },
    encodePreAuthTx: {

      /**
       * Encodes data to strkey preAuthTx.
       * @param {Buffer} data data to encode
       * @returns {string}
       */

      value: function encodePreAuthTx(data) {
        return encodeCheck("preAuthTx", data);
      }
    },
    decodePreAuthTx: {

      /**
       * Decodes strkey PreAuthTx to raw data.
       * @param {string} data data to decode
       * @returns {Buffer}
       */

      value: function decodePreAuthTx(data) {
        return decodeCheck("preAuthTx", data);
      }
    },
    encodeSha256Hash: {

      /**
       * Encodes data to strkey sha256 hash.
       * @param {Buffer} data data to encode
       * @returns {string}
       */

      value: function encodeSha256Hash(data) {
        return encodeCheck("sha256Hash", data);
      }
    },
    decodeSha256Hash: {

      /**
       * Decodes strkey sha256 hash to raw data.
       * @param {string} data data to decode
       * @returns {Buffer}
       */

      value: function decodeSha256Hash(data) {
        return decodeCheck("sha256Hash", data);
      }
    }
  });

  return StrKey;
})();

function isValid(versionByteName, encoded) {
  if (encoded && encoded.length != 56) {
    return false;
  }

  try {
    var decoded = decodeCheck(versionByteName, encoded);
    if (decoded.length !== 32) {
      return false;
    }
  } catch (err) {
    return false;
  }
  return true;
}

function decodeCheck(versionByteName, encoded) {
  if (!isString(encoded)) {
    throw new TypeError("encoded argument must be of type String");
  }

  var decoded = base32.decode(encoded);
  var versionByte = decoded[0];
  var payload = decoded.slice(0, -2);
  var data = payload.slice(1);
  var checksum = decoded.slice(-2);

  if (encoded != base32.encode(decoded)) {
    throw new Error("invalid encoded string");
  }

  var expectedVersion = versionBytes[versionByteName];

  if (isUndefined(expectedVersion)) {
    throw new Error("" + versionByteName + " is not a valid version byte name.  expected one of \"accountId\" or \"seed\"");
  }

  if (versionByte !== expectedVersion) {
    throw new Error("invalid version byte. expected " + expectedVersion + ", got " + versionByte);
  }

  var expectedChecksum = calculateChecksum(payload);

  if (!verifyChecksum(expectedChecksum, checksum)) {
    throw new Error("invalid checksum");
  }

  return new Buffer(data);
}

function encodeCheck(versionByteName, data) {
  if (isNull(data) || isUndefined(data)) {
    throw new Error("cannot encode null data");
  }

  var versionByte = versionBytes[versionByteName];

  if (isUndefined(versionByte)) {
    throw new Error("" + versionByteName + " is not a valid version byte name.  expected one of \"ed25519PublicKey\", \"ed25519SecretSeed\", \"preAuthTx\", \"sha256Hash\"");
  }

  data = new Buffer(data);
  var versionBuffer = new Buffer([versionByte]);
  var payload = Buffer.concat([versionBuffer, data]);
  var checksum = calculateChecksum(payload);
  var unencoded = Buffer.concat([payload, checksum]);

  return base32.encode(unencoded);
}

function calculateChecksum(payload) {
  // This code calculates CRC16-XModem checksum of payload
  // and returns it as Buffer in little-endian order.
  var checksum = new Buffer(2);
  checksum.writeUInt16LE(crc.crc16xmodem(payload), 0);
  return checksum;
}

function verifyChecksum(expected, actual) {
  if (expected.length !== actual.length) {
    return false;
  }

  if (expected.length === 0) {
    return true;
  }

  for (var i = 0; i < expected.length; i++) {
    if (expected[i] !== actual[i]) {
      return false;
    }
  }

  return true;
}