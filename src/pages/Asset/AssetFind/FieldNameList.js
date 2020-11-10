/* eslint-disable react/react-in-jsx-scope */
import moment from 'moment';
import { Popover } from 'antd';
import configSettings from '../../../configSettings';
// import handleFousrce from '../../../tools/handleFsource';
import styles from './index.less';

const { assetValueMap } = configSettings;
const format = 'YYYY-MM-DD HH:mm:ss';
function formatNum(num) {
  if (num >= 0 && num < 1024) {
    return `${num}B`;
  }
  if (num >= 1024 && num < 1024 * 1024) {
    return `${(num / 1024).toFixed(2)}KB`;
  }

  if (num >= 1024 * 1024 && num < 1024 * 1024 * 1024) {
    return `${(num / 1024 / 1024).toFixed(2)}MB`;
  }

  if (num >= 1024 * 1024 * 1024) {
    return `${(num / 1024 / 1024 / 1024).toFixed(2)}GB`;
  }
}

// 总字段列表
const assetFields = [
  { key: 'Fip', title: 'IP', sort: true },
  { key: 'Fmac', title: 'MAC' },
  { key: 'Fvpcid', title: 'VPCID' },
  { key: 'Fport', title: '端口' },
  { key: 'Fflow_source', title: '来源探针' },
  // { key: 'Fis_registered', title: '是否注册' },
  { key: 'Fis_dhcp', title: 'DHCP网段资产' },
  { key: 'Fserver_type', title: '服务' },
  { key: 'Fos_type', title: '操作系统' },
  { key: 'Fhost_name', title: '主机名' },
  { key: 'Frecv_bytes', title: '接受数据量', sort: true },
  { key: 'Fsend_bytes', title: '发送数据量', sort: true },
  { key: 'Fcomponent_info', title: '组件' },
  { key: 'Fdomain_name', title: '域名' },
  { key: 'Fevent_count', title: '今日事件数' },
  { key: 'Fupdate_time', title: '更新时间', sort: true },
  { key: 'Finsert_time', title: '发现时间', sort: true },
];
// 筛选栏默认展示key
const defaultFilterListKey = [
  'Fip', // IP
  'Fmac', // MAC
  'Fvpcid', // vpcid
  'Fport', // 端口
  'Fos_type', // 操作系统
  'Fserver_type', // 服务类型
  'Fhost_name', // 主机名
  'Fdomain_name', // 域名
  'Fis_dhcp', // DHCP网段资产
  'Fis_registered', // 知否注册
];

const defaultColumnKeys = [
  'Fip', // IP
  'Fmac', // MAC
  'Fvpcid', // vpcid
  'Fevent_count', // 事件数
  'Fport', // 端口
  'Fhost_name', // 主机名
  'Fis_registered', // 知否注册
  'Finsert_time', // 插入时间
  'Fupdate_time', // 更新时间
];
// Flast_alarm_time 最近告警时间
const timeKey = ['Fupdate_time', 'Finsert_time'];
const notInFilterKey = ['Fupdate_time', 'Finsert_time', 'Fevent_count', 'Frecv_bytes', 'Fsend_bytes'];
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
  render = (text, record) => {
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
            <Popover content={popContent} getPopupContainer={triggerNode => triggerNode} placement="bottomLeft" title={item.title}>
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


  if (
    item.key === 'Fos_type' ||
    item.key === 'Fport' ||
    item.key === 'Fcomponent_info' ||
    item.key === 'Fflow_source' ||
    item.key === 'Fserver_type'
  ) {
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
            <Popover content={popContent} getPopupContainer={triggerNode => triggerNode} placement="bottomLeft">
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

  if (item.key === 'Frecv_bytes' || item.key === 'Fsend_bytes') {
    render = text => <span>{formatNum(text)}</span>;
  }
  // if (item.key === 'Fevent_count') {
  //   render = text => <span className={styles[`${item.key}`]}>{text}</span>;
  // }
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
