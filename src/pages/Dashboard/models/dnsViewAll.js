import { apiRequest } from '@/services/api';

export default {
  namespace: 'dnsViewAll',
  state: {
    dnsList: [],
    searchList: [],
  },
  effects: {
    *fetchDnsList({ payload }, { call, put }) {
      const { uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return;
      yield put({
        type: 'commonStateRevise',
        payload: {
          dnsList: response.data,
        },
      });
    },
    *clearList(_, { put }) {
      yield put({
        type: 'commonStateRevise',
        payload: {
          dnsList: [],
        },
      });
    },
    *fetchWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'dashboard/getWhiteList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    *deleteWhiteList({ payload }, { call }) {
      // const { uri, body } = payload;
      const response = yield call(apiRequest, 'dashboard/deleteWhiteList', payload);
      console.log('delWhite', response);
      if (!response) return Promise.reject();
      return Promise.resolve(response);
    },
    *searchWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'dashboard/searchWhitelist', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    *addToWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'dashboard/addWhiteList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
  },
  reducers: {
    commonStateRevise(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveSearchIpList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
