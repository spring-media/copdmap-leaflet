'use strict';
// Generated on 2016-11-14 using generator-leaflet 0.0.17

var gulp = require('gulp');
var open = require('open');
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')();
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var htmlmin = require('gulp-htmlmin');
var livereload = require('gulp-livereload');
var jsonminify = require('gulp-jsonminify');
var replace = require('gulp-replace');
var deployURL = 'https://static.apps.welt.de/2016/copd-dev/';

// Build
gulp.task('builddev', ['html']);

gulp.task('build',['html'],function() {
    gulp.start('makeRefsAbsolute');
});

// Styles
gulp.task('styles', function () {
    return gulp.src(['app/styles/main.css'])
        .pipe($.autoprefixer('last 1 version'))
        //.pipe(rename('.tmp.main.css'))
        .pipe(gulp.dest('app/styles'))
        .pipe(livereload())
        .pipe($.size());
});
// Scripts
gulp.task('scripts', function () {
    return gulp.src(['app/scripts/**/*.js'])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('default'))
        .pipe(livereload())
        .pipe($.size());
});
// Shapefile
gulp.task('shapefile', function () {
    return gulp.src('app/shapes/map.json')
        .pipe(jsonminify())
        .pipe(gulp.dest('dist/shapes'))
        .pipe($.size());
});
// Mapdata
gulp.task('mapdata', function () {
    return gulp.src('app/data/data.json')
        .pipe(jsonminify())
        .pipe(gulp.dest('dist/data'))
        .pipe(livereload())
        .pipe($.size());
});
// HTML
gulp.task('html', ['styles', 'scripts','shapefile','mapdata','images'], function () {
  return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', $.uglify()))
        .pipe(gulpif('*.css', $.csso()))
        .pipe(gulpif('*.html',htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist'));
        //.pipe($.size());
});
gulp.task('makeRefsAbsolute',function() {
  return gulp.src('dist/*.html')
    .pipe(gulpif('*.html',replace(/"styles\//g,'"'+deployURL+'styles/')))
    .pipe(gulpif('*.html',replace(/"scripts\//g,'"'+deployURL+'scripts/')))
    .pipe(gulp.dest('dist'));

});

// Images
gulp.task('images', function () {
    return gulp.src([
    		'app/images/*',
    		'app/lib/images/*'])
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Clean
gulp.task('clean', function () {
    return gulp.src(['dist/'], { read: false }).pipe($.clean());
});

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
gulp.task('connect', function(){
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

// Open
gulp.task('serve', ['connect','watch'], function() {
  open("http://localhost:9000");
});

// Inject Bower components
gulp.task('wiredep', function () {
    gulp.src('app/styles/*.css')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/bower_components/'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/'
        }))
        .pipe(gulp.dest('app'));
});

// Watch
gulp.task('watch', ['connect'], function () {
  livereload.listen();

    // Watch for changes in `app` folder
    // Watch .css files
    gulp.watch('app/styles/**/*.css', ['styles']);

    // Watch .js files
    gulp.watch('app/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('app/images/**/*', ['images']);

    // Watch bower files
    gulp.watch('bower.json', ['wiredep']);
});
