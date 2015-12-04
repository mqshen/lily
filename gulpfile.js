var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

// Lint JS
gulp.task('lint', function() {

  gulp.src('./src/**.js')
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter('default'));

});


gulp.task('concat', function(){

    gulp.src([ './src/lily.core.js',
      './src/lily.collapse.js',
      './src/lily.form.js',
      './src/lily.format.js',
      './src/lily.modal.js',
      './src/lily.menu.js',
      './src/lily.page.js',
      './src/lily.timeago.js',
      './src/lily.html5fileuploader.js',
      './src/lily.button.js',
      './src/lily.validator.js',
      './src/lily.editor.js',
      './src/lily.select.js',
      './src/lily.fileupload.js',
      './src/lily.imageView.js'])
        .pipe(concat('lily-all.js'))
        .pipe(gulp.dest('./dist/'));

});

// Default
gulp.task('default', function(){

  gulp.start('lint', 'concat');

  // Watch JS Files
});

