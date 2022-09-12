const path = require('path')

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/main.js')
  },
  output: {
    filename: 'index.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Seed'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
