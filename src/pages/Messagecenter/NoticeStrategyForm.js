import React, { Component } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, Select, Checkbox, Radio } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

@connect(({ noticeStrategy }) => ({
  noticeStrategy,
}))
class NoticeStrategyForm extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {};
  // }

  onOKSave = () => {
    const { form, editItem, onSave } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const params = values;
        const obj = {};
        const method = ['message_enable', 'mail_enable', 'sms_enable'];
        // const method = ['message_enable', 'mail_enable'];
        for (let i = 0; i < method.length; i += 1) {
          if (params.message_method.indexOf(method[i]) < 0) {
            obj[method[i]] = 0;
          } else {
            obj[method[i]] = 1;
          }
        }
        obj.check_interval = Number(params.check_interval);
        obj.syslog_enable = Number(params.syslog_enable);
        obj.user_list = params.user_list.replace(/;/g, '|');
        if (editItem.ids) {
          obj.ids = editItem.ids;
        }
        // console.log('表单数据：params--', params, 'obj==', obj);
        if (onSave) {
          onSave(obj);
        }
      }
    });
  };

  validateUserName = (rule, value, callback) => {
    const { dispatch } = this.props;
    if (value) {
      try {
        dispatch({
          type: 'noticeStrategy/validateUserExist',
          payload: { userID: value },
        })
          .then(() => {
            const {
              noticeStrategy: { userNotExist },
            } = this.props;
            if (userNotExist) {
              callback(`“${userNotExist}”用户不存在，请重新输入`);
            } else {
              callback();
            }
          })
          .catch((error) => {
            callback(`操作失败:${error.message}，请重新输入`);
          });
      } catch (e) {
        callback(e.message);
      }
    } else {
      callback();
    }
  };

  render() {
    const { editItem, visible, form, onCancel } = this.props;
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

    const methodOptions = [
      { label: '消息通知', value: 'message_enable' },
      { label: '邮件通知', value: 'mail_enable' },
      { label: '短信通知', value: 'sms_enable' },
    ];

    return (
      <Modal
        title="策略设置"
        editItem={editItem}
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOKSave}
        destroyOnClose
      >
        <Form>
          <div style={{ color: '#999', margin: '0 auto 10px', textAlign: 'center' }}>
            已经勾选
            {editItem.setCount || '0'}
            个策略，点击确认后将全部生效
          </div>
          <FormItem {...formItemLayout} label="通知方式" extra="">
            {getFieldDecorator('message_method', {
              initialValue: [],
            })(<CheckboxGroup options={methodOptions} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="通知频率" extra="">
            {getFieldDecorator('check_interval', {
              initialValue: '0',
            })(
              <Select mode="">
                <Option key="0" value="0">
                  不通知
                </Option>
                <Option key="60" value="60">
                  每分钟一次
                </Option>
                <Option key="300" value="300">
                  每5分钟一次
                </Option>
                <Option key="3600" value="3600">
                  每小时一次
                </Option>
                <Option key="86400" value="86400">
                  每天一次
                </Option>
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="消息接收人" extra="多个接收人以 ; 分隔">
            {getFieldDecorator('user_list', {
              initialValue: 'admin',
              validateTrigger: 'onBlur',
              rules: [
                {
                  validator: this.validateUserName,
                },
              ],
            })(<Input placeholder='多个接收人以";"分隔' />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Syslog" extra="">
            {getFieldDecorator('syslog_enable', {
              initialValue: '0',
            })(
              <RadioGroup>
                <Radio value="1">开启</Radio>
                <Radio value="0">关闭</Radio>
              </RadioGroup>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(NoticeStrategyForm);
