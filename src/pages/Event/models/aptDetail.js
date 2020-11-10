import { apiRequest } from '@/services/api';
import handleEsData from '../../../tools/handleEsData';

/* eslint-disable no-underscore-dangle */

const levelName = num => {
  if (num === 3) return '全部行为';
  if (num === 4) return '可疑行为';
  if (num === 5) return '恶意行为';
  return null;
};

const fileDataHandle = (arr, allArr, obj) => {
  Object.keys(obj).forEach((key, i) => {
    const item = obj[key] instanceof Array ? obj[key] : [obj[key]];
    const levelNum = item[0].Level;
    const val = { id: `${i + 1}_${key}`, desc: key, count: item.length, levelType: levelNum, level: levelName(levelNum), extra: item };
    arr.push(val);
    allArr.push(val);
    arr.sort((a, b) => {
      if (a.levelType > b.levelType) {
        return -1;
      }
      if (a.levelType < b.levelType) {
        return 1;
      }
      return 0;
    });
    console.log('arr==', arr);
  });
};

export default {
  namespace: 'aptDetail',
  state: {
    eventDetail: {},
    ipCateObj: {},
    warningData: { recordTotal: 0, list: [] },
    logData: { recordTotal: 0, list: [] },
    behaviorObj: { File: [], Hook: [], Net: [], Other: [], Process: [], Reg: [], ProcessTree: {} },
    allObj: { File: [], Hook: [], Net: [], Other: [], Process: [], Reg: [], ProcessTree: {} },
    behaviorObjUpload: { File: [], Hook: [], Net: [], Other: [], Process: [], Reg: [], ProcessTree: {} },
    allObjUpload: { File: [], Hook: [], Net: [], Other: [], Process: [], Reg: [], ProcessTree: {} },
    analyzeProcess: [],
    analyzeProcessUpload: [],
    imageData: [],
    fileExists: false,
    // allBehaviorList: {},
  },

  effects: {
    *fetchEventDetail({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getEventDetail', payload);
      if (!response || !response.data) return;
      const { _source, _id } = response.data;
      const eventDetail = { ..._source, _id };
      eventDetail.vpcid = eventDetail.src[0].vpcid || eventDetail.dst[0].vpcid;

      // 攻击者受害者ip
      const { attackerIps, victimIps, iocType = '' } = _source;
      const ipCateObj = {};
      if (iocType !== "domain") {
        attackerIps.forEach(tmp => {
          ipCateObj[tmp] = '攻击者';
        });
      }
      victimIps.forEach(tmp => {
        ipCateObj[tmp] = '受害者';
      });
      yield put({
        type: 'saveAptDetail',
        payload: { eventDetail, ipCateObj },
      });
    },
    *fetchWarningData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'event/getWarningData', { indexType: 'apt', ...payload });
      if (!response || !response.data) return;
      yield put({
        type: 'saveWarningData',
        payload: {
          warningData: {
            list: Array.isArray(response.data) ? handleEsData(response.data) : [{ ...response.data._source, _id: response.data._id }],
            recordsTotal: response.recordsTotal || 0,
          },
        },
      });
    },
    *fetchLogData({ payload }, { call, put }) {
      // 请求接口和fetchWarningData一致，数据源是一样的，因为要有不同的分页，所以要请求两次
      const response = yield call(apiRequest, 'event/getWarningData', { indexType: 'apt', ...payload });
      if (!response || !response.data) return;

      yield put({
        type: 'saveLogData',
        payload: {
          logData: {
            list: Array.isArray(response.data) ? handleEsData(response.data) : [{ ...response.data._source, _id: response.data._id }],
            recordsTotal: response.recordsTotal || 0,
          },
        },
      });

      // let list = [];
      // if (Array.isArray(response.data)) {
      //   list = response.data.map(item => {
      //     const { _source, _id } = item;
      //     return { timestamp: _source.timestamp, payload: JSON.stringify({ ..._source, _id }) };
      //   });
      // } else if (response.data) {
      //   const { _source, _id } = response.data;
      //   list = [{ timestamp: _source.timestamp, payload: JSON.stringify({ ..._source, _id }) }];
      // }
      // yield put({
      //   type: 'saveLogData',
      //   payload: {
      //     logData: {
      //       list,
      //       recordsTotal: response.recordsTotal || 0,
      //     },
      //   },
      // });
    },
    *fetchFileBehavior({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'file/getFileBehavior', payload);
      if (!response || !response.data) return;
      const obj = { File: [], Hook: [], Net: [], Other: [], Process: [], Reg: [], ProcessTree: {} };
      const allObj = { File: [], Hook: [], Net: [], Other: [], Process: [], Reg: [], ProcessTree: {} };
      if (response.data.length && response.data[0].extra_info) {
        const data = JSON.parse(response.data[0].extra_info);
        const {
          Dynamic: { File, Hook, Net, Other, Process, Reg, ProcessTree },
        } = data;
        console.log('other', obj.Other, allObj.Other, Other);
        // console.log(99, data);
        // Process File Reg Net Hook Other
        // 进程行为 文件行为 注册表行为 网络行为 Hook行为 其他行为
        fileDataHandle(obj.File, allObj.File, File);
        fileDataHandle(obj.Hook, allObj.Hook, Hook);
        fileDataHandle(obj.Net, allObj.Net, Net);
        fileDataHandle(obj.Other, allObj.Other, Other);
        fileDataHandle(obj.Process, allObj.Process, Process);
        fileDataHandle(obj.Reg, allObj.Reg, Reg);
        obj.ProcessTree = ProcessTree;
        allObj.ProcessTree = ProcessTree;
      }
      console.log(99, obj);
      yield put({
        type: 'saveFileBehavior',
        payload: {
          behaviorObj: obj,
          allObj,
        },
      });
    },
    // 文件上传  文件行为详情
    *fetchUoloadFileBehavior({ payload }, { call, put }) {
      // dyreport_content  habo_content xpcn_content
      // extra_info  对应   dyreport_content
      // analyze   对于      habo_content
      const response = yield call(apiRequest, 'scan/getUploadFileBehavior', payload);
      // console.log(456, 'fetchUoloadFileBehavior==', response);

      // console.log(456, 'xpcn_content==', JSON.parse(response.msg.xpcn_content));
      if (!response || !response.msg) return;
      const obj = { File: [], Hook: [], Net: [], Other: [], Process: [], Reg: [], ProcessTree: {} };
      const allObj = { File: [], Hook: [], Net: [], Other: [], Process: [], Reg: [], ProcessTree: {} };
      if (response.msg && response.msg.dyreport_content) {
        const data = JSON.parse(response.msg.dyreport_content);
        const {
          Dynamic: { File, Hook, Net, Other, Process, Reg, ProcessTree },
        } = data;
        // console.log('other', obj.Other, allObj.Other, Other);
        // console.log(99, data);
        // Process File Reg Net Hook Other
        // 进程行为 文件行为 注册表行为 网络行为 Hook行为 其他行为
        fileDataHandle(obj.File, allObj.File, File);
        fileDataHandle(obj.Hook, allObj.Hook, Hook);
        fileDataHandle(obj.Net, allObj.Net, Net);
        fileDataHandle(obj.Other, allObj.Other, Other);
        fileDataHandle(obj.Process, allObj.Process, Process);
        fileDataHandle(obj.Reg, allObj.Reg, Reg);
        obj.ProcessTree = ProcessTree;
        allObj.ProcessTree = ProcessTree;
      }
      console.log(99, obj);

      // 本地文件上传 fetchFileAnalyzeProcess 处理

      let haboContentObj;
      try {
        haboContentObj = JSON.parse(response.msg.habo_content);
      } catch (error) {
        console.log('error', error);
        haboContentObj = {};
      }
      const result = [];
      if (haboContentObj.AnalyzeTime) {
        const { AnalyzeTime } = haboContentObj;
        const keys = Object.keys(AnalyzeTime);
        if (keys.length > 0) {
          const quite = {};
          const dynamic = {};
          keys.forEach(item => {
            if (item.indexOf('Start') > 0) {
              if (item === 'Static Start Time') {
                quite.key = '静态分析';
                quite.startTime = AnalyzeTime[item];
              } else if (item === 'Dynamic Start Time') {
                dynamic.key = '动态分析';
                dynamic.startTime = AnalyzeTime[item];
              }
            } else if (item.indexOf('End') > 0) {
              if (item === 'Static End Time') {
                quite.key = '静态分析';
                quite.endTime = AnalyzeTime[item];
              } else if (item === 'Dynamic End Time') {
                dynamic.key = '动态分析';
                dynamic.endTime = AnalyzeTime[item];
              }
            }
          });
          if (Object.keys(quite).length > 0) {
            result.push(quite);
            // console.log('result', result);
          }
          if (Object.keys(dynamic).length > 0) {
            result.push(dynamic);
            // console.log('result', result);
          }
        }
      }
      // console.log('result', result);
      // yield put({
      //   type: 'saveFileAnalyzeProcess',
      //   payload: {
      //     analyzeProcess: result,
      //   },
      // });

      yield put({
        type: 'saveFileBehavior',
        payload: {
          behaviorObjUpload: obj,
          allObjUpload: allObj,
          analyzeProcessUpload: result,
        },
      });
    },
    *fileExists({ payload }, { call, put }) {
      try {
        const response = yield call(apiRequest, 'file/vmFileExists', payload, true);
        yield put({
          type: 'saveImageData',
          payload: {
            fileExists: response.data,
          },
        });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchFileAnalyzeProcess({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'file/analyzeProcess', payload);
      if (!response || !response.data) return;
      let obj;
      try {
        obj = JSON.parse(response.data.analyze_info);
      } catch (error) {
        console.log('error', error);
        obj = {};
      }
      const result = [];
      if (obj.AnalyzeTime) {
        const { AnalyzeTime } = obj;
        const keys = Object.keys(AnalyzeTime);
        if (keys.length > 0) {
          const quite = {};
          const dynamic = {};
          keys.forEach(item => {
            if (item.indexOf('Start') > 0) {
              if (item === 'Static Start Time') {
                quite.key = '静态分析';
                quite.startTime = AnalyzeTime[item];
              } else if (item === 'Dynamic Start Time') {
                dynamic.key = '动态分析';
                dynamic.startTime = AnalyzeTime[item];
              }
            } else if (item.indexOf('End') > 0) {
              if (item === 'Static End Time') {
                quite.key = '静态分析';
                quite.endTime = AnalyzeTime[item];
              } else if (item === 'Dynamic End Time') {
                dynamic.key = '动态分析';
                dynamic.endTime = AnalyzeTime[item];
              }
            }
          });
          if (Object.keys(quite).length > 0) {
            result.push(quite);
            // console.log('result', result);
          }
          if (Object.keys(dynamic).length > 0) {
            result.push(dynamic);
            // console.log('result', result);
          }
        }
      }
      // console.log('result', result);
      yield put({
        type: 'saveFileAnalyzeProcess',
        payload: {
          analyzeProcess: result,
        },
      });
    },
    *fetchImgaeData({ payload }, { call, put }) {
      const response = yield call(apiRequest, 'file/getImg', payload);
      if (!response || !response.data) return;
      console.log('res', response.data);
      // const data = response.data.pic_list || [];
      yield put({
        type: 'saveImageData',
        payload: {
          imageData: response.data,
        },
      });
    },
  },

  reducers: {
    saveAptDetail(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveWarningData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveLogData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveFileBehavior(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // saveAllBehavior(state, { payload }) {
    //   return {
    //     ...state,
    //     ...payload,
    //   };
    // },
    saveFileAnalyzeProcess(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveImageData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
