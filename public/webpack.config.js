module.exports = {
  entry: './entry.tsx',
  output: {
    path: __dirname,
    //publicPath: __dirname+'/public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.css$/, loader: "style!css" },
      {test: /\.tsx?$/, loader: 'ts-loader!ts-jsx-loader?target=es3&identifier=react.jsx' }
    ]
  }
};