import { esRequest, apiRequest } from '@/services/api';
import lodash from 'lodash';

/* eslint-disable no-underscore-dangle */
/* eslint-disable */
/* eslint no-param-reassign: ["error", { "props": false }] */
// let esFieldMapping = [];
// flow,http,dns,dhcp,icmp,ssh,tls,rdp,telnet,mysql,sqlserver,oracle,tftp,nfs,smb,smtp,pop,imap,ikev2,krb5,dnp3,pcinfo,anomaly,ldap

export default {
    namespace: 'caughtTask',
    state: {
        taskList: {
            totla: 0,
            list: [],
        }
    },

    effects: {
        *addCaptureTask({ payload }, { call }) {
            const response = yield call(apiRequest, 'captureTask/addCaptureTask', payload);
            if (response) {
                return Promise.resolve(response);
            }
            return Promise.reject();
        },

        *fetchCaughtTaskList({ payload }, { call, put }) {
            const response = yield call(apiRequest, 'captureTask/fetchCaughtTaskList', payload);
            if (!response) return
            const {
                msg: {
                    tasks,
                    total
                }
            } = response;
            let dataList = Array.isArray(tasks) ? tasks : [];
            yield put({
                type: 'saveTaskList',
                payload: {
                    taskList: {
                        total: total,
                        list: dataList,
                    },
                },
            });


        },

        *editCaptureTask({ payload }, { call }) {
            const response = yield call(apiRequest, 'captureTask/editCaptureTask', payload);
            if (response) {
                return Promise.resolve(response);
            }
            return Promise.reject();
        },

        *stopCaptureTask({ payload }, { call }) {
            const response = yield call(apiRequest, 'captureTask/stopCaptureTask', payload);
            if (response) {
                return Promise.resolve(response);
            }
            return Promise.reject();
        },

        *restartCaptureTask({ payload }, { call }) {
            const response = yield call(apiRequest, 'captureTask/restartCaptureTask', payload);
            if (response) {
                return Promise.resolve(response);
            }
            return Promise.reject();
        },

        *delCaptureTask({ payload }, { call }) {
            const response = yield call(apiRequest, 'captureTask/delCaptureTask', payload);
            if (response) {
                return Promise.resolve(response);
            }
            return Promise.reject();
        },

    },

    reducers: {
        saveTaskList(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        }
    },
};
