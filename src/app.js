(function() {
  'use strict';
}());

var app = angular.module('app', ['ui.router', 'ng-polymer-elements']);

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


// creating a factory to store data from controller, better for testing, passing to other controllers, etc.
app.factory('total', [function() {
  var o = {
      total: 0
    }
    // returning another variable that CONTAINS posts allows us to store more
    // data in this factory in the future
  return o;
}]);

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
  }]) // end MarketCtrl


app.controller('InvestorCtrl', [
    '$scope',
    '$http',
    '$filter',
    'total', // inject "total" factory to use across controllers
    function($scope, $http, $filter, total) {
      $scope.total = total.total;

      // check if market is open
      var marketIsOpen;
      $http.get('/marketStatus').success(function(response) {
        marketIsOpen = response;

        if (marketIsOpen) {
          $scope.marketStatus = 'Market is open';
        } else {
          $scope.marketStatus = 'Market is closed';
        }
      });

      // Directives
      $scope.loadInvestor = function() {
        $scope.myInvestor = {};

        // on success of GET of investors[0] endpoint
        $http.get('/active-investor').success(function(response) {
          console.log('investor...');
          console.log(response);

          $scope.myInvestor = response;
        });
      }

      $scope.loadStocks = function() {
        // on success of GET of investors[0] endpoint
        $http.get('/stocks').success(function(response) {
          console.log('stocks...');
          console.log(response);

          $scope.stocks = response;
        });
      }

      $scope.changeQuote = function(quantity, index) {
        $scope.index = index;

        // price * quantity = subtotal
        $scope.subtotal = $scope.stocks[$scope.index].price * quantity;;

        // pass subtotal to grandTotal()
        $scope.grandTotal($scope.subtotal);

      }

      // FIXME: it is keeping a running total, need to store it locally
      $scope.grandTotal = function(total) {
        $scope.total += total;

        console.log("grandTotal");
      }

      $scope.getQuote = function() {
        $http.get('stocks').success(function(response) {
          console.log(response);
        });
      }

      $scope.buyStock = function(symbol, amount) {
        // check if symbol is valid
        if (symbol === '' || symbol === undefined || $filter('filter')($scope.stocks, {
            symbol: symbol
          })[0] === undefined) {
          $scope.errorMessage("symbol");
          return;
        }

        // check if amount is valid
        if (amount === '' || amount === undefined || amount < 0) {
          $scope.errorMessage("amount");
          return;
        }

        // search for symbol in stocks array
        var stock = $filter('filter')($scope.stocks, {
          symbol: symbol
        })[0];

        // calculate total $$
        var transactionTotal = stock.price * amount;

        // check if total $$ exceeds the investor's capital
        if (transactionTotal > $scope.myInvestor.capital) {
          $scope.errorMessage("capital")
          return;
        }

        console.log('all good');

        // if the market is open, buy stock!
        if (marketIsOpen) {
          // Buy stock! (use Market function)
          $http.get('/market', {
              params: {
                investorId: $scope.myInvestor.investorId,
                symbol: symbol,
                quoteId: 1, // TODO create real ID
                quantity: amount
              }
            })
            .success(function(response) {
              console.log("HTTP GET completed");
              console.log(response);

            });
        } else {
          $scope.errorMessage("closed");
        }
      }

      // TODO move to view (should not be in controller)
      $scope.errorMessage = function(item) {
        var message;

        switch (item) {
          case 'symbol':
          case 'amount':
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
        console.log(message);

        $scope.errorMessage = message;
      }

      $scope.loadInvestor();
      $scope.loadStocks();
    }
  ]) // end InvestorCtrl



app.controller('ManagerCtrl', [
  '$scope',
  function($scope) {
    $scope.test = 'ManagerCtrl Test';

    console.log('ManagerCtrl!');

  }
]); // end ManagerCtrl
