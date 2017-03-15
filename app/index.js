var $ = require('jquery');
var _ = require('lodash');
var m = require('mithril');
var fx = require('money');
var store = require('store');
var ComItem = require('./item');
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
