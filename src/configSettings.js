// import intentJson from './intent.json';
import strategyJson from './strategy.json';

const pageSizeOptions = ['10', '20', '30', '50'];

const statusMap = {
  unhandled: '未处理',
  handled: '已处理',
  ignored: '已忽略',
};

const roleMap = {
  1: '超级管理员',
  2: '普通管理员',
  3: '审计员',
};

const scoreColorMap = score => {
  switch (true) {
    case score >= 81 && score <= 100:
      return { color: '#e74343', label: '严重', ruleSoce: 100, ruleLevel: 5 };
    case score >= 61 && score <= 80:
      return { color: '#54576A', label: '高危', ruleSoce: 80, ruleLevel: 4 };
    case score >= 41 && score <= 60:
      return { color: '#54576A', label: '中危', ruleSoce: 60, ruleLevel: 3 };
    case score >= 21 && score <= 40:
      return { color: '#54576A', label: '低危', ruleSoce: 40, ruleLevel: 2 };
    case score > 0 && score <= 20:
      return { color: '#54576A', label: '信息', ruleSoce: 20, ruleLevel: 1 };
    default:
      return { color: '#54576A', label: '自动计算', ruleSoce: 0, ruleLevel: 0 };
  }
};

const scoreTagMap = score => {
  switch (true) {
    case score >= 81 && score <= 100:
      return {
        style: {
          color: '#F5222D',
          border: '1px solid #FFE6E4',
          backgroundColor: '#FFE6E4',
        },
        label: `严重(${score})`,
      };
    case score >= 61 && score <= 80:
      return {
        style: {
          color: '#E06F00',
          border: '1px solid #FFE7D4',
          backgroundColor: '#FFE7D4',
        },
        label: `高危(${score})`,
      };
    case score >= 41 && score <= 60:
      return {
        style: {
          color: '#0F87F5',
          border: '1px solid #D3F1FF',
          backgroundColor: '#D3F1FF',
        },
        label: `中危(${score})`,
      };
    case score >= 21 && score <= 40:
      return {
        style: {
          color: '#7f7f7f',
          border: '1px solid #f1f1f1',
          backgroundColor: '#f1f1f1',
        },
        label: `低危(${score})`,
      };
    default:
      return {
        style: {
          color: '#009595',
          border: '1px solid #CBF9F2',
          backgroundColor: '#CBF9F2',
        },
        label: `信息(${score})`,
      };
  }
};

const aptUpScoreTagMap = (virusName, score) => {
  if (virusName) {
    return scoreTagMap(score);
  }
  return {
    style: {
      color: '#009595',
      border: '1px solid #CBF9F2',
      backgroundColor: '#CBF9F2',
    },
    label: '未见异常',
  };
};

const scoreFilterListShow = (scoreArr, scoreDir) => {
  let score1 = 0;
  let score2 = 0;
  let score3 = 0;
  let score4 = 0;
  let score5 = 0; // 信息
  scoreArr.forEach(scoreObj => {
    if (scoreObj.key >= 0 && scoreObj.key <= 20) {
      score5 += scoreObj.doc_count;
    }
    if (scoreObj.key >= 21 && scoreObj.key <= 40) {
      score1 += scoreObj.doc_count;
    }
    if (scoreObj.key >= 41 && scoreObj.key <= 60) {
      score2 += scoreObj.doc_count;
    }
    if (scoreObj.key >= 61 && scoreObj.key <= 80) {
      score3 += scoreObj.doc_count;
    }
    if (scoreObj.key >= 81 && scoreObj.key <= 100) {
      score4 += scoreObj.doc_count;
    }
  });
  const scoreListTmp = [
    { key: '信息', doc_count: score5 },
    { key: '低危', doc_count: score1 },
    { key: '中危', doc_count: score2 },
    { key: '高危', doc_count: score3 },
    { key: '严重', doc_count: score4 },
  ];
  const scoreList = scoreListTmp.filter(obj => obj.doc_count !== 0);
  if (scoreDir === 'desc') {
    scoreList.sort((a, b) => b.doc_count - a.doc_count);
  } else {
    scoreList.sort((a, b) => a.doc_count - b.doc_count);
  }
  return scoreList;
};

/* eslint-disable  no-restricted-properties */
const bytesToSize = bytes => {
  if (bytes === 0 || bytes === '0') {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const fileStatusMap = status => {
  switch (status) {
    case '0':
    case 0:
      return { color: '#1890FF', bgColor: '#E9F5FF', borderColor: '#91D5FF' };
    case '1':
    case 1:
      return { color: '#13C2C2', bgColor: '#E6FFFB', borderColor: '#87E8DE' };
    default:
      return { color: '#7F7F7F', bgColor: '#F1F1F1', borderColor: '#ACACAC' };
  }
};

const fileStatusTag = status => {
  switch (status) {
    case '0':
    case 0:
      return {
        style: { color: '#1890FF', backgroundColor: '#E9F5FF', border: '1px solid #91D5FF' },
        label: '分析中',
      };
    case '1':
    case 1:
      return {
        style: { color: '#13C2C2', backgroundColor: '#E6FFFB', border: '1px solid #87E8DE' },
        label: '成功',
      };
    default:
      return {
        style: { color: '#7F7F7F', backgroundColor: '#F1F1F1', border: '1px solid #ACACAC' },
        label: '失败',
      };
  }
};

const ipsNoRepeat = data => {
  if (data) {
    const allArr = Array.isArray(data) ? data : [data];
    const ips = [];
    const result = [];
    allArr.forEach(obj => {
      if (ips.indexOf(obj.ip) < 0) {
        ips.push(obj.ip);
        result.push(obj);
      }
    });
    return result;
  }
  return [];
};

const portsNoRepeat = data => {
  if (data) {
    const allArr = Array.isArray(data) ? data : [data];
    const ports = [];
    const result = [];
    allArr.forEach(obj => {
      if (ports.indexOf(obj.port) < 0) {
        ports.push(obj.port);
        result.push(obj);
      }
    });
    return result;
  }
  return [];
};

const attackStageMap = attack => {
  switch (attack) {
    case '网络入侵':
      return { color: '#1890FF', bgColor: '#E9F5FF', borderColor: '#91D5FF' };
    case '攻陷系统':
      return { color: '#F5222D', bgColor: '#FFF1F0', borderColor: '#FFA39E' };
    case '恶意文件投递':
      return { color: '#EC9700', bgColor: '#FFF5DB', borderColor: '#F3D484' };
    case '横向渗透':
      return { color: '#722ED1', bgColor: '#F9F0FF', borderColor: '#D3ADF7' };
    case '外部侦查':
      return { color: '#13C2C2', bgColor: '#E6FFFB', borderColor: '#87E8DE' };
    default:
      return { color: '#7F7F7F', bgColor: '#F1F1F1', borderColor: '#bbb8b8' };
  }
};

const alertMode = {
  ai_baseline: '基线告警',
  threshold: '阈值告警',
};

const scoreRangeMap = str => {
  switch (str) {
    case '1-40':
      return '风险评分40分以下（低危）安全事件';
    case '41-60':
      return '风险评分41-60分（中危）安全事件';
    case '61-80':
      return '风险评分61-80分（高危）安全事件';
    default:
      return '风险评分80分以上（严重）安全事件';
  }
};

// 严重等级
const severityLabel = num => {
  switch (num) {
    case '1':
    case 1:
      return '信息';
    case '2':
    case 2:
      return '低';
    case '3':
    case 3:
      return '中';
    case '4':
    case 4:
      return '高';
    default:
      return '极高';
  }
};

// '置信度 5准确 4确信（默认） 3可信 2较可信 1可能',
const confidenceLabel = num => {
  switch (num) {
    case '0':
    case 0:
      return '只记录不告警';
    case '1':
    case 1:
      return '可能';
    case '2':
    case 2:
      return '较可信';
    case '3':
    case 3:
      return '可信';
    case '4':
    case 4:
      return '确信';
    default:
      return '准确';
  }
};

// 置信度选项
const confidenceOpetion = [
  { name: '0（只记录不告警）', value: 0, valueStr: '0' },
  { name: '1（可能）', value: 1, valueStr: '1' },
  { name: '2（较可信）', value: 2, valueStr: '2' },
  { name: '3（可信）', value: 3, valueStr: '3' },
  { name: '4（确信）', value: 4, valueStr: '4' },
  { name: '5（准确）', value: 5, valueStr: '5' },
]


const tagsListData = str => {
  const list = [
    { name: '全部', value: '' },
    { name: '僵尸网络域名', value: '僵尸网络域名' },
    { name: '矿池域名', value: '矿池域名' },
    { name: '恶意软件域名', value: '恶意软件域名' },
    { name: '恶意域名', value: '恶意域名' },
    { name: '勒索软件相关域名', value: '勒索软件相关域名' },
    { name: 'Sinkhole的僵尸网络域名', value: 'Sinkhole的僵尸网络域名' },
    { name: 'APT攻击中涉及的域名', value: 'APT攻击中涉及的域名' },
    { name: '垃圾邮件IP', value: '垃圾邮件IP' },
    { name: '恶意软件IP', value: '恶意软件IP' },
    { name: 'Tor匿名网络IP', value: 'Tor匿名网络IP' },
    { name: '矿池IP', value: '矿池IP' },
    { name: '恶意IP', value: '恶意IP' },
    { name: '被Sinkhole的僵尸网络IP', value: '被Sinkhole的僵尸网络IP' },
    { name: 'APT攻击中涉及的IP', value: 'APT攻击中涉及的IP' },
    { name: '勒索软件URL', value: '勒索软件URL' },
    { name: '恶意软件URL', value: '恶意软件URL' },
    { name: '恶意URL', value: '恶意URL' },
    { name: '僵尸网络URL', value: '僵尸网络URL' },
    { name: '被Sinkhole的僵尸网络URL', value: '被Sinkhole的僵尸网络URL' },
    { name: 'APT攻击中涉及的URL', value: 'APT攻击中涉及的URL' },
  ];
  let result = [];
  if (str) {
    for (let i = 0; i < list.length; i += 1) {
      if (i > 0) {
        if (list[i].indexOf(str) > -1) {
          result.push(list[i]);
        }
      } else {
        result.push(list[i]);
      }
    }
  } else {
    result = list;
  }
  return result;
};

const urlKey = key => {
  let urlMap = [];
  if (key === 'ip') {
    urlMap = [
      { name: '腾讯安图', url: 'https://eti.qq.com/query/ip' },
      { name: 'VirusTotal', url: 'https://www.virustotal.com/#/ip-address' },
    ];
  }
  if (key === 'md5') {
    urlMap = [
      { name: '腾讯安图', url: 'https://eti.qq.com/query/md5' },
      { name: 'VirusTotal', url: 'https://www.virustotal.com/#/file' },
    ];
  }
  if (key === 'domain') {
    urlMap = [
      { name: '腾讯安图', url: 'https://eti.qq.com/query/domain' },
      { name: 'VirusTotal', url: 'https://www.virustotal.com/#/domain' },
    ];
  }
  return urlMap;
};

const errorType = type => {
  switch (type) {
    case 'NOERROR':
      return {
        code: '0',
        text: '没有错误',
      };
    case 'FORMERR':
      return {
        code: '1',
        text: '格式错误',
      };
    case 'SERVFAIL':
      return {
        code: '0X2',
        text: 'DNS服务器遇到内部错误',
      };
    case 'NXDOMAIN':
      return {
        code: '0X3',
        text: '域名不存在',
      };
    case 'NOTIMP':
      return {
        code: '0X4',
        text: 'DNS服务器不支持指定的操作代码',
      };
    case 'REFUSED':
      return {
        code: '0X5',
        text: 'DNS服务器拒绝更新',
      };
    case 'YXDOMAIN':
      return {
        code: '0X6',
        text: '不应存在的域名存在',
      };
    case 'YXRRSET':
      return {
        code: '0X7',
        text: '不应存在的资源记录集不存在',
      };
    case 'NXRRSET':
      return {
        code: '0X8',
        text: '应存在的资源记录集不存在',
      };
    case 'NOTAUTH':
      return {
        code: '0X9',
        text: '不存在的区域',
      };
    case 'NOTZONE':
      return {
        code: '0XA',
        text: '域名不在指定区域中',
      };
    case 'BADVERS/BADSIG':
      return {
        code: '0XB',
        text: ' 错误版本',
      };
    case 'BADKEY':
      return {
        code: '0XC',
        text: '错误KEY值',
      };
    case 'BADTIME':
      return {
        code: '0XD',
        text: '时间错误',
      };
    case 'BADMODE':
      return {
        code: '0XE',
        text: 'MODE错误',
      };
    case 'BADNAME':
      return {
        code: '0XF',
        text: '域名错误',
      };
    default:
      return {
        code: '未知',
        text: '未知',
      };
  }
};
const attackStages = {
  外部侦查: 0,
  网络入侵: 1,
  内部侦查: 2,
  横向渗透: 3,
  恶意文件投递: 4,
  攻陷系统: 5,
};
const validateQuery = obj => {
  const newObj = {};
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i += 1) {
    const curKey = keys[i];
    if (obj[curKey] === '全部') newObj[curKey] = '';
  }
  const result = Object.assign({}, obj, newObj);
  return result;
};

// 验证ipv6
const validIpv6 = str => {
  // const reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  const reg = /^(((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?)$/;
  return reg.test(str);
};

// ipv6子网前缀
const validPreIpv6 = str => {
  const parten = /^(\d)+$/g;
  const strInt = parseInt(str, 10);
  if (parten.test(str) && strInt <= 128 && strInt >= 1) {
    return true;
  }
  return false;
};

// 验证ipv4
const isValidIP = (ip, onlyFour = true) => {
  const reSpaceCheck = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
  const threeIPReg = /^(\d+)\.(\d+)\.(\d+)$/;
  if (reSpaceCheck.test(ip)) {
    ip.match(reSpaceCheck);
    if (
      (RegExp.$1.length > 1 && RegExp.$1[0] === '0') ||
      (RegExp.$2.length > 1 && RegExp.$2[0] === '0') ||
      (RegExp.$3.length > 1 && RegExp.$3[0] === '0') ||
      (RegExp.$4.length > 1 && RegExp.$4[0] === '0')
    ) {
      return false;
    }
    if (
      RegExp.$1 <= 255 &&
      RegExp.$1 >= 0 &&
      RegExp.$2 <= 255 &&
      RegExp.$2 >= 0 &&
      RegExp.$3 <= 255 &&
      RegExp.$3 >= 0 &&
      RegExp.$4 <= 255 &&
      RegExp.$4 >= 0
    ) {
      return true;
    }
    return false;
  }
  if (threeIPReg.test(ip)) {
    if (onlyFour) {
      return false;
    }
    ip.match(threeIPReg);
    if (
      (RegExp.$1.length > 1 && RegExp.$1[0] === '0') ||
      (RegExp.$2.length > 1 && RegExp.$2[0] === '0') ||
      (RegExp.$3.length > 1 && RegExp.$3[0] === '0')
    ) {
      return false;
    }
    if (
      RegExp.$1 <= 255 &&
      RegExp.$1 >= 0 &&
      RegExp.$2 <= 255 &&
      RegExp.$2 >= 0 &&
      RegExp.$3 <= 255 &&
      RegExp.$3 >= 0
    ) {
      return true;
    }
    return false;
  }
  return false;
};

// 端口验证
const isPort = str => {
  const parten = /^(\d)+$/g;
  const strInt = parseInt(str, 10);
  if (parten.test(str) && strInt <= 65535 && strInt >= 0) {
    return true;
  }
  return false;
};

// 验证掩码位数
const isValidMaskNum = str => {
  const parten = /^(\d)+$/g;
  const strInt = parseInt(str, 10);
  if (parten.test(str) && strInt <= 32 && strInt >= 0) {
    return true;
  }
  return false;
};

// 验证 127.0.0.1/24
const validIpAndMask = (str, allowIpv6 = true) => {
  const arr = str.split('/');
  if (arr.length !== 2) {
    return false;
  }
  if (str.indexOf(':') > -1) {
    if (!allowIpv6) {
      return false;
    }
    // ipv6格式
    return validIpv6(arr[0]) && validPreIpv6(arr[1]);
  }
  // ipv4
  return isValidIP(arr[0]) && isValidMaskNum(arr[1]);
};

// 验证格式 192.168.190.103:8080--只验证ip加端口格式
const validateCcsAddr = str => {
  const arr = str.split(':');
  if (arr.length < 2) {
    return false;
  }
  if (arr.length === 2) {
    // ipv4
    return isValidIP(arr[0]) && isPort(arr[1]);
  }
  // ipv6+端口  [A01F::0]:8000
  const lastIndex = str.lastIndexOf(':');
  console.log('str[0]==', str[0], 'str[lastIndex - 1]==', str[lastIndex - 1]);
  if (str[0] === '[' && str[lastIndex - 1] === ']') {
    const tmpPort = arr[arr.length - 1];
    const tmpIp = str.substring(1, lastIndex - 1);
    console.log(589, 'str=', str, 'tmpIp==', tmpIp, 'tmpPort==', tmpPort);
    return validIpv6(tmpIp) && isPort(tmpPort);
  }
  return false;
};

// 验证格式 192.168.190.103:8080 或 192.168.190.103
const validIpPort = (str, portStyle = true, allowIpv6 = true) => {
  //  验证单独ip、还是 ip+端口，还是 ip 和ip+端口都可以？
  // portStyle 为false 就只验证ip。默认为true，即 ip 和ip+端口都可以

  if (portStyle) {
    // ip  和ip+端口都需要考虑
    const arr = str.split(':');

    if (arr.length === 1) {
      return isValidIP(str);
    }
    if (arr.length === 2) {
      // ipv4
      return isValidIP(arr[0]) && isPort(arr[1]);
    }
    if (arr.length > 2) {
      if (!allowIpv6) {
        // 不支持ipv6格式验证
        return false;
      }
      // 存在单独ipv6 和 ipv6加端口两种情况
      if (validIpv6(str)) {
        return true;
      }
      // ipv6+端口  [A01F::0]:8000
      const lastIndex = str.lastIndexOf(':');
      console.log('str[0]==', str[0], 'str[lastIndex - 1]==', str[lastIndex - 1]);
      if (str[0] === '[' && str[lastIndex - 1] === ']') {
        const tmpPort = arr[arr.length - 1];
        const tmpIp = str.substring(1, lastIndex - 1);
        console.log(589, 'str=', str, 'tmpIp==', tmpIp, 'tmpPort==', tmpPort);
        return validIpv6(tmpIp) && isPort(tmpPort);
      }
      return false;
    }
  }
  // 为false只验证ip
  if (allowIpv6) {
    return isValidIP(str) || validIpv6(str);
  }
  return isValidIP(str);
};

// 判断当前输入框内是ipv4 还是ipv6 还是 ipv4+ipv6
const checkIpCate = str => {
  let ipv4 = false;
  let ipv6 = false;
  const arr = str.split(/[,\n]/g);
  for (let i = 0; i < arr.length; i += 1) {
    const item = arr[i];
    if (item.indexOf('/') > -1) {
      const ip1 = str.split('/')[0];
      if (validIpv6(ip1)) {
        ipv6 = true;
      }
      if (isValidIP(ip1)) {
        ipv4 = true;
      }
    } else if (item.indexOf(':') > -1) {
      const ip2 = str.split(':')[0];
      if (isValidIP(ip2)) {
        ipv4 = true;
      } else {
        ipv6 = true;
      }
    } else {
      if (validIpv6(item)) {
        ipv6 = true;
      }
      if (isValidIP(item)) {
        ipv4 = true;
      }
    }
  }
  return `${ipv4 ? 'ipv4' : ''}${ipv6 ? 'ipv6' : ''}`;
};

// 验证 ip 或 ip:端口 或 ip/掩码
const validateThreeIpCate = (str, portStyle = true, maskStyle = true, allowIpv6 = true) => {
  let flag = true;
  if (str) {
    const arr = str.split(/[,\n]/g);
    for (let i = 0; i < arr.length; i += 1) {
      const item = arr[i];
      if (item.indexOf('/') > -1) {
        flag = maskStyle ? validIpAndMask(item, allowIpv6) : false;
      } else if (item.indexOf(':') > -1) {
        flag = validIpPort(item, portStyle, allowIpv6);
      } else {
        flag = isValidIP(item);
      }
      if (flag === false) {
        break;
      }
    }
  }
  return flag;
};

// ip输入框 - 支持 192.168.0.1 或 192.168.0.0/24,允许输入多个，以“,”或者换行分隔
const validateIpList = (rule, value, callback) => {
  if (value) {
    const flag = validateThreeIpCate(value, false, true);
    const arr = value.split(/[,\n]/g);
    if (flag) {
      const temp = [];
      for (let i = 0; i < arr.length; i += 1) {
        if (temp.indexOf(arr[i]) < 0) {
          temp.push(arr[i]);
        }
      }
      if (temp.length !== arr.length) {
        callback('存在重复内容，请删除');
      } else {
        callback();
      }
    } else {
      callback('ip格式有误，请重新输入');
    }
  } else {
    callback();
  }
};


// 端口输入框 - 支持 80 或 80,1-65535  允许输入多个，以“,”或者换行分隔
function validPort(rule, value, callback) {
  if (value) {
    const arr = value.split(/[,\n]/g);
    const temp = [];
    for (let i = 0; i < arr.length; i += 1) {

      if (/^(\d)+$/g.test(arr[i])) {
        const strInt = parseInt(arr[i], 10);
        if (strInt > 65535 || strInt === 0) {
          callback('端口必须在1-65535范围内');
          return
        }
        if (temp.indexOf(arr[i]) < 0) {
          temp.push(arr[i]);
        }
      }
      else if (/^(\d)+-(\d)+$/g.test(arr[i])) {
        const portRange = arr[i].split('-');
        const strInt0 = parseInt(portRange[0], 10);
        const strInt1 = parseInt(portRange[1], 10);
        if (strInt0 > 65535 || strInt0 === 0 || strInt1 > 65535 || strInt1 === 0) {
          callback('端口必须在1-65535范围内');
          return
        }
        if (temp.indexOf(arr[i]) < 0) {
          temp.push(arr[i]);
        }
      } else {
        callback('端口输入错误');
        return
      }
    }
    if (temp.length !== arr.length) {
      callback('存在重复内容，请删除');
    } else {
      callback();
    }
  } else {
    callback();
  }
};

// 单个ip 输入框
const validSingleIp = (rule, value, callback) => {
  if (value) {
    const flag = isValidIP(value) || validIpv6(value);
    if (flag) {
      callback();
    } else {
      callback('ip格式有误，请重新输入');
    }
  } else {
    callback();
  }
};

// 网段管理 支持格式 192.168.0.0/24，允许输入多个，以“,”或者换行分隔
const validateNetSeg = (rule, value, callback) => {
  if (value) {
    let flag = true;
    const arr = value.split(/[,\n]/g);
    const temp = [];
    for (let i = 0; i < arr.length; i += 1) {
      if (validIpAndMask(arr[i]) === false) {
        flag = false;
        break;
      }
      if (temp.indexOf(arr[i]) < 0) {
        temp.push(arr[i]);
      }
    }
    if (flag) {
      if (temp.length !== arr.length) {
        callback('存在重复内容，请删除');
      } else {
        callback();
      }
    } else {
      callback('格式有误，请重新输入');
    }
  } else {
    callback();
  }
};

// any, ANY, AnY,  1.2.3.4, !2.3.4.5, 1.2.3.4/24, !2.3.4.5/24, 1.2.3.4-2.3.4.5, !1.2.3.4-2.3.4.5
// 流量接入网段验证
const validateNetworkSegment = str => {
  if (str) {
    const arr = str.split(/[,\n]/g);
    const singleArr = [];
    const flagArr = [];
    arr.forEach(ipVal => {
      const ipValItem = ipVal.toLowerCase();
      if (singleArr.indexOf(ipValItem) < 0) {
        singleArr.push(ipValItem);
      }
      if (['any', 'ANY', 'Any'].indexOf(ipVal) > -1) {
        flagArr.push(true);
      } else if (ipVal.indexOf('/') > -1) {
        let ipTemp1 = ipVal;
        if (ipVal.indexOf('!') > -1) {
          ipTemp1 = ipVal.substring(1);
        }
        const res1 = validIpAndMask(ipTemp1);
        flagArr.push(res1);
        // const ipArr1 = ipTemp1.split('/');
        // if (isValidIP(ipArr1[0], true) && isValidMaskNum(ipArr1[1])) {
        //   flagArr.push(true);
        // } else {
        //   flagArr.push(false);
        // }
      } else if (ipVal.indexOf('-') > -1) {
        let ipTemp2 = ipVal;
        if (ipVal.indexOf('!') > -1) {
          ipTemp2 = ipVal.substring(1);
        }
        // console.log('ipTemp2==', ipTemp2);
        const ipArr2 = ipTemp2.split('-');
        if (
          (isValidIP(ipArr2[0]) && isValidIP(ipArr2[1])) ||
          (validIpv6(ipArr2[0]) && validIpv6(ipArr2[1]))
        ) {
          flagArr.push(true);
        } else {
          flagArr.push(false);
        }
      } else {
        let ipTemp = ipVal;
        if (ipVal.indexOf('!') > -1) {
          ipTemp = ipVal.substring(1);
        }
        const res3 = isValidIP(ipTemp) || validIpv6(ipTemp);
        flagArr.push(res3);
      }
    });
    // console.log('flagArr==', flagArr, arr);
    if (flagArr.indexOf(false) > -1) {
      return false;
    }
    if (singleArr.length !== arr.length) {
      return 'repeat';
    }
    return true;
  }
  return true;
};

// 1.2.3.4, 1.2.3.4/24, 1.2.3.4-2.3.4.5,
// 流量接入NGINX代理服务器网段 不支持any 和 非
const validateNginxNet = str => {
  if (str) {
    const arr = str.split(/[,\n]/g);
    const singleArr = [];
    const flagArr = [];
    arr.forEach(ipVal => {
      const ipValItem = ipVal.toLowerCase();
      if (singleArr.indexOf(ipValItem) < 0) {
        singleArr.push(ipValItem);
      }
      if (ipVal.indexOf('/') > -1) {
        const res1 = validIpAndMask(ipVal);
        flagArr.push(res1);
        // const ipTemp1 = ipVal;
        // const ipArr1 = ipTemp1.split('/');
        // if (isValidIP(ipArr1[0], true) && isValidMaskNum(ipArr1[1])) {
        //   flagArr.push(true);
        // } else {
        //   flagArr.push(false);
        // }
      } else if (ipVal.indexOf('-') > -1) {
        const ipTemp2 = ipVal;
        const ipArr2 = ipTemp2.split('-');
        if (
          (isValidIP(ipArr2[0]) && isValidIP(ipArr2[1])) ||
          (validIpv6(ipArr2[0]) && validIpv6(ipArr2[1]))
        ) {
          flagArr.push(true);
        } else {
          flagArr.push(false);
        }
      } else {
        const res3 = isValidIP(ipVal) || validIpv6(ipVal);
        flagArr.push(res3);
        // const ipTemp = ipVal;
        // flagArr.push(isValidIP(ipTemp, true));
      }
    });

    if (flagArr.indexOf(false) > -1) {
      return false;
    }
    if (singleArr.length !== arr.length) {
      return 'repeat';
    }
    return true;
  }
  return true;
};

// 将ipv6补全
const fullIpv6 = str => {
  // 必须先确保值是经过ipv6正则验证通过的 8组，每组16位，4个十六进制数来表示。总共128位
  if (str.length !== 39) {
    const arr = str.split('::');
    let strArr = [];
    if (arr.length === 1) {
      strArr = str.split(':');
    }
    if (arr.length === 2) {
      const before = arr[0] ? arr[0].split(':') : [];
      const after = arr[1] ? arr[1].split(':') : [];
      const needNum = 8 - (before.length + after.length);
      const needArr = [];
      for (let m = 0; m < needNum; m += 1) {
        needArr.push('0000');
      }
      strArr = before.concat(needArr, after);
    }
    const resArr = [];
    strArr.forEach(tmp => {
      const len = tmp.length;
      if (len === 4) {
        resArr.push(tmp);
      } else if (len === 3) {
        resArr.push(`0${tmp}`);
      } else if (len === 2) {
        resArr.push(`00${tmp}`);
      } else {
        resArr.push(`000${tmp}`);
      }
    });
    const resStr = resArr.join(':');
    return resStr;
  }
  return str;
};


// 名称验证
const validateEventName = (rule, value, callback) => {
  if (value) {
    const strReg = new RegExp("[`\";\\/!#$^&*=|{}%''\\[\\]<>?！#￥……&*——|{}【】‘；：”“'。，、？]");

    if (strReg.test(value)) {
      callback('名称不能包含“!#$^&*=|{}%”等非法字符');
    } else {
      callback();
    }
  } else {
    callback();
  }
};

const searchDivision = obj => {
  const { search } = obj;
  const flag = isValidIP(search, true);
  let newObj;
  if (flag) {
    newObj = Object.assign({}, obj, { ipSearch: search });
  } else {
    newObj = Object.assign({}, obj, { strSearch: search });
  }
  return newObj;
};

const msgType = type => {
  switch (type) {
    case 'sec':
      return '安全消息';
    case 'urgent_sec_event':
      return '有新的急需处理的安全事件（评分81-100）';
    case 'normal_sec_event':
      return '有新的普通安全事件（评分1-80）';
    case 'sys':
      return '系统消息';
    case 'components_exception':
      return '系统组件运行异常';
    case 'flow_exception':
      return '流量采集运行异常';
    case 'system_exception':
      return '系统（CPU、内存）使用率高于80%';
    case 'disk_exception':
      return '磁盘使用率高于80%';
    case 'report':
      return '其他';
    case 'new_report':
      return '有新的报表生成';
    case 'report_exception':
      return '报表积攒过多，系统将进行清理';
    default:
      return '';
  }
};

const msgInterval = num => {
  switch (num) {
    case 60:
      return '每分钟一次';
    case 300:
      return '每5分钟一次';
    case 3600:
      return '每小时一次';
    case 86400:
      return '每天一次';
    default:
      return '不通知';
  }
};

// 完整的域名验证
const validateDomain = value => {
  const strRegex =
    '^((https|http|ftp|rtsp|mms)?://)' +
    "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + // ftp的user@
    '(([0-9]{1,3}.){3}[0-9]{1,3}' + // IP形式的URL- 199.194.52.184
    '|' + // 允许IP和DOMAIN（域名）
    "([0-9a-z_!~*'()-]+.)*" + // 域名- www.
    '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' + // 二级域名
    '[a-z]{2,6})' + // first level domain- .com or .museum
    '(:[0-9]{1,4})?' + // 端口- :80
    '((/?)|' + // a slash isn't required if there is no file name
    "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  const re = new RegExp(strRegex);
  const flag = re.test(value);
  return flag;
};

// validateDomain => 域名验证加ipv6格式
const checkAllUrL = value => {
  const strRegex =
    '^((https|http)?://)?' +
    '((([0-9]{1,3}.){3}[0-9]{1,3})' + // IP形式的URL- 199.194.52.184
    '|' + // 下面一行为ipv6
    '(\\[*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(%.+)?\\]*)' + // ipv6
    '|' + // 下面3行合起来为DOMAIN（域名）
    "(([0-9a-z_!~*'()-]+.)*" + // 域名- www.
    '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' + // 二级域名
    '[a-z]{2,6}))' + // first level domain- .com or .museum
    '(:[0-9]{1,4})?' + // 端口- :80
    '((/?)|' + // a slash isn't required if there is no file name
    "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  const re = new RegExp(strRegex);
  return re.test(value);
};

// 接口uri
const validateUri = value => {
  const domainRegStr =
    '^((https|http|ftp|rtsp|mms)?://)' +
    "?(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?" + // ftp的user@
    '(([0-9]{1,3}.){3}[0-9]{1,3}' + // IP形式的URL- 199.194.52.184
    '|' + // 允许IP和DOMAIN（域名）
    "([0-9a-zA-Z_!~*'()-]+.)*" + // 域名- www.
    '([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z].' + // 二级域名
    '[a-zA-Z]{2,6})?' + // first level domain- .com or .museum
    '(:[0-9]{1,4})?' + // 端口- :80
    '((/?)|' + // a slash isn't required if there is no file name
    "(/?[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  const domainReg = new RegExp(domainRegStr);
  const flag = domainReg.test(value);
  return flag;
};

// 服务器地址验证 域名验证
const validateServer = str => {
  const reg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
  return reg.test(str);
};

// 自定义Ioc 域名验证
const validateIocServer = str => {
  const reg = /^(?=^.{3,255}$)[a-zA-Z0-9_][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9_][-a-zA-Z0-9]{0,62})+$/;
  return reg.test(str);
};

// 邮箱验证
const validateEmail = str => {
  const reg = /^[\w\d]+([._\\-]*[\w\d])*@([\w\d]+[-\w\d]*[\w\d]+\.){1,63}[\w\d]+$/;
  return reg.test(str);
};

// MD5验证
const validateMd5 = str => {
  const reg = /^[0-9a-fA-F]{32}$/;
  return reg.test(str);
};

// 验证mac地址
const validateMac = mac => {
  if (mac === '00:00:00:00:00:00') {
    return false;
  }
  if (mac === '11:11:11:11:11:11') {
    return false;
  }
  const reg = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/;
  return reg.test(mac);
};

// 去掉字符串首位空格，用于搜索
const trimStr = str => str.replace(/(^\s*)|(\s*$)/g, '');

// const eventScoreLevel = num => {
//   let level = 4;
//   if (num >= 1 && num <= 40) {
//     level = 1;
//   }
//   if (num >= 41 && num <= 60) {
//     level = 2;
//   }
//   if (num >= 61 && num <= 80) {
//     level = 3;
//   }
//   return level;
// };

const vmFileTypes = [
  'doc',
  'xls',
  'ppt',
  'docx',
  'dotx',
  'docm',
  'dotm',
  'xlsx',
  'xlsm',
  'xlsb',
  'xltm',
  'xlam',
  'xltx',
  'pptx',
  'potx',
  'ppsx',
  'pptm',
  'potm',
  'ppsm',
  'ps1',
  'email',
  'mht',
  'xml',
  'eml',
  'msg',
  'url',
  'swf',
  'chm',
  'jar',
  'appletjar',
  'lnk',
  'wsf',
  'js',
  'vbs',
  'bat',
  'html',
  'htm',
  'mht',
  'ace',
  'gzip',
  'exe',
  'pdf',
  'rtf',
  '7z',
  'rar',
  'sys',
  'gz',
  'bz',
  'tar',
  // 'sh',
  'msi',
  'dll',
  'zip',
  'php',
  'asp',
  'jsp',
  'cgi',
  'jspx',
  'aspx',
  'gif',
  'png',
];

// 资产类型映射
const FcategoryMap = {
  0: '其他',
  1: '服务器',
  2: '主机',
};
const ruleMap = {};

// 把数组转成map
function arrToObj(list, keyField, valueField) {
  const obj = {};
  list.forEach(item => {
    const key = item[keyField];
    const value = item[valueField];
    if (!obj[key] && key && value) {
      obj[key] = value;
    }
  });
  return obj;
}
const alarmEventValueMap = {
  strategy: arrToObj(strategyJson, 'key', 'value'),
  // intent: arrToObj(intentJson, 'Intent', '中文'),
  priority: { 0: '正常', 1: '信息', 2: '低危', 3: '中危', 4: '高危', 5: '严重' },
  status: { unhandled: '未处理', handled: '已处理', ignored: '已忽略' },
};

// 规则管理 分类 子类
const eventSubCate = {
  漏洞攻击: ['代码执行', '内存破坏', '拒绝服务', '信息泄露', '其他'],
  扫描探测: ['端口扫描', '扫描工具', '信息收集'],
  Web攻击: [
    'SQL注入',
    'XSS',
    'WebShell',
    '命令注入',
    '反弹Shell',
    '文件上传',
    '文件包含',
    '请求伪造',
    '信息泄露',
    '其他',
  ],
  僵木蠕毒: ['僵尸网络', '木马后门', '蠕虫', '病毒'],
  勒索软件: [],
  数据泄露: ['身份证', '电话号码', '银行卡', '邮箱'],
  可疑行为: [],
  DoS攻击: [],
  文件还原: [],
  流量过滤: [],
};

const alertRuleCategory = [
  // { name: '全部', value: '' },
  { name: '扫描探测', value: '扫描探测' },
  { name: 'DoS攻击', value: 'DoS攻击' },
  { name: 'Web攻击', value: 'Web攻击' },
  { name: '漏洞攻击', value: '漏洞攻击' },
  { name: '僵木蠕毒', value: '僵木蠕毒' },
  { name: '勒索软件', value: '勒索软件' },
  { name: '可疑行为', value: '可疑行为' },
  { name: '文件还原', value: '文件还原' },
  { name: '流量过滤', value: '流量过滤' },
  { name: '数据泄露', value: '数据泄露' },
];

const httpHeadList = [
  'accept',
  'accept-charset',
  'accept-encoding',
  'accept-language',
  'accept-datetime',
  'authorization',
  'cache-control',
  'cookie',
  'from',
  'max-forwards',
  'origin',
  'pragma',
  'proxy-authorization',
  'range',
  'te',
  'via',
  'x-requested-with',
  'dnt',
  'x-forwarded-proto',
  'x-authenticated-user',
  'x-flash-version',
  'accept-range',
  'age',
  'allow',
  'connection',
  'content-encoding',
  'content-language',
  'content-length',
  'content-location',
  'content-md5',
  'content-range',
  // "content-type",
  'date',
  'etag',
  'expires',
  'last-modified',
  'link',
  'location',
  'proxy-authenticate',
  'referrer',
  'refresh',
  'retry-after',
  'server',
  'set-cookie',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'vary',
  'warning',
  'www-authenticate',
];

const getEventDetailRoute = category => {
  let path = '';
  switch (category) {
    case '入侵感知':
      path = '/event/safeEvent/alarmAlert';
      break;
    case '失陷感知':
      path = '/event/safeEvent/alarmIoc';
      break;
    case '异常文件感知':
      path = '/event/safeEvent/alarmFile';
      break;
    default:
      break;
  }
  return path;
};

const topCity = ['北京市', '天津市', '上海市', '重庆市'];

// 资产相关展示内容中文映射
const assetValueMap = {
  Fcategory: {
    1: '未知设备',
    2: '服务器',
    3: '办公机',
    4: '移动设备',
    5: 'IOT设备',
    6: '安全设备',
    7: '路由交换设备',
  },
  FcategoryTypes: [
    { text: '未知设备', value: 1 },
    { text: '服务器', value: 2 },
    { text: '办公机', value: 3 },
    { text: '移动设备', value: 4 },
    { text: 'IOT设备', value: 5 },
    { text: '安全设备', value: 6 },
    { text: '路由交换设备', value: 7 },
  ],
  AI_Falert_mode_Types: [
    { text: '阈值测算', value: 'threshold' },
    { text: 'AI测算', value: 'ai_baseline' },
    { text: '观察模式', value: 'observe' },
  ],
  Fsource: {
    1: '自动发现',
    2: '手动添加',
  },
  Fstatus: {
    0: '注销',
    1: '存在',
    2: '忽略',
  },
  Fos_types: [
    { key: '未知类型', value: '未知类型' },
    { key: 'OS_WINDOWS', value: 'OS_WINDOWS' },
    { key: 'OS_WINDOWS_XP', value: 'OS_WINDOWS_XP' },
    { key: 'OS_WINDOWS_VISTA', value: 'OS_WINDOWS_VISTA' },
    { key: 'OS_WINDOWS_7', value: 'OS_WINDOWS_7' },
    { key: 'OS_WINDOWS_8', value: 'OS_WINDOWS_8' },
    { key: 'OS_WINDOWS_10', value: 'OS_WINDOWS_10' },
    { key: 'OS_WINDOWS_ME', value: 'OS_WINDOWS_ME' },
    { key: 'OS_WINDOWS_RT', value: 'OS_WINDOWS_RT' },
    { key: 'OS_WINDOWS_2000', value: 'OS_WINDOWS_2000' },
    { key: 'OS_WINDOWS_NT_40', value: 'OS_WINDOWS_NT_40' },
    { key: 'OS_WINDOWS_CE', value: 'OS_WINDOWS_CE' },
    { key: 'OS_WINDOWS_3_1', value: 'OS_WINDOWS_3_1' },
    { key: 'OS_WINDOWS_9_5', value: 'OS_WINDOWS_9_5' },
    { key: 'OS_WINDOWS_PHONE', value: 'OS_WINDOWS_PHONE' },
    { key: 'OS_WINDOWS_MOBILE', value: 'OS_WINDOWS_MOBILE' },
    { key: 'OS_LINUX', value: 'OS_LINUX' },
    { key: 'OS_DEBIAN', value: 'OS_DEBIAN' },
    { key: 'OS_SOLARIS', value: 'OS_SOLARIS' },
    { key: 'OS_RED_HAT', value: 'OS_RED_HAT' },
    { key: 'OS_FREEBSD', value: 'OS_FREEBSD' },
    { key: 'OS_IOS', value: 'OS_IOS' },
    { key: 'OS_IOS_1', value: 'OS_IOS_1' },
    { key: 'OS_IOS_3', value: 'OS_IOS_3' },
    { key: 'OS_IOS_4', value: 'OS_IOS_4' },
    { key: 'OS_IOS_5', value: 'OS_IOS_5' },
    { key: 'OS_IOS_6', value: 'OS_IOS_6' },
    { key: 'OS_IOS_7', value: 'OS_IOS_7' },
    { key: 'OS_IOS_8', value: 'OS_IOS_8' },
    { key: 'OS_IOS_9', value: 'OS_IOS_9' },
    { key: 'OS_IOS_10', value: 'OS_IOS_10' },
    { key: 'OS_IOS_11', value: 'OS_IOS_11' },
    { key: 'OS_IOS_12', value: 'OS_IOS_12' },
    { key: 'OS_MACOS', value: 'OS_MACOS' },
    { key: 'OS_MACOS_X', value: 'OS_MACOS_X' },
    { key: 'OS_MACOS_X_10', value: 'OS_MACOS_X_10' },
    { key: 'OS_WATCHOS', value: 'OS_WATCHOS' },
    { key: 'OS_TVOS', value: 'OS_TVOS' },
    { key: 'OS_SAMSUNG', value: 'OS_SAMSUNG' },
    { key: 'OS_SYMBIAN', value: 'OS_SYMBIAN' },
    { key: 'OS_NOKIA', value: 'OS_NOKIA' },
    { key: 'OS_BLACKBERRY', value: 'OS_BLACKBERRY' },
    { key: 'OS_ANDROID', value: 'OS_ANDROID' },
    { key: 'OS_FIREFOX', value: 'OS_FIREFOX' },
    { key: 'OS_CHROME_OS', value: 'OS_CHROME_OS' },
  ],
  Fis_registered: {
    0: '未注册',
    1: '已注册',
  },
};

export default {
  topCity,
  getEventDetailRoute,
  validateUri,
  pageSizeOptions,
  statusMap,
  roleMap,
  scoreColorMap,
  scoreTagMap,
  aptUpScoreTagMap,
  scoreFilterListShow,
  attackStageMap,
  ruleMap,
  severityLabel,
  confidenceLabel,
  validateQuery,
  isValidIP,
  validateThreeIpCate,
  validateMd5,
  searchDivision,
  errorType,
  tagsListData,
  trimStr,
  attackStages,
  msgType,
  msgInterval,
  isPort,
  validateEmail,
  validateServer,
  validateIocServer,
  validIpAndMask,
  validateMac,
  FcategoryMap,
  // eventScoreLevel,
  validateCcsAddr,
  urlKey,
  scoreRangeMap,
  validateNetworkSegment,
  bytesToSize,
  fileStatusMap,
  fileStatusTag,
  ipsNoRepeat,
  portsNoRepeat,
  vmFileTypes,
  alarmEventValueMap,
  validateDomain,
  httpHeadList,
  validateNginxNet,
  eventSubCate,
  alertRuleCategory,
  validIpv6,
  checkAllUrL,
  validateIpList,
  validateNetSeg,
  validSingleIp,
  assetValueMap,
  fullIpv6,
  checkIpCate,
  validateEventName,
  alertMode,
  validPort,
  confidenceOpetion
};
