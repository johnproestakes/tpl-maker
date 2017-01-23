var gulp = require('gulp'),
  connect = require('gulp-connect'),
  concat = require('gulp-concat'),
  ts = require('gulp-typescript');

var myApps = ["app"];




gulp.task('ts', function(){
  myApps.forEach(function(app){
    gulp.src('dev/'+app+'/*.ts' )
    .pipe(ts())
    .pipe(gulp.dest('prod/'+app+'/'));

    // gulp.src('dev/'+app+'/directives/*.ts' )
    // .pipe(ts())
    // .pipe(gulp.dest('dev/'+app+'/directives'));


    gulp.src(['dev/'+app+'/controllers/*.js'] )
    .pipe(concat('controllers.js'))
    .pipe(gulp.dest('prod/'+app+'/'));

    gulp.src(['dev/'+app+'/app.js', 'dev/'+app+'/services/*.js'] )
    .pipe(concat('app.js'))
    .pipe(gulp.dest('prod/'+app+'/'));

    gulp.src(['dev/'+app+'/directives/*.js'] )
    .pipe(concat('directives.js'))
    .pipe(gulp.dest('prod/'+app+'/'))
    .pipe(connect.reload());
  });
});

gulp.task('watch', function(){
  connect.server();
  myApps.forEach(function(app){
    gulp.watch('dev/'+app+'/*.ts', ['ts']);
    gulp.watch(['dev/'+app+'/*.js','dev/'+app+'/**/*.js'], ['ts']);
  });
  connect.reload();
});

gulp.task('default', ['ts', 'watch']);
