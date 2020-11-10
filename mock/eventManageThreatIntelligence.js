import mockjs from 'mockjs';
import common from './common';

/* eslint-disable camelcase */

function getEventManageList(req, res) {
  const { body } = req;
  const dataList = mockjs.mock({
    'list|101': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        'ti_title|1': ['规则一', '规则二', '规则三'],
        'ti_type|1': ['IP', 'DOMAIN', 'MD5'],
        'ti_list|1': ['www.baidu.com', '231515\nxzcvxcd', 'sdfwev.com\nxzcvxcd\nsdf.com'],
        'ti_category|1': ['远控木马', '窃密', 'APT'],
        'severity|1': ['1', '2', '3', '4', '5'],
        'confidence|1': ['1', '2', '3', '4', '5'],
        'attackStage|1': ['意图一', '意图二', '意图三'],
        'source|1': ['系统默认', '自定义', '来源三'],
        itime: '2018-10-12 12:12:25',
        'status|1': ['ON', 'OFF'],
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'ok',
    data: {
      list: dataList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
      recordsTotal: 101,
    },
  };
  return res.json(result);
}

function getAlertManageList(req, res) {
  const { body } = req;
  const dataList = mockjs.mock({
    'list|101': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        'name|1': ['规则一', '规则二', '规则三'],
        'category|1': ['远控木马', '窃密', 'APT'],
        'level|1': [1, 2, 3, 4, 5],
        'credit_score|1': [1, 2, 3, 4, 5],
        'attack_scene|1': ['意图一', '意图二', '意图三'],
        'rule_author|1': ['系统默认', 'USER', '来源三'],
        update_time: '2018-10-12 12:12:25',
        'enable_flag|1': [0, 1],
        'merge_switch|1': [0, 1],
        description: '规则或威胁详情描述',
        process_suggest: '处理或补丁建议',
        signature: '规则内容',
        merge_method: '{ "minute": 60, "field": ["src_ip", "dst_ip"] }',
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'ok',
    data: {
      list: dataList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
      recordsTotal: 101,
    },
  };
  return res.json(result);
}

// 查询全局归并策略
function get_global_merge(req, res) {
  const result = {
    error_code: 0,
    msg: {
      field: ['src_ip', 'dst_ip', 'src_port', 'dst_port'],
      switch: 1,
      minute: 60,
    },
  };
  return res.json(result);
}

// 更新全局归并策略
// 传参 merge='{“switch”:1,“minute”:120,“field”:[“src_ip”,”dst_ip”]}'
function set_global_merge(req, res) {
  const result = {
    error_code: 0,
    msg: '',
  };
  return res.json(result);
}

function validataRule(req, res) {
  // const result = {
  //   error_code: 0,
  //   msg: '',
  // };
  const result = {
    error_code: 1,
    msg: '规则验证出错，规则验证出错，规则验证出错',
  };
  return res.json(result);
}

function validataRuleName(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: 0,
  };
  return res.json(result);
}
export default {
  'POST /api/event/getCustomThreat': getEventManageList,
  'POST /api/event/putCustomThreat': common.ok,
  'POST /api/event/delCustomThreat': common.ok,
  'POST /api/event/editCustomThreat': common.ok,
  'POST /api/event/setStatusCustomThreat': common.ok,
  'POST /api/event/getAlertManage': getAlertManageList,
  'POST /api/event/putAlertManage': common.ok,
  'POST /api/event/editAlertManage': common.ok,
  'POST /api/event/delAlertManage': common.ok,
  'POST /api/event/get_global_merge': get_global_merge,
  'POST /api/event/set_global_merge': set_global_merge,
  'POST /api/event/verifyRule': validataRule,
  'POST /api/event/ruleNameIsHas': validataRuleName,
};
