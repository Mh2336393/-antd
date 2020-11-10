import { apiRequest } from '@/services/api';

export default {
  namespace: 'sandboxData',
  state: {
    sandboxList: {
      total: 0,
      list: [],
      sandbox: [],
      recordTotal: 0,
      sandIps: {},
    },
  },
  effects: {
    *fetchSandboxList(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/sanboxSetting');

      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveSandboxList',
        payload: {
          sandboxList: {
            sandbox: list,
            recordTotal: response.data.length || 0,
          },
          // sandboxList: list,
          // recordsTotal: response.data.length,
        },
      });
    },
    *fetchSandboxIps(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/getServiceIps');
      if (!response) return;
      yield put({
        type: 'saveSandboxList',
        payload: {
          sandIps: response.data || {},
        },
      });
    },
    *addEditSlaverHandle({ payload }, { call }) {
      try {
        yield call(apiRequest, 'systemset/addEditSlaverSetting', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *deleteSlaverHandle({ payload }, { call }) {
      try {
        yield call(apiRequest, 'systemset/delSlaverList', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },
  reducers: {
    saveSandboxList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
