/* eslint-disable react/button-has-type */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/no-unused-state */
import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import authority from '@/utils/authority';
const { getAuth } = authority;
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Divider, message, Modal, Progress, Spin, Button, Popover } from 'antd';
import CommonPage from '@/components/CommonPage';
import styles from './AdvancedAnalysis.less';

import FilterBlock from '@/components/FilterBlock/Filter';
import AdvancedAnalysisAssetsModal from './components/AdvancedAnalysisAssetsModal';
import SceneDetailsModal from './components/SceneDetailsModal';
import NoAssets from './components/NoAssets';

import configSettings from '@/configSettings';

const { confirm } = Modal;
const { assetValueMap } = configSettings;
/** 资产类别 */
const { FcategoryTypes, AI_Falert_mode_Types } = assetValueMap;

/** 总字段列表 */
const assetFields = [
  { key: 'Fgroup', title: '分组', checkedFlag: 'Fgid' },
  { key: 'Fcategory', title: '资产类型' },
  { key: 'Falert_mode', title: '测算类型' },
];
@connect(({ global, advancedAnalysis, loading }) => ({
  hasVpc: global.hasVpc,
  isKVM: global.isKVM,
  advancedAnalysis,
  tableLoading: loading.effects['advancedAnalysis/fetchAdvancedAssetAnalysisTable'],
}))
class AdvancedAnalysis extends Component {
  constructor(props) {
    super(props);
    this.auth = getAuth('/tactics/advancedAnalysis');
    this.state = {
      /** 高级分析资产对话框显示状态 */
      addAdvancedAnalysisAssetsModalVisiable: false,
      AdvancedAnalysisAssetsTitle: '添加高级分析资产',
      query: {
        search: '',
        dir: '',
        sort: '',
        page: 1,
        pageSize: 10,
        filterObj: this.getFilterObj(assetFields),
        mustObj: this.getMustStatus(assetFields),
      },
      /** 是否有任意一条高级分析资产数据存在于数据库中 */
      isExitAssetsAnalysisDataFromDB: false,
      /** 当前选中的所有行的keys */
      selectedRowKeys: [],
      /** 当前选中的所有行数据（打开资产分析组件的时候会根据selectedRowKeys来计算，不想维护太多字段） */
      selectedRows: [],
      /** 资产分析组件的模式 add edit 俩种模式 */
      AssetsAnalysisMode: 'add',
      /** 表格columns */
      columns: [
        {
          title: '资产名称/资产ip',
          dataIndex: 'Fasset_name',
          render: (text, record) => (
            <Fragment>
              <p>{record.Fasset_name}</p>
              <span style={{ fontSize: 12, opacity: 0.6 }}>{record.Fip}</span>
            </Fragment>
          ),
          width: '10%',
        },
        {
          title: '资产组',
          dataIndex: 'Fgroup_name',
          filters: [],
          width: '10%',
        },
        {
          title: '资产类型',
          dataIndex: 'Fcategory_name',
          filters: FcategoryTypes,
          width: '10%',
          render: (text) => {
            return <span>{text}</span>;
          },
        },
        {
          title: '当前测算状态',
          dataIndex: 'GROUP_CONCAT(t_ai_ip_scene_config.Fstatus)',
          width: 470,
          filters: AI_Falert_mode_Types,
          render: (text, record) => {
            const {
              'GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)': groupConcatFsceneName,
              'GROUP_CONCAT(t_ai_ip_scene_config.Fstatus)': groupConcatFstatus,
              'GROUP_CONCAT(t_ai_ip_scene_config.Fthreshold/300)': groupConcatFthreshold,
              'GROUP_CONCAT(t_ai_ip_scene_config.Fstatus_reason)': groupConcatFstatusReason,
              'GROUP_CONCAT(t_ai_ip_scene_config.Fstart_time)': groupConcatFstartTime,
              'GROUP_CONCAT(t_ai_ip_scene_config.Fend_time)': groupConcatFendTime,
              Falert_mode: alertMode, // threshold自定义测算，ai_baseline ai测算
            } = record;
            const sceneNameArr = groupConcatFsceneName.split(','); // 场景值数组
            const statusArr = groupConcatFstatus.split(','); // 状态值数组
            const thresholdArr = groupConcatFthreshold.split(','); // 阈值数组
            const statusReasonArr = groupConcatFstatusReason
              ? groupConcatFstatusReason.split(',')
              : []; // 状态描述
            const startTimeArr = groupConcatFstartTime.split(','); // 开始时间
            const endTimeArr = groupConcatFendTime.split(','); // 结束时间
            const appProtoArr = ['http', 'icmp', 'dns', 'ssh', 'rdp']; // 每个场景值开头的协议

            // console.log("sceneNameArr===", sceneNameArr)
            // console.log("statusArr===", statusArr)
            return (
              <div className="measuringStateBox">
                <div className="measuringStateLeft">
                  {record.Falert_mode === 'threshold' && (
                    <p>
                      <span className="custom" />
                      <span>阈值测算</span>
                    </p>
                  )}
                  {record.Falert_mode === 'ai_baseline' && (
                    <p>
                      <span className="ai" />
                      <span>AI测算</span>
                    </p>
                  )}
                  {record.Falert_mode === 'observe' && (
                    <p>
                      <span className="observe" />
                      <span>观察模式</span>
                    </p>
                  )}
                  <p className="textA">
                    已开启{' '}
                    <span style={{ color: '#219C77' }}>
                      {sceneNameArr.includes('observation') ? 0 : sceneNameArr.length}
                    </span>{' '}
                    项
                  </p>
                </div>

                <div className="measuringStateRight">
                  {appProtoArr.map((item, index) => {
                    // 找到对应的场景值索引
                    const idx = sceneNameArr.findIndex((sceneName) => {
                      return sceneName.includes(item);
                    });
                    // 如果没找到代表没有开启该场景
                    if (idx === -1)
                      return (
                        <i
                          className={`item ${item}Grey`}
                          key={index}
                          onClick={() => {
                            message.warn('没有开启该场景!');
                          }}
                        />
                      );
                    // 2.拿到状态值
                    const curStatus = statusArr[idx];
                    let color = '';
                    switch (curStatus) {
                      case '1':
                      case '2':
                      case '3':
                        color = 'Green';
                        break;
                      case '0':
                        color = 'Blue';
                        break;
                      case '100':
                        color = 'Blue';
                        break;
                      default:
                        color = 'Red';
                        break;
                    }
                    return (
                      <Popover
                        key={index}
                        placement="bottom"
                        trigger="click"
                        className="parent"
                        content={
                          sceneNameArr[idx] &&
                          record.Fip &&
                          statusArr[idx] && (
                            <div className="cardDetails">
                              <SceneDetailsModal
                                alertMode={alertMode}
                                sceneName={sceneNameArr[idx]}
                                status={statusArr[idx]}
                                threshold={Number(thresholdArr[idx])}
                                statusReason={statusReasonArr[idx] || ''}
                                Fip={record.Fip}
                                startTime={startTimeArr[idx]}
                                endTime={endTimeArr[idx]}
                              />
                            </div>
                          )
                        }
                      >
                        <Button type="primary" className="analysis-state-icon-item">
                          <span className={`${item}${color}`} />
                        </Button>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            );
          },
        },
        {
          title: '插入时间',
          dataIndex:
            'GROUP_CONCAT(t_ai_ip_scene_config.Finsert_time ORDER BY t_ai_ip_scene_config.Finsert_time desc)',
          width: '15%',
          sorter: true,
          render: (text) => {
            const insertTimeArr = text.split(','); // 插入时间数组
            return <span>{insertTimeArr[0]}</span>;
          },
        },
        {
          title: '更新时间',
          dataIndex:
            'GROUP_CONCAT(t_ai_ip_scene_config.Fupdate_time ORDER BY t_ai_ip_scene_config.Fupdate_time desc)',
          width: '15%',
          sorter: true,
          render: (text) => {
            const insertTimeArr = text.split(','); // 插入时间数组
            return <span>{insertTimeArr[0]}</span>;
          },
        },
        {
          title: '操作',
          dataIndex: '',
          key: 'action',
          width: '30%',
          render: (text, record) => {
            return this.auth === 'rw' ? (
              <div style={{ minWidth: '215px' }}>
                <a
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    this.editRow(record);
                  }}
                >
                  编辑测算模式
                </a>
                <span>
                  <Divider type="vertical" style={{ height: 14, margin: '0 12px' }} />
                  <a
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      this.delRow(record);
                    }}
                  >
                    删除
                  </a>
                </span>
              </div>
            ) : null;
          },
        },
      ],
    };

    this.btnList = [];
    if (this.auth === 'rw') {
      this.btnList = this.btnList.concat([
        {
          label: '添加资产',
          type: 'primary',
          color: 'blue',
          func: () => {
            this.handleAssetsAnalysisModeVisiable();
          },
        },
        {
          label: '编辑测算模式',
          type: 'primary',
          func: () => {
            this.handleAssetsAnalysisModeVisiable('edit');
          },
        },
        {
          label: '删除',
          type: 'primary',
          func: () => {
            this.delRow();
          },
        },
      ]);
    }
  }

  async componentDidMount() {
    this.fetchAssetGroup();
    await this.fetchAdvancedAssetAnalysisTable();
    // 第一次渲染该组件请求高级资产分析表数据得时候，记录一下状态db里面到底有没有任意一条数据，
    const {
      advancedAnalysis: { assetAnalysisTable },
    } = this.props;
    if (assetAnalysisTable.total > 0) {
      this.setState({
        isExitAssetsAnalysisDataFromDB: true,
      });
    }
  }

  /** 获取过滤对象 */
  getFilterObj = (list) => {
    const obj = {};
    list.forEach((item) => {
      obj[item.key] = [];
    });
    return obj;
  };

  /** 过滤对象是否需要筛选 */
  getMustStatus = (list) => {
    const obj = {};
    list.forEach((item) => {
      obj[item.key] = true;
    });

    return obj;
  };

  /** 获取高级资产分析表 */
  fetchAdvancedAssetAnalysisTable = async () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    await dispatch({
      type: 'advancedAnalysis/fetchAdvancedAssetAnalysisTable',
      payload: { ...query },
    });
    this.setState({
      selectedRowKeys: [],
      AssetsAnalysisMode: 'add',
    });
  };

  /** 获取资产组 */
  fetchAssetGroup = async () => {
    const { dispatch } = this.props;
    const { columns } = this.state;
    // 获取资产组
    const assetGroup = await dispatch({
      type: 'advancedAnalysis/fetchGroup',
      payload: { sort: 'Finsert_time', dir: 'desc' },
    });
    const assetGroupFilters = [];
    if (assetGroup.length > 0) {
      assetGroup.forEach((item) => {
        assetGroupFilters.push({
          text: item.Fgroup_name,
          value: item.Fgid,
        });
      });
      columns[1].filters = assetGroupFilters;
      this.setState({
        columns,
      });
    }
  };

  /**
   * 打开高级资产分析组件对话框
   * @param {string} mode 打开对话框的模式
   */
  handleAssetsAnalysisModeVisiable = (mode = 'add') => {
    const {
      advancedAnalysis: {
        assetAnalysisTable: { total },
      },
    } = this.props;

    let selectedRows = [];
    let AdvancedAnalysisAssetsTitle = '添加高级分析资产';
    if (mode === 'edit') {
      const { selectedRowKeys } = this.state;
      const {
        advancedAnalysis: { assetAnalysisTable },
      } = this.props;
      selectedRows = assetAnalysisTable.list.filter((item) => {
        return selectedRowKeys.includes(item.Fip);
      });
      AdvancedAnalysisAssetsTitle = '编辑测算模式';
    }
    if (mode === 'add' && total >= 100) {
      message.warn('资产的最大添加数量为100');
      return;
    }
    this.setState(
      {
        AssetsAnalysisMode: mode,
        selectedRows,
        AdvancedAnalysisAssetsTitle,
      },
      () => {
        this.setState({
          addAdvancedAnalysisAssetsModalVisiable: true,
        });
      }
    );
  };

  editRow = (record) => {
    const { Fip } = record;
    this.setState(
      {
        selectedRowKeys: [Fip],
      },
      () => {
        this.handleAssetsAnalysisModeVisiable('edit');
      }
    );
  };

  delRow = (record) => {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    const that = this;
    confirm({
      title: '确定要进行删除操作吗?',
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        // 删除单个
        if (record) {
          const { Fip } = record;
          if (!selectedRowKeys.includes(Fip)) selectedRowKeys.push(Fip);
        }
        await dispatch({
          type: 'advancedAnalysis/delAssetAnalysisSheet',
          payload: { Fips: selectedRowKeys },
        });
        that.fetchAdvancedAssetAnalysisTable();
      },
      width: '450px',
    });
  };

  /** 关闭高级资产分析组件对话框 */
  onCancelAddAdvancedAnalysisAssetsModalVisiable = (isRefresh) => {
    this.setState(
      {
        addAdvancedAnalysisAssetsModalVisiable: false,
      },
      () => {
        if (isRefresh) {
          this.fetchAssetGroup();
          this.fetchAdvancedAssetAnalysisTable();
        }
      }
    );
  };

  titleRender = () => {
    const {
      advancedAnalysis: {
        assetAnalysisTable: { total },
      },
    } = this.props;
    const { query } = this.state;
    const filterList = [
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: '搜索资产名称/IP',
        pressEnter: true,
      },
    ];
    const percent = Number(parseFloat((total / 100) * 100).toFixed(2));
    return (
      <div className="header">
        <div className="titleRender">
          <h1 className="title">高级分析资产</h1>
          <div className="contentBox">
            <Progress width={40} className="itemA" type="circle" percent={percent} />
            <p className="itemB">
              已添加资产 <span className={percent >= 80 ? 'red' : ''}>{total}</span>/100
            </p>
          </div>
        </div>
        <div className="filterWrap">
          <FilterBlock
            filterList={filterList}
            filterOnChange={this.searchOnChange}
            submitFilter={this.onSearch}
            colNum={4}
            query={query}
          />
        </div>
      </div>
    );
  };

  /** 表格元素选择 */
  slelectRowOnSelect = (record, selected) => {
    console.log('selected===', selected);
    console.log('record===', record);
    let { selectedRowKeys } = this.state;
    const { Fip } = record;
    if (selected) {
      if (!selectedRowKeys.includes(Fip)) selectedRowKeys.push(Fip);
    } else {
      selectedRowKeys = selectedRowKeys.filter((item) => {
        return item !== Fip;
      });
    }
    this.setState({
      selectedRowKeys,
    });
  };

  /** 表格元素全选 */
  onSelectAll = (selected, selectedRows) => {
    // console.log("selected===", selected);
    // console.log("selectedRows===", selectedRows);

    if (selected) {
      const selectedRowKeys = selectedRows.map((item) => {
        return item.Fip;
      });
      this.setState({
        selectedRowKeys,
      });
    } else {
      this.setState({
        selectedRowKeys: [],
      });
    }
  };

  /** 资产表发生改变的时候（主要用于筛选,分页, 排序） */
  handleTableChange = (params) => {
    console.log('handleTableChange.params===', params);
    const { query } = this.state;
    if (params.page) query.page = params.page;
    if (params.pageSize) query.pageSize = params.pageSize;

    const { filters, sort } = params;
    if (filters) {
      const {
        Fgroup_name,
        Fcategory_name,
        'GROUP_CONCAT(t_ai_ip_scene_config.Fstatus)': Falert_mode,
      } = filters;
      if (Fgroup_name) {
        const assetGroup = Fgroup_name.map((item) => Number(item));
        query.filterObj.Fgroup = assetGroup;
      }
      if (Fcategory_name) {
        const assetCategory = Fcategory_name.map((item) => Number(item));
        query.filterObj.Fcategory = assetCategory;
      }
      if (Falert_mode) {
        query.filterObj.Falert_mode = Falert_mode;
      }
    }

    if (params.dir) query.dir = params.dir;
    if (sort) {
      if (
        sort ===
        'GROUP_CONCAT(t_ai_ip_scene_config.Finsert_time ORDER BY t_ai_ip_scene_config.Finsert_time desc)'
      ) {
        query.sort = 'Finsert_time';
      }
      if (
        sort ===
        'GROUP_CONCAT(t_ai_ip_scene_config.Fupdate_time ORDER BY t_ai_ip_scene_config.Fupdate_time desc)'
      ) {
        query.sort = 'Fupdate_time';
      }
    }
    this.setState({ query }, () => {
      this.fetchAdvancedAssetAnalysisTable();
    });
  };

  searchOnChange = (type, value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { search: value });
    this.setState({ query: newQuery });
  };

  onSearch = () => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState(
      {
        query: newQuery,
      },
      () => {
        this.fetchAdvancedAssetAnalysisTable();
      }
    );
  };

  render() {
    const {
      advancedAnalysis: { assetAnalysisTable },
      tableLoading,
    } = this.props;

    const {
      addAdvancedAnalysisAssetsModalVisiable,
      query,
      selectedRowKeys,
      columns,
      AssetsAnalysisMode,
      selectedRows,
      AdvancedAnalysisAssetsTitle,
      isExitAssetsAnalysisDataFromDB,
    } = this.state;

    /** 暂未添加高级分析的资产显示的视图 */
    const noAssets = () => {
      return (
        <div className={styles.autoProgress}>
          {tableLoading ? (
            <Spin />
          ) : (
            <NoAssets handleImmediatelyAddClick={this.handleAssetsAnalysisModeVisiable} />
          )}
        </div>
      );
    };
    const rowSelection = {
      selectedRowKeys,
      onSelect: this.slelectRowOnSelect,
      onSelectAll: this.onSelectAll,
    };
    // 设置按钮状态
    if (this.btnList) {
      this.btnList = this.btnList.map((item) => {
        if (item.label === '编辑测算模式' || item.label === '删除') {
          item.disabled = selectedRowKeys.length === 0;
        }
        return item;
      });
    }
    return (
      <div className="container">
        {assetAnalysisTable.total === 0 && !isExitAssetsAnalysisDataFromDB ? (
          noAssets()
        ) : (
          <div className="AdvancedAnalysis">
            <CommonPage
              titleName="高级分析资产"
              query={query}
              mode
              timeRangeRender={false}
              selctedItemsRender={false}
              selectedFlag={false}
              siderRender={false}
              collapsedBtnRender={false}
              filterBar={{}}
              titleRender={this.titleRender}
              tipsRender={false}
              chartRender={false}
              table={{
                wrapperClass: styles.tableBlock,
                operationProps: {
                  btnList: this.btnList,
                },
                tableProps: {
                  rowKey: 'Fip',
                  tableScrollX: 1500,
                  rowSelection,
                  loading: tableLoading,
                  columns,
                  page: query.page,
                  pageSize: query.pageSize,
                  handleTableChange: this.handleTableChange,
                  data: { total: assetAnalysisTable.total, list: assetAnalysisTable.list },
                },
              }}
            />
          </div>
        )}

        {/* 操作(添加/编辑)高级资产分析组件 */}
        <AdvancedAnalysisAssetsModal
          title={AdvancedAnalysisAssetsTitle}
          mode={AssetsAnalysisMode}
          selectedRows={selectedRows}
          visible={addAdvancedAnalysisAssetsModalVisiable}
          onCancel={this.onCancelAddAdvancedAnalysisAssetsModalVisiable}
        />
      </div>
    );
  }
}

export default Form.create()(AdvancedAnalysis);
