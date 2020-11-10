import { apiRequest } from '@/services/api';

export default {
  namespace: 'systemAccess',

  state: {
    accessData: {
      mail: {},
      syslog: {},
      sms: {},
    },
  },

  effects: {
    *fetchAccess(_, { call, put }) {
      const response = yield call(apiRequest, 'message/getSystemAccess');
      if (!response) return;
      const mailData = Array.isArray(response.data.mail) ? response.data.mail : [];
      const sysData = Array.isArray(response.data.syslog) ? response.data.syslog : [];
      const smsData = Array.isArray(response.data.sms) ? response.data.sms : [];
      yield put({
        type: 'saveAccess',
        payload: {
          accessData: {
            mail: mailData[0] || { type: 'mail', server: '', port: '', reserve1: '', reserve2: '', reserve3: '' },
            syslog: sysData[0] || { type: 'syslog', server: '', port: '', reserve1: '' },
            sms: smsData[0] || { type: 'sms', server: '', port: '', reserve1: '' },
          },
        },
      });
    },
    *updateSystemAccess({ payload }, { call }) {
      try {
        yield call(apiRequest, 'message/putSystemAccess', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *testSyslog({ payload }, { call }) {
      try {
        yield call(apiRequest, 'message/syslogTest', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *testEmail({ payload }, { call }) {
      try {
        yield call(apiRequest, 'message/mailTest', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *testSms({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'message/mailSms', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    saveAccess(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
