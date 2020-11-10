/* eslint-disable no-prototype-builtins */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import { connect } from 'umi';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Spin,
  Checkbox,
  Row,
  Col,
  Input,
  InputNumber,
  Select,
  Tooltip,
  Button,
  message,
  Table,
} from 'antd';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import configSettings from '../../configSettings';
import styles from './form.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

/* eslint-disable camelcase */
const FormItem = Form.Item;
const { Option } = Select;
const tiTags = configSettings.alertRuleCategory;

const oldBlastingConfigData = [
  {
    enabled: false,
    protocolType: 'ssh',
    timeWindow: 60,
    thresholdValue: 1,
  },
  {
    enabled: false,
    protocolType: 'rdp',
    timeWindow: 60,
    thresholdValue: 1,
  },
  {
    enabled: false,
    protocolType: 'ftp',
    timeWindow: 60,
    thresholdValue: 1,
  },
  {
    enabled: false,
    protocolType: 'pop',
    timeWindow: 60,
    thresholdValue: 1,
  },
  {
    enabled: false,
    protocolType: 'smtp',
    timeWindow: 60,
    thresholdValue: 1,
  },
  {
    enabled: false,
    protocolType: 'imap',
    timeWindow: 60,
    thresholdValue: 1,
  },
  {
    enabled: false,
    protocolType: 'http',
    timeWindow: 60,
    thresholdValue: 1,
  },
  {
    enabled: false,
    protocolType: 'mysql',
    timeWindow: 60,
    thresholdValue: 1,
  },
  {
    enabled: false,
    protocolType: 'telnet',
    timeWindow: 60,
    thresholdValue: 1,
  },
];
@connect(({ tacticsInvasion, global, loading }) => ({
  tacticsInvasion,
  hasVpc: global.hasVpc,
  loading: loading.effects['tacticsInvasion/fetchEditInfo'],
}))
/**
 * 御界自带的规则详情（eid100000+显示 都属于插件告警）
 */
class ScanModalDrawer extends Component {
  constructor(props) {
    super(props);
    this.rwAuth = getAuth('/tactics/invasion');
    this.state = {
      isDisable: true,
      isProcessing: false,
      eid: 0,
      blastingConfigData: [],
    };
    this.blastingConfigColumns = [
      {
        title: '启用',
        dataIndex: 'enabled',
        key: 'enabled',
        render: (text, record, index) => (
          <Checkbox
            onChange={(e) => {
              this.blastingConfigEnabledChange(e, index);
            }}
            checked={text}
          />
        ),
      },
      {
        title: '协议',
        dataIndex: 'protocolType',
        key: 'protocolType',
        render: (text) => <span>{text}</span>,
      },
      {
        title: '时间窗口（单位：秒）',
        dataIndex: 'timeWindow',
        key: 'timeWindow',
        render: (text, record, index) => (
          <InputNumber
            min={60}
            max={300}
            defaultValue={text}
            onChange={(value) => {
              this.blastingConfigTimeWindowChange(value, index);
            }}
          />
        ),
      },
      {
        title: '阈值（1-1000次）',
        dataIndex: 'thresholdValue',
        key: 'thresholdValue',
        render: (text, record, index) => (
          <InputNumber
            min={1}
            max={1000}
            defaultValue={text}
            onChange={(value) => {
              this.blastingConfigThresholdValueChange(value, index);
            }}
          />
        ),
      },
    ];
    this.debouncedHandleBlastingConfigTimeWindowBeyondTheLimit = debounce(
      this.blastingConfigTimeWindowBeyondTheLimit,
      1000
    );
    this.debouncedHandleBlastingConfigThresholdValueBeyondTheLimit = debounce(
      this.blastingConfigThresholdValueBeyondTheLimit,
      1000
    );
  }

  componentWillMount() {
    const { dispatch, drawerObj } = this.props;
    // console.log(1111, 'drawerObj=', drawerObj);
    let eid;
    let author;
    if (drawerObj.eid && drawerObj.author) {
      eid = Number(drawerObj.eid);
      author = drawerObj.author || '';
    }
    if (eid && author) {
      const reqObj = {
        id: eid,
        isUser: author === 'USER' ? 'yes' : 'no',
      };
      dispatch({
        type: 'tacticsInvasion/fetchEditInfo',
        payload: reqObj,
      }).then(() => {
        const {
          tacticsInvasion: { editInfo },
        } = this.props;
        let isDisable = true;
        if (editInfo.merge_switch) {
          isDisable = false;
        }
        this.setState({ isDisable, eid });

        if (drawerObj.eid === 100003) {
          // 组合blastingConfigData数据
          let { alert_config: alertConfig } = editInfo;
          alertConfig = JSON.parse(alertConfig);
          if (alertConfig) {
            // {"confidence":3,"ssh":"true,60,100","rdp":"false,60,100"....}
            let blastingConfigData = cloneDeep(oldBlastingConfigData);
            blastingConfigData = blastingConfigData.map((item) => {
              if (alertConfig.hasOwnProperty(item.protocolType)) {
                const info = alertConfig[item.protocolType].split(',');
                item.enabled = JSON.parse(info[0]);
                item.timeWindow = info[1];
                item.thresholdValue = info[2];
              }
              return item;
            });
            this.setState({ blastingConfigData });
          } else {
            this.setState({
              blastingConfigData: cloneDeep(oldBlastingConfigData),
            });
          }
        }
      });
    }
  }

  onOKSave = () => {
    const {
      form,
      tacticsInvasion: { editInfo: editItem },
    } = this.props;
    const { isProcessing, eid, blastingConfigData } = this.state;
    // const { reqing } = this.state;
    form.validateFields((err, values) => {
      // console.log(11234, 'values===', values, 'err==', err);
      if (!err) {
        if (isProcessing) return;
        this.setState({ isProcessing: true });
        const scanShow = eid === 100000 || eid === 100001 || eid === 100002;
        const bruteShow = eid === 100003;

        const {
          merge_minute,
          merge_field,
          mergeTime,
          merge_switch,
          port_list,
          portscan_limit,
          ipscan_limit,
          ipscan_num,
          timeout,
          portscan_num,
          score,
        } = values;
        const params = {
          // name,
          // category,
          // level,
          // process_suggest,
          // description,
        };

        const minuteVal = mergeTime === 'h' ? Number(merge_minute) * 60 : Number(merge_minute);
        const method = {
          minute: minuteVal,
          field: merge_field === 'rule_id' || merge_field === '' ? [] : merge_field.split(','),
        };
        params.merge_method = JSON.stringify(method);
        params.merge_switch = Number(merge_switch);
        params.score = score;

        const config = {};

        // 扫描配置
        if (scanShow) {
          config.timeout = timeout;
          if (editItem.id === 100001 || editItem.id === 100002) {
            // 端口
            config.port_num = portscan_num;
            config.silence = portscan_limit;
            // config.proto = proto;
          }
          if (editItem.id === 100000) {
            // ip
            config.ip_num = ipscan_num;
            config.silence = ipscan_limit;
            const portListtmp = port_list ? port_list.split(',') : [];
            config.ports = portListtmp.map((portNum) => Number(portNum));
          }
        }
        // 爆破配置
        if (bruteShow) {
          // {"confidence":3,"ssh":"true,60,100","rdp":"false,60,100"....}
          blastingConfigData.forEach((item) => {
            config[item.protocolType] = `${item.enabled},${item.timeWindow},${item.thresholdValue}`;
          });
        }

        // 是否是插件告警
        const confidence = form.getFieldValue('confidence');
        config.confidence = Number(confidence);
        params.alert_config = JSON.stringify(config);

        if (editItem.id) {
          params.id = editItem.id;
          params.author = editItem.author;
          params.editArr = [];
          params.delArr = [];
        } else {
          params.enable = 1;
        }
        this.onFormSave(params);
      }
    });
  };

  onFormSave = (values) => {
    const { dispatch, backTablePage } = this.props;
    let obj = values;
    const curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    let successTip = '编辑成功，点击下发所有探针生效';
    if (!values.id) {
      successTip = '新建成功，点击下发所有探针生效';
      obj = Object.assign({}, values, { author: 'USER', update_time: curTime });
    }

    dispatch({ type: 'tacticsInvasion/addEditHandleEvent', payload: { obj, modalTitle: '编辑' } })
      .then(() => {
        message.success(successTip);
        this.setState({ isProcessing: false }, () => {
          backTablePage();
        });
      })
      .catch((error) => {
        message.error(error.msg);
        this.setState({ isProcessing: false });
      });
  };

  // 扫描端口范围
  validatePortRange = (rule, value, callback) => {
    // console.log('端口范围 value==', value);
    if (value) {
      const arr = value.split(',');
      if (arr.length <= 100) {
        const flag = [];
        const sigleArr = [];
        arr.forEach((portVal) => {
          const iFlag = configSettings.isPort(portVal);
          flag.push(iFlag);
          if (sigleArr.indexOf(portVal) < 0) {
            sigleArr.push(portVal);
          }
        });
        if (flag.indexOf(false) > -1) {
          callback('端口格式有误');
        } else if (arr.length !== sigleArr.length) {
          callback('有重复端口，请移除');
        } else {
          callback();
        }
      } else {
        callback('最多允许输入100个端口');
      }
    } else {
      callback();
    }
  };

  afterSelector = (defaultVal) => {
    const { isDisable } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;
    return getFieldDecorator('mergeTime', {
      initialValue: defaultVal || 'h',
    })(
      <Select style={{ width: 70 }} disabled={isDisable}>
        <Option value="s">分</Option>
        <Option value="h">时</Option>
      </Select>
    );
  };

  switchSelectChange = (value) => {
    const { form } = this.props;
    const minuteVal = form.getFieldValue('merge_minute');
    const minutNum = Number(minuteVal);
    if (value === 0) {
      this.setState({ isDisable: true });
      if (!minutNum) {
        form.setFieldsValue({
          merge_minute: 0,
        });
      }
    } else {
      this.setState({ isDisable: false });
      if (!minutNum) {
        form.setFieldsValue({
          merge_minute: 1,
        });
      }
    }
  };

  // 表单验证
  validateMInute = (rule, value, callback) => {
    const { form } = this.props;
    const switchVal = form.getFieldValue('merge_switch');
    if (switchVal === 1 || switchVal === '1') {
      try {
        const reg = /^[0-9]+$/;
        const numState = reg.test(value);
        const numFlag = numState && Number(value) >= 1 && Number(value) <= 999;
        if (!numFlag) {
          throw new Error('请填写1~999的数值');
        } else {
          callback();
        }
      } catch (e) {
        callback(e.message);
      }
    } else {
      try {
        const reg2 = /^[0-9]+$/;
        const numState2 = reg2.test(value);
        if (!numState2) {
          throw new Error('请填写数值');
        } else {
          callback();
        }
      } catch (e) {
        callback(e.message);
      }
    }
  };

  validateScore = (rule, value, callback) => {
    // console.log('value==', value);
    if (value !== '') {
      const reg = /^[0-9]+$/;
      const numState = reg.test(value);
      const numFlag = numState && Number(value) >= 1 && Number(value) <= 100;
      if (!numFlag) {
        callback('请填写1~100的数值');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  validateRuleName = (rule, value, callback) => {
    if (value) {
      const regStr = new RegExp("[`~!#$^&*=|{}''\\[\\]<>?~！#￥……&*——|{}【】‘；：”“'。，、？]");
      const flag = regStr.test(value);
      if (flag) {
        callback('不允许输入“#【】‘；：￥……&*——|{}”等非法字符');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  fieldShowVal = (val) => {
    let name = '事件';
    if (val === 'src_ip') {
      name = '事件，源IP，VPCID';
    }
    if (val === 'dst_ip') {
      name = '事件，目的IP，VPCID';
    }
    if (val === 'src_ip,dst_ip') {
      name = '事件，源IP，目的IP，VPCID';
    }
    if (val === 'src_ip,src_port') {
      name = '事件，源IP，源端口，VPCID';
    }
    if (val === 'dst_ip,dst_port') {
      name = '事件，目的IP，目的端口，VPCID';
    }
    if (val === 'src_ip,src_port,dst_ip,dst_port') {
      name = '事件，源IP，源端口，目的IP，目的端口，VPCID';
    }
    return name;
  };

  // 验证置信度
  validateConfidence = (rule, value, callback) => {
    const reg = /^[0-5]{1}$/;
    const numState = reg.test(value);
    if (!numState) {
      callback('置信度必填');
    } else {
      callback();
    }
  };

  // 置信度进行选择得时候
  selectConfidenceChange = (value) => {
    const { form } = this.props;
    form.setFieldsValue({
      confidence: value,
    });
  };

  // 爆破配置启用状态改变
  blastingConfigEnabledChange = (e, index) => {
    const { blastingConfigData } = this.state;
    blastingConfigData[index].enabled = e.target.checked;
    this.setState({
      blastingConfigData,
    });
  };

  // 爆破配置时间窗口改变
  blastingConfigTimeWindowChange = (value, index) => {
    if (value < 60 || value > 300) {
      this.debouncedHandleBlastingConfigTimeWindowBeyondTheLimit();
    } else {
      this.debouncedHandleBlastingConfigTimeWindowBeyondTheLimit.cancel();
    }
    const { blastingConfigData } = this.state;
    blastingConfigData[index].timeWindow = value;
    this.setState({
      blastingConfigData,
    });
  };

  blastingConfigTimeWindowBeyondTheLimit = () => {
    message.warn('时间窗口限制范围为60-300秒！');
  };

  // 爆破配置阈值改变
  blastingConfigThresholdValueChange = (value, index) => {
    if (value < 1 || value > 1000) {
      this.debouncedHandleBlastingConfigThresholdValueBeyondTheLimit();
    } else {
      this.debouncedHandleBlastingConfigThresholdValueBeyondTheLimit.cancel();
    }
    const { blastingConfigData } = this.state;
    blastingConfigData[index].thresholdValue = value;
    this.setState({
      blastingConfigData,
    });
  };

  blastingConfigThresholdValueBeyondTheLimit = () => {
    message.warn('阈值限制范围为1-1000秒！');
  };

  render() {
    const { isDisable, isProcessing, eid, blastingConfigData } = this.state;
    const { form, loading, tacticsInvasion, hasVpc, drawerObj, backTablePage } = this.props;
    const { editInfo } = tacticsInvasion;
    const editItem = drawerObj.eid ? editInfo : {};
    console.log('eid=', eid, 'editItem==', editItem);
    const scanShow = eid === 100000 || eid === 100001 || eid === 100002;
    const bruteShow = eid === 100003;

    let getRule = {};

    let portShow = false; // 端口扫描
    if (editItem && (editItem.id === 100001 || editItem.id === 100002)) {
      portShow = true;
      getRule = {
        timeout: 60,
        port_num: 100,
        silence: 300,
      };
    }
    let ipShow = false; // ip扫描
    if (editItem && editItem.id === 100000) {
      ipShow = true;
      getRule = {
        timeout: 60,
        ip_num: 100,
        silence: 300,
        ports: [],
      };
    }

    if (editItem.alert_config) {
      getRule = JSON.parse(editItem.alert_config);
    }
    const portsIni = getRule.ports ? getRule.ports.join(',') : '';
    const confidence = Number(getRule.confidence) >= 0 ? Number(getRule.confidence) : 3;

    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 14 },
      },
    };

    const tagsObj = {};
    tiTags.forEach((tmp) => {
      tagsObj[tmp.value] = tmp.name;
    });

    const scoreObj = configSettings.scoreColorMap(Number(editItem.score));
    editItem.score = scoreObj.ruleSoce;

    const tiCategoryInitialValue = tiTags[0] ? '' : tiTags[0].value;
    const method = editItem.merge_method
      ? JSON.parse(editItem.merge_method)
      : { minute: 120, field: '' };

    let fieldVal = '';
    if (method) {
      if (method.field) {
        fieldVal = method.field.join(',');
      }
    }

    let minuteVal = 2;
    let timeInitialValue = 'h';
    if (method && method.minute) {
      if (method.minute % 60 !== 0) {
        minuteVal = method.minute;
        timeInitialValue = 's';
      } else {
        minuteVal = method.minute / 60;
      }
    }

    const switchVal = editItem.merge_switch || 0;

    if (loading) {
      return (
        <div className={styles.loadingStyle}>
          <Spin />
        </div>
      );
    }
    return (
      <div className={styles.drawerContent}>
        <Form className={styles.warnForm}>
          <Row className={styles.rowBlock}>
            <Col span={4}>
              <h4 className={styles.title4}>事件信息</h4>
            </Col>
            <Col span={20}>
              <FormItem {...formItemLayout} label="事件名称" extra="">
                {getFieldDecorator('name', {
                  // initialValue: editItem.name || '',
                  // validateTrigger: 'onBlur',
                  // rules: [
                  //     {
                  //         required: true,
                  //         message: '必填',
                  //     },
                  //     { max: 64, message: '最多填写64字符，请重新填写' },
                  //     // {
                  //     //   validator: this.validateRuleName,
                  //     // },
                  // ],
                })(
                  // <Input />
                  <span className={styles.spanInput}>{editItem.name || '暂无'}</span>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="分类">
                {getFieldDecorator('category', {
                  initialValue: editItem.category || tiCategoryInitialValue,
                })(
                  <span className={styles.spanInput}>
                    {tagsObj[`${editItem.category || tiCategoryInitialValue}`] || '暂无'}
                  </span>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="子类">
                {getFieldDecorator('sub_category', {
                  initialValue: editItem.sub_category || '',
                })(<span className={styles.spanInput}>{editItem.sub_category || '暂无'}</span>)}
              </FormItem>
              <FormItem {...formItemLayout} label="事件级别" extra="">
                {getFieldDecorator('score', {
                  initialValue: editItem.score,
                })(
                  <Select>
                    <Option value={0}>自动计算</Option>
                    <Option value={100}>严重（100）</Option>
                    <Option value={80}>高危（80）</Option>
                    <Option value={60}>中危（60）</Option>
                    <Option value={40}>低危（40）</Option>
                    <Option value={20}>信息（20）</Option>
                  </Select>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="事件描述" extra="">
                {getFieldDecorator('description', {
                  initialValue: editItem.description || '',
                  rules: [{ max: 2048, message: '最多填写2048字符，请重新填写' }],
                })(
                  // <Input.TextArea style={{ height: 100 }} />
                  <span className={styles.spanInput}>{editItem.description || '暂无'}</span>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="处置建议" extra="">
                {getFieldDecorator('process_suggest', {
                  initialValue: editItem.process_suggest || '',
                  rules: [{ max: 2048, message: '最多填写2048字符，请重新填写' }],
                })(
                  // <Input.TextArea style={{ height: 100 }} />
                  <span className={styles.spanInput}>{editItem.process_suggest || '暂无'}</span>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="归并策略" extra="">
                {getFieldDecorator('merge_switch', {
                  initialValue: switchVal,
                })(
                  <Select onChange={this.switchSelectChange}>
                    <Option key="1" value={1}>
                      内置策略
                    </Option>
                    <Option key="0" value={0}>
                      全局策略
                    </Option>
                  </Select>
                  // <span className={styles.spanInput}>{switchVal === '1' ? '内置策略' : '全局策略'}</span>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="归并字段" extra="">
                {getFieldDecorator('merge_field', {
                  initialValue: fieldVal || '',
                })(
                  <Select mode="" disabled={isDisable}>
                    <Option key="rule_id" value="">
                      事件
                    </Option>
                    <Option key="src_ip" value="src_ip">
                      {hasVpc ? '事件，源IP，VPCID' : '事件，源IP'}
                    </Option>
                    <Option key="dst_ip" value="dst_ip">
                      {hasVpc ? '事件，目的IP，VPCID' : '事件，目的IP'}
                    </Option>
                    <Option key="src_ip,dst_ip" value="src_ip,dst_ip">
                      {hasVpc ? '事件，源IP，目的IP，VPCID' : '事件，源IP，目的IP'}
                    </Option>
                    <Option key="src_ip,src_port" value="src_ip,src_port">
                      {hasVpc ? '事件，源IP，源端口，VPCID' : '事件，源IP，源端口'}
                    </Option>
                    <Option key="dst_ip,dst_port" value="dst_ip,dst_port">
                      {hasVpc ? '事件，目的IP，目的端口，VPCID' : '事件，目的IP，目的端口'}
                    </Option>
                    <Option
                      key="src_ip,src_port,dst_ip,dst_port"
                      value="src_ip,src_port,dst_ip,dst_port"
                    >
                      {hasVpc
                        ? '事件，源IP，源端口，目的IP，目的端口，VPCID'
                        : '事件，源IP，源端口，目的IP，目的端口'}
                    </Option>
                  </Select>
                  // <span className={styles.spanInput}>{this.fieldShowVal(fieldVal || '')}</span>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="归并时长" extra="">
                {getFieldDecorator('merge_minute', {
                  initialValue: `${minuteVal}`,
                  rules: [
                    // {
                    //     required: true,
                    //     message: '必填',
                    // },
                    {
                      validator: this.validateMInute,
                    },
                  ],
                })(
                  <Input
                    placeholder="请填写1~999的数值"
                    addonAfter={this.afterSelector(timeInitialValue)}
                    disabled={isDisable}
                  />
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="置信度" extra="">
                {getFieldDecorator('confidence', {
                  initialValue: confidence,
                  rules: [
                    {
                      required: true,
                      message: '置信度必填',
                    },
                    {
                      validator: this.validateConfidence,
                    },
                  ],
                })(
                  <Select onChange={this.selectConfidenceChange}>
                    {configSettings.confidenceOpetion.map((item) => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>

          {scanShow && (
            <Row className={styles.rowBlock}>
              <Col span={4}>
                <h4 className={styles.title4}>扫描配置</h4>
              </Col>
              <Col span={20}>
                <Row>
                  <Col xs={5} sm={5}>
                    <div className={styles.colLabel}>
                      <span>
                        <b className={styles.mustStar}>*</b>
                        统计时长
                        {` `}
                        <Tooltip title="设定统计时间窗口。统计时长有效区间为 [60, 300]。">
                          <QuestionCircleFilled className="fontBlue" />
                        </Tooltip>
                        {` : `}
                      </span>
                    </div>
                  </Col>
                  <Col xs={14} sm={14}>
                    <FormItem>
                      {getFieldDecorator('timeout', {
                        initialValue: getRule.timeout || 0,
                        rules: [
                          {
                            required: true,
                            message: '必填',
                          },
                          // { max: 32, message: '最多填写32字符，请重新填写' },
                          // {
                          //   validator: this.validateRuleName,
                          // },
                        ],
                      })(
                        <InputNumber
                          min={1}
                          max={43200}
                          formatter={(value) => value}
                          parser={(value) => value.replace(/[,.$@]/g, '')}
                          style={{ width: '100%' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col xs={5} sm={5}>
                    <div className={styles.fontLabel}>秒</div>
                  </Col>
                </Row>
                {ipShow && (
                  <Row>
                    <Col xs={5} sm={5}>
                      <div className={styles.colLabel}>
                        <span>
                          <b className={styles.mustStar}>*</b>
                          IP扫描阈值
                          {` `}
                          <Tooltip title="检测1个IP对多个IP发起的扫描行为，到达阈值后触发告警，设置为0关闭IP扫描检测。">
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                          {` : `}
                        </span>
                      </div>
                    </Col>
                    <Col xs={14} sm={14}>
                      <FormItem>
                        {getFieldDecorator('ipscan_num', {
                          initialValue: getRule.ip_num || 0,
                          // validateTrigger: 'onBlur',
                          rules: [
                            {
                              required: true,
                              message: '必填',
                            },
                            // {
                            //   validator: this.validateIpPortLimit,
                            // },
                          ],
                        })(
                          <InputNumber
                            min={0}
                            max={65535}
                            formatter={(value) => value}
                            parser={(value) => value.replace(/[,.$@]/g, '')}
                            style={{ width: '100%' }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col xs={5} sm={5}>
                      <div className={styles.fontLabel}>达到该阈值触发告警</div>
                    </Col>
                  </Row>
                )}

                {portShow && (
                  <Row>
                    <Col xs={5} sm={5}>
                      <div className={styles.colLabel}>
                        <span>
                          <b className={styles.mustStar}>*</b>
                          端口扫描阈值
                          {` `}
                          <Tooltip title="检测针对1个IP发起的端口扫描行为，到达访问阈值后触发告警，设置为0关闭端口扫描检测。">
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                          {` : `}
                        </span>
                      </div>
                    </Col>
                    <Col xs={14} sm={14}>
                      <FormItem>
                        {getFieldDecorator('portscan_num', {
                          initialValue: getRule.port_num || 0,
                          // validateTrigger: 'onBlur',
                          rules: [
                            {
                              required: true,
                              message: '必填',
                            },
                            // {
                            //   validator: this.validateIpPortLimit,
                            // },
                          ],
                        })(
                          <InputNumber
                            min={0}
                            max={65535}
                            formatter={(value) => value}
                            parser={(value) => value.replace(/[,.$@]/g, '')}
                            style={{ width: '100%' }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col xs={5} sm={5}>
                      <div className={styles.fontLabel}>达到该阈值触发告警</div>
                    </Col>
                  </Row>
                )}

                {ipShow && (
                  <Row>
                    <Col xs={5} sm={5}>
                      <div className={styles.colLabel}>
                        <span>
                          IP扫描后触发静默
                          {` `}
                          <Tooltip title="IP扫描若被触发，该规则将在配置时间段内不生效，以防止告警风暴">
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                          {` : `}
                        </span>
                      </div>
                    </Col>
                    <Col xs={14} sm={14}>
                      <FormItem>
                        {getFieldDecorator('ipscan_limit', {
                          initialValue: getRule.silence || 0,
                        })(
                          <InputNumber
                            min={0}
                            max={65535}
                            formatter={(value) => value}
                            parser={(value) => value.replace(/[,.$@]/g, '')}
                            style={{ width: '100%' }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col xs={5} sm={5}>
                      <div className={styles.fontLabel}>秒</div>
                    </Col>
                  </Row>
                )}

                {ipShow && (
                  <Row>
                    <Col xs={5} sm={5}>
                      <div className={styles.colLabel}>
                        <span>
                          {/* <b className={styles.mustStar}>*</b> */}
                          IP扫描端口配置
                          {` `}
                          <Tooltip title="指定IP扫描关注的端口号，格式为port1,port2，如果未定义，则对所有端口生效。">
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                          {` : `}
                        </span>
                      </div>
                    </Col>
                    <Col xs={14} sm={14}>
                      <FormItem extra="支持输入多个以“,”分隔；若为空则对所有端口生效">
                        {getFieldDecorator('port_list', {
                          initialValue: portsIni || '',
                          validateTrigger: 'onBlur',
                          rules: [
                            {
                              validator: this.validatePortRange,
                            },
                          ],
                        })(<Input.TextArea style={{ height: 100 }} />)}
                      </FormItem>
                    </Col>
                  </Row>
                )}
                {portShow && (
                  <Row>
                    <Col xs={5} sm={5}>
                      <div className={styles.colLabel}>
                        <span>
                          端口扫描后触发静默
                          {` `}
                          <Tooltip title="端口扫描若被触发，该规则将在配置时间段内不生效，以防止告警风暴">
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                          {` : `}
                        </span>
                      </div>
                    </Col>
                    <Col xs={14} sm={14}>
                      <FormItem>
                        {getFieldDecorator('portscan_limit', {
                          initialValue: getRule.silence || 0,
                        })(
                          <InputNumber
                            min={0}
                            max={65535}
                            formatter={(value) => value}
                            parser={(value) => value.replace(/[,.$@]/g, '')}
                            style={{ width: '100%' }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col xs={5} sm={5}>
                      <div className={styles.fontLabel}>秒</div>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
          )}

          {bruteShow && (
            <div>
              <Row className={styles.rowBlock}>
                <Col span={4}>
                  <h4 className={styles.title4}>爆破配置</h4>
                </Col>
                <Col span={20}>
                  <Table
                    className="ant-col-xs-19 ant-col-sm-19"
                    columns={this.blastingConfigColumns}
                    dataSource={blastingConfigData}
                    rowKey="protocolType"
                    pagination={false}
                  />
                </Col>
              </Row>
            </div>
          )}

          <Row>
            <Col span={4} />
            <Col span={20}>
              <Row>
                <Col xs={4} sm={4} />
                {this.rwAuth === 'rw' && (
                  <Col xs={14} sm={14}>
                    <Button
                      style={{ marginRight: 20 }}
                      onClick={() => {
                        // this.goBack();
                        backTablePage();
                      }}
                    >
                      取消
                    </Button>
                    <Button type="primary" onClick={this.onOKSave} loading={isProcessing}>
                      保存
                    </Button>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default Form.create()(ScanModalDrawer);
