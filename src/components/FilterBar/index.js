import React, { Component } from 'react';

import {
  CloseOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  UpOutlined,
} from '@ant-design/icons';

import {
  Dropdown,
  Button,
  Menu,
  Input,
  Checkbox,
  Modal,
  Popover,
  message,
  Row,
  // Radio,
  Col,
} from 'antd';
import bus from '@/utils/event';
import cloneDeep from 'lodash/cloneDeep';

import TimeRangePicker from '@/components/TimeRangePicker';
import isEqual from 'lodash/isEqual';
import { connect } from 'umi';

import styles from './index.less';

const { Search } = Input;

/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */

class FilterBar extends Component {
  static defaultProps = {
    triggerSiderbar: () => {},
    triggerFilterListManger: () => {},
    sortAction: () => {},
    checkboxOnchange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      showSelectList: props.filterList,
      originList: props.filterList,
      partSearchStatus: this.getInitialPartSearchStatus(props.filterList),
      filterSaveVisible: false,
      filterName: '',
      errMsg: '',
      quickSelectVisible: false, // 快速搜索modal框
    };
    this.columns = [
      {
        title: '名称',
        dataIndex: 'web_key',
        key: 'web_key',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 100,
        render: (_, record) => (
          <React.Fragment>
            <a onClick={() => this.checkFilter(record)}>打开</a>
            <a onClick={() => this.checkFilter(record)}>删除</a>
          </React.Fragment>
        ),
      },
    ];
  }

  componentDidMount() {
    const { filterPrefix } = this.props;
    if (filterPrefix) {
      this.fetchFilterList();
    }
    bus.on('clearInput', this.hideSearch);
  }

  componentWillReceiveProps = (nextprops) => {
    const { filterList } = nextprops;
    const { filterList: old } = this.props;
    if (!isEqual(filterList, old)) {
      const partSearchStatus = this.getInitialPartSearchStatus(filterList);
      this.setState({
        showSelectList: filterList,
        originList: filterList,
        partSearchStatus,
      });
    }
  };

  componentWillUnmount = () => {
    bus.removeListener('clearInput', this.hideSearch);
  };

  // 初始筛选状态
  getInitialPartSearchStatus = (filterList) => {
    const statusObj = {};
    filterList.forEach((item) => {
      statusObj[item.key] = false;
    });
    return statusObj;
  };

  filterOnChange = (key, data, checked, mode) => {
    this.props.checkboxOnchange(key, data, checked, mode);
  };

  sortAction = (key, dir) => {
    this.props.sortAction(key, dir);
  };

  onSearch = (key) => {
    const { partSearchStatus } = this.state;
    let newStatus;
    if (partSearchStatus[key]) {
      newStatus = Object.assign({}, partSearchStatus, { [key]: false });
    } else {
      newStatus = Object.assign({}, partSearchStatus, { [key]: true });
    }
    newStatus = Object.assign({}, partSearchStatus, { [key]: true });
    this.setState({ partSearchStatus: newStatus });
  };

  // 局部筛选框输入后筛选内容
  inputOnchange = (key, value) => {
    const { showSelectList, originList } = this.state;
    const part = originList.find((item) => item.key === key);
    const index = showSelectList.findIndex((item) => item.key === key);
    const { list: oldList } = part;
    const regx = new RegExp(value, 'i');
    const newList = oldList.filter((item) => {
      let param;
      if (key === 'Fgroup') {
        param = item.title || item.Fgroup_name;
      } else {
        param = item.title || item.key;
      }
      return regx.test(param);
    });
    const newShowFilterList = cloneDeep(showSelectList);
    newShowFilterList[index] = Object.assign({}, newShowFilterList[index], { list: newList });
    this.setState({ showSelectList: newShowFilterList });
  };

  // 全局搜索
  globalSearch = (value) => {
    const { globalSearch } = this.props;
    globalSearch(value);
  };

  globalSearchChange = (e) => {
    let { value } = e.target;
    value = value.trim();
    const { globalSearchChange } = this.props;
    if (globalSearchChange) {
      globalSearchChange(value);
      this.input.input.input.value = value;
    }
  };

  handleTriggerListManager = () => {
    this.props.triggerFilterListManger();
  };

  handleTriggerSidebar = () => {
    // trigger resize event
    // to force bizchart resize when window size change
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('resize', false, false);
    window.dispatchEvent(evt);
    this.props.triggerSiderbar();
  };

  filterNameOnChange = (e) => {
    let { value } = e.target;
    value = value.trim();
    let errMsg = '';
    if (!value) {
      errMsg = '名称不能为空';
    }
    if (value.length > 50) {
      errMsg = '名称不得超过50个字符';
    }
    this.setState({ errMsg, filterName: value });
  };

  filterOnSave = () => {
    const {
      filterObj,
      query: { search },
    } = this.props;
    // console.log('filterObj', filterObj);
    let isEmpty = true;
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key].length > 0) {
        isEmpty = false;
      }
    });
    if (isEmpty && !search) {
      message.error('当前并无需要保存的筛选项');
      return;
    }
    this.setState({ filterSaveVisible: true });
  };

  // 快速搜索面板
  renderMenu = () => {
    const {
      config: { filterNameList },
    } = this.props;
    return (
      <Menu style={{ height: '300px', overflow: 'auto' }}>
        <Menu.Item>
          <Row style={{ width: '100%', color: '#7e7e7e' }}>
            <Col span={16}>名称</Col>
            <Col span={8}>操作</Col>
          </Row>
        </Menu.Item>
        {filterNameList.map((item) => (
          <Menu.Item key={item.id}>
            <Row style={{ width: '100%' }}>
              <Col
                span={16}
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={item.web_key}
              >
                {item.web_key}
              </Col>
              <Col span={4}>
                <a
                  onClick={() => {
                    this.checkFilter(item);
                  }}
                >
                  打开
                </a>
              </Col>
              <Col span={4}>
                <a
                  onClick={() => {
                    this.deleteSelect(item);
                  }}
                >
                  删除
                </a>
              </Col>
            </Row>
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  checkFilter = (obj) => {
    try {
      const filterValue = JSON.parse(obj.web_value);
      if (this.props.filterQuickSelect) {
        this.props.filterQuickSelect(filterValue);
      }
      const { quickSelectVisible } = this.state;
      if (quickSelectVisible) {
        this.setState({ quickSelectVisible: false });
      }
    } catch (error) {
      message.error('数据有误,请检查数据');
    }
  };

  saveFilter = () => {
    const { filterName } = this.state;
    const { dispatch, query, filterPrefix, mode } = this.props;
    // console.log('query', query);
    const { filterObj, mustObj, startTime, endTime, search, timeType } = query;
    const value = timeType
      ? { filterObj, mustObj, startTime, endTime, search, mode, timeType }
      : { filterObj, mustObj, startTime, endTime, search, mode };
    let errMsg;
    const name = filterName.trim();
    if (!name) {
      errMsg = '名称不能为空';
    }
    if (name.length > 50) {
      errMsg = '名称不得超过50个字符';
    }
    if (errMsg) {
      this.setState({ errMsg });
      return;
    }
    this.setState({ errMsg: '' });
    // console.log('value',value);
    dispatch({
      type: 'config/saveFilter',
      payload: { type: filterPrefix, key: name, value: JSON.stringify(value) },
    })
      .then(() => {
        message.success('保存成功');
        this.setState({ filterSaveVisible: false, filterName: '' });
        this.fetchFilterList();
      })
      .catch((error) => {
        const msg = error.msg || '系统错误，请稍后重试';
        message.error(msg);
      });
  };

  fetchFilterList = () => {
    const { dispatch, filterPrefix } = this.props;
    dispatch({ type: 'config/fetchFilterList', payload: { type: filterPrefix } });
  };

  // 删除快速选择模板
  deleteSelect = (obj) => {
    // console.log('obj', obj);
    const { dispatch } = this.props;
    dispatch({ type: 'config/deleteFilter', payload: { id: obj.id } })
      .then(() => {
        message.success('删除成功');
        this.fetchFilterList();
      })
      .catch((error) => {
        console.log('error', error);
        message.error(`删除失败：${error.msg || error.message}`);
      });
  };

  showAll = (item) => {
    const { showSelectList } = this.state;
    const { key } = item;
    const newShowSelectList = showSelectList.map((selectItem) => {
      if (selectItem.key === key) {
        selectItem.show = !selectItem.show;
      }
      return selectItem;
    });
    this.setState({ showSelectList: newShowSelectList });
  };

  hideSearch = () => {
    console.log('hideall');
    const newPartSearchStatus = this.getInitialPartSearchStatus(this.props.filterList);
    this.setState({
      partSearchStatus: newPartSearchStatus,
      showSelectList: this.props.filterList,
    });
  };

  hideItemSearch = (key) => {
    const { partSearchStatus } = this.state;
    partSearchStatus[key] = false;
    this.setState({ partSearchStatus, showSelectList: this.props.filterList });
  };

  changeBtnStatus = (key, flag) => {
    this.props.mustAction(key, flag);
  };

  // 点击底部搜索调用
  fetchNewQuery = () => {
    this.props.fetchData();
  };

  /**
   * {
   *  key:'src_ip',
   *  title:"源IP",
   *  list:[
   *    key:'1,2,1,1',
   *    doc_count:1
   *  ]
   * }
   */

  render() {
    const {
      rwAuth,
      filterList, // 每个字段的 值归并列表
      config: { filterNameList },
      dirObj,
      filterObj,
      globalSearch,
      hasManageBtn,
      children,
      placeholder,
      width,
      filterPrefix,
      query,
      preQuery: { preFilterObj, preMustObj },
      isOpen,
      mustObj, // 高级模式的是非状态，是 true  ; 非 false
      partActionStatus, // 那些字段被勾选了，有勾选的就是true
      mode,
    } = this.props;
    const {
      partSearchStatus,
      showSelectList,
      filterSaveVisible,
      errMsg,
      quickSelectVisible,
    } = this.state;
    // console.log('showSelectList', showSelectList);
    // console.log('mustObj', mustObj);
    // console.log('partActionStatus', partActionStatus);
    // console.log('partSearchStatus', partSearchStatus);
    const bottomSearch = isEqual(preFilterObj, filterObj) && isEqual(preMustObj, mustObj);
    return (
      <div className={styles.filterBar}>
        <div className={styles.fliterBlock}>
          <div>
            {this.props.timeVisible ? (
              <div>
                {mode ? (
                  <div className={styles.modeBlock}>
                    <TimeRangePicker
                      customOptions={this.props.options}
                      timeRange={this.props.timeRange}
                      startTime={this.props.startTime}
                      endTime={this.props.endTime}
                      timePickerOnchange={this.props.timePickerOnchange}
                    />
                    <span style={{ marginTop: '5px' }}>
                      <a
                        onClick={() => {
                          this.props.changeMode(mode, this.input);
                          // this.hideSearch();
                          this.input.input.input.value = '';
                        }}
                      >
                        简单搜索
                      </a>
                    </span>
                  </div>
                ) : (
                  <div className={styles.modeBlock}>
                    <TimeRangePicker
                      customOptions={this.props.options}
                      timeRange={this.props.timeRange}
                      startTime={this.props.startTime}
                      endTime={this.props.endTime}
                      timePickerOnchange={this.props.timePickerOnchange}
                    />
                    <div style={{ marginTop: '5px' }}>
                      <LeftOutlined
                        onClick={() => {
                          this.props.changeMode(mode);
                        }} />
                      <span>简单搜索</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {mode ? (
                  <div className={styles.modeBlock}>
                    <span>
                      <UnorderedListOutlined style={{ marginRight: '5px' }} />
                      搜索条件
                    </span>

                    <span>
                      <a
                        onClick={() => {
                          this.props.changeMode(mode, this.input);
                          // this.hideSearch();
                          this.input.input.input.value = '';
                        }}
                      >
                        简单搜索
                      </a>
                    </span>
                  </div>
                ) : (
                  <div style={{ marginBottom: '10px' }}>
                    <LeftOutlined
                      onClick={() => {
                        this.props.changeMode(mode);
                      }} />
                    <span>简单搜索</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {globalSearch && (
            <p>
              <Search
                ref={(node) => {
                  this.input = node;
                }}
                placeholder={placeholder || '请输入搜索内容'}
                onSearch={(value) => this.globalSearch(value)}
                onChange={this.globalSearchChange}
                defaultValue={query && query.search ? query.search : ''}
                style={{ marginBottom: 12 }}
              />
            </p>
          )}
          {children && <div>{children}</div>}
          {showSelectList.map((item, idx) => {
            const { title, list, key, show, render, checkedFlag } = item;
            const searchStatus = partSearchStatus[key];
            const actionStatus = partActionStatus[key];
            const btnStatus = mustObj[key];
            const showDir = dirObj[item.key] === 'asc' ? 'desc' : 'asc'; // 显示的排序状态
            const propsList = filterList[idx].list; // 传下来的filterList
            return (
              <div key={item.key} className={styles.filterItem}>
                {searchStatus ? (
                  <div>
                    <Input
                      size="small"
                      prefix={<SearchOutlined />}
                      suffix={
                        <CloseOutlined
                          onClick={() => {
                            this.hideItemSearch(key);
                          }} />
                      }
                      onChange={(e) => {
                        this.inputOnchange(key, e.target.value);
                      }}
                      // onSearch={() => {
                      //   this.onSearch(key);
                      // }}
                      style={{
                        display: searchStatus ? 'inline-block' : 'none',
                        width: '100%',
                        verticalAlign: 'sub',
                      }}
                      className={styles.partSearchStyle}
                    />
                  </div>
                ) : (
                  <div className={styles.filterHeader}>
                    <div className={styles.titleCon}>
                      <span className={styles.title} title={title}>
                        {title}
                      </span>
                      {propsList && propsList.length > 5 && (
                        <a
                          style={{ marginLeft: '5px' }}
                          onClick={() => {
                            this.showAll(item);
                          }}
                        >
                          <span style={{ marginRight: '5px' }}>{show ? '收起' : '全部'}</span>
                          {show ? <UpOutlined /> : <DownOutlined />}
                        </a>
                      )}
                      {list && list.length > 49 && (
                        <Popover content="当前仅展示前50条" placement="rightTop">
                          <ExclamationCircleOutlined style={{ marginLeft: 6, color: '#3369D9' }} />
                        </Popover>
                      )}
                    </div>
                    <div>
                      {actionStatus && mode && (
                        <div className={styles.btnGroup}>
                          <span
                            className={`${btnStatus ? styles.blueBtn : styles.grayBtn} ${
                              styles.btnSpan
                            }`}
                            onClick={() => {
                              this.changeBtnStatus(key, true);
                            }}
                          >
                            是
                          </span>
                          <span
                            className={`${btnStatus ? styles.grayBtn : styles.redBtn} ${
                              styles.btnSpan
                            }`}
                            onClick={() => {
                              this.changeBtnStatus(key, false);
                            }}
                          >
                            非
                          </span>
                        </div>
                      )}
                      {list && list.length > 10 && (
                        <SearchOutlined
                          onClick={(event) => {
                            event.stopPropagation();
                            this.onSearch(key);
                          }}
                          style={{
                            cursor: 'pointer',
                            display: searchStatus ? 'none' : 'inline-block',
                          }} />
                      )}
                      <i
                        className={styles[showDir]}
                        onClick={() => {
                          this.sortAction(item.key, showDir);
                        }}
                      />
                    </div>
                  </div>
                )}
                {show ? ( // show 为true的时候，显示全部 值归并数据
                  <div className={styles.itemConent}>
                    {list &&
                      list.slice(0, 50).map((data) => {
                        const flag = checkedFlag || 'key';
                        let string = render ? render(data[flag]) : data.key;
                        // 取i18N字段
                        if (data.alias) {
                          string = data.alias;
                        }
                        const hoverTitle = string && string.props ? string.props.children : string;
                        return (
                          <div
                            className={`${btnStatus ? 'normalCheck' : 'redCheck'} ${
                              styles.fitlerSubItem
                            }`}
                            key={data.key}
                          >
                            <Checkbox
                              checked={filterObj[key].includes(data[flag])}
                              onChange={(e) => {
                                this.filterOnChange(item.key, data, e.target.checked, mode);
                              }}
                            >
                              <span
                                className="ellipsis"
                                style={{
                                  maxWidth: `${width - 48 - 70}px`,
                                  cursor: 'pointer',
                                  verticalAlign: 'top',
                                }}
                                title={hoverTitle}
                              >
                                {string}
                              </span>
                              <span>({data.doc_count})</span>
                            </Checkbox>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className={styles.itemConent}>
                    {list &&
                      list.slice(0, 5).map((data) => {
                        const flag = checkedFlag || 'key';
                        let string = render ? render(data[flag]) : data.key;
                        // 取i18N字段
                        if (data.alias) {
                          string = data.alias;
                        }
                        const hoverTitle = string && string.props ? string.props.children : string;
                        return (
                          <div
                            className={`${btnStatus ? 'normalCheck' : 'redCheck'} ${
                              styles.fitlerSubItem
                            }`}
                            key={data.key}
                          >
                            <Checkbox
                              checked={filterObj[key].includes(data[flag])}
                              onChange={(e) => {
                                this.filterOnChange(item.key, data, e.target.checked, mode);
                              }}
                            >
                              <span
                                className="ellipsis"
                                style={{
                                  maxWidth: `${width - 48 - 70}px`,
                                  cursor: 'pointer',
                                  verticalAlign: 'top',
                                }}
                                title={hoverTitle}
                              >
                                {string}
                              </span>
                              <span>({data.doc_count})</span>
                            </Checkbox>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}

          {mode && isOpen && (
            <div>
              {bottomSearch ? null : (
                <div className={styles.searchBtn} style={{ width }} onClick={this.fetchNewQuery}>
                  搜索
                </div>
              )}
            </div>
          )}
        </div>
        {filterPrefix && isOpen && (
          <div className={styles.manageBtn} style={{ width: width + 10 }}>
            {hasManageBtn && (
              <Button className={styles.btnStyle} onClick={this.handleTriggerListManager}>
                管理
              </Button>
            )}
            <Button
              className={styles.btnStyle}
              disabled={rwAuth !== 'rw'}
              onClick={this.filterOnSave}
            >
              保存搜索
            </Button>
            {/* <span className={styles.btnStyle}>快速搜索</span> */}
            <Dropdown
              overlay={this.renderMenu()}
              placement="topRight"
              getPopupContainer={(triggerNode) => triggerNode}
              trigger={['hover']}
              overlayStyle={{ width: '300px' }}
              disabled={rwAuth !== 'rw' || filterNameList.length === 0}
            >
              <Button
                className={styles.btnStyle}
                disabled={rwAuth !== 'rw' || filterNameList.length === 0}
              >
                快速搜索
                <UpOutlined style={{ color: '#ccc', marginLeft: 6 }} />
              </Button>
            </Dropdown>
          </div>
        )}
        <Modal
          title="保存搜索"
          destroyOnClose
          visible={filterSaveVisible}
          onCancel={() => {
            this.setState({ filterSaveVisible: false, errMsg: '' });
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                this.setState({ filterSaveVisible: false, errMsg: '' });
              }}
            >
              取消
            </Button>,
            <Button key="submit" type="primary" disabled={!!errMsg} onClick={this.saveFilter}>
              确定
            </Button>,
          ]}
        >
          <Input
            placeholder="请输入名称"
            onChange={(e) => {
              this.filterNameOnChange(e);
            }}
          />
          <div className={styles.errMsg}>
            <span>{errMsg}</span>
          </div>
        </Modal>
        <Modal
          title="快速搜索"
          visible={quickSelectVisible}
          footer={null}
          onCancel={() => {
            this.setState({ quickSelectVisible: false });
          }}
        >
          <div>
            <p>请选择保存的搜索模板</p>
            <div className={styles.quickBlock}>
              {filterNameList.map((item) => (
                <div key={item.id} className={styles.tagItem}>
                  <span
                    className={styles.tag}
                    title={item.web_key}
                    onClick={() => {
                      this.checkFilter(item);
                    }}
                  >
                    {item.web_key}
                  </span>
                  <CloseOutlined
                    onClick={() => {
                      this.deleteSelect(item);
                    }} />
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect(({ config }) => ({
  config,
}))(FilterBar);
