import mockjs from 'mockjs';

function getDnsTypeAnalyze(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        key: 'A',
        doc_count: 8,
        max_time: {
          value: 1538106903705,
          value_as_string: '2018-09-28T03:55:03.705Z',
        },
        time: 1538106903705,
        percent: 100,
      },
    ],
  };
  return res.json(result);
}

function getDnsErrorAnalyze(req, res) {
  const mockData = mockjs.mock({
    'list|50': [
      {
        key: '@city',
        'doc_count|1-100': 150,
        max_time: { value: 1539919951432, value_as_string: '2018-10-19T03:32:31.432Z' },
        'time|1': [1539919951432, 1536919951432, 1539912251432, 1539911951432],
        'percent|1-100': 100,
      },
    ],
  });
  const result = { error_code: 0, msg: 'succ', data: mockData.list };
  return res.json(result);
}
function getWhiteList(req, res) {
  const result = {
    error_code: 0,
    data: [
      {
        ip: '0.0.0.0',
      },
    ],
    msg: 'succ',
  };
  return res.json(result);
}
function getDnsServerList(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        key: '192.168.47.134',
        doc_count: 1,
        max_time: {
          value: 1537415343705,
          value_as_string: '2018-09-20T03:49:03.705Z',
        },
        time: 1537415343705,
        percent: 12.5,
      },
      {
        key: '192.168.47.135',
        doc_count: 2,
        max_time: {
          value: 1537415343705,
          value_as_string: '2018-09-20T03:49:03.705Z',
        },
        time: 1537415343705,
        percent: 25,
      },
      {
        key: '192.168.47.136',
        doc_count: 2,
        max_time: {
          value: 1538106903705,
          value_as_string: '2018-09-28T03:55:03.705Z',
        },
        time: 1538106903705,
        percent: 25,
      },
      {
        key: '192.168.47.133',
        doc_count: 3,
        max_time: {
          value: 1537588503705,
          value_as_string: '2018-09-22T03:55:03.705Z',
        },
        time: 1537588503705,
        percent: 37.5,
      },
    ],
  };
  return res.json(result);
}
function getDnsDynamicDomainList(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        key: '192.168.8.100',
        time: 1539952670481,
        rrname: 'www.baidu.com',
        domainIp: ['220.181.111.188', '220.181.112.244', 'www.a.shifen.com'],
        asset: 'test',
        doc_count: 1,
      },
    ],
  };
  return res.json(result);
}
export default {
  'POST /api/dashboard/getDnsTypeAnalyze': getDnsTypeAnalyze,
  'POST /api/dashboard/getDnsErrorAnalyze': getDnsErrorAnalyze,
  'POST /api/dashboard/getDnsServerList': getDnsServerList,
  'POST /api/dashboard/getWhiteList': getWhiteList,
  'POST /api/dashboard/getDnsDynamicDomainList': getDnsDynamicDomainList,
};
