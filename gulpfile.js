var gulp = require('gulp'),
  connect = require('gulp-connect'),
  concat = require('gulp-concat'),
  ts = require('gulp-typescript'),
  sass = require('gulp-sass');

var myApps = ["app"];


gulp.task('sass', function(){
  gulp.src('scripts/sass/main.scss')
  .pipe(sass())
  .pipe(gulp.dest('scripts/css'));
});


gulp.task('docs', function(){
  gulp.src([
    'dev/app/docs/framework/before.html',
    'dev/app/docs/topics/*.html',
    'dev/app/docs/framework/after.html']).pipe(concat('docs.html')).pipe(gulp.dest('prod/app/'));
});

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
    gulp.watch('scripts/sass/**/*.scss', ['sass']);
    gulp.watch('dev/'+app+'/docs/**/*.html', ['docs']);
    gulp.watch('dev/'+app+'/*.ts', ['ts']);
    gulp.watch(['dev/'+app+'/*.js','dev/'+app+'/**/*.js'], ['ts']);
  });
  connect.reload();
});

gulp.task('default', ['ts', 'watch', 'docs', 'sass']);
