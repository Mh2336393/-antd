import { apiRequest } from '@/services/api';

export default {
  namespace: 'cloundAccess',
  state: {
    // offline: {},
    // online: {},
    // clound: {}
    cloundData: {},
  },
  effects: {
    // 获取云数据
    *fetchCloundData(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/cloundData');
      if (!response) return;
      // console.log('clound', response.data);
      const obj = {};
      response.data.forEach(item => {
        if (item.name === 'tionline') {
          obj.online = item;
        } else if (item.name === 'tioffline') {
          obj.offline = item;
        } else if (item.name === 'habo_cloud') {
          obj.cloud = item;
        } else if (item.name === 'safeUrl') {
          obj.safe = item;
        }
      });
      // console.log('data', obj);
      yield put({
        type: 'saveCloundData',
        payload: {
          cloundData: obj,
        },
      });
    },
    // 改变云配置
    *changeCloud({ payload }, { call }) {
      const response = yield call(apiRequest, 'systemset/cloundSave', payload);
      console.log('res', response);
      if (!response) return Promise.reject();
      // console.log('res', response.data);
      return Promise.resolve(response.data);
    },
  },
  reducers: {
    saveCloundData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
