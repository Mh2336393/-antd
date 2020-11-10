/* eslint-disable camelcase */
import { history } from 'umi';
import Cookies from 'js-cookie';
import { message } from 'antd';
import crypto from 'crypto';
import userRequest from '../services/user';
import authority from '@/utils/authority';
const { setAuthority, clearListCookies } = authority;
import { reloadAuthorized } from '../utils/Authorized';
import { apiRequest } from '@/services/api';

export default {
  namespace: 'login',
  state: {
    loginStatus: {},
    modifyPwdMsg: '',
    currentUser: Cookies.get('username') || '',
    authorizationInfo: {
      code: 0,
      info: {},
    },
  },
  effects: {
    *login({ payload }, { call, put, select }) {
      const response = yield call(userRequest, {
        cmd: 'login',
        ...payload,
        cur_user: payload.user,
      });
      if (!response) return;
      let data;
      if (response.error_code === 0 && response.is_valid === 1) {
        const username = payload.user;
        const { role, token } = response;
        const expire = parseInt(+new Date() / 1000, 10).toString();
        const string = username + role + expire;
        const hash = crypto.createHash('md5').update(string).digest('hex');
        localStorage.setItem('token', token);
        data = { username, role, expire, hash, token };
      } else {
        data = response;
      }
      yield put({
        type: 'changeLoginStatus',
        payload: { loginStatus: data },
      });
      yield put({
        type: 'saveCurrentUser',
        payload: { currentUser: payload.user },
      });
      // yield put({
      //   type: 'global/setAuthMap',
      //   payload: { authMap: response.authMap },
      // });
      if (response.is_first === 1) {
        localStorage.setItem('is_first', 1);
      }
      const { passwdDiff } = response;
      const password_invalid_time = yield select((state) => state.global.password_invalid_time);
      const time = parseInt(password_invalid_time, 10);
      if (time - passwdDiff < 9 && time > 9) {
        message.warn('密码即将过期，请及时修改密码');
      }
      if (response.error_code === 0) {
        // Login successfully
        // console.log('success');
        reloadAuthorized();
        let path = '/';
        if (response.is_first) {
          path = '/user/modifyPwd';
        } else {
          const routes = Object.keys(response.authMap);
          [path] = routes;
        }
        console.log('path===', path);
        yield put(history.push(path));
      }
    },
    *logout(_, { put, call }) {
      try {
        // get location pathname
        // const urlParams = new URL(window.location.href);
        // const pathname = yield select(state => state.routing.location.pathname);
        // console.log('pa', pathname);
        // add the parameters in the url
        // urlParams.searchParams.set('redirect', pathname);
        // window.history.replaceState(null, 'login', urlParams.href);
        const response = yield call(userRequest, { cmd: 'logout' });
        if (response && response.error_code === 0) {
          clearListCookies();
        }
      } finally {
        yield put({ type: 'global/resetAuthMap' });
        yield put(history.push('/user/login'));
      }
    },
    *modifyPwd({ payload }, { call, put }) {
      const response = yield call(userRequest, { cmd: 'change_passwd', ...payload });
      if (response.error_code === 0) {
        // Login successfully
        localStorage.setItem('is_first', 2);
        reloadAuthorized();
        const routes = Object.keys(response.authMap);
        const path = routes[0];
        yield put(history.push(path));
        yield put({
          type: 'changeModifyStatus',
          payload: { modifyPwdMsg: '' },
        });
      } else {
        yield put({
          type: 'changeModifyStatus',
          payload: { modifyPwdMsg: response.msg },
        });
      }
    },
    *fetchAuthorizationLogin(_, { call, put }) {
      const response = yield call(apiRequest, 'systemset/authorizationLogin');
      if (!response) return;
      yield put({
        type: 'saveAuthorizationInfo',
        payload: {
          authorizationInfo: {
            code: response.error_code,
            info: response.data,
          },
        },
      });
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.loginStatus);
      return {
        ...state,
        ...payload,
      };
    },
    changeModifyStatus(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveCurrentUser(state, { payload }) {
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
  },
};
