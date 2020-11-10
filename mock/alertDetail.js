import mockjs from 'mockjs';

function getEventDetail(req, res) {
  // const { body } = req;
  const eventDetail = {
    time: '2018-09-11',
    intention: '攻击意图',
    module: '模块',
    catagory: '分类',
    fileName: '文件名',
    fileType: '文件类型',
    ioc: '9d6c47442d23334e376ee78a612256ef',
    ioc_plaintext: 'zentoryny.duckdns.org',
    iocType: 'domain',
    iocTags: ['darkkomet', 'darkkomet1'],
    ioc_basic_info: { registrar: '', status: '', update_time: '' },
    ioc_context: {
      black_md5_contain_domain: [],
      black_md5_download_from_domain: [],
      black_md5_visit_domain: [],
      black_url_of_domain: [],
      resolution_ip: [{ end_time: '20181017', ip: '78.161.187.216' }],
      threat_info: [],
    },
    MD5: 'MD5',
    property: { id: 1, name: 'PC-001', ip: '10.11.11.2' },
    protocol: 'http',
    srcIps: [{ ip: '10.1.1.1', port: '80' }],
    destIps: [{ ip: '10.1.1.1', port: '80' }],
    mergeNum: 1,
    ruleLevel: 1,
    ruleConfidence: 1,
    source: '数据源',
    desc: '东方闪电',
    suggestion: '建议',
  }; // 归并事件数
  const result = {
    error_code: 0,
    msg: 'ok',
    data: eventDetail,
    // data: eventList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
    recordsTotal: 50,
  };
  res.json(result);
}

function getWarningData(req, res) {
  const { body } = req;
  const eventList = mockjs.mock({
    'list|100': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        time: '2018-09-10',
        name: '事件名称',
        property: [{ name: 'pc-001', id: 1 }],
        'srcIp|1-4': [mockjs.mock('@ip')],
        'destIp|1-4': [mockjs.mock('@ip')],
        'srcPorts|1-3': [90],
        'destPorts|1-3': [90],
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'ok',
    data: eventList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
    recordsTotal: 100,
  };
  return res.json(result);
}
function getLogData(req, res) {
  const { body } = req;
  const eventList = mockjs.mock({
    'list|100': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        time: '2018-09-10',
        payload: '日志内容',
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'ok',
    data: eventList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
    recordsTotal: 100,
  };
  return res.json(result);
}
export default {
  'POST /api/event/getAlertDetail': getEventDetail,
  'POST /api/event/getWarningAlertData': getWarningData,
  'POST /api/event/getLogAlertData': getLogData,
};
