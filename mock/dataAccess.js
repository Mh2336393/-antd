function getDataAccess(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        ip: '192.168.100.101',
        id: '246e968f7c20',
        name: '101',
        desc: '',
        status: true,
      },
      {
        ip: '127.0.0.1',
        id: '6c92bf676214',
        name: 'node1',
        desc: '',
        status: false,
      },
    ],
  };
  return res.json(result);
}

function getSource(req, res) {
  const result = { msg: { ip: '192.168.100.101', id: '246e968f7c20', name: '101', desc: '备注内容' }, error_code: 0 };
  return res.json(result);
}

function getNetworkCard(req, res) {
  const result = { msg: { eth2: 'default', eth1: 'em2' }, error_code: 0 };
  return res.json(result);
}

function getAddress(req, res) {
  const result = { msg: { HOME_NET: '192.168.0.0/16,10.0.0.0/8,172.16.0.0/12' }, error_code: 0 };
  return res.json(result);
}

function getWhiteIp(req, res) {
  const result = { msg: '', error_code: 0 };
  return res.json(result);
}

function getAllCard(req, res) {
  const result = {
    msg: [
      ['p4p1', '', '', '', true],
      ['p4p2', '', '', '', true],
      ['em1', '192.168.100.101', '255.255.255.0', '', true],
      ['em3', '192.168.101.103', '255.255.255.0', '', true],
      ['em4', '192.168.1.86', '255.255.255.0', '', true],
      ['lo', '127.0.0.1', '255.0.0.0', '', true],
      ['em2', '192.168.101.102', '255.255.255.0', '', true],
    ],
    error_code: 0,
  };
  return res.json(result);
}

function getPcapConfig(req, res) {
  const result = {
    msg: {
      'alert-flowstore': true,
      'force-pcapstore': true,
      'packet-store-limit': 30,
      'flow-store-limit': 5,
    },
    error_code: 0,
  };
  return res.json(result);
}

export default {
  'POST /api/systemset/dataAccess': getDataAccess,
  'POST /api/systemset/getSource': getSource,
  'POST /api/systemset/engine_network_card': getNetworkCard,
  'POST /api/systemset/group_address': getAddress,
  'POST /api/systemset/white_ip': getWhiteIp,
  'POST /api/systemset/network_card': getAllCard,
  'POST /api/systemset/getPcapConfig': getPcapConfig,
};
