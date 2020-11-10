import { apiRequest } from '@/services/api';

export default {
  namespace: 'block',

  state: {
    blockModules: [],
    blockModuleObj: {},
    strategyData: { recordsTotal: 0, list: [] },
    whiteData: { recordsTotal: 0, list: [] },
    logList: { recordsTotal: 0, list: [] },
    eventRuleData: { recordsTotal: 0, list: [] },
    eRuleObj: {},
    rulesData: { recordsTotal: 0, list: [] },
    currentUser: {},
    allEids: [],
    allRids: [],
    logCleanData: {},
  },

  effects: {
    *fetchBlockModules({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'block/getBlockModules', payload);
      if (!response || !response.data) return;
      const list = response.data || [];
      const blockModuleObj = {};
      list.forEach(obj => {
        blockModuleObj[obj.Fid] = obj.Fname;
      });
      yield put({
        type: 'saveBlock',
        payload: { blockModules: list, blockModuleObj },
      });
    },
    *testModuleLink({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/tryBlockModuleLink', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // *testIpConflict({ payload }, { call }) {
    //   try {
    //     const response = yield call(apiRequest, 'block/tryBlockIpConflict', payload, true);
    //     return Promise.resolve(response);
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    *setBlockModules({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/setBlockModules', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchStrategyList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'block/getBlockStrategyList', payload);
      if (!response || !response.data) return;
      yield put({
        type: 'saveBlock',
        payload: { strategyData: response.data },
      });
    },
    *addStrategyList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/addBlockStrategy', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateStrategyList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/editBlockStrategy', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *delStrategyList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/delBlockStrategyList', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // *updateStrategyStatus({ payload }, { call }) {
    //   try {
    //     const response = yield call(apiRequest, 'block/updateBlockStrategyStatus', payload, true);
    //     return Promise.resolve(response);
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    *fetchWhiteList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'block/getBlockWhiteList', payload);
      if (!response || !response.data) return;
      yield put({
        type: 'saveBlock',
        payload: { whiteData: response.data },
      });
    },
    *delWhiteList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/delBlockWhiteList', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *addWhiteList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/addBlockWhiteList', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateWhiteList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/editBlockWhiteList', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchLogList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'block/getBlockLogList', payload);
      if (!response || !response.data) return;
      yield put({
        type: 'saveBlock',
        payload: { logList: response.data },
      });
    },
    *fetchEventList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'block/getEventRuleList', payload);
      if (!response || !response.data) return;
      yield put({
        type: 'saveBlock',
        payload: {
          eventRuleData: response.data,
          eRuleObj: response.eRuleObj || {},
        },
      });
    },
    *getAllEids({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'block/getAllEventId', payload, true);
        yield put({
          type: 'saveBlock',
          payload: { allEids: response.data || [] },
        });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchRulesByEid({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/getRulesByEid', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchLogClean(_, { call, put }) {
      try {
        const response = yield call(apiRequest, 'block/getLogCleanInfo', {}, true);
        yield put({
          type: 'saveBlock',
          payload: { logCleanData: response.data || {} },
        });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *editLogClean({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'block/SaveLogCleanInfo', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchRuleList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'block/getRulesList', payload);
      if (!response || !response.data) return;
      yield put({
        type: 'saveBlock',
        payload: { rulesData: response.data },
      });
    },
    *getAllRids({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'block/getAllRulesId', payload, true);
        yield put({
          type: 'saveBlock',
          payload: { allRids: response.data || [] },
        });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    saveBlock(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
