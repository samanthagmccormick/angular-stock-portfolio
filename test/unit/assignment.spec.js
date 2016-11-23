(function() {
  'use strict';
}());


/*
  I am having trouble getting any test to pass, i.e. just getting set up with Karma + Angular + Angular Mocks. I don't think I am including the dependencies correctly, or I made a path mistake in the karma.config.js file.
*/

describe('MarketCtrl Test', function() {

  // pull in the app module so you can use it in these tests
  beforeEach(
    module('app')
  );

  describe('MarketCtrl Test', function() {

    beforeEach(inject(function($rootScope) {
      $scope = $rootScope.$new();
    }));

    // This is failing because scope cannot be found ("spyOn could not find an object to spy on for showErrorMessage()")
    it('if an invalid symbol is passed to isSymbolInvalid(), function should return true', function () {
        $controller('MainNavController', {
            $scope: $scope,
            $http: {}
        });

        spy = spyOn(scope, 'showErrowMessage');

        $scope.isSymbolInvalid('Google');

        expect($scope.showErrorMessage).toHaveBeenCalled();
    });

  });

  describe('InvestorCtrl Test', function() {
    // TODO
  });

  describe('ManagerCtrl Test', function() {
    // TODO
  });


/*
  httpBackend tests: Not able to get these working either.
*/

// beforeEach(inject(function($rootScope, $controller, $injector ,stockService) {
//   var scope;

//     $httpBackend = $injector.get('$httpBackend'); // Mock object for Testing Environment with $http service
//     $httpBackend.when('GET', '/stocks').respond(stocksFixture);

//     $rootScope = $injector.get('$rootScope');
//     scope = $rootScope.$new();

//     var $controller = $injector.get('$controller'); // Creating the Angular Controller for Test Environment
//     _stockService = stockService;
//     spyOn(stockService, 'getStocks').andCallThrough(); // Calling of the 'getStocks' method is ensured// by spyOn
//     createController = function() { // Method to create controller
//               return $controller('StockListCtrl', {'$scope' : scope }, {stockService : _stockService});
//           };

//     }));

//   describe('MarketCtrl', function() {

//     it('should call getStocks', function() {
//     var controller = createController();
//     expect(_stockService.getStocks).toHaveBeenCalled(); // Service method is called or not
//     $httpBackend.flush();
//     });

//   });

});
