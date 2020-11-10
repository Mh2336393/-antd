import React, { Component } from 'react';
import { connect } from 'umi';
import { DownSquareOutlined, LeftOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Progress, Divider, DatePicker, Table } from 'antd';
import moment from 'moment';
import { Link } from 'umi';

import configSettings from '../../configSettings';
import styles from './AccountSecurity.less';
import authority from '@/utils/authority';
const { getAuth } = authority;
import ButtonBlock from '@/components/ButtonBlock';

/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */

// const format = 'YYYY-MM-DD HH:mm:ss';
const { RangePicker } = DatePicker;
@connect(({ global, accountViewAll, accountSecurity }) => ({
  hasVpc: global.hasVpc,
  accountViewAll,
  accountSecurity,
}))
class AccountViewAll extends Component {
  constructor(props) {
    super(props);
    this.searchAuth = getAuth('/analysis/search');
    this.accountAuth = getAuth('/topic/account');
    this.state = {
      typeLabel: '',
      query: {
        // size: 100,
        startTime: moment().subtract(7, 'days').valueOf(),
        endTime: moment().valueOf(),
        search: '',
        sort: props.type === 'source' ? '_count' : 'loginFailure',
        dir: 'desc',
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        // currentHoverRow:{}
      },
      columns: [],
      btnList: [],
    };
    this.dataMap = {
      source: 'loginSourceList',
    };
    this.loginSourceColumns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          if (this.searchAuth.indexOf('r') < 0) {
            return null;
          }
          let actionStyle;
          const { type, accountSecurity, preQuery } = this.props;
          const currentDataList = accountSecurity[this.dataMap[type]];
          const { showOperation, query } = this.state;
          const { startTime, endTime } = query;
          // console.log('xx', accountSecurity, currentDataList.list.length);
          if (index < currentDataList.list.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
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
                    <p>
                      <Link
                        target="_blank"
                        to={
                          preQuery.search
                            ? `/analysis/search?startTime=${startTime}&endTime=${endTime}&type=login&condition=src_ip:${record.src_ip} AND login.success:true OR src_ip:${preQuery.search} OR dst_ip:${preQuery.search} OR login.username:${preQuery.search} OR app_proto:${preQuery.search})`
                            : `/analysis/search?startTime=${startTime}&endTime=${endTime}&type=login&condition=src_ip_location.country:${record.country} AND login.success:true`
                        }
                      >
                        查看登录成功记录
                      </Link>
                    </p>
                    <p>
                      <Link
                        target="_blank"
                        to={
                          preQuery.search
                            ? `/analysis/search?startTime=${startTime}&endTime=${endTime}&type=login&condition=src_ip:${record.src_ip} AND login.success:false OR src_ip:${preQuery.search} OR dst_ip:${preQuery.search} OR login.username:${preQuery.search} OR app_proto:${preQuery.search})`
                            : `/analysis/search?startTime=${startTime}&endTime=${endTime}&type=login&condition=src_ip_location.country:${record.country} AND login.success:false`
                        }
                      >
                        查看登录失败记录
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      { title: '来源国家', dataIndex: 'country', key: 'country', width: 300 },
      { title: '登录次数', dataIndex: '_count', key: '_count', width: 300, sorter: true },
      {
        title: '登录成功次数',
        dataIndex: 'loginSuccess',
        key: 'loginSuccess',
        width: 300,
        sorter: true,
      },
      {
        title: '登录失败次数',
        dataIndex: 'loginFailure',
        key: 'loginFailure',
        width: 300,
        sorter: true,
      },
      {
        title: '成功率',
        dataIndex: 'percent',
        key: 'percent',
        width: 300,
        render: (text) => (
          <Progress
            style={{ width: 230 }}
            status="normal"
            percent={text}
            format={(percent) => `${percent}%`}
          />
        ),
      },
    ];
  }

  componentDidMount = () => {
    const { type, preQuery, dispatch } = this.props;
    const { query } = this.state;
    const { startTime, endTime, search } = preQuery;
    let uri;
    let label;
    let columns;
    if (type === 'source') {
      label = '登录来源统计';
      uri = 'fetchLoginSource';
      columns = this.loginSourceColumns;
    }
    const newQuery = Object.assign(query, { startTime, endTime, search });
    this.setState({ query: newQuery, typeLabel: label, columns });
    dispatch({
      type: `accountSecurity/${uri}`,
      payload: newQuery,
    });
  };

  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }

  fetchList = (query, callback) => {
    const { type, dispatch } = this.props;
    const { ...other } = query;
    let uri;
    let finalQuery;
    if (type === 'source') {
      finalQuery = { ...other };
      uri = 'fetchLoginSource';
    }
    dispatch({
      type: `accountSecurity/${uri}`,
      payload: finalQuery,
    }).then(() => {
      if (callback) {
        callback();
      }
    });
  };

  filterOnChange = (type, value) => {
    const { query } = this.state;
    const changePart = { [type]: value };
    const newQuery = Object.assign({}, query, changePart);
    this.setState({
      query: newQuery,
    });
  };

  timePickerChange = (momentArr) => {
    const { query } = this.state;
    const newQuery = Object.assign(query, {
      startTime: momentArr[0].valueOf(),
      endTime: momentArr[1].valueOf(),
    });
    this.setState({ query: newQuery });
  };

  ontimePiker = () => {
    const { query } = this.state;
    this.fetchList(query);
  };

  showOverview = () => {
    const { showOverview } = this.props;
    // dispatch({ type: 'accountViewAll/clearList' });
    showOverview();
  };

  paginationChange = (page, pageSize) => {
    const { query, oldPage, pageSize: oldPageSize } = this.state;
    if (oldPage !== page || pageSize !== oldPageSize) {
      const newQuery = Object.assign({}, query, { page, pageSize });
      this.fetchList(newQuery, () => {
        this.setState({ query: newQuery });
      });
    }
  };

  render() {
    const { typeLabel, query, columns, btnList, currentHoverRow } = this.state;
    const { page, pageSize } = query;
    const { type, accountSecurity } = this.props;
    const { startTime, endTime } = query;
    const currentDataList = accountSecurity[this.dataMap[type]];
    return (
      <div className={styles.TableTdPaddingWrap}>
        <div className={styles.dnsHeader}>
          <span onClick={this.showOverview}>
            <LeftOutlined />
            &nbsp; 返回
          </span>
          <Divider type="vertical" />
          <span>{typeLabel}</span>
        </div>

        <div className={styles.timeRangePicker}>
          <span className={styles.timeRangeLabel}>时间范围：</span>
          <RangePicker
            disabledDate={(current) => current > moment().endOf('day')}
            popupClassName={styles['timeRange-picker']}
            allowClear={false}
            defaultValue={[moment(startTime), moment(endTime)]}
            value={[moment(startTime), moment(endTime)]}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            format="YYYY-MM-DD HH:mm:ss"
            onChange={this.timePickerChange}
            onOk={this.ontimePiker}
            onOpenChange={(status) => {
              if (!status) {
                this.ontimePiker();
              }
            }}
          />
        </div>

        <div className={styles.tableWrapper}>
          <ButtonBlock
            btnList={btnList}
            total={currentDataList.total}
            onPageChange={this.paginationChange}
            bpage={page}
          />
          <Table
            // rowKey={type === 'dynamicDomain' ? 'id' : 'key'}
            // loading={loading}
            columns={columns}
            dataSource={currentDataList.list}
            pagination={{
              pageSize,
              current: page,
              total: currentDataList.total,
            }}
            onChange={this.handleTableChange}
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
const WrappedDNSViewAll = Form.create()(AccountViewAll);
export default WrappedDNSViewAll;
