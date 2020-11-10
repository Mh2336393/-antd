import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';
const crypto = require('crypto');
class NormalLoginForm extends React.Component {
  constructor(props) {
     super(props);
    
    this.state = {
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    let {showDesensitization,modelVisible,dispatch} = this.props
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { username, password } = values;
        const user= username;
        const pass= password;
        // const hexPass = crypto
        const hexPass = crypto
            .createHash('md5')
            .update(pass)
            .digest('hex');
          dispatch({
            type: 'debugConfig/authCheck',
            payload: { user , pass:hexPass},
          })
          .then(() => {
             showDesensitization=!showDesensitization
             modelVisible=false
             this.props.getChildren(modelVisible,showDesensitization)
          })
          .catch(() => {showDesensitization=false});
        
      }else{
        showDesensitization=false
        modelVisible=false
        this.props.getChildren(modelVisible,showDesensitization)
      }
    });
    
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <Form.Item>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
            />,
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{width:"80%",borderRadius:"5px"}} className="login-form-button">
             登陆
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);
export default WrappedNormalLoginForm 