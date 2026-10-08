const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true
  },

  // Intentionally vulnerable for demonstration purposes.
  devtool: "source-map"
};
