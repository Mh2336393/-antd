import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, Select, Radio } from 'antd';
import configSettings from '../../configSettings';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
class CustomThreatForm extends Component {
  onOKSave = () => {
    const { form, editItem, onSave } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const params = values;
        params.ti_list = params.ti_list.replace(/,/g, '\n');
        if (editItem.id) {
          params.id = editItem.id;
        }
        if (onSave) {
          onSave(params);
        }
      }
    });
  };

  validateTiList = (rule, value, callback) => {
    const { form } = this.props;
    const type = form.getFieldValue('ti_type');
    if (value) {
      const arr = value.split(/[,\n]/g);
      let flag = true;
      for (let m = 0; m < arr.length; m += 1) {
        let stats = true;
        if (type === 'IP') {
          stats = configSettings.validateThreeIpCate(arr[m], false, false);
        }
        if (type === 'DOMAIN') {
          stats = configSettings.validateIocServer(arr[m]);
        }
        if (type === 'MD5') {
          stats = configSettings.validateMd5(arr[m]);
        }
        if (!stats) {
          flag = false;
          break;
        }
      }
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
        callback(`${type}格式有误，请重新输入`);
      }
    } else {
      callback();
    }
  };

  validateTiTags = (rule, value, callback) => {
    if (value) {
      const pattern = new RegExp("[`~!@#$^&*()=|{}';'\\[\\]<>?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
      if (pattern.test(value)) {
        callback("不允许输入“!@#$^&*()=|{}';”等非法字符");
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  render() {
    const { editItem, visible, form, onCancel, cateTags } = this.props;
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
    const tagsInitialValue = cateTags && cateTags.length !== 0 ? cateTags[0].value : '';
    if (!editItem.id) {
      editItem.status = 'ON';
    }
    return (
      <Modal title={editItem.id ? '编辑' : '新建'} editItem={editItem} visible={visible} onCancel={onCancel} onOk={this.onOKSave}>
        <Form>
          <FormItem {...formItemLayout} label="启停" extra="">
            {getFieldDecorator('status', {
              initialValue: editItem.status || 'ON',
            })(
              <RadioGroup>
                <Radio value="ON">开启</Radio>
                <Radio value="OFF">关闭</Radio>
              </RadioGroup>
            )}
          </FormItem>
          {/* <FormItem {...formItemLayout} label="规则名称" extra="">
            {getFieldDecorator('ti_title', {
              initialValue: editItem.ti_title || '',
              rules: [{ required: true, message: '必填' }],
            })(<Input />)}
          </FormItem> */}
          <FormItem {...formItemLayout} label="IOC类型" extra="">
            {getFieldDecorator('ti_type', {
              initialValue: editItem.ti_type || 'IP',
              rules: [{ required: true, message: '必填' }],
            })(
              <Select mode="">
                <Option key="IP" value="IP">
                  IP
                </Option>
                <Option key="DOMAIN" value="DOMAIN">
                  DOMAIN
                </Option>
                <Option key="MD5" value="MD5">
                  MD5
                </Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="IOC内容" extra='允许输入多个，以","或者换行分割。IP支持ipv6格式'>
            {getFieldDecorator('ti_list', {
              initialValue: editItem.ti_list || '',
              validateTrigger: 'onBlur',
              rules: [
                { required: true, message: '必填' },
                {
                  validator: this.validateTiList,
                },
              ],
            })(<Input.TextArea />)}
          </FormItem>
          <FormItem {...formItemLayout} label="分类">
            {getFieldDecorator('category', {
              initialValue: editItem.category || tagsInitialValue,
              validateTrigger: 'onBlur',
              rules: [{ required: true, message: '必填' }],
            })(
              <Select showSearch filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                {cateTags.map(tag => (
                  <Option key={tag.value} value={tag.value}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="标签" extra='允许输入多个，以","或者换行分割'>
            {getFieldDecorator('tags', {
              initialValue: editItem.tags || '',
              validateTrigger: 'onBlur',
              rules: [
                // { required: true, message: '必填' },
                {
                  validator: this.validateTiTags,
                },
              ],
            })(<Input.TextArea />)}
          </FormItem>
          <FormItem {...formItemLayout} label="级别">
            {getFieldDecorator('severity', {
              initialValue: editItem.severity || '4',
              rules: [{ required: true, message: '必填' }],
            })(
              <Select mode="">
                <Option key="1" value="1">
                  1（信息）
                </Option>
                <Option key="2" value="2">
                  2（低）
                </Option>
                <Option key="3" value="3">
                  3（中）
                </Option>
                <Option key="4" value="4">
                  4（高）
                </Option>
                <Option key="5" value="5">
                  5（极高）
                </Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="置信度">
            {getFieldDecorator('confidence', {
              initialValue: editItem.confidence || '4',
              rules: [{ required: true, meaasge: '必填' }],
            })(
              <Select>
                {
                  configSettings.confidenceOpetion.map(item => {
                    return (
                      <Option key={item.valueStr} value={item.valueStr}>
                        {item.name}
                      </Option>
                    )
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="IOC描述" extra="">
            {getFieldDecorator('description', {
              initialValue: editItem.description || '',
            })(<Input.TextArea />)}
          </FormItem>
          <FormItem {...formItemLayout} label="处置建议" extra="">
            {getFieldDecorator('suggestion', {
              initialValue: editItem.suggestion || '',
              // rules: [
              //   { max: 128, message: '最多填写128字符，请重新填写' },
              // ],
            })(<Input.TextArea />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(CustomThreatForm);
