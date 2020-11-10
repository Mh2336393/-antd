/* eslint-disable no-unused-vars */
/* eslint-disable no-eval */
/* eslint-disable no-danger */
import React, { Component, Fragment } from 'react';
import { connect } from 'umi';

import {
  CaretRightOutlined,
  DownOutlined,
  PauseOutlined,
  PlusOutlined,
  QuestionCircleFilled,
  ReadOutlined,
  SyncOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';

import {
  Divider,
  Select,
  Button,
  Input,
  Table,
  Spin,
  DatePicker,
  Tabs,
  Tooltip,
  Popover,
  Progress,
  Modal,
  Row,
  Col,
  message,
  Menu,
  Dropdown,
} from 'antd';
import { Resizable } from 'react-resizable';
import Cookies from 'js-cookie';
import { HistogramBrush } from '@/components/Charts';
import ReactJson from 'react-json-view';
import EditFilterSearch from '@/components/EditFilterSearch';
import moment from 'moment';
import _ from 'lodash';
import setClause from '@/tools/setClause';
import MultiSortSelect from '@/components/MultiSortSelect';
import LogStorageSelect from '@/components/LogStorageSelect';
import SidebarList from './SidebarList';
// import AddSurvey from './AddSurvey';
import QuickMatch from './QuickMatch';
import GeneralPageHeader from '@/components/GeneralPageHeader';
import styles from './index.less';
import FieldAllRanges from './FieldAllRanges';
import DialogTabPage from '../../Event/EventDetail/DialogTabPage';
import esAdaptiveSearch from '@/tools/esAdaptiveSearch';
import esSearch from '@/tools/esSearch';
import authority from '@/utils/authority';
const { getAuth } = authority;
import configSettings from '@/configSettings';

/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-string-refs */
/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable */

const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
const { Option } = Select;
const format = 'YYYY-MM-DD HH:mm:ss';
const options = [
  '近15分钟',
  '近1小时',
  '近24小时',
  '近7天',
  '近30天',
  '近90天',
  '今天',
  '本周',
  '自定义',
];
const autoLists = [
  { name: '自动刷新', value: 'auto' },
  { name: '关', value: 'off' },
  { name: '5秒钟', value: '5' },
  { name: '10秒钟', value: '10' },
  { name: '30秒钟', value: '30' },
  { name: '45秒钟', value: '45' },
  { name: '1分钟', value: '60' },
  { name: '5分钟', value: '300' },
  { name: '15分钟', value: '900' },
  { name: '30分钟', value: '1800' },
  { name: '1小时', value: '3600' },
  { name: '2小时', value: '7200' },
];
const hexKey = [
  'http.http_request_body',
  'http.http_request_header',
  'http.http_response_body',
  'http.http_response_header',
  'flow.pcap.data',
  'toserver_payload.data',
  'toclient_payload.data',
  'packet',
  'http_log.http.http_request_body',
  'http_log.http.http_request_header',
  'http_log.http.http_response_body',
  'http_log.http.http_response_header',
  'flow_log.flow.pcap.data',
];
let searchDesc = '';
let saveSearchClicked = false; // 防止保存搜索时多次提交保存请求
const searchPageSize = 6;

// 伸缩
const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  if (!width) {
    return <th {...restProps} />;
  }
  return (
    <Resizable
      width={width}
      height={50}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      luceneSearch: true, // 默认使用lucene语法搜索
      filterSearchClickale: true,
      filterSearchVisible: false,
      timePickerShow: false, // 自定义选择时间
      indexSelect: [], // 存放查询的索引列表
      timeSelect: '近24小时',
      currentInterval: '30m', // 当前聚合粒度
      intervalFormatMapping: esAdaptiveSearch.intervalFormatMapping['30m'], // 直方图渲染格式映射
      columns: [],
      timeStart: moment().subtract(1, 'days'), // 时间选择器的起始时间戳(ms)
      timeEnd: moment(), // 时间选择器的结束时间戳(ms)
      defaultShow: true, // 当未选择展示的字段时，默认展示所有的字段信息
      selectFields: [], // 选择展示的字段列表
      selectedRowKeys: [],
      page: 1,
      pageSize: 20,
      searchPage: 1,
      singleColunmShow: true, // table字段是否是一列列的展示 默认值改为true
      fullScreen: false, // table是否全屏展示
      fieldAllRangesShow: false, // 是否对某个字段的取值查看全部
      currentField: '', // 当前正在查看的字段类型
      logFilters: [],
      searchSaveVisible: false,
      searchListVisible: false,
      exportPartParams: { cmd: 'export_es_search', type: 1, show_fields: ['all'] }, // 用于部分导出
      fieldsMatch: [], // 字段匹配数据
      searchLogMatch: [], // 搜索记录匹配
      tooltipShow: false, // 快捷搜索提示
      surveyList: [], // 添加近调查的日志
      surveyVisible: false,
      surveyOperate: '',
      searchArr: [], // 储存当前所选索引所有可搜索的字段
      fieldType: {}, // 储存当前所选索引所有可搜索的字段的对应type
      expandedRowKeys: [],
      expandedRowPcap: {},
      hexToUtf: {},
      isAuto: false,
      autoSelect: 'auto',
      logStorageFocus: false,
      inputValue: '',
    };
    let saveinput = '';
    // 日志改变、移除或新增字段、Table中增加字段、表头切换-- 用户人为改变字段
    this.userSelectFiels = [
      'src_ip',
      'src_port',
      'dst_ip',
      'dst_port',
      'proto',
      'app_proto',
      'alert.signature',
      'alert.signature_id',
      'alert.category',
      'alert.sub_category',
      'severity',
      'confidence',
      'score',
    ];
    // 默认列表表头 （即 选择事件日志 所对应的列表表头） //根据当前不同日志类型所保存的 对应的默认列表表头
    this.iniTableFields = [
      'src_ip',
      'src_port',
      'dst_ip',
      'dst_port',
      'proto',
      'app_proto',
      'alert.signature',
      'alert.signature_id',
      'alert.category',
      'alert.sub_category',
      'severity',
      'confidence',
      'score',
    ];
    this.autoTimer = null; // 自动更新 定时器
    this.selectObj = {}; // 保存选择的日志
    this.query = {
      index: '*',
      body: {
        query: {
          bool: {
            filter: {
              bool: {
                filter: {
                  range: {
                    timestamp: {
                      gte: moment().subtract(1, 'days').valueOf(),
                      lte: moment().valueOf(),
                      format: 'epoch_millis',
                    },
                  },
                },
                // must: [{ match_all: {} }],
                must: [],
                must_not: [],
                should: [],
              },
            },
          },
        },
        aggs: {
          count_stats: {
            date_histogram: {
              field: 'timestamp',
              interval: '30m',
              time_zone: 'Asia/Shanghai',
              min_doc_count: 1,
            },
          },
        },
      },
      sort: ['timestamp:desc'],
    };
    this.defaultQuery = _.cloneDeep(this.query);
    this.preTimeRange = []; // 存放最近框选的时间戳范围（默认存放50个操作记录）
    this.firstColumns = [
      {
        title: '时间',
        dataIndex: 'time',
        key: 'time',
        sorter: true,
        width: 160,
        render: (text, record) => {
          const _source = record._source;
          return (
            <span style={{ fontSize: '12px' }}>{moment(_source.timestamp).format(format)}</span>
          );
        },
      },
    ];
    if (props.ccsData.ccsLevel === 'leader') {
      const { curCcsVal, clusterNameIp } = props.ccsData;
      this.firstColumns[1] = {
        title: '设备',
        key: 'devid',
        dataIndex: 'devid',
        render: (text, record) => {
          let devName = curCcsVal;
          const { _index } = record;
          if (_index.indexOf(':') > -1) {
            const devid = _index.split(':')[0];
            devName = clusterNameIp[devid] || '';
          }
          return <div style={{ width: 60 }}>{devName}</div>;
        },
      };
    }
    this.searchListColumns = [
      {
        title: '名称',
        dataIndex: 'Fname',
        key: 'Fname',
        width: 100,
      },
      {
        title: '日志类型',
        dataIndex: 'Flog_type',
        key: 'Flog_type',
        width: 80,
        render: (text) => {
          const logArr = text.split('|');
          if (logArr.length > 1) {
            const popContent = (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {logArr.map((log) => (
                  <p style={{ padding: 0 }} key={log}>
                    {log}
                  </p>
                ))}
              </div>
            );
            return (
              <div>
                <Popover content={popContent} placement="rightTop" title="日志类型" trigger="hover">
                  <div>
                    多个( <span className="fontBlue"> {logArr.length} </span>)
                  </div>
                </Popover>
              </div>
            );
          }
          return <span>{logArr[0]}</span>;
        },
      },
      {
        title: '搜索语句',
        dataIndex: 'Fcondition_desc',
        key: 'Fcondition_desc',
        width: 240,
        render: (text, record) => {
          return (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Popover
                content={<div style={{ width: 500 }}>{text}</div>}
                placement="rightTop"
                title="搜索语句"
                getPopupContainer={(triggerNode) => triggerNode}
              >
                <div
                  onClick={() => {
                    this.openSpecificSearch(record);
                  }}
                  style={{ WebkitBoxOrient: 'vertical' }}
                  className={styles.searchIfDiv}
                >
                  {text}
                </div>
              </Popover>
            </div>
          );
        },
      },
      {
        title: '时间范围',
        dataIndex: 'Ftime_range_desc',
        key: 'Ftime_range_desc',
        width: 120,
      },
      {
        title: '展示字段',
        dataIndex: 'Fields',
        key: 'Fields',
        // width: 20,
        render: (text, record) => {
          const { Ftb_Fields } = record;
          const json = JSON.parse(Ftb_Fields);
          const { selectFields } = json;
          if (selectFields.length > 1) {
            const popContent = (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {selectFields.map((field) => (
                  <p style={{ padding: 0 }} key={field}>
                    {field}
                  </p>
                ))}
              </div>
            );
            return (
              <div>
                <Popover content={popContent} placement="rightTop" title="展示字段" trigger="hover">
                  <div>
                    多个( <span className="fontBlue">{selectFields.length}</span>)
                  </div>
                </Popover>
              </div>
            );
          }
          if (selectFields.length === 1) {
            return <span>{selectFields[0]}</span>;
          }
          return <span>_source</span>;
        },
      },
      {
        title: '页大小',
        dataIndex: 'Fpage_size',
        key: 'Fpage_size',
        // width: 20,
        render: (text, record) => {
          const { Ftb_Fields } = record;
          const json = JSON.parse(Ftb_Fields);
          return json.pageSize;
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 50,
        render: (text, record) => (
          <a
            onClick={(e) => {
              this.onDeleteSearch(e, record.Fid);
            }}
          >
            删除
          </a>
        ),
      },
    ];
    this.menuList = (
      <Menu onClick={this.surveyClick}>
        <Menu.Item key="add">创建调查任务</Menu.Item>
        <Menu.Item key="update">添加到调查任务</Menu.Item>
      </Menu>
    );
    this.readOnly = getAuth('/analysis/search') !== 'rw';
    this.esAz = Cookies.get('ccsaz');
    this.logStorageFocusChange = this.logStorageFocusChange.bind(this);
  }

  onDeleteSearch = (e, id) => {
    e.stopPropagation();
    const {
      dispatch,
      search: {
        saveSearchList: { recordsTotal },
      },
    } = this.props;
    const pageFlag = (recordsTotal - 1) % searchPageSize;

    dispatch({
      type: `search/fetchAndSaveSearch`,
      payload: { uri: 'search/deleteSearch', data: { id } },
    })
      .then(() => {
        message.success('该条搜索删除成功');
        const { searchPage } = this.state;
        const newPage = pageFlag === 0 ? searchPage - 1 : searchPage;
        // console.log(379, 'newPage==', newPage);
        if (newPage !== 0) {
          this.setState({ searchPage: newPage }, () => {
            dispatch({
              //删除后 page不能固定为1
              type: `search/fetchAndSaveSearch`,
              payload: {
                uri: 'search/getSearchList',
                data: { page: newPage, limit: searchPageSize },
              },
            });
          });
        } else {
          this.setState({ searchListVisible: false });
        }
      })
      .catch(() => {});
  };

  pageOnChange = (page) => {
    this.props.dispatch({
      type: `search/fetchAndSaveSearch`,
      payload: { uri: 'search/getSearchList', data: { page, limit: searchPageSize } },
    });
    this.setState({ searchPage: page });
  };

  openSpecificSearch = (record) => {
    const {
      Fcondition_desc,
      Flog_type,
      Fquery,
      Ftime_range_desc,
      Fdisplay_data,
      Fflag,
      Ftb_Fields,
    } = record;
    this.query = JSON.parse(Fquery);

    // console.log(393, 'record::', record);
    // console.log(3934, 'Fflag::', Fflag);
    const tbFieldsJson = JSON.parse(Ftb_Fields);
    const { selectFields, pageSize } = tbFieldsJson;

    const logFilters = JSON.parse(Fdisplay_data);
    const indexSelect = Flog_type.split('|');
    if (Fflag === 'standard') {
      searchDesc = Fcondition_desc;
      this.setState(
        {
          luceneSearch: true,
          indexSelect,
          filterSearchClickale: Fcondition_desc === '',
          selectFields,
          pageSize,
        },
        () => {
          console.log(3934, 'selectFields::', selectFields);
          // 打开搜索模板 选择后，用户选择字段同步变更
          this.userSelectFiels = _.cloneDeep(selectFields);
          this.onSearchTimeRefresh(Ftime_range_desc);
        }
      );
    } else {
      searchDesc = '';
      // 打开搜索模板 选择后，用户选择字段同步变更
      console.log(39425, 'selectFields::', selectFields);
      this.userSelectFiels = _.cloneDeep(selectFields);
      this.filterBlockQuery(logFilters, this.query.body.query.bool.filter, Ftime_range_desc);
    }
    this.setState({
      timeSelect: Ftime_range_desc,
      indexSelect,
      searchListVisible: false,
      page: 1,
      selectFields,
      pageSize,
    });
  };

  getSourceColumns = (allColumn = true, selectFields) => [
    {
      title: '_source',
      dataIndex: '',
      key: '',
      width: 600,
      render: (text, record) => {
        const fieldParse = esSearch.sourceFieldParsing(record);
        const keyList = allColumn ? Object.keys(fieldParse) : selectFields;
        return (
          <div className={styles['source-block']}>
            {keyList.map((key) => {
              const val = fieldParse[key];
              return (
                <dl className={styles['source-dl']} key={`${record._id}_${key}`}>
                  <dt className={styles['source-dl-dt']}>{key}：</dt>
                  {hexKey.indexOf(key) < 0 ? (
                    <dd className={styles['source-dl-dd']}>
                      {val || val === 0 || val === false ? val.toString() : '-'}
                    </dd>
                  ) : (
                    <dd className={styles['source-dl-dd']}>{this.itemHexValToUtf(val)}</dd>
                  )}
                </dl>
              );
            })}
          </div>
        );
      },
    },
  ];

  // 根据每次搜索结果动态调整availableFields
  // 根据特定query进行es搜索
  fetchEsResults = () => {
    const { dispatch } = this.props;
    const { page, pageSize, currentInterval, singleColunmShow } = this.state; //selectFields,
    const selectFields = _.cloneDeep(this.userSelectFiels);
    const { index, body, sort } = this.query;
    this.setState({
      intervalFormatMapping: esAdaptiveSearch.intervalFormatMapping[currentInterval],
    });
    dispatch({ type: 'search/fetchHistogramResults', payload: { query: this.query } });
    dispatch({
      type: 'search/fetchEsResults',
      payload: { page, pageSize, query: { index, body: { query: body.query }, sort } },
    })
      .then(() => {
        // 根据每次搜索结果动态调整availableFields
        const {
          search: { allAvailableFields, fieldsAggQuery },
        } = this.props;
        if (selectFields.length > 0) {
          //在selectFields找到allAvailableFields没有的元素
          const diffArr = _.difference(selectFields, allAvailableFields);
          //在selectFields中删除diffArr的元素
          _.pullAll(selectFields, diffArr);
        }
        const defaultShow = selectFields.length === 0;
        const columns = this.getColumns(singleColunmShow, defaultShow, selectFields);
        this.setState({ defaultShow, columns, selectFields });
        // console.log('fieldsAggQuery:::', fieldsAggQuery);
        fieldsAggQuery.forEach((query) => {
          dispatch({ type: 'search/fetchAggregationsResults', payload: query });
        });
      })
      .catch(() => {});
  };

  componentWillMount = () => {
    const {
      dispatch,
      location: { query: queryObj },
    } = this.props;
    if (this.readOnly) {
      this.searchListColumns.pop();
    }
    const bool = this.query.body.query.bool.filter.bool;
    const aggs = this.query.body.aggs;
    searchDesc = '';
    if (queryObj && queryObj.type) {
      const { type, startTime, endTime, condition } = queryObj;
      if (startTime && endTime) {
        const currentInterval = esAdaptiveSearch.timeRangeToItervalMapping(endTime - startTime);
        const intervalFormatMapping = esAdaptiveSearch.intervalFormatMapping[currentInterval];
        aggs.count_stats.date_histogram.interval = currentInterval;
        const timeStart = moment(parseInt(startTime, 10));
        const timeEnd = moment(parseInt(endTime, 10));
        this.setState({
          timeSelect: `${timeStart.format(format)} 至 ${timeEnd.format(format)}`,
          currentInterval,
          intervalFormatMapping,
          timeStart,
          timeEnd,
          filterSearchClickale: false,
        });
        const timestamp = bool.filter.range.timestamp;
        timestamp.gte = startTime;
        timestamp.lte = endTime;
      }
      if (queryObj.isHex && condition) {
        searchDesc = unescape(condition.replace(/\\/g, '%')) || '';
        bool.must.unshift({ query_string: { query: searchDesc, analyze_wildcard: true } });
      } else if (condition) {
        searchDesc = condition;
        bool.must.unshift({ query_string: { query: searchDesc, analyze_wildcard: true } });
      }
    }
    dispatch({ type: 'search/fetchIndexList' });
    dispatch({ type: 'search/fetchSearchLog' });
  };

  componentDidMount = () => {
    const { dispatch } = this.props;
  };
  // // 伸缩
  components = {
    header: {
      cell: ResizableTitle,
    },
  };
  componentWillReceiveProps = (nextProps) => {
    const {
      search: { indexArr, index_search, index_search_type },
      dispatch,
      location: { query: queryObj },
    } = nextProps;
    if (this.props.search.indexArr !== indexArr) {
      const { page, pageSize, timeStart, timeEnd, selectFields, singleColunmShow } = this.state;
      this.allIndexList = indexArr;
      let indexSelect = [...indexArr];
      if (queryObj && queryObj.type) {
        // 代表传入的是多个数据类型
        if (queryObj.type.includes(',')) {
          const typeArr = queryObj.type.split(',');
          indexSelect = this.allIndexList.filter((key) => {
            return typeArr.includes(key);
          });
        } else {
          indexSelect = this.allIndexList.filter((key) => key === queryObj.type);
          const { type } = queryObj;
          if (type === 'dashboardEmail') {
            indexSelect = this.allIndexList.filter(
              (key) =>
                key.indexOf('smtp') > -1 || key.indexOf('imap') > -1 || key.indexOf('pop') > -1
            );
          }
          if (type === 'tcp/udp') {
            indexSelect = this.allIndexList.filter((key) => key.indexOf('flow') > -1);
          }
        }
      } else {
        // 默认选中的索引日志
        indexSelect = this.allIndexList.filter((key) => ['alert'].indexOf(key) > -1);
      }
      // console.log('indexSelect:', indexSelect);
      this.query.index = indexSelect;
      esSearch.getFinalQuery(indexSelect, this.query);
      const { index, body, sort } = this.query;
      dispatch({ type: 'search/fetchHistogramResults', payload: { query: this.query } });
      dispatch({
        type: 'search/fetchEsResults',
        payload: { page, pageSize, query: { index, body: { query: body.query }, sort } },
      })
        .then(() => {
          //初始化页面的时候，表头不为_source 而是 单列 默认表头
          //即 页码初始化时  this.getColumns 传值默认是 true, true, []
          const defaultShow = selectFields.length === 0;
          const columns = this.getColumns(singleColunmShow, defaultShow, selectFields);

          let curSelectFields = [].concat(selectFields);
          if (singleColunmShow && !selectFields.length) {
            curSelectFields = columns.slice(1).map((obj) => obj.key);
          }
          console.log(520, 'singleColunmShow==', singleColunmShow, 'selectFields==', selectFields);
          console.log(520, 'columns==', columns);
          this.setState({
            columns,
            selectFields: curSelectFields,
            defaultShow: curSelectFields.length === 0,
          });

          const {
            search: { fieldsAggQuery },
          } = this.props;
          fieldsAggQuery.forEach((query) => {
            dispatch({ type: 'search/fetchAggregationsResults', payload: query });
          });
        })
        .catch(() => {});
      // 如果是跳转过来 有type传值
      this.tableThShowWithEsIndexChange(indexSelect);
      let searchArr = [];
      let fieldType = {};
      let diffFields = []; // 存type不一致的字段
      indexSelect.forEach((index, idx) => {
        const searchList = index_search[index];
        if (idx === 0) {
          searchArr = searchList;
          fieldType = index_search_type[index];
        } else {
          const diff_Fields = searchList.filter(
            (field) => fieldType[field] && fieldType[field] !== index_search_type[index][field]
          );
          diffFields = diffFields.concat(diff_Fields);
          fieldType = Object.assign(fieldType, index_search_type[index]);
          searchArr = searchArr.concat(searchList);
        }
      });
      searchArr = _.uniq(searchArr);
      _.pullAll(searchArr, diffFields);
      // console.log('diffFields::', diffFields);
      searchArr.sort();
      // console.log('searchArr::', searchArr);
      this.setState({ indexSelect, searchArr, fieldType });
    }
  };

  filterBlockQuery = (tempLogFilters, search, timeSelect = this.state.timeSelect) => {
    const flag = tempLogFilters.length === 0;
    this.query.body.query.bool.filter = search;
    this.setState({
      logFilters: _.cloneDeep(tempLogFilters),
      filterSearchVisible: false,
      luceneSearch: flag,
      filterSearchClickale: true,
    });
    if (flag) {
      searchDesc = '';
    } else {
      this.props.dispatch({
        type: 'search/putSearchLog',
        payload: { content: this.changeToLuceneQuery(tempLogFilters) },
      });
    }
    this.onSearchTimeRefresh(timeSelect);
  };

  editFilterCancel = () => {
    this.setState({ filterSearchVisible: false });
  };

  changeToLuceneQuery = (logFilters, func) => {
    let searchStr = '';
    const shouldArr = []; // 用来保存"至少包含其一"的filter项
    const exceptShouldArr = []; // 用来保存除"至少包含其一"的filter项
    logFilters.forEach((item, index) => {
      const field = item.patternsField;
      const selectedtype = item.selectedtype;
      const value = item.value;
      let text = '';
      let luceneText = '';
      text += field;
      if (selectedtype === 'range') {
        const valueArr = Object.keys(value);
        luceneText += `${field}:`;
        if (valueArr[0] === 'gt') {
          text += ' 大于';
          luceneText += '{';
        } else {
          text += ' 大于等于';
          luceneText += '[';
        }
        text += ` ${value[valueArr[0]]} 且 `;
        luceneText += `${value[valueArr[0]]} TO ${value[valueArr[1]]}`;
        if (valueArr[1] === 'lt') {
          text += `小于 `;
          luceneText += `}`;
        } else {
          text += '小于等于 ';
          luceneText += `]`;
        }
        text += value[valueArr[1]];
      } else if (selectedtype === 'term') {
        text += ` = ${value}`;
        luceneText = `${field}:${value}`;
      } else {
        if (selectedtype === 'wildcard') {
          luceneText = `${field}:${value}`;
        } else if (selectedtype === 'prefix') {
          luceneText = `${field}:${value}*`;
        } else if (selectedtype === 'missing') {
          luceneText = `NOT _exists_:${field}`;
        }
        text += ` ${esSearch.logTypeName[selectedtype]} ${value || ''}`;
      }
      if (item.condition === 'must') {
        text = `必须包含：${text}`;
        exceptShouldArr.push(luceneText);
      } else if (item.condition === 'should') {
        text = `至少包含其一：${text}`;
        shouldArr.push(luceneText);
      } else {
        text = `不得包含：${text}`;
        if (selectedtype === 'missing') {
          luceneText = `_exists_:${field}`;
        } else {
          luceneText = `NOT ${luceneText}`;
        }
        exceptShouldArr.push(luceneText);
      }
      func && func(index, text);
    });
    if (shouldArr.length > 0) {
      searchStr =
        exceptShouldArr.length > 0
          ? `${exceptShouldArr.join(' AND ')} AND (${shouldArr.join(' OR ')})`
          : shouldArr.join(' OR ');
    } else {
      searchStr = `${exceptShouldArr.join(' AND ')}`;
    }
    return searchStr;
  };
  saveInput = () => {
    const { luceneSearch, logFilters } = this.state;

    const childDiv1 = document.createElement('div');
    const textEle = document.createTextNode(this.saveinput);
    childDiv1.appendChild(textEle);
    childDiv1.style.cssText =
      'display: inline-block; height: 22px; line-height: 22px; margin-right: 8px;background-color: rgb(245,245,245); border:1px solid #ccc; border-radius: 6px; padding: 0 8px; font-size: 12px; ';
    const btn1 = document.createElement('a');
    btn1.onclick = () => {
      // this.setState({
      //   inputValue:""
      // })
      childDiv1.parentNode.removeChild(childDiv1);
      this.saveinput = '';
      this.deleteFilterDiv(Math.floor(Math.random() * 1000000000000));
    };
    btn1.innerHTML = '×';
    btn1.style.cssText = 'margin-left: 6px; font-size: 14px; color: #54576a;';
    childDiv1.appendChild(btn1);

    this.refs.searchTerms.appendChild(childDiv1);
  };
  // 以lucene语句保存语句,搜索filter块的展示
  newSearchTermsShow = () => {
    const { luceneSearch, logFilters } = this.state;
    if (!luceneSearch && this.refs.searchTerms) {
      this.refs.searchTerms.innerHTML = '';
      if (this.saveinput) {
        this.saveInput();
      }
      searchDesc = this.changeToLuceneQuery(logFilters, (index, text) => {
        // console.log("text::::",text);
        const childDiv = document.createElement('div');
        const textEle = document.createTextNode(text);
        childDiv.appendChild(textEle);
        childDiv.style.cssText =
          'display: inline-block; height: 22px; line-height: 22px; margin-right: 8px;background-color: rgb(245,245,245); border:1px solid #ccc; border-radius: 6px; padding: 0 8px; font-size: 12px; ';
        const btn = document.createElement('a');
        btn.onclick = () => {
          this.deleteFilterDiv(index);
        };
        btn.innerHTML = '×';
        btn.style.cssText = 'margin-left: 6px; font-size: 14px; color: #54576a;';
        childDiv.appendChild(btn);

        this.refs.searchTerms.appendChild(childDiv);
      });
    }
  };

  deleteFilterDiv = (index) => {
    const { logFilters } = this.state;
    const newLogFilters = _.cloneDeep(logFilters); // 不要直接改变logFilters，不然EditFilterSearch在判断componentWillReceiveProps时会出错
    newLogFilters.splice(index, 1);
    this.filterDivSearch(newLogFilters);
    searchDesc = this.saveinput;
  };

  filterDivSearch = (logFilters) => {
    const filter = this.query.body.query.bool.filter.bool.filter;
    const search = { bool: { filter, must: [], must_not: [], should: [] } };
    logFilters.forEach((item) => {
      const bool = item.condition || 'should';
      const field = item.patternsField || '_all';
      const op = item.selectedtype || 'match_all';
      setClause(item.value, field, op, bool, search);
    });
    this.query.body.query.bool.filter = search;
    this.onSearchTimeRefresh(this.state.timeSelect);
    this.setState({ logFilters, luceneSearch: logFilters.length === 0 });
  };

  onIndexChange = (selectList) => {
    const { indexSelect } = this.state;
    const {
      search: { index_search, index_search_type },
    } = this.props;
    this.query.index = selectList;
    esSearch.getFinalQuery(selectList, this.query);

    let searchArr = [];
    let fieldType = {};
    let diffFields = []; // 存type不一致的字段
    selectList.forEach((index, idx) => {
      const searchList = index_search[index];
      if (idx === 0) {
        searchArr = searchList;
        fieldType = index_search_type[index];
      } else {
        const diff_Fields = searchList.filter(
          (field) => fieldType[field] && fieldType[field] !== index_search_type[index][field]
        );
        diffFields = diffFields.concat(diff_Fields);
        fieldType = Object.assign(fieldType, index_search_type[index]);
        searchArr = searchArr.concat(searchList);
      }
    });

    searchArr = _.uniq(searchArr);
    _.pullAll(searchArr, diffFields);
    searchArr.sort();

    // 判断日志选择是否有变更
    // this.indexHasChange = !_.isEqual(indexSelect, selectList);
    this.tableThShowWithEsIndexChange(selectList);

    // console.log('onIndexChange searchArr:::', searchArr);
    this.setState({ indexSelect: selectList, page: 1, searchArr, fieldType });
  };
  // 流量日志存储选择 改变
  onTrafficLogStorageSelection = async (selectList) => {
    const { dispatch } = this.props;
    const { logStorageFocus } = this.state;
    let that = this;
    // 先更新不存储得流量日志策略
    await dispatch({ type: 'search/updateDenyAllFromDB', payload: { selectList } });
    message.success('流量日志存储保存成功');
    that.setState({
      logStorageFocus: !logStorageFocus,
    });
  };

  // 列表表头根据所选择的日志类型来自动变更显示
  tableThShowWithEsIndexChange = (indexList) => {
    let showFields = [];
    const eventList = indexList.filter(
      (key) => ['入侵感知事件', '失陷感知事件', '异常文件事件'].indexOf(key) > -1
    );
    console.log('891eventList', eventList);
    if (indexList.length === eventList.length) {
      showFields = [
        'src.ip',
        'src.port',
        'dst.ip',
        'dst.port',
        'protocol',
        'name',
        'category_1',
        'attackStage',
        'score',
      ];
    } else if (indexList.length === 1 && indexList[0] === 'alert') {
      showFields = [
        'src_ip',
        'src_port',
        'dst_ip',
        'dst_port',
        'proto',
        'app_proto',
        'alert.signature',
        'alert.signature_id',
        'alert.category',
        'alert.sub_category',
        'severity',
        'confidence',
        'score',
      ];
    } else if (indexList.length === 1 && indexList[0] === 'apt_black') {
      showFields = [
        'src_ip',
        'src_port',
        'dst_ip',
        'dst_port',
        'proto',
        'app_proto',
        'fileinfo.filename',
        'fileinfo.filetype',
        'fileinfo.size',
        'name',
      ];
    } else if (indexList.length === 1 && indexList[0] === 'ioc_alert') {
      showFields = [
        'src_ip',
        'src_port',
        'dst_ip',
        'dst_port',
        'proto',
        'app_proto',
        'ioc',
        'ioc_plaintext',
        'ioc_tags',
        'ioc_type',
        'severity',
        'confidence',
        'score',
      ];
    } else if (indexList.length === 1 && indexList[0] === 'flow') {
      showFields = [
        'event_type',
        'flow_id',
        'src_ip',
        'src_port',
        'dst_ip',
        'dst_port',
        'proto',
        'app_proto',
        'flow.alerted',
        'flow.start',
        'flow.end',
      ];
    } else if (indexList.length === 1 && indexList[0] === 'fileinfo') {
      showFields = [
        'event_type',
        'flow_id',
        'src_ip',
        'src_port',
        'dst_ip',
        'dst_port',
        'proto',
        'app_proto',
        'fileinfo.filename',
        'fileinfo.filetype',
        'fileinfo.size',
      ];
    } else if (indexList.length === 1 && indexList[0] === 'http') {
      showFields = [
        'event_type',
        'flow_id',
        'src_ip',
        'src_port',
        'dst_ip',
        'dst_port',
        'proto',
        'http.hostname',
        'http.url',
        'http.status',
      ];
    } else if (indexList.length === 1 && indexList[0] === 'smtp') {
      showFields = [
        'event_type',
        'src_ip',
        'dst_ip',
        'email.from.address',
        'email.from.name',
        'email.to.address',
        'email.to.name',
        'email.subject',
      ];
    } else {
      showFields = [
        'event_type',
        'proto',
        'app_proto',
        'alert.signature',
        'alert_mode',
        'asset_ip',
        'alert.threshold',
        'alert.actual_value',
      ];
    }
    //保存 不同日志所对应的 默认列表表头
    this.iniTableFields = [].concat(showFields);
    this.userSelectFiels = _.cloneDeep(showFields);
    console.log('this.iniTableFields', this.iniTableFields);
    console.log(841, 'curSelectFields__showFields==', showFields);

    // 还剩一个问题 selectFields的设置问题：（ fetchEsResults中处理）
    // 当 singleColunmShow为true 且selectFields 为空 或 日志变更时，列表显示字段应该为 iniTableFields默认字段
  };

  onSearchTimeRefresh = (timeSelect, refresh = true) => {
    const timeArr = timeSelect.split(' 至 ');
    let timeEnd = moment();
    let timeStart;
    let interval;
    switch (timeSelect) {
      case '近15分钟':
        timeStart = moment().subtract(15, 'minutes');
        interval = '30s';
        break;
      case '近1小时':
        timeStart = moment().subtract(1, 'hours');
        interval = '1m';
        break;
      case '近24小时':
        timeStart = moment().subtract(1, 'days');
        interval = '30m'; // 和今天一样
        break;
      case '近7天':
        timeStart = moment().subtract(7, 'days');
        interval = '3h'; // 和本周一样
        break;
      case '今天':
        timeStart = moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 });
        interval = '30m';
        break;
      case '本周':
        // 计算今天这周的第几天，周日为一周中的第一天（从0开始）。
        timeStart = moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 }).subtract(
          parseInt(moment().format('d'), 10),
          'days'
        );
        interval = '3h';
        break;
      case '近30天':
        timeStart = moment().subtract(30, 'days');
        interval = '12h';
        break;
      case '近90天':
        timeStart = moment().subtract(90, 'days');
        interval = '1d';
        break;
      default:
        timeStart = moment(timeArr[0]);
        timeEnd = moment(timeArr[1]);
        interval = null;
    }
    this.ontimePiker(timeStart, timeEnd, interval, refresh);
    return interval;
  };

  onSelectTimeChange = (value) => {
    if (value === '自定义') {
      this.setState({ timePickerShow: true });
    } else {
      // const interval = this.onSearchTimeRefresh(value);
      this.onSearchTimeRefresh(value, false);
      this.setState({ timeSelect: value });
    }
  };

  timePickerChange = (moments) => {
    const newendtimes = moment().endOf('day').format(format).split(/[ ]+/)[0];
    const endtimes = moments[1].format('YYYY-MM-DD 23:59:59').split(/[ ]+/)[0];
    if (newendtimes === endtimes) {
      this.setState({
        timeStart: moment(new Date(moments[0].format('YYYY-MM-DD ')).getTime()),
        timeEnd: moment(),
      });
    } else {
      this.setState({
        timeStart: moment(new Date(moments[0].format('YYYY-MM-DD ')).getTime()),
        timeEnd: moment(new Date(moments[1].format('YYYY-MM-DD 23:59:59')).getTime()),
      });
    }
  };

  brushTimePiker = (timeStart, timeEnd, preTimeRange) => {
    this.preTimeRange = preTimeRange;
    this.ontimePiker(timeStart, timeEnd);
  };

  ontimePiker = (timeStart, timeEnd, interval, refresh = true) => {
    const aggs = this.query.body.aggs;
    const bool = this.query.body.query.bool.filter.bool;
    const timestamp = bool.filter.range.timestamp;
    const start = timeStart.valueOf();
    const end = timeEnd.valueOf();
    let currentInterval = interval;
    timestamp.gte = start;
    timestamp.lte = end;
    if (interval) {
      currentInterval = interval;
    } else {
      const timeRange = end - start;
      currentInterval = esAdaptiveSearch.timeRangeToItervalMapping(timeRange);
      this.setState({ timeSelect: `${timeStart.format(format)} 至 ${timeEnd.format(format)}` });
    }
    // 通过查询时间戳的大小来调整聚合粒度
    aggs.count_stats.date_histogram.interval = currentInterval;
    // 根据时间选择范围确定请求的索引
    const { indexSelect, exportPartParams } = this.state;
    this.query.index = indexSelect;
    esSearch.getFinalQuery(indexSelect, this.query);
    this.selectObj = {};
    this.setState(
      {
        timePickerShow: false,
        timeStart,
        timeEnd,
        currentInterval,
        page: 1,
        selectedRowKeys: [],
        exportPartParams: Object.assign(exportPartParams, { ids: [] }),
      },
      () => {
        if (refresh) {
          this.fetchEsResults();
        }
      }
    );
  };

  onSearch = () => {
    const { filterSearchClickale, logFilters, timeSelect } = this.state;
    // 保存该搜索记录
    if (searchDesc) {
      this.props.dispatch({ type: 'search/putSearchLog', payload: { content: searchDesc } });
    }
    if (filterSearchClickale) {
      this.filterDivSearch(logFilters);
    } else {
      const input = document.getElementById('luceneSearch');

      input.value = this.inputValToHex(input.value);
      console.log(705705, 'input.value==', input.value);
      if (input.value) {
        this.query.body.query.bool.filter.bool.must = [
          { query_string: { query: input.value, analyze_wildcard: true } },
        ];
      }
      this.onSearchTimeRefresh(timeSelect);
    }
  };

  //搜索内容 转 十六进制
  inputValToHex = (inputValue) => {
    const hasHexKeyArr = hexKey.filter((hkey) => inputValue.indexOf(hkey) > -1);
    // console.log(717, '开始hasHexKeyArr==', hasHexKeyArr);
    if (hasHexKeyArr.length > 0) {
      const gapReg = /(\s|\))(AND\sNOT|OR|AND)(\s|\()/g;
      const inputArr = inputValue.split(gapReg);
      const iniValArr = [];
      const iniKeyArr = [];
      inputArr.forEach((tmpVal) => {
        const hexTmp = hexKey.filter((tmpKey) => tmpVal.indexOf(tmpKey) > -1);
        if (hexTmp.length) {
          iniKeyArr.push(hexTmp[0]);
          iniValArr.push(tmpVal);
        }
      });

      // console.log('搜索内容inputValue==', inputValue, '数组==', inputArr);
      // console.log('gapReg==', gapReg, inputValue.match(gapReg));
      // console.log('iniKeyArr==', iniKeyArr, 'iniValArr==', iniValArr);

      iniValArr.forEach((iniValTmp) => {
        const itemArr = iniValTmp.split(':');
        let lastVal = itemArr[itemArr.length - 1];
        const isBrackets = lastVal.indexOf(')') >= 0;
        if (isBrackets) {
          lastVal = lastVal.replace(')', '');
        }
        //去除前后空格
        lastVal = configSettings.trimStr(lastVal);
        //转成十六进制
        const hexStr = Buffer.from(lastVal, 'utf8').toString('hex');
        const resLastVal = isBrackets ? `*${hexStr}*)` : `*${hexStr}*`;
        // console.log('itemArr==', itemArr, 'lastVal==', `我${lastVal}们`, 'resLastVal==', resLastVal);
        itemArr[itemArr.length - 1] = resLastVal;
        const newValHex = itemArr.join(':');
        // console.log(731, '最终结果newValHex==', newValHex);
        const resValue = inputValue.replace(iniValTmp, newValHex);
        inputValue = configSettings.trimStr(resValue);
      });
    }
    // console.log(733, '结束inputValue', inputValue);
    return inputValue;
  };

  onNewSearch = () => {
    this.query = _.cloneDeep(this.defaultQuery);
    const timeSelect = options[2]; // 默认时间为 近24小时
    const indexSelect = this.allIndexList.filter((key) => ['alert'].indexOf(key) > -1);
    this.setState({ timeSelect, indexSelect }, () => {
      this.filterBlockQuery([], this.query.body.query.bool.filter, timeSelect);
    });
    this.preTimeRange = [];
  };

  openSave = () => {
    this.setState({ searchSaveVisible: true });
  };

  onSaveSearch = () => {
    const { searchSaveVisible } = this.state; // 防止保存多次提交
    if (!saveSearchClicked && searchSaveVisible) {
      saveSearchClicked = true;
      const {
        indexSelect,
        timeSelect,
        logFilters,
        luceneSearch,
        selectFields,
        pageSize,
      } = this.state;
      const name = document.getElementById('saveName').value;
      if (luceneSearch && searchDesc) {
        // 保存搜索模板时，转十六进制搜索语句同步更改
        const searchDescToHex = this.inputValToHex(searchDesc);
        this.query.body.query.bool.filter.bool.must = [
          { query_string: { query: searchDescToHex, analyze_wildcard: true } },
        ];
        esSearch.getFinalQuery(indexSelect, this.query);
      }
      const params = {
        name,
        log_type: indexSelect.join('|'),
        condition_desc: searchDesc,
        query: JSON.stringify(this.query),
        time_range_desc: timeSelect,
        display_data: JSON.stringify(logFilters),
        flag: luceneSearch ? 'standard' : 'simple',
        Ftb_Fields: JSON.stringify({ selectFields, pageSize }),
      };
      this.props
        .dispatch({
          type: `search/fetchAndSaveSearch`,
          payload: { uri: 'search/putSearchInfo', data: params },
        })
        .then(() => {
          message.success('搜索保存成功');
          this.setState({ searchSaveVisible: false }, () => {
            saveSearchClicked = false;
          });
        })
        .catch(() => {
          saveSearchClicked = false;
          console.log(1100, '搜索保存失败');
        });
    }
  };

  setSearchListVisible = () => {
    const { searchPage } = this.state;
    this.props.dispatch({
      type: `search/fetchAndSaveSearch`,
      payload: { uri: 'search/getSearchList', data: { page: searchPage, limit: searchPageSize } },
    });
    this.setState({ searchListVisible: true });
  };

  onLuceneChange = (e) => {
    const value = e.currentTarget.value;
    searchDesc = value;
    if (!value) {
      this.setState({ filterSearchClickale: true, fieldsMatch: [], searchLogMatch: [] });
    } else {
      const {
        search: { searchLogsArr },
      } = this.props;
      const { searchArr } = this.state;
      const fieldsMatch = [];

      const searchLogMatch = [];
      searchArr.forEach((fKey) => {
        if (fKey.indexOf(value) > -1) {
          fieldsMatch.push(fKey);
        }
      });
      searchLogsArr.forEach((lKey) => {
        if (lKey.indexOf(value) > -1) {
          searchLogMatch.push(lKey);
        }
      });
      this.setState({ filterSearchClickale: false, fieldsMatch, searchLogMatch });
    }
  };

  matchContentSelect = (key) => {
    searchDesc = key;
    this.setState({ fieldsMatch: [], searchLogMatch: [] });
  };

  // 是否显示单列表头、是否显示默认字段（selectFields.length===0时，为true）、选中字段
  getColumns = (singleColunmShow, defaultShow = true, selectFields) => {
    const {
      search: { allAvailableFields },
    } = this.props;
    let newColumns = [...this.firstColumns];
    if (!singleColunmShow) {
      const sourceColumn = defaultShow
        ? this.getSourceColumns()
        : this.getSourceColumns(false, selectFields);
      newColumns = newColumns.concat(sourceColumn);
    } else {
      const fields = defaultShow
        ? this.iniTableFields.filter((key) => allAvailableFields.indexOf(key) > -1)
        : selectFields;
      fields.forEach((key) => {
        newColumns.push({
          title: key,
          dataIndex: key,
          key,
          // width: 150,
          render: (text, record) => {
            const fieldParse = esSearch.sourceFieldParsing(record);
            const val = fieldParse[key];
            let showVal = val || val === 0 || val === false ? val.toString() : '-';
            if (hexKey.indexOf(key) < 0) {
              return <span style={{ fontSize: '12px' }}> {showVal}</span>;
            } else {
              showVal = this.itemHexValToUtf(val);
            }
            // 16进制数据加高度限制
            return (
              <Tooltip placement="leftTop" title={showVal}>
                <div className={styles.tdDiv}>{showVal}</div>
              </Tooltip>
            );
          },
        });
      });
      let bodywidth = document.body.offsetWidth;
      console.log(this.iniTableFields.length);
      newColumns.map((item, index) => {
        if (item.title === '时间') {
          item.width = bodywidth / (this.iniTableFields.length + 1);
        } else if (item.title === 'src_ip') {
          item.width = bodywidth / (this.iniTableFields.length + 4);
        } else if (item.title === 'alert.signature') {
          item.width = bodywidth / (this.iniTableFields.length + 1);
        } else if (item.title === '目的IP') {
          item.width = bodywidth / (this.iniTableFields.length + 4);
        } else if (item.title === '攻击意图') {
          item.width = bodywidth / (this.iniTableFields.length + 4);
        } else {
          item.width = bodywidth / (this.iniTableFields.length + 6);
        }
        return item.width;
      });
    }
    return newColumns;
  };

  getFieldRangesColumns = (key) => [
    {
      title: key,
      dataIndex: 'key',
      key: 'key',
      width: 800,
      render: (text, record) => {
        let showTxt = text;
        if (key === 'timestamp') {
          showTxt = moment(text).format(format);
        }
        if (record.key_as_string) {
          showTxt = record.key_as_string;
        }
        return <div style={{ maxWidth: 1000 }}>{showTxt}</div>;
      },
    },
    {
      title: '日志数',
      dataIndex: 'doc_count',
      key: 'doc_count',
      width: 100,
    },
    {
      title: '占比',
      dataIndex: 'percent',
      key: 'percent',
      width: 200,
      render: (text) => <Progress percent={text} size="small" status="active" width={200} />,
    },
  ];

  handleTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const { page, pageSize: limit } = this.state;
    if (current !== page || pageSize !== limit) {
      this.setState({ page: current, pageSize }, () => {
        this.fetchEsResults();
      });
    } else {
      let key = sorter.columnKey;
      key = key === 'time' ? 'timestamp' : '';
      if (key) {
        const query = this.query;
        const sort = query.sort;
        const order = sorter.order === 'descend' ? 'desc' : 'asc';
        sort.splice(0, 1, `${key}:${order}`);
        this.fetchEsResults();
      }
    }
  };

  // 表头切换
  toggleColumnShow = () => {
    const { defaultShow, singleColunmShow, selectFields } = this.state;
    const curSingle = !singleColunmShow;
    // 如果当前curSingle为true 并且 this.userSelectFiels.length===0,
    // 即从_source切换到单列表头 并且无选中字段： defaultShow为true,重新在默认字段中过滤出当前显示字段
    if (curSingle && this.userSelectFiels.length === 0) {
      this.userSelectFiels = _.cloneDeep(this.iniTableFields);
    }
    const newColumns = this.getColumns(curSingle, defaultShow, selectFields);
    //单列显示 true 且 selectFields 为空（即，将所选字段全部移除时）要重设 selectFields 为 默认表头
    let curSelectFields = [].concat(selectFields);
    if (curSingle && !selectFields.length) {
      curSelectFields = newColumns.slice(1).map((obj) => obj.key);
    }
    //当所选字段长度为0时,defaultShow值为true。显示默认的
    const newDefaultShow = curSelectFields.length === 0;

    this.setState({
      defaultShow: newDefaultShow,
      singleColunmShow: curSingle,
      columns: newColumns,
      selectFields: curSelectFields,
    });
  };

  toggleFullScreen = () => {
    const { fullScreen } = this.state;
    let width = '';
    if (fullScreen) {
      width = '85.3%';
    } else {
      width = '100%';
    }
    this.refs.discover_wrapper.style.width = width;
    this.setState({ fullScreen: !fullScreen });
  };

  onRowSelectChange = (selectedRowKeys, selectedRows) => {
    // console.log('selectedRowKeys changed: ', selectedRowKeys);
    const { exportPartParams, page } = this.state;
    this.selectObj[page] = selectedRows;
    this.setState({
      selectedRowKeys,
      exportPartParams: Object.assign(exportPartParams, { ids: selectedRowKeys }),
    });
  };

  // 表格中选择特定字段进行搜索过滤
  fieldFilter = (key, value, condition) => {
    const { logFilters, luceneSearch } = this.state;
    if (luceneSearch) {
      this.query.body.query.bool.filter.bool.must = [];
    }
    const newLogFilters = _.cloneDeep(logFilters);
    const { fieldType } = this.state;
    const type = fieldType[key];
    const selectedTypeList = esSearch.getSelectedType(type);
    const boolString = this.query.body.query.bool.filter.bool[condition];
    boolString.unshift({ match_phrase: { [key]: { query: value } } });
    const input = document.getElementById('luceneSearch');
    const falterDiv = document.getElementById('search-input-div');
    if (input !== null) {
      if (input.value) {
        this.saveinput = input.value;
      }
    }
    console.log(this.state.inputList);
    newLogFilters.push({
      id: Math.floor(Math.random() * 1000000000000),
      condition,
      patternsField: key,
      selectedtype: selectedTypeList[0],
      selectedTypeList,
      third_cat: 'input',
      value,
    });
    this.filterBlockQuery(newLogFilters, this.query.body.query.bool.filter);
  };

  // 显示某字段所有的聚类结果
  showMore = (key) => {
    this.setState({ currentField: key, fieldAllRangesShow: true });
  };

  // 列表项增加/移除操作
  sidebarItemToggle = (selectFields) => {
    this.userSelectFiels = _.cloneDeep(selectFields);

    // 添加单个显示字段 singleColunmShow为true；删除字段到[]，singleColunmShow为false
    let singleColunmShow = false;
    if (selectFields.length > 0) {
      singleColunmShow = true;
    }
    // const { singleColunmShow, exportPartParams } = this.state;
    const { exportPartParams } = this.state;
    const defaultShow = selectFields.length === 0;
    const newColumns = defaultShow
      ? this.getColumns(singleColunmShow)
      : this.getColumns(singleColunmShow, false, selectFields);
    this.setState({
      singleColunmShow,
      defaultShow,
      selectFields: [].concat(selectFields), // 重要，不要将子组件中的selectFields与父组件指向同一个引用
      columns: newColumns,
      exportPartParams: Object.assign(exportPartParams, {
        show_fields: selectFields.length === 0 ? ['all'] : selectFields,
      }),
    });
  };

  // table中切换列
  tableColumnToggle = (key) => {
    const { selectFields } = this.state;
    if (selectFields.indexOf(key) > -1) {
      const deleteIndex = selectFields.indexOf(key);
      selectFields.splice(deleteIndex, 1);
    } else {
      selectFields.push(key);
      // selectFields.sort();
    }
    this.sidebarItemToggle(selectFields);
  };

  exportPart = (e) => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      e.preventDefault();
      message.info('请选择导出的行');
      return false;
    }
    return true;
  };

  expandedRowRender = (record) => {
    // console.log('1. record==', record);
    const { pcapLoading } = this.props;
    const { expandedRowPcap, searchArr, hexToUtf } = this.state;
    const { _id, _index, _source } = record;

    //http 日志 url 加跳转链接
    // http日志字段删除 ： http.http_port改为 dst_port
    let urlLinkShow = '';
    try {
      if (
        _source.event_type === 'http' &&
        _source.http.hostname &&
        _source.dst_port &&
        _source.http.url
      ) {
        urlLinkShow = 'http://' + _source.http.hostname + ':' + _source.dst_port + _source.http.url;
      }
      if (typeof hexToUtf[_id] !== 'object') {
        hexToUtf[_id] = {};
      }
    } catch (error) {
      urlLinkShow = '';
    }
    // console.log(1074, 'urlLinkShow==', typeof (hexToUtf[_id]));
    // console.log(1079, 'hexToUtf==', hexToUtf)
    //是否显示 HTTP Payload
    let httpPayloadTabShow = false;
    let dialogTabName = '';
    if (_index.indexOf('logstash-http') > -1) {
      const httpData = _source.http;
      if (
        httpData &&
        (httpData.http_request_header ||
          httpData.http_request_body ||
          httpData.http_response_header ||
          httpData.http_response_body)
      ) {
        httpPayloadTabShow = true;
        dialogTabName = 'Http Payload';
      }
    } else if (_source.event_type === 'alert' || _source.event_type === 'dataleak') {
      httpPayloadTabShow = true;
      dialogTabName = '会话还原';
    }

    let pcapShow = false;
    if (expandedRowPcap[_id] && expandedRowPcap[_id].html) {
      pcapShow = true;
      const pcapHtml = expandedRowPcap[_id].html;

      const extractscript = /<script\b[^>]*>([\s\S]*?)<\/script>/gm.exec(pcapHtml);
      // console.log('extractscript', extractscript[0]);
      const script = extractscript[0].substring(32, extractscript[0].length - 11);
      try {
        window.eval(script);
      } catch (error) {
        console.log('pcap window.eval==', error);
      }
    }
    return (
      <Tabs type="card">
        {/* //1. 对于插件告警等不存在会话数据和pcap数据的告警，不展示“会话还原”和“pcap查看” tab页。（alert.gid范围>=100000 <=101000）的原始日志，不展示会话还原”和“pcap查看” tab页。 */}
        {httpPayloadTabShow &&
          !(
            _source.hasOwnProperty('alert') &&
            _source.alert.gid >= 100000 &&
            _source.alert.gid <= 101000
          ) && (
            <TabPane tab={dialogTabName} key="dialog">
              <div key={_id}>
                <div className={styles.pcapWrap}>
                  <DialogTabPage dialogType="Search" record={_source} />
                </div>
              </div>
            </TabPane>
          )}

        <TabPane tab="Table" key="table">
          <ul>
            {esSearch.sourceFieldParseInTable(record).map((item) => {
              const seachable = searchArr.indexOf(item.key) > -1;
              const itemValShow = item.val !== null && item.val !== '' ? item.val.toString() : '-';
              return (
                <li className={styles['expand-li']} key={`${record._id}_${item.key}_${item.val}`}>
                  <span className={styles['expand-li-label']}>{item.key}</span>
                  <span className={styles['expand-li-icon-group']}>
                    <Tooltip placement="bottom" title="按该值过滤">
                      {seachable ? (
                        <ZoomInOutlined
                          className={styles['expand-li-icon']}
                          onClick={() => {
                            this.fieldFilter(item.key, item.val, 'must');
                          }} />
                      ) : (
                        <ZoomInOutlined className={`${styles['expand-li-icon']} ${styles['icon-disable']}`} />
                      )}
                    </Tooltip>
                    <Tooltip placement="bottom" title="按该值排除">
                      {seachable ? (
                        <ZoomOutOutlined
                          className={styles['expand-li-icon']}
                          onClick={() => {
                            this.fieldFilter(item.key, item.val, 'must_not');
                          }} />
                      ) : (
                        <ZoomOutOutlined className={`${styles['expand-li-icon']} ${styles['icon-disable']}`} />
                      )}
                    </Tooltip>
                    <Tooltip placement="bottom" title="在表格中切换列">
                      <ReadOutlined
                        className={styles['expand-li-icon']}
                        onClick={() => {
                          this.tableColumnToggle(item.key);
                        }} />
                    </Tooltip>
                  </span>
                  <span className={styles['expand-li-val']}>
                    {urlLinkShow && item.key === 'http.url' ? (
                      <a href={urlLinkShow} target="_blank">
                        {itemValShow}
                      </a>
                    ) : (
                      <Fragment>
                        {hexKey.indexOf(item.key) < 0 ? (
                          <span>{itemValShow}</span>
                        ) : (
                          <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => this.itemHexValToUtfClick(_id, item.key)}
                          >
                            {hexToUtf[_id][item.key] === 'hex'
                              ? itemValShow
                              : this.itemHexValToUtf(item.val)}
                          </span>
                        )}
                      </Fragment>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </TabPane>
        <TabPane tab="Json" key="json">
          <ReactJson
            name={false}
            src={record}
            displayDataTypes={false}
            enableClipboard={false}
            displayObjectSize={false}
            sortKeys
            theme={{
              base00: 'white',
              base01: '#ddd',
              base02: 'white',
              base03: '#444',
              base04: 'purple',
              base05: 'rgba(0, 0, 0, 0.75)',
              base06: '#444',
              base07: 'rgb(49, 132, 149)',
              base08: '#444',
              base09: 'rgb(3, 106, 7)',
              base0A: 'rgba(0, 0, 0, 0.65)',
              base0B: 'rgba(70, 70, 230, 1)',
              base0C: 'rgb(49, 132, 149)',
              base0D: 'rgba(0, 0, 0, 0.55)',
              base0E: 'rgba(0, 0, 0, 0.55)',
              base0F: 'rgba(70, 70, 230, 1)',
            }}
          />
        </TabPane>
        {(expandedRowPcap[_id] !== undefined && expandedRowPcap[_id].flowReq === 'false') ||
        (_source.hasOwnProperty('alert') &&
          _source.alert.gid &&
          _source.alert.gid >= 100000 &&
          _source.alert.gid <= 101000) ? null : (
          <TabPane tab="Pcap" key="pcap">
            {pcapLoading && !expandedRowPcap[_id] ? (
              <div>
                <Spin />
              </div>
            ) : (
              <div>
                {pcapShow && expandedRowPcap[_id].html ? (
                  <div className={styles.pcapWrap}>
                    <div className={styles.pcapDiv}>
                      <div className={styles.pcapTitle}>
                        <a
                          href={`/api/search/downloadPcapInfo?val=${encodeURIComponent(
                            expandedRowPcap[_id].pcapPath
                          )}`}
                        >
                          PCAP下载
                        </a>
                        <span>PCAP信息</span>
                      </div>
                      <div className={styles.pcapCxt}>
                        <div
                          id={_id}
                          className="pcapSetInnerHTML"
                          dangerouslySetInnerHTML={{ __html: expandedRowPcap[_id].html }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px' }}>暂无pcap信息</div>
                )}
              </div>
            )}
          </TabPane>
        )}
      </Tabs>
    );
  };

  onExpandedRowsChange = (expandedRows) => {
    const { expandedRowKeys, expandedRowPcap } = this.state;
    let newExpandedRowPcap = expandedRowPcap;
    const curKeys = Object.keys(expandedRowPcap);
    // console.log('============================');
    // console.log(5, 'pcap数据对象curKeys==', curKeys);
    // console.log(5, '之前展开状态expandedRowKeys==', expandedRowKeys);
    // console.log(5, '当前展开状态expandedRows==', expandedRows);
    if (expandedRows.length > expandedRowKeys.length) {
      let newPcapObj = {};
      let pcapKey = '';
      for (let i = 0; i < expandedRows.length; i += 1) {
        if (curKeys.indexOf(expandedRows[i]) < 0) {
          pcapKey = expandedRows[i];
        }
      }
      // console.log(6, '新增的pcap键名pcapKey==', pcapKey);
      const {
        search: {
          esDetail: { hits },
        },
        dispatch,
      } = this.props;
      if (pcapKey) {
        const newPcap = hits.filter((obj) => obj._id === pcapKey);
        const { _source, _index } = newPcap[0];
        const { timestamp } = _source;
        // const startTime = moment(timestamp).valueOf();
        const startTime = moment(moment(timestamp).subtract(60, 'seconds')).valueOf();
        const endTime = moment(moment(timestamp).add(1, 'days')).valueOf();
        // console.log(999333445, '_source.flow_id==', _source.flow_id);
        // console.log(12345, '***********当前点击数据_source', _source, 'timestamp==', timestamp);

        if (
          _source.flow_id ||
          _source.event_type === 'alert' ||
          _source.event_type === 'dataleak'
        ) {
          if (
            _source.event_type === 'flow' &&
            _source.flow &&
            _source.flow.store_pkts &&
            _source.flow.store_pkts <= 0
          ) {
            newPcapObj = { [pcapKey]: { html: '', pcapPath: '', flowReq: 'false' } };
            newExpandedRowPcap = Object.assign({}, expandedRowPcap, newPcapObj);
            this.setState({ expandedRowPcap: newExpandedRowPcap });
          } else {
            let payQuery = { flowID: _source.flow_id, startTime, endTime };
            if (_source.event_type === 'alert' || _source.event_type === 'dataleak') {
              payQuery = { id: pcapKey, esIndex: _index, startTime, endTime };
            }

            dispatch({
              type: 'search/fetchPcapInfo',
              payload: payQuery,
            })
              .then((json) => {
                const {
                  search: { pcapInfo },
                } = this.props;
                // console.log(11, "pcapInfo==", pcapInfo);
                newPcapObj = { [pcapKey]: { ...pcapInfo } };
                newExpandedRowPcap = Object.assign({}, expandedRowPcap, newPcapObj);
                this.setState({ expandedRowPcap: newExpandedRowPcap });
              })
              .catch((error) => {
                console.log('pcap error==', error);
                newPcapObj = { [pcapKey]: {} };
                newExpandedRowPcap = Object.assign({}, expandedRowPcap, newPcapObj);
                this.setState({ expandedRowPcap: newExpandedRowPcap });
              });
          }
        } else {
          newPcapObj = { [pcapKey]: { flowReq: 'false' } };
          newExpandedRowPcap = Object.assign({}, expandedRowPcap, newPcapObj);
          this.setState({ expandedRowPcap: newExpandedRowPcap });
        }
      }
      // console.log(13, '新设置pcap对象信息newExpandedRowPcap==', newExpandedRowPcap);
    }
    this.setState({ expandedRowKeys: expandedRows });
  };

  itemHexValToUtf = (hexStr) => {
    let result = '-';
    try {
      const isEven = hexStr.length % 2 === 0;
      const hexVal = isEven ? hexStr : hexStr.substring(0, hexStr.length - 1);
      if (hexVal) {
        const utfStr = Buffer.from(hexVal, 'hex').toString('utf8');
        result = utfStr;
      }
    } catch (error) {
      console.log(1625, 'hexStr==', hexStr, 'error==', error);
    }
    return result;
  };

  itemHexValToUtfClick = (id, key) => {
    const { hexToUtf } = this.state;
    const curCode = hexToUtf[id][key] === 'hex' ? 'utf8' : 'hex';
    hexToUtf[id][key] = curCode;
    this.setState({ hexToUtf });
  };

  surveyClick = (key) => {
    console.log('key', key);
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      message.info('请选择要添加进调查的日志');
      return false;
    }
    let surveyList = [];
    Object.keys(this.selectObj).forEach((page) => {
      surveyList = surveyList.concat(this.selectObj[page]);
    });
    surveyList = surveyList.map((item) => ({ id: item._id, index: item._index, ...item._source }));
    this.setState({ surveyList, surveyOperate: key.key, surveyVisible: true });
  };

  hideSurveyModal = () => {
    this.setState({ surveyVisible: false });
  };

  getExportMenu = () => {
    // const { exportPartParams, selectFields } = this.state;
    // const { index, body, sort } = this.query;

    // 导出接口改 web 写 效果测试
    const {
      search: { allAvailableFields },
    } = this.props;
    const { exportPartParams, selectFields, selectedRowKeys } = this.state;
    const { index, body, sort } = this.query;
    const partReq = {
      cmd: 'export_es_search',
      type: 1,
      show_fields: selectFields.length === 0 ? allAvailableFields : selectFields,
      ids: selectedRowKeys,
      query: { index, body: { query: body.query }, sort },
    };
    const allReq = { ...partReq, type: 0 };
    // console.log('WEB测试部分导出partReq==', partReq);
    // console.log('WEB测试全部导出allReq==', allReq);
    return (
      <Menu>
        <Menu.Item key="add2">
          <a
            href={`/api/es/esHitsExport?params=${encodeURIComponent(JSON.stringify(partReq))}`}
            onClick={this.exportPart}
          >
            导出
          </a>
        </Menu.Item>
        <Menu.Item key="update2">
          <a href={`/api/es/esHitsExport?params=${encodeURIComponent(JSON.stringify(allReq))}`}>
            全部导出
          </a>
        </Menu.Item>
      </Menu>
    );
  };

  componentWillUnmount = () => {
    // 关闭定时器
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  };

  // 自动刷新设置
  autoSelectChange = (value) => {
    // 选择 auto 、off的时候关闭定时器；选择时间 开启定时器
    if (value !== 'auto' && value !== 'off') {
      const seconds = Number(value);
      const mseconds = seconds * 1000;
      // console.log('seconds=', seconds, 'mseconds==', mseconds);
      this.setState({ autoSelect: value, isAuto: true });
      if (this.autoTimer) {
        clearInterval(this.autoTimer);
        this.autoTimer = null;
      }
      // 开启定时器
      // const { timeSelect } = this.state;
      this.autoTimer = setInterval(() => {
        // this.onSearchTimeRefresh(timeSelect);
        this.onSearch();
      }, mseconds);
    } else {
      this.setState({ autoSelect: value, isAuto: false });
      // 关闭定时器
      if (this.autoTimer) {
        clearInterval(this.autoTimer);
        this.autoTimer = null;
      }
    }
  };

  // 定时器暂停
  isAutoSetFalse = () => {
    this.setState({ isAuto: false });
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  };

  // 定时器开启
  isAutoSetTrue = () => {
    this.setState({ isAuto: true });
    const { autoSelect } = this.state;
    const seconds = Number(autoSelect);
    const mseconds = seconds * 1000;
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    this.autoTimer = setInterval(() => {
      // this.onSearchTimeRefresh(timeSelect);
      this.onSearch();
    }, mseconds);
  };
  logStorageFocusChange = async () => {
    const { logStorageFocus } = this.state;
    // 要打开卡片得话，先更新存储日志
    if (!logStorageFocus) {
      const { dispatch } = this.props;
      await dispatch({ type: 'search/fetchDenyAll', payload: {} });
    }
    this.setState({
      logStorageFocus: !logStorageFocus,
    });
  };
  // 伸缩
  handleResize = (index) => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { columns: nextColumns };
    });
  };

  render() {
    const {
      search: {
        esDetail: { hits, aggs, took, total },
        allAvailableFields,
        esFieldRanges,
        indexSort,
        indexArr,
        saveSearchList: { list, recordsTotal },
        storageLogModel,
        trafficLogStorageSelect,
      },
      tableLoading,
      histogramLoading,
      denyAllLoading,
    } = this.props;
    const {
      indexSelect,
      luceneSearch,
      filterSearchClickale,
      filterSearchVisible,
      timeSelect,
      intervalFormatMapping,
      currentInterval,
      timePickerShow,
      timeStart,
      timeEnd,
      selectFields,
      selectedRowKeys,
      page,
      pageSize,
      searchPage,
      fullScreen,
      currentField,
      fieldAllRangesShow,
      logFilters,
      searchSaveVisible,
      searchListVisible,
      fieldsMatch,
      searchLogMatch,
      // surveyList,
      // surveyOperate,
      // surveyVisible,
      searchArr,
      fieldType,
      expandedRowKeys,
      isAuto,
      autoSelect,
      logStorageFocus,
      // columns
    } = this.state; // 字段匹配数据 // 搜索记录匹配
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
    };
    const newTotal = esSearch.fetchPaginationTotal(pageSize, total);
    // this.searchTermsShow();
    this.newSearchTermsShow();
    // 伸缩

    let { columns } = this.state;
    columns = columns.map((col, index) => ({
      ...col,
      onHeaderCell: (column) => ({
        width: column.width || 150,
        onResize: this.handleResize(index),
      }),
    }));

    columns.push({
      title: '',
      key: '',
      dataIndex: '',
    });

    return (
      <div className={`${styles.searchWrapper} container`}>
        {isAuto && (
          <div className={styles.autoProgress}>
            <Progress
              percent={100}
              strokeWidth={6}
              strokeColor="#383648"
              strokeLinecap="square"
              status="active"
              showInfo={false}
            />
          </div>
        )}
        {searchListVisible && (
          <div
            className={styles.maskLayer}
            onClick={() => {
              this.setState({ searchListVisible: false, searchPage: 1 });
            }}
          />
        )}
        {(fieldsMatch.length > 0 || searchLogMatch.length > 0) && (
          <div
            className={styles.maskLayer}
            onClick={() => {
              this.setState({ fieldsMatch: [], searchLogMatch: [] });
            }}
          />
        )}
        {!fieldAllRangesShow ? (
          <div style={{ backgroundColor: 'rgb(236,239,245)' }}>
            <div className={styles['search-block']}>
              <GeneralPageHeader title="检索">
                <div className={styles['search-header']}>
                  <MultiSortSelect
                    sortOptions={indexSort}
                    allIndex={indexArr}
                    selectChange={this.onIndexChange}
                    indexSelect={indexSelect}
                  />
                  <div className={styles['search-input']}>
                    {luceneSearch ? (
                      <Input
                        id="luceneSearch"
                        placeholder='搜索...(例如 "status"="200" AND "extension"="PHP")'
                        onChange={this.onLuceneChange}
                        onPressEnter={this.onSearch}
                        value={searchDesc}
                        onFocus={() => {
                          this.setState({ searchListVisible: false });
                        }}
                        autoComplete="off"
                      />
                    ) : (
                      <div className={styles['search-input-div']} ref="searchTerms" />
                    )}
                    {searchListVisible && (
                      <div className={styles['search-list']}>
                        <Table
                          rowKey="Fid"
                          pagination={{
                            current: searchPage,
                            total: recordsTotal,
                            pageSize: searchPageSize,
                            onChange: this.pageOnChange,
                            showTotal: (total, range) => `（${total}项）`,
                          }}
                          columns={this.searchListColumns}
                          dataSource={list}
                          size="small"
                          onRow={
                            (record) => ({
                              onClick: () => {
                                this.openSpecificSearch(record);
                              },
                            }) // 点击行
                          }
                        />
                      </div>
                    )}

                    <QuickMatch
                      fieldsMatch={fieldsMatch}
                      searchLogMatch={searchLogMatch}
                      matchContentSelect={this.matchContentSelect}
                    />
                  </div>

                  <Select
                    className={styles['search-time-select']}
                    value={timeSelect}
                    size="small"
                    onChange={this.onSelectTimeChange}
                  >
                    {options.map((key) => (
                      <Option key={key} value={key}>
                        {key}
                      </Option>
                    ))}
                  </Select>
                  <Button
                    className={`commonWhiteBtn ${styles['search-btn']}`}
                    style={{ height: '32px' }}
                    onClick={this.onSearch}
                  >
                    筛选
                  </Button>
                  {filterSearchClickale ? (
                    <PlusOutlined
                      style={{ cursor: 'pointer', marginLeft: '8px' }}
                      className={styles['search-toggle']}
                      onClick={() => {
                        this.setState({ filterSearchVisible: true });
                      }} />
                  ) : (
                    <PlusOutlined style={{ color: 'grey' }} className={styles['search-toggle']} />
                  )}
                  <div className={styles.iconsDivWrap}>
                    <a onClick={this.onNewSearch}>新搜索</a>
                    <Divider type="vertical" />
                    <Button
                      type="link"
                      onClick={() => {
                        if (this.readOnly) return;
                        this.setState({ searchSaveVisible: true });
                        if (document.getElementById('saveName')) {
                          document.getElementById('saveName').value = '';
                        }
                      }}
                      disabled={this.esAz === 'all'}
                      style={
                        this.readOnly
                          ? { color: 'rgba(0, 0, 0, 0.25)', padding: 0 }
                          : { padding: 0 }
                      }
                    >
                      保存搜索模板
                    </Button>

                    <Divider type="vertical" />
                    <Button
                      type="link"
                      onClick={this.setSearchListVisible}
                      disabled={this.esAz === 'all'}
                      style={{ padding: 0 }}
                    >
                      打开搜索模板
                    </Button>
                  </div>

                  <LogStorageSelect
                    sortOptions={storageLogModel}
                    selectChange={this.onTrafficLogStorageSelection}
                    consoleWindows={this.logStorageFocusChange}
                    indexSelect={trafficLogStorageSelect}
                    focus={logStorageFocus}
                  />
                  <div className={styles.storagePolicylabel}>
                    <Button
                      type="link"
                      onClick={this.logStorageFocusChange}
                      disabled={this.esAz === 'all'}
                      style={{ paddingRight: 5 }}
                    >
                      日志存储黑名单配置
                    </Button>
                    <Tooltip
                      title="当系统性能不足或存储空间有限时，可禁止部分日志存储提高性能或存储周期"
                      placement="rightTop"
                    >
                      {denyAllLoading ? (
                        <SyncOutlined spin />
                      ) : (
                        <QuestionCircleFilled className="fontBlue" />
                      )}
                    </Tooltip>
                  </div>
                </div>
              </GeneralPageHeader>

              {timePickerShow && (
                <div className={styles['timeRange-picker']}>
                  <RangePicker
                    disabledDate={(current) => current > moment().endOf('day')}
                    popupClassName={styles['timeRange-picker']}
                    allowClear={false}
                    defaultValue={[timeStart, timeEnd]}
                    value={[timeStart, timeEnd]}
                    showTime={{
                      defaultValue: [
                        moment('00:00:00', 'HH:mm:ss'),
                        moment('23:59:59', 'HH:mm:ss'),
                      ],
                    }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={this.timePickerChange}
                    onOk={() => {
                      this.ontimePiker(timeStart, timeEnd, null, false);
                    }}
                    onOpenChange={(status) => {
                      if (!status) {
                        this.ontimePiker(timeStart, timeEnd, null, false);
                      }
                    }}
                    open
                  />
                </div>
              )}
            </div>
            <HistogramBrush
              chartLoading={histogramLoading}
              bodyStyle={{ margin: '12px' }}
              chartData={aggs}
              recordsTotal={total}
              took={took}
              intervalFormatMapping={intervalFormatMapping}
              visible={!fullScreen}
              startTime={timeStart}
              endTime={timeEnd}
              interval={currentInterval}
              preTimeRange={this.preTimeRange}
              ontimePiker={this.brushTimePiker}
              onNewSearch={this.onNewSearch}
            />
            <div
              className={
                !fullScreen
                  ? styles['container-fluid']
                  : `${styles['container-fluid']} ${styles['container-fluid-full']}`
              }
            >
              <SidebarList
                style={{ height: '500px' }}
                visible={!fullScreen}
                allAvailableFields={allAvailableFields}
                esFieldRanges={esFieldRanges}
                sidebarItemToggle={this.sidebarItemToggle}
                showMore={this.showMore}
                selectFields={selectFields}
                searchArr={searchArr}
                fieldFilter={this.fieldFilter}
              />
              <div className={styles['discover-wrapper']} ref="discover_wrapper">
                <div className={styles['discover-btnGroup']}>
                  <Dropdown overlay={this.getExportMenu()} disabled={total === 0}>
                    <a className="dropBlueBtn">
                      导出
                      <DownOutlined />
                    </a>
                  </Dropdown>
                  <Button className={styles.toggleBtn} onClick={this.toggleColumnShow}>
                    表头切换
                  </Button>

                  {!fullScreen ? (
                    <Button className={styles.toggleBtn} onClick={this.toggleFullScreen}>
                      全屏切换
                    </Button>
                  ) : (
                    <Button className={styles.toggleBtn} onClick={this.toggleFullScreen}>
                      全屏切换
                    </Button>
                  )}
                  {timeSelect.indexOf('至') < 0 && (
                    <div
                      className={styles.autoDivWrap}
                      style={{ float: 'right', marginRight: '10px', marginLeft: '10px' }}
                    >
                      {autoSelect !== 'auto' && autoSelect !== 'off' && (
                        <div
                          className={styles.iconsDivWrap}
                          style={{ fontSize: 20, color: '#3369d9' }}
                        >
                          {isAuto ? (
                            <PauseOutlined style={{ cursor: 'pointer' }} onClick={this.isAutoSetFalse} />
                          ) : (
                            <CaretRightOutlined style={{ cursor: 'pointer' }} onClick={this.isAutoSetTrue} />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {timeSelect.indexOf('至') < 0 && (
                    <div className="right">
                      <Select
                        value={autoSelect}
                        size="small"
                        style={{ width: '90px' }}
                        onChange={this.autoSelectChange}
                      >
                        {autoLists.map((aObj) => (
                          <Option key={aObj.value} value={aObj.value}>
                            {aObj.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>
                <div className={styles['discover-table']}>
                  <Table
                    className="tabStyle"
                    rowKey="_id"
                    // 伸缩
                    bordered={false}
                    components={this.components}
                    loading={tableLoading}
                    pagination={{
                      size: 'small',
                      current: page,
                      total: newTotal,
                      pageSize,
                      showTotal: (total, range) => `（${total}项）`,
                      pageSizeOptions: ['20', '50', '100', '200'],
                      showSizeChanger: true,
                      showQuickJumper: true,
                    }}
                    columns={columns}
                    scroll={{ x: columns.length * 60 }}
                    dataSource={hits}
                    size="middle"
                    onChange={this.handleTableChange}
                    rowSelection={rowSelection}
                    expandRowByClick
                    expandedRowRender={this.expandedRowRender}
                    expandedRowKeys={expandedRowKeys}
                    onExpandedRowsChange={this.onExpandedRowsChange}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <FieldAllRanges
            field={currentField}
            logIndex={indexSelect.join(',')}
            searchState={searchDesc}
            timeStart={timeStart}
            timeEnd={timeEnd}
            columns={this.getFieldRangesColumns(currentField)}
            back={() => {
              this.setState({ fieldAllRangesShow: false }, () => {
                if (!luceneSearch) {
                  this.newSearchTermsShow();
                }
              });
            }}
          />
        )}
        <EditFilterSearch
          visible={filterSearchVisible}
          logFilters={logFilters}
          query={this.query}
          filterBlockQuery={this.filterBlockQuery}
          onCancel={this.editFilterCancel}
          searchArr={searchArr}
          fieldType={fieldType}
        />
        <Modal
          title="保存搜索"
          visible={searchSaveVisible}
          onOk={this.onSaveSearch}
          onCancel={() => {
            this.setState({ searchSaveVisible: false });
          }}
        >
          <div>
            <Row className={styles.searchSaveRow}>
              <Col className={styles.searchSaveLabel} span={4}>
                名称：
              </Col>
              <Col span={12}>
                <Input style={{ height: '30px' }} id="saveName" maxLength={32} />
              </Col>
            </Row>
            <Row className={styles.searchSaveRow}>
              <Col className={styles.searchSaveLabel} span={4}>
                日志类型：
              </Col>
              <Col span={20}>
                <span>{indexSelect.length > 1 ? '多个' : indexSelect[0]}</span>
              </Col>
            </Row>
            <Row className={styles.searchSaveRow}>
              <Col className={styles.searchSaveLabel} span={4}>
                搜索语句：
              </Col>
              <Col span={20}>{searchDesc}</Col>
            </Row>
            <Row className={styles.searchSaveRow}>
              <Col className={styles.searchSaveLabel} span={4}>
                时间：
              </Col>
              <Col span={20}>{timeSelect}</Col>
            </Row>
            <Row className={styles.searchSaveRow}>
              <Col className={styles.searchSaveLabel} span={4}>
                展示字段：
              </Col>
              <Col span={20}>{selectFields.length ? selectFields.join(', ') : '_source'}</Col>
            </Row>
            <Row className={styles.searchSaveRow}>
              <Col className={styles.searchSaveLabel} span={4}>
                页大小：
              </Col>
              <Col span={20}>{pageSize}</Col>
            </Row>
          </div>
        </Modal>

        {/* {surveyVisible && (
          <AddSurvey
            visible={surveyVisible}
            list={surveyList}
            operate={surveyOperate}
            type={3}
            isPage={false}
            back={this.hideSurveyModal}
          />
        )} */}
      </div>
    );
  }
}

export default connect(({ search, global, loading }) => ({
  search,
  ccsData: global.ccsData,
  histogramLoading: loading.effects['search/fetchHistogramResults'],
  tableLoading: loading.effects['search/fetchEsResults'],
  pcapLoading: loading.effects['search/fetchPcapInfo'],
  denyAllLoading: loading.effects['search/fetchDenyAll'],
}))(Search);
