import { apiRequest } from '@/services/api';

export default {
  namespace: 'templateFstPreview',
  state: {
    basicCollection: {
      list: [],
      logTrend: [],
      sandboxTrend: [],
    }, // 系统基础数据采集情况
    safetyOverview: {
      list: [],
      eventTrend: [],
      eventTrendAttack: [],
      affectedAssetsTrend: [],
    }, // 安全总览
    perceptionEventList: [], // 感知事件top
    perceptionEventAttackList: [], // 入侵感知事件top
    riskAssetsList: [], // 风险最高资产top
    tagsDesc: {},
  },

  effects: {
    *fetchReportInfo({ payload }, { call }) {
      const response = yield call(apiRequest, 'report/getReportInfo', { ...payload });
      if (!response) return Promise.reject();
      const { data } = response;
      return Promise.resolve(data);
    },
    *basicCollectionResults({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'reportFst/basicCollectionInfo', { ...payload });
      // console.log('basicCollectionResults', new Date());
      if (!response) return Promise.reject();
      const { data } = response;
      yield put({
        type: 'commonReviseState',
        payload: {
          basicCollection: data,
        },
      });
      return Promise.resolve();
    },
    *safetyOverviewResults({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'reportFst/safetyOverview', { ...payload });
      if (!response) return Promise.reject();
      const { data } = response;
      yield put({
        type: 'commonReviseState',
        payload: {
          safetyOverview: data,
        },
      });
      return Promise.resolve();
    },
    *perceptionEventResults({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'reportFst/perceptionEventTopN', { ...payload });
      if (!response) return Promise.reject();
      const { data } = response;
      yield put({
        type: 'commonReviseState',
        payload: {
          perceptionEventList: data.list,
        },
      });
      return Promise.resolve();
    },
    *perceptionEventAttackResults({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'reportFst/perceptionEventAttackTopN', { ...payload });
      if (!response) return Promise.reject();
      const { data } = response;
      yield put({
        type: 'commonReviseState',
        payload: {
          perceptionEventAttackList: data.list,
        },
      });
      return Promise.resolve();
    },
    *riskAssetsResults({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'reportFst/riskAssetsTopN', { ...payload });
      if (!response) return Promise.reject();
      const { data } = response;
      yield put({
        type: 'commonReviseState',
        payload: {
          riskAssetsList: data.list,
        },
      });
      return Promise.resolve();
    },
    *fetchIoctagsDesc(_, { call, put }) {
      const response = yield call(apiRequest, 'reportFst/getIoctagsDesc');
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      const allObj = {};
      for (let m = 0; m < list.length; m += 1) {
        const name = list[m].category;
        allObj[name] = list[m].desc;
      }
      yield put({
        type: 'saveIoctagsDesc',
        payload: {
          tagsDesc: allObj,
        },
      });
    },
  },

  reducers: {
    commonReviseState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveIoctagsDesc(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
