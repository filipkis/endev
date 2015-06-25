gulp       = require "gulp"
sourcemaps = require "gulp-sourcemaps"
browserify = require "browserify"
source     = require "vinyl-source-stream"
buffer     = require "vinyl-buffer"
stringify  = require "stringify"
ngAnnotate = require "gulp-ng-annotate"
uglify     = require "gulp-uglify"

gulp.task "default", ->
        bundler = browserify
            entries: ["src/js/endev.js"]
            debug: yes
            transform: do stringify

        bundler.bundle()
            .pipe(source "endev.full.js")
            .pipe(do buffer)
            .pipe(sourcemaps.init loadMaps: yes)
            .pipe(do ngAnnotate)
            .pipe(do uglify)
            .pipe(sourcemaps.write "./")
            .pipe(gulp.dest "./dist")
