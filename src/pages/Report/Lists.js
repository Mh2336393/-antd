import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import moment from 'moment';
import { Link } from 'umi';
import { DownSquareOutlined } from '@ant-design/icons';
import { Table, message, Modal, Badge } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import configSettings from '../../configSettings';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

const { confirm } = Modal;
@connect(({ reportLists, loading }) => ({
  reportLists,
  loading: loading.effects['reportLists/fetchList'],
}))
class ReportLists extends Component {
  constructor(props) {
    super(props);
    this.listAuth = getAuth('/reports/lists');
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        search: '', // 搜索
        sort: 'generate_time', // 排序项
        dir: 'desc', // 正序 倒叙
      },
      selectedRowKeys: [],
      ids: [],
      currentHoverRow: '', // 当前hover的行
      showOperation: false, // 显示操作
    };

    this.filterList = [
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: '可搜索所有字段',
        pressEnter: true,
      },
    ];

    this.btnList = [
      {
        label: '删除',
        type: 'danger',
        func: () => {
          this.delHandleEvent();
        },
        hide: this.listAuth !== 'rw',
      },
      {
        label: '导出',
        type: 'primary',
        func: '',
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
            reportLists: {
              reportList: { list },
            },
          } = this.props;
          const { showOperation, currentHoverRow } = this.state;
          if (index < list.length - 1) {
            actionStyle = { top: 10 };
          } else {
            actionStyle = { bottom: 0 };
          }
          const exportParam = { cmd: 'download_report', ids: [record.id] };
          // const startTime = moment(record.time_start).valueOf();
          // const endTime = moment(record.time_end).valueOf();
          // const generateTime = moment(record.generate_time).valueOf();
          // const fileName = encodeURIComponent(`yujiereport_${record.id}_${record.task_name}.pdf`);

          return (
            <div style={{ width: 20, height: 20 }}>
              <div className={styles.tableAction}>
                <DownSquareOutlined
                  onClick={() => {
                    this.setState({ showOperation: !showOperation });
                  }}
                  style={{ color: '#5cbaea' }} />
                {showOperation && currentHoverRow === index && (
                  <div className={styles.actionContent} style={actionStyle}>
                    <Fragment>
                      <Link
                        style={{ width: '100%', marginBottom: '10px' }}
                        // to={`/report/templateFst?id=${record.id}`}
                        to={`/api/report/yujieReport?id=${record.id}&name=${record.task_name}`}
                        target="_blank"
                        onClick={() => {
                          this.setState({ showOperation: false });
                        }}
                      >
                        预览
                      </Link>

                      <a
                        style={{ width: '100%', marginBottom: '10px' }}
                        href={`/api/report/exportReportList?params=${JSON.stringify(exportParam)}`}
                        onClick={(e) => {
                          this.goTo(record, e);
                        }}
                      >
                        导出
                      </a>

                      {this.listAuth === 'rw' && (
                        <p
                          style={{ width: '100%', marginBottom: '10px' }}
                          onClick={() => {
                            this.setState({ showOperation: false });
                            this.delHandleEvent(record.id);
                          }}
                        >
                          删除
                        </p>
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
        title: '报表名称',
        dataIndex: 'template_name',
        key: 'template_name',
        render: (text, record) => (
          <Link
            to={`/api/report/yujieReport?id=${record.id}&name=${record.task_name}`}
            target="_blank"
          >
            {text}
          </Link>
        ),
      },
      {
        title: '报表任务',
        dataIndex: 'task_name',
        key: 'task_name',
        render: (text) => (
          <span style={{ maxWidth: 300, display: 'inline-block' }} className="ellipsis">
            {text}
          </span>
        ),
        // render: text => <Link to={`/reports/tasks?task_name=${text}`}>{text}</Link>,
      },
      {
        title: '生成时间',
        dataIndex: 'generate_time',
        key: 'generate_time',
        sorter: true,
        render: (text) =>
          text === '0000-00-00 00:00:00' ? text : moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
    ];
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    const { query } = this.state;
    let newQuery;
    if (Object.keys(location.query).length > 0) {
      newQuery = Object.assign({}, query, location.query);
    } else {
      newQuery = query;
    }
    dispatch({
      type: 'reportLists/fetchList',
      payload: newQuery,
    });
  }

  goTo = (record, e) => {
    const { complete_status: status } = record;
    this.setState({ showOperation: false });
    if (status === 'failed') {
      e.preventDefault();
      message.info('报表生成失败，无法导出');
      return false;
    }
    if (status === 'processing') {
      e.preventDefault();
      message.info('报表正在生成中，无法导出');
      return false;
    }
    return true;
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
    const { search } = query;
    const newQuery = Object.assign({}, query, { page: 1, search: configSettings.trimStr(search) });
    this.setState({ query: newQuery });
    dispatch({
      type: 'reportLists/fetchList',
      payload: newQuery,
    });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({ type: 'reportLists/fetchList', payload: newQuery });
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
      if (['generate_time'].indexOf(field) < 0 || !field) {
        return;
      }
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, { sort: field, dir, page: 1 });
    }
    this.setState({ query: newQuery });
    dispatch({ type: 'reportLists/fetchList', payload: newQuery });
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.id);
    this.setState({ selectedRowKeys, ids });
  };

  // 删除
  delHandleEvent = (singleID) => {
    const { ids, query } = this.state;
    const self = this;
    const {
      reportLists: {
        reportList: { list },
      },
      dispatch,
    } = this.props;
    const { page } = query;
    let newPage = page;

    if (!singleID) {
      if (list.length === ids.length) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      if (ids.length === 0) {
        message.error('未选择事件');
        return;
      }
      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          dispatch({
            type: 'reportLists/handleDel',
            payload: { ids },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState({ selectedRowKeys: [], ids: [], query: newQuery });
              dispatch({ type: 'reportLists/fetchList', payload: newQuery });
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() {},
      });
    } else {
      if (list.length === 1) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          dispatch({
            type: 'reportLists/handleDel',
            payload: { ids: [singleID] },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState({ query: newQuery });
              dispatch({ type: 'reportLists/fetchList', payload: newQuery });
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() {},
      });
    }
  };

  render() {
    const { query, selectedRowKeys, currentHoverRow, ids } = this.state;
    const {
      reportLists: { reportList },
      loading,
    } = this.props;
    const { recordsTotal, list } = reportList;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
    };
    let paramsObj = '';
    if (ids.length) {
      paramsObj = JSON.stringify({ cmd: 'download_report', ids });
    }
    return (
      <div className="contentWraper">
        <div className="commonHeader">报表列表</div>
        <div className="filterWrap">
          <FilterBlock
            filterList={this.filterList}
            filterOnChange={this.filterOnChange}
            submitFilter={this.submitFilter}
            colNum={4}
            query={query}
          />
        </div>
        <div className="TableTdPaddingWrap">
          {/* <div className={styles.filterBlock}>
            <FilterBlock
              filterList={this.filterList}
              filterOnChange={this.filterOnChange}
              submitFilter={this.submitFilter}
              colNum={4}
              query={query}
            />
          </div> */}
          <ButtonBlock
            btnList={this.btnList}
            bpage={query.page}
            bsize={query.pageSize}
            total={recordsTotal}
            onPageChange={this.paginationChange}
            hrefStr={`/api/report/exportReportList?params=${paramsObj}`}
          />
          {recordsTotal > 900 && (
            <div style={{ color: '#999' }}>
              <Badge status="warning" />
              你的报表数已达到
              {recordsTotal}
              条，系统最多保存1000份报表，请及时删除不需要的报表！
            </div>
          )}
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
            rowClassName={(record, index) => (index === currentHoverRow ? styles.handleAction : '')}
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
      </div>
    );
  }
}

export default ReportLists;
