// READ: https://www.sitepoint.com/introduction-gulp-js/

var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('test:e2e', function() {
  //Run end to end test suite
});

gulp.task('test:unit', function() {
  //Run unit test suite
});

gulp.task('build', function() {
  //Compile and minify your src code into a dist folder
});

gulp.task('start:dev', function() {
  //Configure your stock market backend via command line params and start your dev server

  // TODO
  var stockType = process.argv[2];
  var investorGroup = process.argv[3];

});

gulp.task('start:prod', function() {
  //Configure your stock market backend via command line params and start your prod server
});

/* Additional tasks */

gulp.task('jshint', function() {
  gulp.src(['./**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('default', ['jshint', 'test:e2e', 'test:unit', 'build']);
