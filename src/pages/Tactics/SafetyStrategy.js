import React, { Component } from 'react';
import { connect } from 'umi';
import { FormOutlined, LeftOutlined } from '@ant-design/icons';
// import classNames from 'classnames';
import { Table, message, Modal, Input, Switch, Divider, Spin, Button, Pagination } from 'antd';
import ButtonBlock from '@/components/ButtonBlock';
import FilterBlock from '@/components/FilterBlock/Filter';
import EventRuleModal from './EventsModal';
import configSettings from '../../configSettings';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

/* eslint-disable camelcase */

// const { Option } = Select;
const { confirm } = Modal;
@connect(({ tacticsSafeStrategy, global, loading }) => ({
  tacticsSafeStrategy,
  loading: loading.effects['tacticsSafeStrategy/fetchEventList'],
  isKVM: global.isKVM,
  loading2: loading.effects['sourceAccess/updateSourceState'],
  loading3: loading.effects['tacticsSafeStrategy/fetchNodesEids'],
}))
class SafetyStrategy extends Component {
  constructor(props) {
    super(props);
    this.safeAuth = getAuth('/tactics/safetyStrategy');
    this.state = {
      page: 1,
      limit: parseInt(configSettings.pageSizeOptions[0], 10),
      query: {
        page: 1,
        limit: parseInt(configSettings.pageSizeOptions[0], 10),
        search: '',
      },
      otherRuleQuery: {
        page: 1,
        limit: parseInt(configSettings.pageSizeOptions[0], 10),
        category: '', // 分类
        level: '', // 级别
        search: '',
        sort: '', //
        dir: '',
      },
      currentHoverRow: '',
      selectedRowKeys: [],
      ids: [],
      addSelectedRowKeys: [], // 选择添加的规则rows
      addIds: [],
      ruleConfigVisible: false, // 编辑探针的规则详情页
      ruleAddVisible: false, // 探针新增规则弹窗
      descReviseVisible: false, // 备注修改
      desc: '',
      probeName: '', // 探针名称
      loading: {},
      haboReqing: {},
      operateReqing: {},
      allNodesEid: {}, // 所有探针当前事件id
      eventRuleVisible: false,
      // Fsignature_id: [], // 规则ID
      Fgid: [], // 事件ID
      modalNode: '',
      // threatOperation: false,
      // threatSelectVal: 0,
    };
    this.id = ''; // 探针id
    this.probeColumns = [
      {
        title: '流量源',
        dataIndex: 'name',
        key: 'name',
        // width: 200,
      },
      {
        title: '事件内容',
        dataIndex: 'ruleNum',
        key: 'ruleNum',
        width: 260,
        render: (text, record) => {
          const { allNodesEid } = this.state;
          const modalNode = record.node_id;
          let label = text;
          if (text !== '全部' && text !== 0) {
            label = `多个(${text})`;
          }
          if (text === record.alertCount) {
            label = '全部';
          }
          if (text === 0) {
            label = '暂无';
          }
          return (
            <div>
              {label}
              <FormOutlined
                className={styles.formIcon}
                onClick={() => {
                  // this.showRuleList(record.node_id, record.name);
                  this.setState({
                    eventRuleVisible: true,
                    modalNode,
                    Fgid: allNodesEid[modalNode] || [],
                  });
                }} />
            </div>
          );
        },
      },
      {
        title: '威胁情报检测',
        dataIndex: 'tiEnable',
        key: 'tiEnable',
        // width: 200,
        render: (text, record) => {
          const { loading } = this.state;
          if (this.safeAuth !== 'rw') {
            return <Switch checked={text !== 0} />;
          }
          return (
            <Switch
              loading={loading[record.ip] || false}
              defaultChecked={text !== 0}
              onChange={(checked) => {
                this.tiEnableOperation(record.ip, record.node_id, checked);
              }}
            />
          );
        },
      },
      {
        title: props.isKVM ? '' : '沙箱检测',
        dataIndex: 'habo_enable',
        key: 'habo_enable',
        // width: 200,
        render: (text, record) => {
          if (props.isKVM) {
            return '';
          }
          const { haboReqing } = this.state;
          if (this.safeAuth !== 'rw') {
            return <Switch checked={text !== 0} />;
          }
          return (
            <Switch
              loading={haboReqing[record.node_id] || false}
              defaultChecked={text !== 0}
              onChange={(checked) => {
                // console.log('checked', checked);
                this.eventOperation(
                  'update',
                  record.node_id,
                  { habo_enable: checked ? 1 : 0 },
                  () => {
                    if (checked) {
                      message.success('已启用沙箱检测，请点击下发生效');
                    } else {
                      message.success('已关闭沙箱检测，请点击下发生效');
                    }
                  }
                );
              }}
            />
          );
        },
      },
      {
        title: '操作',
        dataIndex: '',
        key: '',
        width: 200,
        render: (text, record) => {
          const { operateReqing } = this.state;
          if (this.safeAuth !== 'rw') {
            return <a>下发</a>;
          }
          return (
            <div>
              {operateReqing[record.node_id] ? (
                <Spin />
              ) : (
                <a
                  onClick={() => {
                    this.goToDistribute(record);
                  }}
                >
                  下发
                </a>
              )}
            </div>
          );
        },
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
        width: 300,
        render: (text, record, index) => {
          const { currentHoverRow, descReviseVisible } = this.state;
          if (currentHoverRow === index && descReviseVisible) {
            return (
              <Input
                defaultValue={text}
                onPressEnter={(e) => {
                  this.eventOperation('update', record.node_id, { desc: e.target.value }, () => {
                    this.setState({ descReviseVisible: false });
                  });
                }}
                onChange={(e) => this.setState({ desc: e.target.value || '' })}
              />
            );
          }
          return (
            <div>
              {text}
              {this.safeAuth === 'rw' && (
                <FormOutlined
                  className={styles.formIcon}
                  onClick={() => {
                    this.setState({ descReviseVisible: true, desc: text });
                  }} />
              )}
            </div>
          );
        },
      },
    ];
    this.ruleColumns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: '80px',
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        key: 'name',
        width: '250px',
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        width: '100px',
        // sorter: true,
      },
      {
        title: '来源',
        dataIndex: 'rule_author',
        key: 'rule_author',
        // sorter: true,
        render: (text) => (text === 'USER' ? '自定义' : '系统默认'),
        width: '100px',
      },
    ];
    this.btnList = [
      {
        label: '添加',
        color: 'blue',
        hide: this.safeAuth !== 'rw',
        func: () => {
          this.setState({ ruleAddVisible: true });
          const { otherRuleQuery } = this.state;
          const { dispatch } = this.props;
          dispatch({
            type: 'tacticsSafeStrategy/fetchEventList',
            payload: {
              name: 'otherRuleList',
              uri: 'eventManage/getProbeOtherRuleList',
              body: { id: this.id, ...otherRuleQuery },
            },
          });
        },
        type: 'primary',
      },
      {
        label: '删除',
        hide: this.safeAuth !== 'rw',
        func: () => {
          this.deleteRules();
        },
        type: 'danger',
      },
    ];
    this.filterList = [
      {
        type: 'select',
        name: '分类',
        key: 'category',
        list: [
          // { name: '全部', value: '全部' },
          { name: '全部', value: '' },
          { name: '扫描探测', value: '扫描探测' },
          { name: 'DoS攻击', value: 'DoS攻击' },
          { name: 'Web攻击', value: 'Web攻击' },
          { name: '漏洞攻击', value: '漏洞攻击' },
          { name: '僵木蠕毒', value: '僵木蠕毒' },
          { name: '勒索软件', value: '勒索软件' },
          { name: '可疑行为', value: '可疑行为' },
          { name: '文件还原', value: '文件还原' },
        ],
      },
      {
        type: 'select',
        name: '级别',
        key: 'level',
        list: [
          { name: '全部', value: '' },
          { name: '严重（100）', value: 5 },
          { name: '高危（80）', value: 4 },
          { name: '中危（60）', value: 3 },
          { name: '低危（40）', value: 2 },
          { name: '信息（20）', value: 1 },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'ID/事件名称',
      },
    ];
  }

  componentDidMount = () => {
    this.fetchProbeList();
  };

  fetchProbeList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tacticsSafeStrategy/fetchEventList',
      payload: { name: 'probeList', uri: 'eventManage/getProbeList', body: {} },
    }).then(() => {
      const {
        tacticsSafeStrategy: { nodeArr },
      } = this.props;
      dispatch({
        type: 'tacticsSafeStrategy/fetchNodesEids',
        payload: { nodes: nodeArr },
      }).then((json) => {
        // console.log(445, json);
        if (json.error_code === 0) {
          this.setState({ allNodesEid: json.data || {} });
        }
      });
    });
  };

  // 更新节点
  eventOperation = (op, id, updateObj, callback) => {
    const { haboReqing } = this.state;
    // 是否为沙箱检测
    if (typeof updateObj.habo_enable === 'number') {
      haboReqing[id] = true;
      this.setState({ haboReqing });
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'whiteListIpAndIoc/putAndDelete',
      payload: { uri: 'eventManage/updateProbeInfo', body: { id, ...updateObj } },
    }).then(() => {
      if (callback) {
        callback();
      }
      if (typeof updateObj.habo_enable === 'number') {
        haboReqing[id] = false;
        this.setState({ haboReqing });
      }
      this.fetchProbeList();
    });
  };

  tiEnableOperation = (ip, node_id, checked) => {
    const { loading } = this.state;
    loading[ip] = true;
    this.setState({ loading });
    const { dispatch } = this.props;
    const req = { id: node_id, ti_enable: checked ? 1 : 0 };
    dispatch({
      type: 'whiteListIpAndIoc/updataTiEnable',
      payload: req,
    })
      .then((res) => {
        loading[ip] = false;
        this.setState({ loading });
        this.fetchProbeList();
        message.success(res);
      })
      .catch((error) => {
        loading[ip] = false;
        this.setState({ loading });
        console.log(435, error);
        message.error('威胁情报检测状态设置失败');
      });
  };

  reStart = (ip, tip) => {
    const { dispatch } = this.props;
    const { loading } = this.state;
    const self = this;
    confirm({
      title: `${tip}，流量引擎配置修改，是否重启？`,
      onOk() {
        loading[ip] = true;
        self.setState({ loading });
        dispatch({
          type: 'sourceAccess/updateSourceState',
          payload: { uri: 'systemset/stopSource', body: { ip } },
        })
          .then(() => {
            dispatch({
              type: 'sourceAccess/updateSourceState',
              payload: { uri: 'systemset/startSource', body: { ip } },
            })
              .then(() => {
                message.success('重启成功');
                loading[ip] = false;
                self.setState({ loading });
                dispatch({ type: 'sourceAccess/fetchSourceData' });
              })
              .catch((error) => {
                console.log(2, 'error', error);
                message.error('重启失败');
                loading[ip] = false;
                self.setState({ loading });
                dispatch({ type: 'sourceAccess/fetchSourceData' });
              });
          })
          .catch((error) => {
            console.log(1, 'error', error);
            message.error('重启失败');
            loading[ip] = false;
            self.setState({ loading });
          });
      },
      onCancel() {},
    });
  };

  goToDistribute = (record) => {
    const { node_id, ip } = record;
    const { operateReqing } = this.state;
    operateReqing[node_id] = true;
    this.setState({ operateReqing });
    const { dispatch } = this.props;

    dispatch({
      type: 'whiteListIpAndIoc/putAndDelete',
      payload: { uri: 'eventManage/probeDistribution', body: { id: node_id, ip } },
    })
      .then(() => {
        operateReqing[node_id] = false;
        this.setState({ operateReqing });
        message.success('安全策略下发成功');
      })
      .catch((err) => {
        operateReqing[node_id] = false;
        this.setState({ operateReqing });
        console.log('err', err);
      });
  };

  showRuleList = (id, probeName) => {
    // 点击进入规则列表时，搜索项默认为空
    const { query } = this.state;
    const newQuy = Object.assign({}, query, { search: '', page: 1 });
    const { dispatch } = this.props;
    this.id = id;
    dispatch({
      type: 'tacticsSafeStrategy/fetchEventList',
      payload: { name: 'ruleList', uri: 'eventManage/getProbeRuleList', body: { id, ...newQuy } },
    });
    this.setState({ probeName, ruleConfigVisible: true, query: newQuy });
  };

  filterOnChange = (type, value) => {
    const { query, otherRuleQuery, ruleAddVisible } = this.state;
    let val = value;
    if (type === 'search') {
      val = configSettings.trimStr(value);
    }
    const changePart = { [type]: val };
    if (ruleAddVisible) {
      this.setState({
        otherRuleQuery: Object.assign({}, otherRuleQuery, changePart),
      });
    } else {
      this.setState({
        query: Object.assign({}, query, changePart),
      });
    }
  };

  submitFilter = () => {
    const { query, otherRuleQuery, ruleAddVisible } = this.state;
    const { dispatch } = this.props;
    let params;
    if (ruleAddVisible) {
      const addQuery = Object.assign({}, otherRuleQuery, { page: 1 });
      this.setState({ otherRuleQuery: addQuery });
      params = {
        name: 'otherRuleList',
        uri: 'eventManage/getProbeOtherRuleList',
        body: { id: this.id, ...addQuery },
      };
    } else {
      const newQuery = Object.assign({}, query, { page: 1 });
      this.setState({ query: newQuery });
      params = {
        name: 'ruleList',
        uri: 'eventManage/getProbeRuleList',
        body: { id: this.id, ...newQuery },
      };
    }
    dispatch({
      type: 'tacticsSafeStrategy/fetchEventList',
      payload: params,
    });
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const { ruleAddVisible } = this.state;
    console.log('selectedRowKeys', selectedRowKeys);
    const ids = selectedRows.map((row) => row.id);
    if (ruleAddVisible) {
      this.setState({ addSelectedRowKeys: selectedRowKeys, addIds: ids });
    } else {
      this.setState({ selectedRowKeys, ids });
    }
  };

  paginationChange = (page, pageSize) => {
    const { query, otherRuleQuery, ruleConfigVisible, ruleAddVisible } = this.state;
    const { dispatch } = this.props;
    if (ruleAddVisible) {
      const newOtherQuery = Object.assign({}, otherRuleQuery, { page, limit: pageSize });
      this.setState({ otherRuleQuery: newOtherQuery });
      dispatch({
        type: 'tacticsSafeStrategy/fetchEventList',
        payload: {
          name: 'otherRuleList',
          uri: 'eventManage/getProbeOtherRuleList',
          body: { id: this.id, ...newOtherQuery },
        },
      });
    } else if (ruleConfigVisible) {
      const newQuery = Object.assign({}, query, { page, limit: pageSize });
      this.setState({ query: newQuery });
      dispatch({
        type: 'tacticsSafeStrategy/fetchEventList',
        payload: {
          name: 'ruleList',
          uri: 'eventManage/getProbeRuleList',
          body: { id: this.id, ...newQuery },
        },
      });
    } else {
      this.setState({ page, limit: pageSize });
    }
  };

  deleteRules = () => {
    const { dispatch } = this.props;
    const { ids, query } = this.state;
    if (ids.length === 0) {
      message.warn('请选择要删除的规则项');
      return;
    }
    dispatch({
      type: 'whiteListIpAndIoc/putAndDelete',
      payload: {
        uri: 'eventManage/deleteRuleToProbe',
        body: { id: this.id, ruleIds: ids.join(',') },
      },
    }).then(() => {
      message.success('所选规则删除成功');
      dispatch({
        type: 'tacticsSafeStrategy/fetchEventList',
        payload: {
          name: 'ruleList',
          uri: 'eventManage/getProbeRuleList',
          body: { id: this.id, ...query },
        },
      });
    });
  };

  // threatSelectChange = e => {
  //   console.log(563, e);
  //   this.setState({ threatSelectVal: e });
  // };

  // threatSelectLeave = record => {
  //   console.log(568, record);
  //   const { threatSelectVal } = this.state;
  //   console.log('设置事件 threatSelectVal==', threatSelectVal);
  // };

  showConfirm = () => {
    const {
      tacticsSafeStrategy: { otherRuleList },
    } = this.props;
    const total = otherRuleList.recordsTotal;
    if (total === 0) {
      return;
    }
    const self = this;
    confirm({
      title: `确定将全部${total}项规则添加到探针？`,
      content: '',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        const { otherRuleQuery } = self.state;
        const { dispatch } = self.props;
        const { category, level, search } = otherRuleQuery;
        dispatch({
          type: 'tacticsSafeStrategy/putAndDelete',
          payload: {
            uri: 'eventManage/addAllOtherRulesToProbe',
            body: { id: self.id, category, level, search },
          },
        }).then(() => {
          message.success(`${total}项规则添加到探针成功`);
          self.setState({ addIds: [], addSelectedRowKeys: [] });
          dispatch({
            type: 'tacticsSafeStrategy/fetchEventList',
            payload: {
              name: 'otherRuleList',
              uri: 'eventManage/getProbeOtherRuleList',
              body: { id: self.id, ...otherRuleQuery },
            },
          });
        });
      },
      onCancel() {},
    });
  };

  handleOk = () => {
    const { addIds, otherRuleQuery } = this.state;
    const { dispatch } = this.props;
    if (addIds.length === 0) {
      message.warn('请选择要添加的规则项');
      return;
    }
    dispatch({
      type: 'tacticsSafeStrategy/putAndDelete',
      payload: {
        uri: 'eventManage/addRuleToProbe',
        body: { id: this.id, ruleIds: addIds.join(',') },
      },
    }).then(() => {
      message.success('所选规则添加成功');
      dispatch({
        type: 'tacticsSafeStrategy/fetchEventList',
        payload: {
          name: 'otherRuleList',
          uri: 'eventManage/getProbeOtherRuleList',
          body: { id: this.id, ...otherRuleQuery },
        },
      });
      this.setState({ addSelectedRowKeys: [], addIds: [] });
    });
  };

  oncancel = () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'tacticsSafeStrategy/fetchEventList',
      payload: {
        name: 'ruleList',
        uri: 'eventManage/getProbeRuleList',
        body: { id: this.id, ...query },
      },
    });
    this.setState({ ruleAddVisible: false, addSelectedRowKeys: [] });
  };

  eventRuleCancel = () => {
    this.setState({ eventRuleVisible: false, Fgid: [], modalNode: '' });
  };

  eventRuleSave = (Fsignature_id, eventIds) => {
    const { dispatch } = this.props;
    const { Fgid, modalNode } = this.state;
    const addArr = eventIds.filter((tid) => Fgid.indexOf(tid) < 0);
    const delArr = Fgid.filter((tid) => eventIds.indexOf(tid) < 0);
    dispatch({
      type: 'tacticsSafeStrategy/handleNodeEids',
      payload: { id: modalNode, addArr, delArr },
    })
      .then((json) => {
        if (json.error_code === 0) {
          message.success('事件内容配置成功');
          this.setState({ eventRuleVisible: false, Fgid: [], modalNode: '' }, () => {
            this.fetchProbeList();
          });
        } else {
          message.error(json.msg);
        }
      })
      .catch((err) => {
        message.error(err.msg);
      });
  };

  render() {
    const {
      page,
      limit,
      query,
      otherRuleQuery,
      selectedRowKeys,
      addSelectedRowKeys,
      currentHoverRow,
      ruleConfigVisible,
      ruleAddVisible,
      descReviseVisible,
      desc,
      probeName,
      eventRuleVisible,
      Fgid,
    } = this.state;
    const {
      tacticsSafeStrategy: { probeList, ruleList, otherRuleList },
      loading,
      loading3,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
    };
    const addRowSelection = {
      addSelectedRowKeys,
      onChange: this.selectRowOnchange,
    };
    const { length } = addSelectedRowKeys;
    return (
      <div className="contentWraper">
        <div className="commonHeader">安全策略下发</div>
        <div>
          {!ruleConfigVisible ? (
            <div className="TableTdPaddingWrap">
              <ButtonBlock
                btnList={[]}
                total={probeList.recordsTotal}
                onPageChange={this.paginationChange}
                bpage={page}
              />
              <Table
                rowKey="node_id"
                loading={loading || loading3}
                columns={this.probeColumns}
                dataSource={probeList.list}
                pagination={{
                  pageSize: limit,
                  current: page,
                  total: probeList.recordsTotal,
                  onChange: this.paginationChange,
                }}
                rowClassName={(record, index) =>
                  index === currentHoverRow ? styles.handleAction : ''
                }
                onRow={(record, index) => ({
                  onMouseEnter: () => {
                    this.setState({ currentHoverRow: index });
                  },
                  onMouseLeave: () => {
                    if (descReviseVisible) {
                      this.eventOperation('update', record.node_id, { desc: desc || '' }, () => {
                        this.setState({ descReviseVisible: false });
                      });
                    } else {
                      this.setState({ currentHoverRow: '' });
                    }
                  },
                })}
              />
            </div>
          ) : (
            <div className={styles.ruleConfigContent}>
              <div className={styles.ruleConfigHeader}>
                <span
                  onClick={() => {
                    this.fetchProbeList();
                    this.setState({ ruleConfigVisible: false });
                  }}
                >
                  <LeftOutlined />
                  &nbsp; 返回
                </span>
                <Divider type="vertical" />
                <span>
                  设置
                  {probeName}
                  的规则
                </span>
                <div>
                  搜索：&nbsp;
                  <Input
                    onChange={(e) => {
                      this.filterOnChange('search', e.target.value);
                    }}
                    placeholder="ID/事件名称"
                    onPressEnter={this.submitFilter}
                  />
                  <Button
                    className="smallBlueBtn"
                    style={{ position: 'relative', top: -2 }}
                    onClick={this.submitFilter}
                  >
                    搜索
                  </Button>
                </div>
              </div>
              <div className="TableTdPaddingWrap">
                <ButtonBlock
                  btnList={this.btnList}
                  total={ruleList.recordsTotal}
                  onPageChange={this.paginationChange}
                  bpage={query.page}
                />
                <Table
                  rowKey="id"
                  loading={loading}
                  columns={this.ruleColumns}
                  dataSource={ruleList.list}
                  pagination={{
                    pageSize: query.limit,
                    current: query.page,
                    total: ruleList.recordsTotal,
                    onChange: this.paginationChange,
                  }}
                  rowSelection={rowSelection}
                />
              </div>
            </div>
          )}
          <Modal
            title="事件列表"
            visible={ruleAddVisible}
            onOk={this.handleOk}
            onCancel={this.oncancel}
            width={900}
            footer={
              <div className={styles.modalFooter}>
                <a onClick={this.showConfirm}>
                  添加全部
                  {otherRuleList.recordsTotal}项
                </a>
                <Button onClick={this.oncancel}>取消</Button>
                <Button type="primary" onClick={this.handleOk}>
                  添加
                </Button>
              </div>
            }
            destroyOnClose
          >
            <div className={styles.rulelistFilter}>
              <FilterBlock
                filterList={this.filterList}
                filterOnChange={this.filterOnChange}
                submitFilter={this.submitFilter}
                colNum={4}
                query={otherRuleQuery}
              />
            </div>
            <Table
              rowKey="id"
              loading={loading}
              columns={this.ruleColumns}
              dataSource={otherRuleList.list}
              pagination={false}
              rowSelection={addRowSelection}
              scroll={{ y: 400 }}
            />
            <div className={styles.addRuleFooter}>
              {length > 0 && (
                <div className={styles.ruleSelectPrompt}>
                  已勾选&nbsp;
                  <span>{length}</span>
                  &nbsp;项
                </div>
              )}
              {/* <a
                  onClick={() => {
                    this.setState({ addSelectedRowKeys: [] });
                  }}
                >
                  取消
                </a> */}
              <Pagination
                style={{ float: 'right' }}
                current={otherRuleQuery.page}
                defaultPageSize={otherRuleQuery.limit}
                pageSizeOptions={configSettings.pageSizeOptions}
                size="small"
                total={otherRuleList.recordsTotal}
                onChange={this.paginationChange}
                // onShowSizeChange={this.onChange}
                // showSizeChanger
                showQuickJumper
              />
            </div>
          </Modal>
        </div>
        {eventRuleVisible && (
          <EventRuleModal
            key="eventRule"
            selectedIds={Fgid}
            rwAuth={this.safeAuth}
            visible={eventRuleVisible}
            onCancel={this.eventRuleCancel}
            onSave={this.eventRuleSave}
          />
        )}
      </div>
    );
  }
}

export default SafetyStrategy;
