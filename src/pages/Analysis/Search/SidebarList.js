import React, { PureComponent } from 'react';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Progress, Table, Popover, Tooltip } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import styles from './SidebarList.less';

/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-string-refs */
/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable */

const format = 'YYYY-MM-DD HH:mm:ss';
class SidebarList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hoverKey: '', // 鼠标在available Fields中悬停的key值
      selectFields: [], // 选择展示的字段列表
      availableFields: [], // 可展示的字段列表（页面对应隐藏字段）
    };
    this.sourceExtraKey = ['_id', '_index', '_score', '_type'];
  }

  componentDidMount = () => {
    const { allAvailableFields, selectFields } = this.props;
    if (allAvailableFields.length > 0) {
      const availableFields = [].concat(allAvailableFields);
      _.pullAll(availableFields, selectFields);
      this.setState({ availableFields, selectFields: [].concat(selectFields) });
    }
    
  };

  componentWillReceiveProps = nextProps => {
    const { selectFields } = this.state;
    const { allAvailableFields, selectFields: newSelectFields } = nextProps;
    // console.log('1:::::', 'selectFields::', selectFields, 'newSelectFields', newSelectFields);
    const availableFields = [].concat(allAvailableFields);
    if (allAvailableFields !== this.props.allAvailableFields) {
      const diffArr = _.difference(selectFields, allAvailableFields);
      _.pullAll(selectFields, diffArr);
      _.pullAll(availableFields, selectFields);
      this.setState({ availableFields });
    } else if (!_.isEqual(selectFields, newSelectFields)) {
      _.pullAll(availableFields, newSelectFields);
      this.setState({ selectFields: [].concat(newSelectFields), availableFields });
    }
  };

  getFieldRangesColumns = key => [
    {
      title: key,
      dataIndex: 'key',
      key: 'key',
      width: 130,
      render: (text, record) => {
        if (key === 'timestamp') {
          return moment(text).format(format);
        }
        if (record.key_as_string) {
          return record.key_as_string;
        }
        return text;
      },
    },
    {
      title: '',
      dataIndex: 'operate',
      key: 'operate',
      width: 50,
      render: (text, record) => {
        const { searchArr, fieldFilter } = this.props;
        const seachable = searchArr.indexOf(key) > -1;
        let keyVal = record.key;
        if (key === 'timestamp') {
          keyVal = moment(record.key).format(format);
        }
        if (record.key_as_string) {
          keyVal = record.key_as_string;
        }

        return (
          <div>
            <Tooltip placement="bottom" title="按该值过滤">
              {seachable ? (
                <ZoomInOutlined
                  className={styles['expand-li-icon']}
                  onClick={() => {
                    fieldFilter(key, keyVal, 'must');
                  }} />
              ) : (
                <ZoomInOutlined className={`${styles['expand-li-icon']} ${styles['icon-disable']}`} />
              )}
            </Tooltip>
            <Tooltip placement="bottom" title="按该值排除">
              {seachable ? (
                <ZoomOutOutlined
                  className={styles['expand-li-icon']}
                  onClick={() => {
                    fieldFilter(key, keyVal, 'must_not');
                  }} />
              ) : (
                <ZoomOutOutlined className={`${styles['expand-li-icon']} ${styles['icon-disable']}`} />
              )}
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: '日志数',
      dataIndex: 'doc_count',
      key: 'doc_count',
      width: 100,
    },
    {
      title: '占比',
      dataIndex: 'percent',
      key: 'percent',
      width: 200,
      render: text => <Progress percent={text} size="small" status="active" width={200} />,
    },
  ];

  getPopoverContent = key => {
    const { esFieldRanges, showMore } = this.props;
    const source = esFieldRanges[key] ? esFieldRanges[key].buckets : [];
    const columns = this.getFieldRangesColumns(key);
    return (
      <div className={styles['sidebar-popoverContent']}>
        <Table columns={columns} dataSource={source.length > 10 ? source.slice(0, 10) : source} size="small" pagination={false} />
        {source.length > 10 && (
          <div style={{ paddingTop: '8px' }}>
            当前显示Top10&nbsp;
            <a
              style={{ marginLeft: '8px' }}
              onClick={() => {
                showMore(key);
              }}
            >
              查看全部
            </a>
          </div>
        )}
      </div>
    );
  };

  handleMouseEnter = key => {
    this.setState({ hoverKey: key });
  };

  onMouseLeave = () => {
    this.setState({ hoverKey: '' });
  };

  addDeleteSort = (addArr, deleteArr, key, operation) => {
    const deleteIndex = deleteArr.indexOf(key);
    deleteArr.splice(deleteIndex, 1);
    addArr.push(key);
    // 展示字段 增加的时候，不排序：按点击顺序来，先点击的展示在前面
    // 相反，隐藏字段 增加的时候 （即点击 移除 按钮） 要排序
    if (operation !== 'add') {
      addArr.sort();
    }
    return deleteIndex;
  };

  onClick = (key, operation) => {
    let hoverKey = key;
    const { selectFields, availableFields } = this.state;
    const { sidebarItemToggle } = this.props;
    let index = -1;
    if (operation === 'add') {
      index = this.addDeleteSort(selectFields, availableFields, hoverKey, operation);
      hoverKey = availableFields[index - 1] ? availableFields[index - 1] : '';
    } else {
      index = this.addDeleteSort(availableFields, selectFields, hoverKey, operation);
      hoverKey = selectFields[index] ? selectFields[index] : '';
    }
    this.setState({ selectFields, availableFields, hoverKey });
    sidebarItemToggle(selectFields);
  };

  render() {
    const { hoverKey, selectFields, availableFields } = this.state;
    const { visible, esFieldRanges } = this.props;
    return (
      <div>
        {visible && (
          <div className={styles['sidebar-container']}>
            <div className={styles['sidebar-list-header']} style={{ marginTop: '-20px' }}>
              <h3 className={styles['sidebar-list-header-label']} id="selected_fields">
                展示字段
              </h3>
            </div>
            <ul className={styles['sidebar-list']}>
              {selectFields.length === 0 && (
                <li>
                  <div className={styles['sidebar-list-item']}>
                    <span className={styles['sidebar-list-item-label']}>_source</span>
                  </div>
                </li>
              )}
              {selectFields.map(key => (
                <li style={{ position: 'relative' }} key={key}>
                  {esFieldRanges[key] ? (
                    <Popover placement="right" title={key} content={this.getPopoverContent(key)} trigger="click">
                      <div
                        className={styles['sidebar-list-item']}
                        onMouseEnter={() => {
                          this.handleMouseEnter(key);
                        }}
                        onMouseLeave={this.onMouseLeave}
                      >
                        <a title={key} className={styles['sidebar-list-item-label']}>
                          {key}
                        </a>
                        <span className={styles['sidebar-list-item-num']}>{esFieldRanges[key].num || 0}</span>
                      </div>
                    </Popover>
                  ) : (
                    <div
                      className={styles['sidebar-list-item']}
                      onMouseEnter={() => {
                        this.handleMouseEnter(key);
                      }}
                      onMouseLeave={this.onMouseLeave}
                    >
                      <span title={key} className={styles['sidebar-list-item-label']}>
                        {key}
                      </span>
                    </div>
                  )}
                  {hoverKey === key && (
                    <a
                      className={styles['sidebar-list-item-btn']}
                      style={{ color: 'rgb(232,83,83)' }}
                      onMouseEnter={() => {
                        this.handleMouseEnter(key);
                      }}
                      onClick={() => {
                        this.onClick(hoverKey, 'delete');
                      }}
                    >
                      移除
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <div className={styles['sidebar-list-header']}>
              <h3 className={styles['sidebar-list-header-label']} id="selected_fields">
                隐藏字段
              </h3>
            </div>
            <ul className={styles['sidebar-list']}>
              {availableFields.map(key => (
                <li style={{ position: 'relative' }} key={key}>
                  {esFieldRanges[key] ? (
                    <Popover placement="right" title={key} content={this.getPopoverContent(key)} trigger="click">
                      <div
                        className={styles['sidebar-list-item']}
                        onMouseEnter={() => {
                          this.handleMouseEnter(key);
                        }}
                        onMouseLeave={this.onMouseLeave}
                      >
                        <a title={key} className={styles['sidebar-list-item-label']}>
                          {key}
                        </a>
                        <span className={styles['sidebar-list-item-num']}>{esFieldRanges[key] ? esFieldRanges[key].num : ''}</span>
                      </div>
                    </Popover>
                  ) : (
                    <div
                      className={styles['sidebar-list-item']}
                      onMouseEnter={() => {
                        this.handleMouseEnter(key);
                      }}
                      onMouseLeave={this.onMouseLeave}
                    >
                      <span title={key} className={styles['sidebar-list-item-label']}>
                        {key}
                      </span>
                    </div>
                  )}
                  {hoverKey === key && (
                    <a
                      className={styles['sidebar-list-item-btn']}
                      onMouseEnter={() => {
                        this.handleMouseEnter(key);
                      }}
                      onClick={() => {
                        this.onClick(hoverKey, 'add');
                      }}
                    >
                      显示
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}
export default SidebarList;
