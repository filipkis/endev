gulp       = require "gulp"
concat     = require "gulp-concat"
uglify     = require "gulp-uglify"
sourcemaps = require "gulp-sourcemaps"

gulp.task "basic", ->
        gulp.src [
          "tmp/templates.js",
          "src/utils.js",
          "src/xml2json.js",
          "src/modules/datatag/**/*.js",
          "src/modules/endev/endev.js",
          "src/modules/endev/directives/*.js",
          "src/modules/endev/factories/*.js",
          "src/modules/endev/services/*.js",
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
