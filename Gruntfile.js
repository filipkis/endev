module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffeelint: {
      app: ['src/*.coffee'],
      options: {
        max_line_length: {
          level: 'ignore'
        },
        line_endings: {
          value: "unix",
          level: "error"
        },
      }
    },
    coffee: {
      compile: {
        files: [{
          expand: true,         // Enable dynamic expansion.
          cwd: 'src/',          // Src matches are relative to this path.
          src: ['**/*.coffee'], // Actual pattern(s) to match.
          dest: 'lib/',         // Destination path prefix.
          ext: '.js'            // Dest filepaths will have this extension.
          }],
        options: {
          bare: true            // Skip surrounding IIFE in compiled output.
        }
      }
    },
    concat: {
      dist: {
        options: {
          sourceMap: true,
          banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        src: [
          "src/endev.prefix",
          "tmp/templates.js",
          "src/*.js",
          "src/endev.suffix"],
        dest: 'dist/<%= pkg.name %>.js'
      },
      full: {
        options: {
          sourceMap: true,
          banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        src: [
          "bower_components/angular/angular.js",
          "bower_components/underscore/underscore.js",
          "bower_components/firebase/firebase.js",
          "bower_components/angularfire/dist/angularfire.js",
          "src/endev.prefix",
          "tmp/templates.js",
          "src/*.js",
          "src/endev.suffix"],
        dest: 'dist/<%= pkg.name %>.full.js'
      }
    },
    copy: {
      main: {
        expand: true,
        cwd: 'dist/',
        src: '**',
        dest: 'examples/lib/',
      },
    },
    html2js: {
      options: {
        module: "endev-templates",
        base: "src/templates"
      },
      main: {
        src: ['src/**/*.tpl.html'],
        dest: 'tmp/templates.js'
      },
    },
    jasmine: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/**/*.js',
        vendor: [
          "test/lib/*.js",
        ]
      }
    },
    karma: {
      options: {
        configFile: 'conf.js'
      },
      dev: {
        singleRun: false
      },
      unit: {
        singleRun: false,
        browsers: ['PhantomJS'],
        background: true
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js':['dist/<%= pkg.name %>.js']
        }
      },
      full: {
        files: {
          'dist/<%= pkg.name %>.full.min.js':['dist/<%= pkg.name %>.full.js']
        }
      }
    },
    watch: {
      templates: {
        files: ['src/**/*.tpl.html'],
        tasks: ['default']
      },
      spec: {
        files: ['src/**/*.js','spec/*.js'],
        tasks: ['karma:unit:run']
      },
      scripts: {
        files: ['src/**/*.js'],
        tasks: [ 'default' ]
      },
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.registerTask('start', ['default','karma:unit:start','watch'])

  grunt.registerTask('full', ['html2js','concat','uglify','copy'])

  // Default task(s).
  grunt.registerTask('default', ['html2js','concat:dist','uglify:dist']);

};