import { apiRequest } from '@/services/api';

export default {
  namespace: 'audit',
  state: {
    logList: {
      recordsTotal: 0,
      list: [],
    },
  },
  effects: {
    *fetchLogList({ payload }, { call, put }) {
      const { uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return;
      const list = response.data;
      yield put({
        type: 'commonStateRevise',
        payload: {
          logList: {
            recordsTotal: response.recordsTotal || 0,
            list,
          },
        },
      });
    },
  },
  reducers: {
    commonStateRevise(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
