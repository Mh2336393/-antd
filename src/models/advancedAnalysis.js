/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { apiRequest } from '@/services/api';
import configSettings from '@/configSettings';

const { assetValueMap } = configSettings;
const { FcategoryTypes } = assetValueMap;

export default {
  namespace: 'advancedAnalysis',

  state: {
    assetList: {
      totla: 0,
      list: [],
    },
    /** 资产分析表 */
    assetAnalysisTable: {
      totla: 0,
      list: [],
    },


  },

  effects: {
    /** 获取高级资产分析表 */
    *fetchAdvancedAssetAnalysisTable({ payload }, { call, put }) {
      const response = yield call(
        apiRequest,
        'advancedAnalysis/getAdvancedAssetAnalysisTable',
        payload
      );
      if (!response) return
      const { list, total } = response.data;
      let dataList = Array.isArray(list) ? list : [];
      dataList = dataList.map(item => {
        item['是否显示场景详情卡片'] = false;
        item.Fcategory_name = '';
        FcategoryTypes.forEach(type => {
          if (type.value === item.Fcategory) item.Fcategory_name = type.text;
        });
        return item;
      });
      yield put({
        type: 'saveAssetAnalysisTable',
        payload: {
          assetAnalysisTable: {
            total: total || 0,
            list: dataList,
          },
        },
      });


    },
    /** 添加资产分析表 */
    *addAssetAnalysisSheet({ payload }, { call }) {
      const response = yield call(apiRequest, 'advancedAnalysis/addAssetAnalysisSheet', payload);
      if (response) {
        return Promise.resolve(response);
      }
      return Promise.reject(false);
    },
    /** 编辑资产分析表 */
    *editAssetAnalysisSheet({ payload }, { call }) {
      const response = yield call(apiRequest, 'advancedAnalysis/editAssetAnalysisSheet', payload);
      if (response) {
        return Promise.resolve(response);
      }
      return Promise.reject(false);
    },

    /** 删除资产分析表 */
    *delAssetAnalysisSheet({ payload }, { call }) {
      const response = yield call(apiRequest, 'advancedAnalysis/delAssetAnalysisSheet', payload);
      if (response) {
        return Promise.resolve(response);
      }
      return Promise.reject(false);
    },

    /** 获取测算选项描述 */
    *fetchDescriptionOfMeasurementOptions({ payload }, { call }) {
      const response = yield call(apiRequest, 'advancedAnalysis/getDescriptionOfMeasurementOptions', payload);
      if (response) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(false);
    },

    /** 根据IP，场景名，获取指定时间阈值聚合 */
    *whetherThresholdExists({ payload }, { call }) {
      const response = yield call(apiRequest, 'advancedAnalysis/whetherThresholdExists', payload);
      if (response) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(false);
    },


    /** 获取阈值 */
    *fetchThresholdValue({ payload }, { call }) {
      const response = yield call(apiRequest, 'advancedAnalysis/getThresholdValue', payload);
      if (response) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(false);
    },

    /** 根据IP，场景名，获取指定时间阈值聚合 */
    *fetchThresholdValueAggs({ payload }, { call }) {
      const response = yield call(apiRequest, 'advancedAnalysis/getThresholdValueAggs', payload);
      if (response) {
        return Promise.resolve(response.data);
      }
      return Promise.reject(false);
    },

    *fetchAssetList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'asset/getAssetList', payload);
      if (!response) return
      const { list, total } = response.data;
      let dataList = Array.isArray(list) ? list : [];
      dataList = dataList.map(item => {
        item.Fcategory_name = '';
        FcategoryTypes.forEach(type => {
          if (type.value === item.Fcategory) item.Fcategory_name = type.text;
        });
        return item;
      });

      yield put({
        type: 'saveAssetList',
        payload: {
          assetList: {
            total: total || 0,
            list: dataList,
          },
        },
      });
    },
    *fetchGroup({ payload }, { call }) {
      const response = yield call(apiRequest, 'assetgroup/getlist', payload, true);
      if (response) {
        const {
          data: { list }
        } = response
        return Promise.resolve(list);
      }
      return Promise.reject(false);
    },
  },

  reducers: {
    saveAssetList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveAssetAnalysisTable(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
