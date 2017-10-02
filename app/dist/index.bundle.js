webpackJsonp([0],{

/***/ 15:
/* unknown exports provided */
/* all exports used */
/*!*********************!*\
  !*** ./app/item.js ***!
  \*********************/
/***/ (function(module, exports, __webpack_require__) {

var _map = __webpack_require__(/*! lodash.map */ 2);
var m = __webpack_require__(/*! mithril */ 3);
var numeral = __webpack_require__(/*! numeral */ 12);

module.exports = {
	view: function(node) {
		return m('li',
			m('span',
				m('input', {
					type: 'text',
					value: numeral(node.attrs.amount()).format('0 0.00'),
					onchange: function(e) {
						node.attrs.amount(this.value);
						node.attrs.onchangeamount(e, node.attrs.index);
					}
				})
			),
			m('span',
				m('select', {
						value: node.attrs.currency(),
						onchange: function(e) {
							node.attrs.currency(this.value);
							node.attrs.onchangecurrency(e, node.attrs.index);
						}
					},
					_map(App.currencies, function(name, symbol) {
						return m('option', {
							value: symbol
						}, name + ' (' + symbol + ')');
					})
				)
			),
			m('span',
				m('span',
					m('button', {
						class: 'pure-button',
						onclick: function() {
							App.removeItem(node.attrs.index);
						}
					}, 'X')
				)
			)
		);
	}
};


/***/ }),

/***/ 27:
/* unknown exports provided */
/* all exports used */
/*!**********************!*\
  !*** ./app/index.js ***!
  \**********************/
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {if (!window.Promise) window.Promise = __webpack_require__(/*! promise-polyfill */ 10);
var _map = __webpack_require__(/*! lodash.map */ 2);
var _isEmpty = __webpack_require__(/*! lodash.isempty */ 7);
var _uniq = __webpack_require__(/*! lodash.uniq */ 8);
var _find = __webpack_require__(/*! lodash.find */ 6);
var _filter = __webpack_require__(/*! lodash.filter */ 5);
var m = __webpack_require__(/*! mithril */ 3);
var fx = __webpack_require__(/*! money */ 9);
var store = __webpack_require__(/*! store */ 11);
var ComItem = __webpack_require__(/*! ./item */ 15);
var urlRatesTable = '//openexchangerates.org/api/latest.json?app_id=412c7ea5a585496ca593e6697ce22d9a';
var urlCurrencyNames = '//openexchangerates.org/api/currencies.json';
var initial_list = ['USD', 'EUR', 'GBP'];

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
		var col = store.get('collection');
		App.collection = _map(!_isEmpty(col) ? col : initial_list, function(item, index) {
			if (!index) firstCurrency = item;
			return {
				amount: prop(fx(1).from(firstCurrency).to(item)),
				currency: prop(item, App.write)
			};
		});
		App.last_from_index = 0;
	},

	write: function() {
		store.set('collection', _map(App.collection, function(item) {
			return item.currency();
		}));
	},

	addItem: function() {
		var lastFrom = App.collection[App.last_from_index];
		App.collection.push({
			amount: prop(fx(lastFrom ? lastFrom.amount() : 1).from(lastFrom ? lastFrom.currency() : App.default_currency).to(App.default_currency)),
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
			m.request({
				url: urlRatesTable
			}).then(function(data) {
				fx.rates = data.rates;
				fx.base = data.base;
				return data;
			}),
			m.request({
				url: urlCurrencyNames
			}).then(function(data) {
				App.currencies = data;
				return data;
			})
		]);
	},

	convert: function(amount, from, to) {
		if (!(to instanceof Array)) to = [to];
		to = _uniq(to);
		var result = _map(to, function(symbol) {
			return {
				currency: symbol,
				amount: fx(amount).from(from).to(symbol)
			};
		});
		var item, found;
		for (var i = App.collection.length - 1; i >= 0; i--) {
			item = App.collection[i];
			found = _find(result, ['currency', item.currency()]);
			if (found) {
				item.amount(found.amount);
			}
		}
	},

	// EVENTS

	changeAmount: function(e, index) {
		var item = App.collection[index];
		var to = _map(_filter(App.collection, function(n, i) {
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
							return m('div#converter', {
									class: 'pure-form'
								},
								m('ul',
									_map(App.collection, function(item, index) {
										return m(ComItem, {
											index: index,
											amount: item.amount,
											currency: item.currency,
											onchangeamount: App.changeAmount,
											onchangecurrency: App.changeCurrency
										});
									})
								),
								m('button', {
									class: 'pure-button pure-button-primary'
								}, 'Convert'),
								m('button', {
									class: 'pure-button',
									onclick: App.addItem
								}, 'Add')
							);
						}
					});
				}
			});
		});
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./../~/process/browser.js */ 13)))

/***/ })

},[27]);