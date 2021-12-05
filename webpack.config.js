const path = require('path');

const config = [];

function generateConfig(name, type) {
  const compress = name.indexOf('min') > -1;

  const rulesEs5 = [{
    test: /\.ts$/,
    use: {
      loader: 'babel-loader'
    },
  }];

  const rulesDefault = [
    {
      test: /\.ts$/,
      loader: 'awesome-typescript-loader'
    }
  ];

  const rules = type === 'es5' ? rulesEs5 : rulesDefault;

  return {
    entry: './src/task-queue.ts',//入口配置
    output: {
      path: path.resolve(__dirname, type === 'es5' ? 'dist/es5' : 'dist'),
      libraryTarget: 'umd',
      filename: name + '.js',
      globalObject: 'this'
    },
    module: {
      rules
    },
    target: ['web', 'es5'],
    mode: compress ? 'production' : 'development'
  };
}

[
  {name: 'task-queue'},
  {name: 'task-queue-min'},
  {name: 'task-queue', type: 'es5'},
  {name: 'task-queue-min', type: 'es5'},
].forEach((item) => {
  config.push(generateConfig(item.name, item.type));
});

module.exports = config;
