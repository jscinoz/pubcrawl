"use strict";

module.exports = function(grunt) {
  var harakaProcess;

  // Project configuration.
  grunt.initConfig({
    jshint: {
      files: [
        "grunt.js",
        "app/**/*.js",
        "!app/static/**/*.js",
        "lib/**/*.js",
        "test/**/*.js"
      ],
      options: {
        bitwise: true,
        trailing: true,
        es5: true,
        node: true,
        curly: true,
        eqeqeq: true,
        noempty: true,
        nonew: true,
        quotmark: "double",
        immed: true,
        latedef: true,
        newcap: true,
        regexp: true,
        unused: true,
        strict: true,
        smarttabs: true,
        indent: 4,
        maxparams: 4,
        maxdepth: 3,
        maxlen: 80,
        maxcomplexity: 5,
        noarg: true,
        white: false,
        globals: {
          "module": false,
          "exports": false,
          "require": false
        }
      }
    },
    nodeunit: {
      files: ["test/**/*.js"]
    },
    watch: {
      default: {
        files: "<%= jshint.files %>",
        tasks: "default"
      }/*,
      run: {
        files: "<%= jshint.files %>",
        tasks: ["stop", "start"]
      }*/
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-watch");

/*
  // Custom task to run the damn thing
  grunt.registerTask("start", "Start Haraka w/Pubcrawl", function() {
    var fork = require("child_process").fork;

    harakaProcess = fork(require.resolve("Haraka/haraka"), [], {
        env: {"HARAKA": "haraka"}
    });
  });

  grunt.registerTask("stop", "Stop a running Haraka instance", function() {
    console.log(harakaProcess);
  });
*/

  // Default task.
  grunt.registerTask("default", [
    "jshint",
    "nodeunit"
  ]);
};
