import { esRequest, apiRequest } from '@/services/api';
import lodash from 'lodash';
import esSearch from '../../../../tools/esSearch';

/* eslint-disable no-underscore-dangle */
/* eslint-disable */
/* eslint no-param-reassign: ["error", { "props": false }] */
// let esFieldMapping = [];
// flow,http,dns,dhcp,icmp,ssh,tls,rdp,telnet,mysql,sqlserver,oracle,tftp,nfs,smb,smtp,pop,imap,ikev2,krb5,dnp3,pcinfo,anomaly,ldap
const storageLogModel = {
    "系统类": ["flow", "icmp", "pcinfo", "anomaly"],
    "邮件类": ["smtp", "imap", "pop"],
    "数据库类": ["sqlserver", "oracle", "mysql",],
    "互联网类": ["http", "dns",],
    "文件传输类": ["nfs", "tftp", "smb"],
    "工控类": ["dnp3",],
    "登录认证类": ["tls", "ikev2", "krb5", "dhcp", "ldap"],
    "远程管理类": ["ssh", "rdp", "telnet"]
}
export default {
    namespace: 'search',
    state: {
        esDetail: {
            hits: [], // 查出的源数据组
            aggs: [], // 聚合后的数据组
            took: 0, // 耗时
            total: 0,
        },
        allAvailableFields: [], // 搜索结果中所有出现过的字段
        esFieldRanges: {}, // 每个字段的所有取值结果
        indexSort: {}, // 索引选择组件需要的格式
        saveSearchList: {
            list: [],
            recordsTotal: 0,
        },
        pcapInfo: {},
        searchLogsArr: [], // 搜索记录
        index_field: {}, // 按索引类型存对应索引的字段
        index_aggs: {}, // 按索引类型存对应索引的可聚合的字段
        index_search: {}, // 按索引类型存对应索引的可搜索的字段
        index_search_type: {}, // 按索引类型存不同索引的可搜索的字段以及对应的字段类型
        indexArr: [], // 存储所有的索引列表
        fieldsAggQuery: [], // 存储拆分的字段聚合请求
        // 流量日志存储策略配置模型
        storageLogModel,
        // 所有要存储的流量日志类型
        trafficLogStorageSelect: []
    },

    effects: {
        *fetchHistogramResults({ payload }, { call, put }) {
            const response = yield call(esRequest, 'POST', '/api/esAggs/histogramAggs', payload);
            if (!response) return Promise.reject();
            const {
                data: { took, aggs },
            } = response;
            yield put({
                type: 'esDetailState',
                payload: {
                    esDetail: {
                        aggs: aggs.count_stats ? aggs.count_stats.buckets : [],
                        took,
                    },
                },
            });
        },

        *fetchEsResults({ payload }, { call, put }) {
            const response = yield call(esRequest, 'POST', '/api/esHits', payload);
            if (!response) return Promise.reject();
            const {
                data: { hits },
            } = response;
            let allAvailableFields = [];
            // 对hit数组中的每个对象添加key属性，否则table组件使用rowSelect和expandedRowRender会存在问题(数组添加rowKey也可解决此问题)
            if (hits.total > 0) {
                hits.hits.forEach((item, index) => {
                    const keyArr = Object.keys(esSearch.sourceFieldParsing(item));
                    if (index === 0) {
                        allAvailableFields = keyArr;
                    } else {
                        allAvailableFields = lodash.union(allAvailableFields, keyArr);
                    }
                });

                yield put({ type: 'fetchFieldsAggQuery', payload: { query: payload.query, allAvailableFields } });
            } else {
                yield put({ type: 'commonReviseState', payload: { fieldsAggQuery: [] } });
            }
            yield put({
                type: 'esDetailState',
                payload: {
                    esDetail: {
                        hits: hits.hits,
                        total: hits.total,
                    },
                    allAvailableFields: allAvailableFields.sort(),
                    esFieldRanges: {}, // 每次点击搜索时，清空该对象
                },
            });
            return Promise.resolve();
        },

        *fetchFieldsAggQuery({ payload }, { put, select }) {
            const { query, allAvailableFields } = payload;
            const newQuery = lodash.cloneDeep(query);
            const { index, body } = newQuery;

            const index_aggs = yield select(state => state.search.index_aggs);
            const index_field = yield select(state => state.search.index_field);
            let commonAggs = [];
            index.forEach((selectType, idx) => {
                const type = selectType === 'event' ? '入侵感知事件' : selectType;
                if (idx === 0) {
                    commonAggs = index_aggs[type];
                } else {
                    const aggDisable = lodash.difference(index_field[type], index_aggs[type]);
                    // console.log('1::', type, ' :::::::       ', aggDisable);
                    commonAggs = commonAggs.concat(index_aggs[type]);
                    lodash.pullAll(commonAggs, aggDisable);
                }
            });
            commonAggs = lodash.uniq(commonAggs);
            // 获取所有可聚合的字段
            const aggFields = [];
            for (let i = 0; i < allAvailableFields.length; i++) {
                if (['_id', '_index', '_score', '_type'].indexOf(allAvailableFields[i]) > -1) {
                    continue;
                }
                if (commonAggs.indexOf(`${allAvailableFields[i]}.keyword`) > -1) {
                    aggFields.push(`${allAvailableFields[i]}.keyword`);
                } else if (commonAggs.indexOf(allAvailableFields[i]) > -1) {
                    aggFields.push(allAvailableFields[i]);
                }
            }
            // console.log('aggFields:::', aggFields);
            // 根据字段数量计算拆分成多少个请求来查询检索页展示字段的聚类结果
            const length = aggFields.length;
            let chunkLen;
            switch (true) {
                case length > 0 && length <= 20:
                    chunkLen = length;
                    break;
                case length > 20 && length <= 60:
                    chunkLen = 20;
                    break;
                case length > 60 && length <= 120:
                    chunkLen = 30;
                    break;
                default:
                    chunkLen = 50;
            }

            const queryArr = [];
            console.log('chunkLen:::', chunkLen);
            const chunk = lodash.chunk(aggFields, chunkLen);
            chunk.forEach(arr => {
                const chiQuery = {
                    index,
                    body: { query: body.query, aggs: {} },
                };
                arr.forEach(field => {
                    chiQuery.body.aggs[field] = {
                        terms: {
                            field,
                            size: 100,
                            order: {
                                _count: 'desc',
                            },
                        },
                    };
                });
                // console.log('chiQuery::', JSON.stringify(chiQuery));
                queryArr.push(chiQuery);
            });

            yield put({
                type: 'commonReviseState',
                payload: {
                    fieldsAggQuery: queryArr,
                },
            });
        },

        *fetchAggregationsResults({ payload }, { call, put, select }) {
            // console.log('payload:::', payload);
            const response = yield call(esRequest, 'POST', '/api/esAggs/fieldsAggs', { query: payload });
            if (!response) return;
            const {
                data: { aggs = {} },
            } = response;
            const allAvailableFields = yield select(state => state.search.allAvailableFields);

            const esFieldRanges = {};
            Object.keys(aggs).forEach(key => {
                const field = key.split('.keyword')[0];
                if (allAvailableFields.indexOf(field) > -1) {
                    esFieldRanges[field] = {};
                    let total = aggs[key].sum_other_doc_count;
                    const { buckets } = aggs[key];
                    if (total > 0) {
                        esFieldRanges[field].num = '100+';
                    } else {
                        esFieldRanges[field].num = `${buckets.length}`;
                    }
                    buckets.forEach(item => {
                        total += item.doc_count;
                    });
                    buckets.forEach(item => {
                        let percent = Math.round((item.doc_count / total) * 10000) / 100;
                        if (percent === 0) {
                            percent = ((item.doc_count / total) * 100).toExponential(1);
                        }
                        item.percent = percent;
                    });
                    esFieldRanges[field].buckets = buckets;
                }
            });
            // console.log('esFieldRanges::::', esFieldRanges);
            yield put({
                type: 'esFieldRangesRevise',
                payload: esFieldRanges,
            });
        },

        *fetchIndexList(_, { call, put }) {
            const response = yield call(esRequest, 'POST', '/api/esIndex');
            if (!response) return;
            const {
                data: { indexSort = {}, indexArr = [], fieldArr = [] },
            } = response;
            console.log('indexArr::', indexArr);
            const index_field = {};

            const index_search = {};

            const index_aggs = {};

            const index_search_type = {};
            fieldArr.forEach((item, idx) => {
                // 获取es索引中所有初始创建的字段mapping（更改为每次搜索时更新，并只获取所查询的索引对应的字段mapping）
                const type = indexArr[idx];
                const esFieldMapping = item.fields || {};
                const fieldsArr = Object.keys(esFieldMapping);
                lodash.pullAll(fieldsArr, [
                    '_all',
                    '_field_names',
                    '_ignored',
                    '_parent',
                    '_routing',
                    '_seq_no',
                    '_source',
                    '_uid',
                    '_version',
                ]);
                // console.log('fieldsArr::', JSON.stringify(fieldsArr));
                const searchArr = [];
                const aggArr = [];
                const fieldType = {};
                fieldsArr.forEach(key => {
                    Object.keys(esFieldMapping[key]).forEach(childKey => {
                        const configObj = esFieldMapping[key][childKey];
                        if (configObj.searchable) {
                            searchArr.push(key);
                            fieldType[key] = configObj.type;
                        }
                        if (configObj.aggregatable) {
                            aggArr.push(key);
                        }
                    });
                });
                index_field[type] = fieldsArr;
                index_search[type] = searchArr;
                index_aggs[type] = aggArr;
                index_search_type[type] = fieldType;
            });
            // console.log('index_field::', index_field, 'index_aggs', index_aggs, 'index_search', index_search);
            // console.log('index_search_type::', index_search_type);

            // 按照东哥要求的进行排序
            indexSort['流量日志'] = orderBy(indexSort['流量日志'], [
                "flow",
                "http",
                "dns",
                "dhcp",
                "icmp",
                "ssh",
                "tls",
                "mysql",
                "sqlserver",
                "oracle",
                "tftp",
                "nfs",
                "smb",
                "smtp",
                "pop",
                "imap",
                "ikev2",
                "krb5",
                "dnp3",
                "pcinfo",
                "anomaly"])
            indexSort['安全事件日志'] = orderBy(indexSort['安全事件日志'], ['入侵感知事件', '失陷感知事件', '异常文件事件', 'ai_alert'])
            indexSort['原始告警日志'] = orderBy(indexSort['原始告警日志'], ['alert', 'ioc_alert', 'apt_black'])


            yield put({
                type: 'commonReviseState',
                payload: { indexSort, indexArr, index_field, index_aggs, index_search, index_search_type },
            });
        },

        *fetchAndSaveSearch({ payload }, { call, put }) {
            const { uri, data } = payload;
            const response = yield call(apiRequest, uri, data);
            if (!response) return Promise.reject();
            if (uri === 'search/getSearchList') {
                yield put({
                    type: 'commonReviseState',
                    payload: {
                        saveSearchList: {
                            list: response.list,
                            recordsTotal: response.recordsTotal,
                        },
                    },
                });
            }
            return Promise.resolve();
        },

        *fetchPcapInfo({ payload }, { call, put }) {
            try {
                const response = yield call(apiRequest, 'search/getPcapInfo', payload, true);
                yield put({
                    type: 'savePcapInfo',
                    payload: {
                        pcapInfo: response.data,
                    },
                });
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            }
        },

        *fetchSearchLog(_, { call, put }) {
            const response = yield call(apiRequest, 'search/fetchSearchLogs');
            if (!response) return;
            yield put({
                type: 'commonReviseState',
                payload: {
                    searchLogsArr: response.data,
                },
            });
        },

        *putSearchLog({ payload }, { call, put }) {
            const response = yield call(apiRequest, 'search/putSearchLog', payload);
            if (!response) return;
            yield put({
                type: 'updateSearchLog',
                payload: payload.content,
            });
        },

        *fetchDenyAll({ payload }, { call, put }) {
            const response = yield call(apiRequest, 'search/fetchDenyAll', payload);
            if (!response) return;
            const Fdeny_list = response.data && response.data.length > 0 ? response.data[0].Fdeny_list : ''
            let trafficLogStorageSelect = [] // 组合出来要勾选的数据
            // 代表全选或者部分选
            if (Fdeny_list) {
                const selectList = Fdeny_list.split(",")
                for (const key in storageLogModel) {
                    storageLogModel[key].forEach(logType => {
                        if (!trafficLogStorageSelect.includes(logType) && selectList.includes(logType)) {
                            trafficLogStorageSelect.push(logType)
                        }
                    })
                }
            }
            yield put({
                type: 'updateDenyAll',
                payload: {
                    trafficLogStorageSelect
                }
            });
            return Promise.resolve();
        },
        // 更新DenyAll
        *updateDenyAllFromDB({ payload }, { call, put }) {
            const { selectList } = payload// 这是当前勾选的日志类型

            // let list = []   //这是当前没勾选的日志类型
            // for (const key in storageLogModel) {
            //     storageLogModel[key].forEach(logType => {
            //         if (!selectList.includes(logType) && !list.includes(logType)) {
            //             list.push(logType)
            //         }
            //     })
            // }

            let paramter = {}
            // 全不选
            if (selectList.length === 0) {
                paramter = {
                    Fdeny_list: ""
                }
            } else {
                // 全选或者部分选
                paramter = {
                    Fdeny_list: selectList.toString()
                }
            }
            yield call(apiRequest, 'search/updateDenyAll', paramter);
        },
    },

    reducers: {
        esDetailState(state, { payload }) {
            const { esDetail, ...other } = payload;
            return {
                ...state,
                ...other,
                esDetail: Object.assign({}, state.esDetail, esDetail),
            };
        },
        commonReviseState(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
        savePcapInfo(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
        updateSearchLog(state, { payload }) {
            const { searchLogsArr } = state;
            if (searchLogsArr.indexOf(payload) < 0) {
                searchLogsArr.unshift(payload);
                if (searchLogsArr.length > 200) searchLogsArr.pop();
            }
            // console.log('searchLogsArr::::', searchLogsArr);
            return {
                ...state,
                searchLogsArr,
            };
        },
        esFieldRangesRevise(state, { payload }) {
            return {
                ...state,
                esFieldRanges: Object.assign({}, state.esFieldRanges, payload),
            };
        },
        updateDenyAll(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        }

    },
};



/**
 * 数组排序
 * @param  source 待排序数组
 * @param  orders 排序字段数组
 */
function orderBy(source, orders) {
    if (source instanceof Array && orders instanceof Array && orders.length > 0) {
        // 不在排序规则中的元素暂时放这里
        const temp = []
        const indexs = []
        for (let i = 0; i < source.length; i++) {
            const element = source[i];
            if (!orders.includes(element)) {
                temp.push(element)
            } else {
                // 在排序数组中存在那么记录对应的索引
                let index = orders.findIndex(item => {
                    return item === element
                })
                indexs.push(index)
            }
        }
        indexs.sort((a, b) => {
            return a - b
        })
        // _logger.info('indexs', indexs);
        // 按照排列好的索引挨个往result里push
        var result = []
        for (let i = 0; i < indexs.length; i++) {
            const index = indexs[i];
            result.push(orders[index])
        }
        // 最后result和temp 拼接然后返回
        result = result.concat(temp)
        // _logger.info('result', result);
        return result;
    } else {
        return source;
    }
}
