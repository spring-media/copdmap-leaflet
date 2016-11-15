'use strict';
// Generated on 2016-11-14 using generator-leaflet 0.0.17

var gulp = require('gulp');
var open = require('open');
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')();
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var htmlmin = require('gulp-htmlmin');

var jsonminify = require('gulp-jsonminify');

// Styles
gulp.task('styles', function () {
    return gulp.src(['app/styles/main.css'])
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('app/styles'))
        .pipe($.size());
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['app/scripts/**/*.js'])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('default'))
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
        .pipe($.size());
});
// HTML
gulp.task('html', ['styles', 'scripts','shapefile','mapdata'], function () {
  return gulp.src('app/*.html')

        .pipe(useref())

        .pipe(gulpif('*.js', $.uglify()))
        .pipe(gulpif('*.css', $.csso()))

        .pipe(gulpif('*.html',htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist'));
        //.pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src([
    		'app/images/**/*',
    		'app/lib/images/*'])
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Clean
gulp.task('clean', function () {
    return gulp.src(['dist/'], { read: false }).pipe($.clean());
});

// Build
gulp.task('build', ['html']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
gulp.task('connect', function(){
    $.connect.server({
        root: 'app',
        port: 9000,
        livereload: true
    });
});

// Open
gulp.task('serve', ['connect'], function() {
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
gulp.task('watch', ['connect', 'serve'], function () {
    // Watch for changes in `app` folder
    gulp.watch([
        'app/*.html',
        'app/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ], function (event) {
        return gulp.src(event.path)
            .pipe($.connect.reload());
    });

    // Watch .css files
    gulp.watch('app/styles/**/*.css', ['styles']);

    // Watch .js files
    gulp.watch('app/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('app/images/**/*', ['images']);

    // Watch bower files
    gulp.watch('bower.json', ['wiredep']);
});
