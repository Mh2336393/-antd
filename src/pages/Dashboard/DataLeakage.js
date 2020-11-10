import React, { Component } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Tabs,
  Row,
  Col,
  Card,
  Table,
  Select,
  Spin,
  Button,
  Switch,
  Modal,
  Input,
  Checkbox,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { IntervalStackBarchart } from '@/components/Charts';
import { Legend } from 'bizcharts';
// import { Link } from 'umi';
// import ReactJson from 'react-json-view';
import numeral from 'numeral';
import moment from 'moment';
import Cookies from 'js-cookie';
import FilterBlock from '@/components/FilterBlock/Filter';
import TimeRangePicker from '@/components/TimeRangePicker';
import ListCard from '@/components/ListCard/List';
import DialogTabPage from '../Event/EventDetail/DialogTabPage';
import styles from './EmailSafe.less';
import authority from '@/utils/authority';
const { getAuth } = authority;
// import Yuan from '@/utils/Yuan';
import configSettings from '../../configSettings';

// eslint-disable-next-line import/newline-after-import
import DataleakKeyForm from './DataleakKeyForm';
import Login from './Login';

const { Option } = Select;
const { TabPane } = Tabs;
const options = [
  {
    name: '近24小时',
    value: 1,
  },
  {
    name: '近7天',
    value: 7,
  },
  {
    name: '近30天',
    value: 30,
  },
  {
    name: '近90天',
    value: 90,
  },
  {
    name: '自定义',
    value: '自定义',
  },
];

@connect(({ dataLeakage, loading }) => ({
  dataLeakage,
  loading1: loading.effects['dataLeakage/fetchInterfaceTrend'],
  loading2: loading.effects['dataLeakage/fetchInterfaceTop'],
  loading3: loading.effects['dataLeakage/fetchReqFromTop'],
  loading4: loading.effects['dataLeakage/fetchInterfaceEvents'],
  loading5: loading.effects['dataLeakage/fetchReqsEvents'],
  loading6: loading.effects['dataLeakage/fetchInterfaceDetail'],
  loading7: loading.effects['dataLeakage/fetchReqsDetail'],
}))
class DataLeakage extends Component {
  constructor(props) {
    super(props);
    this.searchAuth = getAuth('/analysis/search');
    this.esAz = Cookies.get('ccsaz');
    this.state = {
      auth: '', // 认证 非认证
      timeRange: '近24小时', // 时间 控制全局
      startTime: moment().subtract(1, 'days').valueOf(),
      endTime: moment().valueOf(),
      queryInterface: {
        interface: '',
        sub_category: '',
        search: '',
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        sort: '',
        dir: '',
      },
      queryReqFrom: {
        sub_category: '',
        search: '',
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        sort: '',
        dir: '',
      },
      expandedRowKeys: [],
      expandedRowTables: {},
      pageWidth: 1400,
      defaultActiveKey: '1',
      formVisible: false,
      showDesensitization: false, // 脱敏数据展示
      modelVisible: false,
    };

    this.filterListInterface = [
      {
        type: 'select',
        name: '类型',
        key: 'sub_category',
        list: [
          {
            name: '全部',
            value: '',
          },
          {
            name: '身份证',
            value: '身份证',
          },
          {
            name: '电话号码',
            value: '电话号码',
          },
          {
            name: '邮箱',
            value: '邮箱',
          },
          {
            name: '银行卡',
            value: '银行卡',
          },
        ],
      },
      {
        type: 'input',
        name: '接口',
        key: 'interface',
        pressEnter: true,
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'IP',
        pressEnter: true,
      },
    ];

    this.filterListReqFrom = [
      {
        type: 'select',
        name: '类型',
        key: 'sub_category',
        list: [
          {
            name: '全部',
            value: '',
          },
          {
            name: '身份证',
            value: '身份证',
          },
          {
            name: '电话号码',
            value: '电话号码',
          },
          {
            name: '邮箱',
            value: '邮箱',
          },
          {
            name: '银行卡',
            value: '银行卡',
          },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'IP',
        pressEnter: true,
      },
    ];

    this.eventColumns = [
      {
        title: '接口',
        dataIndex: 'interface',
        key: 'interface',
        // width: 300,
        render: (text) => <div style={{ wordBreak: 'break-all' }}>{text}</div>,
      },
      {
        title: '事件数量',
        dataIndex: 'eventCount',
        key: 'eventCount',
        sorter: true,
        render: (text) => <div style={{ minWidth: 80 }}>{text}</div>,
      },
      {
        title: '请求方数量',
        dataIndex: 'reqCounts',
        key: 'reqCounts',
        sorter: true,
        render: (text) => <div style={{ minWidth: 110 }}>{text}</div>,
      },
      {
        title: '类型',
        dataIndex: 'tags',
        key: 'tags',
        width: 420,
        render: (text) => {
          const divStyle = { width: 420 };
          return this.showTags(text, divStyle);
        },
      },
      {
        title: '最近发生时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (text) => <div style={{ whiteSpace: 'pre' }}>{text}</div>,
      },
    ];

    this.reqFromEventColumns = [
      {
        title: '源IP（请求方）',
        dataIndex: 'ip',
        key: 'ip',
        // width: 300,
        render: (text) => <div style={{ wordBreak: 'break-all' }}>{text}</div>,
      },
      {
        title: '请求接口数',
        dataIndex: 'urlCount',
        key: 'urlCount',
        sorter: true,
        render: (text) => <div style={{ minWidth: 110 }}>{text}</div>,
      },
      {
        title: '事件数量',
        dataIndex: 'eventCount',
        key: 'eventCount',
        sorter: true,
        render: (text) => <div style={{ minWidth: 80 }}>{text}</div>,
      },
      {
        title: '类型',
        dataIndex: 'tags',
        key: 'tags',
        width: 420,
        render: (text) => {
          const divStyle = { width: 420 };
          return this.showTags(text, divStyle);
        },
      },
      {
        title: '最近发生时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (text) => <div style={{ whiteSpace: 'pre' }}>{text}</div>,
      },
    ];

    this.interfaceDetailColumns = [
      {
        title: '源IP（请求方）',
        dataIndex: 'ip',
        key: 'ip',
        // width: 300,
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 400 }}>{text}</div>,
      },
      {
        title: 'QPM（峰值）',
        dataIndex: 'qpm',
        key: 'qpm',
        width: 200,
        sorter: true,
      },
      {
        title: '访问次数',
        dataIndex: 'reqCount',
        key: 'reqCount',
        width: 250,
        sorter: true,
      },
      // {
      //   title: '泄露事件数量',
      //   dataIndex: 'eventCount',
      //   key: 'eventCount',
      //   // width: 300,
      // },
      {
        title: '类型',
        dataIndex: 'tags',
        key: 'tags',
        width: 316,
        render: (text) => {
          const divStyle = { width: 300 };
          return this.showTags(text, divStyle);
        },
      },
      {
        title: this.searchAuth.indexOf('r') < 0 ? '' : '操作',
        dataIndex: 'operate',
        key: 'operate',
        width: 200,
        render: (text, record) => {
          if (this.searchAuth.indexOf('r') < 0) {
            return null;
          }
          const { startTime, endTime, auth } = this.state;
          let authSearch = '';
          if (auth) {
            authSearch = ` AND auth:${auth === 'true'}`;
          }

          return (
            <div>
              <a
                //  AND http.interface_type.keyword:api
                onClick={(e) => {
                  // const url = record.interface.replace(/\//g, '\\/');
                  const condition = `attacker_ip.keyword:${record.ip} AND http.interface.keyword:"${record.interface}"${authSearch}`;

                  const urlAddr = `/analysis/search?type=dataleak&startTime=${startTime}&endTime=${endTime}&condition=${condition}`;
                  window.open(urlAddr, '_blank');
                  e.stopPropagation();
                }}
              >
                数据检索
              </a>
            </div>
          );
        },
      },
    ];

    this.reqFromDetailColumns = [
      {
        title: '接口',
        dataIndex: 'interface',
        key: 'interface',
        // width: 300,
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 400 }}>{text}</div>,
      },
      {
        title: 'QPM（峰值）',
        dataIndex: 'qpm',
        key: 'qpm',
        width: 200,
        sorter: true,
      },
      {
        title: '事件数量',
        dataIndex: 'eventCount',
        key: 'eventCount',
        width: 250,
        sorter: true,
      },
      {
        title: '类型',
        dataIndex: 'tags',
        key: 'tags',
        width: 316,
        render: (text) => {
          const divStyle = { width: 300 };
          return this.showTags(text, divStyle);
        },
      },
      {
        title: this.searchAuth.indexOf('r') < 0 ? '' : '操作',
        dataIndex: 'operate',
        key: 'operate',
        width: 200,
        render: (text, record) => {
          if (this.searchAuth.indexOf('r') < 0) {
            return null;
          }

          const { startTime, endTime, auth } = this.state;
          let authSearch = '';
          if (auth) {
            authSearch = ` AND auth:${auth === 'true'}`;
          }

          return (
            <div>
              <a
                // http.interface_type.keyword:api
                onClick={(e) => {
                  // const url = record.interface.replace(/\//g, '\\/');
                  const condition = `attacker_ip.keyword:${record.ip} AND http.interface.keyword:"${record.interface}"${authSearch}`;

                  const urlAddr = `/analysis/search?type=dataleak&startTime=${startTime}&endTime=${endTime}&condition=${condition}`;
                  window.open(urlAddr, '_blank');
                  e.stopPropagation();
                }}
              >
                数据检索
              </a>
            </div>
          );
        },
      },
    ];
  }

  componentWillMount() {
    if (localStorage.getItem('showDesensitization') === null) {
      localStorage.setItem('showDesensitization', false);
    } else {
      this.setState({
        showDesensitization: true,
      });
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'dataLeakage/fetchCategory' });
    this.fetchData();

    const self = this;
    const cWidth = document.documentElement.clientWidth || document.body.clientWidth;
    this.setState({ pageWidth: cWidth });
    window.onresize = () => {
      const { pageWidth: stateWid } = self.state;
      const sizecWidth = document.documentElement.clientWidth || document.body.clientWidth;
      if (stateWid !== sizecWidth) {
        this.setState({ pageWidth: sizecWidth });
      }
    };
  }

  fetchData = () => {
    const { queryInterface, queryReqFrom, startTime, endTime, auth } = this.state;
    const newInterfacePay = { ...queryInterface, startTime, endTime, page: 1, auth };
    const newReqFromPay = { ...queryReqFrom, startTime, endTime, page: 1, auth };

    const { dispatch } = this.props;
    // 趋势柱状图
    dispatch({
      type: 'dataLeakage/fetchInterfaceTrend',
      payload: { startTime, endTime, auth },
    });
    dispatch({
      type: 'dataLeakage/fetchInterfaceTop',
      payload: { startTime, endTime, auth },
    });
    dispatch({
      type: 'dataLeakage/fetchReqFromTop',
      payload: { startTime, endTime, auth },
    });
    dispatch({
      type: 'dataLeakage/fetchInterfaceEvents',
      payload: newInterfacePay,
    });
    dispatch({
      type: 'dataLeakage/fetchReqsEvents',
      payload: newReqFromPay,
    });
  };

  showTags = (tags, divStyle) => {
    // const tags = text;
    if (tags.length === 1) {
      return <span className={styles.blueBorder}>{tags[0]}</span>;
    }
    if (tags.length > 1) {
      return (
        <div style={divStyle || {}}>
          {tags.map((tag) => (
            <span key={tag} className={styles.blueBorder}>
              {tag}
            </span>
          ))}
        </div>
      );
    }
    return '';
  };

  filterOnChangeInterface = (type, value) => {
    const { queryInterface } = this.state;
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
    const newQuery = Object.assign({}, queryInterface, changePart);
    this.setState({
      queryInterface: newQuery,
    });
  };

  filterOnChangeReqFrom = (type, value) => {
    const { queryReqFrom } = this.state;
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
    const newQuery = Object.assign({}, queryReqFrom, changePart);
    this.setState({
      queryReqFrom: newQuery,
    });
  };

  submitFilterInterface = () => {
    const { queryInterface, startTime, endTime, auth } = this.state;
    const { dispatch } = this.props;
    const newInterfacePay = { ...queryInterface, startTime, endTime, page: 1, auth };
    this.setState({ queryInterface: newInterfacePay });
    dispatch({
      type: 'dataLeakage/fetchInterfaceEvents',
      payload: newInterfacePay,
    });
  };

  submitFilterReqFrom = () => {
    const { queryReqFrom, startTime, endTime, auth } = this.state;
    const { dispatch } = this.props;
    const newReqFromPay = { ...queryReqFrom, startTime, endTime, page: 1, auth };
    this.setState({ queryReqFrom: newReqFromPay });
    dispatch({
      type: 'dataLeakage/fetchReqsEvents',
      payload: newReqFromPay,
    });
  };

  handleTableChangeInterface = (pagination, filters, sorter) => {
    const { queryInterface, startTime, endTime, auth } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== queryInterface.page || pageSize !== queryInterface.pageSize) {
      newQuery = Object.assign({}, queryInterface, { page: current, pageSize });
    } else {
      const { field, order } = sorter;
      if (!field) return;
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, queryInterface, { dir, sort: field, page: 1 });
    }
    this.setState({ queryInterface: newQuery });
    const newInterfacePay = { ...newQuery, startTime, endTime, auth };
    dispatch({
      type: 'dataLeakage/fetchInterfaceEvents',
      payload: newInterfacePay,
    });
  };

  handleTableChangeReqFrom = (pagination, filters, sorter) => {
    const { queryReqFrom, startTime, endTime, auth } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== queryReqFrom.page || pageSize !== queryReqFrom.pageSize) {
      newQuery = Object.assign({}, queryReqFrom, { page: current, pageSize });
    } else {
      const { field, order } = sorter;
      if (!field) return;
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, queryReqFrom, { dir, sort: field, page: 1 });
    }
    this.setState({ queryReqFrom: newQuery });
    const newReqFromPay = { ...newQuery, startTime, endTime, auth };
    dispatch({
      type: 'dataLeakage/fetchReqsEvents',
      payload: newReqFromPay,
    });
  };

  timePickerOnchange = (arr) => {
    this.setState({
      startTime: arr[0],
      endTime: arr[1],
      timeRange: arr[2],
      expandedRowKeys: [], // 时间查询变化 列表展开项清空
      expandedRowTables: {},
    });
  };

  detailTbChangeInterface = (sorter, rowKey) => {
    const { expandedRowTables } = this.state;
    const { field, order } = sorter;
    if (!field) return;
    const dir = order === 'descend' ? 'desc' : 'asc';
    if (expandedRowTables[rowKey] && expandedRowTables[rowKey].list) {
      expandedRowTables[rowKey].list.sort((a, b) => {
        if (dir === 'desc') {
          return b[field] - a[field];
        }
        return a[field] - b[field];
      });
    }
    this.setState({ expandedRowTables });
  };

  // 表格 展开收缩相关
  expandedRowRenderInterface = (record) => {
    const { expandedRowTables } = this.state;
    const { interface: url, log } = record;
    let logObj = {};
    if (log) {
      const { _id, _index, _source } = log;
      logObj = { ..._source, _index, _id };
    }

    const { loading6 } = this.props;

    let tableObj = { total: 0, list: [], page: 1 };
    let showMore = false;
    if (expandedRowTables[url]) {
      tableObj = expandedRowTables[url];
      if (tableObj.total > 30 && tableObj.page * 30 < tableObj.total) {
        showMore = true;
      }
    }

    return (
      <Tabs type="card" key={url} className={styles.addTabsWrap}>
        <TabPane tab="会话还原" key="dialog">
          <div>
            <div className={styles.pcapWrap}>
              <DialogTabPage record={logObj} showDesensitization={this.state.showDesensitization} />
            </div>
          </div>
        </TabPane>
        <TabPane tab="接口请求方明细" key="log">
          <div>
            {loading6 && !expandedRowTables[url] ? (
              <div>
                <Spin />
              </div>
            ) : (
              <div className={styles.pcapWrap}>
                <Table
                  rowKey="ip"
                  // loading={loading4}
                  pagination={false}
                  size="middle"
                  scroll={{ y: 240 }}
                  columns={this.interfaceDetailColumns}
                  dataSource={showMore ? tableObj.list.slice(0, tableObj.page * 30) : tableObj.list}
                  onChange={(pagination, filters, sorter) =>
                    this.detailTbChangeInterface(sorter, url)
                  }
                />

                <div style={{ textAlign: 'center', height: 52 }}>
                  {showMore && (
                    <Button
                      className="smallWhiteBtn"
                      style={{ margin: '20px 0 5px' }}
                      onClick={() => {
                        expandedRowTables[url].page += 1;
                        this.setState({ expandedRowTables });
                      }}
                    >
                      查看更多
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabPane>
      </Tabs>
    );
  };

  onExpandedRowsChangeInterface = (expandedRows) => {
    const { expandedRowKeys, expandedRowTables } = this.state;
    let newExpandedRowTables = expandedRowTables;
    const curKeys = Object.keys(expandedRowTables);

    if (expandedRows.length > expandedRowKeys.length) {
      let newTbObj = {};

      const newKeys = expandedRows.filter((tmpKey) => curKeys.indexOf(tmpKey) < 0);
      const newKey = newKeys[0] || '';

      const { dispatch } = this.props;
      const { queryInterface, startTime, endTime, auth } = this.state;
      if (newKey) {
        // const newRecord = list.filter(obj => obj.interface === newKey);
        // const url = newRecord[0].interface;
        // const url = newKey;
        const newPay = {
          interface: newKey,
          startTime,
          endTime,
          sub_category: queryInterface.sub_category,
          search: queryInterface.search,
          auth,
        };
        dispatch({
          type: 'dataLeakage/fetchInterfaceDetail',
          payload: newPay,
        })
          .then(() => {
            const {
              dataLeakage: { interfaceDetail },
            } = this.props;
            newTbObj = { [newKey]: { ...interfaceDetail } };
            newExpandedRowTables = Object.assign({}, expandedRowTables, newTbObj);
            this.setState({ expandedRowTables: newExpandedRowTables });
          })
          .catch((error) => {
            newTbObj = { [newKey]: {} };
            newExpandedRowTables = Object.assign({}, expandedRowTables, newTbObj);
            this.setState({ expandedRowTables: newExpandedRowTables });
          });
      }
    }
    this.setState({ expandedRowKeys: expandedRows });
  };

  // 请求方
  expandedRowRenderReqFrom = (record) => {
    const { expandedRowTables } = this.state;
    const { ip } = record;

    const { loading7 } = this.props;

    let tableObj = { total: 0, list: [], page: 1 };
    let showMore = false;
    if (expandedRowTables[ip]) {
      tableObj = expandedRowTables[ip];
      if (tableObj.total > 30 && tableObj.page * 30 < tableObj.total) {
        showMore = true;
      }
    }

    return (
      <div key={ip}>
        {loading7 && !expandedRowTables[ip] ? (
          <div>
            <Spin />
          </div>
        ) : (
          <div className={styles.pcapWrap}>
            <Table
              rowKey="interface"
              // loading={loading4}
              pagination={false}
              size="middle"
              scroll={{ y: 240 }}
              columns={this.reqFromDetailColumns}
              dataSource={showMore ? tableObj.list.slice(0, tableObj.page * 30) : tableObj.list}
              onChange={(pagination, filters, sorter) => this.detailTbChangeInterface(sorter, ip)}
            />

            <div style={{ textAlign: 'center', height: 52 }}>
              {showMore && (
                <Button
                  className="smallWhiteBtn"
                  style={{ margin: '20px 0 5px' }}
                  onClick={() => {
                    expandedRowTables[ip].page += 1;
                    this.setState({ expandedRowTables });
                  }}
                >
                  查看更多
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  onExpandedRowsChangeReqFrom = (expandedRows) => {
    const { expandedRowKeys, expandedRowTables } = this.state;
    let newExpandedRowTables = expandedRowTables;
    const curKeys = Object.keys(expandedRowTables);

    if (expandedRows.length > expandedRowKeys.length) {
      let newTbObj = {};

      const newKeys = expandedRows.filter((tmpKey) => curKeys.indexOf(tmpKey) < 0);
      const newKey = newKeys[0] || '';

      const { dispatch } = this.props;
      const { queryReqFrom, startTime, endTime, auth } = this.state;
      if (newKey) {
        // const newRecord = list.filter(obj => obj.interface === newKey);
        // const url = newRecord[0].interface;
        // const url = newKey;
        const newPay = {
          attacker_ip: newKey,
          startTime,
          endTime,
          sub_category: queryReqFrom.sub_category,
          search: queryReqFrom.search,
          auth,
        };
        dispatch({
          type: 'dataLeakage/fetchReqsDetail',
          payload: newPay,
        })
          .then(() => {
            const {
              dataLeakage: { reqsDetail },
            } = this.props;
            newTbObj = { [newKey]: { ...reqsDetail } };
            newExpandedRowTables = Object.assign({}, expandedRowTables, newTbObj);
            this.setState({ expandedRowTables: newExpandedRowTables });
          })
          .catch((error) => {
            newTbObj = { [newKey]: {} };
            newExpandedRowTables = Object.assign({}, expandedRowTables, newTbObj);
            this.setState({ expandedRowTables: newExpandedRowTables });
          });
      }
    }
    this.setState({ expandedRowKeys: expandedRows });
  };

  interfaceTopClick = (url) => {
    const top = 300;
    if (document.documentElement) {
      document.documentElement.scrollTop = Number(top);
    } else if (document.body) {
      document.body.scrollTop = Number(top);
    }
    const { dispatch } = this.props;
    const { queryInterface, startTime, endTime, expandedRowKeys, auth } = this.state;
    const newQuery = Object.assign({}, queryInterface, { interface: url });
    const newInterfacePay = { ...newQuery, startTime, endTime, page: 1, auth };
    const newExpandedRowKeys = [...expandedRowKeys, url];
    // expandedRowKeys.push(url);
    this.setState({ queryInterface: newQuery, defaultActiveKey: '1' });
    dispatch({
      type: 'dataLeakage/fetchInterfaceEvents',
      payload: newInterfacePay,
    });
    this.onExpandedRowsChangeInterface(newExpandedRowKeys);
  };

  reqFromTopClick = (url) => {
    const top = 300;
    if (document.documentElement) {
      document.documentElement.scrollTop = Number(top);
    } else if (document.body) {
      document.body.scrollTop = Number(top);
    }
    const { dispatch } = this.props;
    const { queryReqFrom, startTime, endTime, expandedRowKeys, auth } = this.state;
    const newQuery = Object.assign({}, queryReqFrom, { search: url });
    const newReqFromPay = { ...newQuery, startTime, endTime, page: 1, auth };
    const newExpandedRowKeys = [...expandedRowKeys, url];
    this.setState({ queryReqFrom: newQuery, defaultActiveKey: '2' });
    dispatch({
      type: 'dataLeakage/fetchReqsEvents',
      payload: newReqFromPay,
    });
    this.onExpandedRowsChangeReqFrom(newExpandedRowKeys);
  };

  onChangeTab = (activeKey) => {
    this.setState({ defaultActiveKey: activeKey });
  };

  onChange = () => {
    this.setState({
      modelVisible: true,
    });
  };

  handleCancel = () => {
    this.setState({
      modelVisible: false,
    });
  };

  getChildren = (model, desensitization) => {
    this.setState({
      modelVisible: model,
      showDesensitization: desensitization,
    });

    localStorage.setItem('showDesensitization', desensitization);
  };

  // 认证 非认证下拉
  authOnChange = (value) => {
    this.setState({
      auth: value,
      expandedRowKeys: [], // 全局查询变化 列表展开项清空
      expandedRowTables: {},
    });
  };

  formCancel = () => {
    this.setState({ formVisible: false });
    this.fetchData();
  };

  render() {
    const {
      dataLeakage: {
        categoryArr,
        sensitiveDataTrend,
        interfaceTopList,
        reqsTopList,
        picTotal,
        interfaceEvents,
        reqsEvents,
      },
      loading1,
      loading2,
      loading3,
      loading4,
      loading5,
    } = this.props;
    const {
      formVisible,
      auth,
      defaultActiveKey,
      queryInterface,
      queryReqFrom,
      timeRange,
      startTime,
      endTime,
      expandedRowKeys,
      pageWidth,
    } = this.state;
    const { showDesensitization, modelVisible } = this.state;
    if (localStorage.getItem('showDesensitization') === null) {
      localStorage.setItem('showDesensitization', false);
    }
    const cateArr = categoryArr.map((cate) => ({ name: cate, value: cate }));
    this.filterListInterface[0].list = [{ name: '全部', value: '' }, ...cateArr];
    return (
      <div className="contentWraper">
        <div>
          <div className="commonHeader" style={{ position: 'relative' }}>
            数据泄露
          </div>
          <div className={styles.topSearch}>
            <div className={styles.timeInput}>
              <div>
                <div style={{ display: 'inline-block' }}>
                  <span className={styles.labelStyle}>时间：</span>
                </div>
                <div style={{ display: 'inline-block' }}>
                  <TimeRangePicker
                    selectWidth="210px"
                    customOptions={options}
                    timeRange={timeRange}
                    startTime={startTime}
                    endTime={endTime}
                    timePickerOnchange={this.timePickerOnchange}
                  />
                </div>
              </div>
              <div>
                <div style={{ display: 'inline-block' }}>
                  <span className={styles.labelStyle}>授权状态：</span>
                </div>
                <div style={{ display: 'inline-block' }}>
                  <Select style={{ width: 210 }} value={auth} onChange={this.authOnChange}>
                    <Option value="">全部</Option>
                    <Option value="true">授权</Option>
                    <Option value="false">非授权</Option>
                  </Select>
                </div>
              </div>
              <div>
                <Button type="primary" onClick={this.fetchData} className="smallBlueBtn">
                  搜索
                </Button>
              </div>
            </div>
            <Button
              type="link"
              onClick={() => {
                this.setState({ formVisible: true });
              }}
              disabled={this.esAz === 'all'}
            >
              授权关键词配置
            </Button>
          </div>
          <div>
            <div style={{ padding: '12px' }}>
              <Row gutter={12} style={{ marginBottom: 12 }}>
                <Col span={12}>
                  <Card
                    className={styles.ListCard}
                    loading={loading1}
                    title={
                      <div>
                        <span className={styles.circleIcon} />
                        <span>事件趋势</span>
                      </div>
                    }
                    headStyle={{
                      padding: '0 20px',
                      height: '48px',
                      lineHeight: '48px',
                      fontSize: '14px',
                    }}
                    bodyStyle={{ padding: '5px 20px 15px', height: 307 }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 11, left: 10 }}>
                        共
                        <span style={{ color: '#3369d9' }}>{` ${numeral(picTotal).format(
                          '0,0'
                        )} `}</span>
                        条结果
                      </div>
                      <IntervalStackBarchart
                        // linkType="content"
                        // toLink={this.toLink}
                        padding={[60, 14, 24, 60]}
                        legend={
                          <Legend
                            useHtml
                            offsetY={-6}
                            g2-legend={{
                              width: '82%',
                              // border: '1px solid red',
                            }}
                            g2-legend-list={{
                              textAlign: 'right',
                            }}
                            g2-legend-list-item={{
                              margin: '0 8px 0 0',
                            }}
                            position="top-right"
                          />
                        }
                        data={sensitiveDataTrend}
                        height={287}
                        color={[
                          'type',
                          [
                            '#5075FF',
                            '#4BBDF5',
                            '#F3EB4A',
                            '#13C2C2',
                            '#6CD9B3',
                            '#2FC25B',
                            '#9DD96C',
                          ],
                        ]}
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <ListCard
                    loading={loading2}
                    title={
                      <div>
                        <span className={styles.circleIcon} />
                        <span>接口TOP5</span>
                      </div>
                    }
                    pageWidth={pageWidth}
                    data={interfaceTopList}
                    spanClick={this.interfaceTopClick}
                  />
                </Col>
                <Col span={6}>
                  <ListCard
                    loading={loading3}
                    title={
                      <div>
                        <span className={styles.circleIcon} />
                        <span>请求源TOP5</span>
                      </div>
                    }
                    pageWidth={pageWidth}
                    data={reqsTopList}
                    spanClick={this.reqFromTopClick}
                  />
                </Col>
              </Row>

              <div className={styles.tabsWrap}>
                <Tabs activeKey={defaultActiveKey} onChange={this.onChangeTab}>
                  <TabPane tab="泄露事件接口" key="1">
                    <div className={styles.searchWrap}>
                      <FilterBlock
                        filterList={this.filterListInterface}
                        filterOnChange={this.filterOnChangeInterface}
                        submitFilter={this.submitFilterInterface}
                        colNum={3}
                        query={queryInterface}
                        // timeRange={timeRange}
                      />
                    </div>
                    <div className={styles.tableWrap}>
                      <Table
                        rowKey="interface"
                        loading={loading4}
                        pagination={{
                          total: interfaceEvents.total,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          pageSize: queryInterface.pageSize,
                          pageSizeOptions: configSettings.pageSizeOptions,
                          current: queryInterface.page,
                          showTotal: (total) => `（${total}项）`,
                          // onShowSizeChange: this.paginationChange,
                          // onChange: this.paginationChange,
                        }}
                        size="middle"
                        columns={this.eventColumns}
                        dataSource={interfaceEvents.list}
                        onChange={this.handleTableChangeInterface}
                        // scroll={{ x: 1720 }}
                        expandRowByClick
                        expandedRowRender={this.expandedRowRenderInterface}
                        expandedRowKeys={expandedRowKeys}
                        onExpandedRowsChange={this.onExpandedRowsChangeInterface}
                      />
                    </div>
                  </TabPane>
                  <TabPane tab="泄露事件请求源" key="2">
                    <div className={styles.searchWrap}>
                      <FilterBlock
                        filterList={this.filterListReqFrom}
                        filterOnChange={this.filterOnChangeReqFrom}
                        submitFilter={this.submitFilterReqFrom}
                        colNum={3}
                        query={queryReqFrom}
                        // timeRange={timeRange}
                      />
                    </div>
                    <div className={styles.tableWrap}>
                      <Table
                        rowKey="ip"
                        loading={loading5}
                        pagination={{
                          total: reqsEvents.total,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          pageSize: queryReqFrom.pageSize,
                          pageSizeOptions: configSettings.pageSizeOptions,
                          current: queryReqFrom.page,
                          showTotal: (total) => `（${total}项）`,
                          // onShowSizeChange: this.paginationChange,
                          // onChange: this.paginationChange,
                        }}
                        size="middle"
                        columns={this.reqFromEventColumns}
                        dataSource={reqsEvents.list}
                        onChange={this.handleTableChangeReqFrom}
                        // scroll={{ x: 1720 }}
                        expandRowByClick
                        expandedRowRender={this.expandedRowRenderReqFrom}
                        expandedRowKeys={expandedRowKeys}
                        onExpandedRowsChange={this.onExpandedRowsChangeReqFrom}
                      />
                    </div>
                  </TabPane>
                </Tabs>
                <div className={styles.desensitization} onClick={this.showDesen}>
                  <span>数据脱敏展示</span>
                  <Switch
                    style={{ marginBottom: ' 5px' }}
                    checked={showDesensitization}
                    size="small"
                    onClick={this.onChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {formVisible && <DataleakKeyForm visible={formVisible} onCancel={this.formCancel} />}
        <Modal
          title="超级管理员登陆"
          visible={modelVisible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <div id={styles.loginform}>
            <Login
              showDesensitization={showDesensitization}
              modelVisible={modelVisible}
              getChildren={this.getChildren}
              dispatch={this.props.dispatch}
            />
          </div>
        </Modal>
      </div>
    );
  }
}
export default DataLeakage;
