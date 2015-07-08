gulp       = require "gulp"
sourcemaps = require "gulp-sourcemaps"
browserify = require "browserify"
source     = require "vinyl-source-stream"
buffer     = require "vinyl-buffer"
stringify  = require "stringify"
ngAnnotate = require "gulp-ng-annotate"

gulp.task "default", ->
    bundler = browserify
        entries: ["src/index.js"]
        debug: yes
        transform: do stringify
        standalone: "endev"

    bundler.bundle()
        .pipe(source "endev.full.js")
        .pipe(do buffer)
        .pipe(sourcemaps.init loadMaps: yes)
        .pipe(do ngAnnotate)
        .pipe(sourcemaps.write "./")
        .pipe(gulp.dest "./dist")
