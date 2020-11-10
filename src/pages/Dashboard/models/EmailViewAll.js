import { apiRequest } from '@/services/api';

// function handleData = ()

export default {
  namespace: 'emailViewAll',
  state: {
    emailList: [],
    searchList: [],
  },
  effects: {
    *fetchEmailList({ payload }, { call, put }) {
      const { uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return;
      // console.log('all', response.data);
      yield put({
        type: 'commonStateData',
        payload: {
          emailList: response.data,
        },
      });
    },
    *clearEmailList(_, { put }) {
      yield put({
        type: 'commonStateData',
        payload: {
          emailList: [],
        },
      });
    },
    *fetchWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'topic/getWhiteList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    *deleteWhiteList({ payload }, { call }) {
      // const { uri, body } = payload;
      const response = yield call(apiRequest, 'topic/deleteWhiteList', payload);
      console.log('delWhite', response);
      if (!response) return Promise.reject();
      return Promise.resolve(response);
    },
    *searchWhiteList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'topic/searchWhitelist', payload, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }

      // if (!response) return Promise.reject();
      // return Promise.resolve(response.data);
    },
    *addToWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'topic/addWhiteList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
  },
  reducers: {
    commonStateData(state, { payload }) {
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
