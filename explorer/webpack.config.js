// webpack.config.js
module.exports = {
  // entry point of our application
  entry: './resources/standalone/explorer.js',
  // where to place the compiled bundle
  output: {
    path: './build/js/',
    filename: 'exp_standalone.js'
  }
}
