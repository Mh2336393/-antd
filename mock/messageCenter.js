import mockjs from 'mockjs';

function getMessageTypeGroup(req, res) {
  const groupList = [
    {
      message_type: 'sec',
      message_name: '安全消息',
      id: '1.1',
      count: 172,
      // sub_type: [
      //   {
      //     message_type: 'urgent_sec_event',
      //     message_name: '有新的急需处理的安全事件',
      //     id: '2.1.1',
      //     count: 100,
      //   },
      //   {
      //     message_type: 'normal_sec_event',
      //     message_name: '普通安全事件',
      //     id: '2.1.2',
      //     count: 72,
      //   }
      // ]
    },
    {
      message_type: 'sys',
      message_name: '系统消息',
      id: '1.2',
      count: 34,
      // sub_type: [
      //   {
      //     message_type: 'components_exception',
      //     message_name: '系统组件运行异常',
      //     id: '2.2.1',
      //     count: 4,
      //   },
      //   {
      //     message_type: 'flow_exception',
      //     message_name: '流量采集运行异常',
      //     id: '2.2.2',
      //     count: 13,
      //   },
      //   {
      //     message_type: 'system_exception',
      //     message_name: '系统（CPU、内存）使用率高于80%',
      //     id: '2.2.3',
      //     count: 10,
      //   },
      //   {
      //     message_type: 'disk_exception',
      //     message_name: '磁盘使用率高于80%',
      //     id: '2.2.4',
      //     count: 7,
      //   },
      // ]
    },
    {
      message_type: 'report',
      message_name: '其他',
      id: '1.3',
      count: 19,
      // sub_type: [
      //   {
      //     message_type: 'new_report',
      //     message_name: '有新的报表生成',
      //     id: '2.3.1',
      //     count: 19,
      //   },
      // ]
    },
  ];
  const result = {
    error_code: 0,
    msg: 'ok',
    data: groupList,
  };
  res.json(result);
}

function getMessageCenterList(req, res) {
  const { body } = req;
  const tableList = mockjs.mock({
    'list|257': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        'msg_id|+1': mockjs.mock('@increment(1)'),
        content:
          "[{u'eventid': u'xxxx', u'handle': 1, u'name': u'\\u6d4b\\u8bd5\\u5927\\u91cf\\u4e8b\\u4ef6a', u'destIP': u'192.168.11.1;192.168.11.2', u'score': 93, u'asset': u'\\u672a\\u547d\\u540d\\u8d44\\u4ea701', u'time': u'2018-08-21 15:11:23', u'srcIP': u'1.2.3.4', u'type': u'\\u7f51\\u7edc\\u653b\\u51fb'}]",
        create_time: '2018-10-25T06:36:09.000Z',
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'ok',
    recordsTotal: 257,
    data: tableList.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
  };
  res.json(result);
}

function setIsRead(req, res) {
  const result = {
    error_code: 0,
    msg: '已读状态设置成功',
  };
  res.json(result);
}

function setDelete(req, res) {
  const result = {
    error_code: -1,
    msg: '删除消息失败了',
  };
  res.json(result);
}

function getNoticeStrategyList(req, res) {
  const { body } = req;
  const tableList = mockjs.mock({
    'list|123': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        'name|1': ['EBA资产评分超过80', '消息名称内容'],
        'message_type|1': ['sec', 'sys', 'report'],
        'sub_type|1': ['urgent_sec_event', 'normal_sec_event', 'components_exception', 'new_report'],
        'message_enable|1': [0, 1],
        'mail_enable|1': [0, 1],
        'short_message_enable|1': [0, 1],
        'syslog_enable|1': [0, 1],
        'check_interval|1': [0, 60, 3600, 300, 86400],
        'user_list|1': ['admin', 'admin|test'],
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

function putNoticeStrategyList(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
  };
  res.json(result);
}

function putSystemAccess(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
  };
  res.json(result);
}

function getSystemAccess(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: {
      mail: [],
      syslog: [],
    },
  };
  res.json(result);
}

function getPlatformNetAddr(req, res) {
  const result = {
    msg: [
      ['enp6s0f0', '', '', '', true],
      ['lo', '127.0.0.1', '255.0.0.0', '', true],
      ['enp6s0f1', '10.16.250.57', '255.255.255.0', '', true],
      ['tap0', '192.168.190.103', '255.255.255.0', '', true],
    ],
    error_code: 0,
  };
  res.json(result);
}

function getPlatformNetCard(req, res) {
  const result = {
    msg: {
      eth2: 'default',
      eth1: 'enp6s0f0',
    },
    error_code: 0,
  };
  res.json(result);
}
function setPlatformNetCard(req, res) {
  const result = {
    msg: '成功设置流量引擎监控网卡',
    error_code: 0,
  };
  res.json(result);
}

function getNtpInfo(req, res) {
  const result = {
    error_code: 0,
    msg: 'ok',
    cmd: 'set_ntp_info',
    data: {
      status: 1,
      timezone: 'CST',
      ntp_ip: '192.168.1.104',
      now: '2018-09-10 12:00:00',
    },
  };
  res.json(result);
}

function setNtpInfo(req, res) {
  const result = {
    error_code: 0,
    msg: 'ok',
    cmd: 'set_ntp_info',
    data: {},
  };
  res.json(result);
}

function putPlatformNetAddr(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
  };
  res.json(result);
}

function getTimeZones(req, res) {
  const list = [
    {
      name: '北京-重庆-新加坡（UTC+8）',
      value: 'CST',
    },
  ];
  const result = {
    error_code: 0,
    msg: 'succ',
    data: list,
  };
  res.json(result);
}

function getUserMsgNotifyList(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    recordsTotal: 550,
    data: [
      {
        msg_id: 174122102,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '72|174122102|174122101|174122100|174122099|174122098|174122097|174122096|174122095|174122094|174122093|174122092|174122091|174122090|174122089|174122088|174122087|174122086|174122085|174122084|174122083|174122082|174122081|174122080|174122079|174122078|174122077|174122076|174122075|174122074|174122073|174122072|174122071|174122070|174122069|174122068|174122067|174122066|174122065|174122064|174122063|174122062|174122061|174122060|174122059|174122058|174122057|174122056|174122055|174122053|174122054|174122051|174122052|174122049|174122050|174122047|174122048|174122045|174122046|174122043|174122044|174122041|174122042|174122039|174122040|174122037|174122038|174122035|174122036|174122033|174122034|174122031|174122032',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T09:48:18.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174122029,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '84|174122029|174122030|174122027|174122028|174122025|174122026|174122024|174122023|174122022|174122021|174122020|174122019|174122017|174122018|174122015|174122016|174122013|174122014|174122012|174122011|174122010|174122009|174122008|174122007|174122006|174122005|174122004|174122001|174122002|174121998|174121999|174121995|174121996|174121992|174121993|174121989|174121990|174121986|174121987|174121983|174121984|174121980|174121981|174121976|174121977|174121972|174121968|174121966|174121963|174121962|174121961|174121959|174121960|174121957|174121958|174121955|174121956|174121954|174121953|174121952|174121951|174121950|174121949|174121945|174121946|174121941|174121942|174121938|174121939|174121936|174121933|174121932|174121931|174121930|174121929|174121928|174121927|174121926|174121924|174121925|174121922|174121923|174121920|174121921',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T08:48:18.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174122000,
        message_type: 'sec',
        sub_type: 'normal_sec_event',
        user_id: 'admin',
        msg_num:
          '18|174122000|174121997|174121991|174121988|174121985|174121982|174121979|174121978|174121975|174121974|174121969|174121965|174121964|174121948|174121940|174121937|174121935|174121934',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T08:47:49.000Z',
        content: '异常文件感知-恶意文件投递:B84D035C73AF35A9F2F44335DFE7E297.7z',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174122003,
        message_type: 'sec',
        sub_type: 'urgent_sec_event',
        user_id: 'admin',
        msg_num: '9|174122003|174121994|174121973|174121971|174121970|174121967|174121947|174121944|174121943',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T08:47:48.000Z',
        content: '异常文件感知-恶意文件投递:bf8e533cb2e6dc6c75b2933d9a41f82f.exe',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121918,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '78|174121918|174121919|174121916|174121917|174121914|174121915|174121913|174121912|174121911|174121909|174121910|174121907|174121908|174121905|174121906|174121904|174121903|174121901|174121900|174121899|174121898|174121897|174121896|174121895|174121894|174121892|174121891|174121890|174121889|174121888|174121887|174121886|174121885|174121883|174121884|174121881|174121882|174121879|174121880|174121878|174121877|174121876|174121874|174121875|174121872|174121873|174121870|174121871|174121869|174121868|174121867|174121866|174121865|174121864|174121863|174121862|174121861|174121860|174121859|174121858|174121856|174121857|174121851|174121853|174121844|174121845|174121843|174121842|174121841|174121839|174121840|174121837|174121838|174121835|174121836|174121834|174121833|174121832',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T07:48:18.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121902,
        message_type: 'sec',
        sub_type: 'normal_sec_event',
        user_id: 'admin',
        msg_num: '8|174121902|174121893|174121855|174121850|174121848|174121849|174121846|174121847',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T07:47:49.000Z',
        content: '入侵感知-Some(web攻击):Apache Tomcat Possible CVE-2017-12617 JSP 上传绕过尝试 1',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121831,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '105|174121831|174121830|174121829|174121827|174121828|174121825|174121826|174121823|174121824|174121821|174121822|174121819|174121820|174121817|174121818|174121815|174121816|174121813|174121814|174121810|174121811|174121812|174121807|174121808|174121809|174121804|174121805|174121806|174121801|174121802|174121803|174121798|174121799|174121800|174121795|174121796|174121797|174121792|174121793|174121794|174121789|174121790|174121791|174121786|174121787|174121788|174121783|174121784|174121785|174121780|174121781|174121782|174121778|174121779|174121776|174121777|174121773|174121774|174121775|174121768|174121769|174121770|174121763|174121764|174121765|174121759|174121760|174121756|174121757|174121754|174121753|174121752|174121751|174121750|174121749|174121748|174121747|174121746|174121745|174121744|174121743|174121742|174121741|174121740|174121739|174121737|174121738|174121735|174121736|174121733|174121734|174121731|174121732|174121729|174121730|174121727|174121728|174121726|174121725|174121724|174121723|174121722|174121721|174121720|174121719',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T06:48:18.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121767,
        message_type: 'sec',
        sub_type: 'normal_sec_event',
        user_id: 'admin',
        msg_num: '6|174121767|174121766|174121761|174121762|174121758|174121755',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T06:47:49.000Z',
        content: '异常文件感知-恶意文件投递:bc413072de3592664a056ba6c6c7fc92.exe',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121772,
        message_type: 'sec',
        sub_type: 'urgent_sec_event',
        user_id: 'admin',
        msg_num: '2|174121772|174121771',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T06:47:48.000Z',
        content: '异常文件感知-恶意文件投递:e7a6cacd62696471f48a56205abc120d.exe',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121718,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '75|174121718|174121717|174121716|174121715|174121714|174121713|174121712|174121710|174121711|174121708|174121709|174121706|174121707|174121705|174121704|174121703|174121702|174121700|174121697|174121693|174121694|174121690|174121691|174121686|174121687|174121684|174121683|174121682|174121680|174121681|174121678|174121679|174121676|174121677|174121675|174121674|174121673|174121672|174121671|174121670|174121668|174121669|174121666|174121667|174121664|174121665|174121663|174121662|174121661|174121660|174121659|174121658|174121656|174121657|174121654|174121655|174121652|174121653|174121651|174121650|174121649|174121648|174121647|174121646|174121645|174121644|174121643|174121642|174121641|174121640|174121639|174121638|174121637|174121636|174121635',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T05:48:18.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121701,
        message_type: 'sec',
        sub_type: 'urgent_sec_event',
        user_id: 'admin',
        msg_num: '2|174121701|174121699',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T05:47:48.000Z',
        content: '异常文件感知-恶意文件投递:c7163bd7567bc17c87b839fb6ec22590.exe',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121563,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '78|174121563|174121562|174121561|174121560|174121559|174121558|174121557|174121556|174121555|174121554|174121553|174121552|174121551|174121550|174121549|174121548|174121547|174121546|174121545|174121544|174121543|174121542|174121541|174121540|174121539|174121538|174121537|174121536|174121535|174121534|174121533|174121532|174121531|174121530|174121529|174121528|174121527|174121525|174121526|174121523|174121524|174121520|174121521|174121519|174121512|174121510|174121509|174121508|174121506|174121507|174121504|174121505|174121501|174121502|174121499|174121500|174121496|174121497|174121493|174121494|174121490|174121491|174121487|174121488|174121484|174121485|174121481|174121482|174121478|174121479|174121474|174121475|174121471|174121472|174121467|174121468|174121464|174121465',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T03:48:18.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121522,
        message_type: 'sec',
        sub_type: 'normal_sec_event',
        user_id: 'admin',
        msg_num:
          '18|174121522|174121516|174121515|174121511|174121513|174121514|174121498|174121495|174121492|174121489|174121483|174121480|174121476|174121473|174121470|174121469|174121466|174121463',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T03:47:49.000Z',
        content: '异常文件感知-恶意文件投递:3c79d1b3e08f7931710fb5441a827072.ppsx',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121518,
        message_type: 'sec',
        sub_type: 'urgent_sec_event',
        user_id: 'admin',
        msg_num: '5|174121518|174121517|174121503|174121486|174121477',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T03:47:48.000Z',
        content: '异常文件感知-恶意文件投递:e7a6cacd62696471f48a56205abc120d.exe',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121459,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '159|174121459|174121460|174121456|174121457|174121451|174121452|174121449|174121450|174121447|174121448|174121436|174121433|174121434|174121430|174121431|174121432|174121427|174121428|174121429|174121424|174121425|174121426|174121422|174121423|174121418|174121419|174121420|174121415|174121416|174121417|174121412|174121413|174121414|174121409|174121410|174121411|174121407|174121408|174121403|174121404|174121405|174121400|174121401|174121402|174121397|174121398|174121399|174121394|174121395|174121396|174121392|174121393|174121388|174121389|174121390|174121385|174121386|174121387|174121382|174121383|174121384|174121379|174121380|174121381|174121377|174121378|174121373|174121374|174121375|174121370|174121371|174121372|174121367|174121368|174121369|174121364|174121365|174121366|174121362|174121363|174121358|174121359|174121360|174121355|174121356|174121357|174121352|174121353|174121354|174121349|174121350|174121351|174121347|174121348|174121343|174121344|174121345|174121340|174121341|174121342|174121337|174121338|174121339|174121334|174121335|174121336|174121332|174121333|174121328|174121329|174121330|174121325|174121326|174121327|174121321|174121322|174121323|174121317|174121318|174121319|174121315|174121316|174121311|174121312|174121313|174121308|174121309|174121310|174121305|174121306|174121307|174121302|174121303|174121304|174121300|174121301|174121296|174121297|174121298|174121293|174121294|174121295|174121290|174121291|174121292|174121287|174121288|174121289|174121285|174121286|174121281|174121282|174121283|174121278|174121279|174121280|174121274|174121275|174121276',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T02:48:19.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121461,
        message_type: 'sec',
        sub_type: 'normal_sec_event',
        user_id: 'admin',
        msg_num: '3|174121461|174121454|174121453',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T02:47:49.000Z',
        content: '异常文件感知-恶意文件投递:18625fb0756f1f0390da0085b591aaae.exe',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121458,
        message_type: 'sec',
        sub_type: 'urgent_sec_event',
        user_id: 'admin',
        msg_num: '2|174121458|174121455',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T02:47:48.000Z',
        content: '异常文件感知-恶意文件投递:bf8e533cb2e6dc6c75b2933d9a41f82f.exe',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121437,
        message_type: 'report',
        sub_type: 'new_report',
        user_id: 'admin',
        msg_num: '10|174121437|174121445|174121444|174121443|174121442|174121441|174121440|174121439|174121438|174121446',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T02:47:48.000Z',
        content: '有新的报表生成',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121435,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '13|174121435|174121436|174121433|174121434|174121430|174121431|174121432|174121427|174121428|174121429|174121424|174121425|174121426',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T02:43:19.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
      {
        msg_id: 174121421,
        message_type: 'sys',
        sub_type: 'components_exception',
        user_id: 'admin',
        msg_num:
          '15|174121421|174121422|174121423|174121418|174121419|174121420|174121415|174121416|174121417|174121412|174121413|174121414|174121409|174121410|174121411',
        is_read: 0,
        is_notified: 0,
        create_time: '2018-12-19T02:38:18.000Z',
        content: '系统组件运行异常',
        detail: '',
        is_show: 1,
      },
    ],
  };
  res.json(result);
}

function getMessageDetail(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        msg_id: 174116403,
        detail:
          '{"status": "inactive", "name": "", "ip": "10.0.1.84", "detail": "\\u25cf isa-filedeal.service - filedeal\\n   Loaded: loaded (/etc/systemd/system/isa-filedeal.service; enabled; vendor preset: disabled)\\n   Active: inactive (dead) since Mon 2018-12-17 15:59:09 CST; 5h 4min ago\\n  Process: 42786 ExecStart=/usr/local/bin/filedeal -d (code=exited, status=0/SUCCESS)\\n Main PID: 27673 (code=killed, signal=USR2)\\n\\nDec 17 15:59:09 isa1 systemd[1]: Starting filedeal...\\nDec 17 15:59:09 isa1 systemd[1]: Started filedeal.\\n", "time": "2018-12-17 21:03:18", "type": "component_status", "component_name": "filedeal"}',
      },
      {
        msg_id: 174116404,
        detail:
          '{"status": "inactive", "name": "", "ip": "10.0.1.84", "detail": "\\u25cf isa-filedeal.service - filedeal\\n   Loaded: loaded (/etc/systemd/system/isa-filedeal.service; enabled; vendor preset: disabled)\\n   Active: inactive (dead) since Mon 2018-12-17 15:59:09 CST; 5h 5min ago\\n  Process: 42786 ExecStart=/usr/local/bin/filedeal -d (code=exited, status=0/SUCCESS)\\n Main PID: 27673 (code=killed, signal=USR2)\\n\\nDec 17 15:59:09 isa1 systemd[1]: Starting filedeal...\\nDec 17 15:59:09 isa1 systemd[1]: Started filedeal.\\n", "time": "2018-12-17 21:04:18", "type": "component_status", "component_name": "filedeal"}',
      },
      {
        msg_id: 174116405,
        detail:
          '{"status": "inactive", "name": "", "ip": "10.0.1.84", "detail": "\\u25cf isa-filedeal.service - filedeal\\n   Loaded: loaded (/etc/systemd/system/isa-filedeal.service; enabled; vendor preset: disabled)\\n   Active: inactive (dead) since Mon 2018-12-17 15:59:09 CST; 5h 6min ago\\n  Process: 42786 ExecStart=/usr/local/bin/filedeal -d (code=exited, status=0/SUCCESS)\\n Main PID: 27673 (code=killed, signal=USR2)\\n\\nDec 17 15:59:09 isa1 systemd[1]: Starting filedeal...\\nDec 17 15:59:09 isa1 systemd[1]: Started filedeal.\\n", "time": "2018-12-17 21:05:18", "type": "component_status", "component_name": "filedeal"}',
      },
      {
        msg_id: 174116406,
        detail:
          '{"status": "inactive", "name": "", "ip": "10.0.1.84", "detail": "\\u25cf isa-filedeal.service - filedeal\\n   Loaded: loaded (/etc/systemd/system/isa-filedeal.service; enabled; vendor preset: disabled)\\n   Active: inactive (dead) since Mon 2018-12-17 15:59:09 CST; 5h 7min ago\\n  Process: 42786 ExecStart=/usr/local/bin/filedeal -d (code=exited, status=0/SUCCESS)\\n Main PID: 27673 (code=killed, signal=USR2)\\n\\nDec 17 15:59:09 isa1 systemd[1]: Starting filedeal...\\nDec 17 15:59:09 isa1 systemd[1]: Started filedeal.\\n", "time": "2018-12-17 21:06:18", "type": "component_status", "component_name": "filedeal"}',
      },
    ],
  };
  return res.json(result);
}

function getAssetsFindlist(req, res) {
  const { body } = req;
  const tableList = mockjs.mock({
    'list|67': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        update_time: '2018-11-01 11:14:45',
        flowsource: '探针1',
        insert_time: '2018-10-31 19:50:45',
        ip: '192.168.1.141',
        mac: 'a0:d3:c1:2f:6b:b4',
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'success',
    recordsTotal: 67,
    data: tableList.list.slice(Number(body.start), Number(body.start) + Number(body.length)),
    cmd: 'query_assetfind',
    recordsFiltered: 67,
  };
  res.json(result);
}

function getLoginInfo(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      { id: 20, web_key: 'failure_time', web_value: '5', comment: '登录失败限制次数' },
      { id: 21, web_key: 'lock_time', web_value: '34', comment: '登录失败锁定时间' },
      { id: 22, web_key: 'session_invalid_time', web_value: '46', comment: '超时登出时间' },
    ],
  };
  res.json(result);
}

function setLoginInfo(req, res) {
  const result = { error_code: 0, msg: 'succ' };
  res.json(result);
}

function getSanboxSetting(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        ip: '127.0.0.1',
        name: 'slaver_127.0.0.1',
        image_info: [
          {
            image_num: 1,
            editable: 1,
            image_version: 'win7',
          },
          {
            image_num: 1,
            editable: 1,
            image_version: 'winxp',
          },
          {
            image_num: 0,
            editable: 0,
            image_version: 'linux',
          },
          {
            image_num: 0,
            editable: 0,
            image_version: 'win10',
          },
          {
            image_num: 0,
            editable: 0,
            image_version: 'android',
          },
        ],
      },
      {
        ip: '192.168.100.101',
        name: 'slaver_192.168.100.101',
        image_info: [
          {
            image_num: 10,
            editable: 1,
            image_version: 'win7',
          },
          {
            image_num: 10,
            editable: 1,
            image_version: 'winxp',
          },
          {
            image_num: 0,
            editable: 1,
            image_version: 'linux',
          },
          {
            image_num: 0,
            editable: 1,
            image_version: 'win10',
          },
          {
            image_num: 0,
            editable: 0,
            image_version: 'android',
          },
        ],
      },
    ],
  };
  res.json(result);
}

function getauthorizationInfo(req, res) {
  const result = {
    data: {
      Number: '1234',
      Company: 'TX',
      BeginTime: '2018-10-08 14:34:46',
      EndTime: '2018-12-08 14:34:46',
      Type: 1,
      MaxFlow: 10,
      BoxFileCnt: 50,
      ThreatUpdate: 1,
    },
    error_code: 0,
  };
  res.json(result);
}

export default {
  'POST /api/message/getMessageCenterTypeGroup': getMessageTypeGroup,
  'POST /api/message/getMessageCenterList': getMessageCenterList,
  'POST /api/message/messageCenterIsRead': setIsRead,
  'POST /api/message/messageCenterDel': setDelete,

  'POST /api/message/getNoticeStrategyList': getNoticeStrategyList,
  'POST /api/message/putNoticeStrategyList': putNoticeStrategyList,
  'POST /api/message/setNoticeStrategy': putNoticeStrategyList,

  'POST /api/message/getSystemAccess': getSystemAccess,
  'POST /api/message/putSystemAccess': putSystemAccess,
  'POST /api/message/syslogTest': putSystemAccess,
  'POST /api/message/mailTest': putSystemAccess,

  'POST /api/safety/getPlatformNetAddr': getPlatformNetAddr,
  'POST /api/safety/putPlatformNetAddr': putPlatformNetAddr,
  'POST /api/safety/getTimeZones': getTimeZones,
  'POST /api/safety/getPlatformNetCard': getPlatformNetCard,
  'POST /api/safety/setPlatformNetCard': setPlatformNetCard,
  'POST /api/safety/getNtpInfo': getNtpInfo,
  'POST /api/safety/setNtpInfo': setNtpInfo,
  'POST /api/safety/getLoginInfo': getLoginInfo,
  'POST /api/safety/setLoginInfo': setLoginInfo,

  'POST /api/message/getUserMsgNotifyList': getUserMsgNotifyList,
  'POST /api/message/getMessageDetail': getMessageDetail,

  'POST /api/property/getAssetsFindlist': getAssetsFindlist,
  'POST /api/property/setDhcpNetAddr': putPlatformNetAddr,

  'POST /api/systemset/sanboxSetting': getSanboxSetting,
  'POST /api/systemset/authorizationInfo': getauthorizationInfo,
  'POST /api/systemset/addEditSlaverSetting': putPlatformNetAddr,
  'POST /api/systemset/delSlaverList': putPlatformNetAddr,
};
