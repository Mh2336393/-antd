import mockjs from 'mockjs';

function getReportList(req, res) {
  const { body } = req;
  const tableList = mockjs.mock({
    'list|123': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        'task_name|1': ['综合安全态势报表', '威胁情报态势报表'],
        'template|1': ['测试模板一', '测试模板二', '测试模板三', '测试模板四'],
        'generate_time|1': ['2018-11-09 12:36:56', '2018-11-11 10:23:45'],
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'succ',
    recordsTotal: 123,
    data: tableList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
  };
  res.json(result);
}

function delReportList(req, res) {
  const result = {
    error_code: 0,
    msg: 'ok',
  };
  res.json(result);
}

function getReportAutoList(req, res) {
  const tableList = mockjs.mock({
    'list|12': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        'task_name|1': ['综合安全态势报表', '威胁情报态势报表'],
        'template|1': ['测试模板一', '测试模板二', '测试模板三', '系统内置模板'],
        time_start: '2018-11-09 00:00:00',
        time_end: '2018-11-09 23:59:59',
        'asset|1': ['', '资产1,资产2', '未分组'],
        creator: 'admin',
        'next_working_time|1': ['2018-11-09 12:36:56', '2018-11-11 10:23:45'],
        'last_working_time|1': ['2018-11-09 12:36:56', '2018-11-11 10:23:45'],
        'period|1': ['daily', 'weekly', 'monthly'],
        'enable|1': ['0', '1'],
        description: '报告描述内容',
        'generate_time|1': ['2018-11-09 12:36:56', '2018-11-11 10:23:45'],
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'succ',
    recordsTotal: 12,
    // data: tableList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
    data: tableList.list,
  };
  res.json(result);
}

function getHisReportList(req, res) {
  const tableList = mockjs.mock({
    'list|10': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        'task_name|1': ['测试任务', '测试'],
        'template|1': ['综合安全态势报表', '所有', '测试模板三', '系统内置模板'],
        // 'period|1': ['hourly', 'daily', 'weekly', 'monthly'],
        time_start: '2018-11-09 00:00:00',
        time_end: '2018-11-09 23:59:59',
        'asset|1': ['', '资产1', '未分组'],
        'topn|1': ['10', '50'],
        'create_time|1': ['2018-11-09 12:36:56', '2018-11-11 10:23:45'],
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'succ',
    recordsTotal: 5,
    // data: tableList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
    data: tableList.list,
  };
  res.json(result);
}

export default {
  'POST /api/report/getReportList': getReportList,
  'POST /api/report/delReportList': delReportList,

  'POST /api/report/getReportAutoList': getReportAutoList,
  'POST /api/report/delReportAutoList': delReportList,
  'POST /api/report/putReportAutoList': delReportList,
  'POST /api/report/getHistList': getHisReportList,
};
