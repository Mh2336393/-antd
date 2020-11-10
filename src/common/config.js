const assetNameMap = {
    0: '未知IT资产',
    1: '服务器',
    2: '网络设备',
    3: '安全设备',
    4: '终端设备',
    5: '存储设备',
    6: 'IOT设备',
};
const deviceSource = ['流量发现', '御点同步', '御见录入', '织云CMDB同步', '日志发现(设备)', '日志发现(云镜)', '日志发现(御点)'];

// const deviceSource = {
//   0: '未知来源',
//   1: '流量发现',
//   2: '御点同步',
//   3: '御见录入',
//   4: '织云CMDB同步',
//   5: '设备日志',
// };
const assetCataMap = {
    0: 'IT资产',
    1: '应用资产',
    2: '人员资产',
    3: '业务资产',
    4: '数据资产',
    5: '流程资产',
};
const assetStatus = {
    0: '废弃',
    1: '启用',
    2: '忽略',
    3: '停用',
};
const ruleTypeList = {
    1: '网络攻击 ',
    2: '侦查事件',
    3: '僵木蠕毒',
    4: '策略违规',
    5: '可疑活动',
    6: '用户认证',
    7: '应用相关',
};
const moduleMap = {
    streaming: '关联规则',
    ioc: '威胁情报',
    ml: '机器学习',
    streaming_user_defined: '日志过滤',
    host_traffic: '流量基线',
};
const directionMap = {
    lan2wan: '本地到外部',
    lan2lan: '本地到本地',
    wan2lan: '外部到本地',
    wan2wan: '外部到外部',
};
const numToModuleMap = {
    1: '关联规则',
    2: '威胁情报',
    3: '机器学习',
    4: '日志过滤',
    5: '流量基线',
};
const numToDirectionMap = {
    1: '本地到本地',
    2: '本地到外部',
    3: '外部到本地',
    4: '外部到外部',
};
const onlineNameMap = {
    online: '在线资产',
    offline: '离线资产',
};
const devStatus = {
    0: '废弃',
    1: '启用',
    2: '忽略',
    3: '停用',
};
const abnormalNameMap = {
    abnormal: '异常资产',
    normal: '正常资产',
};
const levelTypeMap = {
    1: '低',
    2: '中',
    3: '高',
    4: '紧急',
};
const roleMap = {
    1: '超级管理员',
    2: '系统管理员',
    3: '审计员',
    4: '租户',
};
const threatLevel = ['', '信息', '低', '中', '高', '严重'];
const confidenceLevel = ['', '可能', '较可信', '可信', '确信', '准确'];
const detectType = {
    rule: '规则感知',
    ueba: '智能感知',
};
const scoreColorTextMap = score => {
    switch (true) {
        case score > 40 && score <= 60:
            return { text: '中危', color: '#5075ff', level: 2 };
        case score > 61 && score <= 80:
            return { text: '高危', color: '#f6a70a', level: 3 };
        case score > 81 && score <= 100:
            return { text: '严重', color: '#ff4056', level: 4 };
        default:
            return { text: '低危', color: '#52c41a', level: 1 };
    }
};

export {
    assetNameMap,
    deviceSource,
    ruleTypeList,
    devStatus,
    assetCataMap,
    assetStatus,
    onlineNameMap,
    abnormalNameMap,
    levelTypeMap,
    roleMap,
    moduleMap,
    numToModuleMap,
    numToDirectionMap,
    directionMap,
    threatLevel,
    confidenceLevel,
    detectType,
    scoreColorTextMap,
    // fieldNameList,
};
