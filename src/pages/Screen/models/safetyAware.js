import { apiRequest } from '@/services/api';
// import handleEsData from '../../../tools/handleEsData';
import configSettings from '../../../configSettings';
import completeArray from '../../../tools/completeArray';
import moment from 'moment';

function handleData(aggs) {
  const { attackStages } = configSettings;
  let newAggs = [];
  // 处理攻击意图
  Object.keys(attackStages)
    .reverse()
    .forEach(key => {
      let oneAttack = aggs.filter(attack => attack.attack === key);
      // 处理时间顺序
      oneAttack = oneAttack.sort((a, b) => {
        const atime = parseInt(a.time.slice(0, 2), 10);
        const btime = parseInt(b.time.slice(0, 2), 10);
        return atime - btime;
      });
      newAggs = newAggs.concat(oneAttack);
    });
  return newAggs;
}

export default {
  namespace: 'safetyAware',
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
    eventDistributionList: {
      typeList: [],
      list: [],
    }, // 安全事件分类（攻击意图）
    scoreDistribute: [], // 资产分布图
    mapModel: {
      flyline: [],
    },
    attackInfoList: [],
  },
  effects: {
    *fetchEventMapData(_, { call, put }) {
      const response = yield call(apiRequest, 'screen/safeEventMap', {
        startTime: moment()
          .subtract(7, 'days')
          .valueOf(),
        endTime: moment().valueOf(),
      });
      if (!response || !response.data) return;
      yield put({
        type: 'commonStateRevise',
        payload: {
          mapModel: {
            flyline: response.data,
          },
        },
      });
    },
    *fetchRealTimeOverall(_, { call, put }) {
      const response = yield call(apiRequest, 'dashboard/realTimeOverall');
      if (!response || !response.data) return;
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
    // 安全事件分布（按攻击意图） 近24小时
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
    // 攻击事件画像(近24小时)
    *fetchAttackList(_, { call, put }) {
      const response = yield call(apiRequest, 'screen/attackChartData', {
        startTime: moment()
          .subtract(1, 'days')
          .valueOf(),
        endTime: moment().valueOf(),
      });
      if (!response || !response.data) return;
      const { list } = response.data;
      const attackList = Array.isArray(list) ? list : [];
      // console.log('attackList', attackList);
      const handledData = attackList.map(item => {
        const { aggs } = item;
        const newAggs = handleData(aggs);
        return { aggs: newAggs };
      });
      // console.log(11, "handledData==", handledData);
      yield put({
        type: 'saveAttackInfoList',
        payload: {
          attackInfoList: handledData,
        },
      });
    },
    // 资产风险 默认改近24小时
    *fetchAssetScoreDistribute(_, { call, put }) {
      const response = yield call(apiRequest, 'event/getEventPropertyRiskList', {
        startTime: moment()
          .subtract(1, 'day')
          .valueOf(),
        endTime: moment().valueOf(),
        Fcategory: -1,
      });
      if (!response || !response.data) return;
      // console.log('response', response);
      const scoreDistribute = response.data && Array.isArray(response.data.list) ? response.data.list : [];
      yield put({ type: 'saveScoreDistribute', payload: { scoreDistribute } });
    },
  },
  reducers: {
    saveRealTimeOverall(state, { payload }) {
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
    saveAttackInfoList(state, { payload }) {
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
    commonStateRevise(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
