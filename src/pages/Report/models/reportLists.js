import { apiRequest } from '@/services/api';

export default {
  namespace: 'reportLists',

  state: {
    reportList: {
      recordsTotal: 0,
      list: [],
    },
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getReportList', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveList',
        payload: {
          reportList: {
            recordsTotal: response.recordsTotal || 0,
            list,
          },
        },
      });
    },
    *handleDel({ payload }, { call }) {
      try {
        yield call(apiRequest, 'report/delReportList', payload, true);
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
