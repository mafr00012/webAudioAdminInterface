const path = require('path');

module.exports = {
  entry: {
    app: './index/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './index/app.js',
  },
};
