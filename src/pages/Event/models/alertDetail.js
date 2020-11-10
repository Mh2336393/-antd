import { apiRequest } from '@/services/api';
import handleEsData from '../../../tools/handleEsData';

/* eslint-disable no-underscore-dangle */

export default {
  namespace: 'alertDetail',
  state: {
    eventDetail: {},
    ipCateObj: {},
    warningData: { recordTotal: 0, list: [] },
    logData: { recordTotal: 0, list: [] },
    pcapInfo: {},
    ruleNameObj: {},
    blockEventRes: {},
  },

  effects: {
    *fetchEventDetail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getEventDetail', payload);
      if (!response || !response.data) return;
      const { _source, _id } = response.data;
      const eventDetail = { ..._source, _id };
      eventDetail.vpcid = eventDetail.src[0].vpcid || eventDetail.dst[0].vpcid;
      // console.log('detail', eventDetail);
      // 攻击者受害者ip
      const { attackerIps, victimIps, iocType = '' } = _source;
      const ipCateObj = {};
      if (iocType !== 'domain') {
        attackerIps.forEach(tmp => {
          ipCateObj[tmp] = '攻击者';
        });
      }
      victimIps.forEach(tmp => {
        ipCateObj[tmp] = '受害者';
      });
      yield put({
        type: 'saveAlertDetail',
        payload: { eventDetail, ipCateObj },
      });
    },
    *fetchWarningData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getWarningData', { indexType: 'alert', ...payload });
      if (!response || !response.data) return;
      yield put({
        type: 'saveWarningData',
        payload: {
          warningData: {
            list: Array.isArray(response.data) ? handleEsData(response.data) : [{ ...response.data._source, _id: response.data._id }],
            recordsTotal: response.recordsTotal || 0,
          },
          ruleNameObj: response.ruleNameObj || {},
          blockEventRes: response.blockEventRes || {},
        },
      });
    },
    *fetchLogData({ payload }, { call, put }) {
      // 请求接口和fetchWarningData一致，数据源是一样的，因为要有不同的分页，所以要请求两次
      const response = yield call(apiRequest, 'event/getWarningData', { indexType: 'alert', ...payload });
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
    *fetchPcapInfo({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'event/getPcapInfo', payload, true);
        yield put({
          type: 'savePcapInfo',
          payload: {
            pcapInfo: response.data,
          },
        });
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchAssetMap({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'assetfind/getAssetInfo', payload, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    saveAlertDetail(state, { payload }) {
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
    savePcapInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
