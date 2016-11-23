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

  console.log('open');

  this.stocks.forEach(function(stock) {

    console.log('start trading');
    // tradingStocks[] is an array of stocks + simulated stock prices over time.
    market.tradingStocks[stock.symbol] = stock.startTrading();
  });
};

// on Market.close(), loop through the stocks and stop trading on them
Market.prototype.close = function() {
  var market = this;
  this.isOpen = false;

  console.log('close');

  this.stocks.forEach(function(stock) {
    console.log('stop trading');
    // Fixed this because it wasn't right
    stock.stopTrading(stock.isTrading);
  });
};

// on Market.buy(), remove the stock from the quantity and invalidate quote
// update investor $$ and record stock transaction
Market.prototype.buy = function(investorId, symbol, quoteId, quantity) {

  console.log('quantity: ' + quantity);

    // get the index of this stock's symbol
    var i = this.stocks.map(function(stock) { return stock.symbol; }).indexOf(symbol);

    console.log(i);

    var stock = this.stocks[i];

    // check if there is an active quote stored

    console.log(quoteId);

    // check if quote # exists in the activeQuotes array
    var isValidQuote = stock.activeQuotes[quoteId];

    console.log(isValidQuote);

    var transactionTotal;
    // if stock market is open and quote is valid....
    if (this.isOpen && isValidQuote) {
      // update quantity of stock's shares
      this.stocks[i].quantity = this.stocks[i].quantity - quantity;
      console.log('NEW quantity: ' + this.stocks[i].quantity);

      // calculate transaction total
      transactionTotal = this.stocks[i].activeQuotes[quoteId] * quantity;
      console.log('transaction TOTAL: ' + transactionTotal);

      // TODO replace with underscore .filter() (requireJS)
      function search(nameKey, myArray){
          for (var i=0; i < myArray.length; i++) {
              if (myArray[i].investorId === nameKey) {
                  return i;
              }
          }
      }

      var investorIndex = search(parseInt(investorId), this.investors);

      // update investor capital
      this.investors[investorIndex].capital = this.investors[investorIndex].capital - transactionTotal;
      console.log('new capital: ' + this.investors[investorIndex].capital);

      // record stock transaction for investor
      this.investors[investorIndex].transactions.push({
        symbol: symbol,
        quantity: quantity,
        transactionTotal: transactionTotal,
        timestamp: new Date()
      })

      console.log(this.investors[investorIndex].transactions);

    }

    // THIS PRINTS IN TERMINAL!!!!
    console.log('buy completed');
};

module.exports = Market;
