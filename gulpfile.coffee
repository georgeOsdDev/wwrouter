pkg = require './package.json'
gulp = require 'gulp'
shell = require 'gulp-shell'
gutil = require 'gulp-util'
clean = require 'gulp-clean'
mocha = require 'gulp-mocha'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'
jshint = require 'gulp-jshint'
stylish = require 'jshint-stylish'
browserify = require 'gulp-browserify'
sourcemaps = require 'gulp-sourcemaps'

gulp.task 'default', ->
  gulp.run 'build'

gulp.task 'clean', ->
  gulp.src 'dist/*', {read: false}
      .pipe clean()
      .on "error", gutil.log

gulp.task 'lint', ->
  gulp.src 'lib/*.js'
      .pipe jshint()
      .pipe jshint.reporter('jshint-stylish')
      .pipe jshint.reporter('fail')
      .on "error", gutil.log

gulp.task 'browserify', ->
  gulp.src 'lib/wwrouter.js'
      .pipe browserify()
      .pipe gulp.dest('./dist')
      .on "error", gutil.log
  gulp.src 'lib/worker.js'
      .pipe browserify()
      .pipe gulp.dest('./dist')
      .on "error", gutil.log

gulp.task 'compress', ->
  gulp.src './dist/wwrouter.js'
      .pipe sourcemaps.init()
      .pipe uglify(mungle: true)
      .pipe rename("wwrouter.min.js")
      .pipe sourcemaps.write(".")
      .pipe gulp.dest('./dist')
      .on "error", gutil.log
  gulp.src './dist/worker.js'
      .pipe sourcemaps.init()
      .pipe uglify(mungle: true)
      .pipe rename("worker.min.js")
      .pipe sourcemaps.write(".")
      .pipe gulp.dest('./dist')
      .on "error", gutil.log

gulp.task 'copy', ->
  gulp.src 'dist/*'
      .pipe gulp.dest('./test/mock-server/public')

gulp.task 'server', ->
  shell.task ['./test/mock-server/sbt/sbt run']

gulp.task 'mock', ['copy'], ->
  gulp.run 'server', ->

gulp.task 'test', ['mock'], ->
  gulp.src 'test/test.js', {read: false}
      .pipe mocha {reporter: 'nyan'}
      .on "error", gutil.log

gulp.task 'build', ['lint', 'test'], ->
  gulp.run 'clean', ->
    gulp.run 'browserify', ->
      gulp.run 'compress', ->
