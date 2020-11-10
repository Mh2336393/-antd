import { apiRequest } from '@/services/api';
// import configSettings from '../../../configSettings';

// import moment from 'moment';
// import handleEsData from '../../../tools/handleEsData';

export default {
  namespace: 'eventPropertyRisk',

  state: {
    eventList: {
      recordsTotal: 0,
      list: [],
    },
    groupList: [],
  },

  effects: {
    *fetchEventList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getEventPropertyRiskList', payload);
      if (!response) return;
      const list = Array.isArray(response.data.list) ? response.data.list : [];
      yield put({
        type: 'saveEventList',
        payload: {
          eventList: {
            list,
            recordsTotal: response.data.recordsTotal || 0,
          },
        },
      });
    },

    *fetchGroupList(_, { call, put }) {
      const response = yield call(apiRequest, 'event/getAssetGroupWithCount');
      if (!response || !response.data || response.data.length === 0) return;
      const { data } = response;
      let allCount = 0;
      for (let i = 0; i < data.length; i += 1) {
        allCount += data[i].count;
      }
      const index = data.findIndex(item => item.Fgid === 0);
      const handledData = data.filter(item => item.Fgid !== 0);
      if (index >= 0) {
        handledData.push(data[index]);
      }
      handledData.push({ Fgroup_name: '未注册', Fgid: -2, count: 0 });

      const groupData = [{ Fgroup_name: '所有分组', Fgid: -1, count: allCount, subgroup: handledData }];
      yield put({
        type: 'saveGroupList',
        payload: {
          groupList: Array.isArray(groupData) ? groupData : [],
        },
      });
    },
    // *fetchChartData({ payload }, { call, put }) {
    //   const response = yield call(apiRequest, 'event/getChartData', payload);
    //   const { data } = response;
    //   if (!response) return;
    //   const buckets = Array.isArray(data.attackStage.buckets) ? data.attackStage.buckets : [];
    //   const typeList = [];
    //   const handledList = [];
    //   buckets.forEach((element, index) => {
    //     typeList.push({ title: element.key, count: element.doc_count });
    //     element.eventNums.buckets.forEach(item => {
    //       handledList.push({
    //         [`type${index}`]: element.key,
    //         time: moment(item.key).format('YYYY-MM-DD hh:mm:ss'),
    //         eventNum: item.doc_count,
    //       });
    //     });
    //   });
    //   // console.log('资产风险图表', response, typeList, handledList);
    //   yield put({
    //     type: 'saveChartData',
    //     payload: {
    //       chartData: {
    //         typeList,
    //         list: handledList,
    //       },
    //     },
    //   });
    // },
    *handleEvent({ payload }, { call }) {
      // const { handleQuery, query } = payload;
      // console.log('处理', payload);
      const response = yield call(apiRequest, 'event/handlePropertyRiskEvent', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response);
      // yield put({
      //   type: 'fetchEventList',
      //   payload: query,
      // });
    },
    *ignoreEvent({ payload }, { call }) {
      // const { ignoreQuery, query } = payload;
      // console.log('忽略', ignoreQuery);
      const response = yield call(apiRequest, 'event/ignorePropertyRiskEvent', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response);
      // yield put({
      //   type: 'fetchEventList',
      //   payload: query,
      // });
    },
  },

  reducers: {
    saveEventList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // saveChartData(state, { payload }) {
    //   return {
    //     ...state,
    //     ...payload,
    //   };
    // },
    saveGroupList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
