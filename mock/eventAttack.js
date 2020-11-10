// import mockjs from 'mockjs';
// import common from './common';

function getAffectedAssets(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        ip: '10.11.45.1',
        assetName: 'PC-001',
      },
      {
        ip: '10.18.45.1',
        assetName: 'PC-002',
      },
    ],
  };
  return res.json(result);
}
function getAttackChains(req, res) {
  // const { body } = req;
  const result = {
    error_code: 0,
    msg: 'succ',
    data: {
      hits: [
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZijBCbkZp4ndsOJHkj',
          _score: null,
          _source: {
            tsOldest: 1538753422000,
            tsLatest: 1538753422000,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '人工注入',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.10.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1538753422000],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZg8PAIkZp4ndsOJHkf',
          _score: null,
          _source: {
            tsOldest: 1538753422000,
            tsLatest: 1538753422000,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '病毒入侵',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1538753422000],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePRxRkZp4ndsOJHkQ',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '入侵感知',
            category_2: '安装利用',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePYkhkZp4ndsOJHkR',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '入侵感知',
            category_2: '网络入侵',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePrjNkZp4ndsOJHkV',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '网络入侵',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZeP0ZKkZp4ndsOJHkW',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '网络入侵',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.2'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-unhandled',
          _type: 'doc',
          _id: 'AWZeOBe7kZp4ndsOJHkM',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '入侵感知',
            category_2: '内部侦查',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePb_wkZp4ndsOJHkS',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '入侵感知',
            category_2: '外部侦查',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePi9NkZp4ndsOJHkU',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '外部侦查',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePfCukZp4ndsOJHkT',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '失陷感知',
            category_2: '外部侦查',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
      ],
      total: 12,
      aggs: [
        {
          date: '2018-05-01',
          count: 0,
          month: 4,
          day: 2,
          week: 0,
        },
        {
          date: '2018-05-02',
          count: 0,
          month: 4,
          day: 3,
          week: 0,
        },
        {
          date: '2018-05-03',
          count: 0,
          month: 4,
          day: 4,
          week: 0,
        },
        {
          date: '2018-05-04',
          count: 0,
          month: 4,
          day: 5,
          week: 0,
        },
        {
          date: '2018-05-05',
          count: 0,
          month: 4,
          day: 6,
          week: 0,
        },
        {
          date: '2018-05-06',
          count: 0,
          month: 4,
          day: 0,
          week: 1,
        },
        {
          date: '2018-05-07',
          count: 0,
          month: 4,
          day: 1,
          week: 1,
        },
        {
          date: '2018-05-08',
          count: 0,
          month: 4,
          day: 2,
          week: 1,
        },
        {
          date: '2018-05-09',
          count: 0,
          month: 4,
          day: 3,
          week: 1,
        },
        {
          date: '2018-05-10',
          count: 0,
          month: 4,
          day: 4,
          week: 1,
        },
        {
          date: '2018-05-11',
          count: 0,
          month: 4,
          day: 5,
          week: 1,
        },
        {
          date: '2018-05-12',
          count: 0,
          month: 4,
          day: 6,
          week: 1,
        },
        {
          date: '2018-05-13',
          count: 0,
          month: 4,
          day: 0,
          week: 2,
        },
        {
          date: '2018-05-14',
          count: 0,
          month: 4,
          day: 1,
          week: 2,
        },
        {
          date: '2018-05-15',
          count: 0,
          month: 4,
          day: 2,
          week: 2,
        },
        {
          date: '2018-05-16',
          count: 0,
          month: 4,
          day: 3,
          week: 2,
        },
        {
          date: '2018-05-17',
          count: 0,
          month: 4,
          day: 4,
          week: 2,
        },
        {
          date: '2018-05-18',
          count: 0,
          month: 4,
          day: 5,
          week: 2,
        },
        {
          date: '2018-05-19',
          count: 0,
          month: 4,
          day: 6,
          week: 2,
        },
        {
          date: '2018-05-20',
          count: 0,
          month: 4,
          day: 0,
          week: 3,
        },
        {
          date: '2018-05-21',
          count: 0,
          month: 4,
          day: 1,
          week: 3,
        },
        {
          date: '2018-05-22',
          count: 0,
          month: 4,
          day: 2,
          week: 3,
        },
        {
          date: '2018-05-23',
          count: 0,
          month: 4,
          day: 3,
          week: 3,
        },
        {
          date: '2018-05-24',
          count: 0,
          month: 4,
          day: 4,
          week: 3,
        },
        {
          date: '2018-05-25',
          count: 0,
          month: 4,
          day: 5,
          lastWeek: true,
          week: 3,
        },
        {
          date: '2018-05-26',
          count: 0,
          month: 4,
          day: 6,
          lastWeek: true,
          week: 3,
        },
        {
          date: '2018-05-27',
          count: 0,
          month: 4,
          day: 0,
          lastWeek: true,
          week: 4,
        },
        {
          date: '2018-05-28',
          count: 0,
          month: 4,
          day: 1,
          lastWeek: true,
          week: 4,
        },
        {
          date: '2018-05-29',
          count: 0,
          month: 4,
          day: 2,
          lastWeek: true,
          week: 4,
        },
        {
          date: '2018-05-30',
          count: 0,
          month: 4,
          day: 3,
          lastWeek: true,
          week: 4,
        },
        {
          date: '2018-05-31',
          count: 0,
          month: 4,
          day: 4,
          lastWeek: true,
          lastDay: true,
          week: 4,
        },
        {
          date: '2018-06-01',
          count: 0,
          month: 5,
          day: 5,
          week: 4,
        },
        {
          date: '2018-06-02',
          count: 0,
          month: 5,
          day: 6,
          week: 4,
        },
        {
          date: '2018-06-03',
          count: 0,
          month: 5,
          day: 0,
          week: 5,
        },
        {
          date: '2018-06-04',
          count: 0,
          month: 5,
          day: 1,
          week: 5,
        },
        {
          date: '2018-06-05',
          count: 0,
          month: 5,
          day: 2,
          week: 5,
        },
        {
          date: '2018-06-06',
          count: 0,
          month: 5,
          day: 3,
          week: 5,
        },
        {
          date: '2018-06-07',
          count: 0,
          month: 5,
          day: 4,
          week: 5,
        },
        {
          date: '2018-06-08',
          count: 0,
          month: 5,
          day: 5,
          week: 5,
        },
        {
          date: '2018-06-09',
          count: 0,
          month: 5,
          day: 6,
          week: 5,
        },
        {
          date: '2018-06-10',
          count: 1,
          month: 5,
          day: 0,
          week: 6,
        },
        {
          date: '2018-06-11',
          count: 0,
          month: 5,
          day: 1,
          week: 6,
        },
        {
          date: '2018-06-12',
          count: 0,
          month: 5,
          day: 2,
          week: 6,
        },
        {
          date: '2018-06-13',
          count: 0,
          month: 5,
          day: 3,
          week: 6,
        },
        {
          date: '2018-06-14',
          count: 0,
          month: 5,
          day: 4,
          week: 6,
        },
        {
          date: '2018-06-15',
          count: 0,
          month: 5,
          day: 5,
          week: 6,
        },
        {
          date: '2018-06-16',
          count: 0,
          month: 5,
          day: 6,
          week: 6,
        },
        {
          date: '2018-06-17',
          count: 0,
          month: 5,
          day: 0,
          week: 7,
        },
        {
          date: '2018-06-18',
          count: 0,
          month: 5,
          day: 1,
          week: 7,
        },
        {
          date: '2018-06-19',
          count: 0,
          month: 5,
          day: 2,
          week: 7,
        },
        {
          date: '2018-06-20',
          count: 0,
          month: 5,
          day: 3,
          week: 7,
        },
        {
          date: '2018-06-21',
          count: 0,
          month: 5,
          day: 4,
          week: 7,
        },
        {
          date: '2018-06-22',
          count: 0,
          month: 5,
          day: 5,
          week: 7,
        },
        {
          date: '2018-06-23',
          count: 0,
          month: 5,
          day: 6,
          week: 7,
        },
        {
          date: '2018-06-24',
          count: 0,
          month: 5,
          day: 0,
          lastWeek: true,
          week: 8,
        },
        {
          date: '2018-06-25',
          count: 0,
          month: 5,
          day: 1,
          lastWeek: true,
          week: 8,
        },
        {
          date: '2018-06-26',
          count: 0,
          month: 5,
          day: 2,
          lastWeek: true,
          week: 8,
        },
        {
          date: '2018-06-27',
          count: 0,
          month: 5,
          day: 3,
          lastWeek: true,
          week: 8,
        },
        {
          date: '2018-06-28',
          count: 0,
          month: 5,
          day: 4,
          lastWeek: true,
          week: 8,
        },
        {
          date: '2018-06-29',
          count: 0,
          month: 5,
          day: 5,
          lastWeek: true,
          week: 8,
        },
        {
          date: '2018-06-30',
          count: 0,
          month: 5,
          day: 6,
          lastWeek: true,
          lastDay: true,
          week: 8,
        },
        {
          date: '2018-07-01',
          count: 0,
          month: 6,
          day: 0,
          week: 9,
        },
        {
          date: '2018-07-02',
          count: 0,
          month: 6,
          day: 1,
          week: 9,
        },
        {
          date: '2018-07-03',
          count: 0,
          month: 6,
          day: 2,
          week: 9,
        },
        {
          date: '2018-07-04',
          count: 0,
          month: 6,
          day: 3,
          week: 9,
        },
        {
          date: '2018-07-05',
          count: 0,
          month: 6,
          day: 4,
          week: 9,
        },
        {
          date: '2018-07-06',
          count: 0,
          month: 6,
          day: 5,
          week: 9,
        },
        {
          date: '2018-07-07',
          count: 0,
          month: 6,
          day: 6,
          week: 9,
        },
        {
          date: '2018-07-08',
          count: 0,
          month: 6,
          day: 0,
          week: 10,
        },
        {
          date: '2018-07-09',
          count: 0,
          month: 6,
          day: 1,
          week: 10,
        },
        {
          date: '2018-07-10',
          count: 9,
          month: 6,
          day: 2,
          week: 10,
        },
        {
          date: '2018-07-11',
          count: 0,
          month: 6,
          day: 3,
          week: 10,
        },
        {
          date: '2018-07-12',
          count: 0,
          month: 6,
          day: 4,
          week: 10,
        },
        {
          date: '2018-07-13',
          count: 0,
          month: 6,
          day: 5,
          week: 10,
        },
        {
          date: '2018-07-14',
          count: 0,
          month: 6,
          day: 6,
          week: 10,
        },
        {
          date: '2018-07-15',
          count: 0,
          month: 6,
          day: 0,
          week: 11,
        },
        {
          date: '2018-07-16',
          count: 0,
          month: 6,
          day: 1,
          week: 11,
        },
        {
          date: '2018-07-17',
          count: 0,
          month: 6,
          day: 2,
          week: 11,
        },
        {
          date: '2018-07-18',
          count: 0,
          month: 6,
          day: 3,
          week: 11,
        },
        {
          date: '2018-07-19',
          count: 0,
          month: 6,
          day: 4,
          week: 11,
        },
        {
          date: '2018-07-20',
          count: 0,
          month: 6,
          day: 5,
          week: 11,
        },
        {
          date: '2018-07-21',
          count: 0,
          month: 6,
          day: 6,
          week: 11,
        },
        {
          date: '2018-07-22',
          count: 0,
          month: 6,
          day: 0,
          week: 12,
        },
        {
          date: '2018-07-23',
          count: 0,
          month: 6,
          day: 1,
          week: 12,
        },
        {
          date: '2018-07-24',
          count: 0,
          month: 6,
          day: 2,
          week: 12,
        },
        {
          date: '2018-07-25',
          count: 0,
          month: 6,
          day: 3,
          lastWeek: true,
          week: 12,
        },
        {
          date: '2018-07-26',
          count: 0,
          month: 6,
          day: 4,
          lastWeek: true,
          week: 12,
        },
        {
          date: '2018-07-27',
          count: 0,
          month: 6,
          day: 5,
          lastWeek: true,
          week: 12,
        },
        {
          date: '2018-07-28',
          count: 0,
          month: 6,
          day: 6,
          lastWeek: true,
          week: 12,
        },
        {
          date: '2018-07-29',
          count: 0,
          month: 6,
          day: 0,
          lastWeek: true,
          week: 13,
        },
        {
          date: '2018-07-30',
          count: 0,
          month: 6,
          day: 1,
          lastWeek: true,
          week: 13,
        },
        {
          date: '2018-07-31',
          count: 0,
          month: 6,
          day: 2,
          lastWeek: true,
          lastDay: true,
          week: 13,
        },
        {
          date: '2018-08-01',
          count: 0,
          month: 7,
          day: 3,
          week: 13,
        },
        {
          date: '2018-08-02',
          count: 0,
          month: 7,
          day: 4,
          week: 13,
        },
        {
          date: '2018-08-03',
          count: 0,
          month: 7,
          day: 5,
          week: 13,
        },
        {
          date: '2018-08-04',
          count: 0,
          month: 7,
          day: 6,
          week: 13,
        },
        {
          date: '2018-08-05',
          count: 0,
          month: 7,
          day: 0,
          week: 14,
        },
        {
          date: '2018-08-06',
          count: 0,
          month: 7,
          day: 1,
          week: 14,
        },
        {
          date: '2018-08-07',
          count: 0,
          month: 7,
          day: 2,
          week: 14,
        },
        {
          date: '2018-08-08',
          count: 0,
          month: 7,
          day: 3,
          week: 14,
        },
        {
          date: '2018-08-09',
          count: 0,
          month: 7,
          day: 4,
          week: 14,
        },
        {
          date: '2018-08-10',
          count: 0,
          month: 7,
          day: 5,
          week: 14,
        },
        {
          date: '2018-08-11',
          count: 0,
          month: 7,
          day: 6,
          week: 14,
        },
        {
          date: '2018-08-12',
          count: 0,
          month: 7,
          day: 0,
          week: 15,
        },
        {
          date: '2018-08-13',
          count: 0,
          month: 7,
          day: 1,
          week: 15,
        },
        {
          date: '2018-08-14',
          count: 0,
          month: 7,
          day: 2,
          week: 15,
        },
        {
          date: '2018-08-15',
          count: 0,
          month: 7,
          day: 3,
          week: 15,
        },
        {
          date: '2018-08-16',
          count: 0,
          month: 7,
          day: 4,
          week: 15,
        },
        {
          date: '2018-08-17',
          count: 0,
          month: 7,
          day: 5,
          week: 15,
        },
        {
          date: '2018-08-18',
          count: 0,
          month: 7,
          day: 6,
          week: 15,
        },
        {
          date: '2018-08-19',
          count: 0,
          month: 7,
          day: 0,
          week: 16,
        },
        {
          date: '2018-08-20',
          count: 0,
          month: 7,
          day: 1,
          week: 16,
        },
        {
          date: '2018-08-21',
          count: 0,
          month: 7,
          day: 2,
          week: 16,
        },
        {
          date: '2018-08-22',
          count: 0,
          month: 7,
          day: 3,
          week: 16,
        },
        {
          date: '2018-08-23',
          count: 0,
          month: 7,
          day: 4,
          week: 16,
        },
        {
          date: '2018-08-24',
          count: 0,
          month: 7,
          day: 5,
          week: 16,
        },
        {
          date: '2018-08-25',
          count: 0,
          month: 7,
          day: 6,
          lastWeek: true,
          week: 16,
        },
        {
          date: '2018-08-26',
          count: 0,
          month: 7,
          day: 0,
          lastWeek: true,
          week: 17,
        },
        {
          date: '2018-08-27',
          count: 0,
          month: 7,
          day: 1,
          lastWeek: true,
          week: 17,
        },
        {
          date: '2018-08-28',
          count: 0,
          month: 7,
          day: 2,
          lastWeek: true,
          week: 17,
        },
        {
          date: '2018-08-29',
          count: 0,
          month: 7,
          day: 3,
          lastWeek: true,
          week: 17,
        },
        {
          date: '2018-08-30',
          count: 0,
          month: 7,
          day: 4,
          lastWeek: true,
          week: 17,
        },
        {
          date: '2018-08-31',
          count: 0,
          month: 7,
          day: 5,
          lastWeek: true,
          lastDay: true,
          week: 17,
        },
        {
          date: '2018-09-01',
          count: 0,
          month: 8,
          day: 6,
          week: 17,
        },
        {
          date: '2018-09-02',
          count: 0,
          month: 8,
          day: 0,
          week: 18,
        },
        {
          date: '2018-09-03',
          count: 0,
          month: 8,
          day: 1,
          week: 18,
        },
        {
          date: '2018-09-04',
          count: 0,
          month: 8,
          day: 2,
          week: 18,
        },
        {
          date: '2018-09-05',
          count: 0,
          month: 8,
          day: 3,
          week: 18,
        },
        {
          date: '2018-09-06',
          count: 0,
          month: 8,
          day: 4,
          week: 18,
        },
        {
          date: '2018-09-07',
          count: 0,
          month: 8,
          day: 5,
          week: 18,
        },
        {
          date: '2018-09-08',
          count: 0,
          month: 8,
          day: 6,
          week: 18,
        },
        {
          date: '2018-09-09',
          count: 0,
          month: 8,
          day: 0,
          week: 19,
        },
        {
          date: '2018-09-10',
          count: 0,
          month: 8,
          day: 1,
          week: 19,
        },
        {
          date: '2018-09-11',
          count: 0,
          month: 8,
          day: 2,
          week: 19,
        },
        {
          date: '2018-09-12',
          count: 0,
          month: 8,
          day: 3,
          week: 19,
        },
        {
          date: '2018-09-13',
          count: 0,
          month: 8,
          day: 4,
          week: 19,
        },
        {
          date: '2018-09-14',
          count: 0,
          month: 8,
          day: 5,
          week: 19,
        },
        {
          date: '2018-09-15',
          count: 0,
          month: 8,
          day: 6,
          week: 19,
        },
        {
          date: '2018-09-16',
          count: 0,
          month: 8,
          day: 0,
          week: 20,
        },
        {
          date: '2018-09-17',
          count: 0,
          month: 8,
          day: 1,
          week: 20,
        },
        {
          date: '2018-09-18',
          count: 0,
          month: 8,
          day: 2,
          week: 20,
        },
        {
          date: '2018-09-19',
          count: 0,
          month: 8,
          day: 3,
          week: 20,
        },
        {
          date: '2018-09-20',
          count: 0,
          month: 8,
          day: 4,
          week: 20,
        },
        {
          date: '2018-09-21',
          count: 0,
          month: 8,
          day: 5,
          week: 20,
        },
        {
          date: '2018-09-22',
          count: 0,
          month: 8,
          day: 6,
          week: 20,
        },
        {
          date: '2018-09-23',
          count: 0,
          month: 8,
          day: 0,
          week: 21,
        },
        {
          date: '2018-09-24',
          count: 0,
          month: 8,
          day: 1,
          lastWeek: true,
          week: 21,
        },
        {
          date: '2018-09-25',
          count: 0,
          month: 8,
          day: 2,
          lastWeek: true,
          week: 21,
        },
        {
          date: '2018-09-26',
          count: 0,
          month: 8,
          day: 3,
          lastWeek: true,
          week: 21,
        },
        {
          date: '2018-09-27',
          count: 0,
          month: 8,
          day: 4,
          lastWeek: true,
          week: 21,
        },
        {
          date: '2018-09-28',
          count: 0,
          month: 8,
          day: 5,
          lastWeek: true,
          week: 21,
        },
        {
          date: '2018-09-29',
          count: 0,
          month: 8,
          day: 6,
          lastWeek: true,
          week: 21,
        },
        {
          date: '2018-09-30',
          count: 0,
          month: 8,
          day: 0,
          lastWeek: true,
          lastDay: true,
          week: 22,
        },
        {
          date: '2018-10-01',
          count: 0,
          month: 9,
          day: 1,
          week: 22,
        },
        {
          date: '2018-10-02',
          count: 0,
          month: 9,
          day: 2,
          week: 22,
        },
        {
          date: '2018-10-03',
          count: 0,
          month: 9,
          day: 3,
          week: 22,
        },
        {
          date: '2018-10-04',
          count: 0,
          month: 9,
          day: 4,
          week: 22,
        },
        {
          date: '2018-10-05',
          count: 2,
          month: 9,
          day: 5,
          week: 22,
        },
        {
          date: '2018-10-06',
          count: 0,
          month: 9,
          day: 6,
          week: 22,
        },
        {
          date: '2018-10-07',
          count: 0,
          month: 9,
          day: 0,
          week: 23,
        },
        {
          date: '2018-10-08',
          count: 0,
          month: 9,
          day: 1,
          week: 23,
        },
        {
          date: '2018-10-09',
          count: 0,
          month: 9,
          day: 2,
          week: 23,
        },
        {
          date: '2018-10-10',
          count: 0,
          month: 9,
          day: 3,
          week: 23,
        },
        {
          date: '2018-10-11',
          count: 0,
          month: 9,
          day: 4,
          week: 23,
        },
        {
          date: '2018-10-12',
          count: 0,
          month: 9,
          day: 5,
          week: 23,
        },
        {
          date: '2018-10-13',
          count: 0,
          month: 9,
          day: 6,
          week: 23,
        },
        {
          date: '2018-10-14',
          count: 0,
          month: 9,
          day: 0,
          week: 24,
        },
        {
          date: '2018-10-15',
          count: 0,
          month: 9,
          day: 1,
          week: 24,
        },
        {
          date: '2018-10-16',
          count: 0,
          month: 9,
          day: 2,
          week: 24,
        },
        {
          date: '2018-10-17',
          count: 0,
          month: 9,
          day: 3,
          week: 24,
        },
        {
          date: '2018-10-18',
          count: 0,
          month: 9,
          day: 4,
          week: 24,
        },
        {
          date: '2018-10-19',
          count: 0,
          month: 9,
          day: 5,
          week: 24,
        },
        {
          date: '2018-10-20',
          count: 0,
          month: 9,
          day: 6,
          week: 24,
        },
        {
          date: '2018-10-21',
          count: 0,
          month: 9,
          day: 0,
          week: 25,
        },
        {
          date: '2018-10-22',
          count: 0,
          month: 9,
          day: 1,
          week: 25,
        },
        {
          date: '2018-10-23',
          count: 0,
          month: 9,
          day: 2,
          week: 25,
        },
        {
          date: '2018-10-24',
          count: 0,
          month: 9,
          day: 3,
          week: 25,
        },
        {
          date: '2018-10-25',
          count: 0,
          month: 9,
          day: 4,
          week: 25,
        },
        {
          date: '2018-10-26',
          count: 0,
          month: 9,
          day: 5,
          week: 25,
        },
        {
          date: '2018-10-27',
          count: 0,
          month: 9,
          day: 6,
          week: 25,
        },
        {
          date: '2018-10-28',
          count: 0,
          month: 9,
          day: 0,
          week: 26,
        },
        {
          date: '2018-10-29',
          count: 0,
          month: 9,
          day: 1,
          week: 26,
        },
        {
          date: '2018-10-30',
          count: 0,
          month: 9,
          day: 2,
          week: 26,
        },
        {
          date: '2018-10-31',
          count: 0,
          month: 9,
          day: 3,
          lastDay: true,
          week: 26,
        },
      ],
    },
  };
  return res.json(result);
}
function getAttackChainsEvents(req, res) {
  // const { body } = req;
  const result = {
    error_code: 0,
    msg: 'succ',
    data: {
      hits: [
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZijBCbkZp4ndsOJHkj',
          _score: null,
          _source: {
            tsOldest: 1538753422000,
            tsLatest: 1538753422000,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '人工注入',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.10.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1538753422000],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZg8PAIkZp4ndsOJHkf',
          _score: null,
          _source: {
            tsOldest: 1538753422000,
            tsLatest: 1538753422000,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '病毒入侵',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1538753422000],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePRxRkZp4ndsOJHkQ',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '入侵感知',
            category_2: '安装利用',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePYkhkZp4ndsOJHkR',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '入侵感知',
            category_2: '网络入侵',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePrjNkZp4ndsOJHkV',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '网络入侵',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZeP0ZKkZp4ndsOJHkW',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '网络入侵',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.2'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-unhandled',
          _type: 'doc',
          _id: 'AWZeOBe7kZp4ndsOJHkM',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '入侵感知',
            category_2: '内部侦查',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePb_wkZp4ndsOJHkS',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '入侵感知',
            category_2: '外部侦查',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePi9NkZp4ndsOJHkU',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '异常文件感知',
            category_2: '外部侦查',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-handled',
          _type: 'doc',
          _id: 'AWZePfCukZp4ndsOJHkT',
          _score: null,
          _source: {
            tsOldest: 1531180800111,
            tsLatest: 1531180800111,
            name: '疑似DDoS外发攻击流量',
            category_1: '失陷感知',
            category_2: '外部侦查',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800111],
        },
        {
          _index: 'logstash-event2-unhandled',
          _type: 'doc',
          _id: 'AWZdG2E2kZp4ndsOJHkE',
          _score: null,
          _source: {
            tsOldest: 1531180800000,
            tsLatest: 1531180800000,
            name: '疑似DDoS外发攻击流量',
            category_1: '总体感知',
            category_2: '网络攻击',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1531180800000],
        },
        {
          _index: 'logstash-event2-unhandled',
          _type: 'doc',
          _id: 'AWZdGymOkZp4ndsOJHkD',
          _score: null,
          _source: {
            tsOldest: 1528588800000,
            tsLatest: 1528588800000,
            name: '疑似DDoS外发攻击流量',
            category_1: '总体感知',
            category_2: '网络攻击',
            attackStage: '安装利用',
            score: 60,
            status: 'handled',
            protocol: 'DNS',
            src: [
              {
                ip: '112.22.0.1',
                port: 65332,
                assetName: 'PC-001',
                ipCountry: '美国',
              },
            ],
            dst: [
              {
                ip: '10.18.15.1',
                port: 8080,
                assetName: 'PC-003',
                ipCountry: '局域网',
              },
            ],
            assetTypes: ['服务器', 'PC'],
            assetGroups: [1, 2],
            probeName: '流量探针1',
            affectedAssets: [
              {
                ip: '10.11.45.1',
                assetName: 'PC-001',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b6',
              },
              {
                ip: '10.18.45.2',
                assetName: 'PC-002',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b7',
              },
              {
                ip: '10.18.45.3',
                assetName: 'PC-003',
                ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
              },
            ],
            attackerIps: ['112.11.45.1'],
            victimIps: ['192.168.45.1'],
            signatureId: 1,
          },
          sort: [1528588800000],
        },
      ],
      total: 12,
    },
  };
  return res.json(result);
}
function getAttackAndVictimInfos(req, res) {
  // const { body } = req;
  const result = {
    error_code: 0,
    msg: 'succ',
    data: {
      list: [
        {
          ip: '192.168.1.100',
          hits: [
            {
              _index: 'event-unhandled',
              _type: 'doc',
              _id: 'AAAAAFvQL6Qc5etAAACiyw==',
              _score: null,
              _source: {
                timestamp: 1540370340075,
                tsOldest: 1540370340075,
                tsLatest: 1540370340075,
                name: 'TCP SYN flood DoS攻击',
                category_1: '入侵感知',
                category_2: 'dos攻击',
                attackStage: '横向渗透',
                score: 36,
                status: 'unhandled',
                protocol: 'TCP',
                src: [
                  {
                    ip: '192.168.1.100',
                    port: 59149,
                    ipCountry: '',
                    ipProvince: '',
                    ipCity: '',
                  },
                ],
                dst: [
                  {
                    ip: '192.168.1.102',
                    port: 445,
                    ipCountry: '',
                    ipProvince: '',
                    ipCity: '',
                  },
                ],
                assetTypes: [],
                assetGroups: [],
                originalIds: ['AAAAAFvQL6Qc5etAAACgrA=='],
                probeName: '6c92bf676214',
                affectedAssets: [
                  {
                    ip: '192.168.1.100',
                    ipMac: '192.168.1.100-08:00:27:c8:30:4d',
                  },
                  {
                    ip: '192.168.1.102',
                    ipMac: '192.168.1.102-08:00:27:94:3d:79',
                  },
                ],
                attackerIps: ['192.168.1.102'],
                victimIps: ['192.168.1.100'],
                signatureId: 17023,
              },
              sort: [1540370340075],
            },
            {
              _index: 'event-unhandled',
              _type: 'doc',
              _id: 'AAAAAFvP32wc5etAAAARpQ==',
              _score: null,
              _source: {
                timestamp: 1540274356107,
                tsOldest: 1540274356107,
                tsLatest: 1540274356107,
                name: '疑似 ETERNALBLUE MS17-010 堆喷',
                category_1: '入侵感知',
                category_2: '漏洞攻击',
                attackStage: '横向渗透',
                score: 12,
                status: 'unhandled',
                protocol: 'TCP',
                src: [
                  {
                    ip: '192.168.1.100',
                    port: 54542,
                    ipCountry: '',
                    ipProvince: '',
                    ipCity: '',
                  },
                ],
                dst: [
                  {
                    ip: '192.168.1.102',
                    port: 445,
                    ipCountry: '',
                    ipProvince: '',
                    ipCity: '',
                  },
                ],
                assetTypes: [],
                assetGroups: [],
                originalIds: ['AAAAAFvP32wc5etAAAARog=='],
                probeName: '6c92bf676214',
                affectedAssets: [
                  {
                    ip: '192.168.1.100',
                    ipMac: '192.168.1.100-08:00:27:c8:30:4d',
                  },
                  {
                    ip: '192.168.1.102',
                    ipMac: '192.168.1.102-08:00:27:94:3d:79',
                  },
                ],
                attackerIps: ['192.168.1.102'],
                victimIps: ['192.168.1.100'],
                signatureId: 14391,
              },
              sort: [1540274356107],
            },
          ],
          aggs: [
            {
              attack: '横向渗透',
              time: '0时',
              count: 18204,
            },
            {
              attack: '横向渗透',
              time: '1时',
              count: 18186,
            },
            {
              attack: '横向渗透',
              time: '2时',
              count: 18350,
            },
            {
              attack: '横向渗透',
              time: '3时',
              count: 18210,
            },
            {
              attack: '横向渗透',
              time: '4时',
              count: 18202,
            },
            {
              attack: '横向渗透',
              time: '5时',
              count: 18196,
            },
            {
              attack: '横向渗透',
              time: '6时',
              count: 18350,
            },
            {
              attack: '横向渗透',
              time: '7时',
              count: 18078,
            },
            {
              attack: '横向渗透',
              time: '8时',
              count: 18192,
            },
            {
              attack: '横向渗透',
              time: '9时',
              count: 18048,
            },
            {
              attack: '横向渗透',
              time: '10时',
              count: 17026,
            },
            {
              attack: '横向渗透',
              time: '11时',
              count: 8803,
            },
            {
              attack: '横向渗透',
              time: '12时',
              count: 8646,
            },
            {
              attack: '横向渗透',
              time: '13时',
              count: 8973,
            },
            {
              attack: '横向渗透',
              time: '14时',
              count: 17926,
            },
            {
              attack: '横向渗透',
              time: '15时',
              count: 26540,
            },
            {
              attack: '横向渗透',
              time: '16时',
              count: 23859,
            },
            {
              attack: '横向渗透',
              time: '17时',
              count: 18362,
            },
            {
              attack: '横向渗透',
              time: '18时',
              count: 18502,
            },
            {
              attack: '横向渗透',
              time: '19时',
              count: 18176,
            },
            {
              attack: '横向渗透',
              time: '20时',
              count: 18190,
            },
            {
              attack: '横向渗透',
              time: '21时',
              count: 17762,
            },
            {
              attack: '横向渗透',
              time: '22时',
              count: 17906,
            },
            {
              attack: '横向渗透',
              time: '23时',
              count: 18358,
            },
            {
              attack: '恶意文件投递',
              time: '0时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '1时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '2时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '3时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '4时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '5时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '6时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '7时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '8时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '9时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '10时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '11时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '12时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '13时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '14时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '15时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '16时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '17时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '18时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '19时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '20时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '21时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '22时',
              count: 0,
            },
            {
              attack: '恶意文件投递',
              time: '23时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '0时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '1时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '2时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '3时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '4时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '5时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '6时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '7时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '8时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '9时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '10时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '11时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '12时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '13时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '14时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '15时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '16时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '17时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '18时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '19时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '20时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '21时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '22时',
              count: 0,
            },
            {
              attack: '攻陷系统',
              time: '23时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '0时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '1时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '2时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '3时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '4时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '5时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '6时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '7时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '8时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '9时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '10时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '11时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '12时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '13时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '14时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '15时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '16时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '17时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '18时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '19时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '20时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '21时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '22时',
              count: 0,
            },
            {
              attack: '网络入侵',
              time: '23时',
              count: 0,
            },
          ],
          total: 421045,
        },
      ],
    },
    aggKeyObj: {
      '192.168.1.100': {
        '0': {
          横向渗透: {
            count: 18204,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '1': {
          横向渗透: {
            count: 18186,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '2': {
          横向渗透: {
            count: 18350,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '3': {
          横向渗透: {
            count: 18210,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '4': {
          横向渗透: {
            count: 18202,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '5': {
          横向渗透: {
            count: 18196,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '6': {
          横向渗透: {
            count: 18350,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '7': {
          横向渗透: {
            count: 18078,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '8': {
          横向渗透: {
            count: 18192,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '9': {
          横向渗透: {
            count: 18048,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '10': {
          横向渗透: {
            count: 17026,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '11': {
          横向渗透: {
            count: 8803,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '12': {
          横向渗透: {
            count: 8646,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '13': {
          横向渗透: {
            count: 8973,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '14': {
          横向渗透: {
            count: 17926,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '15': {
          横向渗透: {
            count: 26540,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '16': {
          横向渗透: {
            count: 23859,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '17': {
          横向渗透: {
            count: 18362,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '18': {
          横向渗透: {
            count: 18502,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '19': {
          横向渗透: {
            count: 18176,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '20': {
          横向渗透: {
            count: 18190,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '21': {
          横向渗透: {
            count: 17762,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '22': {
          横向渗透: {
            count: 17906,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
        '23': {
          横向渗透: {
            count: 18358,
          },
          恶意文件投递: {
            count: 0,
          },
          攻陷系统: {
            count: 0,
          },
          网络入侵: {
            count: 0,
          },
        },
      },
    },
    dataCompletionArr: [
      {
        横向渗透: {
          existTimeArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          countArr: [
            18204,
            18186,
            18350,
            18210,
            18202,
            18196,
            18350,
            18078,
            18192,
            18048,
            17026,
            8803,
            8646,
            8973,
            17926,
            26540,
            23859,
            18362,
            18502,
            18176,
            18190,
            17762,
            17906,
            18358,
          ],
        },
        恶意文件投递: {
          existTimeArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          countArr: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        攻陷系统: {
          existTimeArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          countArr: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        网络入侵: {
          existTimeArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          countArr: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      },
    ],
  };
  return res.json(result);
}

function attackChartData(req, res) {
  const result = {
    "error_code": 0,
    "msg": "succ",
    "data": {
      "list": [
        {
          "aggs": [
            {
              "attack": "网络入侵",
              "time": "12时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "16时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "15时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "14时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "13时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "17时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "10时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "9时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "8时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "7时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "6时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "18时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "5时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "19时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "4时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "20时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "3时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "21时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "2时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "22时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "0时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "11时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "23时",
              "count": 0
            },
            {
              "attack": "网络入侵",
              "time": "1时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "15时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "14时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "13时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "16时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "12时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "11时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "10时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "9时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "8时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "17时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "7时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "18时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "6时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "19时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "5时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "20时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "4时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "21时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "3时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "22时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "2时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "23时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "0时",
              "count": 0
            },
            {
              "attack": "横向渗透",
              "time": "1时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "7时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "8时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "9时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "10时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "6时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "12时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "13时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "14时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "15时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "16时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "5时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "17时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "4时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "18时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "3时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "19时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "2时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "20时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "1时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "21时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "22时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "0时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "11时",
              "count": 0
            },
            {
              "attack": "攻陷系统",
              "time": "23时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "12时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "15时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "14时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "13时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "23时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "16时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "10时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "9时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "8时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "7时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "6时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "17时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "5时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "18时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "4时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "19时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "3时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "20时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "2时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "21时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "1时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "11时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "22时",
              "count": 0
            },
            {
              "attack": "恶意文件投递",
              "time": "0时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "16时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "15时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "14时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "17时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "12时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "11时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "10时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "9时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "8时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "18时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "7时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "19时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "6时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "20时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "5时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "21时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "4时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "22时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "3时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "23时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "2时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "13时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "1时",
              "count": 0
            },
            {
              "attack": "外部侦查",
              "time": "0时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "8时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "9时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "10时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "7时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "12时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "13时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "14时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "15时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "16时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "6时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "17时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "5时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "18时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "4时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "19时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "3时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "20时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "2时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "21时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "1时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "22时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "0时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "23时",
              "count": 0
            },
            {
              "attack": "内部侦查",
              "time": "11时",
              "count": 0
            }
          ]
        }
      ]
    },
    "resp": {
      "took": 0,
      "timed_out": false,
      "_shards": {
        "total": 0,
        "successful": 0,
        "skipped": 0,
        "failed": 0
      },
      "hits": {
        "total": 0,
        "max_score": 0,
        "hits": [

        ]
      }
    }
  };
  return res.json(result);
}

export default {
  'POST /api/event/getAffectedAssets': getAffectedAssets,
  'POST /api/event/getAttackChains': getAttackChains,
  'POST /api/event/getAttackChainsEvents': getAttackChainsEvents,
  'POST /api/event/getAttackAndVictimInfos': getAttackAndVictimInfos,

  'POST /api/screen/attackChartData': attackChartData,
};
