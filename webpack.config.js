const path = require('path');
// const webpack = require('webpack');

module.exports = {
  mode: 'production',
  plugins: [
    // new webpack.ProvidePlugin({
    //   "boot": ""
    //     // "jQuery": "jquery",
    //     // "window.jQuery": "jquery",
    //     // "jquery": "jquery",
    //     // "window.jquery": "jquery",
    //     // "$": "jquery",
    //     // "window.$": "jquery"
    // })
  ],

  entry: {
    main: './app/js/app.js',
    pageA: './app/js/pages/pageA.js',
  },

  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/',
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true,
        },
      },
    },
  },

  module: {
    rules: [
      // {
      //   test: /\.(js)$/,
      //   exclude: /(node_modules)/,
      //   loader: 'babel-loader',
      //   query: {
      //     presets: ['@babel/env'],
      //   },
      // },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
          query: {
            presets: [['@babel/env', { modules: false }]],
          },
        },
      },
    ],
  },

  resolve: {
    alias: {
      '%modules%': path.resolve(__dirname, './app/js/modules/'),
    },
  },
};
