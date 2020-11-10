import { apiRequest } from '@/services/api';
import handleEsData from '../../../tools/handleEsData';
import completeArray from '../../../tools/completeArray';
// import configSettings from '../../../configSettings';

/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return  */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */

export default {
  namespace: 'eventFile',
  state: {
    eventList: {
      recordsTotal: 0,
      list: [],
    },
    chartData: {
      typeList: [],
      list: [],
      interval: '3h',
    },
    category2List: [],
    alarmList: {
      total: 0,
      list: [],
      gt10000: false,
      // aggregations:{}
    },
    alarmChart: {
      typeList: [],
      list: [],
      interval: '3h',
    },
    filterCount: {},
  },

  effects: {
    *fetchAlarmList({ payload }, { call, put }) {
      const { startTime, endTime } = payload;
      const response = yield call(apiRequest, 'event/getSafeEventList', { ...payload, category_1: '异常文件感知' });

      if (!response) return;
      const { list, total, chartData, interval, gt10000 } = response.data;
      const dataList = Array.isArray(list) ? list : [];
      yield put({
        type: 'saveAlarmList',
        payload: {
          alarmList: {
            total: total || 0,
            list: handleEsData(dataList),
            gt10000,
          },
        },
      });
      // const { intent } = alarmEventValueMap;
      // const filledData = completeArrayAlarmChart(chartData, intent, { startTime, endTime });

      const filledData = completeArray(chartData);
      yield put({
        type: 'saveChartData',
        payload: {
          alarmChart: {
            typeList: filledData.typeList,
            list: filledData.list,
            interval,
          },
        },
      });
    },
    *fetchFilterCount({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getSafeEventFilterCount', { ...payload, category_1: '异常文件感知' });

      // console.log('response', response);
      if (!response) return;
      yield put({
        type: 'saveFilterCount',
        payload: {
          filterCount: response.data || {},
        },
      });
    },
    // *fetchEventList({ payload }, { call, put }) {
    //   const response = yield call(apiRequest, 'event/getEventList', configSettings.searchDivision(payload));
    //   if (!response) return;
    //   const hits = Array.isArray(response.data.hits) ? response.data.hits : [];
    //   const list = handleEsData(hits);
    //   // console.log('异常文件感知', list);
    //   if (list.length > 0) {
    //     list.forEach(item => {
    //       item.vpcid = item.src[0].vpcid || item.dst[0].vpcid;
    //     });
    //   }
    //   const total = response.data.total ? response.data.total : 0;

    //   yield put({
    //     type: 'saveEventList',
    //     payload: {
    //       eventList: {
    //         list,
    //         recordsTotal: total,
    //       },
    //     },
    //   });
    // },
    // *fetchChartData({ payload }, { call, put }) {
    //   const response = yield call(apiRequest, 'event/getChartData', configSettings.searchDivision(payload));
    //   if (!response) return;
    //   const { data, interval } = response;
    //   const buckets = Array.isArray(data.attackStage.buckets) ? data.attackStage.buckets : [];
    //   if (buckets.length === 0) {
    //     yield put({
    //       type: 'saveChartList',
    //       payload: {
    //         chartData: {
    //           typeList: [],
    //           list: [],
    //           interval,
    //         },
    //       },
    //     });
    //     return;
    //   }
    //   // 补全后的数据 包括 typeList,list
    //   const filledData = completeArray(buckets);
    //   yield put({
    //     type: 'saveChartList',
    //     payload: {
    //       chartData: {
    //         typeList: filledData.typeList,
    //         list: filledData.list,
    //         interval,
    //       },
    //     },
    //   });
    // },
    *handleEvent({ payload }, { call }) {
      const { ids } = payload;
      try {
        yield call(apiRequest, 'event/handleEvent', { ids, status: 'handled' }, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *ignoreEvent({ payload }, { call }) {
      const { ids } = payload;
      try {
        yield call(apiRequest, 'event/handleEvent', { ids, status: 'ignored' }, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
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
  },

  reducers: {
    saveEventList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveChartList(state, { payload }) {
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
    saveAlarmList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveChartData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveFilterCount(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
