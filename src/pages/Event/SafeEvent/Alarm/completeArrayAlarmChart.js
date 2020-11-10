/* eslint-disable  no-underscore-dangle */
// import _ from 'lodash';

/**
 * 根据攻击意图补全数组
 * @param {*} data 接口 返回数据
 * @param {*} typeList  已有的意图
 *
 */

export default function completeArray(buckets = [], intent, timeRange) {
    // 固定顺序的key，产品要求
    const { startTime, endTime } = timeRange;
    const sortedTitles = Object.keys(intent).map(key => intent[key]);
    const typeList = []; // 有数据的type
    const handledList = [];
    let rawData = [];
    // console.log('buckets', buckets);
    buckets.forEach((element, index) => {
        typeList.push({ title: intent[element.key], count: element.doc_count });
        element.eventNums.buckets.forEach(item => {
            handledList.push({
                type: intent[element.key],
                time: item.key,
                eventNum: item.doc_count,
            });
        });
        if (index === 0) {
            rawData = [].concat(handledList);
        }
    });
    if (buckets.length === 0) {
        // rawData
        const interval = Math.floor((endTime - startTime) / 50);
        for (let i = 0; i < 50; i += 1) {
            const time = startTime + i * interval;
            rawData.push({ type: '系统失陷', time, eventNum: 0 });
        }
    }
    // 补全的type
    const newTypeList = [].concat(typeList);
    const existTypeList = typeList.map(item => item.title);
    const needFillType = [];
    Object.keys(intent).forEach(key => {
        if (!existTypeList.includes(intent[key])) {
            needFillType.push(intent[key]);
        }
    });
    // console.log('exit', existTypeList, needFillType);
    let result = [].concat(handledList); // 补全后的数据
    needFillType.forEach(type => {
        newTypeList.push({ title: type, count: 0 });
        // 缺失type的补充数据
        const list = rawData.map(raw => ({
            type,
            eventNum: 0,
            time: raw.time,
        }));
        result = result.concat(list);
    });
    const sortedTypeList = sortedTitles.map(title => {
        const obj = newTypeList.filter(item => item.title === title)[0];
        return obj;
    });
    // console.log('result', result);
    let sortedList = [];
    sortedTitles.forEach(title => {
        const arr = result.filter(item => item.type === title);
        sortedList = sortedList.concat(arr);
    });
    return { typeList: sortedTypeList, list: sortedList };
}
