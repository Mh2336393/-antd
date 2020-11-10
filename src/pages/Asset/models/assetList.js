import moment from 'moment';
import { apiRequest } from '@/services/api';
import handleEsData from '../../../tools/handleEsData';
import completeArray from '../../../tools/completeArray';
// import configSettings from '../../../configSettings';
// import handleEsData from '@/tools/handleEsData';
/* eslint-disable camelcase */
// const { assetValueMap } = configSettings;

export default {
  namespace: 'assetList',
  state: {
    assetList: {
      totla: 0,
      list: [],
    },
    chartData: [],
    treeGroup: [],
    configInfo: {},
    manageConfig: {
      registerConfig: [],
      syncConfig: [],
      sysTimeConfig: [],
    },
    // timeList: [],
    registerCount: 0,
    detailItem: {},
    eventList: {
      total: 0,
      list: [],
      gt10000: false,
      // aggregations:{}
    },
    eventChart: {
      typeList: [],
      list: [],
      interval: '3h',
    },
  },

  effects: {
    *fetchAssetList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'asset/getAssetList', payload);
      
      if (!response) return;
      const { list, total } = response.data;
      const dataList = Array.isArray(list) ? list : [];
      const handledList = dataList.map(item => {
        const { Fevent_count, ...other } = item;
        return {
          ...other,
          Fevent_count: Fevent_count || 0,
        };
      });
      yield put({
        type: 'saveAssetList',
        payload: {
          assetList: {
            total: total || 0,
            list: handledList,
          },
        },
      });
    },

    *fetchAssetChartData({ payload }, { call, put }) {
      const { startTime, endTime } = payload;
      // const { timeRange, ...other } = payload;
      const response = yield call(apiRequest, 'asset/getAssetChartData', payload);
      if (!response) return;
      const dataList = Array.isArray(response.data) ? response.data : [];
      let tmpTime = moment(startTime).format('YYYY-MM-DD');
      const list = dataList.map(item => ({
        time: moment(item.key).format('YYYY-MM-DD'),
        value: item.assets_nums.value,
        title: item.title,
      }));
      const [key1, key2] = ['资产注册数量', '告警资产数量'];
      const chartMap = {};
      list.forEach(item => {
        if (!chartMap[item.time]) {
          chartMap[item.time] = {
            time: item.time,
            [key1]: item.title === key1 ? item.value : 0,
            [key2]: item.title === key2 ? item.value : 0,
          };
        } else {
          if (item.title === key1) {
            chartMap[item.time][key1] += item.value;
          }
          if (item.title === key2) {
            chartMap[item.time][key2] += item.value;
          }
        }
      });
      while (tmpTime <= moment(endTime).format('YYYY-MM-DD')) {
        if (!chartMap[tmpTime]) {
          chartMap[tmpTime] = {
            time: tmpTime,
            [key1]: 0,
            [key2]: 0,
          };
        }
        tmpTime = moment(tmpTime)
          .add(1, 'days')
          .format('YYYY-MM-DD');
      }
      yield put({
        type: 'saveChartData',
        payload: {
          chartData: Object.values(chartMap),
        },
      });
    },
    *fetchGroup({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'assetgroup/getlist', payload, true);
        const {
          data: { list },
        } = response;
        return Promise.resolve(list);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *addGroup({ payload }, { call }) {
      const { isAll, ...other } = payload;
      const uri = isAll ? 'addGroupAll' : 'addGroup';
      try {
        yield call(apiRequest, `asset/${uri}`, other, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchAssetListWithFilter({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'asset/getAssetListWithFilter', payload);
      if (!response) return;
      const { list, total } = response.data;
      const dataList = Array.isArray(list) ? list : [];
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
    *fetchFilterCount({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'asset/getFilterCount', payload, true);
        const filterObj = response.data || {};
        return Promise.resolve(filterObj);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateAsset({ payload }, { call }) {
      const { data } = payload;
      try {
        const response = yield call(apiRequest, 'assetfind/update', data, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *delAsset({ payload }, { call }) {
      const { isAll, ...other } = payload;
      const uri = isAll ? 'delAssetAll' : 'delAsset';
      try {
        yield call(apiRequest, `asset/${uri}`, other, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // 获取config
    *getAssetConfig(_, { call, put }) {
      const response = yield call(apiRequest, 'asset/getconfig');
      if (!response) return;
      console.log('data', response.data);
      yield put({
        type: 'saveConfig',
        payload: {
          configInfo: response.data,
        },
      });
    },
    // 获取导入记录
    *getLoadRecords({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'asset/getImportRecords', payload, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // 获取管理配置信息
    *getManageConfig(_, { call, put }) {
      const response = yield call(apiRequest, 'asset/manageConfig');
      if (!response || !response.data) return;
      const { registerConfig, syncConfig, sysTimeConfig } = response.data;
      yield put({
        type: 'manageConfig',
        payload: {
          manageConfig: { registerConfig, syncConfig, sysTimeConfig },
        },
      });
    },
    // 保存资产管理配置
    *saveManageConfig({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'asset/saveManageConfig', payload, true);
        console.log('res', response.data);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    //
    // *getTimeList({ payload }, { call, put }) {
    //   const response = yield call(apiRequest, 'asset/getTimeList', payload);
    //   if (!response) return;
    //   yield put({
    //     type: 'timeList',
    //     payload: {
    //       timeList: response.data,
    //     },
    //   });
    // },
    *addAsset({ payload }, { call }) {
      try {
        const uri = payload.Fid ? 'asset/updateAssetList' : 'asset/addAsset';
        const response = yield call(apiRequest, uri, payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // 编辑资产其他字段
    *updateAssetKeys({ payload }, { call }) {
      try {
        yield call(apiRequest, 'asset/updateAssetKeys', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // 全选更新其他字段
    *updateAllKeys({ payload }, { call }) {
      try {
        yield call(apiRequest, 'asset/updateAssetAllOthers', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // 过去一个自然日新注册资产
    *fetchNewRegister({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'asset/newAssets', payload);
      if (!response || !response.data) return;
      yield put({
        type: 'registerCount',
        payload: {
          registerCount: response.data,
        },
      });
    },
    // 获取所有分组
    *fetchAllGroups({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'asset/getAllGroups', payload, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *checkMacUnique({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'asset/checkMacUnique', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *getAssetDetail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'asset/getAssetDetail', payload);
      if (!response) return;
      // console.log('data', response.data);
      yield put({
        type: 'saveDetail',
        payload: {
          detailItem: response.data,
        },
      });
    },
    *fetchEventList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'asset/fetchEventList', payload);
      if (!response) return;
      const { list, total, chartData, interval, gt10000 } = response.data;
      const dataList = Array.isArray(list) ? list : [];
      yield put({
        type: 'saveEventList',
        payload: {
          eventList: {
            total: total || 0,
            list: handleEsData(dataList),
            gt10000,
          },
        },
      });
      // const { intent } = alarmEventValueMap;
      // const filledData = completeArrayAlarmChart(chartData, intent, { startTime, endTime });

      const filledData = completeArray(chartData);
      yield put({
        type: 'saveEventChart',
        payload: {
          eventChart: {
            typeList: filledData.typeList,
            list: filledData.list,
            interval,
          },
        },
      });
    },
  },

  reducers: {
    saveAssetList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveChartData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveGroupTree(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveConfig(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    manageConfig(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // timeList(state, { payload }) {
    //   return {
    //     ...state,
    //     ...payload,
    //   };
    // },
    registerCount(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveDetail(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventChart(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
