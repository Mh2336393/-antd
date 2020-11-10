import mockjs from 'mockjs';

function getEventDetail(req, res) {
  const eventDetail = {
    _index: 'logstash-event2-unhandled',
    _type: 'doc',
    _id: 'AWZXl0SuDRq0pM2g7lch',
    _score: 1,
    _source: {
      ruleName: 'Microsoft Windows SMB 尝试COPY命令 参数中路径名超长',
      ruleLevel: 5,
      tsOldest: 1539067640635,
      tsLatest: 1539067640635,
      name: '疑似DDoS外发攻击流量',
      category_1: '异常文件感知',
      category_2: '网络攻击',
      attackStage: '安装利用',
      score: 17,
      status: 'unhandled',
      protocol: 'DNS',
      asset_ip: [],
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
      probeName: '流量探针1',
      affectedAssets: [
        {
          ip: '10.11.45.1',
          assetName: 'PC-001',
          ipMac: '192.168.45.1-a0:d3:c1:2f:6b:b5',
        },
        {
          ip: '10.18.45.1',
          assetName: 'PC-002',
          ipMac: '10.18.45.1-a0:d3:c1:2f:6b:b5',
        },
      ],
      attackerIps: ['112.11.45.1'],
      victimIps: ['192.168.45.1'],
      signatureId: 1,
      fileName: '文件名',
      md5: 'dfsdfs',
      fileType: '文件类型',
      originalIds: ['1', '1'],
      ioc: '9d6c47442d23334e376ee78a612256ef',
      ioc_plaintext: 'zentoryny.duckdns.org',
      iocType: 'ip',
      iocTags: ['darkkomet', 'darkkomet1'],
      ioc_basic_info: { registrar: '', status: '', update_time: '' },
      // ioc_context: {
      //   resolution_ip: [
      //     {
      //       end_time: '20180601',
      //       ip: '8.8.8.8',
      //     },
      //     {
      //       end_time: '20180601',
      //       ip: '8.8.8.8',
      //     },
      //     {
      //       end_time: '20180601',
      //       ip: '8.8.8.8',
      //     },
      //   ],

      //   black_md5_contain_domain: [
      //     {
      //       end_time: '20180601',
      //       md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
      //     },
      //     {
      //       end_time: '20180601',
      //       md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
      //     },
      //     {
      //       end_time: '20180601',
      //       md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
      //     },
      //   ],
      //   black_md5_visit_domain: [
      //     {
      //       end_time: '20180601',
      //       md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
      //     },
      //     {
      //       end_time: '20180601',
      //       md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
      //     },
      //     {
      //       end_time: '20180601',
      //       md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
      //     },
      //   ],
      //   black_md5_download_from_domain: [
      //     {
      //       url: 'http://wt120.downyouxi.com/tianwaimojqzhitianwai.exe',
      //       end_time: '20180428',
      //       md5: '06b137b439113a8346ca33f6df47f59f',
      //     },
      //     {
      //       url: 'http://wt120.downyouxi.com/rexuedongmandaluandou.exe',
      //       end_time: '20180417',
      //       md5: '98de7984ff8399103069c1e1453c13df',
      //     },
      //     {
      //       url: 'http://wt120.downyouxi.com/hamutailang4hongsedaxingjinzhongwenban.exe',
      //       end_time: '20180415',
      //       md5: 'bb1a3fd4ee0cce4c6c2337f3e3e9497a',
      //     },
      //   ],
      //   black_url_of_domain: [
      //     {
      //       url: 'http://wt120.downyouxi.com/yongzhedouelong3zhongwenban.exe',
      //       end_time: '20180330',
      //     },
      //     {
      //       url: 'http://wt120.downyouxi.com/yongzhedouelong3zhongwenban.exe',
      //       end_time: '20180330',
      //     },
      //     {
      //       url: 'http://wt120.downyouxi.com/yongzhedouelong3zhongwenban.exe',
      //       end_time: '20180330',
      //     },
      //   ],

      //   threat_info: [
      //     {
      //       title: '************',
      //       desc: '20180330',
      //       time: '20180330',
      //       url: 'http://www.baidu.com/malicious.html',
      //     },
      //   ],
      // },
      ioc_context: {
        historical_domain: [
          {
            end_time: '20180601',
            domain: 'a.com',
          },
          {
            end_time: '20180601',
            domain: 'b.com',
          },
          {
            end_time: '20180601',
            domain: 'c.com',
          },
        ],
        black_md5_contain_ip: [
          {
            end_time: '20180601',
            md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
          },
          {
            end_time: '20180601',
            md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
          },
          {
            end_time: '20180601',
            md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
          },
        ],
        black_md5_visit_ip: [
          {
            end_time: '20180601',
            md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
          },
          {
            end_time: '20180601',
            md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
          },
          {
            end_time: '20180601',
            md5: 'abf40da0b8791b69e0f173c2bedcd8fa',
          },
        ],
        black_md5_download_from_ip: [
          {
            url: 'http://wt120.downyouxi.com/tianwaimojqzhitianwai.exe',
            end_time: '20180428',
            md5: '06b137b439113a8346ca33f6df47f59f',
          },
          {
            url: 'http://wt120.downyouxi.com/rexuedongmandaluandou.exe',
            end_time: '20180417',
            md5: '98de7984ff8399103069c1e1453c13df',
          },
          {
            url: 'http://wt120.downyouxi.com/hamutailang4hongsedaxingjinzhongwenban.exe',
            end_time: '20180415',
            md5: 'bb1a3fd4ee0cce4c6c2337f3e3e9497a',
          },
        ],
        black_url_of_ip: [
          {
            url: 'http://wt120.downyouxi.com/yongzhedouelong3zhongwenban.exe',
            end_time: '20180330',
          },
          {
            url: 'http://wt120.downyouxi.com/yongzhedouelong3zhongwenban.exe',
            end_time: '20180330',
          },
          {
            url: 'http://wt120.downyouxi.com/yongzhedouelong3zhongwenban.exe',
            end_time: '20180330',
          },
        ],
        threat_info: [
          {
            title: '************',
            desc: '20180330',
            time: '20180330',
            url: 'http://www.baidu.com/malicious.html',
          },
        ],
      },
      message: '事件描述内容',
      suggestion: '处置建议内容',
      confidence: 5,
      severity: 5,
    },
  };
  const result = {
    error_code: 0,
    msg: 'ok',
    data: eventDetail,
    recordsTotal: 50,
  };

  res.json(result);
}

function getWarningData(req, res) {
  const { body } = req;
  const eventList = mockjs.mock({
    'list|100': [
      {
        _index: 'log',
        _type: 'doc',
        _id: 'AWZUDxXqDRq0pM2g7lcc',
        _score: null,
        _source: {
          timestamp: '2018-09-23T15:21:05.146688+0800',
          flow_id: 273534830066902,
          pcap_cnt: 52097,
          event_type: 'alert',
          src_mac: '0c:4b:54:5f:c6:8d',
          dst_mac: 'a0:d3:c1:2f:6b:b4',
          src_ip: '192.168.1.100',
          src_port: 58352,
          dst_ip: '192.168.1.102',
          dst_port: 445,
          attacker_ip: '192.168.1.102',
          victim_ip: '192.168.1.102',
          asset_ip: '192.168.1.102',
          attack_state: '网络入侵',
          proto: 'TCP',
          app_proto: 'smb',
          src_info: 'LOCAL',
          dst_info: 'LOCAL',
          alert: {
            action: 'allowed',
            gid: 1,
            signature_id: 14391,
            credit_score: 3,
            rev: 2,
            signature: '疑似 ETERNALBLUE MS17-010 堆喷',
            category: '漏洞攻击',
            severity: 1,
            metadata: {
              updated_at: ['2017_05_13'],
              created_at: ['2017_04_17'],
              signature_severity: ['Critical'],
              deployment: ['Internal'],
              attack_target: ['SMB_Server'],
              former_category: ['EXPLOIT'],
            },
          },
          flow: {
            pkts_toserver: 15,
            pkts_toclient: 8,
            bytes_toserver: 17711,
            bytes_toclient: 599,
            start: '2018-09-20T15:21:05.146646+0800',
          },
          flowflags: 29,
          payload: 'AAAQNHVrUw==',
          stream: 1,
          packet: 'CAAnl2tH',
          packet_info: {
            linktype: 1,
          },
          sensor_id: 'suricata',
        },
        sort: [1537687265146],
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'ok',
    data: eventList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
    recordsTotal: 100,
  };
  return res.json(result);
}

function getBehaviorObj(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        extra_info:
          '{"Dynamic": {"ProcessTree": {"list": [{"open": true, "name": "sample.exe (PID: 0x00000bac)", "children": [{"open": true, "name": "msdcsc.exe (PID: 0x00000bcc)", "children": [{"open": true, "name": "\\u4fee\\u6539\\u6ce8\\u518c\\u8868_\\u5b89\\u5168\\u4e2d\\u5fc3\\u76f8\\u5173\\u5c5e\\u6027", "actionid": [1088]}, {"open": true, "name": "iexplore.exe (PID: 0x00000be8)", "children": [{"open": true, "name": "\\u8bbf\\u95ee\\u57df\\u540d: drmshck.duckdns.org", "actionid": [1647]}]}]}]}]}, "Process": {"\\u8de8\\u8fdb\\u7a0b\\u5199\\u5165\\u6570\\u636e": [{"ProcName": "msdcsc.exe", "Detail": "TargetProcess = C:\\\\Program Files\\\\Internet Explorer\\\\iexplore.exe, WriteAddress = 0x00400000, Size = 0x000ba000 TargetPID = 0x00000be8", "Level": 3}, {"ProcName": "msdcsc.exe", "Detail": "TargetProcess = C:\\\\Program Files\\\\Internet Explorer\\\\iexplore.exe, WriteAddress = 0x7ffde008, Size = 0x00000004 TargetPID = 0x00000be8", "Level": 3}], "\\u521b\\u5efa\\u65b0\\u6587\\u4ef6\\u8fdb\\u7a0b": [{"ProcName": "sample.exe", "Detail": "[0x00000bcc]ImagePath = C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe, CmdLine = \\"C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe\\" ", "Level": 3}], "\\u8bbe\\u7f6e\\u7ebf\\u7a0b\\u4e0a\\u4e0b\\u6587": [{"ProcName": "msdcsc.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe", "Level": 3}], "\\u679a\\u4e3e\\u8fdb\\u7a0b": [{"ProcName": "msdcsc.exe", "Detail": "N/A", "Level": 3}], "\\u521b\\u5efa\\u8fdb\\u7a0b": [{"ProcName": "msdcsc.exe", "Detail": "[0x00000be8]ImagePath = C:\\\\Program Files\\\\Internet Explorer\\\\iexplore.exe, CmdLine = \\"C:\\\\Program Files\\\\Internet Explorer\\\\iexplore.exe\\"", "Level": 3}]}, "Hook": {"\\u8bbe\\u7f6e\\u6d88\\u606f\\u94a9\\u5b50": [{"ProcName": "iexplore.exe", "Detail": "C:\\\\Program Files\\\\Internet Explorer\\\\iexplore.exe", "Level": 3}]}, "Other": {"\\u8c03\\u7528Sleep\\u51fd\\u6570": [{"ProcName": "sample.exe", "Detail": "[1]: MilliSeconds = 1000.", "Level": 3}], "\\u521b\\u5efa\\u4e92\\u65a5\\u4f53": [{"ProcName": "sample.exe", "Detail": "CTF.LBES.MutexDefaultS-*", "Level": 3}, {"ProcName": "sample.exe", "Detail": "CTF.Compart.MutexDefaultS-*", "Level": 3}, {"ProcName": "sample.exe", "Detail": "CTF.Asm.MutexDefaultS-*", "Level": 3}, {"ProcName": "sample.exe", "Detail": "CTF.Layouts.MutexDefaultS-*", "Level": 3}, {"ProcName": "sample.exe", "Detail": "CTF.TMD.MutexDefaultS-*", "Level": 3}, {"ProcName": "sample.exe", "Detail": "CTF.TimListCache.FMPDefaultS-*MUTEX.DefaultS-*", "Level": 3}, {"ProcName": "sample.exe", "Detail": "Local\\\\ZonesCounterMutex", "Level": 3}, {"ProcName": "sample.exe", "Detail": "Local\\\\ZoneAttributeCacheCounterMutex", "Level": 3}, {"ProcName": "sample.exe", "Detail": "Local\\\\ZonesCacheCounterMutex", "Level": 3}, {"ProcName": "sample.exe", "Detail": "Local\\\\ZonesLockedCacheCounterMutex", "Level": 3}, {"ProcName": "msdcsc.exe", "Detail": "DC_MUTEX-DRNHX67", "Level": 3}], "\\u521b\\u5efa\\u4e8b\\u4ef6\\u5bf9\\u8c61": [{"ProcName": "sample.exe", "Detail": "EventName = DINPUTWINMM ", "Level": 3}]}, "File": {"\\u521b\\u5efa\\u6587\\u4ef6": [{"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe", "Level": 3}], "\\u521b\\u5efa\\u53ef\\u6267\\u884c\\u6587\\u4ef6": [{"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe", "Level": 3}], "\\u67e5\\u627e\\u6587\\u4ef6": [{"ProcName": "sample.exe", "Detail": "FileName = C:\\\\Documents and Settings", "Level": 3}, {"ProcName": "sample.exe", "Detail": "FileName = C:\\\\Documents and Settings\\\\Administrator", "Level": 3}, {"ProcName": "sample.exe", "Detail": "FileName = C:\\\\Documents and Settings\\\\Administrator\\\\My Documents", "Level": 3}, {"ProcName": "sample.exe", "Detail": "FileName = C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC", "Level": 3}, {"ProcName": "sample.exe", "Detail": "FileName = C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe", "Level": 3}, {"ProcName": "msdcsc.exe", "Detail": "FileName = C:\\\\Program Files\\\\Internet Explorer\\\\iexplore.exe", "Level": 3}, {"ProcName": "iexplore.exe", "Detail": "FileName = C:\\\\Documents and Settings\\\\Administrator\\\\Application Data", "Level": 3}], "\\u8bbe\\u7f6e\\u7279\\u6b8a\\u6587\\u4ef6\\u5c5e\\u6027": [{"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe", "Level": 3}], "\\u590d\\u5236\\u6587\\u4ef6": [{"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\Local Settings\\\\%temp%\\\\****.exe  ---> C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe ", "Level": 3}], "\\u8bbe\\u7f6e\\u7279\\u6b8a\\u6587\\u4ef6\\u5939\\u5c5e\\u6027": [{"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC", "Level": 4}], "\\u4fee\\u6539\\u6587\\u4ef6\\u5185\\u5bb9": [{"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe ---> Offset = 0 ", "Level": 3}, {"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe ---> Offset = 65536 ", "Level": 3}, {"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe ---> Offset = 131072 ", "Level": 3}, {"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe ---> Offset = 196608 ", "Level": 3}, {"ProcName": "sample.exe", "Detail": "C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe ---> Offset = 262144 ", "Level": 3}]}, "Net": {"\\u8bbf\\u95ee\\u57df\\u540d": [{"ProcName": "iexplore.exe", "Detail": "\\u8bbf\\u95ee\\u57df\\u540d: drmshck.duckdns.org", "ActionId": 1647, "Level": 3}]}, "Reg": {"\\u4fee\\u6539\\u6ce8\\u518c\\u8868": [{"ProcName": "sample.exe", "Detail": "\\\\REGISTRY\\\\USER\\\\S-*\\\\Software\\\\Microsoft\\\\Windows\\\\ShellNoRoam\\\\MUICache\\\\C:\\\\Documents and Settings\\\\Administrator\\\\My Documents\\\\MSDCSC\\\\msdcsc.exe", "Level": 3}, {"ProcName": "msdcsc.exe", "Detail": "\\\\REGISTRY\\\\MACHINE\\\\SYSTEM\\\\ControlSet002\\\\Services\\\\SharedAccess\\\\Parameters\\\\FirewallPolicy\\\\StandardProfile\\\\DisableNotifications", "Level": 3}, {"ProcName": "msdcsc.exe", "Detail": "\\\\REGISTRY\\\\USER\\\\S-*\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System\\\\EnableLUA", "Level": 3}], "\\u4fee\\u6539\\u6ce8\\u518c\\u8868_\\u670d\\u52a1\\u9879": [{"ProcName": "msdcsc.exe", "Detail": "\\\\REGISTRY\\\\MACHINE\\\\SYSTEM\\\\ControlSet002\\\\Services\\\\wscsvc\\\\Start", "Level": 3}], "\\u4fee\\u6539\\u6ce8\\u518c\\u8868_\\u542f\\u52a8\\u9879": [{"ProcName": "sample.exe", "Detail": "\\\\REGISTRY\\\\USER\\\\S-*\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run\\\\MicroUpdate", "Level": 4}, {"ProcName": "sample.exe", "Detail": "\\\\REGISTRY\\\\MACHINE\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion\\\\Winlogon\\\\UserInit", "Level": 4}], "\\u4fee\\u6539\\u6ce8\\u518c\\u8868_\\u5b89\\u5168\\u4e2d\\u5fc3\\u76f8\\u5173\\u5c5e\\u6027": [{"ProcName": "msdcsc.exe", "Detail": "\\\\REGISTRY\\\\MACHINE\\\\SOFTWARE\\\\Microsoft\\\\Security Center\\\\AntiVirusDisableNotify", "ActionId": 1088, "Level": 5}]}}}',
      },
    ],
  };
  return res.json(result);
}
export default {
  'POST /api/event/getEventDetail': getEventDetail,
  'POST /api/event/getWarningData': getWarningData,
  'POST /api/file/getFileBehavior': getBehaviorObj,
};
