import { apiRequest } from '@/services/api';

export default {
  namespace: 'propertyFind',

  state: {
    findList: {
      recordsTotal: 0,
      list: [],
    },
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'property/getAssetsFindlist', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveList',
        payload: {
          findList: {
            recordsTotal: response.recordsTotal || 0,
            list,
          },
        },
      });
    },
    *registerList({ payload }, { call }) {
      try {
        yield call(apiRequest, 'property/registerAssets', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *registerListHandle({ payload }, { call }) {
      try {
        yield call(apiRequest, 'property/registerAssetsHandle', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
