import { apiRequest } from '@/services/api';
import handleEsData from '../tools/handleEsData';

/* eslint-disable no-underscore-dangle */

export default {
  namespace: 'iocDetail',
  state: {
    eventDetail: {},
    ipCateObj: {},
    domainData: { recordTotal: 0, list: [] },
    sampleData: { recordTotal: 0, list: [] },
    warningData: { recordTotal: 0, list: [] },
    logData: { recordTotal: 0, list: [] },
    tagsDesc: {},
  },

  effects: {
    *fetchEventDetail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getEventDetail', payload);
      if (!response || !response.data) return;
      const { _source, _id } = response.data;
      const eventDetail = { ..._source, _id };
      eventDetail.vpcid = eventDetail.src[0].vpcid || eventDetail.dst[0].vpcid;

      // 攻击者受害者ip
      const { attackerIps, victimIps, iocType = '' } = _source;
      const ipCateObj = {};
      if (iocType !== "domain") {
        attackerIps.forEach(tmp => {
          ipCateObj[tmp] = '攻击者';
        });
      }
      victimIps.forEach(tmp => {
        ipCateObj[tmp] = '受害者';
      });
      yield put({
        type: 'saveIcoDetail',
        payload: { eventDetail, ipCateObj },
      });
    },
    *fetchWarningData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getWarningData', { indexType: 'ioc', ...payload });
      if (!response || !response.data) return;
      yield put({
        type: 'saveWarningData',
        payload: {
          warningData: {
            list: Array.isArray(response.data) ? handleEsData(response.data) : [{ ...response.data._source, _id: response.data._id }],
            recordsTotal: response.recordsTotal || 0,
          },
        },
      });
    },
    *fetchLogData({ payload }, { call, put }) {
      // 请求接口和fetchWarningData一致，数据源是一样的，因为要有不同的分页，所以要请求两次
      const response = yield call(apiRequest, 'event/getWarningData', { indexType: 'ioc', ...payload });
      if (!response || !response.data) return;
      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data.map(item => {
          const { _source, _id } = item;
          return { timestamp: _source.timestamp, payload: JSON.stringify({ ..._source, _id }) };
        });
      } else if (response.data) {
        const { _source, _id } = response.data;
        list = [{ timestamp: _source.timestamp, payload: JSON.stringify({ ..._source, _id }) }];
      }
      yield put({
        type: 'saveLogData',
        payload: {
          logData: {
            list,
            recordsTotal: response.recordsTotal || 0,
          },
        },
      });
    },
    *fetchDomainData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getDomainIcoData', payload);
      if (!response) return;
      yield put({
        type: 'saveDomainData',
        payload: {
          domainData: {
            list: Array.isArray(response.data) ? response.data : [],
            recordsTotal: response.recordsTotal || 0,
          },
        },
      });
    },
    *fetchSampleData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getSampleIcoData', payload);
      if (!response) return;
      yield put({
        type: 'saveSampleData',
        payload: {
          sampleData: {
            list: Array.isArray(response.data) ? response.data : [],
            recordsTotal: response.recordsTotal || 0,
          },
        },
      });
    },
    *fetchIoctagsDesc(_, { call, put }) {
      const response = yield call(apiRequest, 'event/getIoctagsDesc');
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
    saveIcoDetail(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveWarningData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveLogData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveDomainData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveSampleData(state, { payload }) {
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
