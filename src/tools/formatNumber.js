/**
 * 功能如：将“10000”格式化成“10.000”
 * @param {Number} num 要格式化的整型number
 * @param {String} operator 格式化Num的连接符, 默认是“,”
 */
export default function formatNumber(numInput, operator = ',') {
  const num = numInput.toString();
  if (num.length <= 3) return num;
  let count = 0;
  if (num.length % 3 === 0) {
    count = num.length / 3;
  } else {
    count = (num.length - (num.length % 3)) / 3;
  }
  let text = '';
  for (let i = 0; i < count; i += 1) {
    if ((count - i - 1) * 3 + (num.length % 3) !== 0) {
      text = operator + num.slice((count - i - 1) * 3 + (num.length % 3), (count - i - 1) * 3 + (num.length % 3) + 3) + text;
    } else {
      text = num.slice((count - i - 1) * 3 + (num.length % 3), (count - i - 1) * 3 + (num.length % 3) + 3) + text;
    }
  }
  return num.slice(0, num.length % 3) + text;
}

function numberTransform(num) {
  let str = '';
  const day = parseInt(num / 24 / 60 / 60, 10);
  const hour = parseInt((num - day * 24 * 60 * 60) / 60 / 60, 10);
  const mins = parseInt((num - day * 24 * 60 * 60 - hour * 60 * 60) / 60, 10);
  str = `${day}天${hour}小时${mins}分`;
  return str;
}

export { numberTransform };
