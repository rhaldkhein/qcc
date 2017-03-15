var _ = require('lodash');
var m = require('mithril');
var numeral = require('numeral');

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
					class: 'pure-button',
					onclick: function() {
						App.removeItem(node.attrs.index);
					}
				}, 'X')
			)
		);
	}
};
