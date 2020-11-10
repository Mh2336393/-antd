import React, { Component } from 'react';
import { connect } from 'umi';
import { Table, message, Switch } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import moment from 'moment';
import configSettings from '../../configSettings';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import BlockStrategyFormDrawer from './BlockStrategyFormDrawer';

import authority from '@/utils/authority';
const { getAuth } = authority;
// import styles from './index.less';

// const FormItem = Form.Item;
// const RadioGroup = Radio.Group;
// const { Option } = Select;
const blockerType = {
  alert: '告警阻断',
  blacklist: 'IP黑名单阻断',
};

@connect(({ block, loading }) => ({
  block,
  loading: loading.effects['block/fetchStrategyList'],
}))
class BlockStrategy extends Component {
  constructor(props) {
    super(props);
    this.blockAuth = getAuth('/tactics/blockStrategy');
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        Fstrategy_type: '', // 分类
        Factivated: '', // 启停状态
        search: '', // 搜索
        sort: '', // 排序项
        dir: '', // 正序 倒叙
      },
      selectedRowKeys: [],
      ids: [],
      statusLoading: {},
      formVisible: false,
      drawerTitle: '',
      drawerObj: {},
      // isProcessing: false,
      // blocks: [
      //   {
      //     Fname: '',
      //     tianmu_host: '',
      //     tianmu_uri: '',
      //     tianmu_secretid: '',
      //     tianmu_secretkey: '',
      //     Fdesc: '',
      //   },
      // ],
    };

    this.filterList = [
      {
        type: 'select',
        name: '分类',
        key: 'Fstrategy_type',
        list: [
          { name: '全部', value: '' },
          { name: '告警阻断', value: 'alert' },
          { name: 'IP黑名单阻断', value: 'blacklist' },
        ],
      },
      {
        type: 'select',
        name: '启停状态',
        key: 'Factivated',
        list: [
          { name: '全部', value: '' },
          { name: '启动', value: 1 },
          { name: '未启动', value: 0 },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'ID/策略名称/创建人',
        pressEnter: true,
      },
    ];

    this.btnList = [
      {
        label: '新建',
        color: 'blue',
        hide: this.blockAuth !== 'rw',
        func: () => {
          const {
            block: { blockModules },
          } = this.props;
          if (blockModules.length === 0) {
            message.error(
              '阻断模块为空，无法新建策略。请先前往 系统设置-数据接入-阻断模块接入页 新增阻断模块'
            );
          } else {
            this.setState({ formVisible: true, drawerTitle: '新建', drawerObj: {} });
          }
        },
      },
      {
        label: '删除',
        type: 'danger',
        hide: this.blockAuth !== 'rw',
        func: () => {
          this.delHandleList();
        },
      },
    ];

    this.columns = [
      {
        title: 'ID',
        dataIndex: 'Fid',
        key: 'Fid',
        // width: 80,
      },
      {
        title: '策略名称',
        dataIndex: 'Fstrategy_name',
        key: 'Fstrategy_name',
        width: 400,
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 400 }}>{text}</div>,
      },
      {
        title: '分类',
        dataIndex: 'Fstrategy_type',
        key: 'Fstrategy_type',
        // width: 200,
        render: (text) => blockerType[text],
      },
      // {
      //   title: '过滤信息',
      //   dataIndex: 'Fstrategy_condition',
      //   key: 'Fstrategy_condition',
      //   // render: (text, record) =>
      //   //   // eslint-disable-next-line no-nested-ternary
      //   //   record.Ftype === 'event' ? (
      //   //     renderEventCondition(record)
      //   //   ) : record.Ftype === 'alarm' ? (
      //   //     renderAlarmCondition(record)
      //   //   ) : (
      //   //         <span>无</span>
      //   //       ),
      // },
      {
        title: '创建人',
        dataIndex: 'Fcreator',
        key: 'Fcreator',
        // width: 200,
      },
      {
        title: '更新时间',
        dataIndex: 'Fupdate_time',
        key: 'Fupdate_time',
        sorter: true,
        // width: 200,
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '启停状态',
        dataIndex: 'Factivated',
        key: 'Factivated',
        sorter: true,
        render: (text, record) => {
          const { statusLoading } = this.state;
          // console.log('record===', 1);
          return (
            <Switch
              loading={statusLoading[record.Fid] || false}
              checkedChildren="开"
              unCheckedChildren="关"
              checked={text === 1}
              onChange={() => {
                if (this.blockAuth !== 'rw') {
                  return;
                }
                this.changeStatus(record);
              }}
            />
          );
        },
      },
      {
        title: this.blockAuth !== 'rw' ? '' : '操作',
        dataIndex: '',
        key: 'action',
        render: (text, record) => {
          if (this.blockAuth !== 'rw') {
            return null;
          }
          const {
            block: { blockModules },
          } = this.props;
          return (
            <div>
              <a
                onClick={() => {
                  if (blockModules.length === 0) {
                    message.error(
                      '阻断模块为空，无法编辑策略。请先前往 系统设置-数据接入-阻断模块接入页 新增阻断模块'
                    );
                  } else {
                    this.setState({
                      formVisible: true,
                      drawerTitle: '编辑',
                      drawerObj: { ...record },
                    });
                  }
                }}
              >
                编辑
              </a>
              <span
                style={{ color: '#2662EE', padding: '0 5px', cursor: 'pointer' }}
                onClick={() => {
                  this.delHandleList(record.Fid);
                }}
              >
                删除
              </span>
            </div>
          );
        },
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'block/fetchStrategyList',
      payload: query,
    });
    dispatch({ type: 'block/fetchBlockModules' });
  }

  // 删除
  delHandleList = (singleID) => {
    const { ids, query } = this.state;
    console.log('singleID==', singleID, 'ids==', ids);
    // const self = this;
    const {
      block: {
        strategyData: { list },
      },
      dispatch,
    } = this.props;
    const { page } = query;
    let newPage = page;
    let reqObj;
    if (!singleID) {
      // 批量删除
      if (list.length === ids.length) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      if (ids.length === 0) {
        message.error('未选择数据');
        return;
      }
      reqObj = { ids };
    } else {
      if (list.length === 1) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      reqObj = { ids: [singleID] };
    }

    dispatch({
      type: 'block/delStrategyList',
      payload: reqObj,
    })
      .then(() => {
        const newQuery = Object.assign({}, query, { page: newPage });
        message.success('删除成功');
        if (!singleID) {
          this.setState({ selectedRowKeys: [], ids: [], query: newQuery });
        } else {
          this.setState({ query: newQuery });
        }

        dispatch({ type: 'block/fetchStrategyList', payload: newQuery });
      })
      .catch((error) => {
        message.error(error.msg);
      });
  };

  changeStatus = (record) => {
    const { Fid, Factivated } = record;
    const { query, statusLoading } = this.state;
    // const { dispatch } = this.props;
    const {
      dispatch,
      block: { blockModules },
    } = this.props;
    if (blockModules.length === 0) {
      message.error(
        '阻断模块为空，无法编辑策略。请先前往 系统设置-数据接入-阻断模块接入页 新增阻断模块'
      );
      return;
    }

    statusLoading[record.Fid] = true;
    this.setState({ statusLoading });
    dispatch({
      type: 'block/updateStrategyList',
      payload: { Fid, Factivated: Factivated === 0 ? 1 : 0 },
    })
      .then((res) => {
        if (res.error_code === 0) {
          message.success('修改状态成功');
        } else {
          message.error('修改状态失败');
        }
        statusLoading[record.Fid] = false;
        this.setState({ statusLoading });
        dispatch({ type: 'block/fetchStrategyList', payload: query });
      })
      .catch((error) => {
        console.log(274, 'error', error);
        message.error(error.msg);
        statusLoading[record.Fid] = false;
        this.setState({ statusLoading });
      });
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.Fid);
    this.setState({ selectedRowKeys, ids });
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
      if (!field) {
        return;
      }
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, { sort: field, dir, page: 1 });
    }
    this.setState({ query: newQuery });
    dispatch({
      type: 'block/fetchStrategyList',
      payload: newQuery,
    });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({
      type: 'block/fetchStrategyList',
      payload: newQuery,
    });
  };

  drawerClose = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    this.setState({ formVisible: false, drawerObj: {}, drawerTitle: '' });
    dispatch({ type: 'block/fetchStrategyList', payload: query });
  };

  filterOnChange = (type, value) => {
    const { query } = this.state;
    const changePart = { [type]: value };
    const newQuery = Object.assign({}, query, changePart);
    this.setState({
      query: newQuery,
    });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({ query: newQuery });
    dispatch({
      type: 'block/fetchStrategyList',
      payload: newQuery,
    });
  };

  render() {
    const {
      block: {
        strategyData: { recordsTotal, list },
      },
      loading,
    } = this.props;
    const { query, selectedRowKeys, formVisible, drawerTitle, drawerObj } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
      // getCheckboxProps: this.getTableCheckboxProps,
    };
    return (
      <div className="contentWraper">
        <div className="commonHeader">阻断策略管理</div>
        <div>
          <div className="filterWrap">
            <FilterBlock
              filterList={this.filterList}
              filterOnChange={this.filterOnChange}
              submitFilter={this.submitFilter}
              colNum={3}
              query={query}
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
              rowKey="Fid"
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
            />
          </div>
        </div>
        {formVisible && (
          <DrawerWidget
            visible={formVisible}
            title={drawerTitle}
            width={960}
            onClose={this.drawerClose}
          >
            <BlockStrategyFormDrawer
              drawerObj={drawerObj}
              drawerTitle={drawerTitle}
              backTablePage={this.drawerClose}
            />
          </DrawerWidget>
        )}
      </div>
    );
  }
}
export default BlockStrategy;
