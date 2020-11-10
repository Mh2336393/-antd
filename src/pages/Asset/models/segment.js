/* eslint-disable consistent-return */
import { apiRequest } from '@/services/api';

export default {
  namespace: 'segment',
  state: {
    segementList: {
      recordsTotal: 0,
      list: [],
    },
    groups: [],
  },
  effects: {
    *fetchListNode({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'segment/getlistNode', payload);
      if (response.error_code === 0) {
        return Promise.resolve(response.msg);
      }
      return Promise.reject(response);
    },


    *fetchNetSegement({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'segment/getlist', payload);
      if (!response) return;
      const { data = {} } = response;
      yield put({
        type: 'getNetSegementList',
        payload: {
          segementList: {
            recordsTotal: data.recordsTotal || 0,
            list: data.list || [],
          },
        },
      });
    },
    *fetchGroups(_, { call, put }) {
      const response = yield call(apiRequest, 'segment/getGroups');
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'getGroupsList',
        payload: {
          groups: list,
        },
      });
    },
    *deleteNetsegement({ payload }, { call }) {
      try {
        const { data } = payload;
        const response = yield call(apiRequest, 'segment/delete', data, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateNetsegement({ payload }, { call, put }) {
      const { data, query } = payload;
      const response = yield call(apiRequest, 'segment/update', data);
      if (!response) return Promise.reject();
      yield put({
        type: 'fetchNetSegement',
        payload: query,
      });
   
      if (response.error_code === 0) {
        return Promise.resolve(response.msg);
      }
      return Promise.reject(response.msg);
    },
    *insertNetsegement({ payload }, { call, put }) {
      const { data, query } = payload;
      const response = yield call(apiRequest, 'segment/add', data);
      if (!response) return Promise.reject();
      yield put({
        type: 'fetchNetSegement',
        payload: query,
      });
      if (response.error_code === 0) {
        return Promise.resolve(response.msg);
      }
      return Promise.reject(response.msg);
    },
  },

  reducers: {
    getNetSegementList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getGroupsList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
