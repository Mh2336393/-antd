import React, { Component } from 'react';
import { connect } from 'umi';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import _ from 'lodash';
import { Input, Row, Col, Spin, Button, message, Radio, Tooltip } from 'antd';
// import moment from 'moment';
import styles from './index.less';
// import EventRuleModal from './EventRuleModal';
import configSettings from '../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;

/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-const */

const FormItem = Form.Item;
const { TextArea } = Input;
// const { Option } = Select;
const RadioGroup = Radio.Group;
// const CheckboxGroup = Checkbox.Group;

@connect(({ ccsConfig, loading }) => ({
  ccsConfig,
  loading: loading.effects['ccsConfig/fetchConfigList'],
}))
class CcsConfigFormDrawer extends Component {
  constructor(props) {
    super(props);
    this.rwAuth = getAuth('/systemSetting/ccsConfig');
    this.state = {
      curIp: '',
      editItem: {},
      subArr: [],
      curCcsRole: '',
      isProcessing: false,
      linkObj: {},
    };
  }

  componentDidMount() {
    const {
      drawerObj,
      ccsConfig: { healthObj },
    } = this.props;
    const { curCcsRole = '', subArr = [] } = drawerObj;
    const newSubArr = subArr.length
      ? subArr
      : [
          {
            sub_ipPort: '',
            sub_ipName: '',
            sub_location: '',
            sub_remarks: '',
          },
        ];
    const curIp = drawerObj.curIpPort.split(':')[0];
    // console.log('编辑页 healthObj=', drawerObj.curIpPort, 'curIp==', curIp);
    this.setState({
      editItem: drawerObj,
      subArr: newSubArr,
      curCcsRole,
      linkObj: healthObj,
      curIp,
    });
  }

  onOKSave = () => {
    const { form, dispatch, drawerObj } = this.props;
    const { subArr, isProcessing, linkObj } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        if (isProcessing) {
          return;
        }
        this.setState({ isProcessing: true });
        // 如果是最初没有任何设置的时候，"devid" 这个参数不需要传
        const { devid = '', curCcsRole = '' } = drawerObj;
        const { curIpPort, ipName, location, remarks } = values;
        const params = {
          // "cmd": "put_ccs_info",
          devid,
          devname: ipName,
          my_role: curCcsRole !== 'sub' ? 'leader' : 'sub',
          leader: curIpPort,
          // "subs": { "yujie-ccs-2": { "address": "10.0.1.47:8084", "location": "bbbbbbbbbb", "remarks": "111111111" }, "yujie-ccs-3": { "address": "10.0.1.48:8084", "location": "ccccccccccccc", "remarks": "2222222222" } },
          location,
          remarks,
        };
        const subs = {};
        const notLinkIps = [];
        const ipNames = [ipName];
        const singleNames = [ipName];
        subArr.forEach((bobj, bidx) => {
          if (bobj) {
            const sub_ipPort = form.getFieldValue(`sub_ipPort_${bidx}`);
            const sub_ipName = form.getFieldValue(`sub_ipName_${bidx}`);
            const sub_location = form.getFieldValue(`sub_location_${bidx}`);
            const sub_remarks = form.getFieldValue(`sub_remarks_${bidx}`);
            if (!linkObj[sub_ipPort]) {
              notLinkIps.push(sub_ipPort);
            }
            ipNames.push(sub_ipName);
            if (singleNames.indexOf(sub_ipName) < 0) {
              singleNames.push(sub_ipName);
            }
            subs[sub_ipName] = {
              address: sub_ipPort,
              location: sub_location,
              remarks: sub_remarks,
            };
          }
        });

        if (singleNames.length !== ipNames.length) {
          message.error('设备名称不允许重复，请修改重复的设备名称');
          this.setState({ isProcessing: false });
          return;
        }

        if (notLinkIps.length) {
          message.error(`设备地址：${notLinkIps.join('、')} 未联通，请测试联通性 或 重新输入地址`);
          this.setState({ isProcessing: false });
          return;
        }
        params.subs = subs;
        console.log(77, 'params==', params);
        this.onFormSave(params);
      }
    });
  };

  onFormSave = (values) => {
    // 初始状态没有devid的，首次创建不需要传devid，
    // 后面都会有上级的id，所以变更操作必须带上当前节点的devid，否则不认这个操作的
    const { dispatch, backTablePage } = this.props;
    dispatch({ type: 'ccsConfig/editConfig', payload: { ...values } })
      .then((json) => {
        if (json.error_code === 0) {
          message.success('分级配置保存成功');
          this.setState({ isProcessing: false }, () => {
            backTablePage();
          });
        } else {
          message.error(json.msg || '分级配置保存失败');
          this.setState({ isProcessing: false });
        }
      })
      .catch((error) => {
        message.error(error.msg);
        this.setState({ isProcessing: false });
      });
  };

  // validateStrategyName = (rule, value, callback) => {
  //   if (value) {
  //     const strReg = new RegExp("[`\";\\/!#$^&*=|{}%''\\[\\]<>?！#￥……&*——|{}【】‘；：”“'。，、？]");

  //     if (strReg.test(value)) {
  //       callback('名称不能包含“!#$^&*=|{}%”等非法字符');
  //     } else {
  //       callback();
  //     }
  //   } else {
  //     callback();
  //   }
  // };

  changeRole = (rule, value, callback) => {
    this.setState({ curCcsRole: value });
    callback();
  };

  validateIpPort = (rule, value, callback) => {
    const {
      editItem: { curIpPort = '' },
    } = this.state;
    const curIp = curIpPort.split(':')[0];
    const valueFlag = configSettings.validateCcsAddr(value);
    if (value && !valueFlag) {
      callback('地址格式有误，请重新输入');
    } else if (value.indexOf('localhost') > -1) {
      callback('下级地址ip不能是localhost');
    } else if (value.indexOf('127.0.0.1') > -1) {
      callback('下级地址ip不能是127.0.0.1');
    } else if (value.indexOf(curIp) > -1) {
      callback('下级地址ip不能是当前地址ip');
    } else {
      callback();
    }
  };

  testLink = (bidx) => {
    const { linkObj } = this.state;
    const { form, dispatch } = this.props;
    const sub_ipPort = form.getFieldValue(`sub_ipPort_${bidx}`);
    // const sub_ipName = form.getFieldValue(`sub_ipName_${bidx}`);
    // const sub_location = form.getFieldValue(`sub_location_${bidx}`);
    // const sub_remarks = form.getFieldValue(`sub_remarks_${bidx}`);

    dispatch({
      type: 'ccsConfig/ccsLinkTest',
      payload: { host_port: sub_ipPort },
    })
      .then((json) => {
        const { data = {} } = json;
        if (data.is_alive === true) {
          linkObj[sub_ipPort] = 'alive';
          message.success('成功联通');
          this.setState({ linkObj });
        } else {
          linkObj[sub_ipPort] = '';
          message.error(json.msg || '无法联通，请重新输入地址');
          this.setState({ linkObj });
        }
      })
      .catch((err) => {
        linkObj[sub_ipPort] = '';
        message.error(`无法联通：请先检查下级地址是否已对 当前地址ip 开放8084等端口`);
        this.setState({ linkObj });
      });
  };

  delSubArr = (index) => {
    // const { form } = this.props;
    // const Fname = form.getFieldValue(`Fname_${index}`);
    const { subArr } = this.state;
    delete subArr[index];
    this.setState({ subArr });
    // message.warn(`删除：${Fname}`);
  };

  addSubArr = () => {
    const { subArr } = this.state;
    // const realBlocks = blocks.filter(obj => !!obj);
    // const top = realBlocks.length * 370 + 200;
    subArr.push({
      sub_ipPort: '',
      sub_ipName: '',
      sub_location: '',
      sub_remarks: '',
    });
    this.setState({ subArr });
    // this.setState({ blocks }, () => {
    //   if (document.documentElement) {
    //     document.documentElement.scrollTop = Number(top);
    //   } else if (document.body) {
    //     document.body.scrollTop = Number(top);
    //   }
    // });
  };

  render() {
    const { isProcessing, subArr, editItem, curCcsRole, curIp } = this.state;
    const { form, loading, backTablePage } = this.props;

    const realSubArr = subArr.filter((tobj) => !!tobj);
    // console.log('subArr.length==', subArr.length, 'subArr==', subArr, 'realSubArr.length==', realSubArr.length);

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

    const subFormItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };

    const tipStr = (
      <div>
        <p>添加下级时，请先保证 下级地址 对 当前地址ip（{curIp}）开放下列端口号：</p>
        {/* <p>{`${curIp}:8084`}</p>
        <p>{`${curIp}:3306`}</p>
        <p>{`${curIp}:9200`}</p>
        <p>{`${curIp}:18059`}</p>
        <p>{`${curIp}:8099`}</p>
        <p>{`${curIp}:8091`}</p> */}
        <p>8084,3306,9200,18059,8099,8091,9300</p>
        {/* <p>添加到防火墙白名单。</p> */}
      </div>
    );

    if (loading) {
      return (
        <div className={styles.loadingStyle}>
          <Spin />
        </div>
      );
    }
    let count = 0;
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
                  <FormItem {...formItemLayout} label="当前地址">
                    {getFieldDecorator('curIpPort', {
                      initialValue: editItem.curIpPort || '',
                      validateTrigger: 'onBlur',
                      rules: [
                        { required: true, message: '必填' },
                        // { max: 128, message: '最多填写128字符，请重新填写' },
                        // { validator: this.validateStrategyName },
                      ],
                    })(<Input disabled />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="设备名称">
                    {getFieldDecorator('ipName', {
                      initialValue: editItem.ipName || '',
                      validateTrigger: 'onBlur',
                      rules: [
                        { required: true, message: '必填' },
                        { max: 128, message: '最多填写128字符，请重新填写' },
                        // { validator: this.validateStrategyName },
                      ],
                    })(<Input />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="设备位置">
                    {getFieldDecorator('location', {
                      initialValue: editItem.location || '',
                      validateTrigger: 'onBlur',
                      rules: [
                        { required: true, message: '必填' },
                        { max: 128, message: '最多填写128字符，请重新填写' },
                        // { validator: this.validateStrategyName },
                      ],
                    })(<Input />)}
                  </FormItem>

                  <FormItem {...formItemLayout} label="备注信息">
                    {getFieldDecorator('remarks', {
                      initialValue: editItem.remarks || '',
                      validateTrigger: 'onBlur',
                      rules: [
                        // { required: true, message: '必填' },
                        { max: 258, message: '最多填写258字符，请重新填写' },
                        // { validator: this.validateStrategyName },
                      ],
                    })(<TextArea rows={2} />)}
                  </FormItem>

                  {/* <FormItem {...formItemLayout} label="当前角色">
                    {getFieldDecorator('role', {
                      initialValue: editItem.role || '',
                      rules: [{ required: true, message: '必填' }, { validator: this.changeRole }],
                    })(
                      <RadioGroup>
                        <Radio value="leader">上级</Radio>
                        <Radio value="sub">下级</Radio>
                      </RadioGroup>
                    )}
                  </FormItem> */}
                </Col>
              </Row>
              {curCcsRole === 'sub' && (
                <Row className={styles.rowBlock}>
                  <Col span={4}>
                    <h4 className={styles.title4}>上级配置</h4>
                  </Col>
                  <Col span={20}>
                    <FormItem {...formItemLayout} label="设备地址">
                      {getFieldDecorator('leader_ipPort', {
                        initialValue: editItem.leader_ipPort || '192.168.190.103',
                        validateTrigger: 'onBlur',
                        rules: [
                          { required: true, message: '必填' },
                          // { max: 128, message: '最多填写128字符，请重新填写' },
                          { validator: this.validateIpPort },
                        ],
                      })(<Input placeholder="支持格式 192.168.0.1:8084" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="设备名称">
                      {getFieldDecorator('leader_ipName', {
                        initialValue: editItem.leader_ipName || '',
                        validateTrigger: 'onBlur',
                        rules: [
                          { required: true, message: '必填' },
                          { max: 128, message: '最多填写128字符，请重新填写' },
                          // { validator: this.validateStrategyName },
                        ],
                      })(<Input />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="设备位置">
                      {getFieldDecorator('leader_location', {
                        initialValue: editItem.leader_location || '',
                        validateTrigger: 'onBlur',
                        rules: [
                          { required: true, message: '必填' },
                          { max: 128, message: '最多填写128字符，请重新填写' },
                          // { validator: this.validateStrategyName },
                        ],
                      })(<Input />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="备注信息">
                      {getFieldDecorator('leader_remarks', {
                        initialValue: editItem.leader_remarks || '',
                        validateTrigger: 'onBlur',
                        rules: [
                          // { required: true, message: '必填' },
                          { max: 258, message: '最多填写258字符，请重新填写' },
                          // { validator: this.validateStrategyName },
                        ],
                      })(<TextArea rows={2} />)}
                    </FormItem>
                  </Col>
                </Row>
              )}
              {curCcsRole !== 'sub' && (
                <Row className={styles.rowBlock}>
                  <Col span={4}>
                    <h4 className={styles.title4}>
                      下级配置 &nbsp;&nbsp;
                      <Tooltip title={tipStr} trigger="click" placement="rightTop">
                        <QuestionCircleFilled className="fontBlue" />
                      </Tooltip>
                    </h4>
                  </Col>
                  <Col span={18}>
                    <div>
                      <a className={styles.addSubBtn} onClick={this.addSubArr}>
                        +新增下级配置
                      </a>
                    </div>
                    <div>
                      {subArr.map((subObj, index) => {
                        count += 1;
                        return (
                          <div key={index}>
                            <div className={styles.box}>
                              <div className={styles.topDiv}>
                                <div>{`下级配置 ${count}`}</div>
                                {realSubArr.length > 1 && (
                                  <a
                                    className={styles.delA}
                                    onClick={() => {
                                      this.delSubArr(index);
                                    }}
                                  >
                                    删除
                                  </a>
                                )}
                              </div>
                              <div>
                                <FormItem {...subFormItemLayout} label="设备地址">
                                  {getFieldDecorator(`sub_ipPort_${index}`, {
                                    initialValue: subObj.ipPort || '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      { required: true, message: '必填' },
                                      // { max: 128, message: '最多填写128字符，请重新填写' },
                                      { validator: this.validateIpPort },
                                    ],
                                  })(<Input placeholder="支持格式 192.168.0.1:8084" />)}
                                </FormItem>
                                <FormItem {...subFormItemLayout} label="设备名称">
                                  {getFieldDecorator(`sub_ipName_${index}`, {
                                    initialValue: subObj.ipName || '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      { required: true, message: '必填' },
                                      { max: 128, message: '最多填写128字符，请重新填写' },
                                      // { validator: this.validateStrategyName },
                                    ],
                                  })(<Input />)}
                                </FormItem>
                                <FormItem {...subFormItemLayout} label="设备位置">
                                  {getFieldDecorator(`sub_location_${index}`, {
                                    initialValue: subObj.location || '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      { required: true, message: '必填' },
                                      { max: 128, message: '最多填写128字符，请重新填写' },
                                      // { validator: this.validateStrategyName },
                                    ],
                                  })(<Input />)}
                                </FormItem>

                                <FormItem {...subFormItemLayout} label="备注信息">
                                  {getFieldDecorator(`sub_remarks_${index}`, {
                                    initialValue: subObj.remarks || '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      // { required: true, message: '必填' },
                                      { max: 258, message: '最多填写258字符，请重新填写' },
                                      // { validator: this.validateStrategyName },
                                    ],
                                  })(<TextArea rows={2} />)}
                                </FormItem>

                                <Row>
                                  <Col
                                    span={12}
                                    offset={6}
                                    title="测试联通性前，请先保证下级地址对当前地址ip开放端口。详情请看 下级配置 提示信息"
                                  >
                                    <Button
                                      style={{ marginBottom: 10 }}
                                      className="v2-soc-button default"
                                      onClick={() => this.testLink(index)}
                                    >
                                      测试联通性
                                    </Button>
                                  </Col>
                                </Row>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Col>
                </Row>
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
        </div>
      </div>
    );
  }
}

export default Form.create()(CcsConfigFormDrawer);
