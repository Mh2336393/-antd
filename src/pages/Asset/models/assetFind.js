import moment from 'moment';
import { apiRequest } from '@/services/api';

const format = 'YYYY-MM-DD';

export default {
  namespace: 'assetFind',

  state: {
    assetFindList: {
      recordsTotal: 0,
      list: [],
    },
    treeGroup: [],
    chartData: [],
    status: 'off',
    detailItem: {},
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'assetfind/getlist', payload);
      if (!response) return;
      // const { data = {} } = response;
      const {list, recordsTotal} = response.data;
      const dataList = Array.isArray(list) ? list : [];
      const handleList = dataList.map(item => {
        const {Fevent_count, ...other} = item;
        return {
          ...other,
          Fevent_count: Fevent_count || 0,
        }
      })
      yield put({
        type: 'saveList',
        payload: {
          assetFindList: {
            recordsTotal: recordsTotal || 0,
            list: handleList,
          },
        },
      });
    },
    *batchRegister({ payload }, { call }) {
      // try {
      //   const { data } = payload;
      //   const response = yield call(apiRequest, 'assetfind/register', data);
      //   return Promise.resolve(response.data);
      // } catch (error) {
      //   return Promise.reject(error);
      // }
      const { isAll, ...other } = payload;
      const uri = isAll ? 'registerAssetAll' : 'registerAsset';
      console.log('other', other);
      try {
        const response = yield call(apiRequest, `assetfind/${uri}`, other, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *register({ payload }, { call }) {
      try {
        const { data } = payload;
        const response = yield call(apiRequest, 'assetfind/update', data);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchGroupTree({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'assetgroup/getlist', payload);
      if (!response) return;
      const { data = {} } = response;
      yield put({
        type: 'saveList',
        payload: {
          treeGroup: data.list || [],
        },
      });
    },
    *fetchFilterCount({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'assetfind/getFilterCount', payload, true);
        const filterObj = response.data || {};
        return Promise.resolve(filterObj);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *delAsset({ payload }, { call }) {
      const { isAll, ...other } = payload;
      const uri = isAll ? 'delAssetAll' : 'delAsset';
      try {
        const response = yield call(apiRequest, `assetfind/${uri}`, other, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchChartData({ payload }, { call, put }) {
      const { startTime, endTime } = payload;
      const response = yield call(apiRequest, 'assetfind/getChartData', payload);
      if (!response) return;
      const dataList = Array.isArray(response.data.result) ? response.data.result : [];

      // 将分组后相同日期的发现资产统计数与注册资产统计合为一个对象中
      const map = {};
      const newDataList = [];
      for (let i = 0; i < dataList.length; i++) {
        const data = dataList[i];
        if (!map[data.time]) {
          newDataList.push({
            time: data.time,
            asset: data.title === '新发现资产' ? data.value : 0,
            register: data.title === '新注册资产' ? data.value : 0,
          });
          map[data.time] = data;
        } else {
          for (let j = 0; j < newDataList.length; j++) {
            const newData = newDataList[j];
            if (newData.time === data.time) {
              newData.asset = data.title === '新发现资产' ? data.value : newData.asset;
              newData.register = data.title === '新注册资产' ? data.value : newData.register;
              break;
            }
          }
        }
      }

      let tmpTime = moment(startTime).format(format);
      const end = moment(endTime).format(format);
      const chartDataList = [];

      while (tmpTime <= end) {
        // eslint-disable-next-line no-loop-func
        const obj = newDataList.find(item => item.time === tmpTime);
        if (!obj) {
          chartDataList.push({
            time: tmpTime,
            新发现资产: 0,
            新注册资产: 0,
          });
        } else {
          chartDataList.push({
            time: tmpTime,
            新发现资产: obj.asset,
            新注册资产: obj.register,
          });
        }
        tmpTime = moment(tmpTime)
          .add(1, 'days')
          .format(format);
      }

      yield put({
        type: 'saveChartData',
        payload: {
          chartData: chartDataList || [],
        },
      });
    },
    // *registerAsset({ payload }, { call }) {
    //   const { isAll, ...other } = payload;
    //   const uri = isAll ? 'registerAssetAll' : 'registerAsset';
    //   try {
    //     const response = yield call(apiRequest, `assetfind/${uri}`, other, true);
    //     return Promise.resolve(response);
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    *checkAsset({ payload }, { call }) {
      const { isAll, ...other } = payload;
      const uri = isAll ? 'checkAssetAll' : 'checkAsset';
      try {
        const response = yield call(apiRequest, `assetfind/${uri}`, other, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchStatus(_, { call, put }) {
      const response = yield call(apiRequest, 'assetfind/getStatus');
      if (!response) return;
      yield put({
        type: 'saveStatus',
        payload: {
          status: response.data,
        },
      });
    },
    *changeStatus({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, `assetfind/changeStatus`, payload, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *getAssetDetail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'assetfind/getAssetDetail', payload);
      if (!response) return;
      // console.log('data', response.data);
      yield put({
        type: 'saveDetail',
        payload: {
          detailItem: response.data,
        },
      });
    },
  },

  reducers: {
    saveList(state, { payload }) {
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
    saveStatus(state, { payload }) {
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
  },
};
