import { apiRequest } from '@/services/api';
import handleEsData from '../../../tools/handleEsData';
import completeArray from '../../../tools/completeArray';

import moment from 'moment';

export default {
  namespace: 'dashboardOverview',
  state: {
    overall: {
      asset: {},
      event: {},
      log: {
        todayNum: 0,
        thirtyAvg: 0,
        trend: [],
      },
      file: {
        todayNum: 0,
        thirtyAvg: 0,
        trend: [],
      },
    },
    overallAsset: {},
    overallEvent: {},
    overallLog: {
      todayNum: 0,
      thirtyAvg: 0,
      trend: [],
    },
    overallLogTrend: [],
    overallFile: {
      todayNum: 0,
      thirtyAvg: 0,
      trend: [],
    },
    eventWithScoreList: [],
    eventWithAssetList: [],
    eventCategoryList: [],
    sandboxFileTypeList: [],
    eventTrendDataList: [],
    eventIocTopList: [],
    eventDistributionList: {
      typeList: [],
      list: [],
    },
    scoreDistribute: [], // 资产分布图
    todaySearchFile: {}, // 今日沙箱分析文件数搜索条件
  },

  effects: {
    *loadend(_, { call }) {
      yield call(apiRequest, 'dashboard/loadend');
    },
    *fetchRealTimeOverall(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/realTimeOverall');
      if (!response) return;
      // console.log('res', response);
      const {
        log: { trend },
        file,
      } = response.data;
      const newTrend = trend.map(item => ({
        ...item,
        key_as_string: moment(item.key_as_string).format('HH:mm:ss'),
      }));
      const fileTrend = file.trend.map(item => ({
        ...item,
        key_as_string: moment(item.key_as_string).format('HH:mm:ss'),
      }));
      response.data.log.trend = newTrend;
      response.data.file.trend = fileTrend;
      // console.log('data', response.data);
      yield put({
        type: 'saveRealTimeOverall',
        payload: {
          overall: response.data,
        },
      });
    },
    // 受影响资产
    *fetchRealTimeOverallAsset(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/realTimeOverallAsset');
      if (!response) return;
      yield put({
        type: 'saveRealTimeOverall',
        payload: {
          overallAsset: response.data,
        },
      });
    },
    // 新增安全事件
    *fetchRealTimeOverallEvent(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/realTimeOverallEvent');
      if (!response) return;
      yield put({
        type: 'saveRealTimeOverall',
        payload: {
          overallEvent: response.data,
        },
      });
    },
    // 沙箱分析文件数
    *fetchRealTimeOverallFile(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/realTimeOverallFile');
      if (!response) return;
      const { trend } = response.data;
      const fileTrend = trend.map(item => ({
        ...item,
        key_as_string: moment(item.key_as_string).format('HH:mm:ss'),
      }));
      response.data.trend = fileTrend;
      yield put({
        type: 'saveRealTimeOverall',
        payload: {
          overallFile: response.data,
          todaySearchFile: response.todaySearch || {},
        },
      });
    },
    // 流量采集日志
    *fetchRealTimeOverallLog(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/realTimeOverallLog');
      console.log(response)
      if (!response) return;
      const { trend } = response.data;
      const newTrend = trend.map(item => ({
        ...item,
        key_as_string: moment(item.key_as_string).format('HH:mm:ss'),
      }));
      response.data.trend = newTrend;
      yield put({
        type: 'saveRealTimeOverall',
        payload: {
          overallLog: response.data,
        },
      });
    },
    // 流量采集日志柱状图
    *fetchRealTimeOverallLogPic(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/realTimeOverallLogPic');
      console.log(response)
      if (!response) return;
      const { trend } = response.data;
      const newTrend = trend.map(item => ({
        ...item,
        key_as_string: moment(item.key).format('HH:mm:ss'),
      }));
      response.data.trend = newTrend;
      // console.log(newTrend[0].key_as_string)
      yield put({
        type: 'saveRealTimeOverall',
        payload: {
          overallLogTrend: response.data.trend,
        },
      });
    },
    // 安全事件分类(按攻击意图，近24小时)
    *fetchEventDistribution(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getEventDistribution', {
        startTime: moment()
          .subtract(1, 'days')
          .valueOf(),
        endTime: moment().valueOf(),
      });
      if (!response || !response.data) return;
      const { data } = response;
      const buckets = data && Array.isArray(data.attackStage.buckets) ? data.attackStage.buckets : [];
      if (buckets.length === 0) {
        yield put({
          type: 'saveChartList',
          payload: {
            chartData: {
              typeList: [],
              list: [],
            },
          },
        });
        return;
      }
      // 补全后的数据 包括 typeList,list
      const filledData = completeArray(buckets);
      yield put({
        type: 'saveDistributionList',
        payload: {
          eventDistributionList: {
            typeList: filledData.typeList,
            list: filledData.list,
          },
        },
      });
    },
    // 评分最高安全事件Top 5 (近24小时)
    *fetchEventWithScoreOrder({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getEventWithScoreOrder', payload);
      if (!response) return;
      const hits = Array.isArray(response.data.hits) ? response.data.hits : [];
      const list = handleEsData(hits);
      yield put({
        type: 'saveEventWithScoreList',
        payload: {
          eventWithScoreList: list,
        },
      });
    },

    *fetchEventWithAssetOrder({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getEventWithAssetOrder', payload);
      if (!response || !response.data) return;
      // console.log('res', response.data.event.buckets);
      const list = response.data.event.buckets.map(event => {
        const obj = {
          eventNum: event.doc_count,
          assetScore: event.score.value,
          ip: event.key ? event.key.split('-')[0] : '',
          key: event.key,
        };
        const asset = event.assetName.hits.hits[0];
        if (asset) {
          const {
            _source: { affectedAssets, src, dst },
          } = asset;
          const assetName = affectedAssets.filter(assetItem => assetItem.ipMac === event.key);

          if (src && src[0] && src[0].vpcid) {
            obj.vpcid = src[0].vpcid;
          } else if (dst && dst[0] && dst[0].vpcid) {
            obj.vpcid = dst[0].vpcid;
          }
          // console.log(8, 'obj.vpcid::::', obj.vpcid);

          obj.assetName = assetName[0] && assetName[0].assetName ? assetName[0].assetName : '';
        }
        return obj;
      });
      // console.log('list：：：', list);
      yield put({
        type: 'saveEventWithAssetList',
        payload: {
          eventWithAssetList: list,
        },
      });
    },
    // 安全事件分类 (近24小时)
    *fetchEventCategory2Num({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getEventCategory2Num', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      const data = list.map(item => ({
        x: item.key ? item.key : '其他',// category_2字段可能是空字符串，所以写个其他吧
        y: item.doc_count,
      }));
      yield put({
        type: 'saveEventCategoryList',
        payload: {
          eventCategoryList: data,
        },
      });
    },
    // 沙箱分析文件类型 (近24小时)
    *fetchSandboxFileType({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getSandboxFileType', payload);
      if (!response || !response.data.list) return;
      const data = response.data.list.category.buckets.map(item => ({ x: item.key, y: item.doc_count }));
      yield put({
        type: 'saveSandboxFileTypeList',
        payload: {
          sandboxFileTypeList: data,
        },
      });
    },
    // 失陷指标IOC Top5 (近24小时)
    *fetchEventIocTop({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getEventIocTop', payload);
      if (!response || !response.data || !response.data.ioc) return;
      const list = response.data.ioc.buckets.map(event => {
        const obj = { doc_count: event.assetNums.value, key: event.key };
        const item = event.iocTags.hits.hits[0];
        if (item) {
          const {
            _source: { iocLevel1Tags, name, iocTags },
          } = item;
          obj.iocLevel1Tags = iocLevel1Tags;
          obj.name = name;
          obj.iocTags = iocTags;
        }
        return obj;
      });
      yield put({
        type: 'saveEventIocTopList',
        payload: {
          eventIocTopList: list,
        },
      });
    },

    *fetchEventTrend({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/getEventTrend', payload);
      if (!response) return;
      const list = Array.isArray(response.data) ? response.data : [];
      const data = list.map(item => ({ time: moment(item.key).format('YYYY-MM-DD HH:mm:ss'), value: item.doc_count }));
      yield put({
        type: 'saveEventTrend',
        payload: {
          eventTrendDataList: data,
        },
      });
    },
    // 风险资产(近24小时)
    *fetchAssetScoreDistribute({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getEventPropertyRiskList', payload);
      if (!response) return;
      // console.log('response', response);
      const scoreDistribute = Array.isArray(response.data.list) ? response.data.list : [];
      // console.log('scoreDistribute', scoreDistribute);

      // 数据相同时的 数据 处理
      const tmpArr = [];
      const sigArr = [];
      scoreDistribute.forEach(obj => {
        const flag = `${obj.score}_${obj.unhanledNum}_${obj.Fip}`;
        const tmpIdx = tmpArr.indexOf(flag);
        // console.log('tmpIdx==', tmpIdx);
        if (tmpIdx < 0) {
          tmpArr.push(flag);
          sigArr.push(obj);
        } else {
          const firstdata = { ...sigArr[tmpIdx] };
          sigArr[tmpIdx] = {
            ...firstdata,
            unhanledNum: Number(firstdata.unhanledNum) + Number(obj.unhanledNum),
          };
        }
      });

      console.log('sigArr==', sigArr);

      yield put({ type: 'saveScoreDistribute', payload: { scoreDistribute: sigArr } });
    },
  },

  reducers: {
    saveRealTimeOverall(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventWithScoreList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventWithAssetList(state, { payload }) {
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
    saveEventCategoryList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveEventTrend(state, { payload }) {
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
    saveDistributionList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveScoreDistribute(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
