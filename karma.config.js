module.exports = function(config) {

  config.set({

  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',

  frameworks: ['jasmine'],

  files: setFilesUpForTesting(),

  reporters: ['progress'],

  port: 9876,

  colors: true,

  // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
  logLevel: config.LOG_INFO,


  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,

  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};

// ------------------------------------------------------------------ >
// Below code is for running either single or all test files.
// To run a single test, just pass in the test file name like so...

// If the test file name was rs-test-me-now_spec.js
// To spool up Karma you would enter

// gulp karma --single-test=rs-test-me-now  <note the proceeding double hyphen>
// To just run all tests
// gulp karma

var fixedPath = [
  'node_modules/angular/angular.min.js',
  'node_modules/angular-mocks/angular-mocks.js',
  'test/unit/assignment.spec.js'
];

var baseTestPath = ''; // CHANGE THIS TO YOUR ROOT PATH!!!

function setFilesUpForTesting(){
  fixedPath.push( testPath());
  return fixedPath;
}

function testPath(){
  return singleTestPath() || fullTestPath();
}

function fullTestPath(){
  return  'test/unit/'; // CHANGE THIS TO YOUR SPEC FOLDER!!!
  // like rootFolder/somethinghere/spec/**/*_spec.js
  // note the underscore that proceeds the spec.js. Get rid of if you file name does not have it.
}

function singleTestPath(){
  var passedArgument = process.argv.filter(function(item){ if(/--single-test=/.test(item)){return item; }});
  if( isEmpty( passedArgument )){ return false; }
  return baseTestPath + '**/*' + fileName( passedArgument ) + '_spec.js';
}

function fileName( argument ){
  if( !argument ){ return; }
  return argument[0].replace('--single-test=', '');
}

function isEmpty( array ){
  return array.length === 0;
}
