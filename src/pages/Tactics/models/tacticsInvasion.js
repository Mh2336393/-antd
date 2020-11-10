import { apiRequest } from '@/services/api';

export default {
  namespace: 'tacticsInvasion',

  state: {
    eventList: {
      recordsTotal: 0,
      list: [],
    },
    getMerge: {},
    editInfo: {},
    maxids: {},
  },

  effects: {
    *fetchEventList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getAlertManage', payload);
      if (!response) return;
      const list = Array.isArray(response.data.list) ? response.data.list : [];
      yield put({
        type: 'saveEventList',
        payload: {
          eventList: {
            recordsTotal: response.data.recordsTotal || 0,
            list,
          },
        },
      });
    },
    *fetchEditInfo({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getAlertRuleDetail', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveEventList',
        payload: {
          editInfo: list[0] || {},
        },
      });
    },
    *deleteHandleEvent({ payload }, { call }) {
      const { ids } = payload;
      // const response = yield call(apiRequest, 'event/delAlertManage', { ids });
      // if (!response) return;
      // yield put({
      //   type: 'fetchEventList',
      //   payload: query,
      // });
      try {
        yield call(apiRequest, 'event/delAlertManage', { ids }, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *addEditHandleEvent({ payload }, { call }) {
      const { obj, modalTitle } = payload;
      let reqRoute = '';
      if (modalTitle === '编辑') {
        reqRoute = 'event/editAlertManage';
      } else {
        reqRoute = 'event/putAlertManage';
      }
      try {
        const response = yield call(apiRequest, reqRoute, obj, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *addThisEventToAllProbes({ payload }, { call }) {
      const response = yield call(apiRequest, 'event/addThisEventToAllProbes', payload);
      if (response) {
        return Promise.resolve(response);
      }
      return Promise.reject();
    },



    *ruleNameIsHas({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'event/ruleNameIsHas', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *parseRule({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'event/parseSigRule', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *buildRule({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'event/buildSigRule', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *validateRule({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'event/verifyRule', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchMaxids({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getMaxids', payload);
      if (!response) return;
      const maxids = response.data || {};
      yield put({
        type: 'saveEventList',
        payload: {
          maxids,
        },
      });
    },
    *getGlobalMerge(_, { call, put }) {
      const response = yield call(apiRequest, 'event/get_global_merge');
      if (!response) return;
      yield put({
        type: 'saveGlobalMerge',
        payload: {
          getMerge: response.msg,
        },
      });
    },

    *updateNodesRules(_, { call }) {
      console.log(9999)
      const response = yield call(apiRequest, 'event/updateNodesRules');
      if (response) {
        return Promise.resolve(response);
      }
      return Promise.reject();
    },

    *setGlobalMerge({ payload }, { call, put }) {
      const { merge, query } = payload;
      const response = yield call(apiRequest, 'event/set_global_merge', { merge });
      if (!response) return;
      yield put({
        type: 'fetchEventList',
        payload: query,
      });
    },
  },

  reducers: {
    saveEventList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveGlobalMerge(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
