// if (!window.Promise) window.Promise = require('promise-polyfill');
var _map = require('lodash.map');
var _isEmpty = require('lodash.isempty');
var _uniq = require('lodash.uniq');
var _find = require('lodash.find');
var _filter = require('lodash.filter');
var m = require('mithril');
var fx = require('money');
var store = require('store');
var ComItem = require('./item');
var urlRatesTable = '//openexchangerates.org/api/latest.json?app_id=412c7ea5a585496ca593e6697ce22d9a';
var urlCurrencyNames = '//openexchangerates.org/api/currencies.json';
var initial_list = ['USD', 'EUR', 'GBP'];

function isLocalStorageAvailable() {
  var test = '__test__';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

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

  read: function () {
    var firstCurrency;
    var col = store.get('collection');
    App.collection = _map(!_isEmpty(col) ? col : initial_list, function (item, index) {
      if (!index) firstCurrency = item;
      return {
        amount: prop(fx(1).from(firstCurrency).to(item)),
        currency: prop(item, App.write)
      };
    });
    App.last_from_index = 0;
  },

  write: function () {
    store.set('collection', _map(App.collection, function (item) {
      return item.currency();
    }));
  },

  addItem: function () {
    var lastFrom = App.collection[App.last_from_index];
    App.collection.push({
      amount: prop(fx(lastFrom ? lastFrom.amount() : 1).from(lastFrom ? lastFrom.currency() : App.default_currency).to(App.default_currency)),
      currency: prop(App.default_currency, App.write)
    });
    process.nextTick(App.write);
  },

  removeItem: function (index) {
    App.collection.splice(index, 1);
    process.nextTick(App.write);
  },

  getName: function (symbol) {
    return App.currencies[symbol] || 'Unknown';
  },

  updateRatesTable: function (force) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var aProms = [], oRates, oNames, bUpdate = false;
      if (isLocalStorageAvailable()) {
        oRates = JSON.parse(localStorage.getItem('rates'));
        oNames = JSON.parse(localStorage.getItem('names'));
      }
      if (oRates && !force) {
        aProms.push(Promise.resolve(oRates));
        bUpdate = true;
      } else {
        aProms.push(m.request({ url: urlRatesTable }));
      }
      aProms.push(oNames && !force ? Promise.resolve(oNames) : m.request({ url: urlCurrencyNames }));
      Promise.all(aProms)
        .then(function (results) {
          fx.rates = results[0].rates;
          fx.base = results[0].base;
          App.currencies = results[1];
          if (isLocalStorageAvailable()) {
            localStorage.setItem('rates', JSON.stringify(results[0]));
            localStorage.setItem('names', JSON.stringify(results[1]));
          }
          if (bUpdate) {
            setTimeout(function () {
              self.updateRatesTable(true)
            }, 1000);
          }
          App.default_currency = fx.base;
          App.read();
          resolve(results);
        })
        .catch(reject);
    });
  },

  convert: function (amount, from, to) {
    if (!(to instanceof Array)) to = [to];
    to = _uniq(to);
    var result = _map(to, function (symbol) {
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

  changeAmount: function (e, index) {
    var item = App.collection[index];
    var to = _map(_filter(App.collection, function (n, i) {
      return i !== index;
    }), function (m) {
      return m.currency();
    });
    App.convert(item.amount(), item.currency(), to);
    App.last_from_index = index;
  },

  changeCurrency: function (e) {
    App.changeAmount(e, App.last_from_index);
  }

};

window.onload = function () {
  App.updateRatesTable()
    .then(function () {
      m.mount(document.getElementById('root'), {
        view: function () {
          return m('div#converter', {
            class: 'pure-form'
          },
            m('ul',
              _map(App.collection, function (item, index) {
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
    });
};
