webpackJsonp([0],{

/***/ 11:
/* unknown exports provided */
/* all exports used */
/*!**************************!*\
  !*** ./~/money/money.js ***!
  \**************************/
/***/ (function(module, exports, __webpack_require__) {

/*!
 * money.js / fx() v0.2
 * Copyright 2014 Open Exchange Rates
 *
 * JavaScript library for realtime currency conversion and exchange rate calculation.
 *
 * Freely distributable under the MIT license.
 * Portions of money.js are inspired by or borrowed from underscore.js
 *
 * For details, examples and documentation:
 * http://openexchangerates.github.io/money.js/
 */
(function(root, undefined) {

	// Create a safe reference to the money.js object for use below.
	var fx = function(obj) {
		return new fxWrapper(obj);
	};

	// Current version.
	fx.version = '0.2';


	/* --- Setup --- */

	// fxSetup can be defined before loading money.js, to set the exchange rates and the base
	// (and default from/to) currencies - or the rates can be loaded in later if needed.
	var fxSetup = root.fxSetup || {
		rates : {},
		base : ""
	};

	// Object containing exchange rates relative to the fx.base currency, eg { "GBP" : "0.64" }
	fx.rates = fxSetup.rates;

	// Default exchange rate base currency (eg "USD"), which all the exchange rates are relative to
	fx.base = fxSetup.base;

	// Default from / to currencies for conversion via fx.convert():
	fx.settings = {
		from : fxSetup.from || fx.base,
		to : fxSetup.to || fx.base
	};


	/* --- Conversion --- */

	// The base function of the library: converts a value from one currency to another
	var convert = fx.convert = function(val, opts) {
		// Convert arrays recursively
		if (typeof val === 'object' && val.length) {
			for (var i = 0; i< val.length; i++ ) {
				val[i] = convert(val[i], opts);
			}
			return val;
		}

		// Make sure we gots some opts
		opts = opts || {};

		// We need to know the `from` and `to` currencies
		if( !opts.from ) opts.from = fx.settings.from;
		if( !opts.to ) opts.to = fx.settings.to;

		// Multiple the value by the exchange rate
		return val * getRate( opts.to, opts.from );
	};

	// Returns the exchange rate to `target` currency from `base` currency
	var getRate = function(to, from) {
		// Save bytes in minified version
		var rates = fx.rates;

		// Make sure the base rate is in the rates object:
		rates[fx.base] = 1;

		// Throw an error if either rate isn't in the rates array
		if ( !rates[to] || !rates[from] ) throw "fx error";

		// If `from` currency === fx.base, return the basic exchange rate for the `to` currency
		if ( from === fx.base ) {
			return rates[to];
		}

		// If `to` currency === fx.base, return the basic inverse rate of the `from` currency
		if ( to === fx.base ) {
			return 1 / rates[from];
		}

		// Otherwise, return the `to` rate multipled by the inverse of the `from` rate to get the
		// relative exchange rate between the two currencies
		return rates[to] * (1 / rates[from]);
	};


	/* --- OOP wrapper and chaining --- */

	// If fx(val) is called as a function, it returns a wrapped object that can be used OO-style
	var fxWrapper = function(val) {
		// Experimental: parse strings to pull out currency code and value:
		if ( typeof	val === "string" ) {
			this._v = parseFloat(val.replace(/[^0-9-.]/g, ""));
			this._fx = val.replace(/([^A-Za-z])/g, "");
		} else {
			this._v = val;
		}
	};

	// Expose `wrapper.prototype` as `fx.prototype`
	var fxProto = fx.prototype = fxWrapper.prototype;

	// fx(val).convert(opts) does the same thing as fx.convert(val, opts)
	fxProto.convert = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(this._v);
		return convert.apply(fx, args);
	};

	// fx(val).from(currency) returns a wrapped `fx` where the value has been converted from
	// `currency` to the `fx.base` currency. Should be followed by `.to(otherCurrency)`
	fxProto.from = function(currency) {
		var wrapped = fx(convert(this._v, {from: currency, to: fx.base}));
		wrapped._fx = fx.base;
		return wrapped;
	};

	// fx(val).to(currency) returns the value, converted from `fx.base` to `currency`
	fxProto.to = function(currency) {
		return convert(this._v, {from: this._fx ? this._fx : fx.settings.from, to: currency});
	};


	/* --- Module Definition --- */

	// Export the fx object for CommonJS. If being loaded as an AMD module, define it as such.
	// Otherwise, just add `fx` to the global object
	if (true) {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = fx;
		}
		exports.fx = fx;
	} else if (typeof define === 'function' && define.amd) {
		// Return the library as an AMD module:
		define([], function() {
			return fx;
		});
	} else {
		// Use fx.noConflict to restore `fx` back to its original value before money.js loaded.
		// Returns a reference to the library's `fx` object; e.g. `var money = fx.noConflict();`
		fx.noConflict = (function(previousFx) {
			return function() {
				// Reset the value of the root's `fx` variable:
				root.fx = previousFx;
				// Delete the noConflict function:
				fx.noConflict = undefined;
				// Return reference to the library to re-assign it:
				return fx;
			};
		})(root.fx);

		// Declare `fx` on the root (global/window) object:
		root['fx'] = fx;
	}

	// Root will be `window` in browser or `global` on the server:
}(this));


/***/ }),

/***/ 24:
/* unknown exports provided */
/* all exports used */
/*!**********************!*\
  !*** ./app/index.js ***!
  \**********************/
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var $ = __webpack_require__(/*! jquery */ 5);
var _ = __webpack_require__(/*! lodash */ 2);
var m = __webpack_require__(/*! mithril */ 3);
var fx = __webpack_require__(/*! money */ 11);
var store = __webpack_require__(/*! store */ 6);
var ComItem = __webpack_require__(/*! ./item */ 9);
var urlRatesTable = '//openexchangerates.org/api/latest.json?app_id=412c7ea5a585496ca593e6697ce22d9a';
var urlCurrencyNames = '//openexchangerates.org/api/currencies.json';

function prop(val, callback) {
	var data = val;

	function _prop() {
		if (arguments.length) {
			data = arguments[0];
			if (callback) process.nextTick(callback, data);
		} else {
			return data;
		}
	}
	return _prop;
}

window.App = {
	default_currency: null,
	currencies: null,
	collection: null,
	last_from_index: null,

	read: function() {
		var firstCurrency;
		App.collection = _.map(store.get('collection') || [], function(item, index) {
			if (!index) firstCurrency = item;
			return {
				amount: prop(fx(1).from(firstCurrency).to(item)),
				currency: prop(item, App.write)
			};
		});
		App.last_from_index = 0;
	},

	write: function() {
		store.set('collection', _.map(App.collection, function(item) {
			return item.currency();
		}));
	},

	addItem: function() {
		var lastFrom = App.collection[App.last_from_index];
		App.collection.push({
			amount: prop(fx(lastFrom.amount()).from(lastFrom.currency()).to(App.default_currency)),
			currency: prop(App.default_currency, App.write)
		});
		process.nextTick(App.write);
	},

	removeItem: function(index) {
		App.collection.splice(index, 1);
		process.nextTick(App.write);
	},

	getName: function(symbol) {
		return App.currencies[symbol] || 'Unknown';
	},

	updateRatesTable: function() {
		return Promise.all([
			new Promise(function(resolve, reject) {
				$.ajax({
					url: urlRatesTable,
					dataType: 'json',
					success: function(data) {
						fx.rates = data.rates;
						fx.base = data.base;
						resolve();
					},
					error: reject
				});
			}),
			new Promise(function(resolve, reject) {
				$.ajax({
					url: urlCurrencyNames,
					dataType: 'json',
					success: function(data) {
						App.currencies = data;
						resolve();
					},
					error: reject
				});
			})
		]);
	},

	convert: function(amount, from, to) {
		if (!(to instanceof Array)) to = [to];
		to = _.uniq(to);
		var result = _.map(to, function(symbol) {
			return {
				currency: symbol,
				amount: fx(amount).from(from).to(symbol)
			};
		});
		var item, found;
		for (var i = App.collection.length - 1; i >= 0; i--) {
			item = App.collection[i];
			found = _.find(result, ['currency', item.currency()]);
			if (found) {
				item.amount(found.amount);
			}
		}
	},

	// EVENTS

	changeAmount: function(e, index) {
		var item = App.collection[index];
		var to = _.map(_.filter(App.collection, function(n, i) {
			return i !== index;
		}), function(m) {
			return m.currency();
		});
		App.convert(item.amount(), item.currency(), to);
		App.last_from_index = index;
	},

	changeCurrency: function(e) {
		App.changeAmount(e, App.last_from_index);
	}

};

function init(callback) {
	App.default_currency = fx.base;
	App.read();
	process.nextTick(callback);
}

window.onload = function() {
	App.updateRatesTable()
		.then(function() {
			init(function(err) {
				if (!err) {
					m.mount(document.getElementById('root'), {
						view: function() {
							// console.info('Redraw');
							return m('div',
								m('table',
									_.map(App.collection, function(item, index) {
										return m(ComItem, {
											index: index,
											amount: item.amount,
											currency: item.currency,
											onchangeamount: App.changeAmount,
											onchangecurrency: App.changeCurrency
										});
									})
								),
								m('button', 'Convert'),
								m('button', {
									onclick: App.addItem
								}, 'Add')
							);
						}
					});
				}
			});
		});
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./../~/process/browser.js */ 4)))

/***/ }),

/***/ 9:
/* unknown exports provided */
/* all exports used */
/*!*********************!*\
  !*** ./app/item.js ***!
  \*********************/
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(/*! lodash */ 2);
var m = __webpack_require__(/*! mithril */ 3);
var numeral = __webpack_require__(/*! numeral */ 7);

module.exports = {
	view: function(node) {
		return m('tr',
			m('td',
				m('input', {
					type: 'text',
					value: numeral(node.attrs.amount()).format('0,0.00'),
					onchange: function(e) {
						node.attrs.amount(this.value);
						node.attrs.onchangeamount(e, node.attrs.index);
					}
				})
			),
			m('td',
				m('select', {
						value: node.attrs.currency(),
						onchange: function(e) {
							// m.withAttr('value', node.attrs.currency)
							node.attrs.currency(this.value);
							node.attrs.onchangecurrency(e, node.attrs.index);
						}
					},
					_.map(App.currencies, function(name, symbol) {
						return m('option', {
							value: symbol
						}, name + ' (' + symbol + ')');
					})
				)
			),
			m('td',
				m('button', {
					onclick: function() {
						App.removeItem(node.attrs.index);
					}
				}, 'X')
			)
		);
	}
};


/***/ })

},[24]);