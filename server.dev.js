'use strict';

var express = require('express');
var app = express();

/* Basic building blocks for the stock market backend */
var Stock = require('./lib/stock');
var Investor = require('./lib/investor');
var Market = require('./lib/market');

/* Gather input from node command line params */
var stockType = process.argv[2];
var investorGroup = process.argv[3];

/* Pre-defined stock market configurations */
var createStocks = function() {
  var ntap = new Stock('NTAP', 26.31, 4000, 1.0017, 6000, 1.03);
  var goog = new Stock('GOOG', 726.65, 5000, 0.9995, 5000, 0.46);

  switch(stockType) {
    case('tech'):
      console.log('Loading Tech Stocks into the market...');
      return [ntap, goog];
    default:
      return [ntap];
  }
};

var createInvestors = function() {
  var user = new Investor(1, 'User', 5);
  var dan = new Investor(2, 'Dan', 150000);
  var rich = new Investor(3, 'Rich', 475000);

  switch(investorGroup) {
    case('rich'):
      console.log('Placing Rich Investors into the market...');
      return [dan, rich];
    default:
      return [user];
  }
};

var stocks = createStocks();
var investors = createInvestors();
var myMarket = new Market(stocks, investors);

myMarket.open();

/* Example routes - add your own routes to interact with your stock market */
app.get('/stocks', function (req, res) {
  res.send(myMarket.stocks);
});

app.get('/active-investor', function (req, res) {
  res.send(myMarket.investors[0]);
});

/* Starting the Express.js server instance */
app.use(express.static('src'));
app.use(express.static('node_modules'));
app.listen(3000, function () {
  console.log('Stock Market Dev Server is now listening on port 3000!');
});