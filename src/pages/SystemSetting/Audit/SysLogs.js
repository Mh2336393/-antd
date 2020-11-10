import React, { Component } from 'react';
import { connect } from 'umi';
import { Table } from 'antd';
import moment from 'moment';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import configSettings from '../../../configSettings';
// import styles from './index.less';

const format = 'YYYY-MM-DD HH:mm:ss';
const levelMap = {
  0: '错误',
  1: '告警',
  2: '错误、告警',
};
@connect(({ sysLog, loading }) => ({
  sysLog,
  loading: loading.effects['sysLog/fetchList'],
}))
class SysLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        startTime: moment().subtract(7, 'day').format(format),
        endTime: moment().format(format),
        logLevel: '',
        search: '',
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
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
        name: '日志级别',
        key: 'logLevel',
        list: [
          { name: '全部', value: '' },
          { name: '错误', value: '0' },
          { name: '告警', value: '1' },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: '日志内容',
        pressEnter: true,
      },
    ];

    this.columns = [
      {
        title: '上报时间',
        dataIndex: 'report_time',
        key: 'report_time',
        width: 200,
        render: (text) => moment(text).format(format),
      },
      // { title: '人工确认时间', dataIndex: 'confirm_time', key: 'confirm_time', width: 200 },
      { title: '模块', dataIndex: 'component_name', key: 'component_name', width: 160 },
      {
        title: '日志级别',
        dataIndex: 'logLevel',
        key: 'logLevel',
        width: 200,
        render: (text, record) => <span key={record.id}>{levelMap[text]}</span>,
      },
      {
        title: '日志内容',
        dataIndex: 'logContent',
        key: 'logContent',
        // width: 400,
        render: (text) => <div style={{ wordBreak: 'break-word' }}>{text}</div>,
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
    const { query } = this.state;
    dispatch({ type: 'sysLog/fetchList', payload: query });
  };

  export = () => {};

  filterOnChange = (type, value) => {
    const { query } = this.state;
    let val = value;
    // console.log('val', val);
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
    // console.log('newQuery', newQuery.logLevel);

    this.setState({ query: newQuery });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({ query: newQuery });
    // console.log('newQuery', newQuery);
    dispatch({
      type: 'sysLog/fetchList',
      payload: newQuery,
    });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({
      type: 'sysLog/fetchList',
      payload: newQuery,
    });
  };

  render() {
    const { query } = this.state;
    const {
      sysLog: {
        logList: { total, list },
      },
      loading,
    } = this.props;
    const { startTime, endTime, logLevel, search } = query;
    const paramsObj = { startTime, endTime, logLevel, search };

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
            // hrefStr={`/api/event/exportLog?params=${JSON.stringify(paramsObj)}`}
            hrefStr={`/api/sysLog/exportSysLog?params=${JSON.stringify(paramsObj)}`}
            btnList={this.btnList}
            dataLen={list.length}
            total={total}
            bpage={query.page}
            onPageChange={this.paginationChange}
          />
          <Table
            key={list[0] ? list[0].id : 0}
            rowKey="id"
            loading={loading}
            columns={this.columns}
            dataSource={list}
            pagination={{
              pageSize: query.pageSize,
              current: query.page,
              total,
              onChange: this.paginationChange,
            }}
          />
        </div>
      </div>
    );
  }
}
export default SysLogs;
