import { apiRequest } from '@/services/api';
import handleEsData from '../../../tools/handleEsData';
import completeArray from '../../../tools/completeArray';
// import configSettings from '../../../configSettings';
// import completeArrayAlarmChart from '../SafeEvent/Alarm/completeArrayAlarmChart';
// const { alarmEventValueMap } = configSettings;

/* eslint-disable consistent-return  */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */

export default {
  namespace: 'eventOverview',
  state: {
    drawerList: {
      alarm: {},
      alert: {},
      ioc: {},
      apt: {},
      upapt: {},
    },
    eventList: {
      recordsTotal: 0,
      list: [],
    },
    chartData: {
      typeList: [],
      list: [],
      interval: '3h',
    },
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
      const response = yield call(apiRequest, 'event/getSafeEventList', payload);

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
      const response = yield call(apiRequest, 'event/getSafeEventFilterCount', payload);

      // console.log('response', response);
      if (!response) return;
      yield put({
        type: 'saveFilterCount',
        payload: {
          filterCount: response.data || {},
        },
      });
    },
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
