var _ = require('lodash');
var m = require('mithril');

module.exports = {
	view: function(node) {
		return m('tr',
			m('td',
				m('input', {
					type: 'text',
					value: node.attrs.amount(),
					onchange: function(e) {
						node.attrs.amount(this.value);
						node.attrs.onchangeamount(e, node.attrs.index);
					}
				})
			),
			m('td',
				m('select', {
						value: node.attrs.currency(),
						onchange: m.withAttr('value', node.attrs.currency)
					},
					_.map(App.currencies, function(item) {
						return m('option', {
							value: item.value
						}, item.text);
					})
				)
			),
			m('td',
				m('button', {
					onclick: function() {
						App.remove(node.attrs.index);
					}
				}, 'X')
			)
		);
	}
};
