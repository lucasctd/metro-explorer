var elixir = require('laravel-elixir');
require('laravel-elixir-browserify-official');
require('laravel-elixir-stylus');

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
    mix.browserify('./resources/standalone/explorer.js', 'build/js/explorer.js')
        .browserify('jquery.js', 'build/js/jquery.js')
        .stylus(['explorerIcons.styl', 'explorer.styl'], './resources/assets/css/explorer.css')
       .styles(['reset.css', 'explorer.css', '../extensions/exUpload/exUpload.css'], 'build/css/explorer.css')
        .copy('./resources/assets/icons', 'build/icons')
        .copy('./resources/assets/templates', 'build/templates')
        .copy('./resources/lang', 'build/lang');
      //  .browserSync({proxy: 'http://localhost:9999'});
});
