import mockjs from 'mockjs';
import common from './common';

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
function getChartData(req, res) {
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
            doc_count: 10,
            eventNums: {
              buckets: [
                {
                  key_as_string: '1537632000000',
                  key: 1537632000000,
                  doc_count: 3,
                },
                {
                  key_as_string: '1538280000000',
                  key: 1538280000000,
                  doc_count: 7,
                },
              ],
            },
          },
          {
            key: '恶意文件投递',
            doc_count: 2,
            eventNums: {
              buckets: [
                {
                  key_as_string: '1538107200000',
                  key: 1538107200000,
                  doc_count: 1,
                },
                {
                  key_as_string: '1538280000000',
                  key: 1538280000000,
                  doc_count: 1,
                },
              ],
            },
          },
          {
            key: '网络入侵',
            doc_count: 2,
            eventNums: {
              buckets: [
                {
                  key_as_string: '1538107200000',
                  key: 1538107200000,
                  doc_count: 1,
                },
                {
                  key_as_string: '1538280000000',
                  key: 1538280000000,
                  doc_count: 1,
                },
              ],
            },
          },
        ],
      },
    },
  };
  return res.json(result);
}
export default {
  'POST /api/event/getEventList': getEventList,
  'POST /api/event/handleEvent': common.ok,
  'POST /api/event/ignoreEvent': common.ok,
  'POST /api/event/getChartData': getChartData,
};
