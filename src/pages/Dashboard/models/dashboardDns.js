import { apiRequest } from '@/services/api';
import configSettings from '../../../configSettings';
import moment from 'moment';

export default {
  namespace: 'dashboardDns',
  state: {
    dnsTypeChartList: [],
    dnsErrorChartList: [],
    dnsWhiteList: [],
    domainWhiteList: [],
    dnsServerList: [],
    dnsDynamicDomainList: [],
  },

  effects: {
    *fetchDnsTypeAnalyzeChartData({ payload }, { call, put }) {
      const param = Object.assign({ ...payload }, { size: 10 });
      const response = yield call(apiRequest, 'dashboard/getDnsTypeAnalyze', param);
      if (!response) return;
      let hanledData = Array.isArray(response.data) ? response.data : [];
      hanledData = hanledData.map(item => {
        const obj = {
          x: item.key,
          y: item.doc_count,
          time: moment(item.time).format('YYYY-MM-DD HH:mm:ss'),
          percent: item.percent,
        };
        return obj;
      });
      yield put({
        type: 'saveDNSTypeChartList',
        payload: {
          dnsTypeChartList: hanledData,
        },
      });
    },
    *fetchDnsErrorAnalyzeChartData({ payload }, { call, put }) {
      const param = Object.assign({ ...payload }, { size: 10 });
      const response = yield call(apiRequest, 'dashboard/getDnsErrorAnalyze', param);
      if (!response) return;
      let hanledData = Array.isArray(response.data) ? response.data : [];
      hanledData = hanledData.map(item => {
        const obj = {
          name: item.key,
          value: item.doc_count,
          errorType: configSettings.errorType(item.key).text,
          type: 0,
          time: moment(item.time).format('YYYY-MM-DD HH:mm:ss'),
          percent: `${item.percent}%`,
        };
        return obj;
      });
      // 词云一个数据不能显示，要人工加一条（不好，先去掉）
      // if (hanledData.length === 1) {
      //   hanledData.push({ name: hanledData[0].name, value: 0, type: 0 });
      // }
      yield put({
        type: 'saveDNSErrorChartList',
        payload: {
          dnsErrorChartList: hanledData,
        },
      });
    },
    *fetchDnsWhiteList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getWhiteList', { type: 'dns_server' });
      if (!response) return;
      const whiteList = Array.isArray(response.data) ? response.data : [];
      const list = whiteList.map(item => item.ip);
      yield put({
        type: 'saveDnsWhiteList',
        payload: {
          dnsWhiteList: list,
        },
      });
      yield put({
        type: 'fetchDnsServerList',
        payload: Object.assign({ ...payload }, { whiteList: list }),
      });
    },
    *fetchDomainWhiteList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getWhiteList', { type: 'dynamic_domain' });
      if (!response) return;
      const whiteList = Array.isArray(response.data) ? response.data : [];
      const list = whiteList.map(item => item.ip);
      yield put({
        type: 'saveDomainWhiteList',
        payload: {
          domainWhiteList: list,
        },
      });
      yield put({
        type: 'fetchDnsDynamicDomainList',
        payload: Object.assign({ ...payload }, { whiteList: list }),
      });
    },
    *fetchDnsServerList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getDnsServerList', payload);
      if (!response) return;
      const hanledData = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveDnsServerList',
        payload: {
          dnsServerList: hanledData,
        },
      });
    },
    *fetchDnsDynamicDomainList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getDnsDynamicDomainList', payload);
      if (!response) return;
      const hanledData = Array.isArray(response.data) ? response.data : [];

      yield put({
        type: 'saveDnsDynamicDomainList',
        payload: {
          dnsDynamicDomainList: hanledData,
        },
      });
    },
  },

  reducers: {
    saveDNSTypeChartList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveDNSErrorChartList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveDnsWhiteList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveDomainWhiteList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveDnsServerList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveDnsDynamicDomainList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
