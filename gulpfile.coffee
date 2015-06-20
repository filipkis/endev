gulp       = require "gulp"
concat     = require "gulp-concat"
uglify     = require "gulp-uglify"
sourcemaps = require "gulp-sourcemaps"

gulp.task "basic", ->
        gulp.src [
          "src/endev.prefix",
          "tmp/templates.js",
          "src/*.js",
          "src/directives/*.js",
          "src/factories/*.js",
          "src/endev.suffix"
        ]
            .pipe(sourcemaps.init())
            .pipe(concat "endev.js")
            .pipe(sourcemaps.write("endev.map.js"))
            .pipe(gulp.dest "dist")


gulp.task "full", ["basic"], ->
        gulp.src [
          "bower_components/angular/angular.js",
          "bower_components/underscore/underscore.js",
          "bower_components/firebase/firebase.js",
          "bower_components/angularfire/dist/angularfire.js",
          "dist/endev.js"
        ]
            .pipe(sourcemaps.init())
            .pipe(concat "endev.full.js")
            .pipe(sourcemaps.write("endev.full.map.js"))
            .pipe(gulp.dest "dist")
