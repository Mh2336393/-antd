/*
 * @Author: finazhang 
 * @Date: 2018-10-17 09:22:15 
 * 仪表盘--安全总览部分
 */

function getEventWithScoreOrder(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: {
      total: 27,
      max_score: null,
      hits: [
        {
          _index: 'event-unhandled',
          _type: 'doc',
          _id: 'AAAAAFvF2yMc5etAAAAIdg==',
          _score: null,
          _source: {
            timestamp: 1539160252577,
            tsOldest: 1539160252577,
            tsLatest: 1539160252577,
            name: '疑似 ETERNALBLUE MS17-010 堆喷',
            category_1: '入侵感知',
            category_2: '漏洞攻击',
            attackStage: '横向渗透',
            score: 48,
            status: 'unhandled',
            protocol: 'TCP',
            src: [
              {
                ip: '192.168.1.100',
                port: 52394,
                ipCountry: '局域网',
              },
            ],
            dst: [
              {
                ip: '192.168.1.102',
                port: 445,
                ipCountry: '局域网',
              },
            ],
            assetTypes: [],
            assetGroups: [],
            originalIds: ['AAAAAFvF2yMc5etAAAAIag=='],
            probeName: '6c92bf676214',
            affectedAssets: [
              {
                ip: '192.168.1.100',
                ipMac: '192.168.1.100-08:00:27:c8:30:4d',
              },
            ],
            attackerIps: ['192.168.1.102'],
            victimIps: ['192.168.1.100'],
            signatureId: 14391,
          },
          sort: [48],
        },
        {
          _index: 'event-unhandled',
          _type: 'doc',
          _id: 'AAAAAFvF2ykc5etAAAAR3g==',
          _score: null,
          _source: {
            timestamp: 1539160252598,
            tsOldest: 1539160252598,
            tsLatest: 1539160252598,
            name: '疑似 ETERNALBLUE MS17-010 堆喷',
            category_1: '入侵感知',
            category_2: '漏洞攻击',
            attackStage: '横向渗透',
            score: 48,
            status: 'unhandled',
            protocol: 'TCP',
            src: [
              {
                ip: '192.168.1.100',
                port: 53742,
                ipCountry: '局域网',
              },
            ],
            dst: [
              {
                ip: '192.168.1.102',
                port: 445,
                ipCountry: '局域网',
              },
            ],
            assetTypes: [],
            assetGroups: [],
            originalIds: ['AAAAAFvF2ykc5etAAAARqw=='],
            probeName: '6c92bf676214',
            affectedAssets: [
              {
                ip: '192.168.1.100',
                ipMac: '192.168.1.100-08:00:27:c8:30:4d',
              },
            ],
            attackerIps: ['192.168.1.102'],
            victimIps: ['192.168.1.100'],
            signatureId: 14391,
          },
          sort: [48],
        },
        {
          _index: 'event-unhandled',
          _type: 'doc',
          _id: 'AAAAAFvF2ysc5etAAAAVhA==',
          _score: null,
          _source: {
            timestamp: 1539160252634,
            tsOldest: 1539160252634,
            tsLatest: 1539160252634,
            name: '疑似 ETERNALBLUE MS17-010 堆喷',
            category_1: '入侵感知',
            category_2: '漏洞攻击',
            attackStage: '横向渗透',
            score: 48,
            status: 'unhandled',
            protocol: 'TCP',
            src: [
              {
                ip: '192.168.1.100',
                port: 55795,
                ipCountry: '局域网',
              },
            ],
            dst: [
              {
                ip: '192.168.1.102',
                port: 445,
                ipCountry: '局域网',
              },
            ],
            assetTypes: [],
            assetGroups: [],
            originalIds: ['AAAAAFvF2ysc5etAAAAVXQ=='],
            probeName: '6c92bf676214',
            affectedAssets: [
              {
                ip: '192.168.1.100',
                ipMac: '192.168.1.100-08:00:27:c8:30:4d',
              },
            ],
            attackerIps: ['192.168.1.102'],
            victimIps: ['192.168.1.100'],
            signatureId: 14391,
          },
          sort: [48],
        },
        {
          _index: 'event-unhandled',
          _type: 'doc',
          _id: 'AAAAAFvF2ysc5etAAAAVqQ==',
          _score: null,
          _source: {
            timestamp: 1539160252617,
            tsOldest: 1539160252617,
            tsLatest: 1539160252617,
            name: '疑似 ETERNALBLUE MS17-010 Echo Response',
            category_1: '入侵感知',
            category_2: '漏洞攻击',
            attackStage: '横向渗透',
            score: 48,
            status: 'unhandled',
            protocol: 'TCP',
            src: [
              {
                ip: '192.168.1.102',
                port: 445,
                ipCountry: '局域网',
              },
            ],
            dst: [
              {
                ip: '192.168.1.100',
                port: 54916,
                ipCountry: '局域网',
              },
            ],
            assetTypes: [],
            assetGroups: [],
            originalIds: ['AAAAAFvF2ysc5etAAAAVkQ=='],
            probeName: '6c92bf676214',
            affectedAssets: [
              {
                ip: '192.168.1.100',
                ipMac: '192.168.1.100-08:00:27:c8:30:4d',
              },
            ],
            attackerIps: ['192.168.1.102'],
            victimIps: ['192.168.1.100'],
            signatureId: 14392,
          },
          sort: [48],
        },
        {
          _index: 'event-unhandled',
          _type: 'doc',
          _id: 'AAAAAFvF200c5etAAABQEw==',
          _score: null,
          _source: {
            timestamp: 1539160481785,
            tsOldest: 1539160481785,
            tsLatest: 1539160481785,
            name: '疑似 ETERNALBLUE MS17-010 Echo Response',
            category_1: '入侵感知',
            category_2: '漏洞攻击',
            attackStage: '横向渗透',
            score: 48,
            status: 'unhandled',
            protocol: 'TCP',
            src: [
              {
                ip: '192.168.1.102',
                port: 445,
                ipCountry: '局域网',
              },
            ],
            dst: [
              {
                ip: '192.168.1.100',
                port: 54916,
                ipCountry: '局域网',
              },
            ],
            assetTypes: [],
            assetGroups: [],
            originalIds: ['AAAAAFvF200c5etAAABQDQ=='],
            probeName: '6c92bf676214',
            affectedAssets: [
              {
                ip: '192.168.1.100',
                ipMac: '192.168.1.100-08:00:27:c8:30:4d',
              },
            ],
            attackerIps: ['192.168.1.102'],
            victimIps: ['192.168.1.100'],
            signatureId: 14392,
          },
          sort: [48],
        },
      ],
    },
  };
  return res.json(result);
}
function getEventDistribution(req, res) {
  const result = {
    error_code: 0,
    msg: 'ok',
    data: {
      attackStage: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: '外部侦查',
            doc_count: 70003,
            eventNums: {
              buckets: [
                { key_as_string: '1537632000000', key: 1537632000000, doc_count: 3 },
                { key_as_string: '1538280000000', key: 1538280000000, doc_count: 70000 },
              ],
            },
          },
          {
            key: '恶意文件投递',
            doc_count: 3333,
            eventNums: {
              buckets: [
                { key_as_string: '1538107200000', key: 1538107200000, doc_count: 1000 },
                { key_as_string: '1538280000000', key: 1538280000000, doc_count: 2000 },
              ],
            },
          },
          {
            key: '网络入侵',
            doc_count: 20,
            eventNums: {
              buckets: [
                { key_as_string: '1538107200000', key: 1538107200000, doc_count: 12 },
                { key_as_string: '1538280000000', key: 1538280000000, doc_count: 8 },
              ],
            },
          },
          {
            key: '横向渗透',
            doc_count: 2,
            eventNums: {
              buckets: [
                { key_as_string: '1538107200000', key: 1538107200000, doc_count: 1 },
                { key_as_string: '1538280000000', key: 1538280000000, doc_count: 1 },
              ],
            },
          },
        ],
      },
    },
  };
  return res.json(result);
}
function getEventWithAssetOrder(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: {
      event: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: '10.16.250.57-74:ea:cb:75:3f:9f',
            doc_count: 3,
            score: {
              value: 75,
            },
            assetName: {
              doc_count_error_upper_bound: 0,
              sum_other_doc_count: 0,
              buckets: [],
            },
          },
          {
            key: '192.168.1.100-08:00:27:c8:30:4d',
            doc_count: 22417,
            score: {
              value: 36,
            },
            assetName: {
              doc_count_error_upper_bound: 0,
              sum_other_doc_count: 0,
              buckets: [],
            },
          },
          {
            key: '192.168.1.102-08:00:27:94:3d:79',
            doc_count: 22417,
            score: {
              value: 36,
            },
            assetName: {
              doc_count_error_upper_bound: 0,
              sum_other_doc_count: 0,
              buckets: [],
            },
          },
          {
            key: '192.168.1.141-a0:d3:c1:2f:6b:b4',
            doc_count: 3580,
            score: {
              value: 36,
            },
            assetName: {
              doc_count_error_upper_bound: 0,
              sum_other_doc_count: 0,
              buckets: [],
            },
          },
        ],
      },
    },
  };

  return res.json(result);
}
function realTimeOverall(req, res) {
  const result = { "error_code": 0, "msg": "succ", "data": { "asset": { "todayNum": 2, "diff": -83, "thirtyAvg": 43 }, "event": { "todayNum": 6, "diff": -90, "thirtyAvg": 3 }, "log": { "todayNum": 2141340, "thirtyAvg": 4889489, "trend": [{ "key_as_string": "2018-12-25T01:00:00.000Z", "key": 1545699600000, "doc_count": 155232 }, { "key_as_string": "2018-12-25T02:00:00.000Z", "key": 1545703200000, "doc_count": 258284 }, { "key_as_string": "2018-12-25T03:00:00.000Z", "key": 1545706800000, "doc_count": 4686 }, { "key_as_string": "2018-12-25T04:00:00.000Z", "key": 1545710400000, "doc_count": 0 }, { "key_as_string": "2018-12-25T05:00:00.000Z", "key": 1545714000000, "doc_count": 36471 }, { "key_as_string": "2018-12-25T06:00:00.000Z", "key": 1545717600000, "doc_count": 245207 }, { "key_as_string": "2018-12-25T07:00:00.000Z", "key": 1545721200000, "doc_count": 428249 }, { "key_as_string": "2018-12-25T08:00:00.000Z", "key": 1545724800000, "doc_count": 343143 }, { "key_as_string": "2018-12-25T09:00:00.000Z", "key": 1545728400000, "doc_count": 169473 }, { "key_as_string": "2018-12-25T10:00:00.000Z", "key": 1545732000000, "doc_count": 246654 }, { "key_as_string": "2018-12-25T11:00:00.000Z", "key": 1545735600000, "doc_count": 253938 }, { "key_as_string": "2018-12-25T12:00:00.000Z", "key": 1545739200000, "doc_count": 3 }] }, "file": { "todayNum": 4, "thirtyAvg": 13, "trend": [{ "key_as_string": "2018-12-25T02:00:00.000Z", "key": 1545703200000, "doc_count": 3 }, { "key_as_string": "2018-12-25T03:00:00.000Z", "key": 1545706800000, "doc_count": 0 }, { "key_as_string": "2018-12-25T04:00:00.000Z", "key": 1545710400000, "doc_count": 0 }, { "key_as_string": "2018-12-25T05:00:00.000Z", "key": 1545714000000, "doc_count": 0 }, { "key_as_string": "2018-12-25T06:00:00.000Z", "key": 1545717600000, "doc_count": 0 }, { "key_as_string": "2018-12-25T07:00:00.000Z", "key": 1545721200000, "doc_count": 1 }] } } };
  return res.json(result);
}
function getEventIocTop(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [],
  };
  return res.json(result);
}
function getEventCategory2Num(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        key: 'dos攻击',
        doc_count: 216,
      },
      {
        key: '漏洞攻击',
        doc_count: 57,
      },
      {
        key: '网络扫描',
        doc_count: 5,
      },
    ],
  };
  return res.json(result);
}
function getEventTrend(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        key_as_string: '1539160200000',
        key: 1539160200000,
        doc_count: 20,
      },
      {
        key_as_string: '1539162000000',
        key: 1539162000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539163800000',
        key: 1539163800000,
        doc_count: 10,
      },
      {
        key_as_string: '1539165600000',
        key: 1539165600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539167400000',
        key: 1539167400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539169200000',
        key: 1539169200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539171000000',
        key: 1539171000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539172800000',
        key: 1539172800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539174600000',
        key: 1539174600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539176400000',
        key: 1539176400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539178200000',
        key: 1539178200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539180000000',
        key: 1539180000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539181800000',
        key: 1539181800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539183600000',
        key: 1539183600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539185400000',
        key: 1539185400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539187200000',
        key: 1539187200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539189000000',
        key: 1539189000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539190800000',
        key: 1539190800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539192600000',
        key: 1539192600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539194400000',
        key: 1539194400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539196200000',
        key: 1539196200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539198000000',
        key: 1539198000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539199800000',
        key: 1539199800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539201600000',
        key: 1539201600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539203400000',
        key: 1539203400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539205200000',
        key: 1539205200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539207000000',
        key: 1539207000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539208800000',
        key: 1539208800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539210600000',
        key: 1539210600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539212400000',
        key: 1539212400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539214200000',
        key: 1539214200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539216000000',
        key: 1539216000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539217800000',
        key: 1539217800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539219600000',
        key: 1539219600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539221400000',
        key: 1539221400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539223200000',
        key: 1539223200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539225000000',
        key: 1539225000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539226800000',
        key: 1539226800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539228600000',
        key: 1539228600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539230400000',
        key: 1539230400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539232200000',
        key: 1539232200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539234000000',
        key: 1539234000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539235800000',
        key: 1539235800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539237600000',
        key: 1539237600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539239400000',
        key: 1539239400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539241200000',
        key: 1539241200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539243000000',
        key: 1539243000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539244800000',
        key: 1539244800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539246600000',
        key: 1539246600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539248400000',
        key: 1539248400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539250200000',
        key: 1539250200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539252000000',
        key: 1539252000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539253800000',
        key: 1539253800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539255600000',
        key: 1539255600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539257400000',
        key: 1539257400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539259200000',
        key: 1539259200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539261000000',
        key: 1539261000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539262800000',
        key: 1539262800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539264600000',
        key: 1539264600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539266400000',
        key: 1539266400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539268200000',
        key: 1539268200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539270000000',
        key: 1539270000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539271800000',
        key: 1539271800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539273600000',
        key: 1539273600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539275400000',
        key: 1539275400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539277200000',
        key: 1539277200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539279000000',
        key: 1539279000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539280800000',
        key: 1539280800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539282600000',
        key: 1539282600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539284400000',
        key: 1539284400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539286200000',
        key: 1539286200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539288000000',
        key: 1539288000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539289800000',
        key: 1539289800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539291600000',
        key: 1539291600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539293400000',
        key: 1539293400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539295200000',
        key: 1539295200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539297000000',
        key: 1539297000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539298800000',
        key: 1539298800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539300600000',
        key: 1539300600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539302400000',
        key: 1539302400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539304200000',
        key: 1539304200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539306000000',
        key: 1539306000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539307800000',
        key: 1539307800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539309600000',
        key: 1539309600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539311400000',
        key: 1539311400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539313200000',
        key: 1539313200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539315000000',
        key: 1539315000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539316800000',
        key: 1539316800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539318600000',
        key: 1539318600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539320400000',
        key: 1539320400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539322200000',
        key: 1539322200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539324000000',
        key: 1539324000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539325800000',
        key: 1539325800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539327600000',
        key: 1539327600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539329400000',
        key: 1539329400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539331200000',
        key: 1539331200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539333000000',
        key: 1539333000000,
        doc_count: 1,
      },
      {
        key_as_string: '1539334800000',
        key: 1539334800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539336600000',
        key: 1539336600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539338400000',
        key: 1539338400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539340200000',
        key: 1539340200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539342000000',
        key: 1539342000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539343800000',
        key: 1539343800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539345600000',
        key: 1539345600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539347400000',
        key: 1539347400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539349200000',
        key: 1539349200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539351000000',
        key: 1539351000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539352800000',
        key: 1539352800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539354600000',
        key: 1539354600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539356400000',
        key: 1539356400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539358200000',
        key: 1539358200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539360000000',
        key: 1539360000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539361800000',
        key: 1539361800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539363600000',
        key: 1539363600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539365400000',
        key: 1539365400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539367200000',
        key: 1539367200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539369000000',
        key: 1539369000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539370800000',
        key: 1539370800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539372600000',
        key: 1539372600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539374400000',
        key: 1539374400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539376200000',
        key: 1539376200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539378000000',
        key: 1539378000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539379800000',
        key: 1539379800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539381600000',
        key: 1539381600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539383400000',
        key: 1539383400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539385200000',
        key: 1539385200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539387000000',
        key: 1539387000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539388800000',
        key: 1539388800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539390600000',
        key: 1539390600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539392400000',
        key: 1539392400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539394200000',
        key: 1539394200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539396000000',
        key: 1539396000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539397800000',
        key: 1539397800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539399600000',
        key: 1539399600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539401400000',
        key: 1539401400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539403200000',
        key: 1539403200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539405000000',
        key: 1539405000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539406800000',
        key: 1539406800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539408600000',
        key: 1539408600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539410400000',
        key: 1539410400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539412200000',
        key: 1539412200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539414000000',
        key: 1539414000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539415800000',
        key: 1539415800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539417600000',
        key: 1539417600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539419400000',
        key: 1539419400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539421200000',
        key: 1539421200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539423000000',
        key: 1539423000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539424800000',
        key: 1539424800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539426600000',
        key: 1539426600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539428400000',
        key: 1539428400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539430200000',
        key: 1539430200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539432000000',
        key: 1539432000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539433800000',
        key: 1539433800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539435600000',
        key: 1539435600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539437400000',
        key: 1539437400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539439200000',
        key: 1539439200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539441000000',
        key: 1539441000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539442800000',
        key: 1539442800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539444600000',
        key: 1539444600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539446400000',
        key: 1539446400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539448200000',
        key: 1539448200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539450000000',
        key: 1539450000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539451800000',
        key: 1539451800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539453600000',
        key: 1539453600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539455400000',
        key: 1539455400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539457200000',
        key: 1539457200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539459000000',
        key: 1539459000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539460800000',
        key: 1539460800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539462600000',
        key: 1539462600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539464400000',
        key: 1539464400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539466200000',
        key: 1539466200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539468000000',
        key: 1539468000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539469800000',
        key: 1539469800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539471600000',
        key: 1539471600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539473400000',
        key: 1539473400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539475200000',
        key: 1539475200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539477000000',
        key: 1539477000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539478800000',
        key: 1539478800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539480600000',
        key: 1539480600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539482400000',
        key: 1539482400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539484200000',
        key: 1539484200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539486000000',
        key: 1539486000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539487800000',
        key: 1539487800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539489600000',
        key: 1539489600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539491400000',
        key: 1539491400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539493200000',
        key: 1539493200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539495000000',
        key: 1539495000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539496800000',
        key: 1539496800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539498600000',
        key: 1539498600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539500400000',
        key: 1539500400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539502200000',
        key: 1539502200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539504000000',
        key: 1539504000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539505800000',
        key: 1539505800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539507600000',
        key: 1539507600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539509400000',
        key: 1539509400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539511200000',
        key: 1539511200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539513000000',
        key: 1539513000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539514800000',
        key: 1539514800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539516600000',
        key: 1539516600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539518400000',
        key: 1539518400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539520200000',
        key: 1539520200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539522000000',
        key: 1539522000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539523800000',
        key: 1539523800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539525600000',
        key: 1539525600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539527400000',
        key: 1539527400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539529200000',
        key: 1539529200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539531000000',
        key: 1539531000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539532800000',
        key: 1539532800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539534600000',
        key: 1539534600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539536400000',
        key: 1539536400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539538200000',
        key: 1539538200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539540000000',
        key: 1539540000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539541800000',
        key: 1539541800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539543600000',
        key: 1539543600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539545400000',
        key: 1539545400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539547200000',
        key: 1539547200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539549000000',
        key: 1539549000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539550800000',
        key: 1539550800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539552600000',
        key: 1539552600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539554400000',
        key: 1539554400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539556200000',
        key: 1539556200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539558000000',
        key: 1539558000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539559800000',
        key: 1539559800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539561600000',
        key: 1539561600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539563400000',
        key: 1539563400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539565200000',
        key: 1539565200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539567000000',
        key: 1539567000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539568800000',
        key: 1539568800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539570600000',
        key: 1539570600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539572400000',
        key: 1539572400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539574200000',
        key: 1539574200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539576000000',
        key: 1539576000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539577800000',
        key: 1539577800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539579600000',
        key: 1539579600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539581400000',
        key: 1539581400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539583200000',
        key: 1539583200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539585000000',
        key: 1539585000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539586800000',
        key: 1539586800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539588600000',
        key: 1539588600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539590400000',
        key: 1539590400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539592200000',
        key: 1539592200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539594000000',
        key: 1539594000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539595800000',
        key: 1539595800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539597600000',
        key: 1539597600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539599400000',
        key: 1539599400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539601200000',
        key: 1539601200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539603000000',
        key: 1539603000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539604800000',
        key: 1539604800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539606600000',
        key: 1539606600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539608400000',
        key: 1539608400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539610200000',
        key: 1539610200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539612000000',
        key: 1539612000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539613800000',
        key: 1539613800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539615600000',
        key: 1539615600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539617400000',
        key: 1539617400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539619200000',
        key: 1539619200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539621000000',
        key: 1539621000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539622800000',
        key: 1539622800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539624600000',
        key: 1539624600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539626400000',
        key: 1539626400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539628200000',
        key: 1539628200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539630000000',
        key: 1539630000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539631800000',
        key: 1539631800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539633600000',
        key: 1539633600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539635400000',
        key: 1539635400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539637200000',
        key: 1539637200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539639000000',
        key: 1539639000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539640800000',
        key: 1539640800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539642600000',
        key: 1539642600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539644400000',
        key: 1539644400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539646200000',
        key: 1539646200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539648000000',
        key: 1539648000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539649800000',
        key: 1539649800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539651600000',
        key: 1539651600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539653400000',
        key: 1539653400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539655200000',
        key: 1539655200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539657000000',
        key: 1539657000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539658800000',
        key: 1539658800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539660600000',
        key: 1539660600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539662400000',
        key: 1539662400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539664200000',
        key: 1539664200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539666000000',
        key: 1539666000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539667800000',
        key: 1539667800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539669600000',
        key: 1539669600000,
        doc_count: 0,
      },
      {
        key_as_string: '1539671400000',
        key: 1539671400000,
        doc_count: 0,
      },
      {
        key_as_string: '1539673200000',
        key: 1539673200000,
        doc_count: 0,
      },
      {
        key_as_string: '1539675000000',
        key: 1539675000000,
        doc_count: 0,
      },
      {
        key_as_string: '1539676800000',
        key: 1539676800000,
        doc_count: 0,
      },
      {
        key_as_string: '1539678600000',
        key: 1539678600000,
        doc_count: 0,
      },
    ],
  };
  return res.json(result);
}
function getSandboxFileType(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: {
      list: {
        category: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: 'Windows可执行文件',
              doc_count: 3,
            },
          ],
        },
      },
    },
  };
  return res.json(result);
}
export default {
  'POST /api/dashboard/realTimeOverall': realTimeOverall,
  'POST /api/dashboard/getEventDistribution': getEventDistribution,
  'POST /api/dashboard/getEventWithScoreOrder': getEventWithScoreOrder,
  'POST /api/dashboard/getEventWithAssetOrder': getEventWithAssetOrder,
  'POST /api/dashboard/getEventIocTop': getEventIocTop,
  'POST /api/dashboard/getEventCategory2Num': getEventCategory2Num,
  'POST /api/dashboard/getEventTrend': getEventTrend,
  'POST /api/dashboard/getSandboxFileType': getSandboxFileType,
};
