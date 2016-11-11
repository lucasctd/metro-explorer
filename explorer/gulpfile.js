var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    mix.browserify('./resources/standalone/explorer.js', 'build/js/exp_standalone.js')
        .browserify('./resources/assets/js/jquery.js', 'build/js/jquery.js')
        .styles(['./resources/assets/css/explorer.css', './resources/assets/css/explorerIcons.css',
                './resources/assets/css/reset.css', './resources/assets/extensions/exUpload/exUpload.css'], 'build/css/explorer.css')
        .copy('./resources/assets/icons', 'build/icons')
        .copy('./resources/assets/templates', 'build/templates')
        .copy('./resources/lang', 'build/lang')
        .browserSync({proxy: 'http://localhost:9999'});
});
