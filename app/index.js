var $ = require('jquery');
var _ = require('lodash');
var m = require('mithril');
var async = require('async');
var store = require('store');
var ComItem = require('./item');
var url = 'https://www.google.com/finance/converter';

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
	currencies: [],
	collection: null,
	read: function() {
		App.collection = _.map(store.get('collection') || [], function(item) {
			return {
				amount: prop(0),
				currency: prop(item, App.write)
			};
		});
	},
	write: function() {
		store.set('collection', _.map(App.collection, function(item) {
			return item.currency();
		}));
	},
	add: function() {
		App.collection.push({
			amount: prop(0),
			currency: prop(App.default_currency.value, App.write)
		});
		process.nextTick(App.write);
	},
	remove: function(index) {
		App.collection.splice(index, 1);
		process.nextTick(App.write);
	},
	changeAmount: function(e, index) {
		var item = App.collection[index];
		var to = _.map(_.filter(App.collection, function(n, i) {
			return i !== index;
		}), function(m) {
			return m.currency();
		});
		App.convert(item.amount(), item.currency(), to);
	},
	convert: function(amount, from, to) {
		if (!(to instanceof Array)) to = [to];
		to = _.uniq(to);
		async.mapSeries(to, function(curr, done) {
			$.ajax({
				url: url,
				data: {
					a: amount,
					from: from,
					to: curr
				},
				success: function(data) {
					done(null, {
						currency: curr,
						amount: $(data).find('#currency_converter_result span.bld').text() || amount
					});
				},
				error: done
			});
		}, function(err, result) {
			var item, found;
			for (var i = App.collection.length - 1; i >= 0; i--) {
				item = App.collection[i];
				found = _.find(result, ['currency', item.currency()]);
				if (found) {
					item.amount(parseFloat(found.amount));
				}
			}
			m.redraw();
		});
	}
};

function init(data, callback) {
	$(data).find('select[name="from"] option').each(function(index, item) {
		item = $(item);
		App.currencies.push({
			value: item.val(),
			text: item.text()
		});
	});
	App.default_currency = App.currencies[0];
	App.read();
	process.nextTick(callback);
}

window.onload = function() {
	$.ajax({
		url: url,
		success: function(data) {
			init(data, function(err) {
				if (!err) {
					m.mount(document.getElementById('root'), {
						view: function() {
							return m('div',
								m('table',
									_.map(App.collection, function(item, index) {
										return m(ComItem, {
											index: index,
											amount: item.amount,
											currency: item.currency,
											onchangeamount: App.changeAmount
										});
									})
								),
								m('button', 'Convert'),
								m('button', {
									onclick: App.add
								}, 'Add')
							);
						}
					});
				}
			});
		}
	});
};
