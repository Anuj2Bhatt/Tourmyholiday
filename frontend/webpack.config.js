const path = require('path');

module.exports = {
  // ... other webpack configurations
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify")
    }
  }
}; 