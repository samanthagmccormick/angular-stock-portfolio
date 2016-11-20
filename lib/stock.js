(function () {
   'use strict';
}());

/*
 * The basic building blocks of the market which can be bought and sold by investors
 * at a price that changes over time based on a simulated trading function.
 */
var Stock = function (symbol, price, quantity, growthRate, changeInterval, volatilityPercent) {
  this.symbol = symbol;
  this.price = price;
  this.quantity = quantity;
  this.growthRate = growthRate;
  this.changeInterval = changeInterval;
  this.volatilityPercent = volatilityPercent;
  this.tradeHistory = {prices: [], timestamps: []}; // configured
  this.activeQuotes = {}; // configured
  this.isTrading = false; // configured
  this.nextQuoteId = 0; // configured
};

// Stock.startTrading() makes sure this.isTrading = false
// then simulate trading over time with that stock price
Stock.prototype.startTrading = function() {
  var stock = this;
  if (!this.isTrading) {
    this.isTrading = true;
    // TODO might have to investigate what this does exactly
    return setInterval(simulateTrading.bind(null, stock), this.changeInterval);
  }
};

// Stock.stoptrading() makes sure this.isTrading = true,
// sets it to false, then cancels the setInterval you had set
Stock.prototype.stopTrading = function(trading) {
  if (this.isTrading) {
    this.isTrading = false;
    clearInterval(trading);
  }
};

/*
 * Quotes are point in time price guarantees of a stock that are valid for 30 seconds.
 * Investors may buy and sell stocks at a given quote price as long as it is still valid.
 */

// LASTS 30 SECONDS
// Stock.quote() grabs the price from the constructor, and stores it as the activeQuotes[0] for 30 seconds.
// returns quoteId (shows you which iteration of a quote you've generated)
Stock.prototype.quote = function() {
  var stock = this;
  var quoteId = this.nextQuoteId; // start at 0

  // stores price (from constructor) into activeQuotes
  this.activeQuotes[quoteId] = this.price;
  this.nextQuoteId++;
  // after 30 seconds delete the price from activeQuotes array
  setTimeout(function() {
    delete this.activeQuotes[quoteId];
  }, 30000);

  return quoteId;
};

/*
 * Private method that mimics the natural change of a stock price over time by
 * a small random percentage (+/- volatilityPercent) from its current growthRate
 */
function simulateTrading(stock) {
  var randomChange = (Math.random() * stock.volatilityPercent * 2 - stock.volatilityPercent) / 100;
  stock.price = stock.price * (stock.growthRate + randomChange);
  stock.tradeHistory.prices.push(stock.price);
  stock.tradeHistory.timestamps.push(new Date());
}

module.exports = Stock;
