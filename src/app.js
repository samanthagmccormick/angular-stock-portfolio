(function () {
   'use strict';
}());

//
angular.module('app', [])
  .controller('AppCtrl', ['$http',  function($http) {
    var self = this;
    self.myStock = {};
    self.myInvestor = {};

    // on success of GET of investors[0] endpoint
    $http.get('/active-investor').success(function(investor) {
      self.myInvestor = investor;

      // DO STUFF
    });

    // on refresh of app...
    self.refresh = function() {
      // on success of GET of stocks
      $http.get('/stocks').success(function(stocks) {
        // set myStock to the very first stock you receive in the array
        self.myStock = stocks[0];

        // Stock.tradeHistory = {prices: [], timestamps: []};
        // Map over the Stock tradeHistory.timestamps[] and store DATES instead
        self.myStock.tradeHistory.timestamps = self.myStock.tradeHistory.timestamps.map(function(timestamp) {
          return new Date(timestamp);
        });

        // chart.load = c3 (d3 helper) http://c3js.org/samples/data_load.html
        self.chart.load({columns: [
          // "price",1.00,2.00,3.00, etc.
          ['price'].concat(self.myStock.tradeHistory.prices),
          // "timestamp",10:00:00,11:00:01, etc.
          ['timestamp'].concat(self.myStock.tradeHistory.timestamps)
        ]});
      });
    };

    // an example chart
    self.chartConfig = {
      bindto: '#stock-chart',
      data: {
        x: 'timestamp',
        columns: [
          ['price'],
          ['timestamp']
        ]
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%M:%S'
          }
        }
      }
    };

    self.chart = c3.generate(self.chartConfig);
    self.refresh();
  }]);