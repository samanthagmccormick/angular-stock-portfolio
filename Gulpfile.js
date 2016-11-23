// READ: https://www.sitepoint.com/introduction-gulp-js/
// var angular = require('angular');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
// allows you to set up tasks that run bash commands
var exec = require('gulp-exec');
var karma = require('karma').server; // to include angular in jasmine tests



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

  return gulp.src('./**/**')
    .pipe(exec('node server.dev.js'));
});

// FIXME
gulp.task('start:market', function() {
  return gulp.src('./**/**')
    .pipe(exec('node server.dev.js tech rich'));

});

gulp.task('start:prod', function() {
  //Configure your stock market backend via command line params and start your prod server
});

/* Additional tasks */

gulp.task('jshint', function() {
  gulp.src([
    './**/*.js',
    '!./bower_components/**/*.js',
    '!./node_modules/**/*.js'
    ])
    // pass each js file one by one into...
    .pipe(jshint())
    // ...the jshint default reporter
    .pipe(jshint.reporter('default'));
});

gulp.task('sass', function() {
  // look recursively inside sass directory for .scss files
  gulp.src('./src/styles/sass/*.scss')
    // pass each scss file one by one into...
    .pipe(sass())
    // ...the destination file
    .pipe(gulp.dest('./src/styles/css'));
});

// watch SCSS files for changes and run jshint
gulp.task('watch', function() {
  gulp.watch('**/*.scss', ['sass']);
  gulp.watch('./**/*.js', ['jshint']);
});

gulp.task('jasmine', function() {
  gulp.src('./test/unit/assignment.spec.js')
    .pipe(jasmine({
      verbose: true
    }));
});

gulp.task('default', [
  'jshint',
  'sass',
  'test:e2e',
  'test:unit',
  'build',
  // 'connect',
  'watch'
]);

