var _map = require('lodash.map');
var m = require('mithril');
var numeral = require('numeral');

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
