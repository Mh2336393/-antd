import { apiRequest } from '@/services/api';
import handleEsData from '../../../tools/handleEsData';
import moment from 'moment';
import lodash from 'lodash';

export default {
  namespace: 'emailSafe',
  state: {
    // emailCount: [],
    picInterval: 0,
    mailXYobj: {},
    attacheCount: [],
    sourceCountry: [],
    sendData: [],
    reciveData: [],
    fishMailData: [],
    falseMailList: [], // 邮件伪造列表
    maliciousMail: [],
    mailAttach: [],
    sendWhiteList: [],
    reciveWhiteList: [],
    fishWhiteList: [],
    falseWhiteList: [], // 邮件伪造白名单
  },
  effects: {
    *fetchSendWhiteList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getWhiteList', { type: 'email_sender' });
      if (!response) return;
      const whiteList = Array.isArray(response.data) ? response.data : [];
      const list = whiteList.map(item => item.email);
      yield put({
        type: 'saveSendWhiteList',
        payload: {
          sendWhiteList: list,
        },
      });
      yield put({
        type: 'fetchSendData',
        payload: Object.assign({ ...payload }, { whiteList: list }),
      });
    },
    *fetchReciveWhiteList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getWhiteList', { type: 'email_reciver' });
      if (!response) return;
      const whiteList = Array.isArray(response.data) ? response.data : [];
      const list = whiteList.map(item => item.email);
      yield put({
        type: 'saveReciveWhiteList',
        payload: {
          reciveWhiteList: list,
        },
      });
      yield put({
        type: 'fetchReciveData',
        payload: Object.assign({ ...payload }, { whiteList: list }),
      });
    },
    *fetchFishWhiteList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getWhiteList', { type: 'email_domain' });
      if (!response) return;
      const whiteList = Array.isArray(response.data) ? response.data : [];
      const list = whiteList.map(item => item.email);
      yield put({
        type: 'saveFishWhiteList',
        payload: {
          fishWhiteList: list,
        },
      });
      yield put({
        type: 'fetchFishMailData',
        payload: Object.assign({ ...payload }, { whiteList: list }),
      });
    },
    *fetchFalseWhiteList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getWhiteList', { type: 'email_srcIp' });
      if (!response) return;
      const whiteList = Array.isArray(response.data) ? response.data : [];
      const list = whiteList.map(item => item.email);
      yield put({
        type: 'saveFishWhiteList',
        payload: {
          falseWhiteList: list,
        },
      });
      // 邮件伪造列表
      yield put({
        type: 'fetchFalseMailList',
        payload: Object.assign({ ...payload }, { whiteList: list }),
      });
    },
    *fetchAttachCount({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getAttachCount', payload);
      if (!response) return;
      const typeArr = ['其他邮件', '钓鱼邮件', '邮件伪造', '恶意附件'];
      const mailXYobj = {};
      const list = Array.isArray(response.data) ? response.data : [];
      const hanledData = list.map((item, index) => {
        const obj = {};
        if (item.buckets) {
          const typeName = typeArr[index];
          mailXYobj[typeName] = {};
          obj.type = typeName;
          item.buckets.forEach(data => {
            const time = moment(data.key).format('YYYY-MM-DD HH:mm:ss');
            obj[time] = data.doc_count;
            mailXYobj[typeName][time] = data;
          });
        }
        return obj;
      });

      let interval = 0;
      if (hanledData[0]) {
        const timeKey = Object.keys(hanledData[0]);
        interval = new Date(timeKey[2]).getTime() - new Date(timeKey[1]).getTime();
      }
      const picInterval = lodash.isNaN(interval) ? 0 : interval;

      yield put({
        type: 'getAttachCountInfo',
        payload: {
          attacheCount: hanledData,
          picInterval,
          mailXYobj,
        },
      });
    },
    *fetchEventId({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'topic/getEvilMailLinkId', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchSourceCountry({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getSourceCountry', payload);
      if (!response) return;
      yield put({
        type: 'getSourceCountryInfo',
        payload: {
          sourceCountry: response.data,
        },
      });
    },
    *fetchSendData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getSendData', payload);
      if (!response) return;
      yield put({
        type: 'getSendDataInfo',
        payload: {
          sendData: response.data,
        },
      });
    },
    *fetchReciveData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getReciveData', payload);
      if (!response) return;
      yield put({
        type: 'getReciveDataInfo',
        payload: {
          reciveData: response.data,
        },
      });
    },
    *fetchFishMailData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getFishMailData', payload);
      if (!response) return;
      yield put({
        type: 'getFishMailDataInfo',
        payload: {
          fishMailData: response.data,
        },
      });
    },
    *fetchFalseMailList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getFalseMailList', payload);
      if (!response) return;
      yield put({
        type: 'getFishMailDataInfo',
        payload: {
          falseMailList: response.data,
        },
      });
    },
    *fetchMaliciousMail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getMaliciousMailData', payload);
      if (!response) return;
      const list = handleEsData(response.data);
      yield put({
        type: 'getMalicousMailDataInfo',
        payload: {
          maliciousMail: list,
        },
      });
    },
    *fetchMailAttach({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'topic/getMailAttachData', payload);
      if (!response) return;
      const data = response.data.map(item => ({ x: item.key, y: item.doc_count }));
      yield put({
        type: 'getMailAttachDataInfo',
        payload: {
          mailAttach: data,
        },
      });
    },
  },
  reducers: {
    getMailCountInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getAttachCountInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getSourceCountryInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getSendDataInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getReciveDataInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getFishMailDataInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getMalicousMailDataInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getMailAttachDataInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveSendWhiteList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveReciveWhiteList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveFishWhiteList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
