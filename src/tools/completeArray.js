/* eslint-disable  no-underscore-dangle */
import _ from 'lodash';
import moment from 'moment';
import configSettings from '../configSettings';
/**
 * 根据攻击意图补全数组
 * @param {*} data 接口 返回数据
 * @param {*} typeList  已有的意图
 *
 */

export default function completeArray(buckets) {
  const { attackStages } = configSettings;
  const typeList = []; // 有数据的type
  const handledList = [];
  let rawData = [];
  buckets.forEach((element, index) => {
    typeList.push({ title: element.key, count: element.doc_count });
    element.eventNums.buckets.forEach(item => {
      handledList.push({
        // [`type${attackStages[element.key]}`]: element.key,
        // time: moment(item.key).format('YYYY-MM-DD HH:mm:ss'),
        type: element.key,
        time: item.key,
        eventNum: item.doc_count,
      });
    });
    if (index === 0) {
      rawData = [].concat(handledList);
    }
  });

  const newTypeList = [].concat(typeList); // 补全的type
  const existTypeList = typeList.map(item => item.title);
  const needFillType = _.difference(Object.keys(attackStages), existTypeList);

  let result = [].concat(handledList); // 补全后的数据
  needFillType.forEach(type => {
    newTypeList.push({ title: type, count: 0 });

    // 缺失type的补充数据
    const list = rawData.map(raw => ({
      // [`type${attackStages[type]}`]: type,
      type,
      eventNum: 0,
      time: raw.time,
    }));
    result = result.concat(list);
  });
  const sortedTypeList = Object.keys(attackStages).map(key => {
    const obj = newTypeList.filter(item => item.title === key)[0];
    return obj;
  });
  return { typeList: sortedTypeList, list: result };
}
