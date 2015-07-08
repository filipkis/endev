gulp       = require "gulp"
sourcemaps = require "gulp-sourcemaps"
browserify = require "browserify"
source     = require "vinyl-source-stream"
buffer     = require "vinyl-buffer"
stringify  = require "stringify"
ngAnnotate = require "gulp-ng-annotate"
config     = require "./package.json"
writeJSON  = require("jsonfile").writeFileSync

gulp.task "default", ["package"], ->

gulp.task "build", ->
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

gulp.task "package", ["build"], ->
    json =
        name:        config.name
        version:     config.version
        author:      config.author
        license:     config.license
        description: config.description
        main:        "endev.full.js"
        moduleType:  ["globals", "node", "amd", "es6", "yui"]
        repository:  config.repository
        bugs:        config.bugs
        
    for filename in ["package", "bower"]
        writeJSON "dist/#{filename}.json", json, spaces: 2
