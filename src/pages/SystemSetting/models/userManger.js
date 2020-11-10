/* eslint-disable */
import { message } from 'antd';
import { cgiRequest, apiRequest } from '@/services/api';

export default {
  namespace: 'userManger',
  state: {
    userList: {
      recordsTotal: 0,
      list: [],
    },
    roleList: [],
    tenantList: [],
    ruleList: [], // 策略组id
  },
  effects: {
    *fetchUserList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'user/getUserList', {
        ...payload,
      });
      if (!response) return;
      const { list, total } = response.data;
      yield put({
        type: 'getUserList',
        payload: {
          userList: {
            recordsTotal: total || 0,
            list: Array.isArray(list) ? list : [],
          },
        },
      });
    },
    // *fetchTenantList({ payload }, { call, put }) {
    //   const response = yield call(apiRequest, 'user/getTenantList', {
    //     ...payload,
    //   });
    //   if (!response) return;
    //   yield put({
    //     type: 'saveTenantList',
    //     payload: {
    //       tenantList: Array.isArray(response.data) ? response.data : [],
    //     },
    //   });
    // },
    // *fetchTenantById({ payload }, { call }) {
    //   try {
    //     const response = yield call(apiRequest, 'user/getTenantById', payload, true);
    //     return Promise.resolve(response.data);
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    *fetchRoleList(_, { call, put }) {
      const response = yield call(apiRequest, 'role/getRoleList');
      if (!response) return;
      const list = response.data;
      yield put({
        type: 'getRoleList',
        payload: {
          roleList: Array.isArray(list) ? list : [],
        },
      });
    },
    *fetchLevelList(_, { call, put }) {
      const response = yield call(cgiRequest, { cmd: 'cmdb_l1_list' });
      if (!response) return;
      yield put({
        type: 'getLevelList',
        payload: {
          levelList: response.data || [],
        },
      });
    },
    *handleUser({ payload }, { call, put }) {
      const { query, info } = payload;
      const response = yield call(apiRequest, 'user/updateFisValid', info);
      if (!response) return;
      yield put({ type: 'fetchUserList', payload: query });
    },
    *delUser({ payload }, { call }) {
      try {
        yield call(apiRequest, 'user/delete', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *editUser({ payload }, { call, put }) {
      const { query, user } = payload;
      const cmd = user.id ? 'update' : 'add';
      const params = user;
      if (!user.id) {
        delete params.id;
      } else {
        if (user.create_user === '系统默认') {
          delete user.role;
        }
        delete user.user_id;
      }
      if (user.create_user) {
        delete user.create_user;
      }
      try {
        const response = yield call(apiRequest, `user/${cmd}`, params, true);
        // console.log('response', response);
        yield put({ type: 'fetchUserList', payload: query });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *resetPwd({ payload }, { call }) {
      const { id } = payload;
      const response = yield call(apiRequest, 'user/passwordReset', { id });
      if (!response) return;
      message.success('重置成功,初始密码为admin');
    },

    // *fetchRuleGroup(_, { call, put }) {
    //   const response = yield call(apiRequest, 'filterGroup/getFilterGroupListAll');
    //   if (!response) return;
    //   yield put({
    //     type: 'saveRuleList',
    //     payload: {
    //       ruleList: response.data.list || [],
    //     },
    //   });
    // },
    *fetchGroupWithTenant({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'filterGroup/getGroupWithTenant', payload, true);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    getUserList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getRoleList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getLevelList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveTenantList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveRuleList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
