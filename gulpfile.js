var gulp = require('gulp'),
  concat = require('gulp-concat'),
  connect = require('gulp-connect'),
  ts = require('gulp-typescript'),
  uglify = require('gulp-uglify'),
  zip = require('gulp-zip'),
  sass = require('gulp-sass'),
  replace = require('gulp-replace'),
  manifest = require('./manifest.json'),
  fs = require('fs'),
  rename = require('gulp-rename'),
  del = require('del'),
  manifest = require('./manifest.json');

var myApps = ["app"];

gulp.task('complete-SPA', ['createOfflineIndexPage'], function(){
  gulp.src(['./prod/single/TPL_Maker_Offline/**/*'])
  .pipe(zip('Template_Maker_Offline.zip', {compress: true}))
  .pipe(gulp.dest('./prod/single'));
});

gulp.task('sass', function(){
  gulp.src('scripts/sass/main.scss')
  .pipe(sass())
  .pipe(gulp.dest('scripts/css'));
});

gulp.task('ts', function(){
  myApps.forEach(function(app){
    gulp.src('dev/'+app+'/*.ts' )
    .pipe(ts())
    .pipe(gulp.dest('prod/'+app+'/'));


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


gulp.task('createOfflineIndexPage', function(){

  gulp.src(manifest.scripts)
  .pipe(concat('scripts.js'))
  .pipe(gulp.dest('./prod/single'));

  gulp.src(manifest.css)
  .pipe(concat('css.css'))
  .pipe(gulp.dest('./prod/single'));

  var scripts = fs.readFileSync("./prod/single/scripts.js", "utf8");
  var css = fs.readFileSync("./prod/single/css.css", "utf8");

  css = css + [
    'img.logo:before { content: "EML";background: #CCC;height: 100%;width: 100%;display: block;line-height: 35px;text-align: center;font-size: 11px;}',
    'img.logo {overflow:hidden; height:35px;}',
    'i.icon { width: 1em !important; height: 1em; important; text-indent:99em; overflow:hidden;display:none; }',
    'i.red.icon { background: #DB2828; display:inline-block }',
    'i.large.file.outline.middle.aligned.icon {display:none!important;}'
  ].join("\n");

  gulp.src('./dev/app/index.html')
  .pipe(replace('<!-- RENDER:CSS -->', '<script type="text/javascript">'+scripts+'</script>'))
  .pipe(replace('<!-- RENDER:JAVASCRIPTS -->', '<style type="text/css">'+css+'</style>' ))
  .pipe(replace(/\<\!\-\-\[if\sONLINE\]\>((.|\n)*?)\<\!\[endif\]\-\-\>/igm,""))
  .pipe(replace(/\<\!\-\-\[if\sOFFLINE\]\>((.|\n)*?)\<\!\[endif\]\-\-\>/igm,"$1"))
  .pipe(rename('TPL_Maker.html'))
  .pipe(gulp.dest('./prod/single/TPL_Maker_Offline'));
});


gulp.task('createOnlineIndexPage', function(){

  var scripts =[],
      css=[];

  manifest.scripts
  .forEach((item)=>{
    scripts.push('<script src="'+item+'" type="text/javascript"></script>');
  });

  manifest.css
  .forEach((item)=>{
    css.push('<link href="'+item+'" type="text/css" rel="stylesheet"/>');
  });

  var finalCss = css.join("\n"), finalScripts = scripts.join("\n");

  gulp.src('./dev/app/index.html')
  .pipe(replace('<!-- RENDER:CSS -->', finalCss))
  .pipe(replace('<!-- RENDER:JAVASCRIPTS -->', finalScripts ))
  .pipe(replace(/\<\!\-\-\[if\sONLINE\]\>((.|\n)*?)\<\!\[endif\]\-\-\>/igm,"$1"))
  .pipe(replace(/\<\!\-\-\[if\sOFFLINE\]\>((.|\n)*?)\<\!\[endif\]\-\-\>/igm,""))
  .pipe(gulp.dest('./'));

});




gulp.task('watch', function(){
  connect.server({port: 8887});
  gulp.watch('scripts/sass/**/*.scss', ['sass','createOnlineIndexPage', 'complete-SPA']);
  gulp.watch('dev/app/*.ts', ['ts', 'createOnlineIndexPage', 'complete-SPA']);
  gulp.watch(['dev/app/*.js','dev/app/**/*.js'], ['ts','createOnlineIndexPage', 'complete-SPA']);

});

gulp.task('default', ['ts', 'watch', 'sass']);
