import { apiRequest } from '@/services/api';
// import handleEsData from '../../../tools/handleEsData';
import moment from 'moment';

export default {
  namespace: 'dataLeakage',
  state: {
    interfaceTopList: [],
    reqsTopList: [],
    interfaceEvents: {
      list: [],
      total: 0,
    },
    reqsEvents: {
      list: [],
      total: 0,
    },
    interfaceDetail: [],
    reqsDetail: [],
    picTotal: 0,
    sensitiveDataTrend: [],
    categoryArr: [],
    dataleakKeys: [],
  },
  effects: {
    *fetchInterfaceTrend({ payload }, { call, put }) {
      // const { startTime, endTime } = payload;
      const response = yield call(apiRequest, 'dataleak/interfaceTrend', payload);

      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      const hanledData = list.map(item => {
        const obj = {};
        if (item.cateNums.buckets) {
          obj.type = item.key;
          item.cateNums.buckets.forEach(data => {
            const time = moment(data.key).format('YYYY-MM-DD HH:mm:ss');
            obj[time] = data.doc_count;
          });
        }
        return obj;
      });
      yield put({
        type: 'saveSensDataTrend',
        payload: {
          sensitiveDataTrend: hanledData,
          picTotal: response.total || 0,
        },
      });
    },
    *fetchInterfaceTop({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dataleak/interfaceTop', payload);
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          interfaceTopList: response.data,
        },
      });
    },
    *fetchReqFromTop({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dataleak/reqFromTop', payload);
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          reqsTopList: response.data,
        },
      });
    },
    // 接口泄露事件
    *fetchInterfaceEvents({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dataleak/interfaceLeakEvents', payload);
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          interfaceEvents: {
            list: response.data || [],
            total: response.total || 0,
          },
        },
      });
    },
    // 请求源泄露事件
    *fetchReqsEvents({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dataleak/reqsLeakEvents', payload);
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          reqsEvents: {
            list: response.data || [],
            total: response.total || 0,
          },
        },
      });
    },
    *fetchCategory(_, { call, put }) {
      const response = yield call(apiRequest, 'dataleak/getCategory');
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          categoryArr: response.data || [],
        },
      });
    },
    // 访问接口泄露事件--请求方明细
    *fetchInterfaceDetail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dataleak/interfaceLeakEventsDetailReqs', payload);
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          interfaceDetail: response.data,
        },
      });
    },
    // 访问请求源泄露事件--接口明细
    *fetchReqsDetail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dataleak/reqsLeakEventsDetailInterface', payload);
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          reqsDetail: response.data,
        },
      });
    },
    *fetchDataleakKey(_, { call, put }) {
      const response = yield call(apiRequest, 'dataleak/getDataleakKeys');
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          dataleakKeys: response.data || [],
        },
      });
    },
    *updateDataleakKey({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'dataleak/setDataleakKeys', payload, true);
        return Promise.resolve(response);
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
    saveSensDataTrend(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
