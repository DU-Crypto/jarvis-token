"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
	value: true
});

var hash = require("./hashing").hash;

/**
 * Contains passphrases for common networks:
 * * `Networks.PUBLIC`: `Public Global Stellar Network ; September 2015`
 * * `Networks.TESTNET`: `Test SDF Network ; September 2015`
 * @type {{PUBLIC: string, TESTNET: string}}
 */
var Networks = {
	PUBLIC: "Public Global Stellar Network ; September 2015",
	TESTNET: "Test SDF Network ; September 2015"
};

exports.Networks = Networks;
var current = null;

/**
 * The Network class provides helper methods to get the passphrase or id for different
 * stellar networks.  It also provides the {@link Network.current} class method that returns the network
 * that will be used by this process for the purposes of generating signatures.
 *
 * You should select network your app will use before adding the first signature. You can use the `use`,
 * `usePublicNetwork` and `useTestNetwork` helper methods.
 *
 * Creates a new `Network` object.
 * @constructor
 * @param {string} networkPassphrase Network passphrase
 */

var Network = exports.Network = (function () {
	function Network(networkPassphrase) {
		_classCallCheck(this, Network);

		this._networkPassphrase = networkPassphrase;
	}

	_createClass(Network, {
		networkPassphrase: {

			/**
    * Returns network passphrase.
    * @returns {string}
    */

			value: function networkPassphrase() {
				return this._networkPassphrase;
			}
		},
		networkId: {

			/**
    * Returns Network ID. Network ID is SHA-256 hash of network passphrase.
    * @returns {string}
    */

			value: function networkId() {
				return hash(this.networkPassphrase());
			}
		}
	}, {
		usePublicNetwork: {

			/**
    * Use Stellar Public Network
    */

			value: function usePublicNetwork() {
				this.use(new Network(Networks.PUBLIC));
			}
		},
		useTestNetwork: {

			/**
    * Use test network.
    */

			value: function useTestNetwork() {
				this.use(new Network(Networks.TESTNET));
			}
		},
		use: {

			/**
    * Use network defined by Network object.
    * @param {Network} network Network to use
    */

			value: function use(network) {
				current = network;
			}
		},
		current: {

			/**
    * Returns currently selected network.
    * @returns {Network}
    */

			value: (function (_current) {
				var _currentWrapper = function current() {
					return _current.apply(this, arguments);
				};

				_currentWrapper.toString = function () {
					return _current.toString();
				};

				return _currentWrapper;
			})(function () {
				return current;
			})
		}
	});

	return Network;
})();