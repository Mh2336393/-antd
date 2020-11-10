import { apiRequest } from '@/services/api';

const initState = {
  asset: {},
  statics: {},
  config: {},
  safe: {
    failureList: [],
    eventList: [],
    analysisList: {
      total: 0,
      list: [],
    },
  },
};

export default {
  namespace: 'asset',

  state: {
    ...initState,
  },

  effects: {
    *fetchAssetConfig({ payload }, { call, put }) {
      const resp = yield call(apiRequest, 'asset/fetchAssetConfig', payload);
      if (resp && resp.error_code === 0) {
        yield put({
          type: 'MERGE_STATE_BY_KEY',
          payload: {
            key: 'config',
            value: {
              ...resp.data,
            },
          },
        });
      }
    },
    *fetchAssetInfo({ payload }, { call, put }) {
      const resp = yield call(apiRequest, 'asset/fetchAssetInfo', payload);
      if (resp && resp.error_code === 0) {
        yield put({
          type: 'MERGE_STATE_BY_KEY',
          payload: {
            key: 'asset',
            value: {
              ...resp.data,
            },
          },
        });
      }
    },
    *fetchAssetFlowStatic({ payload }, { call, put, select }) {
      const resp = yield call(apiRequest, 'asset/fetchAssetFlowStatic', payload);
      const state = yield select(current => current.asset);
      if (resp && resp.error_code === 0) {
        yield put({
          type: 'MERGE_STATE_BY_KEY',
          payload: {
            key: 'statics',
            value: {
              ...state.statics,
              [payload.Ftype]: {
                ...resp.data,
              },
            },
          },
        });
      }
    },
    *fetchSafetyStatus({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'asset/getSafetyStatus', payload);
      if (response && !response.returnCode) {
        yield put({
          type: 'MERGE_STATE_BY_KEY',
          payload: {
            key: 'safe',
            value: {
              ...response.data,
            },
          },
        });
      }
    },
  },
  reducers: {
    MERGE_STATE_BY_KEY(state, { payload }) {
      return {
        ...state,
        [payload.key]: payload.value,
      };
    },
  },
};
