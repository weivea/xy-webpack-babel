var webpack = require('webpack')

module.exports = {
  /*devtool: 'source-map',
  entry: [
    './jsEntries/index'
  ],
  output: {
    path: 'dist',
    filename: 'bundle.js',
    publicPath: 'dist'
  },*/
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel' ,
        query: {
          presets: ["es2015", "react"]
        },
        exclude: /node_modules/,
        include: process.cwd()
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.sass/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded&indentedSyntax'
      },
      {
        test: /\.scss/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
      },
      {
        test: /\.less/,
        loader: 'style-loader!css-loader!postcss-loader!less-loader'
      },
      {
        test: /\.styl/,
        loader: 'style-loader!css-loader!postcss-loader!stylus-loader'
      },
      {
        test: /\.(png|jpg|gif|woff|woff2)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.html$/,
        loader: "html?config=otherHtmlLoaderConfig",
        include: process.cwd()+'/app_statics',
      }
    ]
  },
  otherHtmlLoaderConfig: {
    ignoreCustomFragments: [/\{\{.*?}}/]
  },
  postcss: function () {
    return [];
  }

};