import { apiRequest } from '@/services/api';

export default {
  namespace: 'systemSafety',

  state: {
    netAddrList: {
      recordsTotal: 0,
      list: [],
    },
    timeZoneTags: [],
    eth1: '',
    ntpObj: {},
    password: {},
    loginSet: {},
    areaInfo: [], // 中国省市地区
    devAreaSave: [], // 设备已安装地址
    logoUrl: {},
    curLogo: {},
    tianmu: {},
    webName: '高级威胁检测系统',
  },

  effects: {
    *fetchNetAddrList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'safety/getPlatformNetAddr', payload);
      if (!response) return;
      yield put({
        type: 'saveList',
        payload: {
          netAddrList: {
            recordsTotal: response.data.length,
            list: response.data,
          },
        },
      });
    },
    *fetchNetCard({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'safety/getPlatformNetCard', payload);
      if (!response) return;
      yield put({
        type: 'saveNetCard',
        payload: {
          eth1: response.msg || '',
        },
      });
    },
    *updateNetCard({ payload }, { call }) {
      try {
        yield call(apiRequest, 'safety/setPlatformNetCard', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchTimeZones(_, { put }) {
      const list = [
        {
          name: '北京-重庆-新加坡（UTC+8）',
          value: 'CST',
        },
      ];
      yield put({
        type: 'saveTimeZone',
        payload: {
          timeZoneTags: list,
        },
      });
    },
    *fetchNtpObj({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'safety/getNtpInfo', payload);
      if (!response) return;
      yield put({
        type: 'saveNtpInfo',
        payload: {
          ntpObj: response.data || {},
        },
      });
    },
    *updateNtpObj({ payload }, { call }) {
      try {
        yield call(apiRequest, 'safety/setNtpInfo', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchLogin(_, { call, put }) {
      const response = yield call(apiRequest, 'safety/getLoginInfo');
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      const obj = {};
      for (let i = 0; i < list.length; i += 1) {
        const key = list[i].web_key;
        const val = list[i].web_value;
        obj[key] = val;
      }
      yield put({
        type: 'saveLogin',
        payload: {
          loginSet: { ...obj } || {},
        },
      });
    },
    *updateLogin({ payload }, { call }) {
      try {
        yield call(apiRequest, 'safety/setLoginInfo', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchPassword(_, { call, put }) {
      const response = yield call(apiRequest, 'safety/getPasswordInfo');
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      if (list.length === 0) return;
      const obj = {};
      obj[list[0].web_key] = list[0].web_value;
      yield put({
        type: 'savePassword',
        payload: {
          password: { ...obj } || {},
        },
      });
    },
    *updatePassword({ payload }, { call }) {
      try {
        yield call(apiRequest, 'safety/setPasswordInfo', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateNetAddrList({ payload }, { call }) {
      try {
        yield call(apiRequest, 'safety/putPlatformNetAddr', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchAreaAndDeviceAddress(_, { call, put }) {
      try {
        const response = yield call(apiRequest, 'safety/getAreaAndDeviceAddress', {}, true);
        // console.log(169, 'response==', response);
        const {
          data: { areaInfo, devAddress },
        } = response;
        yield put({
          type: 'devAddressOperate',
          payload: {
            areaInfo, // 中国省市地区
            devAreaSave: devAddress, // 设备已安装地址
          },
        });
        return Promise.resolve(devAddress);
      } catch (error) {
        console.log(169, 'error==', error);
        return Promise.reject(error);
      }
    },
    *updateDeviceAddress({ payload }, { call }) {
      const response = yield call(apiRequest, 'safety/updateDeviceAddress', { ...payload });
      if (!response) Promise.reject();
      return Promise.resolve();
    },
    *fetchDeviceAddress(_, { call, put }) {
      const response = yield call(apiRequest, 'safety/getDeviceAddress');
      if (!response) Promise.reject();
      yield put({
        type: 'devAddressOperate',
        payload: {
          devAreaSave: response.data, // 设备已安装地址
        },
      });
      return Promise.resolve(response.data);
    },
    *updateWebName({ payload }, { call }) {
      try {
        yield call(apiRequest, 'safety/setWebName', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchLogosPath(_, { call, put }) {
      const response = yield call(apiRequest, 'safety/getLogosPath');
      if (!response) return;
      const { tablelogos } = response;
      const webName = tablelogos && tablelogos.web_name ? tablelogos.web_name : '高级威胁检测系统';
      yield put({
        type: 'saveLogin',
        payload: {
          logoUrl: response.data || {},
          curLogo: tablelogos || {},
          webName,
        },
      });
    },
    *updateLogosPath({ payload }, { call }) {
      try {
        yield call(apiRequest, 'safety/setLogosPath', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // *testSyslog({ payload }, { call }) {
    //   try {
    //     yield call(apiRequest, 'message/syslogTest', payload, true);
    //     return Promise.resolve();
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    // *testEmail({ payload }, { call }) {
    //   try {
    //     yield call(apiRequest, 'message/mailTest', payload, true);
    //     return Promise.resolve();
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    savePassword(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveTimeZone(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveNetCard(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveNtpInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveLogin(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    devAddressOperate(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
