import { apiRequest } from '@/services/api';

export default {
  namespace: 'noticeStrategy',

  state: {
    noticeList: {
      recordsTotal: 0,
      list: [],
    },
    userData: [],
    userNotExist: '',
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'message/getNoticeStrategyList', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveList',
        payload: {
          noticeList: {
            recordsTotal: response.recordsTotal || 0,
            list,
          },
        },
      });
    },
    *updateList({ payload }, { call }) {
      try {
        yield call(apiRequest, 'message/putNoticeStrategyList', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *setStrategy({ payload }, { call }) {
      const { obj } = payload;
      try {
        yield call(apiRequest, 'message/setNoticeStrategy', obj, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchUserData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'message/getUserIdList', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveUserList',
        payload: {
          userData: list,
        },
      });
    },
    *validateUserExist({ payload }, { call, put }) {
      const { userID } = payload;
      const arr = userID.split(';');
      // const arr2 = arr.map(key => `'${key}'`);
      const arr2 = arr.map(key => `${key}`);
      const users = arr2.join(',');
      const response = yield call(apiRequest, 'message/userIDIsExist', { userID: users });
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      const usetList = list.map(key => key.user_id);
      const notArr = [];
      for (let i = 0; i < arr.length; i += 1) {
        if (usetList.indexOf(arr[i]) < 0) {
          notArr.push(arr[i]);
        }
      }
      let notUser = '';
      if (notArr.length) {
        notUser = notArr.join(';');
      }
      yield put({
        type: 'saveNotExistUser',
        payload: {
          userNotExist: notUser,
        },
      });
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveUserList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveNotExistUser(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
