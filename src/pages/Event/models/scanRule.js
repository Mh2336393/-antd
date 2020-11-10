// import { apiRequest } from '@/services/api';

/* eslint-disable no-unused-vars */

export default {
  namespace: 'scanRule',

  state: {
    // eventList: {
    //   recordsTotal: 0,
    //   list: [],
    // },
    getRule: {},
  },

  effects: {
    // *fetchScanRule(_, { call, put }) {
    //   const response = yield call(apiRequest, 'scan/getScanRule');
    //   if (!response) return;
    //   yield put({
    //     type: 'saveData',
    //     payload: {
    //       getRule: response.msg || {},
    //     },
    //   });
    // },
    // *updateScanRule({ payload }, { call }) {
    //   try {
    //     yield call(apiRequest, 'scan/setScanRule', payload, true);
    //     return Promise.resolve();
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    // *validateRule({ payload }, { call }) {
    //   try {
    //     yield call(apiRequest, 'event/verifyRule', payload, true);
    //     return Promise.resolve();
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    // *ruleNameIsHas({ payload }, { call }) {
    //   try {
    //     const response = yield call(apiRequest, 'event/ruleNameIsHas', payload, true);
    //     return Promise.resolve(response);
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
  },

  reducers: {
    saveData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
