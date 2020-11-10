import { apiRequest } from '@/services/api';

export default {
  namespace: 'whiteListIpAndIoc',
  state: {
    eventList: {
      recordsTotal: 0,
      list: [],
    },
    ruleName: [],
  },
  effects: {
    *fetchEventList({ payload }, { call, put }) {
      const { uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return;
      const list = response.data;
      yield put({
        type: 'commonStateRevise',
        payload: {
          eventList: {
            recordsTotal: response.recordsTotal || 0,
            list,
          },
        },
      });
    },
    *fetchRuleName({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'eventManage/getRuleNames', payload, true);
        const ruleName = response.data || [];
        yield put({
          type: 'commonStateRevise',
          payload: {
            ruleName,
          },
        });
        return Promise.resolve({ ruleName });
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *putAndDelete({ payload }, { call }) {
      const { uri, body } = payload;
      const response = yield call(apiRequest, uri, body);
      if (!response) return Promise.reject();
      return Promise.resolve();
    },
    *updataTiEnable({ payload }, { call }) {
      try {
        const res = yield call(apiRequest, 'eventManage/setTiEnable', payload, true);
        return Promise.resolve(res.msg);
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
