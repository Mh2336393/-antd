import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { CheckCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import _ from 'lodash';
import { Input, Row, Col, Checkbox, Select, Spin, Button, message, Switch, Radio } from 'antd';
// import moment from 'moment';
import styles from './form.less';
import EventRuleModal from './EventRuleModal';
// import configSettings from '../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
// import handleConfirmIp from '@/tools/ipValidCheck';
import configSettings from '../../configSettings';

/* eslint-disable camelcase */
/* eslint-disable prefer-const */

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

@connect(({ block, global, loading }) => ({
  block,
  hasVpc: global.hasVpc,
  loading: loading.effects['block/fetchBlockModules'],
  // ruleLoading: loading.effects['tacticsInvasion/validateRule'],
}))
class BlockStrategyFormDrawer extends Component {
  constructor(props) {
    super(props);
    this.rwAuth = getAuth('/tactics/blockStrategy');
    this.state = {
      editItem: {},
      isProcessing: false,
      Fstrategy_type: 'alert',
      eventRuleVisible: false,
      Fsignature_id: [], // 规则ID
      Fgid: [], // 事件ID
      xffState: false,
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'block/fetchBlockModules' });
  }

  componentDidMount() {
    const { drawerTitle, drawerObj } = this.props;
    console.log('drawerObj==', drawerObj);
    let editItem = {};
    let FgidState = [];
    let FsignatureIdState = [];
    let FstrategType = 'alert';
    let xffState = false;
    if (drawerTitle === '编辑') {
      const {
        Factivate_time,
        Fupdate_time,
        Fcreator,
        Fgid,
        Fsignature_id,
        Fblocker_name,
        ...other
      } = drawerObj;
      editItem = { ...other };
      editItem.Fblocker_name = Fblocker_name ? Fblocker_name.split(',') : [];
      // `Fgid` '事件ID',
      // `Fsignature_id` '规则ID',
      const FgidStateArr = Fgid ? Fgid.split(',') : [];
      FgidState = FgidStateArr.map((tid) => Number(tid));
      const FsignatureIdStateArr = Fsignature_id ? Fsignature_id.split(',') : [];
      FsignatureIdState = FsignatureIdStateArr.map((tid) => Number(tid));
      FstrategType = editItem.Fstrategy_type;
      xffState = !!drawerObj.Fxff_activated;
    }
    this.setState({
      editItem,
      Fgid: FgidState,
      Fsignature_id: FsignatureIdState,
      Fstrategy_type: FstrategType,
      xffState,
    });
  }

  onOKSave = () => {
    const { drawerTitle, form } = this.props;
    const { Fsignature_id, Fgid, isProcessing, editItem } = this.state;

    form.validateFields((err, values) => {
      console.log(51, values);
      if (!err) {
        if (isProcessing) {
          return;
        }
        this.setState({ isProcessing: true });
        const {
          Fstrategy_type,
          // alertStatus,
          Factivated,
          Fstrategy_name,
          Fblocker_name: blockerNameArr,
          Fioc_activated,
          Fsandbox_activated,
          Fblock_strategy,
          Fxff_activated,
          Fblacklist_src_ip,
          Fblacklist_dst_ip,
        } = values;
        // 指定阻断器去重处理
        const Fblocker_name = [];
        blockerNameArr.forEach((Fid) => {
          if (Fblocker_name.indexOf(Fid) < 0) {
            Fblocker_name.push(Fid);
          }
        });
        let params = {};
        if (Fstrategy_type === 'blacklist') {
          if (!Fblacklist_src_ip && !Fblacklist_dst_ip) {
            message.error('源IP和目的IP不能同时为空');
            this.setState({ isProcessing: false });
            return;
          }
          params = {
            Factivated: Factivated ? 1 : 0,
            Fstrategy_name,
            Fstrategy_type,
            Fblocker_name: Fblocker_name.join(','),
            Fblacklist_src_ip: Fblacklist_src_ip.replace(/\n/g, ','),
            Fblacklist_dst_ip: Fblacklist_dst_ip.replace(/\n/g, ','),
          };
        }
        if (Fstrategy_type === 'alert') {
          if (!Fgid.length && !Fioc_activated && !Fsandbox_activated) {
            message.error(
              '入侵告警阻断、沙箱告警阻断、威胁情报告警阻断不能同时 未开启 或 未添加事件'
            );
            this.setState({ isProcessing: false });
            return;
          }

          // 用户勾选的事件中，存在事件没有规则id的话，Fsignature_id 加个0
          // 目前[100000, 100001, 100002, 100003, 100004, 100005]这些事件id，是没有对应规则id的
          const EidHasNoRule = Fgid.filter(
            (tmpEid) => [100000, 100001, 100002, 100003, 100004, 100005].indexOf(tmpEid) > -1
          );
          const allSid =
            EidHasNoRule.length && Fsignature_id.indexOf(0) < 0
              ? [0].concat(Fsignature_id)
              : Fsignature_id;
          params = {
            Factivated: Factivated ? 1 : 0,
            Fstrategy_name,
            Fstrategy_type,
            Fblocker_name: Fblocker_name.join(','),
            Fioc_activated: Fioc_activated ? 1 : 0,
            Fsandbox_activated: Fsandbox_activated ? 1 : 0,
            Fblock_strategy,
            Fxff_activated: Fxff_activated ? 1 : 0,
            Fsignature_id: allSid.join(','),
            Fgid: Fgid.join(','),
          };
        }
        if (drawerTitle === '编辑') {
          params.Fid = editItem.Fid;
        }
        console.log(91, 'params==', params);
        // 如果是ip黑名单 验证ip是否冲突

        this.onFormSave(params);
      }
    });
  };

  onFormSave = (values) => {
    const { dispatch, drawerTitle, backTablePage } = this.props;
    const mType = drawerTitle === '编辑' ? 'block/updateStrategyList' : 'block/addStrategyList';
    dispatch({ type: mType, payload: { ...values } })
      .then((json) => {
        if (json.error_code === 0) {
          message.success(`${drawerTitle}成功`);
          this.setState({ isProcessing: false }, () => {
            backTablePage();
          });
        } else {
          message.error(`${drawerTitle}失败`);
          this.setState({ isProcessing: false });
        }
      })
      .catch((error) => {
        message.error(error.msg);
        this.setState({ isProcessing: false });
      });
  };

  blackIpValitorDst = (rule, value, callback) => {
    const flag = configSettings.validateThreeIpCate(value, true, false, true);
    if (flag) {
      callback();
    } else {
      callback('ip输入格式不正确！');
    }
  };

  blackIpValitorSrc = (rule, value, callback) => {
    if (value) {
      const flag = configSettings.validateThreeIpCate(value, false, false, true);
      const arr = value.split(/[,\n]/g);
      if (flag) {
        const temp = [];
        for (let i = 0; i < arr.length; i += 1) {
          if (temp.indexOf(arr[i]) < 0) {
            temp.push(arr[i]);
          }
        }
        if (temp.length !== arr.length) {
          callback('存在重复内容，请删除');
        } else {
          callback();
        }
      } else {
        callback('ip格式有误，请重新输入');
      }
    } else {
      callback();
    }
  };

  validateStrategyName = (rule, value, callback) => {
    if (value) {
      const strReg = new RegExp(
        "[`\";\\/!#$^&*=|{}%''\\[\\]<>?！#￥……&*——|{}【】‘；：”“'。，、？]"
      );

      if (strReg.test(value)) {
        callback('名称不能包含“!#$^&*=|{}%”等非法字符');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  validateFtype = (rule, value, callback) => {
    this.setState({ Fstrategy_type: value });
    callback();
  };

  eventRuleCancel = () => {
    this.setState({ eventRuleVisible: false });
  };

  eventRuleSave = (Fsignature_id, eventIds) => {
    // console.log(122, 'Fsignature_id==', Fsignature_id);
    this.setState({ eventRuleVisible: false, Fsignature_id, Fgid: eventIds });
  };

  render() {
    const {
      isProcessing,
      xffState,
      Fstrategy_type,
      eventRuleVisible,
      Fgid,
      Fsignature_id,
      editItem,
    } = this.state;
    const {
      form,
      loading,
      backTablePage,
      block: { blockModules },
    } = this.props;
    const allNames = blockModules.map((obj) => `${obj.Fid}`);

    // 被删除的阻断器，在当前阻断模块中不存在，但是在阻断策略数据中还有
    const { Fblocker_name = [] } = editItem;
    const delBlockerFid = Fblocker_name.filter((fid) => allNames.indexOf(fid) < 0);
    // console.log('Fblocker_name==', Fblocker_name, 'allNames==', allNames, 'delBlockerFid=', delBlockerFid);

    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 14 },
      },
    };

    if (loading) {
      return (
        <div className={styles.loadingStyle}>
          <Spin />
        </div>
      );
    }

    return (
      <div>
        <div>
          <div className={styles.drawerContent}>
            <Form className={styles.warnForm}>
              <Row className={styles.rowBlock}>
                <Col span={4}>
                  <h4 className={styles.title4}>基本信息</h4>
                </Col>
                <Col span={20}>
                  <FormItem {...formItemLayout} label="策略名称">
                    {getFieldDecorator('Fstrategy_name', {
                      initialValue: editItem.Fstrategy_name || '',
                      validateTrigger: 'onBlur',
                      rules: [
                        { required: true, message: '必填' },
                        { max: 128, message: '最多填写128字符，请重新填写' },
                        { validator: this.validateStrategyName },
                      ],
                    })(<Input />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="状态开关">
                    {getFieldDecorator('Factivated', {
                      valuePropName: 'checked',
                      initialValue: editItem.Factivated === 0 ? 0 : 1,
                    })(<Switch checkedChildren="开" unCheckedChildren="关" />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="指定阻断器">
                    {getFieldDecorator('Fblocker_name', {
                      initialValue: editItem.Fblocker_name || allNames,
                      rules: [{ required: true, message: '必选' }],
                    })(
                      <CheckboxGroup>
                        {blockModules.map((item) => (
                          <Checkbox style={{ margin: 0 }} value={`${item.Fid}`}>
                            {item.Fname}
                          </Checkbox>
                        ))}
                        {delBlockerFid.map((fid) => (
                          <Checkbox style={{ margin: 0 }} value={fid}>
                            &nbsp;
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="分类">
                    {getFieldDecorator('Fstrategy_type', {
                      initialValue: editItem.Fstrategy_type || 'alert',
                      rules: [
                        { required: true, message: '必填' },
                        { validator: this.validateFtype },
                      ],
                    })(
                      <RadioGroup>
                        <Radio value="alert">告警阻断</Radio>
                        <Radio value="blacklist">IP黑名单阻断</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </Col>
              </Row>

              <Row className={styles.rowBlock}>
                <Col span={4}>
                  <h4 className={styles.title4}>阻断策略</h4>
                </Col>
                <Col span={20}>
                  {Fstrategy_type === 'alert' && (
                    <Fragment>
                      <FormItem {...formItemLayout} label="入侵告警阻断">
                        {getFieldDecorator('alertStatus', {
                          initialValue: '',
                        })(
                          Fgid.length ? (
                            <div>
                              <CheckCircleFilled style={{ color: '#0e8c4d' }} />
                              <span style={{ marginLeft: '10px' }}>
                                已添加 <span style={{ color: '#0e8c4d' }}>{Fgid.length}</span>{' '}
                                条事件，
                                <span style={{ color: '#0e8c4d' }}>
                                  {Fsignature_id.length}
                                </span>{' '}
                                条规则
                              </span>
                              <a
                                style={{ marginLeft: '10px' }}
                                onClick={() => {
                                  this.setState({ eventRuleVisible: true });
                                  //   setVisible(true);
                                  //   setDrawerTitle('添加告警策略');
                                  //   setCurrChild('rule');
                                }}
                              >
                                编辑
                              </a>
                              <a
                                style={{ marginLeft: '10px' }}
                                onClick={() => {
                                  this.setState({ Fsignature_id: [], Fgid: [] });
                                  //   form.setFieldsValue({ Frule_id: [] });
                                  //   setPickedRules([]);
                                }}
                              >
                                删除
                              </a>
                            </div>
                          ) : (
                            <Button
                              className="smallBlueBtn"
                              onClick={() => {
                                this.setState({ eventRuleVisible: true });
                                // setVisible(true);
                                // setDrawerTitle('添加告警策略');
                                // setCurrChild('rule');
                              }}
                            >
                              添加事件
                            </Button>
                          )
                        )}
                      </FormItem>
                      <FormItem {...formItemLayout} label="沙箱告警阻断">
                        {getFieldDecorator('Fsandbox_activated', {
                          valuePropName: 'checked',
                          initialValue: editItem.Fsandbox_activated === 1 ? 1 : 0,
                        })(<Switch checkedChildren="开" unCheckedChildren="关" />)}
                      </FormItem>
                      <FormItem {...formItemLayout} label="威胁情报告警阻断">
                        {getFieldDecorator('Fioc_activated', {
                          valuePropName: 'checked',
                          initialValue: editItem.Fioc_activated === 1 ? 1 : 0,
                        })(<Switch checkedChildren="开" unCheckedChildren="关" />)}
                      </FormItem>

                      <FormItem {...formItemLayout} label="阻断策略">
                        {getFieldDecorator('Fblock_strategy', {
                          initialValue: editItem.Fblock_strategy || 'attacker',
                        })(
                          <Select>
                            <Option value="attacker">阻断告警攻击者 IP 所有流量（推荐）</Option>
                            <Option value="src">阻断告警源 IP 的所有流量</Option>
                            <Option value="dst">阻断告警目的 IP 的所有流量</Option>
                            <Option value="all">阻断告警中双向 IP 的所有流量</Option>
                          </Select>
                        )}
                      </FormItem>

                      <Row>
                        <Col span={4} />
                        <Col span={14} style={{ position: 'relative' }}>
                          <FormItem>
                            {getFieldDecorator('Fxff_activated', {
                              // initialValue: editItem.Fxff_activated || [],
                              valuePropName: 'checked',
                              initialValue: editItem.Fxff_activated === 1 ? 1 : 0,
                              rules: [
                                // { required: true, message: '请填写目的IP' },
                                {
                                  validator: (rule, value, callback) => {
                                    if (!value) {
                                      this.setState({ xffState: false });
                                    } else {
                                      this.setState({ xffState: true });
                                    }
                                    callback();
                                  },
                                },
                              ],
                            })(
                              // <CheckboxGroup>
                              <Checkbox>阻断XFF中所有的IP流量</Checkbox>
                              // </CheckboxGroup>
                            )}
                          </FormItem>
                          {xffState && (
                            <div style={{ color: '#f00', position: 'absolute', top: '34px' }}>
                              风险提示：可能阻断代理服务器IP地址，请谨慎开启并且添加白名单策略
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Fragment>
                  )}

                  {Fstrategy_type === 'blacklist' && (
                    <Fragment>
                      <FormItem {...formItemLayout} label="源IP">
                        {getFieldDecorator('Fblacklist_src_ip', {
                          initialValue: editItem.Fblacklist_src_ip || '',
                          validateTrigger: 'onBlur',
                          rules: [
                            {
                              validator: this.blackIpValitorSrc,
                            },
                          ],
                        })(
                          <TextArea
                            rows={4}
                            placeholder="支持 192.168.0.1 IPv4格式，支持 2001:0db8:85a3:08d3:1319:8a2e:0370:7344 IPv6格式，允许输入多个，以“,”或者换行分隔"
                          />
                        )}
                      </FormItem>
                      <FormItem {...formItemLayout} label="目的IP">
                        {getFieldDecorator('Fblacklist_dst_ip', {
                          initialValue: editItem.Fblacklist_dst_ip || '',
                          validateTrigger: 'onBlur',
                          rules: [
                            // { required: true, message: '请填写目的IP' },
                            {
                              validator: this.blackIpValitorDst,
                            },
                          ],
                        })(
                          <TextArea
                            rows={4}
                            placeholder="支持 192.168.0.1 或 192.168.0.1:80 ipv4格式，同时支持 2001:0db8:85a3:08d3:1319:8a2e:0370:7344 或 [2001:0db8:85a3:08d3:1319:8a2e:0370:7344]:3306 ipv6格式， 允许输入多个， 以“,”或者换行分隔"
                          />
                        )}
                      </FormItem>
                    </Fragment>
                  )}
                </Col>
              </Row>
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
        </div>
        {eventRuleVisible && (
          <EventRuleModal
            key="eventRule"
            selectedIds={Fgid}
            rwAuth={this.rwAuth}
            visible={eventRuleVisible}
            onCancel={this.eventRuleCancel}
            onSave={this.eventRuleSave}
          />
        )}
      </div>
    );
  }
}

export default Form.create()(BlockStrategyFormDrawer);
