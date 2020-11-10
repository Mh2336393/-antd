// 用于所有的ip校验
/* eslint-disable no-useless-escape */

// 验证ip
const isValidIP = ip => {
  const reSpaceCheck = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
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
  return false;
};

// 验证形如 192.168.0.0/24类型的ip
const isValidIpMask = ipMask => {
  const ipMaskCheck = /^(\d+)\.(\d+)\.(\d+).(\d+)\/(\d+)$/;
  if (ipMaskCheck.test(ipMask)) {
    ipMask.match(ipMaskCheck);
    if (
      (RegExp.$1.length > 1 && RegExp.$1[0] === '0') ||
      (RegExp.$2.length > 1 && RegExp.$2[0] === '0') ||
      (RegExp.$3.length > 1 && RegExp.$3[0] === '0') ||
      (RegExp.$4.length > 1 && RegExp.$4[0] === '0') ||
      (RegExp.$5.length > 1 && RegExp.$5[0] === '0')
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
      RegExp.$4 >= 0 &&
      RegExp.$5 <= 32 &&
      RegExp.$5 >= 0
    ) {
      return true;
    }
    return false;
  }
  return false;
};

// 校验子ip/掩码是否正确
const handleConfirmChildIp = (value, callback, type) => {
  if (type === 'all') {
    if (/-/.test(value)) {
      const ipList = value.split('-');
      for (let j = 0; j < ipList.length; j += 1) {
        if (!isValidIP(ipList[j])) {
          callback('ip输入格式不正确！');
        }
      }
    } else if (!isValidIpMask(value) && !isValidIP(value)) {
      callback('ip输入格式不正确！');
    }
  } else if (!isValidIpMask(value)) {
    callback('ip输入格式不正确！');
  }
};

/**
 * 功能如：校验ip/掩码是否输入正确
 * @param {String} value 要进行校验的ip输入值
 * @param {Object} callback antDesign中表单校验时的回调函数
 * @param {String} type 值为all时，支持普通ip，ip掩码，形如192.168.0.1-192.168.2.2的ip。否则仅支持后两者的ip校验
 */
const handleConfirmIp = (value, callback, type) => {
  if (value) {
    if (/[^,\d\.\/\n]/.test(value)) {
      callback('ip输入格式不正确！');
    }
    let ipArr = [];
    const tmpVal = value.replace(/\n/g, ',');
    if (/\n/.test(value)) {
      ipArr = tmpVal.split(',');
    } else if (/,/.test(value)) {
      ipArr = value.split(',');
    }
    if (ipArr.length > 0) {
      for (let i = 0; i < ipArr.length; i += 1) {
        handleConfirmChildIp(ipArr[i], callback, type);
      }
    } else {
      handleConfirmChildIp(value, callback, type);
    }
  }
  // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
  callback();
};

export default handleConfirmIp;
