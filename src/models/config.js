import Cookie from 'js-cookie';
import { apiRequest } from '@/services/api';
import difference from 'lodash/difference';

export default {
    namespace: 'config',
    state: {
        filterNameList: [],
    },
    effects: {
        *saveFilter({ payload }, { call }) {
            try {
                const response = yield call(apiRequest, 'config/saveFilter', payload, true);
                return Promise.resolve(response);
            } catch (error) {
                return Promise.reject(error);
            }
        },
        *fetchFilterList({ payload }, { call, put }) {
            // console.log('payload',payload);
            const response = yield call(apiRequest, 'config/fetchFilterList', payload);
            let list = [];
            if (response.data && response.data.length > 0) {
                const { type } = payload;
                const username = Cookie.get('username');
                list = response.data.map(item => {
                    const arr = item.web_key.split('_');
                    const filteredArr = difference(arr, username.split('_'), type.split('_'));
                    return {
                        ...item,
                        web_key: filteredArr.join('_'),
                    };
                });
            }
            if (!response) return;
            yield put({
                type: 'saveFilterList',
                payload: {
                    filterNameList: list,
                },
            });
        },
        *deleteFilter({ payload }, { call }) {
            try {
                const response = yield call(apiRequest, 'config/deleteFilter', payload, true);
                return Promise.resolve(response);
            } catch (error) {
                return Promise.reject(error);
            }
        },
    },
    reducers: {
        saveFilterList(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
    },
};
