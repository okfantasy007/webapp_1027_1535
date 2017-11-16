module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt); 

  // Project configuration.
  grunt.initConfig({

    shell: {
      cleanbuild: {
        command: 'rm -rf build'
      },
      newbuild: {
        command: 'mkdir build/app -p'
      },
      sencha_production: {
        cwd: 'extroot',
        command: 'sencha app build'
      },
      sencha_testing: {
        cwd: 'extroot',
        command: 'sencha app build testing'
      },
      chmod: {
        cwd: 'build/app',
        command: 'chmod +x bin/www install.sh run.sh stop.sh'
      },
      clean: {
        cwd: 'build/app',
        command: 'find . -name "*.map" | xargs rm -f'
      },
      testing: {
        cwd: 'build/app/extroot/build',
        command: 'mv testing production'
      },
      // svnadd: {
      //   cwd: 'build/app',
      //   command: 'svn add * --force'
      // },
      // svncommit: {
      //   cwd: 'build/app',
      //   command: 'svn commit -m "sync"'
      // }
    },

    uglify: {
      options: {
        // mangle: false,  // 改变量名
        // reserved: ['async'], // 保留字
        sourceMap: true,      
      },    
      build: {
        files: [{
          expand: true,
          src: ['routes/**/*.js', 'modules/**/*.js', 'app.js', 'bin/www'],
          dest: 'build/app'
        }]
      }
    },

    copy: {
      public: {
        files: [
          // includes files within path
          {expand: true, src: ['package.json'], dest: 'build/app/', filter: 'isFile'},
          // includes files within path and its sub-directories
          {expand: true, src: ['node_modules/**', 'static/**', 'config/**', 'locales/**'], dest: 'build/app/'},
          {
            src: 'config/default_example.json',
            dest: 'build/app/config/default.json',
          },
          {
            expand: true,
            cwd: 'bin',
            src: ['run.sh', 'stop.sh', 'install.sh'],
            dest: 'build/app/',
            filter: 'isFile'
          }
        ]
      },

      production: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, src: ['extroot/build/production/**'], dest: 'build/app/'},
        ]
      },

      testing: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, src: ['extroot/build/testing/**'], dest: 'build/app/'},
          {expand: true, src: ['routes/**', 'modules/**', 'app.js', 'bin/www'], dest: 'build/app/'}
        ]
      }
    },

  });


  // Load the plugin that provides the "uglify" task.
  // I've achived this by installing the harmony branch of grunt-contrib-uglify, which supports es6:
  // npm install git://github.com/gruntjs/grunt-contrib-uglify.git#harmony --save-dev
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask(
    'default', 
    [
      'shell:cleanbuild', 
      'shell:newbuild',
      'shell:sencha_production',
      'uglify',
      'copy:public',
      'copy:production',
      'shell:chmod',
      'shell:clean',
    ]
  );

  grunt.registerTask(
    'debug', 
    [
      'shell:cleanbuild', 
      'shell:newbuild',
      'shell:sencha_testing',
      'copy:public',
      'copy:testing',
      'shell:chmod',
      'shell:clean',
      'shell:testing'
    ]
  );

};