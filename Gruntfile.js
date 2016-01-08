module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
      dist: {
        expand: true,
        cwd: 'dist/',
        src: '**',
        dest: '../gh-pages/',        
      }
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
        files: ['src/**/*.js','src/**/*.prefix','src/**/*.suffix'],
        tasks: [ 'default' ]
      },
    },
    'gh-pages': {
      options: {
        base: 'dist',
        add: true,
        clone: '../gh-pages'
      },
      src: ['**']
    },bump: {
      options: {
        files: ['package.json','bower.json'],
        updateConfigs: [],
        //commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json','bower.json'],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        prereleaseName: false,
      }
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
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('start', ['default','karma:unit:start','watch'])

  grunt.registerTask('full', ['html2js','concat','uglify','copy:dist'])

  // Default task(s).
  grunt.registerTask('default', ['html2js','concat:dist','uglify:dist']);

  grunt.registerTask('deploy',['full','gh-pages']);

  grunt.registerTask('release',['full','bump','gh-pages']);

};