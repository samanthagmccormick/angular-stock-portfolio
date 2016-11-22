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
    '_', // underscore
    function($scope, $http, $filter, _) {
      $scope.quotes = [];
      $scope.count = 0;

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

      $scope.getQuote = function(quantity, index) {
        $scope.index = index;

        var regExp = new RegExp(/^\d+(?:\.\d{1,2})?$/);
        if (quantity === '' || quantity <= 0 || !regExp.test(quantity)) {
          return;
        }
        // get current price of stock
        $http.get('/stocks').success(function(stocks) {

          // get current price * quantity = QUOTE for this stock
          $scope.stocks[$scope.index].quote = stocks[$scope.index].price * quantity;

          $scope.quotes.push({
            timestamp: Date.now(),
            symbol: $scope.stocks[$scope.index].symbol,
            quote: $scope.stocks[$scope.index].quote
          })

          console.log($scope.quotes);

        });

      }


      $scope.buyStock = function(symbol, amount) {
        $scope.latestQuote = 0;

        var symbolIndex = $filter('filter')($scope.stocks, { symbol: symbol })[0];

        console.log(symbolIndex);

        // check if symbol is valid
        if (symbol === '' || symbol === undefined || symbolIndex === undefined) {
          $scope.errorMessage("symbol");
          return;
        }

        // check if amount is valid
        if (amount === '' || amount === undefined || amount < 0) {
          $scope.errorMessage("amount");
          return;
        }

        // Now get the latest quote for this symbol
        var quotesBySymbol;
        var latestSymbolQuote;
        if ($scope.quotes.length > 0) {
          // filter thru quotes for this symbol
          quotesBySymbol = _.filter($scope.quotes, function(quote) { return quote.symbol === symbol; });

          // get the latest quote for this symbol
          latestSymbolQuote = _.max(quotesBySymbol, function(quote) { return quote.timestamp });

          $scope.latestQuote = latestSymbolQuote.quote;

        } else {
          // else get a quote for this symbol
          $scope.latestQuote = $scope.getQuote(quantity, symbolIndex);
        }

        // calculate total amount of transaction using that quote
        var transactionTotal = $scope.latestQuote * amount;

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
                quoteId: latestSymbolQuote.timestamp,
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
