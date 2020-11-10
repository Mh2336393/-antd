import React, { Component } from 'react';
import { connect } from 'umi';
import { DownSquareOutlined, LeftOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Table,
  message,
  Modal,
  Progress,
  Popover,
  Divider,
  DatePicker,
  Input,
  Button,
} from 'antd';
import moment from 'moment';
import { Link } from 'umi';
// import FilterBlock from '@/components/FilterBlock';
import ButtonBlock from '@/components/ButtonBlock';
import configSettings from '../../configSettings';
import styles from './Overview.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

/* eslint-disable prefer-destructuring */

const format = 'YYYY-MM-DD HH:mm:ss';
const { RangePicker } = DatePicker;
@connect(({ global, dashboardDns, dnsViewAll, loading }) => ({
  dashboardDns,
  hasVpc: global.hasVpc,
  dnsViewAll,
  loading: loading.effects['dnsViewAll/fetchDnsList'],
}))
class dnsViewAll extends Component {
  constructor(props) {
    super(props);
    this.searchAuth = getAuth('/analysis/search');
    this.domainAuth = getAuth('/topic/dns');
    this.state = {
      typeLabel: 'DNS解析错误分析',
      page: 1,
      limit: parseInt(configSettings.pageSizeOptions[0], 10),
      query: {
        size: 100,
        startTime: moment().subtract(7, 'days').valueOf(),
        endTime: moment().valueOf(),
        search: '',
        sort: 'doc_count',
        dir: 'asc',
        whiteList: [],
      },
      whiteManageVisible: false, // 显示操作
      modalType: false, // 控制显示不一样的modal
      columns: [],
      whiteColumns: [],
      whiteList: [],
      btnList: [],
    };
    this.commonFstColumn = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          let actionStyle;
          let condition;
          const {
            dnsViewAll: { dnsList },
            type,
          } = this.props;
          const {
            showOperation,
            query: { startTime, endTime, search },
          } = this.state;

          if ((type === 'parseError' || type === 'parseType') && this.searchAuth.indexOf('r') < 0) {
            return null;
          }

          if (
            (type === 'serverAnalysis' || type === 'dynamicDomain') &&
            this.searchAuth.indexOf('r') < 0 &&
            this.domainAuth !== 'rw'
          ) {
            return null;
          }

          if (index < dnsList.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }
          // 不同的type类型跳检索页
          if (type === 'parseError') {
            // 'DNS解析错误分析';
            condition = `dns.rcode:${record.key}`;
          } else if (type === 'parseType') {
            // 'DNS解析类型分析';
            condition = `dns.rrtype:${record.key}`;
          } else if (type === 'serverAnalysis') {
            // 'DNS服务器分析';
            condition = `dns.type:query AND dst_ip:${record.key.split('(')[0]}`;
          } else {
            // '动态域名流量解析'
            condition = `dns.type:answer AND dns.answers.rrtype:A AND dns.rcode:NOERROR AND dst_ip:${record.key} AND dns.rrname:"${record.rrname}"`;
          }
          if (search) {
            condition += ` AND (dst_ip:${search} OR src_ip:${search} OR dns.rrname:"${search}")`;
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
                    {this.searchAuth.indexOf('r') > -1 && (
                      <Link
                        to={`/analysis/search?startTime=${startTime}&endTime=${endTime}&type=dns&condition=${condition}`}
                      >
                        数据检索
                      </Link>
                    )}
                    {(type === 'serverAnalysis' || type === 'dynamicDomain') &&
                      this.domainAuth === 'rw' && (
                        <p
                          onClick={() => {
                            // 将该记录添加到白名单
                            this.addToWhiteList(record);
                          }}
                        >
                          忽略该记录
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
    ];
    this.commonColumns = [
      {
        title: '请求数',
        dataIndex: 'doc_count',
        key: 'doc_count',
        sorter: true,
        width: 200,
      },
      {
        title: '最近请求时间',
        dataIndex: 'time',
        key: 'time',
        sorter: true,
        render: (text) => (text ? moment(text).format(format) : ''),
        width: 200,
      },
      {
        title: '占比',
        dataIndex: 'percent',
        key: 'percent',
        // sorter: true,
        render: (text) => (
          <Progress percent={text} size="small" status="active" style={{ width: 200 }} />
        ),
        width: 300,
      },
    ];
    // DNS解析错误
    this.parseErrorColumns = [
      {
        title: '错误类型',
        dataIndex: '',
        key: 'error',
        width: 200,
        render: (text, record) => configSettings.errorType(record.key).text,
      },
      {
        title: 'RCode',
        dataIndex: 'key',
        key: 'key',
        width: 200,
      },
    ];
    // DNS解析类型
    this.parseTypeColumns = [
      {
        title: '解析类型',
        dataIndex: 'key',
        key: 'key',
        width: 200,
      },
    ];
    // DNS服务器分析
    this.serverAnalysisColumns = [
      {
        title: 'DNS服务器IP',
        dataIndex: 'key',
        key: 'key',
        width: 300,
      },
      // {
      //   title: 'IP归属地',
      //   dataIndex: 'location',
      //   key: 'location',
      //   width: 200,
      // },
    ];
    // 动态域名流量分析
    this.dynamicDomainColumns = [
      {
        title: '受影响资产',
        dataIndex: 'asset',
        key: 'asset',
        width: 200,
        render: (text, record) => (text ? `${text} (${record.key})` : `${record.key}`),
      },
      {
        title: '请求域名',
        dataIndex: 'rrname',
        key: 'rrname',
        width: 200,
      },
      {
        title: '域名IP',
        dataIndex: 'domainIp',
        key: 'domainIp',
        width: 200,
        render: (text) => {
          if (typeof text === 'object') {
            const popContent = (
              <div>
                {text.map((ip) => (
                  <p key={ip}>{ip}</p>
                ))}
              </div>
            );
            return (
              <div className={styles.popoverLimitHei}>
                {text.length > 1 ? (
                  <Popover
                    content={popContent}
                    getPopupContainer={(triggerNode) => triggerNode}
                    placement="bottomLeft"
                    title="域名IP"
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
          return text;
        },
      },
      // {
      //   title: 'ip归属地',
      //   dataIndex: 'time',
      //   key: 'time',
      //   sorter: true,
      //   render: text => moment(text).format(format),
      //   width: 200,
      // }
    ];
    if (props.hasVpc) {
      this.dynamicDomainColumns.splice(1, 0, {
        title: 'VPCID',
        dataIndex: 'vpcid',
        key: 'vpcid',
        width: 120,
      });
    }
    this.whitelistColumns = [
      {
        title: 'DNS服务器IP',
        dataIndex: 'ip',
        key: 'ip',
      },
      {
        title: '请求源IP',
        dataIndex: 'ip',
        key: 'ip',
      },
      {
        title: '操作',
        dataIndex: '',
        key: 'action',
        render: (text, record) => (
          <a
            onClick={() => {
              this.whiteOpetation(record.ip);
            }}
          >
            删除
          </a>
        ),
      },
    ];
    this.btnList = [
      {
        label: '白名单管理',
        hide: this.domainAuth !== 'rw',
        func: () => {
          this.whiteManage();
        },
      },
    ];
  }

  componentDidMount = () => {
    const {
      type,
      preQuery,
      dashboardDns: { dnsWhiteList, domainWhiteList },
      dispatch,
    } = this.props;
    const { query } = this.state;
    const { whiteList: list, ...other } = query;
    const { startTime, endTime, search } = preQuery;
    let uri;
    let label;
    let finalQuery;
    let columns;
    let whiteColumns = [];
    let btnList = [];
    let whiteList = [];
    if (type === 'parseError') {
      label = 'DNS解析错误分析';
      finalQuery = { ...other };
      uri = 'dashboard/getDnsErrorAnalyze';
      columns = this.commonFstColumn.concat(this.parseErrorColumns).concat(this.commonColumns);
    } else if (type === 'parseType') {
      label = 'DNS解析类型分析';
      finalQuery = { ...other };
      uri = 'dashboard/getDnsTypeAnalyze';
      columns = this.commonFstColumn.concat(this.parseTypeColumns).concat(this.commonColumns);
    } else if (type === 'serverAnalysis') {
      label = 'DNS服务器分析';
      finalQuery = Object.assign(query, { whiteList: dnsWhiteList });
      uri = 'dashboard/getDnsServerList';
      columns = this.commonFstColumn.concat(this.serverAnalysisColumns).concat(this.commonColumns);
      whiteColumns = [this.whitelistColumns[0], this.whitelistColumns[2]];
      btnList = this.btnList;
      whiteList = dnsWhiteList;
    } else {
      label = '动态域名流量分析';
      finalQuery = Object.assign(query, { whiteList: domainWhiteList, dir: 'desc' });
      uri = 'dashboard/getDnsDynamicDomainList';
      columns = this.commonFstColumn.concat(this.dynamicDomainColumns);
      columns.splice(3, 0, this.commonColumns[0], this.commonColumns[1]);
      whiteColumns = this.whitelistColumns.slice(1);
      btnList = this.btnList;
      whiteList = domainWhiteList;
    }
    finalQuery = Object.assign(finalQuery, { startTime, endTime, search });
    const newQuery = Object.assign(query, { ...finalQuery });
    this.setState({ query: newQuery, typeLabel: label, whiteList, btnList, columns, whiteColumns });
    dispatch({
      type: 'dnsViewAll/fetchDnsList',
      payload: { uri, body: finalQuery },
    });
  };

  // componentWillReceiveProps = nextProps => {
  //   const {
  //     type,
  //     dashboardDns: { dnsWhiteList, domainWhiteList },
  //     dispatch,
  //   } = nextProps;
  //   const { dashboardDns: preData } = this.props;
  //   const { query } = this.state;
  //   if (
  //     (type === 'serverAnalysis' && dnsWhiteList !== preData.dnsWhiteList) ||
  //     (type === 'dynamicDomain' && domainWhiteList !== preData.domainWhiteList)
  //   ) {
  //     let uri;
  //     let whiteList;
  //     if (type === 'serverAnalysis') {
  //       uri = 'dashboard/getDnsServerList';
  //       whiteList = dnsWhiteList;
  //     } else {
  //       uri = 'dashboard/getDnsDynamicDomainList';
  //       whiteList = domainWhiteList;
  //     }
  //     const dnsQuery = Object.assign(query, { whiteList });
  //     this.setState({ query: dnsQuery });
  //     dispatch({
  //       type: 'dnsViewAll/fetchDnsList',
  //       payload: { uri, body: dnsQuery },
  //     });
  //   }
  // };

  componentWillUnmount = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'dnsViewAll/clearList' });
  };

  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }

  whiteOpetation = (queryip) => {
    // console.log('删除');
    const { type, dispatch } = this.props;
    const { whiteList, query } = this.state;
    let deleteType = '';
    // let queryType = '';
    let uri;
    if (type === 'serverAnalysis') {
      deleteType = 'dns_server';
      uri = 'dashboard/getDnsServerList';
    } else if (type === 'dynamicDomain') {
      deleteType = 'dynamic_domain';
      uri = 'dashboard/getDnsDynamicDomainList';
    }
    dispatch({
      type: 'dnsViewAll/deleteWhiteList',
      payload: { ip: queryip, type: deleteType },
    }).then((res) => {
      if (res.error_code === 0) {
        const deleteList = whiteList.filter((item) => item !== queryip);
        const queryList = query.whiteList.filter((item) => item !== queryip);
        query.whiteList = queryList;
        this.setState({ whiteList: deleteList });
        dispatch({
          type: 'dnsViewAll/fetchDnsList',
          payload: { uri, body: query },
        });
      }
    });
  };

  whiteManage = () => {
    const { type, dispatch } = this.props;
    let queryType = '';
    // const { whiteList } = this.state;
    if (type === 'serverAnalysis') {
      queryType = 'dns_server';
    } else if (type === 'dynamicDomain') {
      queryType = 'dynamic_domain';
    }
    dispatch({
      type: 'dnsViewAll/fetchWhiteList',
      payload: { type: queryType },
    }).then((res) => {
      const ips = res.map((item) => item.ip);
      this.setState({ whiteList: ips });
    });
    this.setState({ whiteManageVisible: true, modalType: true });
  };

  fetchDnsList = (query, callback) => {
    const { type, dispatch } = this.props;
    const { whiteList, ...other } = query;
    let uri;
    let finalQuery;
    if (type === 'parseError') {
      finalQuery = { ...other };
      uri = 'dashboard/getDnsErrorAnalyze';
    } else if (type === 'parseType') {
      finalQuery = { ...other };
      uri = 'dashboard/getDnsTypeAnalyze';
    } else if (type === 'serverAnalysis') {
      finalQuery = query;
      uri = 'dashboard/getDnsServerList';
    } else {
      finalQuery = query;
      uri = 'dashboard/getDnsDynamicDomainList';
    }
    dispatch({
      type: 'dnsViewAll/fetchDnsList',
      payload: { uri, body: finalQuery },
    }).then(() => {
      if (callback) {
        callback();
      }
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
    this.fetchDnsList(query);
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query, page, limit } = this.state;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== page || pageSize !== limit) {
      this.setState({ page: current, limit: pageSize });
    } else {
      const { field, order } = sorter;
      if (field === 'doc_count' || field === 'time') {
        const dir = order === 'descend' ? 'desc' : 'asc';
        newQuery = Object.assign({}, query, {
          dir,
          sort: field,
        });
        // // 根据type调用不同接口
        this.fetchDnsList(newQuery, () => {
          this.setState({ page: 1 });
        });
      }
    }
  };

  paginationChange = (page, pageSize) => {
    this.setState({ page, limit: pageSize });
  };

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ value });
  };

  searchIp = (value, type) => {
    const { dispatch } = this.props;
    let queryType = '';
    if (type === 'DNS服务器分析') {
      queryType = 'dns_server';
    } else if (type === '动态域名流量分析') {
      queryType = 'dynamic_domain';
    }
    dispatch({
      type: 'dnsViewAll/searchWhiteList',
      payload: { ip: value, type: queryType },
    })
      .then((res) => {
        const ips = res.map((item) => item.value);
        this.setState({ whiteList: ips });
      })
      .catch(() => {});
  };

  // closeModal = () => {
  // const { type, dispatch } = this.props;
  // let queryType = '';
  // // const { whiteList } = this.state;
  // if (type === 'serverAnalysis') {
  //   queryType = 'dns_server';
  // } else if (type === 'dynamicDomain') {
  //   queryType = 'dynamic_domain';
  // }
  // dispatch({
  //   type: 'dnsViewAll/fetchWhiteList',
  //   payload: { type: queryType },
  // }).then(res => {
  //   const ips = res.map(item => item.ip);
  //   this.setState({ whiteList: ips });
  // });
  // };

  // handleCancel = () => {
  //   this.setState({ whiteManageVisible: false, modalType: true });
  // };

  // 将记录添加到白名单
  addToWhiteList = (record) => {
    const { type, dispatch } = this.props;
    const { query } = this.state;
    let queryType = '';
    let uri;
    // console.log('type', type);
    if (type === 'serverAnalysis') {
      queryType = 'dns_server';
      uri = 'dashboard/getDnsServerList';
    } else if (type === 'dynamicDomain') {
      queryType = 'dynamic_domain';
      uri = 'dashboard/getDnsDynamicDomainList';
    }
    dispatch({
      type: 'dnsViewAll/addToWhiteList',
      payload: { ip: record.key, type: queryType },
    })
      .then((addRes) => {
        if (addRes.length) {
          // addRes.insertId
          dispatch({
            type: 'dnsViewAll/fetchWhiteList',
            payload: { type: queryType },
          })
            .then((res) => {
              query.whiteList = res.map((item) => item.ip);
              message.success('已将改IP添加到白名单，记录将不再显示');
              // this.setState({ whiteManageVisible: true });
              dispatch({
                type: 'dnsViewAll/fetchDnsList',
                payload: { uri, body: query },
              });
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  };

  showOverview = () => {
    const { showOverview, dispatch } = this.props;
    dispatch({ type: 'dnsViewAll/clearList' });
    showOverview();
  };

  render() {
    const {
      typeLabel,
      query,
      currentHoverRow,
      whiteManageVisible,
      modalType,
      page,
      limit,
      whiteList,
      btnList,
      columns,
      whiteColumns,
      value,
    } = this.state;
    const {
      type,
      dnsViewAll: { dnsList },
      loading,
    } = this.props;
    const { startTime, endTime } = query;
    const newWhiteList = whiteList.map((ip) => ({ ip }));
    return (
      <div>
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
        <div className="TableTdPaddingWrap">
          <ButtonBlock
            btnList={btnList}
            total={dnsList.length}
            onPageChange={this.paginationChange}
            bpage={page}
          />
          <Table
            rowKey={type === 'dynamicDomain' ? 'id' : 'key'}
            loading={loading}
            columns={columns}
            dataSource={dnsList}
            pagination={{
              pageSize: limit,
              current: page,
              total: dnsList.length,
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
        {modalType && (
          <Modal
            title="白名单"
            visible={whiteManageVisible}
            footer={null}
            onCancel={() => {
              this.setState({ whiteManageVisible: false, value: '' });
            }}
          >
            <div>
              <div>
                <span>搜索:</span>
                <Input
                  placeholder="可搜索IP"
                  value={value}
                  onChange={this.handleChange}
                  style={{ width: '100px', margin: '0px 10px 0px 10px' }}
                  size="small"
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    this.searchIp(value, typeLabel);
                  }}
                >
                  搜索
                </Button>
              </div>
            </div>
            <Table
              rowKey="ip"
              columns={whiteColumns}
              dataSource={newWhiteList}
              pagination={false}
            />
          </Modal>
        )}
        {/* {!modalType && (
          <Modal
            title="提示"
            visible={whiteManageVisible}
            footer={
              <Button type="primary" key="confirm" size="large" onClick={this.handleCancel}>
                确认
              </Button>
            }
            onCancel={() => {
              this.setState({ whiteManageVisible: false, modalType: true });
            }}
          >
            <div>已将改IP添加到白名单，记录将不再显示</div>
          </Modal>
        )} */}
      </div>
    );
  }
}
const WrappedDNSViewAll = Form.create()(dnsViewAll);
export default WrappedDNSViewAll;
