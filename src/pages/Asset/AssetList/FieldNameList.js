/* eslint-disable react/react-in-jsx-scope */
import moment from 'moment';
import { Popover } from 'antd';
import configSettings from '../../../configSettings';
// import handleFousrce from '../../../tools/handleFsource';
import styles from './AssetList.less';

const { assetValueMap } = configSettings;
const format = 'YYYY-MM-DD HH:mm:ss';

// 总字段列表
const assetFields = [
  { key: 'Fip', title: 'IP', sort: true },
  { key: 'Fmac', title: 'MAC' },
  { key: 'Fvpcid', title: 'VPCID' },
  { key: 'Fport', title: '端口' },
  { key: 'Fgroup', title: '分组', checkedFlag: 'Fgid' },
  { key: 'Fasset_name', title: '名称' },
  { key: 'Fcategory', title: '类型' },
  { key: 'Fos_type', title: '操作系统' },
  { key: 'Fsource', title: '来源' },
  { key: 'Fevent_count', title: '今日事件数', sort: false, },
  { key: 'Fupdate_time', title: '更新时间', sort: true ,width:"250px"},
  { key: 'Finsert_time', title: '注册时间', sort: true },
];
// 筛选栏默认展示key
const defaultFilterListKey = [
  'Fip', // IP
  'Fmac', // MAC
  'Fvpcid', // vpcid
  'Fgroup', // 分组
  'Fasset_name', // 资产名称
  'Fcategory', // 资产类型
  'Fsource', // 资产来源
  'Fos_type', // 操作系统
];
const defaultColumnKeys = [
  'Fip', // IP
  'Fmac', // MAC
  'Fvpcid', // vpcid
  'Fevent_count', // 事件数
  'Fgroup', // 分组
  'Fasset_name', // 资产名称
  'Fcategory', // 资产类型
  'Fsource', // 资产来源
  'Finsert_time', // 插入时间
  'Fupdate_time', // 更新时间
];
// Flast_alarm_time 最近告警时间
const timeKey = ['Fupdate_time', 'Finsert_time'];
const notInFilterKey = ['Fupdate_time', 'Finsert_time', 'Fevent_count'];
// const interFaceKeys = ['Finner_ip', 'Fmac', 'Fport', 'Fdomain'];
// eslint-disable-next-line import/no-mutable-exports
function customSort(orderList, originList) {
  const orderedList = [];
  orderList.forEach(key => {
    const obj = originList.find(item => item.key === key);
    if (obj) {
      orderedList.push(obj);
    }
  });
  return orderedList;
}

const columnRender = item => {
  let render;
  render = (text) => {
    if (Array.isArray(text)) {
      const popContent = (
        <div>
          {text.map(str => (
            <p key={str}>{assetValueMap[item.key] ? assetValueMap[item.key][str] : str}</p>
          ))}
        </div>
      );
      return (
        <div>
          {text.length > 1 ? (
            <Popover
              content={popContent}
              getPopupContainer={triggerNode => triggerNode}
              placement="bottomLeft"
              title={item.title}
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
    if (timeKey.includes(item.key)) {
      return text && text !== '0000-00-00 00:00:00' && text ? (
        <div style={{ minWidth: '130px' }}>{moment(text).format(format)}</div>
      ) : (
        '暂无'
      );
    }
    const str = assetValueMap[item.key] ? assetValueMap[item.key][text] : text;
    return <span className="breakall">{str}</span>;
  };

  if (item.key === 'Fos_type' || item.key === 'Fport') {
    render = text => {
      const values = text.split(',').filter(value => value !== '');
      const popContent = (
        <div>
          {values.map(keytext => (
            <p key={keytext}>{keytext}</p>
          ))}
        </div>
      );
      return (
        <div>
          {values.length > 1 ? (
            <Popover
              content={popContent}
              getPopupContainer={triggerNode => triggerNode}
              placement="bottomLeft"
            >
              <p>
                多个( <span className="fontBlue"> {values.length} </span>)
              </p>
            </Popover>
          ) : (
            <p>{values[0] ? values[0] : ''}</p>
          )}
        </div>
      );
    };
  }

  if (item.key === 'Fgroup') {
    render = (text, record) => <span>{record.Fgroup_name}</span>;
  }
  if (item.key === 'Fevent_count') {
    render = text => <span className={styles.event_count}>{text}</span>;
  }

  return render;
};

// 获取显示的筛选栏和table列
function setShowList(columnKey, filterKey) {
  // 默认显示的筛选栏列表
  let filterDefaultList = [];
  // 默认显示的字段列表
  let columnDefaultList = [];
  assetFields.forEach(item => {
    const render = {};
    // const hasFtags = columnKey.indexOf('Ftags') > -1;
    // const filterRender = text => (assetValueMap[item.key] ? assetValueMap[item.key][text] : text);
    render.render = columnRender(item);
    if (columnKey.includes(item.key)) {
      const obj = {
        title: item.title,
        dataIndex: item.key,
        key: item.key,
        sorter: item.sort,
        width: 140,
      };
      // if (item.key === 'Fgroup') {
      //   obj.width = 220;
      // }
      columnDefaultList.push(Object.assign(obj, render));
    }
    if (filterKey.includes(item.key)) {
      render.render = text => {
        const str = assetValueMap[item.key] ? assetValueMap[item.key][text] : text;
        return str;
      };
      filterDefaultList.push(Object.assign(item, render));
    }
  });
  filterDefaultList = customSort(filterKey, filterDefaultList);
  columnDefaultList = customSort(columnKey, columnDefaultList);
  // const interFaceColumn = showInterFace(columnKey, interFaceKeys);
  // columnDefaultList.splice(5, 0, interFaceColumn);
  return { filterDefaultList, columnDefaultList };
}

export {
  assetFields,
  defaultFilterListKey,
  defaultColumnKeys,
  setShowList,
  columnRender,
  // showInterFace,
  // interFaceKeys,
  timeKey,
  notInFilterKey,
};
