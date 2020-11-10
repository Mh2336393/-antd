import mockjs from 'mockjs';
import common from './common';

function getEventPropertyRiskList(req, res) {
  const { body } = req;
  const eventList = mockjs.mock({
    'list|101': [
      {
        'unhanledNum|1-100': 1,
        latestTimestamp: 1539157582231,
        'score|1-100': 1,
        attackStage: '网络入侵',
        Fasset_name: '资产名称2',
        Fgroup_name: '宣传部',
        'Fcategory|1': ['1', '2', '3'],
        Fip: mockjs.mock('@ip'),
        Fmac: '0c:4b:54:5f:c6:8d',
      },
    ],
  });

  const result = {
    error_code: 0,
    msg: 'ok',
    data: eventList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
    recordsTotal: 101,
  };
  res.json(result);
}

function getChartData(req, res) {
  const list = [
    {
      time: '2018-09-22',
      type: '攻陷系统',
      eventNum: 20,
    },
    {
      time: '2018-09-23',
      type: '安装利用',
      eventNum: 10,
    },
    {
      time: '2018-09-24',
      type: '恶意文件投递',
      eventNum: 2,
    },
    {
      time: '2018-09-25',
      type: '网络入侵',
      eventNum: 26,
    },
    {
      time: '2018-09-26',
      type: '探测',
      eventNum: 2,
    },
    {
      time: '2018-09-27',
      type: '攻陷系统',
      eventNum: 26,
    },
  ];
  const result = {
    error_code: 0,
    msg: 'ok',
    data: list,
    recordsTotal: 6,
  };
  res.json(result);
}

function getPropertyGroup(req, res) {
  const groupList = [
    {
      Fgroup_name: '信息部',
      Fgid: 1,
      count: 2,
    },
    {
      Fgroup_name: '宣传部',
      Fgid: 2,
      count: 1,
    },
  ];
  const result = {
    error_code: 0,
    msg: 'ok',
    data: groupList,
  };
  res.json(result);
}

export default {
  'POST /api/event/getEventPropertyRiskList': getEventPropertyRiskList,
  'POST /api/event/getChartPropertyRiskData': getChartData,
  'POST /api/event/handlePropertyRiskEvent': common.ok,
  'POST /api/event/ignorePropertyRiskEvent': common.ok,
  'POST /api/event/getAssetGroupWithCount': getPropertyGroup,
};
