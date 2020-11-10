import { apiRequest } from '@/services/api';

export default {
  namespace: 'messageCenter',

  state: {
    messageList: {
      recordsTotal: 0,
      list: [],
      // sqlInfo: '',
    },
    subtypes: {},
    groupList: [],
    sysWarnInfo: [],
    detailInfo: [],
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'message/getMessageCenterList', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveList',
        payload: {
          messageList: {
            recordsTotal: response.recordsTotal || 0,
            list,
            // sqlInfo: response.info,
          },
        },
      });
    },
    *fetchDetailInfo({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'message/getMessageDetail', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveDetailInfo',
        payload: {
          detailInfo: list,
        },
      });
    },
    *fetchGroupList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'message/getMessageCenterTypeGroup', payload);
      if (!response || !response.data) return;
      const { data } = response;
      const names = ['sec', 'sys', 'report'];
      const nameObj = { sec: '安全消息', sys: '系统消息', report: '其他' };
      const groupNames = data.map(obj => obj.message_type);
      const zeroGroup = names.filter(zero => groupNames.indexOf(zero) < 0);
      const zeroData = zeroGroup.map(val => ({ message_type: val, message_name: nameObj[val], count: 0 }));
      const groupArr = [...zeroData, ...data];
      const orderArr = [];
      for (let i = 0; i < groupArr.length; i += 1) {
        if (groupArr[i].message_type === 'sec') {
          orderArr[0] = groupArr[i];
        }
        if (groupArr[i].message_type === 'sys') {
          orderArr[1] = groupArr[i];
        }
        if (groupArr[i].message_type === 'report') {
          orderArr[2] = groupArr[i];
        }
      }
      const dataArr = orderArr;
      let allCount = 0;
      if (data.length) {
        allCount = data.reduce((pre, cur) => pre + cur.count, 0);
      }
      const groupData = [
        {
          message_type: 'all',
          message_name: '全部类型',
          count: allCount,
          sub_type: dataArr,
        },
      ];
      yield put({
        type: 'saveGroupList',
        payload: {
          groupList: Array.isArray(groupData) ? groupData : [],
        },
      });
    },
    *stausHandleEvent({ payload }, { call }) {
      const { status, ids } = payload;
      let reqRoute = 'message/messageCenterDel';
      let pay = { ids };
      if (status === 'MarkedRead') {
        pay = { ids };
        reqRoute = 'message/messageCenterIsRead';
      }
      if (status === 'AllRead') {
        pay = payload.query;
        reqRoute = 'message/messageAllRead';
      }
      try {
        yield call(apiRequest, reqRoute, pay, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchSubTypName(_, { call, put }) {
      const response = yield call(apiRequest, 'message/getMsgSubTypeName');
      yield put({
        type: 'saveDetailInfo',
        payload: {
          subtypes: response.data || {},
        },
      });
    },
    *fetchMsgDetail({ payload }, { call }) {
      try {
        const response = yield call(apiRequest, 'message/getMsgDetailInfo', payload);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveDetailInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveGroupList(state, { payload }) {
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
