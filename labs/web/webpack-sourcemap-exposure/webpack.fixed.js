const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true
  },

  // Production build without a public source map.
  devtool: false
};
