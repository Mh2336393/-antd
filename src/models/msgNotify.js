// import moment from 'moment';
// import Cookies from 'js-cookie';
// import _ from 'lodash'
import { apiRequest } from '@/services/api';
// import configSettings from '../configSettings';

const goToUrl = {
  urgent_sec_event: '/event/safeEvent/alarm', // 安全事件列表
  normal_sec_event: '/event/safeEvent/alarm', // 敏感事件列表
  components_exception: '/dashboard/systemMonitor/platform', // 系统消息（不跳转）
  system_exception: '/dashboard/systemMonitor/platform', // 系统消息（不跳转）
  disk_exception: '/dashboard/systemMonitor/platform', // 系统消息（不跳转）
  flow_exception: '/dashboard/systemMonitor/source',
  new_report: '/reports/lists',
  report_exception: '/reports/lists',
};
export default {
  namespace: 'msgNotify',

  state: {
    msgCount: 0, // 未读消息总数
    msgList: [],
    sysWarnInfo: [],
    locationImgs: [],
  },
  effects: {
    *fetchMsgList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'message/getUserMsgNotifyList', payload);
      if (!response) return;
      const msgList = Array.isArray(response.data) ? response.data : [];

      const list = msgList.map(obj => {
        const item = obj;

        // item.title = `${configSettings.msgType(item.message_type)} ${configSettings.msgType(item.sub_type)} ${item.content}`;
        // item.title = `${configSettings.msgType(item.sub_type)}`;
        item.title = item.content;
        item.link = goToUrl[item.sub_type] || '/';
        return item;
      });

      yield put({
        type: 'setMsgList',
        payload: {
          msgCount: response.recordsTotal || 0,
          msgList: list,
        },
      });
      // }
    },
    *fetchLocationImg(_, { call, put }) {
      try {
        const response = yield call(apiRequest, 'event/getLocationImgName', {}, true);
        if (!response) return Promise.reject();
        yield put({
          type: 'setMsgList',
          payload: {
            locationImgs: response.data || [],
          },
        });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *startServerHandle({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'startServer', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *ccsGlobalData({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'ccs/changeGlobalData', payload, true);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },
  reducers: {
    setMsgList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveWarnInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
