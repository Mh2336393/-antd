import React, { Component } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import _ from 'lodash';
import { Modal, Input, Select, Radio } from 'antd';

/* eslint-disable camelcase */

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
@connect(({ global }) => ({
  hasVpc: global.hasVpc,
}))
class AlertMergeForm extends Component {
  constructor(props) {
    super(props);
    const {
      editItem: { switch: defaultSwitch },
    } = this.props;
    const defaultIsDisable = !defaultSwitch;
    this.state = {
      isDisable: defaultIsDisable,
    };
  }

  onOKSave = () => {
    const { form, onSave } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const params = values;
        if (params.field) {
          params.field = params.field.split(',');
        } else {
          params.field = [];
        }
        params.switch = Number(params.switch);
        params.minute =
          params.mergeTime === 'h' ? Number(params.minute) * 60 : Number(params.minute);
        if (onSave) {
          delete params.mergeTime;
          onSave(params);
        }
      }
    });
  };

  onStatusChange = (e) => {
    const { value } = e.target;
    if (Number(value)) {
      this.setState({ isDisable: false });
    } else {
      this.setState({ isDisable: true });
    }
  };

  afterSelector = () => {
    // defaultVal
    const { isDisable } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;
    return getFieldDecorator('mergeTime', {
      // initialValue: defaultVal || 'h',
      initialValue: '分',
    })(
      // <Select style={{ width: 70 }} disabled={isDisable}>
      //   <Option value="s">分</Option>
      //   {/* <Option value="h">时</Option> */}
      // </Select>
      <div>分</div>
    );
  };

  validateMInute = (rule, value, callback) => {
    try {
      const reg = /^[0-9]+$/;
      const numState = reg.test(value);
      const numFlag = numState && Number(value) >= 1 && Number(value) <= 30;
      if (!numFlag) {
        throw new Error('请填写1~30的数值');
      }
    } catch (e) {
      callback(e.message);
    }
    callback();
  };

  render() {
    const { isDisable } = this.state;
    const { editItem, visible, form, onCancel, hasVpc } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const fieldInitialValue =
      editItem.field && editItem.field.length !== 0 ? editItem.field.join(',') : '';
    let minuteInitialValue = 30;
    let timeInitialValue = 's';
    if (editItem && editItem.minute) {
      if (editItem.minute % 60 !== 0) {
        minuteInitialValue = editItem.minute;
        timeInitialValue = 's';
      } else {
        minuteInitialValue = editItem.minute / 60;
      }
    }
    return (
      <Modal
        title="入侵事件全局归并策略配置"
        editItem={editItem}
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOKSave}
      >
        <Form className="formStyle">
          <FormItem {...formItemLayout} label="归并策略" extra="">
            {getFieldDecorator('switch', {
              initialValue: `${editItem.switch || 0}`,
            })(
              <RadioGroup onChange={this.onStatusChange}>
                <Radio value="1">开启</Radio>
                <Radio value="0">关闭</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="归并字段" extra="">
            {getFieldDecorator('field', {
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
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="归并时长" extra="">
            {getFieldDecorator('minute', {
              initialValue: `${minuteInitialValue}`,
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
                placeholder="请填写1~30的数值"
                addonAfter={this.afterSelector(timeInitialValue)}
                disabled={isDisable}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(AlertMergeForm);
