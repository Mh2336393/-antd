/* eslint-disable no-param-reassign */
import { reject as _reject } from 'lodash';
import { message } from 'antd';
import { apiRequest } from '../../../services/api';

export default {
  namespace: 'debugConfig',
  state: {
    runningList: {
      list: [],
      recordsTotal: 0,
    },
    serverMemList: {
      list: [],
      recordsTotal: 0,
    },
    engineList: {
      list: [],
      recordsTotal: 0,
    },
    monitorThrehold: {},
    systemLog: {
      rows: [],
    },
    systemset: {
      temps: [],
    },
    probes: [],
    eventTypeList: [],
    flinkObj: {},
    webshellAiInfo: {},
    stats: {},
    sandboxTypeDistribution:{},
    masterStatus:[]
  },

  effects: {
    *fetchRunningList(_, { call, put }) {
      const response = yield call(apiRequest, 'systemMonitor/getRunningList');
      if (!response) return;
      const { data: list } = response;
      yield put({
        type: 'commonStateRevise',
        payload: {
          runningList: {
            list,
            recordsTotal: list.length || 0,
          },
        },
      });
    },
    *fetchFlinkCtrl(_, { call, put }) {
      const response = yield call(apiRequest, 'systemMonitor/getOriglog2esStatus');
      if (!response) return;
      const { data, eventTypeList } = response;
      const obj = data[0] || {};
      const flinkObj = {
        Fdeny_all: obj.Fdeny_all || 0,
        Fdeny_list: obj.Fdeny_list ? obj.Fdeny_list.split(',') : [],
      };
      yield put({
        type: 'commonStateRevise',
        payload: {
          flinkObj,
          eventTypeList,
        },
      });
    },
    *updateFlinkCtrl({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemMonitor/updateOriglog2esStatus', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchWebsellAi(_, { call, put }) {
      const response = yield call(apiRequest, 'systemMonitor/getWebshellAi');
      if (!response) return;
      yield put({
        type: 'commonStateRevise',
        payload: {
          webshellAiInfo: response.data || {},
        },
      });
    },
    *updateWebsellAi({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemMonitor/updateWebshellAi', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchServerMemList(_, { call, put }) {
      const response = yield call(apiRequest, 'systemMonitor/getServerMemList');
      if (!response) return;
      const { data: list } = response;
      yield put({
        type: 'commonStateRevise',
        payload: {
          serverMemList: {
            list,
            recordsTotal: list.length || 0,
          },
        },
      });
    },
    *fetchEngineList(_, { call, put }) {
      const response = yield call(apiRequest, 'systemMonitor/getEngineList');
      if (!response) return;
      const { data: list } = response;
      yield put({
        type: 'commonStateRevise',
        payload: {
          engineList: {
            list,
            recordsTotal: list.length || 0,
          },
        },
      });
    },
    *fetchMonitorThrehold(_, { call, put }) {
      const response = yield call(apiRequest, 'systemMonitor/getMonitorThrehold');
      if (!response) return Promise.reject();
      const { data } = response;
      yield put({
        type: 'commonStateRevise',
        payload: { monitorThrehold: data },
      });
      return Promise.resolve();
    },
    *updateMonitorThrehold({ payload }, { call }) {
      const response = yield call(apiRequest, 'systemMonitor/updateMonitorThrehold', payload);
      if (!response) return Promise.reject();
      return Promise.resolve();
    },
    *updateRunningState({ payload }, { call }) {
      const response = yield call(apiRequest, 'systemMonitor/updateRunningState', payload);
      if (!response) return Promise.reject();
      return Promise.resolve();
    },
    *authCheck({ payload }, { call }) {
      const response = yield call(apiRequest, 'systemMonitor/authCheck', payload);
      if (!response) return Promise.reject();
      return Promise.resolve();
    },
    *getSystemLogList({ payload }, { put, call }) {
      let res = null;
      try {
        res = yield call(apiRequest, 'systemMonitor/getSystemLogList', payload);
        if (res && !res.returnCode) {
          yield put({
            type: 'MERGE_SYSTEM_LOG_LIST',
            payload: {
              ...res.data,
            },
          });
        }
        return res;
      } catch (error) {
        return res;
      }
    },
    *getLogstashConfig(_, { call, put }) {
      try {
        const resp = yield call(apiRequest, 'logstash/getLogstashConfig');
        if (resp && !resp.returnCode) {
          yield put({
            type: 'MERGE_SYSTEMSET_TEMP',
            payload: {
              ...resp.data,
            },
          });
        }
        return resp;
      } catch (error) {
        return false;
      }
    },
    *delLogstashConfig({ payload }, { call, put }) {
      try {
        const resp = yield call(apiRequest, 'logstash/delLogstashConfig', payload);
        if (resp && !resp.returnCode) {
          yield put({
            type: 'DEL_SYSTEMSET_LOG',
            payload,
          });
        }
        return resp;
      } catch (error) {
        return false;
      }
    },
    *setLogstashConfig({ payload }, { call }) {
      try {
        const resp = yield call(apiRequest, 'logstash/setLogstashConfig', payload);
        return resp;
      } catch (error) {
        return message.error(error.msg);
      }
    },
    *fetchProbesData(_, { call, put }) {
      const resp = yield call(apiRequest, 'systemMonitor/getProbesCharts');
      if (!resp) return;
      yield put({
        type: 'saveProbes',
        payload: {
          probes: resp.data,
        },
      });
    },
    *fetchChartListData({ payload }, { call, put, select }) {
      const response = yield call(apiRequest, 'systemMonitor/lineChartData', payload);
      if (!response) return;
      const preProbesData = yield select(state => state.debugConfig.probes);
      // console.log('chart', response.data.chartData);
      const dataTemp = [].concat(preProbesData);
      dataTemp[response.data.index].chartData = response.data.chartData;
      yield put({
        type: 'saveProbes',
        payload: {
          probes: dataTemp,
        },
      });
    },
    *fetchStats(_, { call, put }) {
      const resp = yield call(apiRequest, 'systemMonitor/getAllStats');
      if (!resp) return;
      yield put({
        type: 'saveStats',
        payload: {
          stats: resp.data,
        },
      });
    },
    // 沙箱检测类型分布
    *queryHaboQueueSampleTypeCount(_, { call, put }) {
      const resp = yield call(apiRequest, 'systemMonitor/queryHaboQueueSampleTypeCount');
      if (!resp) return;
      yield put({
        type: 'saveStats',
        payload: {
          sandboxTypeDistribution: resp.data,
        },
      });
    },
    // 获得设备列表
    *queryHaboMasterStatus(_, { call, put }) {
      const resp = yield call(apiRequest, 'systemMonitor/queryHaboMasterStatus');
      if (!resp) return;
      yield put({
        type: 'saveStats',
        payload: {
          masterStatus: Object.keys(resp.data).map(key=>{
            return {
              name: key,
              value: resp.data[key]
            }
          }),
        },
      });
    },
    // 关机逻辑
    *handelShutdownLogic(_, { call }){
      const response = yield call(apiRequest, 'systemMonitor/handelShutdownLogic');
      if (!response) return Promise.reject();
      return Promise.resolve();
    },
    // 重启逻辑
    *handelRestartLogic(_, { call }){
      const response = yield call(apiRequest, 'systemMonitor/handelRestartLogic');
      if (!response) return Promise.reject();
      return Promise.resolve();
    },
    // 恢复出厂设置逻辑
    *handelRestoreFactorySettingsLogic(_, { call }){
      const response = yield call(apiRequest, 'systemMonitor/handelRestoreFactorySettingsLogic');
      if (!response) return Promise.reject();
      return Promise.resolve();
    },
  },

  reducers: {
    commonStateRevise(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    MERGE_SYSTEM_LOG_LIST(state, { payload }) {
      state.systemLog.rows = [].concat(payload.rows);
      return {
        ...state,
      };
    },
    MERGE_SYSTEMSET_TEMP(state, { payload }) {
      state.systemset.temps = [].concat(payload.rows);
      return {
        ...state,
      };
    },
    DEL_SYSTEMSET_LOG(state, { payload }) {
      state.systemset.temps = _reject(state.systemset.temps, {
        Fid: payload.Fid,
      });
      return {
        ...state,
      };
    },
    saveProbes(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveStats(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
