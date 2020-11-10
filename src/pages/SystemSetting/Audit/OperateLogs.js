import React, { Component } from 'react';
import { connect } from 'umi';
import { Table } from 'antd';
import moment from 'moment';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import configSettings from '../../../configSettings';
// import styles from './index.less';

const format = 'YYYY-MM-DD HH:mm:ss';
@connect(({ audit, loading }) => ({
  audit,
  loading: loading.effects['audit/fetchLogList'],
}))
class OperateLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        page: 1,
        limit: parseInt(configSettings.pageSizeOptions[0], 10),
        startTime: moment().subtract(7, 'day').format(format),
        endTime: moment().format(format),
        timeSelect: '7',
        user_role: '',
        operation: '',
        search: '',
      },
    };

    this.filterList = [
      {
        type: 'select',
        name: '时间',
        key: 'timeRange',
        list: [
          { name: '近24小时', value: '近24小时' },
          { name: '近7天', value: '近7天' },
          { name: '近30天', value: '近30天' },
          { name: '自定义', value: '自定义' },
        ],
      },
      {
        type: 'select',
        name: '角色',
        key: 'user_role',
        list: [
          { name: '全部', value: '' },
          { name: '超级管理员', value: 1 },
          { name: '普通管理员', value: 2 },
          { name: '审计员', value: 3 },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: '账号/登录IP/日志内容',
        pressEnter: true,
      },
      {
        type: 'select',
        name: '操作',
        key: 'operation',
        list: [
          { name: '全部', value: '' },
          { name: '新增', value: 'add' },
          { name: '编辑', value: 'update' },
          { name: '删除', value: 'delete' },
          { name: '登录', value: 'login' },
          { name: '登出', value: 'logout' },
          { name: '导入', value: 'import' },
          { name: '导出', value: 'export' },
        ],
      },
    ];

    this.columns = [
      {
        title: '时间',
        dataIndex: 'create_time',
        key: 'create_time',
        width: 200,
        render: (text) => moment(text).format(format),
      },
      {
        title: '账号',
        dataIndex: 'user_id',
        key: 'user_id',
        width: 200,
      },
      {
        title: '登录IP',
        dataIndex: 'login_ip',
        key: 'login_ip',
        width: 200,
      },
      {
        title: '角色',
        dataIndex: 'user_role',
        key: 'user_role',
        width: 200,
        render: (text) => configSettings.roleMap[text],
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: (text) => {
          switch (text) {
            case 'add':
              return '新增';
            case 'update':
              return '编辑';
            case 'delete':
              return '删除';
            case 'login':
              return '登录';
            case 'logout':
              return '登出';
            case 'import':
              return '导入';
            case 'export':
              return '导出';
            default:
              return '';
          }
        },
      },
      {
        title: '日志内容',
        dataIndex: 'content',
        key: 'content',
        width: 400,
      },
    ];

    this.btnList = [
      {
        label: '全部导出',
        func: this.export,
        type: 'primary',
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    const {
      query: { timeSelect, ...other },
    } = this.state;
    dispatch({
      type: 'audit/fetchLogList',
      payload: { uri: 'audit/getOperateLogs', body: { ...other } },
    });
  };

  export = () => {};

  filterOnChange = (type, value) => {
    const { query } = this.state;
    let val = value;
    let changePart;
    if (type === 'timeRange') {
      changePart = {
        startTime: moment(value[0]).format(format),
        endTime: moment(value[1]).format(format),
      };
    } else {
      if (type === 'search') {
        val = configSettings.trimStr(value);
      }
      changePart = { [type]: val };
    }
    const newQuery = Object.assign({}, query, changePart);

    this.setState({ query: newQuery });
    // this.setState({
    //   query: newQuery,
    // });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    const { timeSelect, ...other } = newQuery;
    dispatch({
      type: 'audit/fetchLogList',
      payload: { uri: 'audit/getOperateLogs', body: { ...other } },
    });
    this.setState({ query: newQuery });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, limit: pageSize });
    const { timeSelect, ...other } = newQuery;
    dispatch({
      type: 'audit/fetchLogList',
      payload: { uri: 'audit/getOperateLogs', body: { ...other } },
    });
    this.setState({ query: newQuery });
  };

  render() {
    const { query } = this.state;
    const {
      audit: {
        logList: { recordsTotal, list },
      },
      loading,
    } = this.props;
    const { startTime, endTime, user_role: userRole, operation, search } = query;
    const paramsObj = { startTime, endTime, user_role: userRole, operation, search };

    return (
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
            total={recordsTotal}
            onPageChange={this.paginationChange}
            bpage={query.page}
            dataLen={list.length}
            // hrefStr={`/api/event/exportLog?params=${JSON.stringify(paramsObj)}`}
            hrefStr={`/api/audit/exportOperateLog?params=${JSON.stringify(paramsObj)}`}
          />
          <Table
            rowKey="id"
            loading={loading}
            columns={this.columns}
            dataSource={list}
            pagination={{
              pageSize: query.limit,
              current: query.page,
              total: recordsTotal,
              onChange: this.paginationChange,
            }}
          />
        </div>
      </div>
    );
  }
}
export default OperateLogs;
