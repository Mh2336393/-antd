import { apiRequest } from '@/services/api';

export default {
  namescape: 'platform',
  state: {
    hardwareList: {
      total: 0,
      type: 'hardware',
      list: [],
    },
    runningList: {
      total: 0,
      type: 'running',
      list: [],
    },
    platRunList: {
      total: 0,
      type: 'platRun',
      list: [],
    },
    sandboxList: {
      total: 0,
      type: 'sandbox',
      list: [],
    },
    ipsInfo: {},
  },
  effects: {
    // *fetchHardwareList(_, { call, put }) {
    //   const response = yield call(apiRequest, 'dashboard/platform');
    //   // console.log('res', response);
    //   if (!response) return;
    //   const list = response.data;
    //   yield put({
    //     type: 'saveHardware',
    //     payload: {
    //       hardwareList: {
    //         list,
    //         recordsTotal: response.data.length || 0,
    //         type: 'hardware',
    //       },
    //     },
    //   });
    // },
    *fetchIpsInfo(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getServicesIpInfo');
      if (!response) return;
      const ipsInfo = response.data || {};
      yield put({
        type: 'saveHardware',
        payload: {
          ipsInfo,
        },
      });
    },
    // *fetchRuningList(_, { call, put }) {
    //   const response = yield call(apiRequest, 'dashboard/running');
    //   if (!response) return;
    //   const list = response.data;
    //   yield put({
    //     type: 'saveRunning',
    //     payload: {
    //       runningList: {
    //         list,
    //         recordsTotal: response.data.length || 0,
    //         type: 'running',
    //       },
    //     },
    //   });
    // },
    *fetchPlatRun(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/platformRunning');
      if (!response) return;
      const list = response.data || [];
      yield put({
        type: 'saveRunning',
        payload: {
          platRunList: {
            list,
            recordsTotal: response.data.length || 0,
            type: 'platRun',
          },
        },
      });
    },
    *fetchSandboxList(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/sandbox');
      if (!response) return;
      const list = response.data;
      yield put({
        type: 'saveSandbox',
        payload: {
          sandboxList: {
            list,
            recordsTotal: response.data.length || 0,
            type: 'sandbox',
          },
        },
      });
    },
  },
  reducers: {
    saveHardware(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveRunning(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveSandbox(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
