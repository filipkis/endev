gulp       = require "gulp"
sourcemaps = require "gulp-sourcemaps"
browserify = require "browserify"
source     = require "vinyl-source-stream"
buffer     = require "vinyl-buffer"
stringify  = require "stringify"

gulp.task "default", ->
        bundler = browserify
            entries: ["src/js/endev.js"]
            debug: yes
            transform: do stringify

        bundler.bundle()
            .pipe(source "endev.full.js")
            .pipe(do buffer)
            .pipe(do sourcemaps.init)
            .pipe(sourcemaps.write "./")
            .pipe(gulp.dest "./dist")
