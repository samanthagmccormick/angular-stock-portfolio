(function () {
   'use strict';
}());

/*
 * The market is the place where investors can buy and sell stocks ONLY when the market is open.
 */

var Market = function (stocks, investors) {
  var self = this;
  this.stocks = stocks;
  this.investors = investors;
  this.isOpen = false; // configured
  this.tradingStocks = {}; // configured
};

// on Market.open(), loop through the stock symbols and store each stock trade history in tradingStocks[]
Market.prototype.open = function() {
  var market = this;
  this.isOpen = true;
  this.stocks.forEach(function(stock) {
    // tradingStocks[] is an array of stocks + simulated stock prices over time.
    market.tradingStocks[stock.symbol] = stock.startTrading();
  });
};

// on Market.close(), loop through the stocks and stop trading on them
Market.prototype.close = function() {
  var market = this;
  this.isOpen = false;
  this.stocks.forEach(function(stock) {
    // FIXME should this be stock.stopTrading?
    market.stopTrading(this.tradingStocks[stock.symbol]);
  });
};

// on Market.buy(), remove the stock from the quantity and invalidate quote
// update investor $$ and record stock transaction
Market.prototype.buy = function(investorId, symbol, quoteId, quantity) {
    // loop over each stock in this.stocks[], return stock symbol and get the index of it
    var i = this.stocks.map(function(stock) { return stock.symbol; }).indexOf(symbol);
    var stock = this.stocks[i];
    // check if the stock's quote is VALID
    var isValidQuote = stock.activeQuotes[quoteId];

    // if stock market is open and quote is valid....
    if (this.isOpen && isValidQuote) {
      //ToDo: update stock quantity and invalidate quote
      //ToDo: update investor capital and record stock transaction
    }
};

module.exports = Market;
