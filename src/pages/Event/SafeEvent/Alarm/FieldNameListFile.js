import { Popover } from 'antd';
// import { Link } from 'umi';
import moment from 'moment';
import fieldJson from './fieldFile.json';
import configSettings from '../../../../configSettings';
// import styles from '../index.less';

/* eslint-disable camelcase */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */

const { alarmEventValueMap } = configSettings;
const format = 'YYYY-MM-DD HH:mm:ss';
const formatDate = 'YYYY-MM-DD';
const formatTime = 'HH:mm:ss';
const timeKey = ['timestamp', 'tsLatest'];

// 总字段列表
const canOrderList = [];
// { title: '日志源IP', key: 'logsource_ip', sort: true },
const list = fieldJson.filter((item) => item['字段名ZH']);
const fieldNameList = list.map((item) => {
  const obj = {
    key: item['字段名称'],
    title: item['字段名ZH'],
  };
  if (item['GroupBy/OrderBy'] === 'Y') {
    canOrderList.push(obj);
    obj.sort = true;
  }
  return obj;
});

// 筛选栏默认展示key
const defaultFilterListKey = [
  'status',
  'attackStage',
  'score',
  'category_2',
  'name',
  'attackResult',
  'fileName',
  'fileType',
  'virusName',
  'appProtocol',
  'src.ip',
  'dst.ip',
  'src.port',
  'dst.port',
];
// 默认显示字段key
const defaultColumnKeys = [
  'tsLatest',
  'name',
  'md5',
  'fileName',
  'src.ip',
  'dst.ip',
  'virusName',
  // 'affectedAssets.ip',
  // 'attackStage',
  // 'originalIds',
  'score',
  // 'status',
];

function customSort(orderList, originList) {
  const orderedList = [];
  orderList.forEach((key) => {
    const obj = originList.find((item) => item.key === key);
    if (obj) {
      orderedList.push(obj);
    }
  });
  return orderedList;
}
function columnRender(itemObj, fixTableRender = {}) {
  if (fixTableRender[itemObj.key]) {
    return fixTableRender[itemObj.key];
  }
  return (text, record) => {
    // console.log('text==', text, 'itemObj==', itemObj);
    if (Array.isArray(text)) {
      const popContent = (
        <div className="popContentWrap" style={{ maxHeight: '150px' }}>
          {text.map((item) => (
            <p key={item}>
              {alarmEventValueMap[itemObj.key] ? alarmEventValueMap[itemObj.key][item] : item}
            </p>
          ))}
        </div>
      );
      // return JSON.stringify(text);
      return (
        <div>
          {text.length > 1 ? (
            <Popover
              content={popContent}
              getPopupContainer={(triggerNode) => triggerNode}
              placement="bottomLeft"
              title={itemObj.title}
            >
              <p>
                多个( <span className="fontBlue"> {text.length} </span>)
              </p>
            </Popover>
          ) : (
            <p> {text[0] ? text[0] : ''} </p>
          )}
        </div>
      );
    }
    if (timeKey.includes(itemObj.key)) {
      return (
        <div style={{ whiteSpace: 'noWrap' }}>
          {/* <div>{moment(text).format(format)}</div> */}
          <div>{moment(text).format(formatDate)}</div>
          <div>{moment(text).format(formatTime)}</div>
        </div>
      );
    }
    const str = alarmEventValueMap[itemObj.key] ? alarmEventValueMap[itemObj.key][text] : text;
    return <span className="breakall">{str}</span>;
  };
}
// 获取显示的筛选栏和table列
function setShowList(columnKey, filterKey, fixTableRender = {}) {
  // 默认显示的筛选栏列表
  let filterDefaultList = [];
  // 默认显示的字段列表
  let columnDefaultList = [];
  fieldNameList.forEach((item) => {
    const render = {};
    if (fixTableRender[item.key]) {
      render.render = fixTableRender[item.key];
    } else {
      render.render = columnRender(item);
    }
    if (columnKey.includes(item.key)) {
      const obj = {
        title: item.title,
        dataIndex: item.key,
        key: item.key,
        sorter: item.sort,
        // width: 140,
      };
      columnDefaultList.push(Object.assign(obj, render));
    }
    if (filterKey.includes(item.key)) {
      render.render = (text) => {
        if (timeKey.includes(item.key)) {
          return moment(text).format(format);
        }
        const str = alarmEventValueMap[item.key] ? alarmEventValueMap[item.key][text] : text;
        return str;
      };
      filterDefaultList.push(Object.assign(item, render));
    }
  });
  filterDefaultList = customSort(filterKey, filterDefaultList);
  columnDefaultList = customSort(columnKey, columnDefaultList);
  return { filterDefaultList, columnDefaultList };
}
// columnDefaultList.push(action);
export {
  fieldNameList,
  defaultFilterListKey,
  defaultColumnKeys,
  setShowList,
  canOrderList,
  columnRender,
  timeKey,
};
