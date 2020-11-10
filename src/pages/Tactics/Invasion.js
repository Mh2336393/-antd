import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
// import { Link } from 'umi';
import Cookies from 'js-cookie';
import { DownSquareOutlined } from '@ant-design/icons';
import { Table, message, Modal } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import moment from 'moment';
import configSettings from '../../configSettings';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import AlertMergeForm from './AlertMergeForm';
import AlertManageYUJIEDrawer from './AlertManageFormPageYUJIEDrawer';
import AlertManageUSERDrawer from './AlertManageFormPageDrawer';
import ScanRULEDrawer from './ScanModalPageDrawer';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

/* eslint-disable camelcase */

const { confirm } = Modal;
@connect(({ tacticsInvasion, loading }) => ({
  tacticsInvasion,
  loading: loading.effects['tacticsInvasion/fetchEventList'],
  loadingUpdateNodesRules: loading.effects['tacticsInvasion/updateNodesRules'],
}))
class EventManageInvasion extends Component {
  constructor(props) {
    super(props);
    this.ruleAuth = getAuth('/tactics/invasion');
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        category: '', // 分类
        // attack_scene: '', // 攻击意图
        author: '', // 来源
        level: '',
        // enable_flag: '', // 启停状态
        search: '', // 搜索
        sort: '', // 排序项
        dir: '', // 正序 倒叙
      },
      selectedRowKeys: [],
      ids: [],
      currentHoverRow: '', // 当前hover的行
      showOperation: false, // 显示操作
      drawerTitle: '',
      drawerPath: '',
      formVisible: false, // 新建编辑表单
      editItem: {}, // 新建编辑表单
      mergeVisible: false, // 新建编辑表单
      mergeItem: {}, // 新建编辑表单
      // reqing: false,
    };

    this.filterList = [
      {
        type: 'select',
        name: '分类',
        key: 'category',
        list: [{ name: '全部', value: '' }, ...configSettings.alertRuleCategory],
      },
      {
        type: 'select',
        name: '来源',
        key: 'author',
        list: [
          { name: '全部', value: '' },
          { name: '自定义', value: 'USER' },
          { name: '系统默认', value: 'YUJIE' },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'ID/事件名称',
        pressEnter: true,
      },
      {
        type: 'select',
        name: '级别',
        key: 'level',
        list: [
          { name: '全部', value: '' },
          { name: '严重（100）', value: 5 },
          { name: '高危（80）', value: 4 },
          { name: '中危（60）', value: 3 },
          { name: '低危（40）', value: 2 },
          { name: '信息（20）', value: 1 },
        ],
      },
    ];

    this.columns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          let actionStyle;
          const {
            tacticsInvasion: { eventList },
          } = this.props;
          const { showOperation } = this.state;

          if (index < eventList.list.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }

          let scanEdit = false; // 扫描规则
          let sysSee = false; // 其他内置规则
          let useEdit = false;
          let drawerTitle = '编辑规则';
          let drawerPath = 'user';
          if (record.author !== 'USER') {
            // 内置规则
            if (record.id >= 100000 && record.id < 200000) {
              scanEdit = true;
              drawerTitle = '编辑规则';
              drawerPath = 'yujie插件告警';
            } else {
              sysSee = true;
              drawerTitle = '查看规则';
              drawerPath = 'yujie';
            }
          } else {
            useEdit = true;
          }

          return (
            <div style={{ width: 20 }}>
              <div className={styles.tableAction}>
                <DownSquareOutlined
                  onClick={() => {
                    this.setOperation();
                  }}
                  style={{ color: '#5cbaea' }} />
                {showOperation && (
                  <div className={styles.actionContent} style={actionStyle}>
                    <Fragment>
                      {scanEdit && (
                        <a
                          // href={`${path}?author=${record.author}&eid=${record.id}`}
                          onClick={() => {
                            // Cookies.set('alertQuery', JSON.stringify(query));
                            this.setState({
                              showOperation: false,
                              formVisible: true,
                              drawerTitle,
                              drawerPath,
                              editItem: { author: record.author, eid: record.id },
                            });
                          }}
                        >
                          编辑
                        </a>
                      )}
                      {sysSee && (
                        <a
                          // href={`${path}?author=${record.author}&eid=${record.id}`}
                          onClick={() => {
                            // Cookies.set('alertQuery', JSON.stringify(query));
                            this.setState({
                              showOperation: false,
                              formVisible: true,
                              drawerTitle,
                              drawerPath,
                              editItem: { author: record.author, eid: record.id },
                            });
                          }}
                        >
                          查看
                        </a>
                      )}
                      {useEdit && (
                        <a
                          // href={`${path}?author=${record.author}&eid=${record.id}`}
                          onClick={() => {
                            // Cookies.set('alertQuery', JSON.stringify(query));
                            this.setState({
                              showOperation: false,
                              formVisible: true,
                              drawerTitle,
                              drawerPath,
                              editItem: { author: record.author, eid: record.id },
                            });
                          }}
                        >
                          编辑
                        </a>
                      )}
                      {record.author === 'USER' && this.ruleAuth === 'rw' && (
                        <a
                          onClick={() => {
                            this.delHandleEvent('del', record.id);
                            this.setState({ showOperation: false });
                          }}
                        >
                          删除
                        </a>
                      )}
                    </Fragment>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => {
          // const { query } = this.state;
          let drawerTitle = '';
          let drawerPath = '';

          if (record.author !== 'USER') {
            if (record.id >= 100000 && record.id < 200000) {
              drawerTitle = '编辑规则';
              drawerPath = 'yujie插件告警';
            } else {
              drawerTitle = '查看规则';
              drawerPath = 'yujie';
            }
          } else {
            drawerTitle = '编辑规则';
            drawerPath = 'user';
          }

          return (
            <div>
              <a
                onClick={() => {
                  this.setState({
                    formVisible: true,
                    drawerTitle,
                    drawerPath,
                    editItem: { author: record.author, eid: record.id },
                  });
                }}
              >
                {text}
              </a>
            </div>
          );
        },
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        // sorter: true,
      },
      // {
      //   title: '级别',
      //   dataIndex: 'level',
      //   key: 'level',
      //   // sorter: true,
      //   render: text => `${text}(${configSettings.severityLabel(text)})`,
      // },
      {
        title: '来源',
        dataIndex: 'author',
        key: 'author',
        // sorter: true,
        render: (text) => (text === 'USER' ? '自定义' : '系统默认'),
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        key: 'update_time',
        sorter: true,
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
    ];

    this.btnList = [
      {
        label: '新建',
        color: 'blue',
        hide: this.ruleAuth !== 'rw',
        func: () => {
          // const { query } = this.state;
          // Cookies.set('alertQuery', JSON.stringify(query));
          this.setState({
            formVisible: true,
            drawerTitle: '新建规则',
            drawerPath: 'user',
            editItem: {},
          });
        },
      },
      {
        label: '删除',
        type: 'danger',
        hide: this.ruleAuth !== 'rw',
        func: () => {
          this.delHandleEvent('del');
        },
      },
      {
        label: '全局归并配置',
        hide: this.ruleAuth !== 'rw',
        func: () => {
          this.mergeHandleEvent();
        },
      },
      {
        label: '一键生效',
        color: 'blue',
        hide: this.ruleAuth !== 'rw',
        loading: this.props.loadingUpdateNodesRules,
        func: () => {
          this.updateNodesRules();
        },
      },
    ];
  }

  componentDidMount() {
    const alertQuery = Cookies.get('alertQuery');
    const { dispatch, location } = this.props;
    const { query } = this.state;
    let newQuery = query;
    if (alertQuery) {
      try {
        const queryJson = JSON.parse(alertQuery);
        newQuery = Object.assign({}, query, queryJson);
        Cookies.set('alertQuery', '');
      } catch (error) {
        newQuery = query;
      }
    } else if (location.query && location.query.id) {
      newQuery = Object.assign({}, query, { search: location.query.id });
    } else if (location.query && location.query.search) {
      newQuery = Object.assign({}, query, { search: location.query.search });
    }
    this.setState({ query: newQuery });
    dispatch({
      type: 'tacticsInvasion/fetchEventList',
      payload: newQuery,
    });
  }

  // 事件
  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }

  filterOnChange = (type, value) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const changePart = { [type]: value };
    let newQuery = Object.assign({}, query, changePart);
    newQuery = Object.assign({}, newQuery, { page: 1 });

    this.setState({ query: newQuery });
    dispatch({
      type: 'tacticsInvasion/fetchEventList',
      payload: configSettings.validateQuery(newQuery),
    });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({ query: newQuery });
    dispatch({
      type: 'tacticsInvasion/fetchEventList',
      payload: configSettings.validateQuery(newQuery),
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, { page: current, pageSize });
    } else {
      const { field, order } = sorter;
      // ['category', 'level', 'rule_author', 'update_time']
      if (!field) {
        return;
      }
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, { sort: field, dir, page: 1 });
    }
    this.setState({ query: newQuery });
    dispatch({
      type: 'tacticsInvasion/fetchEventList',
      payload: configSettings.validateQuery(newQuery),
    });
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.id);
    this.setState({ selectedRowKeys, ids });
  };

  getTableCheckboxProps = (record) => ({
    disabled: record.author !== 'USER',
  });

  // 删除
  delHandleEvent = (status, singleID) => {
    const { ids, query } = this.state;
    const self = this;
    const {
      tacticsInvasion: {
        eventList: { list },
      },
      dispatch,
    } = this.props;
    const { page } = query;
    let newPage = page;

    if (!singleID) {
      if (status === 'del' && list.length === ids.length) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      if (ids.length === 0) {
        message.error('未选择事件');
        return;
      }
      // const newIds = ids.join(',');
      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          dispatch({
            type: 'tacticsInvasion/deleteHandleEvent',
            payload: { ids },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState({ selectedRowKeys: [], ids: [], query: newQuery });
              dispatch({
                type: 'tacticsInvasion/fetchEventList',
                payload: configSettings.validateQuery(newQuery),
              });
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() { },
      });
    } else {
      if (status === 'del' && list.length === 1) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          dispatch({
            type: 'tacticsInvasion/deleteHandleEvent',
            payload: { ids: [singleID] },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState({ query: newQuery });
              dispatch({
                type: 'tacticsInvasion/fetchEventList',
                payload: configSettings.validateQuery(newQuery),
              });
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() { },
      });
    }
  };

  // 归并策略按钮函数
  mergeHandleEvent = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'tacticsInvasion/getGlobalMerge' })
      .then(() => {
        const {
          tacticsInvasion: { getMerge },
        } = this.props;
        this.setState({ mergeVisible: true, mergeItem: getMerge });
      })
      .catch((err) => {
        message.error(`操作失败:${err.msg}`);
      });
  };

  updateNodesRules = async () => {
    const { dispatch } = this.props;
    await dispatch({ type: 'tacticsInvasion/updateNodesRules' })
    message.success('下发成功')
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({
      type: 'tacticsInvasion/fetchEventList',
      payload: configSettings.validateQuery(newQuery),
    });
  };

  // 新建 编辑 表单 -- 取消按钮函数
  // onFormCancel = () => {
  //   this.setState({ formVisible: false, editItem: {} });
  // };

  onMergeCancel = () => {
    this.setState({ mergeVisible: false, mergeItem: {} });
  };

  onMergeSave = (values) => {
    // 全局归并策略更新
    const { query } = this.state;
    const { dispatch } = this.props;
    // console.log('onMergeSave-表单保存数据-values: ', values, JSON.stringify(values));

    dispatch({
      type: 'tacticsInvasion/setGlobalMerge',
      payload: { query: configSettings.validateQuery(query), merge: JSON.stringify(values) },
    })
      .then(() => {
        message.success('设置成功');
        this.setState({ mergeVisible: false, mergeItem: {} });
        // this.props.dispatch({ type: `whiteList/fetch${type.toLocaleUpperCase()}List`, payload: { page: this.state[type].page, length: pageNumber } });
      })
      .catch((err) => {
        message.error(err.msg);
      });
  };

  drawerClose = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    this.setState({ formVisible: false, editItem: {}, drawerTitle: '', drawerPath: '' });
    dispatch({ type: 'tacticsInvasion/fetchEventList', payload: query });
  };

  render() {
    const {
      query,
      selectedRowKeys,
      currentHoverRow,
      formVisible,
      editItem,
      mergeVisible,
      mergeItem,
      drawerTitle,
      drawerPath,
    } = this.state;
    const {
      tacticsInvasion: { eventList },
      loading,
      loadingUpdateNodesRules,
    } = this.props;
    const { recordsTotal, list } = eventList;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
      getCheckboxProps: this.getTableCheckboxProps,
    };
    this.btnList[3].loading = loadingUpdateNodesRules
    return (
      <div className="contentWraper">
        <div className="commonHeader">入侵感知管理</div>
        <div>
          <div className="filterWrap">
            <FilterBlock
              filterList={this.filterList}
              filterOnChange={this.filterOnChange}
              submitFilter={this.submitFilter}
              colNum={3}
              query={query}
              isShowSearchBtn={true}
            />
          </div>
          <div className="TableTdPaddingWrap">
            <ButtonBlock
              btnList={this.btnList}
              bpage={query.page}
              bsize={query.pageSize}
              total={recordsTotal}
              onPageChange={this.paginationChange}
            />
            <Table
              rowKey="id"
              loading={loading}
              columns={this.columns}
              dataSource={list}
              pagination={{
                pageSize: query.pageSize,
                current: query.page,
                total: recordsTotal,
              }}
              onChange={this.handleTableChange}
              rowSelection={rowSelection}
              rowClassName={(record, index) =>
                index === currentHoverRow ? styles.handleAction : ''
              }
              onRow={(record, index) => ({
                onMouseEnter: () => {
                  this.setState({ currentHoverRow: index });
                },
                onMouseLeave: () => {
                  this.setState({ currentHoverRow: '', showOperation: false });
                },
              })}
            />
          </div>

          <AlertMergeForm
            key={`merge${mergeVisible}`}
            editItem={mergeItem}
            visible={mergeVisible}
            onCancel={this.onMergeCancel}
            onSave={this.onMergeSave}
          />
        </div>

        {formVisible && (
          <DrawerWidget
            visible={formVisible}
            title={drawerTitle}
            width={960}
            onClose={this.drawerClose}
          >
            <div>
              {drawerPath === 'yujie' && (
                <AlertManageYUJIEDrawer drawerObj={editItem} backTablePage={this.drawerClose} />
              )}
              {drawerPath === 'user' && (
                <AlertManageUSERDrawer drawerObj={editItem} backTablePage={this.drawerClose} />
              )}
              {drawerPath === 'yujie插件告警' && (
                <ScanRULEDrawer drawerObj={editItem} backTablePage={this.drawerClose} />
              )}
            </div>
          </DrawerWidget>
        )}
      </div>
    );
  }
}

export default EventManageInvasion;
