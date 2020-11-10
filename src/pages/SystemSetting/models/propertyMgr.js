import { apiRequest } from '@/services/api';
// import moment from 'moment';
// import handleEsData from '../../../tools/handleEsData';

export default {
  namespace: 'propertyMgr',

  state: {
    propertyList: {
      total: 0,
      list: [],
    },
    groupList: [],
    groupChildrenList: [], // 移动到分组使用，全量的分组信息
  },

  effects: {
    *fetchPropertyList({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'propertyMgr/getPropertyList', payload);
      if (!response || !response.data) return;
      const list = Array.isArray(response.data.list) ? response.data.list : [];
      const groupList = Array.isArray(response.data.groupListWithCount) ? response.data.groupListWithCount : [];
      yield put({
        type: 'savePropertyList',
        payload: {
          propertyList: {
            list,
            total: response.data.total || 0,
          },
        },
      });
      yield put({
        type: 'saveGroupList',
        payload: {
          groupList,
        },
      });
    },

    *fetchGroupList(_, { call, put }) {
      const response = yield call(apiRequest, 'event/getAssetGroupWithCount');
      if (!response || !response.data || response.data.length === 0) return;
      const { data } = response;

      yield put({
        type: 'saveGroupChildrenList',
        payload: {
          groupChildrenList: Array.isArray(data) ? data : [],
        },
      });
    },
    *addGroup({ payload }, { call }) {
      try {
        yield call(apiRequest, 'propertyGroup/addNewGroup', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *updateGroup({ payload }, { call }) {
      try {
        yield call(apiRequest, 'propertyGroup/updateGroup', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *deleteGroup({ payload }, { call }) {
      try {
        yield call(apiRequest, 'propertyGroup/deleteGroup', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *setProperty({ payload }, { call }) {
      try {
        yield call(apiRequest, 'propertyMgr/setProperty', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *deleteProperty({ payload }, { call }) {
      try {
        yield call(apiRequest, 'propertyMgr/deleteProperty', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *moveAsset({ payload }, { call }) {
      try {
        yield call(apiRequest, 'propertyMgr/moveAsset', payload, true);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    savePropertyList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveGroupChildrenList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveGroupList(state, { payload }) {
      const { groupList } = payload;
      let allCount = 0;
      if (groupList.length === 0) {
        return {
          ...state,
          groupList: [{ Fgroup_name: '所有分组', Fgid: -1, count: 0, subgroup: [] }],
        };
      }
      for (let i = 0; i < groupList.length; i += 1) {
        allCount += groupList[i].count;
      }
      const index = groupList.findIndex(item => item.Fgid === 0);
      const handledData = groupList.filter(item => item.Fgid !== 0);
      if (index >= 0) {
        handledData.push(groupList[index]);
      }
      const groupData = [{ Fgroup_name: '所有分组', Fgid: -1, count: allCount, subgroup: handledData }];
      // console.log('groupData', groupList, groupData);
      return {
        ...state,
        groupList: groupData,
      };
    },
  },
};
