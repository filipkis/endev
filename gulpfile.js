var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var stringify = require("stringify");
var ngAnnotate = require("gulp-ng-annotate");
var config = require("./package.json");
var writeJSON = require("jsonfile").writeFileSync;
var bump = require('gulp-bump');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var gutil = require('gulp-util');
var spawn = require('child_process').spawn;
var gulpif = require('gulp-if');
var ghPages = require('gulp-gh-pages');

gulp.task("default", ["package"], function() {});

var fullBundle  = browserify({
  entries: ["src/index.js"],
  cache: {},
  packageCache: {},
  debug: true,
  transform: stringify(),
  standalone: "endev",
  ignoreTransform: ["browserify-shim"]
});

var bundle  = browserify({
  entries: ["src/index.js"],
  cache: {},
  packageCache: {},
  debug: true,
  transform: stringify(),
  standalone: "endev",
}); 

var p = null
var spawnChildren = function(){
  if(p) p.kill();
  return p = spawn('gulp',['watch'], {stdio: 'inherit'});
}
 
gulp.task("watch",function(){
  var watchifyBundle = watchify(fullBundle);
  
  var bundle = function(file){
    if(file) {
      file.map(function (fileName) {
        gutil.log('File updated', gutil.colors.yellow(fileName));
      });
    }
    return watchifyBundle.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source("endev.full.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(ngAnnotate())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("./dist"))
      .on('end', gutil.log.bind(gutil,'Done!'));
  }

  watchifyBundle.on('update',bundle);
  gulp.watch('gulpfile.js',spawnChildren)
  return bundle();
})

var build = function(full, minify) {
  var name = "endev" + (full ? '.full' : '') + (minify ? '.min' : '') + ".js";
  var b = full ? fullBundle : bundle;
  return b.bundle()
    .pipe(source(name))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(ngAnnotate())
    .pipe(gulpif(minify,uglify()))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./dist"));
}

gulp.task("full", function() {
  return build(true);
});

gulp.task("small", function() {
  return build(false);
});

gulp.task("build",['full','small','uglifyFull','uglifySmall']);

gulp.task("uglifyFull", function() {
  return build(true,true);
});

gulp.task("uglifySmall", function() {
  return build(true,true);
});

gulp.task("package", ["build"], function() {
  var filename, i, json, len, ref, results;
  json = {
    name: config.name,
    version: config.version,
    author: config.author,
    license: config.license,
    description: config.description,
    main: "endev.full.js",
    moduleType: ["globals", "node", "amd", "es6", "yui"],
    repository: config.repository,
    bugs: config.bugs
  };
  ref = ["package", "bower"];
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    filename = ref[i];
    results.push(writeJSON("dist/" + filename + ".json", json, {
      spaces: 2
    }));
  }
  return results;
});

gulp.task("bump", function(){
  gulp.src(['./package.json','./bower.json'])
    .pipe(bump())
    .pipe(gulp.dest('./'));
});

gulp.task('deploy',  function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages({
      remove: false,
      cacheDir: "../gh-pages",
    }));
});