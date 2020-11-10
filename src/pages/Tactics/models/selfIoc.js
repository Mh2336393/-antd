import { apiRequest } from '@/services/api';

export default {
  namespace: 'selfIoc',

  state: {
    eventList: {
      recordsTotal: 0,
      list: [],
    },
    category2List: [],
  },

  effects: {
    *fetchEventList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getCustomThreat', payload);
      if (!response) return;
      const list = Array.isArray(response.data.list) ? response.data.list : [];
      yield put({
        type: 'saveEventList',
        payload: {
          eventList: {
            recordsTotal: response.data.recordsTotal || 0,
            list,
          },
        },
      });
    },
    *fetchCategory2({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getCategory2', payload);
      if (!response) return;
      const category2List = Array.isArray(response.data) ? response.data : [];
      yield put({
        type: 'saveCategory2List',
        payload: {
          category2List: [{ name: '全部', value: '全部' }].concat(category2List),
        },
      });
    },
    *stausHandleEvent({ payload }, { call }) {
      // 启用 停用 删除 {"status":"ON","ids":"2,3"}
      const { ids, status } = payload;
      let reqRoute = '';
      if (status === 'del') {
        reqRoute = 'event/delCustomThreat';
      } else {
        reqRoute = 'event/setStatusCustomThreat';
      }
      // const response = yield call(apiRequest, reqRoute, { ids, status });
      // if (!response) return;
      // yield put({
      //   type: 'fetchEventList',
      //   payload: query,
      // });
      try {
        yield call(apiRequest, reqRoute, { ids, status }, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *addEditHandleEvent({ payload }, { call }) {
      const { obj } = payload;
      let reqRoute = '';
      if (obj.id) {
        reqRoute = 'event/editCustomThreat';
      } else {
        reqRoute = 'event/putCustomThreat';
      }
      try {
        yield call(apiRequest, reqRoute, obj, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    saveEventList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveCategory2List(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
