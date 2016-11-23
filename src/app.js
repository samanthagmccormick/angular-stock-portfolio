(function() {
  'use strict';
}());

var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
  return window._; //Underscore should be loaded on the page
});

var app = angular.module('app', ['ui.router', 'underscore']);

// Internal routing
app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('market', {
        url: '/market',
        templateUrl: '/market.html',
        controller: 'MarketCtrl'
      })

    .state('investor', {
      url: '/investor',
      templateUrl: '/investor.html',
      controller: 'InvestorCtrl'
    })

    .state('manager', {
      url: '/manager',
      templateUrl: '/manager.html',
      controller: 'ManagerCtrl'
    });


    // Handle incorrectly entered routes, i.e. redirect to "home" state
    $urlRouterProvider.otherwise('market');
  }
]);

app.factory('MarketStatus', function() {
  return {
    getMarketStatus: function(response) {
      console.log('market statusssss');
      var marketStatus;
      marketIsOpen = response;

      if (marketIsOpen) {
        marketStatus = 'open';
      } else {
        marketStatus = 'closed';
      }

      console.log('marketStatus: ' + marketStatus);
      return marketStatus;
    }
  }
});

// on load of webpage, load MarketCtrl
app.controller('MarketCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.myStock = {};

    $scope.loadStocks = function() {
      $http.get('/stocks').success(function(response) {
        $scope.stocks = response;
      });
    }

    // on refresh of single stock...
    $scope.refresh = function(stock, index) {
      $scope.index = index;

console.log(index);
      console.log("refresh");

      // on success of GET of stocks
      $http.get('/stocks').success(function(stocks) {

        // update the data of the stock that you clicked
        $scope.stocks[$scope.index] = stocks[$scope.index];

        // Stock.tradeHistory = {prices: [], timestamps: []};
        // Map over the Stock tradeHistory.timestamps[] and store DATES instead
        $scope.stocks[$scope.index].tradeHistory.timestamps = stocks[$scope.index].tradeHistory.timestamps.map(function(timestamp) {
          return new Date(timestamp);
        });


        // chart.load = c3 (d3 helper) http://c3js.org/samples/data_load.html
        $scope.chart.load({
          columns: [
            // "price",1.00,2.00,3.00, etc.
            ['price'].concat($scope.stocks[$scope.index].tradeHistory.prices),
            // "timestamp",10:00:00,11:00:01, etc.
            ['timestamp'].concat($scope.stocks[$scope.index].tradeHistory.timestamps)
          ]
        });

      });

    };

    // an example chart
    $scope.chartConfig = {
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
            format: '%H:%M:%S',
            count: 25
          }
        }
      }
    };

    $scope.chart = c3.generate($scope.chartConfig);
    // load stocks
    $scope.loadStocks();
    // load chart with first stock's data
    $scope.refresh(undefined, 0);
  }]) // end MarketCtrl

app.controller('InvestorCtrl', [
    '$scope',
    '$http',
    '$filter',
    '_', // underscore
    'MarketStatus',
    function($scope, $http, $filter, _, MarketStatus) {
      $scope.transactionTotal = 0;

      $http.get('/marketStatus').success(function(response) {
        $scope.marketStatus = MarketStatus.getMarketStatus(response);
      });

      // Directives
      $scope.loadInvestor = function() {
        $scope.myInvestor = {};

        // on success of GET of investors[0] endpoint
        $http.get('/active-investor').success(function(response) {
          console.log('investor...');
          // console.log(response);

          $scope.myInvestor = response;
        });
      }

      $scope.loadStocks = function() {
        // on success of GET of investors[0] endpoint
        $http.get('/stocks').success(function(response) {
          console.log('stocks...');
          // console.log(response);

          $scope.stocks = response;
        });
      }

      $scope.getQuote = function(index) {
        $scope.index = index;

        console.log($scope.index);

        // get active quoteId of stock
        $http.get('/quote', {
            params: {
              symbolIndex: $scope.index
            }
          })
          .success(function(response) {
            // Refresh stocks (to get latest quotes)
            $http.get('/stocks').success(function(response) {
              $scope.stocks = response;
            });

          });

      }


      $scope.buyStock = function(symbol, quantity) {
        // Refresh stocks (to get latest quotes)
        $http.get('/stocks').success(function(response) {
          $scope.stocks = response;
        });

        console.log('buyStock quantity: ' + quantity);

        // Find the right stock based on symbol
        var stock = $filter('filter')($scope.stocks, {
          symbol: symbol
        })[0];

        // validate symbol / stock
        if (symbol === '' || symbol === undefined || stock === undefined) {
          $scope.errorMessage("symbol");
          return;
        }

        // check if quantity is valid
        // TODO: check if quantity > stock.quantity = error
        var regExp = new RegExp(/^\d+(?:\.\d{1,2})?$/);
        if (quantity === '' || quantity <= 0) {
          $scope.errorMessage("quantity");
          return;
        }

        // calculate total of transaction using latest active quote
        var quoteId = Object.keys(stock.activeQuotes).length - 1;

        $scope.transactionTotal = stock.activeQuotes[quoteId] * quantity;

        // check if total $$ exceeds the investor's capital
        if ($scope.transactionTotal > $scope.myInvestor.capital) {
          $scope.errorMessage("capital");
          return;
        }

        console.log('all good');

        // if the market is open, buy stock!
        if ($scope.marketStatus === 'open') {
          // Buy stock! (use Market.buy() function)
          $http.get('/buy', {
              params: {
                investorId: $scope.myInvestor.investorId,
                symbol: symbol,
                quoteId: quoteId,
                quantity: quantity
              }
            })
            .success(function(response) {
              console.log("HTTP GET completed");
              console.log(response);
              // Refresh stocks (to get latest quotes)
              $http.get('/stocks').success(function(response) {
                $scope.stocks = response;
              });

              // Refresh investor info to display latest data
              $http.get('/active-investor').success(function(response) {
                $scope.myInvestor = response;
              });

            });
        } else {
          $scope.errorMessage("closed");
        }

        // refresh stocks because quantity is now updated
        $scope.loadStocks();

      }

      // TODO move to view (should not be in controller)
      $scope.errorMessage = function(item) {
        var message;

        switch (item) {
          case 'symbol':
          case 'quantity':
            message = 'Sorry, you did not enter a valid ' + item + '. Please try again.';
            break;
          case 'capital':
            message = 'Sorry, you do not have enough ' + item + ' to make this transaction.';
            break;
          case 'closed':
            message = 'The market is closed. Your transaction did not go through.';
            break;
          default:
            message = 'Oops, application error...no message found.';
        }

        $scope.errorMessage = message;
      }

      $scope.loadInvestor();
      $scope.loadStocks();
    }
  ]) // end InvestorCtrl



app.controller('ManagerCtrl', [
  '$scope',
  '$http',
  '$filter',
  '_', // underscore
  'MarketStatus',
  function($scope, $http, $filter, _, MarketStatus) {
    $scope.test = 'ManagerCtrl Test';

    // get market status on load
    $http.get('/marketStatus').success(function(response) {
      $scope.marketStatus = MarketStatus.getMarketStatus(response);
    });

    $scope.open = function() {
      var marketIsOpen;
      $http.get('/marketStatus').success(function(response) {
        marketIsOpen = response;

        if (!marketIsOpen) {
          $http.get('/open').success(function(response) {
            console.log('success: Market has been opened');
            $scope.marketStatus = MarketStatus.getMarketStatus(response);

          });
        } else {
          // TODO: use errorMessage (make into factory)
          console.log("market is already open, duh");
        }

      });
    }

    $scope.close = function() {
      var marketIsOpen;
      $http.get('/marketStatus').success(function(response) {
        marketIsOpen = response;

        if (marketIsOpen) {
          $http.get('/close').success(function(response) {
            console.log('success: Market has been closed');
            $scope.marketStatus = MarketStatus.getMarketStatus(response);

          });
        } else {
          // TODO: use errorMessage (make into factory)
          console.log("market is already closed, duh");
        }

      });
    }
  }
]); // end ManagerCtrl
