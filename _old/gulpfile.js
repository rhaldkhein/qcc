var gulp = require('gulp'),
    webpack = require('webpack'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    webpackStream = require('webpack-stream'),
    http = require('http'),
    tinylr = require('tiny-lr'),
    sequence = require('run-sequence');

gulp.task('_README_', function() {
    // To test localy run http-server in root folder
    console.log('To test localy run http-server in root folder');
});

gulp.task('run', function(done) {
    sequence('_dev_webpack_app', 'livereload_reload', done);
});

gulp.task('release', function(done) {
    sequence('_dev_webpack_app', 'minify_vendor', 'minify_bundle', done);
});

gulp.task('livereload_server', function() {
    var port = 35729;
    tinylr().listen(port, function() {
        console.log('LiveReload listening on %s ...', port);
    });
});

gulp.task('livereload_reload', function(done) {
    http.get('http://localhost:35729/changed?files=*').on('error', function() {
        console.log('LiveReload not running! Run gulp task `livereload_server` first.');
    });
    done();
});

gulp.task('_dev_webpack_app', function() {
    return gulp.src('')
        .pipe(webpackStream(require('./webpack.js'), webpack))
        .pipe(gulp.dest('./app/dist'));
});

gulp.task('minify_vendor', function() {
    return gulp.src('./app/dist/index.vendor.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./app/dist'));
});

gulp.task('minify_bundle', function() {
    return gulp.src('./app/dist/index.bundle.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./app/dist'));
});