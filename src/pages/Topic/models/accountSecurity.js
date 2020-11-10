/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */

import { apiRequest } from '@/services/api';
import configSettings from '../../../configSettings';
import moment from 'moment';
import lodash from 'lodash';

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */

export default {
  namespace: 'accountSecurity',
  state: {
    // 登录来源数据
    loginSourceList: { total: 0, list: [] },
    // 登录来源地图数据
    loginSourceMapData: [],
    // 登录行为数据
    behaviorTrend: [],
    // 登录类型分布数据
    loginDistributionList: [],
    // 爆破统计数据
    explodeList: { total: 0, list: [] },
    // 行为间隔
    behaviorInterval: 0,
    // 弱密码展示表
    weakPasswordList: {
      total: 0,
      list: []
    }
  },

  effects: {
    //  登录来源
    *fetchLoginSource({ payload }, { call, put }) {
      const newPay = configSettings.searchDivision(payload);
      if (newPay.sort === undefined) {
        newPay.sort = '_count';
        newPay.dir = 'desc';
      }
      const response = yield call(apiRequest, 'account/loginSource', newPay);
      if (!response) return;
      let hanledData = Array.isArray(response.data) ? response.data : [];
      const mapData = [];
      hanledData = hanledData.map((item, index) => {
        const { key, doc_count, loginSuccess, loginFailure, cities } = item;
        let loginSucc = loginSuccess;
        if (!loginSucc) {
          loginSucc = { doc_count: 0 };
        }
        const ratio = loginSucc.doc_count / doc_count;
        let percent = Math.round(ratio * 10000) / 100;
        if (percent === 0 && ratio !== 0) {
          percent = (ratio * 100).toExponential(1);
        }
        // 地图数据 是按城市维度
        const cityList = Array.isArray(cities.buckets) ? cities.buckets : [];
        cityList.forEach(city => {
          const { key: cityKey, doc_count: cityLoginCount, loginSuccess: cityLoginSuccess, location } = city;
          const cityPercent = Math.round((cityLoginSuccess.doc_count / cityLoginCount) * 10000) / 100;
          let src_ip_location =
            location.hits && location.hits.hits && location.hits.hits[0]._source && location.hits.hits[0]._source.src_ip_location;
          src_ip_location = src_ip_location || {};
          const cityData = {
            location: `${key}-${cityKey}`,
            _count: cityLoginCount,
            percent: cityPercent,
            ...src_ip_location,
          };
          mapData.push(cityData);
        });
        const obj = {
          key: index,
          country: key,
          _count: doc_count,
          loginSuccess: loginSuccess.doc_count,
          loginFailure: loginFailure.doc_count,
          percent,
        };
        return obj;
      });
      console.log('mapData', mapData);
      yield put({
        type: 'saveLoginSourceList',
        payload: {
          loginSourceList: {
            list: hanledData,
            total: response.total || 0,
          },
          loginSourceMapData: mapData,
        },
      });
    },
    // 登录行为趋势
    *fetchLoginBehaviorTrend({ payload }, { call, put }) {
      console.log("登录行为趋势_payload", payload)
      const newPay = configSettings.searchDivision(payload);
      const response = yield call(apiRequest, 'account/behaviorTrend', newPay);
      if (!response) return;
      const handledData = Array.isArray(response.data) ? response.data : [];
      let interval = 0;

      /** 不懂这块逻辑什么意思***start** */
      console.log("登录行为趋势_handledData", handledData)
      if (handledData[0]) {
        const timeKey = Object.keys(handledData[0]);
        interval = new Date(timeKey[2]).getTime() - new Date(timeKey[1]).getTime();
      }
      /** 不懂这块逻辑什么意思***end** */

      // 组合成折线图认识的数据
      const lineGraphData = []
      if (handledData.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < handledData.length; i++) {
          const elementOne = handledData[i];
          const appProto = elementOne.key // 应用层协议 一个协议一条线
          // eslint-disable-next-line prefer-destructuring
          const buckets = elementOne.loginNums.buckets
          // eslint-disable-next-line no-plusplus
          for (let j = 0; j < buckets.length; j++) {
            const elementTwo = buckets[j]
            lineGraphData.push({
              appProto,
              count: elementTwo.doc_count,// 登录次数

              formattedTime: moment(elementTwo.key).format('YYYY-MM-DD HH:mm:ss')
            })
          }
        }
      }
      console.log("登录行为趋势_传给折线图的数据", lineGraphData)

      yield put({
        type: 'saveBehaviorTrend',
        payload: {
          behaviorInterval: lodash.isNaN(interval) ? 0 : interval,
          behaviorTrend: lineGraphData,
        },
      });
    },
    // 登录类型分布
    *fetchLoginDistributionList({ payload }, { call, put }) {
      const newPay = configSettings.searchDivision(payload);
      const response = yield call(apiRequest, 'account/loginDistribution', newPay);
      if (!response) return;
      let hanledData = Array.isArray(response.data) ? response.data : [];
      hanledData = hanledData.map(item => {
        const obj = {
          x: item.key,
          y: item.doc_count,
        };
        return obj;
      });
      yield put({
        type: 'saveLoginDistributionList',
        payload: {
          loginDistributionList: hanledData,
        },
      });
    },
    // 爆破账号登录统计
    *fetchExplodeAccountList({ payload }, { call, put }) {
      console.log("爆破账号登录统计_payload", payload)
      const newPay = configSettings.searchDivision(payload);
      const response = yield call(apiRequest, 'account/explodeAccount', newPay);
      if (!response) return;
      let hanledData = Array.isArray(response.data) ? response.data : [];
      hanledData = hanledData.map((item, indexKey) => {
        const { key, loginSuccess, loginFailure, location } = item;
        let src_ip_location =
          location.hits && location.hits.hits && location.hits.hits[0]._source && location.hits.hits[0]._source.src_ip_location;
        src_ip_location = src_ip_location || {};

        let dst_ip_location =
          location.hits && location.hits.hits && location.hits.hits[0]._source && location.hits.hits[0]._source.dst_ip_location;
        dst_ip_location = dst_ip_location || {};
        const source = (location.hits && location.hits.hits && location.hits.hits[0]._source && location.hits.hits[0]._source) || {};

        const arr = key.split('-');
        const obj = {
          loginSuccess: loginSuccess.doc_count,
          oldestTime: loginSuccess.oldestTime.value ? moment(loginSuccess.oldestTime.value).format('YYYY-MM-DD HH:mm:ss') : '',
          loginFailure: loginFailure.doc_count,
          src_country: src_ip_location.country,
          dst_country: dst_ip_location.country,
          vpcid: source.dst_vpcid || source.src_vpcid,
          key: indexKey// 加一个key为了表格渲染
        };
        const keyArr = ['username', 'src_ip', 'dst_ip', 'app_proto'];
        if (arr.length === 4) {
          arr.forEach((a, index) => {
            obj[keyArr[index]] = a;
          });
        } else {
          obj.username = arr.slice(0, arr.length - 3).join('-');
          const remain = arr.slice(arr.length - 3);
          remain.forEach((r, index) => {
            obj[keyArr[index + 1]] = r;
          });
        }
        return obj;
      });
      yield put({
        type: 'saveExplodeList',
        payload: {
          explodeList: {
            list: hanledData,
            total: response.total || 0,
          },
        },
      });
    },
    // 爆破行为统计
    *fetchExplodeBehaviorList({ payload }, { call, put }) {
      const newPay = configSettings.searchDivision(payload);
      const response = yield call(apiRequest, 'account/explodeBehavior', newPay);
      if (!response) return;
      let hanledData = Array.isArray(response.data) ? response.data : [];
      hanledData = hanledData.map((item, index) => {
        const { key, loginSuccess, dst_ip, app_proto, username, loginFailure, srcCountry, vpcid } = item;
        let destIpList = lodash.uniqBy(dst_ip.buckets, 'key');
        destIpList = destIpList.map(data => {
          const { key: ip, country } = data;
          return { ip, country: country.buckets[0] ? country.buckets[0].key : '' };
        });
        // console.log('destIpList', destIpList);
        const source = (vpcid.hits && vpcid.hits.hits && vpcid.hits.hits[0]._source && vpcid.hits.hits[0]._source) || {};
        const vpc = source.src_vpcid || source.dst_vpcid;

        const obj = {
          src_ip: key,
          dst_ip: destIpList,
          app_proto: lodash.uniq(app_proto.buckets ? app_proto.buckets.map(ip => ip.key) : []),
          username: lodash.uniq(username.buckets ? username.buckets.map(ip => (ip.key === '' ? 'null' : ip.key)) : []),
          loginSuccess: loginSuccess.doc_count,
          oldestTime: loginSuccess.oldestTime.value ? moment(loginSuccess.oldestTime.value).format('YYYY-MM-DD HH:mm:ss') : '',
          loginFailure: loginFailure.doc_count,
          srcCountry: srcCountry && srcCountry.buckets[0] && srcCountry.buckets[0].key,
          vpcid: vpc,
          key: index// 加一个key为了表格渲染
        };
        return obj;
      });
      yield put({
        type: 'saveExplodeList',
        payload: {
          explodeList: {
            list: hanledData,
            total: response.total || 0,
          },
        },
      });
    },
    // 获取白名单列表
    *fetchWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'account/getWhiteList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    // 删除白名单
    *deleteWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'account/deleteWhiteList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response);
    },
    // 搜索白名单列表
    *searchWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'account/searchWhiteList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    // 添加白名单
    *addToWhiteList({ payload }, { call }) {
      const response = yield call(apiRequest, 'account/addWhiteList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    // 弱密码登录统计表(es日志查询)
    *fetchWeakPasswordList({ payload }, { call, put }) {
      console.log("弱密码加载_payload", payload)
      const newPay = configSettings.searchDivision(payload);
      const response = yield call(apiRequest, 'account/weakPasswordList', newPay);
      if (!response) return;
      let hanledData = Array.isArray(response.data) ? response.data : [];
      hanledData = hanledData.map((item, indexKey) => {
        const { key, location, loginFailure, loginSuccess, numberOfLoginSourceIP } = item;
        const arr = key.split('-');
        if (arr.length !== 4) return
        const obj = {
          dstIp: arr[0],// 目的IP
          appProto: arr[1],// 协议
          userName: arr[2],// 账号
          password: arr[3],// 密码
          numberOfLoginSourceIP: numberOfLoginSourceIP.value,// 登录源个数
          loginSuccessTimes: loginSuccess.doc_count,// 登录成功次数
          logonFailureTimes: loginFailure.doc_count,// 登录失败次数
          // 首次登录时间
          firstLoginTime: loginSuccess.fistLoginTime.value ? moment(loginSuccess.fistLoginTime.value).format('YYYY-MM-DD HH:mm:ss') : "",
          // 最后登录时间
          lastLoginTime: loginSuccess.lastLoginTime.value ? moment(loginSuccess.lastLoginTime.value).format('YYYY-MM-DD HH:mm:ss') : "",
          key: indexKey, // 加一个key为了表格渲染
          // 弱密码表扩展行的分页设置
          weakPasswordExpandPagination: {
            page: 1,
            pageSize: 10
          },
          // 弱密码表扩展行列表
          weakPasswordExpandList: {
            total: 0,
            list: []
          }
        };
        // ip其他相关信息
        let ipOtherRelevantInformation = {}
        if (location.hits && location.hits.hits && location.hits.hits[0]._source) {
          ipOtherRelevantInformation = location.hits.hits[0]._source
        }
        obj.src_ip_country = ipOtherRelevantInformation.src_ip_location.country
        obj.dst_ip_country = ipOtherRelevantInformation.dst_ip_location.country
        // eslint-disable-next-line consistent-return
        return obj;
      });
      yield put({
        type: 'saveWeakPasswordList',
        payload: {
          weakPasswordList: {
            list: hanledData,
            total: response.total || 0,
          },
        },
      });
    },
    // 弱密码统计表某一行点击聚合展示(es日志查询)
    *fetchWeakPasswordAggregationDisplay({ payload }, { call }) {
      console.log("弱密码聚合展示_payload", payload)
      const newPay = configSettings.searchDivision(payload);
      const response = yield call(apiRequest, 'account/weakPasswordAggregationDisplay', newPay);
      if (!response) return Promise.reject();
      const res = {
        total: response.data.total,
        list: []
      }
      res.list = response.data.list.map((item, index) => {
        const newItem = item
        newItem.loginTime = item.loginTime ? moment(item.loginTime).format('YYYY-MM-DD HH:mm:ss') : ""
        newItem.loginResults = item.loginResults ? "成功" : "失败"
        newItem.key = index
        return newItem
      })
      return Promise.resolve(response.data);
    },

    // 弱密码表查询（mysql）
    *searchWeakPasswordList({ payload }, { call }) {
      const response = yield call(apiRequest, 'account/searchWeakPasswordList', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    // 删除一条弱密码
    *deleteWeakPassword({ payload }, { call }) {
      const response = yield call(apiRequest, 'account/deleteWeakPassword', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    // 编辑一条弱密码
    *editWeakPassword({ payload }, { call }) {
      const response = yield call(apiRequest, 'account/editWeakPassword', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    // 添加一条弱密码
    *addWeakPassword({ payload }, { call }) {
      const response = yield call(apiRequest, 'account/addWeakPassword', payload);
      if (!response) return Promise.reject();
      return Promise.resolve(response.data);
    },
    // 修改弱密码展示表扩展行的数据
    *changeTheWeakPasswordToShowTheTableExtensionRowData({ payload }, {  put }) {
      yield put({
        type: 'saveWeakPasswordListExpandData',
        payload,
      });
      return Promise.resolve();
    }
  },

  reducers: {
    saveLoginSourceList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveBehaviorTrend(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveLoginDistributionList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveExplodeList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveWeakPasswordList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // 修改弱密码展示表扩展行的数据
    saveWeakPasswordListExpandData(state, { payload }) {
      const { weakPasswordExpandList, weakPasswordExpandPagination, index } = payload
      const { weakPasswordList: { list } } = state
      list[index].weakPasswordExpandList = weakPasswordExpandList
      list[index].weakPasswordExpandPagination = weakPasswordExpandPagination
      const newState = lodash.cloneDeep(state)
      return {
        ...state,
        ...newState
      }
    }
  },
};
