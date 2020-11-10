import mockjs from 'mockjs';
import moment from 'moment';

function getEventDetail(req, res) {
  // const { body } = req;
  const eventDetail = {
    ip: '45.122.138.118',
    location: '中国香港-hong kong (sar)-hong kong',
    tag: [{ name: 'bondat', level: 1 }, { name: 'Bondat', level: 4 }, { name: 'GandCars3', level: 1 }],
    time: '2018-09-11',
    intention: '攻击意图',
    module: '模块',
    catagory: '分类',
    fileName: '文件名',
    fileType: '文件类型',
    MD5: 'MD5',
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

function getDomainData(req, res) {
  const { body } = req;
  const eventList = mockjs.mock({
    'list|100': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        time: '2018-09-10',
        name: '112sgfasg.com',
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
function getSampleData(req, res) {
  const { body } = req;
  const eventList = mockjs.mock({
    'list|100': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        time: '2018-09-10',
        name: '样本safdasfadfsg',
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
function getAttackChain(req, res) {
  const now = moment('2018-09-25');
  const testData = [];

  /* eslint-disable no-plusplus */

  for (let i = 0; i < 175; i++) {
    const obj = {
      eventTime: now.subtract('day', 1).format('YYYY-MM-DD'),
      eventNum: Math.ceil(Math.random(20) * 100),
    };
    testData.push(obj);
  }
  const result = {
    error_code: 0,
    msg: 'ok',
    data: testData,
    recordsTotal: 100,
  };
  return res.json(result);
}

function getEventList(req, res) {
  const { body } = req;
  const eventList = mockjs.mock({
    'list|100': [
      {
        '_id|+1': mockjs.mock('@increment(1)'),
        _source: {
          tsOldest: 1536537600000,
          tsLatest: 1536539600000,
          name: '事件名称',
          affectedAssets: [{ assetName: 'pc-001', ip: mockjs.mock('@ip') }],
          'src|1-4': [{ ip: mockjs.mock('@ip'), 'ipCountry|1': ['美国', '中国', '日本'] }],
          'dst|1-4': [{ ip: mockjs.mock('@ip'), 'ipCountry|1': ['美国', '中国', '日本'] }],
          'attackStage|1': ['意图1', '意图2', '意图3'],
          'score|1-100': 1,
          'status|1': ['handled', 'unhandled', 'ignored'],
          'category_1|1': ['入侵感知', '失陷感知', '异常文件感知'],
        },
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'ok',
    data: {
      total: 100,
      hits: eventList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
    },
  };
  return res.json(result);
}

function getAttackChainChart(req, res) {
  const now = moment('2018-09-25');
  const testData = [];

  /* eslint-disable no-plusplus */

  for (let i = 0; i < 175; i++) {
    const curDate = now.subtract('day', 1).format('YYYY-MM-DD');
    const curMonth = moment(curDate).format('M');
    const curDay = moment(curDate).format('d');
    const obj = {
      date: curDate,
      commits: Math.ceil(Math.random() * 10),
      month: curMonth - 1,
      day: curDay - 0,
    };
    testData.push(obj);
  }
  testData.reverse();
  let curWeek = 0;
  for (let i = 0; i < testData.length; i++) {
    testData[i].week = `${curWeek}`;
    if (testData[i].day === 6) curWeek++;
  }

  const result = {
    error_code: 0,
    msg: 'ok',
    data: testData,
  };
  return res.json(result);
}

export default {
  'POST /api/event/getChainEventList': getEventList,
  'POST /api/event/getIcoDetail': getEventDetail,
  'POST /api/event/getDomainIcoData': getDomainData,
  'POST /api/event/getSampleIcoData': getSampleData,
  'POST /api/event/getAttackChain': getAttackChain,
  'POST /api/event/getAttackChainChart': getAttackChainChart,
  'POST /api/event/getWarningIcoData': getWarningData,
  'POST /api/event/getLogIcoData': getLogData,
};
