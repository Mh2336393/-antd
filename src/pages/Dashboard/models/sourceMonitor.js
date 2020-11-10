import { apiRequest } from '@/services/api';
import moment from 'moment';
// const moment = require('moment');

export default {
  namespace: 'sourceMonitor',
  state: {
    probesData: [],
    brokenProbeInfo: [],// 坏的探针记录
    esError: '',
    // chartListData: {},
  },
  effects: {
    *fetchProbesData(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/allprobes');
      if (!response) return;
      let esError = response.msg !== 'succ' ? response.msg : '';

      // eslint-disable-next-line prefer-destructuring
      const {
        brokenProbeInfo = [],
        probeData = [],
      } = response.data
      if (brokenProbeInfo.length) {
        const ips = brokenProbeInfo.map(item => item.ip)
        esError = `探针名(${ips.toString()})网络通信异常`
      }
      const list = probeData.map(item => {
        const { chartData } = item;
        let newChartData = [].concat(chartData);
        newChartData = newChartData.map(data => {
          const obj = data;
          obj.timestamp = moment(data.timestamp).format('YYYY-MM-DD HH:mm:ss');
          return obj;
        });
        return {
          ...item,
          chartData: newChartData,
        };
      });
      yield put({
        type: 'saveProbesData',
        payload: {
          probesData: list,
          brokenProbeInfo,
          esError,
        },
      });
    },
    *fetchChartListData({ payload }, { call, put, select }) {
      const response = yield call(apiRequest, 'dashboard/lineChartData', payload);
      if (!response) return;
      const preProbesData = yield select(state => state.sourceMonitor.probesData);
      // console.log('chart', response.data.chartData);
      const dataTemp = [].concat(preProbesData);
      dataTemp[response.data.index].chartData = response.data.chartData;
      // console.log('data', dataTemp);
      yield put({
        type: 'saveProbesData',
        payload: {
          probesData: dataTemp,
        },
      });
    },
    *fetchRealTimePacks({ payload }, { call, put, select }) {
      const response = yield call(apiRequest, 'dashboard/realTimePacks', payload);
      if (!response) return;
      const preProbesData = yield select(state => state.sourceMonitor.probesData);
      // console.log('realtime', response.data);
      const dataTemp = [].concat(preProbesData);
      if (dataTemp.length !== 0) {
        dataTemp.forEach((item, index) => {
          if (item.sensor_id === response.data.sensor_id) {
            dataTemp[index].real_pack = response.data.real_pack;
          }
        });
      }
      yield put({
        type: 'saveProbesData',
        payload: {
          probesData: dataTemp,
        },
      });
    },
  },
  reducers: {
    saveProbesData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // saveChartListData(state, { payload }) {
    //   return {
    //     ...state,
    //     ...payload,
    //   };
    // },
  },
};
