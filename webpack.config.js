const path = require('path')

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/index.js')
  },
  output: {
    filename: 'seed.js',
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
  },
  resolve: {
    alias: {
      emitter$: 'component-emitter'
    }
  }
}
