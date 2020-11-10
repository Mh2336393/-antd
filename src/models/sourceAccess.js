import { apiRequest } from '@/services/api';

export default {
  namespace: 'sourceAccess',
  state: {
    sourceData: [],
    brokenSourceData: [],// 坏的探针记录
    recordsTotal: 0,
    sourceInfo: {},
    pcapConfig: {},
    httpBodyConfig: {},
    httpHeadConfig: {},
    logsConfig: [],
    xffConfig: {},
    netCardIp: {},
    interfaces: {},
    tce: {},
    group: {},
    vxlan_port: '',
    driver:''
  },
  effects: {
    *fetchSourceData(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/dataAccess');
      // console.log('res', response);
      if (!response) return;
      const list = response.data.unharmedRecord;// 好的探针记录
      const brokenList = response.data.brokenRecord;// 坏的探针记录
      const sourceData = list.concat(brokenList)
      yield put({
        type: 'saveSourceData',
        payload: {
          sourceData,
          brokenSourceData: brokenList,
          recordsTotal: sourceData.length,
        },
      });
    },
    *deleteSourceList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemset/deleteSource', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateSourceState({ payload }, { call }) {
      const { uri, body } = payload;
      try {
        const response = yield call(apiRequest, uri, body, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateSourceDate({ payload }, { call }) {
      const response = yield call(apiRequest, 'systemset/updateSource', payload);
      if (response) {
        return Promise.resolve(response);
      }
      return Promise.reject();
    },
    *connection({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemset/testSource', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchNetworkCard({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'systemset/network_card', payload, true);
        const list = [];
        const netCardIp = {};
        response.msg.forEach(item => {
          list.push(item[0]);
          netCardIp[item[0]] = item[1] || '';
        });
        yield put({
          type: 'saveSourceData',
          payload: {
            netCardIp,
          },
        });
        return Promise.resolve(list);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *addSourceList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemset/addSource', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *addRules({ payload }, { call }) {
      // console.log('pay', payload);
      try {
        const response = yield call(apiRequest, 'systemset/saveStrategy', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *probeDistribution({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemset/probeDistribution', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *updateLogsConfig({ payload }, { call }) {
      const response = yield call(apiRequest, 'systemset/setLogsConfig', payload);
      if (response) {
        return Promise.resolve(response);
      }
      return Promise.reject();
    },

    *updatePcapConfig({ payload }, { call }) {
      const response = yield call(apiRequest, 'systemset/setPcapConfig', payload);
      if (response) {
        return Promise.resolve(response);
      }
      return Promise.reject();
    },
    *getEngineCard({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemset/engine_network_card', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *getGroupAddress({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemset/group_address', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    /**
     * 提供一次性获取所有探针配置的apt_control接口：get_suricata_config_all。避免WEB每次单个调用。
     * @param {*} param0 
     * @param {*} param1 
     */
    *getSuricataConfigAll({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'systemset/getSuricataConfigAll', payload);
      if (!response) return;
      let types = [];
      if (response.msg.log) {
        Object.keys(response.msg.log).forEach(name => {
          if (response.msg.log[name] === true) {
            types.push(name);
          }
        });
      } else {
        types = null
      }
      yield put({
        type: 'saveProbeConfig',
        payload: {
          xffConfig: response.msg.xff,
          httpBodyConfig: response.msg.http_body,
          httpHeadConfig: response.msg.http_header,
          pcapConfig: response.msg.pcap,
          logsConfig: types,
          interfaces: response.msg.interfaces,
          tce: response.msg.tce,
          group: response.msg.group,
          vxlan_port: response.msg.vxlan_port,
          driver: response.msg.driver
        },
      });
    },
  },
  reducers: {
    saveSourceData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveProbeConfig(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
