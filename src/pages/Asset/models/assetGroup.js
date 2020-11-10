import { apiRequest } from '@/services/api';

export default {
  namespace: 'assetGroup',

  state: {
    assetGroupList: {
      recordsTotal: 0,
      list: [],
    },
    // filterAssetList: {
    //   recordsTotal: 0,
    //   list: [],
    // },
    // groupDetail: {
    //   groupInfo: {},
    //   assetList: [],
    // },
    // userList: [],
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'assetgroup/getlist', payload);
      if (!response) return;
      const { data = {} } = response;
      yield put({
        type: 'saveState',
        payload: {
          assetGroupList: {
            recordsTotal: data.total || 0,
            list: data.list || [],
          },
        },
      });
    },
    *addGroup({ payload }, { call, put }) {
      const { data, query } = payload;
      try {
        const response = yield call(apiRequest, 'assetgroup/addgroup', data, true);
        // if (!response) return;
        yield put({ type: 'fetchList', payload: query });
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }

      // if (!response) return;
      // yield put({ type: 'fetchList', payload: query });
    },
    *updateGroup({ payload }, { call, put }) {
      const { data, query } = payload;
      try {
        const response = yield call(apiRequest, 'assetgroup/updategroup', data, true);
        yield put({ type: 'fetchList', payload: query });
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
      // const response = yield call(apiRequest, 'assetgroup/updategroup', data);
      // if (!response) return;
      // yield put({ type: 'fetchList', payload: query });
    },
    *delGroup({ payload }, { call, put }) {
      const { data, query } = payload;
      const response = yield call(apiRequest, 'assetgroup/delgroup', data);
      if (!response) return;
      yield put({ type: 'fetchList', payload: query });
    },
  },

  reducers: {
    saveState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    resetState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getUserList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
