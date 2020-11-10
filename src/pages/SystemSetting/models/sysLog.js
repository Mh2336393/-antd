import { apiRequest } from '@/services/api';

export default {
  namespace: 'sysLog',
  state: {
    logList: {
      total: 0,
      list: [],
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'sysLog/getLogList', payload);
      if (!response) return;
      const list = Array.isArray(response.data.list) ? response.data.list : [];
      yield put({
        type: 'saveList',
        payload: {
          logList: {
            total: response.data.total || 0,
            list,
          },
        },
      });
    },
    *putAndDelete({ payload }, { call }) {
      const { uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return Promise.reject();
      return Promise.resolve();
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
