import { apiRequest } from '@/services/api';

export default {
  namespace: 'networkSegment',
  state: {
    netSegmemtList: {
      recordsTotal: 0,
      list: [],
    },
  },
  effects: {
    *fetchNetworkSegmentList({ payload }, { call, put }) {
      const { uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return;
      const list = response.data;
      yield put({
        type: 'commonStateRevise',
        payload: {
          netSegmemtList: {
            recordsTotal: response.recordsTotal || 0,
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
    commonStateRevise(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
