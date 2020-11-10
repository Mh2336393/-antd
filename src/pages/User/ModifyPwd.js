import React, { Component } from 'react';
import { connect } from 'umi';
import { Link } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Alert, Input } from 'antd';
import styles from './ModifyPwd.less';

const crypto = require('crypto');

const FormItem = Form.Item;
/* eslint-disable camelcase */

const msgMap = {
  1: '密码长度8位以上，必须包含大小写字母、数字、下划线中的三类',
  2: '密码长度8位及以上，必须包含大写字母、小写字母、数字中的两类且不能全部都是字母',
  3: '密码长度必须6位以上',
};

class ModifyPwd extends Component {
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/changeModifyStatus',
      payload: { modifyPwdMsg: '' },
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { new_pass, old_pass } = values;
        const oldhexPass = crypto.createHash('md5').update(old_pass).digest('hex');
        const newhexPass = crypto.createHash('md5').update(new_pass).digest('hex');
        const data = { new_pass: newhexPass, old_pass: oldhexPass };
        dispatch({ type: 'login/modifyPwd', payload: data });
      }
    });
  };

  checkPwdConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('new_pass')) {
      // console.log('xx',value,form.getFieldValue('new_passwd'))
      callback('两次输入密码不一致');
    }
    callback();
  };

  checkPwd = (rule, value, callback) => {
    const {
      global: { password_complexity },
    } = this.props;
    const complexityMap = {
      // 1: /^((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[±!@#$%^&*-_<>?])[a-zA-Z\d±!@#$%^&*-_<>?()]{8,})|((?=.*[A-Z])(?=.*\d)(?=.*[±!@#$%^&*-_<>?])[a-zA-Z\d±!@#$%^&*-_<>?()]{8,})|((?=.*[a-z])(?=.*\d)(?=.*[±!@#$%^&*-_<>?])[a-zA-Z\d±!@#$%^&*-_<>?()]{8,})|((?=.*[a-z])(?=.*[A-Z])(?=.*[±!@#$%^&*-_<>?])[a-zA-Z\d±!@#$%^&*-_<>?()]{8,})|((?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d±!@#$%^&*-_<>?()]{8,})$/, // 密码长度8位以上，必须包含大小写字母、数字、下划线中的三类
      1: /^[a-zA-Z\d±!@#$%^&*-_<>?()]{8,}$/, // 密码长度8位以上，必须包含大小写字母、数字、下划线中的三类
      2: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // 长度必须8位以上，必须包含字母和数字中的一种
      3: /[\S]{6,}$/, // 长度6位以上，
    };

    // console.log('password_complexity', value, complexityMap[password_complexity]);
    if (!value) {
      callback();
    } else {
      const verifyPwdRex = complexityMap[password_complexity];
      // console.log('value==', value, 'verifyPwdRex==', verifyPwdRex, 'password_complexity==', password_complexity);
      // 高强度密码
      if (password_complexity === 1 || password_complexity === '1') {
        let count = 0;
        if (/[a-z]/g.test(value)) {
          count += 1;
        }
        if (/[A-Z]/g.test(value)) {
          count += 1;
        }
        if (/[\d]/g.test(value)) {
          count += 1;
        }
        const reg4 = /[±!@#$%^&*\-_<>?()]/g;
        if (reg4.test(value)) {
          count += 1;
        }

        if (count < 3 || /[\S]{9,}$/.test(value) === false) {
          // 长度8位以上
          callback(`密码强度太弱，${msgMap[password_complexity]}`);
        }
      } else if (password_complexity === 2 || password_complexity === '2') {
        // 中强度密码
        let count = 0;
        if (/[A-Za-z]/g.test(value)) {
          count += 1;
        }
        if (/[\d]/g.test(value)) {
          count += 1;
        }
        if (count < 2 || /[\S]{8,}$/.test(value) === false) {
          // 长度8位及以上
          callback(`密码强度太弱，${msgMap[password_complexity]}`);
        }
      } else if (!verifyPwdRex.test(value)) {
        // 弱强度密码
        callback(`密码强度太弱，${msgMap[password_complexity]}`);
      }
    }
    callback();
  };

  renderMessage = (content) => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const {
      login: { modifyPwdMsg },
      form,
      global: { password_complexity },
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };
    return (
      <div className={styles.loginContainer}>
        {modifyPwdMsg && this.renderMessage(modifyPwdMsg)}
        <div style={{ overflow: 'hidden' }}>
          <Link to="/user/login" style={{ float: 'right', marginRight: 40, marginBottom: 10 }}>
            切换账号
          </Link>
        </div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="旧密码">
            {getFieldDecorator('old_pass', {
              initialValue: '',
              rules: [{ required: true, message: '请填写旧密码' }],
            })(<Input placeholder="旧密码" type="password" size="large" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="新密码" extra={msgMap[password_complexity]}>
            {getFieldDecorator('new_pass', {
              initialValue: '',
              validateTrigger: 'onBlur',
              rules: [{ required: true, message: '请填写新密码' }, { validator: this.checkPwd }],
            })(<Input type="password" placeholder="新密码" size="large" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="确认密码">
            {getFieldDecorator('pwdConfirm', {
              initialValue: '',
              validateTrigger: 'onBlur',
              rules: [
                { required: true, message: '请填写确认密码' },
                { validator: this.checkPwdConfirm },
              ],
            })(<Input type="password" placeholder="确认密码" size="large" />)}
          </FormItem>
          <Button type="primary" htmlType="submit" className={styles.submitButton} size="large">
            提交
          </Button>
        </Form>
      </div>
    );
  }
}
export default connect(({ login, global }) => ({
  login,
  global,
}))(Form.create()(ModifyPwd));
