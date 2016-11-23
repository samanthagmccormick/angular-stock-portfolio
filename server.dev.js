(function () {
   'use strict';
}());

var express = require('express');
var _ = require('underscore');
var app = express();

/* Basic building blocks for the stock market backend */
var Stock = require('./lib/stock');
var Investor = require('./lib/investor');
var Market = require('./lib/market');
var GifGenerator = require('./lib/gifgenerator');

/* Gather input from node command line params */
var stockType = process.argv[2];
var investorGroup = process.argv[3];

/* Pre-defined stock market configurations */
var createStocks = function() {
  // Stock(symbol, price, quantity, growthRate, changeInterval, volatilityPercent)
  var ntap = new Stock('NTAP', 26.31, 4000, 1.0017, 6000, 1.03); // NetApp
  var goog = new Stock('GOOG', 726.65, 5000, 0.9995, 5000, 0.46); // Google

  // stockType is process.argv[2]
  switch(stockType) {
    case('tech'):
      console.log('Loading Tech Stocks into the market...');
      return [ntap, goog];
    default:
      return [ntap]; // if no matches return NTAP
  }
};

var createInvestors = function() {
  // Investor(investorId, name, capital)
  var user = new Investor(1, 'User', 5);
  var dan = new Investor(2, 'Dan', 150000);
  var rich = new Investor(3, 'Rich', 475000);

  // investorGroup is process.argv[3]
  switch(investorGroup) {
    case('rich'):
      console.log('Placing Rich Investors into the market...');
      return [dan, rich]; // Dan is already in the market?
    default:
      return [user]; // if no matches return USER
  }
};


// Initialize the app. (create stocks, create investors, create market with these stocks and investors)
var stocks = createStocks();
var investors = createInvestors();
var gifGenerator = new GifGenerator();
// Market(stocks, investors)
var myMarket = new Market(stocks, investors);

myMarket.open();

// Get a quote for each stock
stocks.forEach(function(stock) {
  stock.quote();
});


// console.log(stocks[0].quote());



/* Example routes - add your own routes to interact with your stock market */

// on visit of localhost:3000/stocks
app.get('/stocks', function (req, res) {
  // send the stocks array data to the client side, for visualization with angular
  res.send(myMarket.stocks);
});

// on get of localhost:3000/active-investor
app.get('/active-investor', function (req, res) {
  // send the first investor data to the client side, for visualization with angular
  res.send(myMarket.investors[0]);
});

app.get('/marketStatus', function(req, res) {
  res.send(myMarket.isOpen);
});

app.get('/quote', function(req, res, next) {

  var symbolIndex = req.query.symbolIndex;

  console.log(stocks[symbolIndex].quote());

  res.send(stocks[symbolIndex].quote().toString());
});

// Market.prototype.buy = function(investorId, symbol, quoteId, quantity) {
app.get('/buy', function(req, res, next) {

  var investorId = req.query.investorId;
  var symbol = req.query.symbol;
  var quoteId = req.query.quoteId;
  var quantity = req.query.quantity;

  myMarket.buy(investorId, symbol, quoteId, quantity);

  res.send('buy completed from app.get');

});

app.get('/open', function(req, res) {
  myMarket.open();
  res.send(myMarket.isOpen);
});

app.get('/close', function(req, res) {
  myMarket.close();
  res.send(myMarket.isOpen);
});

app.get('/growthRate', function(req, res) {
  var symbolIndex = req.query.symbolIndex;
  var growthRate = req.query.growthRate;

  stocks[symbolIndex].setGrowthRate(growthRate);

  res.send(growthRate);
});

app.get('/changeInterval', function(req, res) {
  var symbolIndex = req.query.symbolIndex;
  var changeInterval = req.query.changeInterval;

  stocks[symbolIndex].setChangeInterval(changeInterval);

  res.send(changeInterval);
});

app.get('/volatilityPercent', function(req, res) {
  var symbolIndex = req.query.symbolIndex;
  var volatilityPercent = req.query.volatilityPercent;

  stocks[symbolIndex].setVolatilityPercent(volatilityPercent);

  res.send(volatilityPercent);
});

app.get('/make-it-rain', function(req, res) {
  var makeitrainArray = [
    'weezy.gif',
    'lemon.gif',
    'dolla.gif',
    'suitguy.gif',
    'unicorn.gif',
    'kim.gif'
  ];

  var gif = gifGenerator.generateRandomGif(makeitrainArray);

  res.send(gif);
});

/* Starting the Express.js server instance */
app.use(express.static('src'));
app.use(express.static('node_modules'));
app.listen(3000, function () {
  console.log('Stock Market Dev Server is now listening on port 3000!');
});