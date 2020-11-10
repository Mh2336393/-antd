import { apiRequest } from '@/services/api';

export default {
  namespace: 'version',
  state: {
    versionInfo: [],
    authorizationInfo: {
      code: 0,
      info: {},
    },
    functionalList: [],
    checkInfo: {},
    threatInfo: { tionline: {}, tioffline: {} },
    currentChangeLog: [],// 获取当前库版本的changelog
    updateChangeLog: []// 获取即将升级的库版本的changelog
  },
  effects: {
    *fetchVersionInfo(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/versionInfo');
      if (!response) return;
      // console.log('data', obj);
      yield put({
        type: 'saveVersionInfo',
        payload: {
          versionInfo: response.data,
        },
      });
    },
    *fetchAuthorizationInfo(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/authorizationInfo');
      if (!response) return;
      yield put({
        type: 'saveAuthorizationInfo',
        payload: {
          authorizationInfo: {
            code: response.error_code,
            info: response.msg,
          },
        },
      });
    },
    *fetchFunctionalList(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/functional');
      if (!response) return;
      yield put({
        type: 'saveFunctonalList',
        payload: {
          functionalList: response.data,
        },
      });
    },
    *fetchCheckUpdate(_, { call, put }) {
      let response = {};
      try {
        response = yield call(apiRequest, 'systemset/checkUpdate', {}, true);
        console.log('fetchCheckUpdate==response==', response);
      } catch (error) {
        console.log('fetchCheckUpdate==error==', error);
        response = error;
      }
      // status=0表示升级、status=1表示错误 status=2表示不需要升级
      const { msg = {} } = response;

      if (msg.info === 'license check error') {
        msg.info = '安全规则更新授权校验失败';
      }
      let checkInfo = {
        msg: msg.info || '',
        update: msg.status === 1 ? '' : msg.status === 0, // msg.update 为false，表示为最新版本 无需升级
        version: msg.version || '需要更新'
      };

      if (response.error_code !== 0 && typeof response.msg === 'string') {
        checkInfo = { update: '', msg: response.msg };
      }

      yield put({
        type: 'saveVersionInfo',
        payload: {
          checkInfo,
        },
      });
    },
    *fetchCheckUpdateTb(_, { call, put }) {
      // 用于和列表同时获取时
      let response = {};
      try {
        response = yield call(apiRequest, 'systemset/checkUpdate', {}, true);
        console.log('fetchCheckUpdateTb==response==', response);
      } catch (error) {
        console.log('fetchCheckUpdateTb==error==', error);
        response = error;
      }
      // status=0表示升级、status=1表示错误 status=2表示不需要升级
      const { msg = {} } = response;

      if (msg.info === 'license check error') {
        msg.info = '安全规则更新授权校验失败';
      }
      let checkInfo = {
        msg: msg.info || '',
        update: msg.status === 1 ? '' : msg.status === 0, // msg.update 为false，表示为最新版本 无需升级
      };

      if (response.error_code !== 0 && typeof response.msg === 'string') {
        checkInfo = { update: '', msg: response.msg };
      }

      yield put({
        type: 'saveVersionInfo',
        payload: {
          checkInfo,
        },
      });
    },
    *handleUpdate(_, { call }) {
      try {
        const response = yield call(apiRequest, 'systemset/updateRules', {}, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *manualUpload({ payload }, { call }) {
      const { uri, data } = payload;
      try {
        const response = yield call(apiRequest, uri, data, true);
        console.log('res', response);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *getThreatInfo(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/threatInfo');
      if (!response) return;
      yield put({
        type: 'saveThreatInfo',
        payload: {
          threatInfo: response.data,
        },
      });
    },
    *setThreatInfo({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'systemset/setThreatInfo', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *getChangelog({ payload }, { call, put }) {
      const { mode } = payload
      const response = yield call(apiRequest, 'systemset/changelog', payload);
      const data = response.data.split("\n")
      // 获取当前库版本的changelog
      if (mode === "current") {
        yield put({
          type: 'saveChageLog',
          payload: {
            currentChangeLog: data,
          },
        });
      } else {
        // 获取即将升级的库版本的changelog
        yield put({
          type: 'saveChageLog',
          payload: {
            updateChangeLog: data,
          },
        });
      }

    },
    *getInfoList(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/infoList');
      yield put({
        type: 'saveInfoList',
        payload: {
          infoList:response.data,
        },
      });
    }
  },
  reducers: {
    saveVersionInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveAuthorizationInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveFunctonalList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveThreatInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveChageLog(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveInfoList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  },
};
