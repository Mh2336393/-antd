// https://umijs.org/config/
/* eslint-disable no-unused-vars */
// import os from 'os';
import pageRoutes from './router.config';
import webpackplugin from './plugin.config';
import defaultSettings from '../src/defaultSettings';
import { utils } from 'umi';
const { winPath } = utils;

export default {
  // 升级umi3 平铺出来的属性***start
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    antd: true,
    default: 'zh-CN',
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    chrome: 79,
    safari: 10,
    firefox: false,
    edge: false,
    ios: false,
    ie: false,
  },
  // chunks: ['vendors', 'umi', 'antdesigns'],
  // ...(!process.env.TEST && os.platform() === 'darwin'
  // ? {
  //     dll: {
  //         include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
  //         exclude: ['@babel/runtime'],
  //     },
  //     hardSource: true,
  // }
  // : {}),
  // 升级umi3 平铺出来的属性***end

  // node_modules 目录不走babel编译
  nodeModulesTransform: {
    type: 'none',
    exclude: [],
  },

  define: {
    APP_TYPE: process.env.APP_TYPE || '',
  },
  // chunks: ['vendors', 'antdesigns', 'umi'],
  // 路由配置
  routes: pageRoutes,
  hash: true,
  proxy: {
    '/api': { target: 'http://127.0.0.1:3031/', changeOrigin: true },
  },
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
    'heading-color': '#54576A',
    'text-color': '#54576A',
    // 'font-family': 'Microsoft YaHei',
  },
  externals: {
    '@antv/data-set': 'DataSet',
  },
  outputPath: '../server/dist',
  publicPath: '/',
  disableDynamicImport: false,
  ignoreMomentLocale: true,

  lessLoader: {
    javascriptEnabled: true,
  },

  cssLoader: {
    // 这里的 modules 可以接受 getLocalIdent
    modules: {
      getLocalIdent: (context, localIdentName, localName) => {
        if (
          context.resourcePath.includes('node_modules') ||
          context.resourcePath.includes('ant.design.pro.less') ||
          context.resourcePath.includes('global.less') ||
          context.resourcePath.includes('common.less')
        ) {
          return localName;
        }
        const match = context.resourcePath.match(/src(.*)/);
        if (match && match[1]) {
          const antdProPath = match[1].replace('.less', '');
          const arr = winPath(antdProPath)
            .split('/')
            .map((a) => a.replace(/([A-Z])/g, '-$1'))
            .map((a) => a.toLowerCase());
          return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
        }
        return localName;
      }
    }
  },




  manifest: {
    basePath: '/',
  },
  chainWebpack: webpackplugin,
}
