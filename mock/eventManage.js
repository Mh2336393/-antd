import mockjs from 'mockjs';

function getIpWhitelist(req, res) {
  const mockData = mockjs.mock({
    'list|50': [
      {
        'id|+1': 1,
        'dst_ip|1': ['0.0.0.0', '1.0.0.0', '192.168.1.1', '192.168.2.1'],
        'src_ip|1': ['0.0.0.0', '1.0.0.0', '192.168.1.1', '192.168.2.1'],
        'ioc_switch|1': ['0', '1'],
        'file_switch|1': ['0', '1'],
        'signature_switch|1': ['0', '1'],
        desc: 'test',
      },
    ],
  });
  const result = { error_code: 0, msg: 'succ', data: mockData.list };
  return res.json(result);
}

function getIocWhitelist(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    recordsTotal: 2,
    data: [
      {
        id: 1,
        ioc: 'www.baidu.com',
        ioc_type: 0,
      },
      {
        id: 2,
        ioc: '192.168.1.1',
        ioc_type: 1,
      },
    ],
  };
  return res.json(result);
}

function getProbeList(req, res) {
  const result = {
    error_code: 0,
    data: [
      {
        node_id: '6c92bf676214',
        rule_set: '0',
        ti_enable: 0,
        habo_enable: 0,
        desc: 'testtest',
        ruleNum: 1,
        name: 'node1',
      },
    ],
    recordsTotal: 1,
  };
  return res.json(result);
}
export default {
  'POST /api/eventManage/getIpWhitelist': getIpWhitelist,
  'POST /api/eventManage/getIocWhitelist': getIocWhitelist,
  'POST /api/eventManage/getProbeList': getProbeList,
};
