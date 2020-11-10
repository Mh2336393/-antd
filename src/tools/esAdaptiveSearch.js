// 该文件功能：用于搜索模块，实现直方图搜索时间自适应
// 聚合粒度到x轴的名称以及展示格式,对应的时间戳（单位ms）范围的映射.(聚合粒度大于day的不能随意取值)
const intervalFormatMapping = {
  '1s': { format: 'HH:mm:ss', xAxisName: 'timestamp 每秒', timestampRange: 1000 }, // 最低的聚合间隔（0，2分钟）,1s对应的时间戳为1000，下面一次类推
  '5s': { format: 'HH:mm:ss', xAxisName: 'timestamp 每5秒', timestampRange: 5000 }, // 最低的聚合间隔（2分钟，8分钟]
  '30s': { format: 'HH:mm:ss', xAxisName: 'timestamp 每30秒', timestampRange: 30000 }, // 时间范围 (8分钟，50分钟]
  '1m': { format: 'HH:mm', xAxisName: 'timestamp 每分钟', timestampRange: 60000 }, // 时间范围 (50分钟，2小时]
  '5m': { format: 'HH:mm', xAxisName: 'timestamp 每5分钟', timestampRange: 300000 }, // 时间范围 (2小时，8小时]
  '30m': { format: 'HH:mm', xAxisName: 'timestamp 每30分钟', timestampRange: 1800000 }, // 时间范围 (8小时，2天]
  '3h': { format: 'YYYY-MM-DD HH:mm', xAxisName: 'timestamp 每3小时', timestampRange: 10800000 }, // 时间范围 (2天，15天]
  '12h': { format: 'YYYY-MM-DD HH:mm', xAxisName: 'timestamp 每12小时', timestampRange: 43200000 }, // 时间范围 (15天，2个月]
  '1d': { format: 'YYYY-MM-DD', xAxisName: 'timestamp 每天', timestampRange: 86400000 }, // 时间范围 (2个月，3个月]
  '5d': { format: 'YYYY-MM-DD', xAxisName: 'timestamp 每5天', timestampRange: 432000000 }, // 时间范围 (3个月，16个月]
  '1w': { format: 'YYYY-MM-DD', xAxisName: 'timestamp 每周', timestampRange: 604800000 }, // 时间范围 (16个月，2年]
  '1M': { format: 'YYYY-MM-DD', xAxisName: 'timestamp 每月', timestampRange: 2592000000 }, // 时间范围 (2年，10年]
  '1y': { format: 'YYYY-MM-DD', xAxisName: 'timestamp 每年', timestampRange: 31104000000 }, // 时间范围 (10年，无穷]
};
/**
 * 功能：下钻的时间戳范围到聚合粒度大小的映射
 * @param {timestampRange} num 直方图下钻的时间范围
 */
const timeRangeToItervalMapping = timestampRange => {
  switch (true) {
    case timestampRange >= 0 && timestampRange <= 120000:
      return '1s';
    case timestampRange > 120000 && timestampRange <= 480000:
      return '5s';
    case timestampRange > 480000 && timestampRange <= 3000000:
      return '30s';
    case timestampRange > 3000000 && timestampRange <= 7200000:
      return '1m';
    case timestampRange > 7200000 && timestampRange <= 28800000:
      return '5m';
    case timestampRange > 28800000 && timestampRange <= 172800000:
      return '30m';
    case timestampRange > 172800000 && timestampRange <= 1296000000:
      return '3h';
    case timestampRange > 1296000000 && timestampRange <= 5184000000:
      return '12h';
    case timestampRange > 5184000000 && timestampRange <= 7776000000:
      return '1d';
    case timestampRange > 7776000000 && timestampRange <= 41472000000:
      return '5d';
    case timestampRange > 41472000000 && timestampRange <= 63072000000:
      return '1w';
    case timestampRange > 63072000000 && timestampRange <= 315360000000:
      return '1M';
    default:
      return '1y';
  }
};

export default {
  timeRangeToItervalMapping,
  intervalFormatMapping,
};
