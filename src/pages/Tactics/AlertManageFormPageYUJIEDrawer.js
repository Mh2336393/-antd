import React, { Component } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import _ from 'lodash';
import { Row, Col, Select, Spin, message, Switch, Input, Button } from 'antd';
import moment from 'moment';
import styles from './form.less';
import configSettings from '../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
/* eslint-disable camelcase */

const FormItem = Form.Item;
const { Option } = Select;
const tiTags = configSettings.alertRuleCategory;

@connect(({ tacticsInvasion, global, loading }) => ({
  tacticsInvasion,
  hasVpc: global.hasVpc,
  loading: loading.effects['tacticsInvasion/fetchEditInfo'],
}))
/**
 * 御界自带的规则详情（eid200000+显示）
 */
class AlertManageFormPageDrawer extends Component {
  constructor(props) {
    super(props);
    this.rwAuth = getAuth('/tactics/invasion');
    this.state = {
      isDisable: true,
      isProcessing: false,
      // ruleIds: [],
      ruleArr: [
        {
          name: '',
          id: '',
          rule: '',
          credit: '',
        },
      ],
    };
  }

  componentWillMount() {
    const { dispatch, drawerObj } = this.props;
    // console.log(53, 'drawerObj=', drawerObj);
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
        const { ruleArr } = editInfo;
        const newRuleArr = [];
        const ruleIds = [];
        ruleArr.forEach((obj) => {
          ruleIds.push(obj.id);
          newRuleArr.push({
            id: obj.id,
            name: obj.name,
            rule: obj.signature,
            credit: obj.credit,
            enable: obj.enable,
          });
        });
        let isDisable = true;
        if (editInfo.merge_switch) {
          isDisable = false;
        }
        this.setState({ ruleArr: newRuleArr, isDisable });
      });
    }
  }

  // 除扫描规则以外的内置规则： 编辑 保存函数
  onOKSaveYuJie = () => {
    const {
      form,
      tacticsInvasion: { editInfo: editItem },
    } = this.props;
    const { ruleArr, isProcessing } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        if (isProcessing) {
          return;
        }
        this.setState({ isProcessing: true });

        const editData = []; // 编辑规则
        ruleArr.forEach((ruleObj) => {
          if (ruleObj) {
            const { id } = ruleObj;
            const ruleCredit = form.getFieldValue(`credit_${id}`);
            const ruleEnble = form.getFieldValue(`enable_${id}`);
            // 规则id不能编辑修改，只是展示用
            const tmpItem = {
              id,
              credit: ruleCredit,
              enable: ruleEnble ? 1 : 0,
            };
            editData.push(tmpItem); // 编辑规则
          }
        });

        const { score, merge_minute, merge_field, mergeTime, merge_switch } = values;

        const params = { score };
        const minuteVal = mergeTime === 'h' ? Number(merge_minute) * 60 : Number(merge_minute);
        const method = {
          minute: minuteVal,
          field: merge_field === 'rule_id' || merge_field === '' ? [] : merge_field.split(','),
        };
        params.merge_method = JSON.stringify(method);
        params.merge_switch = Number(merge_switch);

        if (editItem.id) {
          params.id = editItem.id;
          params.author = editItem.author;
          params.editArr = editData;
          params.delArr = [];
        } else {
          params.enable = 1;
        }

        this.onFormSave(params);
      }
    });
  };

  // goBack = () => {
  //   history.go(-1);
  // };

  onFormSave = (values) => {
    // const { query, reqing } = this.state;
    const { dispatch, backTablePage } = this.props;
    let obj = values;
    const curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    let successTip = '编辑成功，点击下发所有探针生效';
    if (!values.id) {
      successTip = '新建成功，点击下发所有探针生效';
      obj = Object.assign({}, values, { author: 'USER', update_time: curTime });
    }

    dispatch({ type: 'tacticsInvasion/addEditHandleEvent', payload: { obj, modalTitle: '编辑' } })
      .then((json) => {
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

  validateSignature = (rule, value, callback) => {
    const { dispatch } = this.props;
    if (value) {
      try {
        dispatch({
          type: 'tacticsInvasion/validateRule',
          payload: { signature: value },
        })
          .then(() => {
            callback();
          })
          .catch((error) => {
            callback(`操作失败：${error.msg}，请重新输入`);
          });
      } catch (e) {
        callback(e.message);
      }
    } else {
      callback();
    }
  };

  switchSelectChange = (value) => {
    if (value === '0') {
      this.setState({ isDisable: true });
    } else {
      this.setState({ isDisable: false });
    }
  };

  ruleNameState = (e, ruleIndex) => {
    if (e.target) {
      const { value } = e.target;
      const { ruleArr } = this.state;
      ruleArr[ruleIndex].name = value;
      this.setState({ ruleArr });
      console.log(123, ruleArr);
    }
  };

  addRuleArr = () => {
    const { ruleArr } = this.state;
    ruleArr.push({ id: '', name: '', rule: '' });
    console.log(227, 'add规则==', 'ruleArr==', ruleArr);
    this.setState({ ruleArr });
  };

  deleteRuleArr = (ruleIndex) => {
    let { ruleArr } = this.state;
    ruleArr = ruleArr.filter((obj, i) => i !== ruleIndex);
    console.log(227, 'ruleIndex==', ruleIndex, 'ruleArr==', ruleArr);
    this.setState({ ruleArr });
  };

  ruleArrReact = () => {
    const {
      form,
      // tacticsInvasion: { editInfo: editItem },
      drawerObj,
    } = this.props;
    const { ruleArr } = this.state;
    const { getFieldDecorator } = form;

    let ruleNameDisable = false;
    if (drawerObj.eid && drawerObj.author !== 'USER') {
      ruleNameDisable = true;
    }
    const ruleArrIndexArr = [];
    ruleArr.forEach((obj, i) => {
      if (obj) {
        ruleArrIndexArr.push(i);
      }
    });
    console.log('ruleArrIndexArr', ruleArrIndexArr);

    // console.log('eventFilterIndex',eventFilterIndex);
    // console.log('modalState',modalState);

    const react = ruleArrIndexArr.map((ruleIndex, index) => {
      const ruleObj = ruleArr[ruleIndex];

      const resultElement = (
        <div key={ruleIndex} style={{ marginBottom: 30 }}>
          <div className={styles.filterDiv}>
            <div className={styles.filterTheme}>
              <h5 style={{ fontSize: '14px' }}>规则{index + 1}</h5>
              {index > 0 && !ruleNameDisable && (
                <div className={styles.filterModal}>
                  <div className={styles.colPcapSize}>
                    <div className={styles.textDiv}>
                      <a
                        style={{ color: '#f00', cursor: 'pointer' }}
                        onClick={() => {
                          this.deleteRuleArr(ruleIndex);
                        }}
                      >
                        删除该规则
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className={styles.filterGroupsDiv}>
                <div className={styles.filterMid}>
                  <div>
                    <Row className={styles.filterDataSource}>
                      <Col xs={4} sm={4}>
                        <span className={styles.filterSpan}>规则ID：</span>
                      </Col>
                      <Col xs={15} sm={15}>
                        <FormItem>
                          {getFieldDecorator(`ruleId_${ruleObj.id}`, {
                            initialValue: ruleObj.id || '',
                          })(
                            // <Input disabled />
                            <span className={styles.spanInput}>{ruleObj.id || '暂无'}</span>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row className={styles.filterDataSource}>
                      <Col xs={4} sm={4}>
                        <span className={styles.filterSpan}>置信度：</span>
                      </Col>
                      <Col xs={15} sm={15}>
                        <FormItem>
                          {getFieldDecorator(`credit_${ruleObj.id}`, {
                            initialValue: ruleObj.credit >= 0 ? ruleObj.credit : 1,
                          })(
                            <Select>
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
                    <Row className={styles.filterDataSource}>
                      <Col xs={4} sm={4}>
                        <span className={styles.filterSpan}>规则名称：</span>
                      </Col>
                      <Col xs={15} sm={15}>
                        <FormItem>
                          {getFieldDecorator(`ruleName_${ruleObj.id}`, {
                            initialValue: ruleObj.name || '',
                          })(<span className={styles.spanInput}>{ruleObj.name || '暂无'}</span>)}
                        </FormItem>
                      </Col>
                    </Row>

                    <Row className={styles.filterDataSource}>
                      <Col xs={4} sm={4}>
                        <span className={styles.filterSpan}>启停状态：</span>
                      </Col>
                      <Col xs={15} sm={15}>
                        <FormItem>
                          {getFieldDecorator(`enable_${ruleObj.id}`, {
                            valuePropName: 'checked',
                            initialValue: ruleObj.enable !== 0,
                          })(<Switch checkedChildren="开" unCheckedChildren="关" />)}
                        </FormItem>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      return resultElement;
    });
    return react;
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

  render() {
    const { isDisable, isProcessing } = this.state;
    const { form, loading, tacticsInvasion, hasVpc, drawerObj, backTablePage } = this.props;
    const { editInfo } = tacticsInvasion;
    const editItem = drawerObj.eid ? editInfo : {};

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

    const tagsObj = {};
    tiTags.forEach((tmp) => {
      tagsObj[tmp.value] = tmp.name;
    });

    const scoreObj = configSettings.scoreColorMap(Number(editItem.score));
    editItem.score = scoreObj.ruleSoce;

    // const levelObj = {
    //   1: '1（信息）',
    //   2: '2（低）',
    //   3: '3（中）',
    //   4: '4（高）',
    //   5: '5（极高）',
    // };

    const tiCategoryInitialValue = tiTags[0] ? '' : tiTags[0].value;
    const method = editItem.merge_method
      ? JSON.parse(editItem.merge_method)
      : { minute: 120, field: '' };

    let fieldInitialValue = '';
    if (method) {
      if (method.field) {
        fieldInitialValue = method.field.join(',');
      }
    }

    let minuteInitialValue = 2;
    let timeInitialValue = 'h';
    if (method && method.minute) {
      if (method.minute % 60 !== 0) {
        minuteInitialValue = method.minute;
        timeInitialValue = 's';
      } else {
        minuteInitialValue = method.minute / 60;
      }
    }

    const defaultSwitchVal = `${editItem.merge_switch || 0}`;

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
                  // // rules: [
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
                  // <Select mode="">
                  //     {tiTags.map(tag => (
                  //         <Option key={tag.value} value={tag.value}>
                  //             {tag.name}
                  //         </Option>
                  //     ))}
                  // </Select>
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
              {/* <FormItem {...formItemLayout} label="级别">
                {getFieldDecorator('level', {
                  initialValue: `${editItem.level || 4}`,
                })(
                  // <Select mode="">
                  //     <Option key="1" value="1">
                  //         1（信息）
                  //     </Option>
                  //     <Option key="2" value="2">
                  //         2（低）
                  //     </Option>
                  //     <Option key="3" value="3">
                  //         3（中）
                  //     </Option>
                  //     <Option key="4" value="4">
                  //         4（高）
                  //     </Option>
                  //     <Option key="5" value="5">
                  //         5（极高）
                  //     </Option>
                  // </Select>
                  <span className={styles.spanInput}>{levelObj[`${editItem.level || 4}`] || '暂无'}</span>
                )}
              </FormItem> */}

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

              {/* <FormItem {...formItemLayout} label="评分" extra="">
                {getFieldDecorator('score', {
                  initialValue: editItem.score || '',
                  rules: [
                    {
                      validator: this.validateScore,
                    },
                  ],
                })(<Input placeholder="默认" />)}
              </FormItem> */}

              <FormItem {...formItemLayout} label="归并策略" extra="">
                {getFieldDecorator('merge_switch', {
                  initialValue: defaultSwitchVal,
                })(
                  <Select onChange={this.switchSelectChange}>
                    <Option key="1" value="1">
                      内置策略
                    </Option>
                    <Option key="0" value="0">
                      全局策略
                    </Option>
                  </Select>
                  // <span className={styles.spanInput}>{defaultSwitchVal === '1' ? '内置策略' : '全局策略'}</span>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="归并字段" extra="">
                {getFieldDecorator('merge_field', {
                  initialValue: fieldInitialValue || '',
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
                  // <span className={styles.spanInput}>{this.fieldShowVal(fieldInitialValue || '')}</span>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="归并时长" extra="">
                {getFieldDecorator('merge_minute', {
                  initialValue: `${minuteInitialValue || 120}`,
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
                  // <span className={styles.spanInput}>{`${minuteInitialValue}  ${
                  //     timeInitialValue === 'h' ? '时' : '分'
                  //     }`}</span>
                )}
              </FormItem>
            </Col>
          </Row>

          <Row className={styles.rowBlock}>
            <Col span={4}>
              <h4 className={styles.title4}>规则信息</h4>
            </Col>
            <Col span={20}>
              <div>{this.ruleArrReact()}</div>
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
                        backTablePage();
                        // this.goBack();
                      }}
                    >
                      取消
                    </Button>
                    <Button type="primary" onClick={this.onOKSaveYuJie} loading={isProcessing}>
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

export default Form.create()(AlertManageFormPageDrawer);
