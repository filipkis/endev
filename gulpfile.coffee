gulp       = require "gulp"
sourcemaps = require "gulp-sourcemaps"
browserify = require "browserify"
source     = require "vinyl-source-stream"
buffer     = require "vinyl-buffer"
stringify  = require "stringify"
ngAnnotate = require "gulp-ng-annotate"

gulp.task "default", ->
        bundler = browserify
            entries: ["src/js/endev.js"]
            debug: yes
            transform: do stringify

        bundler.bundle()
            .pipe(source "endev.full.js")
            .pipe(do buffer)
            .pipe(do ngAnnotate)
            .pipe(do sourcemaps.init)
            .pipe(sourcemaps.write "./")
            .pipe(gulp.dest "./dist")
