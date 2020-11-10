// import mockjs from 'mockjs';
// import moment from 'moment';

function getEventHandleStatus(req, res) {
  const aggs = [
    {
      key: '1.0-40.0',
      from: 1,
      to: 40,
      doc_count: 0,
      status: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [],
      },
    },
    {
      key: '41.0-60.0',
      from: 41,
      to: 60,
      doc_count: 295,
      status: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: 'ignored',
            doc_count: 239,
          },
          {
            key: 'unhandled',
            doc_count: 56,
          },
        ],
      },
    },
    {
      key: '61.0-80.0',
      from: 61,
      to: 80,
      doc_count: 458242,
      status: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: 'ignored',
            doc_count: 416624,
          },
          {
            key: 'unhandled',
            doc_count: 41618,
          },
        ],
      },
    },
    {
      key: '81.0-100.0',
      from: 81,
      to: 100,
      doc_count: 0,
      status: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [],
      },
    },
  ];
  const result = {
    error_code: 0,
    msg: 'ok',
    data: aggs,
  };
  res.json(result);
}
function getEventStatusTrend(req, res) {
  const aggs = [
    {
      key: 'ignored',
      doc_count: 415300,
      eventNums: {
        buckets: [
          {
            key_as_string: '1541635200000',
            key: 1541635200000,
            doc_count: 413453,
          },
          {
            key_as_string: '1541721600000',
            key: 1541721600000,
            doc_count: 1847,
          },
        ],
      },
    },
    {
      key: 'unhandled',
      doc_count: 132704,
      eventNums: {
        buckets: [
          {
            key_as_string: '1541462400000',
            key: 1541462400000,
            doc_count: 850,
          },
          {
            key_as_string: '1541548800000',
            key: 1541548800000,
            doc_count: 217,
          },
          {
            key_as_string: '1541635200000',
            key: 1541635200000,
            doc_count: 699,
          },
          {
            key_as_string: '1541721600000',
            key: 1541721600000,
            doc_count: 130938,
          },
        ],
      },
    },
  ];
  const result = {
    error_code: 0,
    msg: 'ok',
    data: aggs,
  };
  res.json(result);
}
export default {
  'POST /api/report/getEventHandleStatus': getEventHandleStatus,
  'POST /api/report/getEventStatusTrend': getEventStatusTrend,
};
