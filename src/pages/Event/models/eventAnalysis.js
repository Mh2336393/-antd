import { apiRequest } from '@/services/api';
import { result } from 'lodash';
import handleEsData from '../../../tools/handleEsData';
import moment from 'moment';

export default {
  namespace: 'eventAnalysis',
  state: {
    alarmList: {
      total: 0,
      list: [],
      gt10000: false,
    },
    alarmChart: {
      typeList: [],
      list: [],
    },
    filterCount: {},
    assetStatus: {},
    assetStatics: [],
  },

  effects: {
    *fetchAlarmList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getEventAnalysisList', payload);
      if (!response) return;
      const { list, total, chartData, gt10000 } = response.data;
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

      const typeList = chartData.map(item => item.key);
      const data = []
      // {time: "2020-08-17", 已处理告警资产数: 111, 新发现告警资产数: 111}
      chartData.map(itemWai => {
        const { key, doc_count, eventNums: { buckets } } = itemWai
        // debugger
        buckets.map(itemNei => {
          const {
            doc_count: value,
            key: time,
          } = itemNei
          // 1.先判断该时间的元素在data有没有
          const index = data.findIndex(element => { return element.time === time })
          if (index === -1) {
            data.push({
              time,
              [key]: value
            })
          } else {
            data[index][key] = value
          }
        })
      })

      // console.log("77777", data)

      yield put({
        type: 'saveChartData',
        payload: {
          alarmChart: {
            typeList,
            list: Object.values(data),
          },
        },
      });
    },
    *fetchFilterCount({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getAnalysisFilterCount', payload);
      if (!response) return;
      yield put({
        type: 'saveFilterCount',
        payload: {
          filterCount: response.data || {},
        },
      });
    },
    *ignoreEvent({ payload }, { call }) {
      const { ids } = payload;
      try {
        const resp = yield call(
          apiRequest,
          'event/handleAnalysisEvent',
          { ids, status: 'ignored' },
          true
        );
        return resp;
      } catch (error) {
        return error;
      }
    },
    *getAssetStatus({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'eventDetail/getAssetStatus', payload);
      if (!response) return;
      const list = result(response, 'aiConfig.list');
      yield put({
        type: 'saveAssetStatus',
        payload: {
          assetStatus: list.length > 0 ? list[0] : {},
        },
      });
    },
    *fetchAssetMeanStatics({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'eventDetail/getAssetStatic', payload);
        if (!response) return;
        yield put({
          type: 'saveAssetStatic',
          payload: {
            assetStatics: response.data.rows || [],
          },
        });
      } catch (error) {
        // console.error('method->fetchAssetMeanStatics error', error);
      }
    },
  },

  reducers: {
    saveAssetStatic(state, { payload }) {
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
    saveAssetStatus(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
