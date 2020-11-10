import { apiRequest } from '@/services/api';
import moment from 'moment';
import configSettings from '../../../configSettings';
// import lodash from 'lodash';

/* eslint-disable no-underscore-dangle */
/* eslint no-param-reassign: ["error", { "props": false }] */
// let esFieldMapping = [];
export default {
  namespace: 'eventHandle',
  state: {
    eventHandleList: [],
    eventStatusTrend: [],
    invationList: [],
    fileList: [],
    eventFallTabsList: [],
    eventIocTopList: [],
    sandboxFileTypeList: [],
  },

  effects: {
    // 各个分数段 事件个数
    *fetchEventHandleStatus({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getEventHandleStatus', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      if (list.length === 0) return;
      const handledList = list.map(item => {
        const {
          status: { buckets },
        } = item;
        const statusObj = {};
        buckets.forEach(buc => {
          statusObj[buc.key] = buc.doc_count;
        });
        statusObj.total = buckets.reduce((pre, cur, index) => {
          if (index === 0) return cur.doc_count;
          return pre + cur.doc_count;
        }, 0);
        return Object.assign(
          {
            scoreRange: `${item.from}-${item.to}`,
            total: item.doc_count,
          },
          statusObj
        );
      });
      // console.log('lsit', handledList);
      yield put({ type: 'saveEventStatusList', payload: { eventHandleList: handledList } });
    },
    // 事件处理趋势
    *fetchEventStatusTrend({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getEventStatusTrend', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      const handledList = list.map(item => {
        const {
          key,
          status: { buckets },
        } = item;
        const statusObj = { 未处理: 0, 已处理: 0, 已忽略: 0 };
        buckets.forEach(buc => {
          statusObj[configSettings.statusMap[buc.key]] = buc.doc_count;
        });
        return Object.assign(statusObj, {
          time: moment(key).format('YYYY-MM-DD HH:mm:ss'),
        });
      });

      yield put({ type: 'saveEventStatusTrend', payload: { eventStatusTrend: handledList } });
    },
    *fetchEventCatagory({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getEventCategory', payload);
      if (!response) return;
      const map = {
        入侵感知: 'invationList',
        异常文件感知: 'fileList',
      };
      const list = Array.isArray(response.data) ? response.data : [];
      const obj = {};
      list.forEach(item => {
        const {
          category_2: { buckets },
          key,
        } = item;
        obj[map[key]] = buckets.map(cat => ({
          x: cat.key,
          y: cat.doc_count,
        }));
      });
      // console.log('obj', obj);
      yield put({ type: 'saveEventCategory', payload: { ...obj } });
    },
    *fetchEventFallTabsList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getEventFallTabs', payload);
      if (!response) return;
      let list = [];
      if (response.data && response.data.iocLevel1Tag && response.data.iocLevel1Tag.buckets) {
        list = response.data.iocLevel1Tag.buckets.map(event => {
          const obj = { assetCardinality: event.assetCardinality.value, key: event.key };
          return obj;
        });
      }
      yield put({
        type: 'saveEventFallTabsList',
        payload: {
          eventFallTabsList: list,
        },
      });
    },
    *fetchEventIocTop({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getEventIocTop', payload);
      if (!response) return;
      let list = [];
      if (response.data && response.data.ioc && response.data.ioc.buckets) {
        list = response.data.ioc.buckets.map(event => {
          const obj = { doc_count: event.doc_count, key: event.key };
          const item = event.iocTags.hits.hits[0];
          if (item) {
            const {
              _source: { iocLevel1Tags, name, iocTags },
            } = item;
            obj.iocTags = iocTags;
            obj.iocLevel1Tags = iocLevel1Tags;
            obj.name = name;
          }
          return obj;
        });
      }
      yield put({
        type: 'saveEventIocTopList',
        payload: {
          eventIocTopList: list,
        },
      });
    },
    *fetchSandboxFileType({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'report/getSandboxFileType', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : []; // const data = response.data.list.category.buckets.map(item => ({ x: item.key, y: item.doc_count }));
      yield put({
        type: 'saveSandboxFileTypeList',
        payload: {
          sandboxFileTypeList: list,
        },
      });
    },
  },

  reducers: {
    saveEventStatusList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventStatusTrend(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventCategory(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventFallTabsList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventIocTopList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveSandboxFileTypeList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
