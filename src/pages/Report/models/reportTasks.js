import { apiRequest } from '@/services/api';

export default {
  namespace: 'reportTasks',

  state: {
    autoList: {
      recordsTotal: 0,
      list: [],
    },
  },

  effects: {
    *fetchAutoList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getReportAutoList', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveAutoList',
        payload: {
          autoList: {
            recordsTotal: response.recordsTotal || 0,
            list,
          },
        },
      });
    },
    *delAutoList({ payload }, { call }) {
      try {
        yield call(apiRequest, 'report/delReportAutoList', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateAutoList({ payload }, { call }) {
      try {
        yield call(apiRequest, 'report/putReportAutoList', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateListState({ payload }, { call }) {
      try {
        yield call(apiRequest, 'report/changeReportAutoListState', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *getReportHisList(_, { call }) {
      const response = yield call(apiRequest, 'report/getReportHisList');
      if (!response) return Promise.reject();
      return Promise.resolve(response);
    },
    *getTemplateLists(_, { call }) {
      const response = yield call(apiRequest, 'report/reportTemplates');
      if (!response) return Promise.reject();
      return Promise.resolve(response);
    },
    *getAssetLists(_, { call }) {
      const response = yield call(apiRequest, 'report/groupsAssets');
      if (!response) return Promise.reject();
      return Promise.resolve(response);
    },
    *generaterReoprt({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'report/generateReport', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *generateAutoTask({ payload }, { call }) {
      try {
        yield call(apiRequest, 'report/generateAutoTask', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    saveAutoList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // saveHisList(state, { payload }) {
    //   return {
    //     ...state,
    //     ...payload,
    //   };
    // },
  },
};
