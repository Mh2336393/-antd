import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { CheckCircleFilled, DownSquareOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, message, Modal, Radio, Input, Tooltip, Row, Col, Button, Switch } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import UploadTemplate from '@/components/UploadTemplate';
import EventRuleModal from '../EventRuleModal';
import RulesModal from '../RulesModal';
import configSettings from '../../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
import styles from './index.less';

/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { TextArea } = Input;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { confirm } = Modal;
@connect(({ global, whiteListIpAndIoc, loading }) => ({
  hasVpc: global.hasVpc,
  isKVM: global.isKVM,
  whiteListIpAndIoc,
  loading: loading.effects['whiteListIpAndIoc/fetchEventList'],
}))
class IpWhitelist extends Component {
  constructor(props) {
    super(props);
    this.ipAuth = getAuth('/tactics/whites/currency');
    this.state = {
      query: {
        page: 1,
        limit: parseInt(configSettings.pageSizeOptions[0], 10),
        search: '',
        sort: '',
        dir: '',
      },
      selectedRowKeys: [],
      ids: [],
      createVisible: false, // 显示操作
      modalTitle: '新建',
      editItem: {},
      // paramsObj: '',
      uploadVisible: false,
      isProcessing: false, // 点击标志
      ipFromRuleId: '0',
      ruleExtra: '',
      tooltipVisible: false,
      eventVisible: false,
      ruleVisible: false,
      eventID: [],
      ruleID: [],
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

    this.columns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          if (this.ipAuth !== 'rw') {
            return null;
          }
          let actionStyle;
          const {
            whiteListIpAndIoc: { eventList },
          } = this.props;
          const { showOperation } = this.state;

          if (index < eventList.list.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }
          const { signature_switch, white_event = '', white_rule = '' } = record;
          const ipFromRuleId = signature_switch;
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
                    <p
                      onClick={() => {
                        let ruleID = white_rule ? white_rule.split(',') : [];
                        let eventID = white_event ? white_event.split(',') : [];
                        ruleID = ruleID.map((rid) => Number(rid));
                        eventID = eventID.map((eid) => Number(eid));
                        this.setState({
                          showOperation: false,
                          createVisible: true,
                          ruleExtra: '',
                          modalTitle: '编辑',
                          ipFromRuleId,
                          editItem: record,
                          ruleID,
                          eventID,
                        });
                      }}
                    >
                      编辑
                    </p>
                    <p
                      onClick={() => {
                        this.eventOperation('del', record.id, null, () => {
                          message.success('白名单删除成功');
                          this.setState({ showOperation: false, isProcessing: false });
                        });
                      }}
                    >
                      删除
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: '源IP',
        dataIndex: 'src_ip',
        key: 'src_ip',
        // width: 200,
      },
      {
        title: '目的IP',
        dataIndex: 'dst_ip',
        key: 'dst_ip',
        // width: 200,
      },
      {
        title: 'URL',
        dataIndex: 'white_url',
        key: 'white_url',
        width: 250,
      },
      {
        title: '入侵感知白名单',
        dataIndex: 'signature_switch',
        key: 'signature_switch',
        sorter: true,
        render: (text) => (text === '0' ? '不启用' : '启用'),
        // render: text => {
        //   let val = '不启用';
        //   if (text === '1') {
        //     val = '全部规则启用'; // 全部规则
        //   }
        //   if (text === '2') {
        //     val = '部分规则启用'; // 部分规则
        //   }
        //   return val;
        // },
        // width: 200,
        // <Switch
        //   defaultChecked={text !== 0}
        //   onChange={checked => {
        //     console.log('checked', checked);
        //     this.eventOperation('update', record.id, { signature_switch: checked ? 1 : 0 });
        //   }}
        // />
      },
      {
        title: '失陷感知白名单',
        dataIndex: 'ioc_switch',
        key: 'ioc_switch',
        sorter: true,
        render: (text) => (text === '0' ? '不启用' : '启用'),
        // width: 200,
      },
      {
        title: props.isKVM ? '' : '异常文件感知白名单',
        dataIndex: 'file_switch',
        key: 'file_switch',
        sorter: !props.isKVM,
        render: (text) => {
          if (props.isKVM) {
            return '';
          }
          return text === '0' ? '不启用' : '启用';
        },
        // width: 200,
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
        width: 200,
      },
    ];

    if (props.hasVpc) {
      this.columns.splice(1, 0, {
        title: 'VPCID',
        dataIndex: 'vpcid',
        key: 'vpcid',
        // width: 200,
        render: (text) => text || '',
      });
    }

    this.btnList = [
      {
        label: '新建',
        hide: this.ipAuth !== 'rw',
        func: () => {
          this.setState({
            createVisible: true,
            ruleExtra: '',
            ipFromRuleId: '0',
            modalTitle: '新建',
            editItem: {},
            eventID: [],
            ruleID: [],
          });
        },
        color: 'blue',
      },
      {
        label: '删除',
        hide: this.ipAuth !== 'rw',
        func: () => {
          this.eventOperation('multiDel', null, null, () => {
            message.success('白名单删除成功');
            this.setState({ ids: [], isProcessing: false });
          });
        },
        type: 'danger',
      },
      {
        label: '导入',
        hide: this.ipAuth !== 'rw',
        func: () => {
          this.setState({ uploadVisible: true });
        },
        type: 'primary',
      },
      {
        label: '导出',
        type: 'primary',
        func: () => {},
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    const params = {
      uri: 'eventManage/getIpWhitelist',
      body: { cmd: 'get_threat_event_whitelist', ...query },
    };
    dispatch({
      type: 'whiteListIpAndIoc/fetchEventList',
      payload: params,
    });
  };

  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }

  filterOnChange = (type, value) => {
    const { query } = this.state;
    let val = value;
    if (type === 'search') {
      val = configSettings.trimStr(value);
    }
    const changePart = { [type]: val };
    const newQuery = Object.assign({}, query, changePart);
    this.setState({
      query: newQuery,
    });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({ query: newQuery });
    const params = {
      uri: 'eventManage/getIpWhitelist',
      body: { cmd: 'get_threat_event_whitelist', ...newQuery },
    };
    dispatch({
      type: 'whiteListIpAndIoc/fetchEventList',
      payload: params,
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== query.page || pageSize !== query.limit) {
      newQuery = Object.assign({}, query, { page: current, limit: pageSize });
    } else {
      const { field, order } = sorter;
      if (['src_ip', 'dst_ip', 'desc'].indexOf(field) > -1 || !field) {
        return;
      }
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, {
        dir,
        sort: field,
        page: 1,
      });
    }
    this.setState({ query: newQuery });
    const params = {
      uri: 'eventManage/getIpWhitelist',
      body: { cmd: 'get_threat_event_whitelist', ...newQuery },
    };
    dispatch({
      type: 'whiteListIpAndIoc/fetchEventList',
      payload: params,
    });
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    // const { query } = this.state;
    const ids = selectedRows.map((row) => row.id);
    // const params = {};
    // params.cmd = 'export_whitelist';
    // params.type = 1;
    // params.ids = ids;
    // params.dir = query.dir;
    // params.search = query.search;
    // params.sort = query.sort;
    this.setState({ selectedRowKeys, ids });
    // this.setState({ paramsObj: ids.length !== 0 ? JSON.stringify(params) : '' });
  };

  putAndDelete = (uri, cmd, body, callback) => {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'whiteListIpAndIoc/putAndDelete',
      payload: { uri, body: { cmd, ...body } },
    })
      .then(() => {
        if (callback) {
          callback();
        }
        const params = {
          uri: 'eventManage/getIpWhitelist',
          body: { cmd: 'get_threat_event_whitelist', ...query },
        };
        dispatch({
          type: 'whiteListIpAndIoc/fetchEventList',
          payload: params,
        });
      })
      .catch(() => {
        this.setState({ isProcessing: false });
      });
  };

  // 新建，单个/批量删除，更新,
  eventOperation = (op, id, updateObj, callback) => {
    const { isProcessing } = this.state;
    const self = this;
    if (isProcessing) return;
    this.setState({ isProcessing: true });
    if (op === 'add') {
      this.putAndDelete('eventManage/putIpInfo', 'add_threat_event_whitelist', updateObj, callback);
    } else if (op === 'del' || op === 'multiDel') {
      let body = {};
      if (op === 'del') {
        body = { ids: [id] };
      } else {
        const { ids } = this.state;
        if (ids.length === 0) {
          message.warn('请选择要删除的IP白名单');
          this.setState({ isProcessing: false });
          return;
        }
        body = { ids };
      }
      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          self.putAndDelete('eventManage/deleteIds', 'del_threat_event_whitelist', body, callback);
        },
        onCancel() {
          self.setState({ isProcessing: false });
        },
      });
    } else if (op === 'update') {
      this.putAndDelete(
        'eventManage/updateIpInfo',
        'edit_threat_event_whitelist',
        { id, ...updateObj },
        callback
      );
    }
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, limit: pageSize });
    this.setState({ query: newQuery });
    const params = {
      uri: 'eventManage/getIpWhitelist',
      body: { cmd: 'get_threat_event_whitelist', ...newQuery },
    };
    dispatch({ type: 'whiteListIpAndIoc/fetchEventList', payload: params });
  };

  handleOk = () => {
    const { form, hasVpc, isKVM } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { modalTitle, editItem, ipFromRuleId, eventID, ruleID } = this.state;
        const white_rule = ruleID;
        const white_event = eventID;
        const {
          ioc_switch: iocState,
          file_switch: fileState,
          src_ip: srcIp,
          dst_ip: destIp,
          vpcid,
          white_url = '',
        } = values;
        const ioc_switch = iocState ? '1' : '0';
        const file_switch = fileState ? '1' : '0';

        const params = Object.assign({}, values, { ioc_switch, file_switch });
        if (isKVM) {
          params.file_switch = '0';
        }

        if (srcIp || destIp) {
          const srcCate = configSettings.checkIpCate(srcIp);
          const dstCate = configSettings.checkIpCate(destIp);
          if (
            srcCate === 'ipv4ipv6' ||
            dstCate === 'ipv4ipv6' ||
            (srcIp && destIp && srcCate !== dstCate)
          ) {
            message.error('源ip、目的ip的输入格式要统一为ipv4或ipv6');
            return;
          }
        }

        // 入侵未开启
        if (ipFromRuleId === '0') {
          if (hasVpc && !srcIp && !destIp && (!vpcid || vpcid === '0')) {
            message.error('源ip、目的ip和vpcid不能同时为空');
            return;
          }
          if (!hasVpc && !srcIp && !destIp) {
            message.error('源ip和目的ip不能同时为空');
            return;
          }
        }
        // 只有入侵开启
        if (ipFromRuleId !== '0' && ioc_switch === '0' && file_switch === '0') {
          if (ipFromRuleId === '2' && !white_rule) {
            message.error('入侵感知白名单开启部分规则：当选择了部分规则开启时，规则ID不能为空');
            return;
          }
          if (ipFromRuleId === '1') {
            // 全部开启
            if (hasVpc && !srcIp && !destIp && !white_url && (!vpcid || vpcid === '0')) {
              message.error('入侵感知白名单开启全部规则：源ip、目的ip、URL和vpcid不能同时为空');
              return;
            }
            if (!hasVpc && !srcIp && !destIp && !white_url) {
              message.error('入侵感知白名单开启全部规则：源ip、目的ip和URL不能同时为空');
              return;
            }
          }
        }
        // 入侵开启 异常文件或失陷也开启
        if (ipFromRuleId !== '0' && (ioc_switch === '1' || file_switch === '1')) {
          if (hasVpc && !srcIp && !destIp && (!vpcid || vpcid === '0')) {
            message.error(
              '入侵感知开启规则（部分或全部）并且失陷感知或异常文件感知也开启了规则： 源ip、目的ip和vpcid不能同时为空'
            );
            return;
          }
          if (!hasVpc && !srcIp && !destIp) {
            message.error(
              '入侵感知开启规则（部分或全部）并且失陷感知或异常文件感知也开启了规则：源ip和目的ip不能同时为空'
            );
            return;
          }
        }

        params.white_url = white_url ? white_url.split(/[,\n]/g) : [];
        params.white_rule = white_rule;
        params.white_event = white_event;
        params.signature_switch = ipFromRuleId === '0' ? '0' : '1';

        const valueObj = !values.vpcid
          ? { ...params, vpcid: 0 }
          : Object.assign({ ...params }, { vpcid: parseInt(vpcid, 10) });
        if (modalTitle === '新建') {
          this.eventOperation('add', null, valueObj, () => {
            message.success('白名单新建成功，1分钟内生效');
            this.setState({ createVisible: false, eventID: [], ruleID: [], isProcessing: false });
          });
        } else {
          this.eventOperation('update', editItem.id, valueObj, () => {
            message.success('白名单修改成功');
            this.setState({ createVisible: false, eventID: [], ruleID: [], isProcessing: false });
          });
        }
      }
    });
  };

  onCancel = () => {
    this.setState({ uploadVisible: false });
    const { dispatch } = this.props;
    const { query } = this.state;
    const params = {
      uri: 'eventManage/getIpWhitelist',
      body: { cmd: 'get_threat_event_whitelist', ...query },
    };
    dispatch({
      type: 'whiteListIpAndIoc/fetchEventList',
      payload: params,
    });
  };

  numberValidator = (rule, value, callback) => {
    if (/[^\d]/g.test(value) || (value !== '' && parseInt(value, 10) > 4294967295)) {
      callback('vpcid格式输入不正确');
    }
    callback();
  };

  alertWhiteChange = (rule, value, callback) => {
    this.setState({ ipFromRuleId: value ? '1' : '0' });
    callback();
  };

  urlValidator = (rule, value, callback) => {
    if (value) {
      const arr = value.split(/[,\n]/g);
      const allCheck = arr.every((urlStr) => configSettings.validateUri(urlStr));
      const allCheckArr = arr.map((urlStr) => configSettings.validateUri(urlStr));
      console.log('arr==', arr, 'allCheck==', allCheck, 'allCheckArr==', allCheckArr);
      if (allCheck) {
        callback();
      } else {
        callback('url格式有误，请重新输入');
      }
    } else {
      callback();
    }
  };

  ruleValidator = (rule, value, callback) => {
    // console.log(433, `|${value}|`);
    if (value) {
      const arr = value.split(/[,\n]/g);
      const allCheck = arr.every((num) => /^(\d)+$/.test(num));
      if (allCheck) {
        const { dispatch, form } = this.props;
        dispatch({
          type: 'whiteListIpAndIoc/fetchRuleName',
          payload: { id: arr },
        }).then((json) => {
          const { ruleName } = json;
          const curFormVal = form.getFieldValue('white_rule');
          // console.log(471, 'value==', value, 'cur==', curFormVal);
          let ruleExtra = (
            <div className={styles.popoverCxt}>
              <p>规则名称：</p>
              {arr.map((id, idx) => (
                <p key={id}>
                  {id}：{ruleName[idx] || ''}
                </p>
              ))}
            </div>
          );
          if (curFormVal === '') {
            ruleExtra = '';
          }
          this.setState({ ruleExtra });
        });
        callback();
      } else {
        callback('格式有误，请重新输入');
      }
    } else {
      this.setState({ ruleExtra: '' });
      callback();
    }
  };

  TooltipOnLeave = () => {
    // console.log(495, 'e==', e);
    this.setState({ tooltipVisible: false });
  };

  TooltipOnEnter = () => {
    // console.log(500, 'e==', e);
    this.setState({ tooltipVisible: true });
  };

  eventRuleCancel = () => {
    this.setState({ eventVisible: false });
  };

  eventRuleSave = (sids, eventIds) => {
    // const { ruleID } = this.state;
    // const newRuleID = ruleID.length ? ruleID : Fsignature_id;
    this.setState({ eventVisible: false, ruleID: sids, eventID: eventIds });
  };

  rulesCancel = () => {
    this.setState({ ruleVisible: false });
  };

  rulesSave = (ruleIds) => {
    this.setState({ ruleVisible: false, ruleID: ruleIds });
  };

  render() {
    const {
      query,
      ids,
      selectedRowKeys,
      currentHoverRow,
      modalTitle,
      createVisible,
      editItem,
      uploadVisible,
      ipFromRuleId,
      ruleExtra,
      tooltipVisible,
      eventVisible,
      ruleVisible,
      eventID,
      ruleID,
    } = this.state;
    const { hasVpc, form, isKVM } = this.props;
    const {
      whiteListIpAndIoc: {
        eventList: { recordsTotal, list },
      },
      loading,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
    };
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 7 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };

    const params = {
      cmd: 'export_whitelist',
      type: ids.length ? 1 : 0,
      ids,
      dir: query.dir,
      search: query.search,
      sort: query.sort,
    };
    const paramsObjStr = JSON.stringify(params);

    // console.log('editItem', editItem);
    return (
      <div>
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
          <ButtonBlock
            btnList={this.btnList}
            total={recordsTotal}
            onPageChange={this.paginationChange}
            hrefStr={`/api/event/IpexportFile?params=${paramsObjStr}`}
            bpage={query.page}
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
          {createVisible && (
            <Modal
              title={modalTitle}
              width={600}
              visible={createVisible}
              onOk={this.handleOk}
              onCancel={() => {
                this.setState({ createVisible: false, eventID: [], ruleID: [] });
              }}
              okText={modalTitle === '新建' ? '新建' : '保存'}
              destroyOnClose
            >
              <Form className={styles.ipForm}>
                <FormItem {...formItemLayout} label="入侵感知白名单">
                  {getFieldDecorator('signature_switch', {
                    // initialValue: editItem.signature_switch || '0',
                    valuePropName: 'checked',
                    initialValue: editItem.signature_switch === '1',
                    rules: [
                      {
                        validator: this.alertWhiteChange,
                      },
                    ],
                  })(
                    <Switch checkedChildren="开" unCheckedChildren="关" />
                    // <RadioGroup>
                    //   <Radio value="1">开启</Radio>
                    //   <Radio value="0">关闭</Radio>
                    // </RadioGroup>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="失陷感知白名单">
                  {getFieldDecorator('ioc_switch', {
                    // initialValue: editItem.ioc_switch || '0',
                    valuePropName: 'checked',
                    initialValue: editItem.ioc_switch === '1',
                  })(
                    <Switch checkedChildren="开" unCheckedChildren="关" />
                    // <RadioGroup>
                    //   <Radio value="1">开启</Radio>
                    //   <Radio value="0">关闭</Radio>
                    // </RadioGroup>
                  )}
                </FormItem>
                {!isKVM && (
                  <FormItem {...formItemLayout} label="异常文件感知白名单">
                    {getFieldDecorator('file_switch', {
                      // initialValue: editItem.file_switch || '0',
                      valuePropName: 'checked',
                      initialValue: editItem.file_switch === '1',
                    })(
                      <Switch checkedChildren="开" unCheckedChildren="关" />
                      // <RadioGroup>
                      //   <Radio value="1">开启</Radio>
                      //   <Radio value="0">关闭</Radio>
                      // </RadioGroup>
                    )}
                  </FormItem>
                )}
                {ipFromRuleId !== '0' && (
                  <Fragment>
                    <Row>
                      <Col xs={7} sm={7}>
                        <div className={styles.colLabel}>
                          <span>事件ID :</span>
                        </div>
                      </Col>
                      <Col xs={16} sm={16}>
                        <div style={{ lineHeight: '39px' }}>
                          {eventID.length ? (
                            <div>
                              <CheckCircleFilled style={{ color: '#0e8c4d' }} />
                              <span style={{ marginLeft: '10px' }}>
                                已添加 <span style={{ color: '#0e8c4d' }}>{eventID.length}</span>{' '}
                                条事件，
                                <span style={{ color: '#0e8c4d' }}>{ruleID.length}</span> 条规则
                              </span>
                              <a
                                style={{ marginLeft: '10px' }}
                                onClick={() => {
                                  this.setState({ eventVisible: true });
                                }}
                              >
                                编辑
                              </a>
                              <a
                                style={{ marginLeft: '10px' }}
                                onClick={() => {
                                  this.setState({ eventID: [], ruleID: [] });
                                }}
                              >
                                删除
                              </a>
                            </div>
                          ) : (
                            <Button
                              className="smallBlueBtn"
                              onClick={() => {
                                this.setState({ eventVisible: true });
                              }}
                            >
                              添加事件
                            </Button>
                          )}
                        </div>
                        {/* {eventID.length > 0 && <div className={styles.idsDiv}>{eventID.join(',')}</div>} */}
                      </Col>
                    </Row>

                    <Row>
                      <Col xs={7} sm={7}>
                        <div className={styles.colLabel}>
                          <span>
                            URL{` `}
                            <Tooltip title="如果设置为空，则默认匹配所有值">
                              <QuestionCircleFilled className="fontBlue" />
                            </Tooltip>
                            {` :`}
                          </span>
                        </div>
                      </Col>
                      <Col xs={16} sm={16}>
                        <FormItem extra="URL设置仅对入侵感知白名单有效">
                          {getFieldDecorator('white_url', {
                            initialValue: editItem.white_url || '',
                            // validateTrigger: 'onBlur',
                            // rules: [
                            //   {
                            //     validator: this.urlValidator,
                            //   },
                            // ],
                          })(
                            <TextArea
                              rows={4}
                              placeholder="支持通配符：? *，允许输入多个，以“,”或者换行分隔"
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </Fragment>
                )}

                {hasVpc === 1 && (
                  <FormItem {...formItemLayout} label="VPCID">
                    {getFieldDecorator('vpcid', {
                      initialValue: editItem.vpcid || '',
                      rules: [
                        {
                          validator: this.numberValidator,
                        },
                      ],
                    })(<Input placeholder="支持0~4294967295位整数" maxLength={10} />)}
                  </FormItem>
                )}
                <Row>
                  <Col xs={7} sm={7}>
                    <div className={styles.colLabel}>
                      <span>
                        源IP{` `}
                        <Tooltip title="如果设置为空，则默认匹配所有值">
                          <QuestionCircleFilled className="fontBlue" />
                        </Tooltip>
                        {` :`}
                      </span>
                    </div>
                  </Col>
                  <Col xs={16} sm={16}>
                    <FormItem extra="源IP和目的IP输入格式要统一为ipv4或ipv6">
                      {getFieldDecorator('src_ip', {
                        initialValue: editItem.src_ip || '',
                        validateTrigger: 'onBlur',
                        rules: [
                          // { required: true, message: '请填写源IP' },
                          {
                            validator: configSettings.validateIpList,
                          },
                        ],
                      })(
                        <TextArea
                          rows={4}
                          placeholder="支持 192.168.0.1 或 192.168.0.0/24,允许输入多个，以“,”或者换行分隔。支持ipv6格式"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col xs={7} sm={7}>
                    <div className={styles.colLabel}>
                      <span>
                        目的IP{` `}
                        <Tooltip title="如果设置为空，则默认匹配所有值">
                          <QuestionCircleFilled className="fontBlue" />
                        </Tooltip>
                        {` :`}
                      </span>
                    </div>
                  </Col>
                  <Col xs={16} sm={16}>
                    <FormItem extra="源IP和目的IP输入格式要统一为ipv4或ipv6">
                      {getFieldDecorator('dst_ip', {
                        initialValue: editItem.dst_ip || '',
                        validateTrigger: 'onBlur',
                        rules: [
                          // { required: true, message: '请填写目的IP' },
                          {
                            validator: configSettings.validateIpList,
                          },
                        ],
                      })(
                        <TextArea
                          rows={4}
                          placeholder="支持 192.168.0.1 或 192.168.0.0/24,允许输入多个，以“,”或者换行分隔。支持ipv6格式"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator('desc', {
                    initialValue: editItem.desc || '',
                  })(<TextArea rows={4} />)}
                </FormItem>
              </Form>
            </Modal>
          )}
          <UploadTemplate
            title="导入IP白名单"
            cmd="import_whitelist"
            type="whitelist"
            fileFormat="请选择 *.xls，*.xlsx 格式的文件。"
            accept="*.xls;*.xlsx"
            uploadVisible={uploadVisible}
            cancel={this.onCancel}
          />
        </div>
        {eventVisible && (
          <EventRuleModal
            key="eventRule"
            selectedIds={eventID}
            selectedRules={ruleID}
            rwAuth={this.ipAuth}
            visible={eventVisible}
            onCancel={this.eventRuleCancel}
            onSave={this.eventRuleSave}
          />
        )}
        {ruleVisible && (
          <RulesModal
            key="rules"
            selectedIds={ruleID}
            rwAuth={this.ipAuth}
            visible={ruleVisible}
            onCancel={this.rulesCancel}
            onSave={this.rulesSave}
          />
        )}
      </div>
    );
  }
}
const WrappedIpWhitelist = Form.create()(IpWhitelist);
export default WrappedIpWhitelist;
