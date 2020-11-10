import { apiRequest } from '@/services/api';

export default {
  namespace: 'aptUpload',

  state: {
    upList: {
      recordsTotal: 0,
      list: [],
    },
    upDetail: {},
    todayCount: 0,
    fileExists: false,
    // category2List: [],
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'scan/getAptUpList', payload);
      if (!response) return;
      const list = Array.isArray(response.data.list) ? response.data.list : [];
      yield put({
        type: 'saveList',
        payload: {
          upList: {
            recordsTotal: response.data.recordsTotal || 0,
            list,
          },
        },
      });
    },
    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'scan/getAptUpDetail', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveList',
        payload: {
          upDetail: list[0] || {},
        },
      });
    },
    *fileExists({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'file/vmFileExists', payload, true);
        yield put({
          type: 'saveList',
          payload: {
            fileExists: response.data,
          },
        });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *delHandle({ payload }, { call }) {
      try {
        yield call(apiRequest, 'scan/delAptUpList', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
