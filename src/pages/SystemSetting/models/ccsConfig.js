import { apiRequest } from '@/services/api';

export default {
  namespace: 'ccsConfig',
  state: {
    configList: [],
    curCcsRole: '', // 未配置 上级 下级
    healthObj: {},
    ccsSelfObj: {},
  },

  effects: {
    *fetchConfigList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'ccs/getConfigList', payload);
      console.log('repsonse===', response);
      if (!response || !response.data) return;
      yield put({
        type: 'saveInfo',
        payload: {
          configList: response.data || [],
          curCcsRole: response.curCcsRole || '',
          healthObj: response.healthObj || {},
          ccsSelfObj: response.ccsSelfObj || {},
        },
      });
    },
    *editConfig({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'ccs/saveConfigList', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *ccsLinkTest({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'ccs/ccsIsAlive', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *destoryConfig(_, { call }) {
      try {
        const response = yield call(apiRequest, 'ccs/destory', {}, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // *delStrategyList({ payload }, { call }) {
    //   try {
    //     const response = yield call(apiRequest, 'block/delBlockStrategyList', payload, true);
    //     return Promise.resolve(response);
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
  },

  reducers: {
    saveInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
