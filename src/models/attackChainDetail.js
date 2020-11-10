import { apiRequest } from '@/services/api';
import handleEsData from '../tools/handleEsData';

export default {
  name: 'eventDetail',
  state: {
    eventList: {
      recordsTotal: 0,
      list: [],
    },
    chartData: [],
  },

  effects: {
    *fetchEventList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getAttackChainsEvents', payload);
      if (!response) return;
      const hits = Array.isArray(response.data.hits) ? response.data.hits : [];
      const list = handleEsData(hits);
      const total = response.data.total ? response.data.total : 0;

      yield put({
        type: 'saveEventList',
        payload: {
          eventList: {
            list,
            recordsTotal: total > 10000 ? 10000 : total,
          },
        },
      });
    },
    *fetchAttackChain({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getAttackChains', payload);
      if (!response) return;
      const { aggs } = response.data;
      yield put({
        type: 'saveChartList',
        payload: {
          chartData: aggs,
        },
      });
    },

    *handleEvent({ payload }, { call, put }) {
      const { ids, query } = payload;
      const response = yield call(apiRequest, 'event/handleFallEvent', { ids });
      if (!response) return;
      yield put({
        type: 'fetchEventList',
        payload: query,
      });
    },
  },

  reducers: {
    saveChartList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
