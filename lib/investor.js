(function () {
   'use strict';
}());

/*
 * The entities that will be buying and selling stocks on the market. They are
 * initialized with a preset amount of capital to spend on the purchase of stocks.
 */
var Investor = function (investorId, name, capital) {
  this.investorId = investorId;
  this.name = name;
  this.capital = capital;
  this.transactions = [];
};

module.exports = Investor;
