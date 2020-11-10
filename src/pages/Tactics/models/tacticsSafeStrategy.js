import { apiRequest } from '@/services/api';

export default {
  namespace: 'tacticsSafeStrategy',
  state: {
    probeList: {
      recordsTotal: 0,
      list: [],
    },
    nodeArr: [],
    ruleList: {
      recordsTotal: 0,
      list: [],
    },
    otherRuleList: {
      recordsTotal: 0,
      list: [],
    },
  },
  effects: {
    *fetchEventList({ payload }, { call, put }) {
      const { name, uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return;
      const list = response.data;
      if (name === 'probeList') {
        yield put({
          type: 'commonStateRevise',
          payload: {
            [name]: {
              recordsTotal: response.recordsTotal || 0,
              list,
            },
            nodeArr: response.probeArr || [],
          },
        });
      } else {
        yield put({
          type: 'commonStateRevise',
          payload: {
            [name]: {
              recordsTotal: response.recordsTotal || 0,
              list,
            },
          },
        });
      }
    },
    *putAndDelete({ payload }, { call }) {
      const { uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return Promise.reject();
      return Promise.resolve();
    },
    *fetchNodesEids({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'eventManage/getNodesEids', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *handleNodeEids({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'eventManage/handleRuleToProbe', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
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
