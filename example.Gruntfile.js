module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: '<your email>',
                token: '<your auth token>',
                branch: 'default',
                //server: 'season'
            },
            dist: {
                src: ['src/*.js']
            }
        }
    });
}