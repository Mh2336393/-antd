/* eslint-disable camelcase */
import { history } from 'umi';
import { apiRequest } from '@/services/api';
import crypto from 'crypto';
import Cookies from 'js-cookie';
import authority from '@/utils/authority';
const { setAuthority, setDomain } = authority;

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    authMap: {},
    hasVpc: false,
    version: '',
    showTce: '0',
    showTianmu: '0',
    isKVM: false,
    password_invalid_time: '',
    password_complexity: '',
    show_win10_vm: 'yes',
    logoUrl: {},
    ccsData: {
      clusterNameIp: {},
      ccsLevel: '',
      ccsNames: [],
      ccsList: [],
      ccsSqlVal: '',
      ccsEsVal: '',
      curCcsVal: '',
    },
    webName: '高级威胁检测系统',
    hasLicense: false,
    // licenseExpiredInfo: {},
    alarmTip: {},
    aliveObj: {},
  },

  effects: {
    *fetchVpcConfig(_, { call, put }) {
      const response = yield call(apiRequest, 'getConfig');
      if (!response || !response.data || Object.keys(response.data).length === 0) return;
      const { showTce, showTianmu } = response.data;
      Cookies.set('showTce', showTce);

      const ccsData = response.ccsData || { ccsList: [], ccsNames: [], curCcsVal: '' };
      if (ccsData.ccsNames.length) {
        // 上级放第一位显示
        if (ccsData.curCcsVal) {
          const notCurNames = ccsData.ccsNames.filter((tname) => tname !== ccsData.curCcsVal);
          ccsData.ccsNames = [ccsData.curCcsVal].concat(notCurNames);
        }

        const { ccsNames, curCcsVal = '' } = ccsData;
        const ccsList = ['all'].concat(ccsNames);
        ccsData.ccsList = ccsList;
        const esAz = Cookies.get('ccsaz');
        if (esAz && ccsNames.indexOf(esAz) > -1) {
          ccsData.ccsEsVal = esAz;
          ccsData.ccsSqlVal = esAz; // es为单个子级 sql就和它一样
          Cookies.set('sqlaz', ccsData.ccsSqlVal);
        } else {
          ccsData.ccsEsVal = 'all';
          ccsData.ccsSqlVal = curCcsVal; // es为all sql就为上级
          Cookies.set('sqlaz', ccsData.ccsSqlVal);
          Cookies.set('ccsaz', ccsData.ccsEsVal);
        }
        // console.log(51, 'ccsNames==', ccsNames, 'ccsList==', ccsList);
      } else {
        // 没有子级 清除cookies
        const esAz = Cookies.get('ccsaz');
        const sqlAz = Cookies.get('sqlaz');
        if (esAz) {
          Cookies.remove('ccsaz');
        }
        if (sqlAz) {
          Cookies.remove('sqlaz');
        }
      }

      if (showTce === '1') {
        // tce 代码 , loginUrl
        const { branchType, username = '', role = '', token, domain, loginUrl } = response.data;

        yield put({
          type: 'login/saveCurrentUser',
          payload: { currentUser: username },
        });

        if (branchType === 'tce') {
          const expire = parseInt(+new Date() / 1000, 10).toString();
          const string = username + role + expire;
          const hash = crypto.createHash('md5').update(string).digest('hex');

          setDomain(domain);
          localStorage.setItem('tceLogin', loginUrl);
          if (
            !Cookies.get('username') ||
            !Cookies.get('role') ||
            !Cookies.get('expire') ||
            !Cookies.get('hash') ||
            !Cookies.get('token')
          ) {
            setAuthority({ username, role, expire, hash, token });
            window.location.reload();
          } else {
            setAuthority({ username, role, expire, hash, token });
          }
        }
      }

      yield put({
        type: 'setVpcConfig',
        payload: {
          hasVpc: parseInt(response.data.hasVpc, 10),
          version: response.data.version,
          password_invalid_time: response.data.password_invalid_time,
          password_complexity: response.data.password_complexity,
          isKVM: response.data.isKVM,
          showTce,
          showTianmu,
          ccsData,
          show_win10_vm: response.data.show_win10_vm,
        },
      });
    },
    *fetchTceLoginName(_, { call }) {
      try {
        const response = yield call(apiRequest, 'getTceLoginName', {}, true);
        const { showTce } = response;
        Cookies.set('showTce', showTce);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchLogoUrl(_, { put, call }) {
      const response = yield call(apiRequest, 'safety/getLogosPath');
      const { logo_favicon } = response.data;
      // const oldPath = localStorage.getItem('logo_favicon');
      // if (oldPath !== logo_favicon) {
      //   localStorage.setItem('logo_favicon', logo_favicon);
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      // console.log('link.href==', link.href, 'logo_favicon', logo_favicon);
      if (link.href && link.href.indexOf(logo_favicon) < 0) {
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = logo_favicon;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      if (!response) return;
      const { tablelogos } = response;
      const webName = tablelogos && tablelogos.web_name ? tablelogos.web_name : '高级威胁检测系统';
      localStorage.setItem('webName', webName);
      yield put({
        type: 'saveLogoUrl',
        payload: {
          logoUrl: response.data,
          webName,
        },
      });
    },
    *fetchAuthMap(_, { put, call }) {
      const response = yield call(apiRequest, 'authRouter/getAuth');
      if (!response) return;
      const { data = {} } = response;
      const dataStr = JSON.stringify(data);
      if (dataStr === '{}') {
        yield put(history.push('/user/login'));
      }
      yield put({
        type: 'getAuthMap',
        payload: {
          authMap: response.data,
        },
      });
    },
    *resetAuthMap(_, { put }) {
      yield put({
        type: 'getAuthMap',
        payload: {
          authMap: {},
        },
      });
    },
    *changeWebAuth(_, { call, put }) {
      try {
        yield call(apiRequest, 'version/updateWebAuth', {}, true);
        yield put({ type: 'global/fetchAuthMap' });
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchAliveObj(_, { call, put }) {
      const response = yield call(apiRequest, 'ccs/ccsIsAllAlive');
      if (!response) return;
      yield put({
        type: 'setVersion',
        payload: {
          aliveObj: response.data || {},
        },
      });
    },
    *fetchAlarmMessages(_, { call, put }) {
      try {
        const response = yield call(apiRequest, 'message/getAlarmMessage', {}, true);
        yield put({
          type: 'setVersion',
          payload: {
            alarmTip: response && response.data ? response.data : {},
          },
        });
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateAlarmStatus({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'alarmMsg/updateAlarmStatus', payload, true);
        return response;
      } catch (error) {
        return false;
      }
    },
    *fetchLicense(_, { call, put }) {
      const response = yield call(apiRequest, 'user/getLicense');
      if (!response) return;
      yield put({
        type: 'saveLicense',
        payload: {
          hasLicense: response.data,
        },
      });
    },
  },

  reducers: {
    setVpcConfig(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getAuthMap(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setVersion(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveLogoUrl(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveLicense(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
