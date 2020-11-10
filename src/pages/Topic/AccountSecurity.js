/*
 * @Author: finazhang
 * @Date: 2018-12-06 15:43:05
 * @Last Modified by: finazhang
 * @Last Modified time: 2019-02-18 11:06:20
 *  账号安全页面
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import numeral from 'numeral';
import moment from 'moment';
import { DownSquareOutlined, QuestionCircleFilled } from '@ant-design/icons';
import {
  Menu,
  Row,
  Col,
  Card,
  Table,
  Popover,
  Tooltip,
  Radio,
  Pagination,
  Button,
  Modal,
  Input,
  message,
  Tabs,
} from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import { Link } from 'umi';

import { Pie, BubbleMap, StackAreaDiagram } from '@/components/Charts';
import WeakPasswordManageModal from '@/components/WeakPasswordManageModal';
import Yuan from '@/utils/Yuan';
import styles from './AccountSecurity.less';
import AccountSecurityDetail from './AccountViewAll';
import authority from '@/utils/authority';
const { getAuth } = authority;

const { TabPane } = Tabs;

const Desc = ({ value }) => (
  <div>
    <h4 style={{ color: '#fff' }}>场景描述</h4>
    <p>{value[0]}</p>
    <h4 style={{ color: '#fff' }}>使用方法</h4>
    <p>{value[1]}</p>
  </div>
);

@connect(({ global, accountSecurity, loading }) => ({
  accountSecurity,
  hasVpc: global.hasVpc,
  loginSourceLoading: loading.effects['accountSecurity/fetchLoginSource'],
  loginBehaviorLoading: loading.effects['accountSecurity/fetchLoginBehaviorTrend'],
  explodeAccountLoading: loading.effects['accountSecurity/fetchExplodeAccountList'],
  explodeBehaviorLoading: loading.effects['accountSecurity/fetchExplodeBehaviorList'],
  weakPasswordTableLoading: loading.effects['accountSecurity/fetchWeakPasswordList'],
  weakPasswordExpandTableLoading:
    loading.effects['accountSecurity/fetchWeakPasswordAggregationDisplay'],
}))
class AccountSecurity extends Component {
  constructor(props) {
    super(props);
    this.accountAuth = getAuth('/topic/account');
    console.log('this.accountAuth==', this.accountAuth);
    this.state = {
      query: {
        startTime: moment().subtract(1, 'day').valueOf(),
        endTime: moment().valueOf(),
        search: '',
      },
      timeRange: '近24小时',
      // 爆破统计排序
      explodeSort: 'loginFailure',
      // 爆破目录
      explodeDir: 'desc',
      showDetail: false,
      detailType: '',
      // 登录类型 （登录成功，登录失败）
      loginType: '登录成功',
      // 当前爆破统计模式，logInStatistics(账号登录统计),conductStatistical(行为统计)
      currentBlastingStatisticalModel: 'logInStatistics',
      // 分页设置
      pagination: {
        page: 1,
        pageSize: 10,
      },
      // 白名单列表
      whiteList: [],
      // 白名单管理对话框是否显示
      whiteManageVisible: false,
      // 白名单搜索关键字
      whiteListSearch: '',
      // 是否显示表格第一列的操作方式
      showOperation: false,
      // 鼠标悬浮的爆破表的行（索引是个数字）
      currentHoverRow: '',
      // 弱密码分页设置
      weakPasswordPagination: {
        page: 1,
        pageSize: 10,
      },
      // 弱密码表得排序方式默认降序
      weakPsswordSort: 'desc',
      /**
       * 弱密码表按哪种类型进行排序
       * 登录源个数(numberOfLoginSourceIP)，登录成功次数(loginSuccessTimes)
       *  登录失败次数(logonFailureTimes), 首次登录时间(firstLoginTime)，最后登录时间(lastLoginTime)
       *  */
      weakPsswordSortCol: 'numberOfLoginSourceIP',
      // 弱密码库是否展示
      weakPasswordManageVisible: false,
      // 是否显示弱密码表第一列的操作方式
      showWeakPasswordOperation: false,
      // 鼠标悬浮的弱密码表的行（索引是个数字）
      currentWeakPasswordHoverRow: '',
    };
    // 登录来源的列
    this.loginSourceColumns = [
      {
        title: '来源国家',
        dataIndex: 'country',
        key: 'country',
        render: (country) => (
          <p
            onClick={() => {
              this.skipSearchPage();
            }}
          >
            {
              <span
                className={styles.locationSpan}
                style={{ backgroundImage: `url('/image/location/${country}.svg')` }}
              />
            }
            {country}
          </p>
        ),
      },
      { title: '登录次数', dataIndex: '_count', key: '_count' },
      {
        title: '成功率',
        dataIndex: 'percent',
        key: 'percent',
        render: (text) => `${text}%`,
      },
    ];
    // 爆破账号登录统计的列
    this.explodeAccountColumns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          if (this.accountAuth.indexOf('r') < 0 && this.accountAuth !== 'rw') {
            return null;
          }

          let actionStyle;
          const {
            accountSecurity: {
              explodeList, // 爆破统计表
            },
          } = this.props;
          const { showOperation, query } = this.state;

          if (index < explodeList.list.length - 1) {
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
                    {this.accountAuth.indexOf('r') > -1 && (
                      <Link
                        target="_blank"
                        to={`/analysis/search?startTime=${query.startTime}&endTime=${
                          query.endTime
                        }&type=login&condition=login.username:${
                          record.username || `""`
                        } AND src_ip:${record.src_ip} AND dst_ip:${record.dst_ip} AND app_proto:${
                          record.app_proto
                        }`}
                      >
                        数据检索
                      </Link>
                    )}
                    {this.accountAuth === 'rw' && (
                      <Fragment>
                        <p
                          onClick={() => {
                            this.addToWhiteList('current_record', record);
                          }}
                        >
                          忽略本条记录
                        </p>
                        <p
                          onClick={() => {
                            this.addToWhiteList('dst_account', {
                              attack_ip: record.src_ip,
                              dst_ip: record.dst_ip,
                              protocol: record.app_proto,
                              dst_account: record.username,
                            });
                          }}
                        >
                          忽略该目标账号记录
                        </p>
                      </Fragment>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: '目标账号',
        dataIndex: 'username',
        key: 'username',
        render: (text) => (
          <p className="ellipsis" style={{ maxWidth: '300px' }} title={text}>
            {text}
          </p>
        ),
      },
      {
        title: '所属IP',
        dataIndex: 'dst_ip',
        key: 'dst_ip',
        render: (text, record) => {
          if (record.dst_country) {
            return `${text}(${record.dst_country})`;
          }
          return `${text}`;
        },
      },
      { title: '所属协议', dataIndex: 'app_proto', key: 'app_proto' },
      {
        title: '攻击者IP',
        dataIndex: 'src_ip',
        key: 'src_ip',
        render: (text, record) => {
          if (record.src_country) {
            return `${text}(${record.src_country})`;
          }
          return `${text}`;
        },
      },
      { title: '登录失败次数', dataIndex: 'loginFailure', key: 'loginFailure', sorter: true },
      { title: '登录成功次数', dataIndex: 'loginSuccess', key: 'loginSuccess', sorter: true },
      { title: '首次登录成功时间', dataIndex: 'oldestTime', key: 'oldestTime', sorter: true },
    ];
    // 爆破行为统计的列
    this.explodeBehaviorColumns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          if (this.accountAuth.indexOf('r') < 0 && this.accountAuth !== 'rw') {
            return null;
          }
          // eslint-disable-next-line camelcase
          const { dst_ip, app_proto, username } = record;
          if (!Array.isArray(dst_ip) || !Array.isArray(app_proto) || !Array.isArray(username))
            return '';
          let actionStyle;
          const {
            accountSecurity: {
              explodeList, // 爆破统计表
            },
          } = this.props;
          const { showOperation, query } = this.state;
          let conditionStr = `src_ip:${record.src_ip}`;
          const destStr = [];
          const protoStr = [];
          const nameStr = [];
          dst_ip.forEach((item) => {
            if (item) {
              destStr.push(`dst_ip:${item.ip}`);
            }
          });
          app_proto.forEach((item) => {
            if (item) {
              protoStr.push(`app_proto:${item}`);
            }
          });
          username.forEach((item) => {
            if (item) {
              nameStr.push(`login.username:${item}`);
            }
          });
          const destStrVal = destStr.length ? ` AND (${destStr.join(' OR ')})` : '';
          const protoStrVal = protoStr.length ? ` AND (${protoStr.join(' OR ')})` : '';
          // const nameStrVal = nameStr.length ? ` AND (${nameStr.join(' OR ')})` : '';

          // conditionStr = `${conditionStr} AND (${destStr.join(' OR ')}) AND (${protoStr.join(' OR ')}) AND (${nameStr.join(' OR ')})`;
          // conditionStr = `${conditionStr}${destStrVal}${protoStrVal}${nameStrVal}`;
          conditionStr = `${conditionStr}${destStrVal}${protoStrVal}`;
          // console.log(258, 'conditionStr=', conditionStr);
          if (index < explodeList.list.length - 1) {
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
                    {this.accountAuth.indexOf('r') > -1 && (
                      <Link
                        target="_blank"
                        to={`/analysis/search?startTime=${query.startTime}&endTime=${query.endTime}&type=login&condition=${conditionStr}`}
                      >
                        数据检索
                      </Link>
                    )}
                    {this.accountAuth === 'rw' && (
                      <Fragment>
                        <p
                          onClick={() => {
                            this.addToWhiteList('current_record', record);
                          }}
                        >
                          忽略本条记录
                        </p>
                        <p
                          onClick={() => {
                            this.addToWhiteList('attack_ip', {
                              attack_ip: record.src_ip,
                              dst_ip: record.dst_ip[0].ip || '',
                              protocol: record.app_proto[0] || '',
                              dst_account: record.username[0] || '',
                            });
                          }}
                        >
                          忽略该攻击者IP记录
                        </p>
                      </Fragment>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: '攻击者IP',
        dataIndex: 'src_ip',
        key: 'src_ip',
        render: (text, record) => {
          const { srcCountry } = record;
          if (srcCountry) {
            return (
              <span>
                {text}({srcCountry})
              </span>
            );
          }
          return <span>{text}</span>;
        },
      },
      {
        title: '目标IP',
        dataIndex: 'dst_ip',
        key: 'dst_ip',
        render: (text) => {
          if (text.length === 0 || !Array.isArray(text)) {
            return '';
          }
          const popContent = (
            <div>
              {text.map((item) => (
                <p key={item.ip}>
                  {item.ip}
                  {item.country ? `(${item.country})` : ''}
                </p>
              ))}
            </div>
          );
          return (
            <div>
              {text.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft">
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p>
                  {text[0].ip}
                  {text[0].country ? `(${text[0].country})` : ''}
                </p>
              )}
            </div>
          );
        },
      },
      {
        title: '所属协议',
        dataIndex: 'app_proto',
        key: 'app_proto',
        render: (text) => {
          if (text.length === 0 || !Array.isArray(text)) {
            return '';
          }
          const popContent = (
            <div>
              {text.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          );
          return (
            <div>
              {text.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft">
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p>{text[0]}</p>
              )}
            </div>
          );
        },
      },
      {
        title: '目标账号',
        dataIndex: 'username',
        key: 'username',
        width: 300,
        render: (text) => {
          if (text.length === 0 || !Array.isArray(text)) {
            return '';
          }
          const popContent = (
            <div>
              {text.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          );
          return (
            <div>
              {text.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft">
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p className="ellipsis" style={{ maxWidth: '300px' }} title={text}>
                  {text[0]}
                </p>
              )}
            </div>
          );
        },
      },
      { title: '登录失败次数', dataIndex: 'loginFailure', key: 'loginFailure', sorter: true },
      { title: '登录成功次数', dataIndex: 'loginSuccess', key: 'loginSuccess', sorter: true },
      { title: '首次登录成功时间', dataIndex: 'oldestTime', key: 'oldestTime', sorter: true },
    ];
    // 弱密码表列
    this.weakPasswordTableColumns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record) => {
          if (this.accountAuth.indexOf('r') < 0 && this.accountAuth !== 'rw') {
            return null;
          }
          const { showWeakPasswordOperation, query } = this.state;
          // 要聚合的条件 目的IP，协议，账号，密码
          const { dstIp, appProto, userName, password } = record;
          return (
            <div style={{ width: 20 }}>
              <div className={styles.tableAction}>
                <DownSquareOutlined
                  onClick={() => {
                    this.setWeakPasswordOperation();
                  }}
                  style={{ color: '#5cbaea' }} />
                {showWeakPasswordOperation && (
                  <div className={styles.actionContent} style={{ top: 20 }}>
                    {this.accountAuth.indexOf('r') > -1 && (
                      <Link
                        target="_blank"
                        to={`/analysis/search?startTime=${query.startTime}&endTime=${
                          query.endTime
                        }&type=login&condition=dst_ip:${dstIp} AND 
                        app_proto:${appProto} AND login.username:${
                          userName || `""`
                        } AND login.password:${password || `""`} AND login.weak:true`}
                      >
                        数据检索
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: '目的IP',
        dataIndex: 'dstIp',
        key: 'dstIp',
        render: (text, record) => {
          const { dst_ip_country: dstIpCountry } = record;
          if (dstIpCountry) {
            return (
              <span>
                {text}({dstIpCountry})
              </span>
            );
          }
          return <span>{text}</span>;
        },
      },
      {
        title: '协议',
        dataIndex: 'appProto',
        key: 'appProto',
        render: (text) => <span>{text}</span>,
      },
      {
        title: '账号',
        dataIndex: 'userName',
        key: 'userName',
        render: (text) => <span>{text}</span>,
      },
      {
        title: '密码',
        dataIndex: 'password',
        key: 'password',
        render: (text) => <span>{text}</span>,
      },
      {
        title: '登录源个数',
        dataIndex: 'numberOfLoginSourceIP',
        key: 'numberOfLoginSourceIP',
        sorter: true,
      },
      {
        title: '登录成功次数',
        dataIndex: 'loginSuccessTimes',
        key: 'loginSuccessTimes',
        sorter: true,
      },
      {
        title: '登录失败次数',
        dataIndex: 'logonFailureTimes',
        key: 'logonFailureTimes',
        sorter: true,
      },
      { title: '首次登录时间', dataIndex: 'firstLoginTime', key: 'firstLoginTime', sorter: true },
      { title: '最后登录时间', dataIndex: 'lastLoginTime', key: 'lastLoginTime', sorter: true },
    ];

    // 白名单表格的列
    this.whitelistColumns = [
      { title: '攻击者IP', dataIndex: 'attack_ip', key: 'attack_ip' },
      {
        title: '目标IP',
        dataIndex: 'dst_ip',
        key: 'dst_ip',
        render: (text) => {
          console.log('text', text);
          if (!text) return <span />;
          const list = text.split(',');
          const popContent = (
            <div>
              {list.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          );
          return (
            <div>
              {list.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft">
                  <p>
                    多个( <span className="fontBlue"> {list.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p>{list[0]}</p>
              )}
            </div>
          );
        },
      },
      {
        title: '所属协议',
        dataIndex: 'protocol',
        key: 'protocol',
        render: (text) => {
          if (!text) return <span />;
          const list = text.split(',');
          const popContent = (
            <div>
              {list.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          );
          return (
            <div>
              {list.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft">
                  <p>
                    多个( <span className="fontBlue"> {list.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p>{list[0]}</p>
              )}
            </div>
          );
        },
      },
      {
        title: '目标账号',
        dataIndex: 'dst_account',
        key: 'dst_account',
        render: (text) => {
          if (!text) return <span />;
          const list = text.split(',');
          const popContent = (
            <div>
              {list.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          );
          return (
            <div>
              {list.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft">
                  <p>
                    多个( <span className="fontBlue"> {list.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p className="ellipsis" style={{ maxWidth: '300px' }} title={list[0]}>
                  {list[0]}
                </p>
              )}
            </div>
          );
        },
      },
      {
        title: '操作',
        dataIndex: '',
        key: 'action',
        render: (text, record) => (
          <a
            onClick={() => {
              this.whiteOpetation(record.id);
            }}
          >
            删除
          </a>
        ),
      },
    ];

    if (props.hasVpc) {
      this.explodeAccountColumns.splice(2, 0, {
        title: 'VPCID',
        dataIndex: 'vpcid',
        key: 'vpcid',
        width: 120,
        render: (text) => (text ? <span>{text}</span> : <span />),
      });
      this.explodeBehaviorColumns.splice(2, 0, {
        title: 'VPCID',
        dataIndex: 'vpcid',
        key: 'vpcid',
        width: 120,
        render: (text) => (text ? <span>{text}</span> : <span />),
      });
    }
    this.filterList = [
      {
        type: 'select',
        name: '时间',
        key: 'timeRange',
        list: [
          {
            name: '近24小时',
            value: '近24小时',
          },
          {
            name: '近7天',
            value: '近7天',
          },
          {
            name: '近30天',
            value: '近30天',
          },
          {
            name: '自定义',
            value: '自定义',
          },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'IP/账号/协议',
        pressEnter: true,
      },
    ];
    this.weakPasswordManage = this.weakPasswordManage.bind(this);
    this.child = null;
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    const {
      query,
      explodeSort,
      explodeDir,
      loginType,
      pagination,
      weakPsswordSortCol,
      weakPsswordSort,
      weakPasswordPagination,
    } = this.state;
    // 登录来源
    dispatch({ type: 'accountSecurity/fetchLoginSource', payload: query });
    // 登录行为趋势
    dispatch({ type: 'accountSecurity/fetchLoginBehaviorTrend', payload: { ...query, loginType } });
    // 登录类型分布
    dispatch({ type: 'accountSecurity/fetchLoginDistributionList', payload: query });
    // 爆破统计（爆破账号登录统计）
    dispatch({
      type: 'accountSecurity/fetchExplodeAccountList',
      payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
    });
    // 弱密码表
    dispatch({
      type: 'accountSecurity/fetchWeakPasswordList',
      payload: {
        ...query,
        sort: weakPsswordSortCol,
        dir: weakPsswordSort,
        ...weakPasswordPagination,
      },
    });
  };

  // 爆破页码和页数发生发生改变的时候
  onChange(page, pageSize) {
    const { dispatch } = this.props;
    const { query, explodeSort, explodeDir, currentBlastingStatisticalModel } = this.state;
    const pagination = {
      page,
      pageSize,
    };
    this.setState({
      pagination,
    });
    if (currentBlastingStatisticalModel === 'logInStatistics') {
      // 爆破账号登录统计
      dispatch({
        type: 'accountSecurity/fetchExplodeAccountList',
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    } else if (currentBlastingStatisticalModel === 'conductStatistical') {
      dispatch({
        type: 'accountSecurity/fetchExplodeBehaviorList',
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    }
  }

  // 弱密码表页码和页数发生发生改变的时候
  onWeakTablePaginatiChange(page, pageSize) {
    const { dispatch } = this.props;
    const { query, weakPsswordSortCol, weakPsswordSort } = this.state;
    const weakPasswordPagination = {
      page,
      pageSize,
    };
    this.setState({
      weakPasswordPagination,
    });
    dispatch({
      type: 'accountSecurity/fetchWeakPasswordList',
      payload: {
        ...query,
        sort: weakPsswordSortCol,
        dir: weakPsswordSort,
        ...weakPasswordPagination,
      },
    });
  }

  // 弱密码扩展表页码和页数发生发生改变的时候
  onWeakExpandTablePaginatiChange(page, pageSize, expandRecord) {
    const { dispatch } = this.props;
    const { query } = this.state;
    const { dstIp, appProto, userName, password, key } = expandRecord;
    const weakPasswordExpandPagination = {
      page,
      pageSize,
    };
    dispatch({
      type: 'accountSecurity/fetchWeakPasswordAggregationDisplay',
      payload: {
        ...query,
        ...weakPasswordExpandPagination,
        dstIp,
        appProto,
        userName,
        password,
      },
    }).then((res) => {
      dispatch({
        type: 'accountSecurity/changeTheWeakPasswordToShowTheTableExtensionRowData',
        payload: {
          weakPasswordExpandList: res,
          weakPasswordExpandPagination,
          index: key,
        },
      });
    });
  }

  // 设置表格第一列的操作方式是否显示
  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }
  // 设置弱密码表格第一列的操作方式是否显示
  setWeakPasswordOperation() {
    const { showWeakPasswordOperation } = this.state;
    this.setState({ showWeakPasswordOperation: !showWeakPasswordOperation });
  }

  // 来源国家点击跳转到检索页面
  skipSearchPage = (parameter) => {
    console.log('地图带回的数据:', parameter);
    const {
      query: { startTime, endTime },
    } = this.state;
    const arr = parameter.split('-');
    if (arr.length > 0) {
      const country = arr[0] || '';
      const city = arr[1] || '';
      let condition = '';
      if (country && city) {
        condition = `(src_ip_location.country:${country} OR src_ip_location.city:${city})`;
      } else if (country) {
        condition = `(src_ip_location.country:${country})`;
      } else if (city) {
        condition = `(src_ip_location.city:${city})`;
      }
      const linkHref = `/analysis/search?startTime=${startTime}&endTime=${endTime}&type=login&condition=${condition}`;
      window.open(linkHref, '_blank');
    }
  };

  // 折线图跳转检索页面
  toLink = (parameter) => {
    console.log('帐号安全折线图带回的数据:', parameter);
    const { loginType } = this.state;
    const startTime = moment(parameter.startTime).format('x');
    const endTime = moment(parameter.endTime).format('x');

    const loginStatus = loginType === '登录成功' ? 'true' : 'false';
    const condition = `login.success:${loginStatus} AND app_proto:${parameter.appProtos}`;
    const linkHref = `/analysis/search?startTime=${startTime}&endTime=${endTime}&type=login&condition=${condition}`;
    window.open(linkHref, '_blank');
  };

  // 饼图 legend 跳转
  eventlegendOnclick = (value) => {
    const {
      query: { startTime, endTime, search },
    } = this.state;
    const condition = search
      ? `app_proto:${value}  AND (src_ip:${search} OR dst_ip:${search} OR login.username:${search} OR app_proto:${search})`
      : `app_proto:${value}`;
    const linkHref = `/analysis/search?startTime=${startTime}&endTime=${endTime}&type=login&condition=${condition}`;
    window.open(linkHref, '_blank');
  };

  // 时间select改变回调
  filterOnChange = (type, value) => {
    const { query } = this.state;
    let changePart;
    if (type === 'timeRange') {
      changePart = {
        startTime: value[0],
        endTime: value[1],
      };
      this.setState({
        timeRange: value[2],
      });
    } else {
      changePart = { [type]: value };
    }

    const newQuery = Object.assign({}, query, changePart);
    if (newQuery.ipmac) {
      delete newQuery.ipmac;
    }
    this.setState({
      query: newQuery,
    });
  };

  // FilterBlock组件搜索按钮点击回调
  submitFilter = () => {
    console.log('submitFilter');
    const { dispatch } = this.props;
    const {
      query,
      explodeSort,
      explodeDir,
      currentBlastingStatisticalModel,
      pagination,
      loginType,
      weakPsswordSortCol,
      weakPsswordSort,
      weakPasswordPagination,
    } = this.state;
    dispatch({ type: 'accountSecurity/fetchLoginSource', payload: query });
    dispatch({
      type: 'accountSecurity/fetchLoginBehaviorTrend',
      payload: {
        ...query,
        loginType,
      },
    });
    dispatch({ type: 'accountSecurity/fetchLoginDistributionList', payload: query });
    if (currentBlastingStatisticalModel === 'logInStatistics') {
      // 爆破账号登录统计
      dispatch({
        type: 'accountSecurity/fetchExplodeAccountList',
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    } else if (currentBlastingStatisticalModel === 'conductStatistical') {
      dispatch({
        type: 'accountSecurity/fetchExplodeBehaviorList',
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    }

    // 弱密码表
    dispatch({
      type: 'accountSecurity/fetchWeakPasswordList',
      payload: {
        ...query,
        sort: weakPsswordSortCol,
        dir: weakPsswordSort,
        ...weakPasswordPagination,
      },
    });
  };

  showDetail = (type) => {
    this.setState({ detailType: type, showDetail: true });
  };

  showOverview = () => {
    this.setState({ showDetail: false });
    const { detailType, query, explodeSort, explodeDir, explodeBehaviorSort } = this.state;
    const { dispatch } = this.props;
    let payload;
    let uri = '';
    if (detailType === 'source') {
      uri = 'fetchLoginSource';
      payload = query;
    } else if (detailType === 'account') {
      uri = 'fetchExplodeAccountList';
      payload = { ...query, sort: explodeSort, dir: explodeDir };
    } else {
      uri = 'fetchExplodeBehaviorList';
      payload = { ...query, sort: explodeBehaviorSort, dir: explodeSort };
    }
    dispatch({ type: `accountSecurity/${uri}`, payload });
  };

  // 登录模式发生改变
  handleLoginTypeChange = (e) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    this.setState({
      loginType: e.target.value,
    });
    dispatch({
      type: 'accountSecurity/fetchLoginBehaviorTrend',
      payload: {
        ...query,
        loginType: e.target.value,
      },
    });
  };

  // 爆破模块，导航栏返回
  reactNodeHeader = () => {
    const { currentBlastingStatisticalModel } = this.state;
    return (
      <div className={styles.blastingNavigationBar}>
        <Tabs
          defaultActiveKey={currentBlastingStatisticalModel}
          onChange={this.handleClick}
          tabBarStyle={{
            borderBottom: 'none',
            marginBottom: 0,
            position: 'relative',
            top: '-9px',
          }}
          size="small"
        >
          <TabPane
            tab={
              <Fragment>
                <span style={{ margin: '0px 5px 0px 0px', fontSize: '16px' }}>
                  爆破账号登录统计
                </span>
                <Tooltip
                  placement="rightTop"
                  title={
                    <Desc
                      value={[
                        '从被爆破账号视角出发，统计登录失败及成功次数。该场景中，每条记录按照“账号”进行归并统计，并默认按照登录失败次数降序排列。',
                        '用户可通过“登录失败次数”和“登录成功次数”综合判断账号被爆破风险。用户可通过“数据检索”（全部列表页每一条记录均提供该菜单），查看该条记录的原始登录日志信息。',
                      ]}
                    />
                  }
                >
                  <QuestionCircleFilled className="fontBlue" />
                </Tooltip>
              </Fragment>
            }
            key="logInStatistics"
          />

          <TabPane
            tab={
              <Fragment>
                <span style={{ margin: '0px 5px 0px 0px', fontSize: '16px' }}>爆破行为统计</span>
                <Tooltip
                  placement="rightTop"
                  title={
                    <Desc
                      value={[
                        '从攻击者视角出发，统计攻击者的登录失败及成功次数。该场景中，每条记录按照“攻击者IP”进行归并统计，并默认按照登录失败次数降序排列。',
                        '用户可通过“登录失败次数”和“登录成功次数”综合判断攻击者IP进行爆破的可能性。用户可通过“数据检索”（全部列表页每一条记录均提供该菜单），查看该条记录的原始登录日志信息。',
                      ]}
                    />
                  }
                >
                  <QuestionCircleFilled className="fontBlue" />
                </Tooltip>
              </Fragment>
            }
            key="conductStatistical"
          />
        </Tabs>

        <Button
          onClick={() => {
            this.whiteManage();
          }}
        >
          白名单管理
        </Button>
      </div>
    );
  };

  // 弱密码表头模块
  weakPasswordNodeHeader = () => (
    <div className={styles.blastingNavigationBar}>
      <span style={{ margin: '0px 5px 0px 0px', fontSize: '16px', lineHeight: '32px' }}>
        弱密码登录统计
      </span>
      <Button
        onClick={() => {
          this.weakPasswordManage();
        }}
      >
        配置弱密码库
      </Button>
    </div>
  );

  // 爆破导航栏点击事件
  handleClick = async (e) => {
    const { dispatch } = this.props;
    const { query, explodeSort, explodeDir } = this.state;
    const pagination = {
      page: 1,
      pageSize: 10,
    };

    if (e === 'logInStatistics') {
      // 爆破账号登录统计
      await dispatch({
        type: 'accountSecurity/fetchExplodeAccountList',
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    } else if (e === 'conductStatistical') {
      await dispatch({
        type: 'accountSecurity/fetchExplodeBehaviorList',
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    }
    this.setState({
      currentBlastingStatisticalModel: e,
      pagination,
    });
  };

  // 白名单按钮点击
  whiteManage = () => {
    const { dispatch } = this.props;
    const { currentBlastingStatisticalModel } = this.state;
    dispatch({
      type: 'accountSecurity/fetchWhiteList',
      payload: {
        type:
          currentBlastingStatisticalModel === 'logInStatistics'
            ? 'brute_account'
            : 'brute_behavior',
      },
    }).then((res) => {
      this.setState({ whiteList: res || [] });
    });
    this.setState({ whiteManageVisible: true });
  };

  // 配置弱密码库按钮点击
  weakPasswordManage = (ref) => {
    if (ref) this.child = ref;
    const { weakPasswordManageVisible } = this.state;
    this.setState({ weakPasswordManageVisible: !weakPasswordManageVisible });
    if (!weakPasswordManageVisible && this.child) {
      // 调用子组件的方法更新弱密码表
      this.child.searchWeakPasswordList('');
    }
  };

  // 白名单行操作逻辑
  whiteOpetation = (id) => {
    const { dispatch } = this.props;
    const {
      query,
      currentBlastingStatisticalModel,
      explodeSort,
      explodeDir,
      pagination,
    } = this.state;
    // 删除白名单
    dispatch({
      type: 'accountSecurity/deleteWhiteList',
      payload: { id },
    }).then(() => {
      message.success('删除成功');
      // 再次获取白名单列表
      dispatch({
        type: 'accountSecurity/fetchWhiteList',
        payload: {
          type:
            currentBlastingStatisticalModel === 'logInStatistics'
              ? 'brute_account'
              : 'brute_behavior',
        },
      }).then((res) => {
        this.setState({ whiteList: res || [] });
        if (currentBlastingStatisticalModel === 'logInStatistics') {
          // 更新爆破账号登录统计
          dispatch({
            type: 'accountSecurity/fetchExplodeAccountList',
            payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
          });
        } else if (currentBlastingStatisticalModel === 'conductStatistical') {
          dispatch({
            type: 'accountSecurity/fetchExplodeBehaviorList',
            payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
          });
        }
      });
    });
  };

  // 搜索白名单逻辑
  searchWhiteList = (search) => {
    const { dispatch } = this.props;
    const { currentBlastingStatisticalModel } = this.state;
    dispatch({
      type: 'accountSecurity/searchWhiteList',
      payload: {
        search,
        function_type:
          currentBlastingStatisticalModel === 'logInStatistics'
            ? 'brute_account'
            : 'brute_behavior',
      },
    }).then((res) => {
      this.setState({
        whiteList: res || [],
      });
    });
  };

  // 设置白名单搜索关键字
  whiteSearchChange = (e) => {
    const { value } = e.target;
    this.setState({ whiteListSearch: value });
  };

  // 将记录添加到白名单
  addToWhiteList = (type, record) => {
    const { dispatch } = this.props;
    const {
      currentBlastingStatisticalModel,
      query,
      pagination,
      explodeSort,
      explodeDir,
    } = this.state;
    const uri =
      currentBlastingStatisticalModel === 'logInStatistics'
        ? 'fetchExplodeAccountList'
        : 'fetchExplodeBehaviorList';
    let payload = record;
    if (type === 'current_record') {
      // eslint-disable-next-line camelcase
      const { src_ip, dst_ip, username, app_proto } = record;
      let destIp;
      if (Array.isArray(dst_ip)) {
        destIp = dst_ip.map((item) => item.ip).join(',');
      } else {
        // eslint-disable-next-line camelcase
        destIp = dst_ip;
      }
      console.log('destIp', destIp);
      payload = {
        // eslint-disable-next-line camelcase
        attack_ip: Array.isArray(src_ip) ? src_ip.join(',') : src_ip,
        dst_ip: destIp,
        dst_account: Array.isArray(username) ? username.filter((item) => item).join(',') : username,
        // eslint-disable-next-line camelcase
        protocol: Array.isArray(app_proto) ? app_proto.join(',') : app_proto,
      };
    }
    // 添加白名单操作
    dispatch({
      type: 'accountSecurity/addToWhiteList',
      payload: {
        ...payload,
        type,
        function_type:
          currentBlastingStatisticalModel === 'logInStatistics'
            ? 'brute_account'
            : 'brute_behavior',
      },
    }).then(() => {
      message.success(`已添加到白名单，将不再显示`);
      // 重新查询爆破表
      dispatch({
        type: `accountSecurity/${uri}`,
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    });
  };

  // 爆破表发生改变的时候（主要是排序功能）
  handleTableChange = (paginationTable, filters, sorter) => {
    // 获取爆破统计排序和爆破目录排序
    const { field, order } = sorter;
    const explodeSort = field || '';
    const explodeDir = order === 'descend' ? 'desc' : 'asc';
    this.setState({
      explodeSort,
      explodeDir,
    });
    const { dispatch } = this.props;
    const { query, pagination, currentBlastingStatisticalModel } = this.state;
    if (currentBlastingStatisticalModel === 'logInStatistics') {
      // 爆破账号登录统计
      dispatch({
        type: 'accountSecurity/fetchExplodeAccountList',
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    } else if (currentBlastingStatisticalModel === 'conductStatistical') {
      dispatch({
        type: 'accountSecurity/fetchExplodeBehaviorList',
        payload: { ...query, sort: explodeSort, dir: explodeDir, ...pagination },
      });
    }
  };

  // 弱密码表发生改变的时候（主要是排序功能）
  handleWeakTableChange = (paginationTable, filters, sorter) => {
    const { field, order } = sorter;
    const weakPsswordSortCol = field || '';
    const weakPsswordSort = order === 'descend' ? 'desc' : 'asc';
    this.setState({
      weakPsswordSortCol,
      weakPsswordSort,
    });
    const { dispatch } = this.props;
    const { query, weakPasswordPagination } = this.state;
    // 弱密码表
    dispatch({
      type: 'accountSecurity/fetchWeakPasswordList',
      payload: {
        ...query,
        sort: weakPsswordSortCol,
        dir: weakPsswordSort,
        ...weakPasswordPagination,
      },
    });
  };

  // 展开行的时候触发
  onExpand = (expandedRows, record) => {
    const that = this;
    const weakPasswordExpandPagination = {
      page: 1,
      pageSize: 10,
    };
    // 如果是关闭的话
    if (!expandedRows) return;
    console.log('当前展开的行记录：', record);
    const { dispatch } = that.props;
    const { query } = that.state;
    const { dstIp, appProto, userName, password, key } = record;
    // 弱密码表 查询当前行的具体数据
    dispatch({
      type: 'accountSecurity/fetchWeakPasswordAggregationDisplay',
      payload: {
        ...query,
        ...weakPasswordExpandPagination,
        dstIp,
        appProto,
        userName,
        password,
      },
    }).then((res) => {
      dispatch({
        type: 'accountSecurity/changeTheWeakPasswordToShowTheTableExtensionRowData',
        payload: {
          weakPasswordExpandList: res,
          weakPasswordExpandPagination,
          index: key,
        },
      });
    });
  };

  render() {
    const {
      query,
      timeRange,
      showDetail,
      detailType,
      explodeSort,
      explodeDir,
      explodeBehaviorSort,
      loginType,
      currentBlastingStatisticalModel,
      pagination,
      whiteManageVisible,
      whiteListSearch,
      whiteList,
      currentHoverRow,
      currentWeakPasswordHoverRow,
      weakPasswordPagination,
      weakPasswordManageVisible,
    } = this.state;
    const {
      loginSourceLoading,
      loginBehaviorLoading,
      explodeAccountLoading,
      explodeBehaviorLoading,
      weakPasswordTableLoading,
      weakPasswordExpandTableLoading,
      accountSecurity: {
        loginSourceList,
        loginSourceMapData,
        behaviorTrend,
        loginDistributionList,
        explodeList, // 爆破统计表
        weakPasswordList,
      },
    } = this.props;
    const expandedRowRender = (expandRecord) => {
      const { weakPasswordExpandList, weakPasswordExpandPagination } = expandRecord;
      const columns = [
        {
          title: '登录时间',
          dataIndex: 'loginTime',
          key: 'loginTime',
          render: (text) => <span>{text}</span>,
        },
        {
          title: '登录源IP',
          dataIndex: 'loginSourceIP',
          key: 'loginSourceIP',
          render: (text, record) => {
            const { loginSourceIPGeographicalPosition } = record;
            if (loginSourceIPGeographicalPosition.country) {
              return (
                <span>
                  {text}({loginSourceIPGeographicalPosition.country})
                </span>
              );
            }
            return <span>{text}</span>;
          },
        },
        {
          title: '登录源端口',
          dataIndex: 'loginSourcePort',
          key: 'loginSourcePort',
          render: (text) => <span>{text}</span>,
        },
        {
          title: '登录目的IP',
          dataIndex: 'loginDestinationIP',
          key: 'loginDestinationIP',
          render: (text) => <span>{text}</span>,
        },
        {
          title: '登录目的端口',
          dataIndex: 'loginDestinationPort',
          key: 'loginDestinationPort',
          render: (text) => <span>{text}</span>,
        },
        {
          title: '登录结果',
          dataIndex: 'loginResults',
          key: 'loginResults',
          render: (text) => <span>{text}</span>,
        },
        {
          title: '服务端信息',
          dataIndex: 'serverSideInfo',
          key: 'serverSideInfo',
          render: (text) => <span>{text}</span>,
        },
      ];
      return (
        <div>
          <Table
            loading={weakPasswordExpandTableLoading}
            columns={columns}
            dataSource={weakPasswordExpandList.list}
            pagination={false}
          />
          <div className={styles.paginationPos}>
            <Pagination
              defaultCurrent={1}
              SizeChanger
              current={weakPasswordExpandPagination.page}
              pageSize={weakPasswordExpandPagination.pageSize}
              onChange={(page, pageSize) => {
                this.onWeakExpandTablePaginatiChange(page, pageSize, expandRecord);
              }}
              onShowSizeChange={(page, pageSize) => {
                this.onWeakExpandTablePaginatiChange(page, pageSize, expandRecord);
              }}
              total={weakPasswordExpandList.total}
            />
          </div>
        </div>
      );
    };
    // console.log("behaviorTrend", behaviorTrend);
    let handledQuery = Object.assign({}, query);
    if (detailType === 'account') {
      handledQuery = Object.assign({}, handledQuery, { sort: explodeSort, dir: explodeDir });
    } else if (detailType === 'behavior') {
      handledQuery = Object.assign({}, handledQuery, {
        sort: explodeBehaviorSort,
        dir: explodeSort,
      });
    }
    return (
      <div>
        {showDetail && (
          <AccountSecurityDetail
            type={detailType}
            showOverview={this.showOverview}
            preQuery={handledQuery}
          />
        )}
        <div className="contentWraper" style={{ display: showDetail ? 'none' : 'block' }}>
          <div className="commonHeader">账号安全</div>
          <div className="filterWrap">
            <FilterBlock
              filterList={this.filterList}
              query={query}
              colNum={2}
              filterOnChange={this.filterOnChange}
              submitFilter={this.submitFilter}
              timeRange={timeRange}
            />
          </div>
          <div className="TableTdPaddingWrap" style={{ padding: 20 }}>
            {/* 登录来源统计 */}
            <div className={styles.tableBlock} style={{ paddingBottom: 0 }}>
              <div className={styles.accountBlock}>
                <div className={styles.header}>
                  <h4 style={{ margin: 0 }}>
                    <span style={{ marginRight: 10 }}>登录来源统计</span>
                    <Tooltip
                      placement="rightTop"
                      title="通过地图和表格形式展示来源为公网的登录行为"
                    >
                      <QuestionCircleFilled className="fontBlue" />
                    </Tooltip>
                  </h4>
                  <a
                    onClick={() => {
                      this.showDetail('source');
                    }}
                  >
                    查看全部
                  </a>
                </div>
                <div className={styles.accountSource}>
                  <div style={{ width: '75%' }}>
                    {/* queryParameter={query} */}
                    <BubbleMap
                      height={510}
                      data={loginSourceMapData}
                      skipSearchPage={this.skipSearchPage}
                    />
                  </div>
                  <div style={{ width: '25%' }}>
                    <Table
                      loading={loginSourceLoading}
                      size="small"
                      dataSource={
                        loginSourceList.list // rowKey={record => record.index}
                      }
                      columns={this.loginSourceColumns}
                      pagination={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, overflow: 'hidden' }}>
              <Row gutter={32}>
                {/* 登录行为趋势 */}
                <Col span={12}>
                  <Card
                    loading={loginBehaviorLoading}
                    className={styles.salesCard}
                    title={
                      <div>
                        <span style={{ marginRight: 10 }}>登录行为趋势</span>
                        <Tooltip
                          placement="rightTop"
                          title="通过展示相应时间范围内登录成功次数，登录失败次数来反映用户账号的整体安全状态。"
                        >
                          <QuestionCircleFilled className="fontBlue" />
                        </Tooltip>
                      </div>
                    }
                    bodyStyle={{ padding: 24 }}
                    style={{ minHeight: 280 }}
                    extra={
                      <div>
                        <Radio.Group value={loginType} onChange={this.handleLoginTypeChange}>
                          <Radio.Button value="登录成功">登录成功</Radio.Button>
                          <Radio.Button value="登录失败">登录失败</Radio.Button>
                        </Radio.Group>
                      </div>
                    }
                  >
                    {behaviorTrend.length > 0 ? (
                      <StackAreaDiagram toLink={this.toLink} height={248} data={behaviorTrend} />
                    ) : (
                      <div style={{ heig: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div>暂无数据</div>
                      </div>
                    )}
                  </Card>
                </Col>

                {/* 登录类型分布 */}
                <Col span={12}>
                  <Card
                    className={
                      styles.salesCard // loading={loading}
                    }
                    title={
                      <div>
                        <span style={{ marginRight: 10 }}>登录类型分布</span>
                        <Tooltip placement="rightTop" title="按照协议统计登录行为数量及占比。">
                          <QuestionCircleFilled className="fontBlue" />
                        </Tooltip>
                      </div>
                    }
                    bodyStyle={{ padding: 24 }}
                    style={{ minHeight: 280 }}
                  >
                    <Pie
                      hasLegend
                      subTitle="登录次数"
                      total={() => (
                        <Yuan>{loginDistributionList.reduce((pre, now) => now.y + pre, 0)}</Yuan>
                      )}
                      data={loginDistributionList}
                      valueFormat={(value) => numeral(value).format('0,0')}
                      height={248}
                      lineWidth={4}
                      legendOnclick={this.eventlegendOnclick}
                      itemTpl='<li data-index={index} style="margin-bottom:4px;">
                        <p style="margin-bottom:0;">
                          <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
                          {num}
                        </p>
                        <p style="margin-bottom:0;">
                        <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
                        {percent}
                        </p>
                        </li>'
                      geoTootip={[
                        'y*percent',
                        (y, p) => ({ num: `数量:${y}`, percent: `占比: ${(p * 100).toFixed(2)}%` }),
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* 爆破账号登录统计 */}
            <div className={styles.tableBlock} style={{ paddingBottom: 0, marginTop: 20 }}>
              <Card
                className={styles.salesCard}
                title={this.reactNodeHeader()}
                bodyStyle={{ padding: 24 }}
              >
                <Table
                  loading={explodeAccountLoading || explodeBehaviorLoading}
                  bordered={false}
                  dataSource={explodeList.list}
                  rowKey={(record) => record.key}
                  pagination={false}
                  columns={
                    currentBlastingStatisticalModel === 'logInStatistics'
                      ? this.explodeAccountColumns
                      : this.explodeBehaviorColumns
                  }
                  onChange={this.handleTableChange}
                  rowClassName={(record, index) =>
                    index === currentHoverRow ? styles.handleAction : ''
                  }
                  onRow={(record, index) => ({
                    onMouseEnter: () => {
                      this.setState({ currentHoverRow: index });
                    },
                    onMouseLeave: () => {
                      this.setState({ currentHoverRow: '', showWeakPasswordOperation: false });
                    },
                  })}
                />
                <div className={styles.paginationPos}>
                  <Pagination
                    defaultCurrent={1}
                    showSizeChanger
                    current={pagination.page}
                    pageSize={pagination.pageSize}
                    onChange={(page, pageSize) => {
                      this.onChange(page, pageSize);
                    }}
                    onShowSizeChange={(page, pageSize) => {
                      this.onChange(page, pageSize);
                    }}
                    total={explodeList.total}
                  />
                </div>
              </Card>
            </div>

            {/* 弱密码展示列表 */}
            <div className={styles.tableBlock} style={{ paddingBottom: 0, marginTop: 20 }}>
              <Card
                className={styles.salesCard}
                title={this.weakPasswordNodeHeader()}
                bodyStyle={{ padding: 24 }}
              >
                <Table
                  loading={weakPasswordTableLoading}
                  bordered={false}
                  dataSource={weakPasswordList.list}
                  expandedRowRender={expandedRowRender}
                  onExpand={this.onExpand}
                  rowKey={(record) => record.key}
                  pagination={false}
                  columns={this.weakPasswordTableColumns}
                  onChange={this.handleWeakTableChange}
                  rowClassName={(record, index) =>
                    index === currentWeakPasswordHoverRow ? styles.handleAction : ''
                  }
                  onRow={(record, index) => ({
                    onMouseEnter: () => {
                      this.setState({ currentWeakPasswordHoverRow: index });
                    },
                    onMouseLeave: () => {
                      this.setState({ currentWeakPasswordHoverRow: '', showOperation: false });
                    },
                  })}
                />
                <div className={styles.paginationPos}>
                  <Pagination
                    defaultCurrent={1}
                    showSizeChanger
                    current={weakPasswordPagination.page}
                    pageSize={weakPasswordPagination.pageSize}
                    onChange={(page, pageSize) => {
                      this.onWeakTablePaginatiChange(page, pageSize);
                    }}
                    onShowSizeChange={(page, pageSize) => {
                      this.onWeakTablePaginatiChange(page, pageSize);
                    }}
                    total={weakPasswordList.total}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* 白名单弹框 */}
        <Modal
          title="白名单"
          width={800}
          visible={whiteManageVisible}
          footer={null}
          onCancel={() => {
            this.setState({
              whiteManageVisible: false,
              whiteListSearch: '',
            });
          }}
        >
          <div>
            <div>
              <span>搜索:</span>
              <Input
                placeholder="ip/协议/账号"
                value={whiteListSearch}
                onChange={this.whiteSearchChange}
                style={{ width: '150px', margin: '0px 10px 0px 10px' }}
                size="small"
                maxLength={40}
              />
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  this.searchWhiteList(whiteListSearch);
                }}
              >
                搜索
              </Button>
            </div>
          </div>
          <Table
            rowKey="id"
            columns={this.whitelistColumns}
            dataSource={whiteList}
            pagination={false}
          />
        </Modal>

        {/** 弱密码操作模块 */}
        <WeakPasswordManageModal
          weakPasswordManageVisible={weakPasswordManageVisible}
          weakPasswordManage={this.weakPasswordManage}
        />
      </div>
    );
  }
}
export default AccountSecurity;
