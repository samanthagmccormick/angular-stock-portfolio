'use strict';

/*
 * The market is the place where investors can buy and sell stocks ONLY when the market is open.
 */

var Market = function (stocks, investors) {
  var self = this;
  this.stocks = stocks;
  this.investors = investors;
  this.isOpen = false;
  this.tradingStocks = {};
};

Market.prototype.open = function() {
  var market = this;
  this.isOpen = true;
  this.stocks.forEach(function(stock) {
    market.tradingStocks[stock.symbol] = stock.startTrading();
  });
};

Market.prototype.close = function() {
  var market = this;
  this.isOpen = false;
  this.stocks.forEach(function(stock) {
    market.stopTrading(this.tradingStocks[stock.symbol]);
  });
};

Market.prototype.buy = function(investorId, symbol, quoteId, quantity) {
    var i = this.stocks.map(function(stock) { return stock.symbol; }).indexOf(symbol);
    var stock = this.stocks[i];
    var isValidQuote = stock.activeQuotes[quoteId];

    if (this.isOpen && isValidQuote) {
      //ToDo: update stock quantity and invalidate quote
      //ToDo: update investor capital and record stock transaction
    }
};

module.exports = Market;
