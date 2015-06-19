/**
 * Hi there :)
 *
 * endev requires some external libraries to work (angular,
 * underscore etc.), so we've provided two ways to build
 * from source: you can either bundle those dependenices
 * along with endev into a single file (good for getting
 * started fast, but bad if you already use those
 * dependencies elsewhere in your project) or you can build
 * endev without the dependencies and add them to your
 * HTML manually.
 *
 * To build a stand-alone file with all dependencies
 * included, use `grunt standalone`. Else just type `grunt`.
 *
 * The compiled files can be found in the dist/ folder.
 */
module.exports = function(grunt) {

	// Plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-html2js');

	// Tasks
  grunt.registerTask('default', ['html2js','concat:lib']);
  grunt.registerTask('standalone', ['html2js','concat:standalone']);

  // Config
	var concatOptions = {
		sourceMap: true,
		banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	};

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      lib: {
        options: concatOptions,
        src: [
          "src/endev.prefix",
          "tmp/templates.js",
          "src/*.js",
          "src/endev.suffix"
					],
        dest: 'dist/<%= pkg.name %>.js'
      },
      standalone: {
        options: concatOptions,
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
    html2js: {
      options: {
        module: "endev-templates",
        base: "src/templates"
      },
      main: {
        src: ['src/**/*.tpl.html'],
        dest: 'tmp/templates.js'
      },
    }
  });
};
