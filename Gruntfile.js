module.exports = function(grunt) {
  var config = {};

  // Put your JavaScript library dependencies here. e.g. jQuery, underscore,
  // etc.
  // You'll also have to install them using a command similar to:
  //     npm install --save jquery
  var VENDOR_LIBRARIES = [
    'awesomplete',
    'd3-scale',
    'd3-format',
    'jquery',
    'datatables.net'
  ];

  config.browserify = {
    options: {
      browserifyOptions: {
        debug: true
      }
    },
    app: {
      src: ['js/src/app.js'],
      dest: 'js/app.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'app.min.js.map',
              output: './js/app.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              "presets": [
                ["env", {
                  "targets": {
                    "browsers": ["last 2 versions", "ie >= 11"]
                  }
                }]
              ]
            }
          ]
        ]
      }
    },
    appsat: {
      src: ['js/src/appsat.js'],
      dest: 'js/appsat.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'appsat.min.js.map',
              output: './js/appsat.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              "presets": [
                ["env", {
                  "targets": {
                    "browsers": ["last 2 versions", "ie >= 11"]
                  }
                }]
              ]
            }
          ]
        ]
      }
    }
  };

  // Check if there are vendor libraries and build a vendor bundle if needed
  if (VENDOR_LIBRARIES.length) {
    config.browserify.app.options = config.browserify.app.options || {};
    config.browserify.app.options.exclude = VENDOR_LIBRARIES;

    config.browserify.vendor = {
      src: [],
      dest: 'js/vendor.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'vendor.min.js.map',
              output: './js/vendor.min.js.map'
            }
          ]
        ],
        require: VENDOR_LIBRARIES
      }
    };
  }

  config.sass = {
    options: {
      outputStyle: 'compressed',
      sourceMap: true,
      includePaths: [ 'sass/', 'node_modules/trib-styles/sass/', 'node_modules/datatables.net-dt/css' ]
    },
    app: {
      files: {
        'css/styles.css': 'sass/styles.scss'
      }
    },
    sat: {
      files: {
        'css/styles-sat-scores.css': 'sass/styles-sat-scores.scss'
      }
    }
  };

  config.postcss = {
    options: {
      processors: [
        require('autoprefixer')({
          browsers: [
            "Android 2.3",
            "Android >= 4",
            "Chrome >= 20",
            "Firefox >= 24",
            "Explorer >= 8",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"
          ]
        }) 
      ]
    },
    dist: {
      src: 'css/*.css'
    }
  }

  config.watch = {
    sass: {
      files: ['sass/**/*.scss'],
      tasks: ['sass', 'postcss']
    },
    js: {
      files: ['js/src/**/*.js'],
      tasks: ['browserify']
    },
   svg: {
      files: ['img/src/**/*.svg'],
      tasks: ['svgstore']
    }
  };


  config.svgstore = {
    options: {
      cleanup:false,
      cleanupdefs:false
      // prefix : "icon-", // This will prefix each ID 
      // svg: { // will add and overide the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG 
      //   viewBox : "0 0 100 100",
      //   xmlns: "http://www.w3.org/2000/svg"
      // }
    },
    min: {
      // Target-specific file lists and/or options go here. 
      src:["img/src/**/*.svg"],
      dest:"img/sprite.svg"
    },
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-svgstore');

  var defaultTasks = [];

  defaultTasks.push('sass');
  defaultTasks.push('browserify');
  defaultTasks.push('postcss');
  defaultTasks.push('svgstore');

  grunt.registerTask('default', defaultTasks);
};
