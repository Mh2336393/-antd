import { apiRequest } from '@/services/api';

export default {
  namespace: 'reportApt',
  state: {
    eventTrend: [],
    md5List: [],
    assetList: [],
  },

  effects: {
    *fetchEventTrend({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getEventTrend', { ...payload });
      if (!response) return;
      const { data } = response;
      yield put({
        type: 'saveEventTrend',
        payload: {
          eventTrend: data,
        },
      });
    },
    *fetchMd5List({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getMd5List', { ...payload });
      if (!response) return;
      const { data } = response;
      yield put({
        type: 'saveMd5List',
        payload: {
          md5List: data,
        },
      });
    },
    *fetchRiskPropertyList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getRiskPropertyList', { ...payload });
      if (!response) return;
      const { data } = response;
      yield put({
        type: 'saveRiskPropertyList',
        payload: {
          assetList: data,
        },
      });
    },
  },

  reducers: {
    saveEventTrend(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveMd5List(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveRiskPropertyList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
