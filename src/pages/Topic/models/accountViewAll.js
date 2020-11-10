import { apiRequest } from '@/services/api';

export default {
  namespace: 'accountViewAll',
  state: {
    dnsList: [],
    searchList: [],
  },
  effects: {
  },
  reducers: {
    commonStateRevise(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveSearchIpList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
