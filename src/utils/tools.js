function checktype(type, val) {
  // console.log('type',type,value);
  const reg = {
    ip: (
      value // return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i.test(value);
    ) =>
      /^(?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/i.test(
        value
      ) ||
      /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(
        value
      ),
    port: value => /^[\d,]+$/.test(value) && value <= 65535 && value >= 0,
    number: value => /^[-+]?(\d+|\d+\.\d*|\d*\.\d+)$/.test(value),
    mac: value => /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/.test(value),
  };

  if (!reg[type]) {
    // console.log('invalid type:' + type);
    return false;
  }

  return reg[type].call(null, val);
}
function checkIp(value) {
  return checktype('ip', value);
}
function checkMac(value) {
  return checktype('mac', value);
}
function checkPort(value) {
  return checktype('port', value);
}

export function validatePortArr(str) {
  if (str) {
    const srtArr = str.split(/[,\n]/g);
    const arr = srtArr.filter(item => item !== '');
    const singleArr = [];
    const flagArr = [];
    arr.forEach(portVal => {
      if (singleArr.indexOf(portVal) < 0) {
        singleArr.push(portVal);
      }
      if (
        /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(
          portVal,
        )
      ) {
        flagArr.push(true);
      } else {
        flagArr.push(false);
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
}
export default { checkIp, checkMac, checkPort };
