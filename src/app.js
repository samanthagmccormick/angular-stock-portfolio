(function() {
  'use strict';
}());

var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
  return window._;
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

    // Default route is...
    $urlRouterProvider.otherwise('investor');
  }
]);

app.factory('MarketStatus', function() {
  return {
    getMarketStatus: function(marketIsOpen) {
      return marketIsOpen ? 'open' : 'closed';
    },
    getMarketIcon: function(marketIsOpen) {
      return marketIsOpen ? 'fa-clock-o green' : 'fa-ban red';
    }
  }
});

// TODO: Should this messaging be moved to the view instead?
app.factory('ErrorMessage', function() {
  return {
    getErrorMessage: function(item) {
      var message;

      switch (item) {
        case 'symbol':
        case 'quantity':
        case 'growth rate':
        case 'volatility percent':
        case 'change interval':
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

      return message;
    }
  }
});

// on load of webpage, load MarketCtrl
app.controller('MarketCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.errorMessage = '';

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
    // load chart with first stock's data
    $scope.refresh(undefined, 0);
  }]) // end MarketCtrl

app.controller('InvestorCtrl', [
    '$scope',
    '$http',
    '$filter',
    '_', // underscore
    'MarketStatus',
    'ErrorMessage',
    function($scope, $http, $filter, _, MarketStatus, ErrorMessage) {
      $scope.transactionTotal = 0;
      $scope.errorMessage = '';

      $http.get('/marketStatus').success(function(response) {
        $scope.marketStatus = MarketStatus.getMarketStatus(response);
      });

      $scope.makeItRain = function() {

        $http.get('/make-it-rain').success(function(response) {
          $scope.makeItRainGif = response;
        });
      }

      // Directives
      $scope.loadInvestor = function() {
        $scope.myInvestor = {};

        // on success of GET of investors[0] endpoint
        $http.get('/active-investor').success(function(response) {
          $scope.myInvestor = response;
        });
      }

      $scope.loadStocks = function() {
        // on success of GET of investors[0] endpoint
        $http.get('/stocks').success(function(response) {
          $scope.stocks = response;
        });
      }

      $scope.getQuote = function(index) {
        $scope.index = index;

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
        var stock;

        // Refresh stocks (to get latest quotes)
        $http.get('/stocks').success(function(response) {
          $scope.stocks = response;
        });

        // Find the right stock based on symbol
        stock = $scope.getStockBySymbol(symbol);

        if ($scope.isSymbolInvalid(symbol)) {
          return;
        }

        // check if quantity is valid
        var regExp = new RegExp(/^\d+(?:\.\d{1,2})?$/);
        if (quantity === '' || quantity <= 0) {
          $scope.errorMessage = ErrorMessage.getErrorMessage("quantity");
          return;
        }

        // calculate total of transaction using latest active quote
        var quoteId = Object.keys(stock.activeQuotes).length - 1;

        $scope.transactionTotal = stock.activeQuotes[quoteId] * quantity;

        // check if total $$ exceeds the investor's capital
        if ($scope.transactionTotal > $scope.myInvestor.capital) {
          $scope.errorMessage = ErrorMessage.getErrorMessage("capital");
          return;
        }

        // Reset error message
        $scope.errorMessage = '';

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

              $scope.makeItRain();

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
          $scope.errorMessage = ErrorMessage.getErrorMessage("closed");
        }

        // refresh stocks because quantity is now updated
        $scope.loadStocks();

      }

      // TODO: make into factory
      $scope.getStockBySymbol = function(symbol) {
        return $filter('filter')($scope.stocks, {
          symbol: symbol
        })[0];
      }

      $scope.isSymbolInvalid = function(symbol) {
        symbol = symbol.toUpperCase();
        var isInvalid = false;
        // validate symbol
        if (symbol === '' || symbol === undefined || $scope.getStockBySymbol(symbol) === undefined) {
          $scope.errorMessage = ErrorMessage.getErrorMessage("symbol");
          isInvalid = true;
        }
        return isInvalid;
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
  'ErrorMessage',
  function($scope, $http, $filter, _, MarketStatus, ErrorMessage) {
    $scope.test = 'ManagerCtrl Test';
    $scope.errorMessage = '';

    // Refresh stocks (to get latest quotes)
    $http.get('/stocks').success(function(response) {
      $scope.stocks = response;
    });

    // get market status on load
    $http.get('/marketStatus').success(function(isOpen) {
      $scope.marketStatus = MarketStatus.getMarketStatus(isOpen);
      $scope.marketIcon = MarketStatus.getMarketIcon(isOpen);
    });

    $scope.open = function() {
      var marketIsOpen;
      $http.get('/marketStatus').success(function(response) {
        marketIsOpen = response;

        if (!marketIsOpen) {
          $http.get('/open').success(function(response) {
            $scope.marketStatus = MarketStatus.getMarketStatus(response);
            $scope.marketIcon = MarketStatus.getMarketIcon(response);
          });
        }

      });
    }

    $scope.close = function() {
      var marketIsOpen;
      $http.get('/marketStatus').success(function(response) {
        marketIsOpen = response;

        if (marketIsOpen) {
          $http.get('/close').success(function(response) {
            $scope.marketStatus = MarketStatus.getMarketStatus(response);
            $scope.marketIcon = MarketStatus.getMarketIcon(response);
          });
        }
      });
    }

    // todo grab growthRate from input.
    $scope.changeGrowthRate = function(stock, growthRate, index) {
      $scope.index = index;

      if (!growthRate) {
        $scope.errorMessage = ErrorMessage.getErrorMessage("growth rate");
        return;
      }

      // Reset error message
      $scope.errorMessage = '';

      $http.get('/growthRate', {
          params: {
            symbolIndex: $scope.index,
            growthRate: growthRate
          }
        })
        .success(function(response) {
          // Refresh stocks (to get latest quotes)
          $http.get('/stocks').success(function(response) {
            $scope.stocks = response;
          });

        });
    }

    $scope.changeChangeInterval = function(stock, changeInterval, index) {
      $scope.index = index;

      if (!changeInterval) {
        $scope.errorMessage = ErrorMessage.getErrorMessage("change interval");
        return;
      }

      // Reset error message
      $scope.errorMessage = '';

      $http.get('/changeInterval', {
          params: {
            symbolIndex: $scope.index,
            changeInterval: changeInterval
          }
        })
        .success(function(response) {
          // Refresh stocks (to get latest quotes)
          $http.get('/stocks').success(function(response) {
            $scope.stocks = response;
          });

        });
    }

    $scope.changeVolatilityPercent = function(stock, volatilityPercent, index) {
      $scope.index = index;

      if (!volatilityPercent) {
        $scope.errorMessage = ErrorMessage.getErrorMessage("volatility percent");
        return;
      }

      // Reset error message
      $scope.errorMessage = '';

      $http.get('/volatilityPercent', {
          params: {
            symbolIndex: $scope.index,
            volatilityPercent: volatilityPercent
          }
        })
        .success(function(response) {
          // Refresh stocks (to get latest quotes)
          $http.get('/stocks').success(function(response) {
            $scope.stocks = response;
          });

        });
    }



  }
]); // end ManagerCtrl
