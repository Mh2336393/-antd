import { apiRequest } from '@/services/api';
import handleEsData from '../tools/handleEsData';
import configSettings from '../configSettings';

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
  name: 'attackVictimProfile',
  state: {
    attackInfoList: [],
    victimInfoList: [],
  },
  effects: {
    *fetchAttackList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getAttackAndVictimInfos', payload);
      if (!response) return;
      const { list } = response.data;
      const attackList = Array.isArray(list) ? list : [];
      // console.log('attackList', attackList);
      const handledData = attackList.map(item => {
        const { hits, aggs, ...other } = item;
        const handledHits = handleEsData(hits);
        const newAggs = handleData(aggs);
        return { ...other, hits: handledHits, aggs: newAggs };
      });
      yield put({
        type: 'saveAttackInfoList',
        payload: {
          attackInfoList: handledData,
        },
      });
    },
    *fetchVictimList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getAttackAndVictimInfos', payload);
      if (!response) return;
      const { list } = response.data;
      const victimList = Array.isArray(list) ? list : [];
      const handledData = victimList.map(item => {
        const { hits, aggs, ...other } = item;
        const handledHits = handleEsData(hits);
        const newAggs = handleData(aggs);
        return {
          ...other,
          aggs: newAggs,
          hits: handledHits,
        };
      });
      yield put({
        type: 'saveVictimInfoList',
        payload: {
          victimInfoList: handledData,
        },
      });
    },
  },

  reducers: {
    saveAttackInfoList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveVictimInfoList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
