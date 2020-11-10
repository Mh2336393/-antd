// Change theme plugin

import MergeLessPlugin from 'antd-pro-merge-less';
import AntDesignThemePlugin from 'antd-theme-webpack-plugin';
// import uglifyjsWebpackPlugin from 'uglifyjs-webpack-plugin';
import path from 'path';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

export default config => {
  // pro 和 开发环境再添加这个插件
  if (process.env.APP_TYPE === 'site' || process.env.NODE_ENV !== 'production') {
    // 将所有 less 合并为一个供 themePlugin使用
    const outFile = path.join(__dirname, '../.temp/ant-design-pro.less');
    const stylesDir = path.join(__dirname, '../src/');

    config.plugin('merge-less').use(MergeLessPlugin, [
      {
        stylesDir,
        outFile,
      },
    ]);
    config.plugin('case-sensitive-paths').use(CaseSensitivePathsPlugin, [
      {
        // debug: true,
        debug: false, // tce合入
      },
    ]);
    config.plugin('ant-design-theme').use(AntDesignThemePlugin, [
      {
        antDir: path.join(__dirname, '../node_modules/antd'),
        stylesDir,
        varFile: path.join(__dirname, '../node_modules/antd/lib/style/themes/default.less'),
        mainLessFile: outFile, //     themeVariables: ['@primary-color'],
        indexFileName: 'index.html',
        generateOne: true,
        lessUrl: 'https://gw.alipayobjects.com/os/lib/less.js/3.8.1/less.min.js',
      },
    ]);
  } else {
    // config.plugin('uglifyjs').use(uglifyjsWebpackPlugin, [
    //   {
    //     sourceMap: false,
    //     uglifyOptions: {
    //       compress: {
    //         // remove `console.*`
    //         drop_console: true,
    //       },
    //       output: {
    //         // whether to actually beautify the output
    //         beautify: false,
    //         // remove all comments
    //         comments: false,
    //       },
    //     },
    //   },
    // ]);
  }

  // config.optimization.splitChunks({
  //   cacheGroups: {
  //     vendors: {
  //       name: 'vendors',
  //       chunks: 'all',
  //       // test: /[\\/]node_modules[\\/]([^@ant-design]|[^antd]|[^bizcharts]|[^d3])[\\/]/,
  //       test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|jquery|lodash)[\\/]/,
  //     },

  //     antdesigns: {
  //       name: 'antdesigns',
  //       chunks: 'async',
  //       test: /[\\/]node_modules[\\/](@ant-design|antd|bizcharts|d3)[\\/]/,
  //       minChunks: 2,
  //       minSize: 0,
  //     },
  //   },
  // });
};
