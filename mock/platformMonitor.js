// import mockjs from 'mockjs';
// import common from './common';

function getHardwareList(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        id: 278,
        ip: '10.16.250.57',
        ip_tag: '',
        cpu_usage: 0,
        cpu_load: 0,
        mem_usage: 25,
        disk_usage: 3,
        disk_load: 0,
        net_bytes_sent: 33235375185,
        net_bytes_recv: 366744909213,
        net_packets_sent: 252171430,
        net_packets_recv: 361836303,
        net_errin: 0,
        net_errout: 0,
        net_dropin: 3735928559,
        net_dripout: 3353,
        sys_up_time: 1985620,
        update_time: '2018-10-22T11:36:27.000Z',
        online: true,
        err: true,
        errorLog: ['/data/isa_log/es/elasticsearch-2018-10-22-1.txt'],
      },
      // {
      //   id: 5,
      //   ip: '127.0.0.1',
      //   ip_tag: '',
      //   cpu_usage: 3,
      //   cpu_load: 0,
      //   mem_usage: 78,
      //   disk_usage: 56,
      //   disk_load: 0,
      //   net_bytes_sent: 0,
      //   net_bytes_recv: 0,
      //   net_packets_sent: 0,
      //   net_packets_recv: 0,
      //   net_errin: 0,
      //   net_errout: 0,
      //   net_dropin: 0,
      //   net_dripout: 0,
      //   sys_up_time: 0,
      //   update_time: '2018-10-21T17:25:00.000Z',
      //   online: true,
      // },
    ],
  };
  return res.json(result);
}

function getRunningList(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        ip: '10.16.250.57',
        server_num: 5,
        active_num: 5,
        max_time: '2018-10-22T12:45:33.000Z',
        abnormal_num: 0,
        online: true,
        err: true,
        errorLog: ['/data/isa_log/es/elasticsearch-2018-10-22-1.txt'],
      },
    ],
  };
  return res.json(result);
}

function getSandboxList(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        type: 'master',
        ip: '127.0.0.1',
        online: true,
        run_time: 310056,
        android: 0,
        win7: 0,
        winxp: 0,
        win10: 0,
        linux: 0,
      },
      {
        type: 'slaver',
        ip: '127.0.0.1',
        online: true,
        win7: 1,
        winxp: 1,
        linux: 0,
        win10: 0,
        android: 0,
      },
    ],
  };
  return res.json(result);
}
export default {
  'POST /api/dashboard/platform': getHardwareList,
  'POST /api/dashboard/running': getRunningList,
  'POST /api/dashboard/sandbox': getSandboxList,
  // 'POST /api/dashboard/lineChartData': getLineChartData,
};
