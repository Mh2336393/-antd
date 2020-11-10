/* eslint-disable */
import { apiRequest } from '@/services/api';

export default {
  namespace: 'auth',
  state: {
    roleList: {
      total: 0,
      list: [],
    },
  },
  effects: {
    *checkName({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'role/checkname', payload);
        if (!response) return Promise.reject();
        console.log(response);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchRouteAuthList({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'authRoute/getAuthList', payload, true);
        // const { routeList, featureList } = response.data;
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchRoleWithAuth({ payload }, { call }) {
      const { Frole_id } = payload;
      try {
        const response = yield call(apiRequest, 'authRoute/getRoleWithAuth', { Frole_id }, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchRoleList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'role/getRoleListWithPagination', payload);
      if (!response) return;
      const { data } = response;
      yield put({
        type: 'saveRoleList',
        payload: {
          roleList: {
            total: data.total || 0,
            list: Array.isArray(data.list) ? data.list : [],
          },
        },
      });
    },
    *editRole({ payload }, { call, put }) {
      const { Frole_id, ...other } = payload;
      const type = Frole_id ? 'update' : 'add';
      const params = Frole_id ? { Frole_id, ...other } : { ...other };
      // console.log('params',params);
      try {
        const response = yield call(apiRequest, `role/${type}Role`, params, true);
        yield put({ type: 'global/fetchAuthMap' });
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *deleteRole({ payload }, { call, put }) {
      const { Frole_id, query } = payload;
      const response = yield call(apiRequest, 'role/deleteRole', { Frole_id });
      if (!response) return;
      yield put({ type: 'fetchRoleList', payload: query });
      yield put({ type: 'global/fetchAuthMap' });
    },
  },
  reducers: {
    saveRoleList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
