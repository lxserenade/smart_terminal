module.exports = function(grunt) {

    grunt.initConfig({

        watch: {
            scripts: {
                files: ['./js/jquery.yzePagination.js'],
                tasks: ['uglify'],
                options: {
                    spawn: false,
                },
            },
        },

        uglify: {
            my_target: {
                files: {
                    './js/jquery.yzePagination.min.js': ['./js/jquery.yzePagination.js']
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch', 'uglify']);

}