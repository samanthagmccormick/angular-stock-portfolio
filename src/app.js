'use strict';

angular.module('app', [])
  .controller('AppCtrl', ['$http',  function($http) {
    var self = this;
    self.myStock = {};
    self.myInvestor = {};

    $http.get('/active-investor').success(function(investor) {
      self.myInvestor = investor;
    });

    self.refresh = function() {
      $http.get('/stocks').success(function(stocks) {
        self.myStock = stocks[0];

        self.myStock.tradeHistory.timestamps = self.myStock.tradeHistory.timestamps.map(function(timestamp) {
          return new Date(timestamp);
        });

        self.chart.load({columns: [
          ['price'].concat(self.myStock.tradeHistory.prices),
          ['timestamp'].concat(self.myStock.tradeHistory.timestamps)
        ]});
      });
    };

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
    }

    self.chart = c3.generate(self.chartConfig);
    self.refresh();
  }]);