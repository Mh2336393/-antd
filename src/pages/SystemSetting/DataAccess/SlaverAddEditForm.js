import React, { Component } from 'react';
import { connect } from 'umi';
import _ from 'lodash';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, Select, InputNumber } from 'antd';
import Item from 'antd/lib/list/Item';
import configSettings from '../../../configSettings';
// import styles from './index.less';

/* eslint-disable camelcase */

const FormItem = Form.Item;
const { Option } = Select;

@connect()
class SlaverAddEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winxpMax: 0,
      win10Max: 0,
      win7Max: 0,
      linuxMax: 0,
    };
  }

  componentDidMount() {
    const {
      sandIps,
      editItem: { modalTitle, ip },
    } = this.props;
    if (modalTitle === '编辑' && !_.isEmpty(sandIps) && sandIps.hasOwnProperty(ip)) {
      const numObj = sandIps[ip];
      // eslint-disable-next-line no-unused-vars
      const { maxXp, maxWin7, maxLinux } = numObj;
      this.setState({ winxpMax: maxXp, win10Max: 0, win7Max: maxWin7, linuxMax: maxLinux });
    }
  }

  onOKSave = () => {
    const { form, editItem, onSave } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const params = { ...values };
        params.modalTitle = editItem.modalTitle;
        if (editItem.slaver_name) {
          params.slaver_name = editItem.slaver_name;
        }
        // console.log(89, "values==", values, "params==", params, "editItem", editItem);
        if (onSave) {
          onSave(params);
        }
      }
    });
  };

  // 表单验证
  // 编辑时 ip不能变更，所以只有新建需要验证ip是否已存在
  validateIp = (rule, value, callback) => {
    const {
      sandIps,
      editItem: { modalTitle, ip },
      listData,
      form,
    } = this.props;
    // 新建时,ip变更。虚拟机个数自动变更
    if (modalTitle === '新建') {
      if (value) {
        const numObj = sandIps[value];
        // eslint-disable-next-line no-unused-vars
        const { maxXp, maxWin7, maxLinux } = numObj;
        this.setState({ winxpMax: maxXp, win10Max: 0, win7Max: maxWin7, linuxMax: maxLinux });
      } else {
        this.setState({ winxpMax: 0, win10Max: 0, win7Max: 0, linuxMax: 0 });
        form.setFieldsValue({
          winxp: 0,
          win7: 0,
          win10: 0,
          linux: 0,
        });
      }
    }

    if (value) {
      let ipList = listData.map((obj) => obj.ip);
      if (modalTitle === '编辑') {
        ipList = ipList.filter((name) => name !== ip);
      }
      if (ipList.indexOf(value) > -1) {
        callback('ip已存在，请重选');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  // 分析机名称验证
  validateAliasName = (rule, value, callback) => {
    if (/^\s+$/g.test(value)) {
      callback('不能只填空格');
    }
    const val = configSettings.trimStr(value);
    if (val) {
      const pattern = new RegExp(
        "[`~!@#$^&*()=|☆◎ΠΟ╦{}';',\\[\\]<>?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"
      );
      if (pattern.test(val)) {
        callback('不能包含"[`~!@#$^&*()=|]{}?~￥……&*"等非法字符和特殊符号');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  handleInputChange = (type, val) => {
    const { winxpMax, win10Max, win7Max, linuxMax } = this.state;
    let maxSet = { winxpMax, win10Max, win7Max, linuxMax };
    const {
      form,
      editItem: { modalMaxNum: maxNum },
    } = this.props;
    const arr = ['winxp', 'win7', 'win10', 'linux'];
    const numArr = [{ type, val }];
    arr.forEach((key) => {
      if (key !== type) {
        const itemNum = Number(form.getFieldValue(key));
        numArr.push({ type: key, val: itemNum });
      }
    });
    const total = numArr.reduce((pre, now) => pre + now.val, 0);
    const dis = maxNum - total;
    // console.log(33, "chang-dis", dis, "val", val);
    if (dis >= 0) {
      maxSet = { winxpMax: dis, win10Max: dis, win7Max: dis, linuxMax: dis };
      numArr.forEach((obj) => {
        maxSet[`${obj.type}Max`] = obj.val + dis;
      });
      this.setState({
        winxpMax: maxSet.winxpMax,
        win10Max: maxSet.win10Max,
        win7Max: maxSet.win7Max,
        linuxMax: maxSet.linuxMax,
      });
    } else {
      // form.setFieldsValue({
      //   [type]: maxSet[`'${type}Max`],
      // });
    }
  };

  render() {
    const { winxpMax, win10Max, win7Max, linuxMax } = this.state;
    // console.log(34, this.state);
    const { editItem, visible, form, onCancel, showVmWin10, sandIps } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 9 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const ipList = Object.keys(sandIps);
    const displayWin10 = showVmWin10 === 'no' ? 'none' : 'block';

    const winxpVal = editItem.image_info ? editItem.image_info[0].image_num : 0;
    const win10Val = editItem.image_info ? editItem.image_info[2].image_num : 0;
    const win7Val = editItem.image_info ? editItem.image_info[1].image_num : 0;
    const linuxVal = editItem.image_info ? editItem.image_info[4].image_num : 0;

    const { modalTitle } = editItem;

    const isDisable = !!editItem.ip; // 编辑时 ip不能更改
    return (
      <Modal
        title={modalTitle}
        editItem={editItem}
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOKSave}
      >
        <Form>
          <FormItem {...formItemLayout} label="分析机名称" extra="">
            {getFieldDecorator('alias_name', {
              initialValue: editItem.alias_name || '',
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: '必填',
                },
                { max: 32, message: '最多填写32字符，请重新填写' },
                {
                  validator: this.validateAliasName,
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="分析机地址" extra="">
            {getFieldDecorator('ip', {
              initialValue: editItem.ip || '',
              // validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: '必填',
                },
                {
                  validator: this.validateIp,
                },
              ],
            })(
              // <Input placeholder="请输入分析机ip地址" disabled={isDisable} />
              <Select disabled={isDisable}>
                {ipList.map((tag) => (
                  <Option key={tag} value={tag}>
                    {tag}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Windows XP主机数">
            {getFieldDecorator('winxp', {
              initialValue: winxpVal || 0,
            })(
              // <span className={styles.spanInput}>111</span>
              <InputNumber
                disabled={modalTitle === '编辑'}
                min={0}
                max={winxpMax}
                formatter={(value) => value}
                parser={(value) => value.replace(/[,.$@]/g, '')}
                style={{ width: '100%' }}
                // onChange={e => {
                //   this.handleInputChange('winxp', e);
                // }}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Windows 7主机数">
            {getFieldDecorator('win7', {
              initialValue: win7Val || 0,
              // validateTrigger: 'onBlur',// 'onChange
              // rules: [
              //   {
              //     validator: this.validateSlaverNum,
              //   },
              // ],
            })(
              <InputNumber
                disabled={modalTitle === '编辑'}
                min={0}
                max={win7Max}
                formatter={(value) => value}
                parser={(value) => value.replace(/[,.$@]/g, '')}
                style={{ width: '100%' }}
                // onChange={e => {
                //   this.handleInputChange('win7', e);
                // }}
              />
            )}
          </FormItem>
          <div style={{ display: displayWin10 }}>
            <FormItem {...formItemLayout} label="Windows 10主机数">
              {getFieldDecorator('win10', {
                initialValue: win10Val || 0,
                // validateTrigger: 'onBlur',// 'onChange
                // rules: [
                //   {
                //     validator: this.validateSlaverNum,
                //   },
                // ],
              })(
                <InputNumber
                  disabled
                  min={0}
                  max={win10Max}
                  formatter={(value) => value}
                  parser={(value) => value.replace(/[,.$@]/g, '')}
                  style={{ width: '100%' }}
                  // onChange={e => {
                  //   this.handleInputChange('win10', e);
                  // }}
                />
              )}
            </FormItem>
          </div>
          <FormItem
            {...formItemLayout}
            label="Linux主机数"
            // extra={`当前主机数总和不能超过${modalMaxNum}`}
          >
            {getFieldDecorator('linux', {
              initialValue: linuxVal || 0,
              // validateTrigger: 'onBlur',// 'onChange
              // rules: [
              //   {
              //     validator: this.validateSlaverNum,
              //   },
              // ],
            })(
              <InputNumber
                disabled={modalTitle === '编辑'}
                min={0}
                max={linuxMax}
                formatter={(value) => value}
                parser={(value) => value.replace(/[,.$@]/g, '')}
                style={{ width: '100%' }}
                // onChange={e => {
                //   this.handleInputChange('linux', e);
                // }}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="备注" extra="">
            {getFieldDecorator('extra_info', {
              initialValue: editItem.extra_info || '',
              rules: [{ max: 64, message: '最多填写64字符，请重新填写' }],
            })(<Input.TextArea />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(SlaverAddEditForm);
