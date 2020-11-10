import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
// import { Link } from 'umi';
import _ from 'lodash';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Input, Button, Col, Row, Select, Divider, Modal } from 'antd';
import configSettings from '../../configSettings';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

const { Option } = Select;
const FormItem = Form.Item;

/* eslint-disable camelcase */

@connect(({ systemAccess, loading }) => ({
  systemAccess,
  loading: loading.effects['systemAccess/fetchAccess'],
}))
class NoticeSystemAccess extends Component {
  constructor(props) {
    super(props);
    this.accessAuth = getAuth('/systemSetting/msg/systemAccess');
    this.state = {
      mail: {
        type: 'mail',
        server: '',
        port: '',
        reserve1: '', // 用户名
        reserve2: '', // 密码 授权码
        reserve3: '',
      },
      syslog: {
        type: 'syslog',
        server: '',
        port: '',
        reserve1: '',
      },
      sms: {
        type: 'sms',
        server: '',
        port: '',
        reserve1: '',
      },
      smsModalVisible: false,
      // reqing: {
      email: false,
      sys: false,
      smsing: false,
      teste: false,
      tests: false,
      testm: false,
      // },
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'systemAccess/fetchAccess',
    }).then(() => {
      const {
        systemAccess: {
          accessData: { mail: mailObj, syslog: sysObj, sms: smsObj },
        },
      } = this.props;
      const { mail, syslog, sms } = this.state;
      const newMail = Object.assign({}, mail, mailObj);
      const newSys = Object.assign({}, syslog, sysObj);
      const newSms = Object.assign({}, sms, smsObj);
      // console.log('newMail', newMail, 'newSys', newSys);
      this.setState({ mail: newMail, syslog: newSys, sms: newSms });
    });
  }

  handleInputChange = (type, key, e) => {
    const { [type]: curType } = this.state;
    let changValue = '';
    if ((type === 'syslog' && key === 'reserve1') || (type === 'mail' && key === 'reserve3')) {
      changValue = e;
    } else {
      changValue = e.target.value;
    }
    const newType = Object.assign({}, curType, { [key]: changValue });
    this.setState({ [type]: newType });
  };

  portBlur = (type, key, e) => {
    const { value } = e.target;
    if (value) {
      let flag = true;
      let tip = '';
      if (key === 'port') {
        flag = configSettings.isPort(value);
        tip = '端口';
      }
      if (key === 'server') {
        tip = '服务器地址';
        if (type === 'mail') {
          flag = configSettings.validateServer(value);
        }
        if (type === 'syslog') {
          flag = configSettings.isValidIP(value) || configSettings.validIpv6(value);
        }
      }
      if (key === 'reserve1') {
        flag = configSettings.validateEmail(value);
        tip = '用户名';
      }
      if (!flag) {
        message.error(`${tip}格式有误，请重新填写`);
        e.target.value = '';
        const { [type]: curType } = this.state;
        const newType = Object.assign({}, curType, { [key]: '' });
        this.setState({ [type]: newType });
      }
    }
  };

  handelSave = () => {
    const { dispatch } = this.props;
    const { mail: mailState, syslog: syslogState, sms: smsState, email, sys, smsing } = this.state;
    let syslog = syslogState;
    let mail = mailState;
    if (!syslogState.reserve1) {
      syslog = { ...syslogState, reserve1: 'UDP' };
    }
    if (!mailState.reserve3) {
      mail = { ...mailState, reserve3: 'SMTP' };
    }
    const reqFlag = email || sys || smsing;
    const {
      systemAccess: {
        accessData: { mail: mailObj, syslog: sysObj, sms: smsObj },
      },
    } = this.props;
    if (!_.isEqual(mailObj, mail)) {
      if (reqFlag) return;
      this.setState({ email: true });
      dispatch({
        type: 'systemAccess/updateSystemAccess',
        payload: mail,
      })
        .then(() => {
          message.success('邮件服务器配置成功');
          dispatch({
            type: 'systemAccess/fetchAccess',
          }).then(() => {
            const {
              systemAccess: {
                accessData: { mail: mailp, syslog: sysp },
              },
            } = this.props;
            const { mail: mails, syslog: syslogs } = this.state;
            const newMail = Object.assign({}, mails, mailp);
            const newSys = Object.assign({}, syslogs, sysp);
            this.setState({ mail: newMail, syslog: newSys, email: false });
          });
        })
        .catch((error) => {
          message.error(error.msg);
          this.setState({ email: false });
          this.handelCancel();
        });
    }
    if (!_.isEqual(sysObj, syslog)) {
      if (reqFlag) return;
      this.setState({ sys: true });
      dispatch({
        type: 'systemAccess/updateSystemAccess',
        payload: syslog,
      })
        .then(() => {
          message.success('Syslog配置成功');
          dispatch({
            type: 'systemAccess/fetchAccess',
          }).then(() => {
            const {
              systemAccess: {
                accessData: { mail: mailp, syslog: sysp },
              },
            } = this.props;
            const { mail: mails, syslog: syslogs } = this.state;
            const newMail = Object.assign({}, mails, mailp);
            const newSys = Object.assign({}, syslogs, sysp);
            this.setState({ mail: newMail, syslog: newSys, sys: false });
          });
        })
        .catch((error) => {
          message.error(error.msg);
          this.setState({ sys: false });
          this.handelCancel();
        });
    }

    if (!_.isEqual(smsObj, smsState)) {
      if (reqFlag) return;
      this.setState({ smsing: true });
      dispatch({
        type: 'systemAccess/updateSystemAccess',
        payload: smsState,
      })
        .then(() => {
          message.success('短信配置成功');
          dispatch({
            type: 'systemAccess/fetchAccess',
          }).then(() => {
            const {
              systemAccess: {
                accessData: { mail: mailp, syslog: sysp, sms: smsP },
              },
            } = this.props;
            const { mail: mails, syslog: syslogs, sms: smsS } = this.state;
            const newMail = Object.assign({}, mails, mailp);
            const newSys = Object.assign({}, syslogs, sysp);
            const newSms = Object.assign({}, smsS, smsP);
            this.setState({ mail: newMail, syslog: newSys, sms: newSms, smsing: false });
          });
        })
        .catch((error) => {
          message.error(error.msg);
          this.setState({ smsing: false });
          this.handelCancel();
        });
    }
  };

  handelCancel = () => {
    const {
      systemAccess: {
        accessData: { mail: mailObj, syslog: sysObj, sms: smsObj },
      },
    } = this.props;
    const { mail, syslog } = this.state;
    const newMail = Object.assign({}, mailObj);
    const newSys = Object.assign({}, sysObj);
    const newSms = Object.assign({}, smsObj);
    console.log('mailObj:', mailObj, 'syslog:', sysObj, 'mail', mail, 'syslog', syslog);
    this.setState({ mail: newMail, syslog: newSys, sms: newSms });
  };

  handleSysTest = () => {
    const { dispatch } = this.props;
    const { syslog, tests } = this.state;
    const sysReserve1 = syslog.reserve1 || 'UDP';
    const succTip =
      sysReserve1 === 'UDP' ? '测试syslog已发出，请在服务器端查验。' : '测试syslog发送成功';
    const query = { ip: syslog.server, port: Number(syslog.port), protocol: sysReserve1 };
    if (tests) return;
    this.setState({ tests: true });
    dispatch({
      type: 'systemAccess/testSyslog',
      payload: query,
    })
      .then(() => {
        message.success(succTip);
        this.setState({ tests: false });
      })
      .catch((error) => {
        message.error(error.msg);
        this.setState({ tests: false });
      });
  };

  handleMailTest = () => {
    const { dispatch } = this.props;
    const { mail, teste } = this.state;
    const query = {
      smtp_server: mail.server,
      port: Number(mail.port),
      sender: mail.reserve1,
      senderpwd: mail.reserve2,
      encrypt_proto: mail.reserve3 || 'SMTP',
    };
    if (teste) return;
    this.setState({ teste: true });
    dispatch({
      type: 'systemAccess/testEmail',
      payload: query,
    })
      .then(() => {
        message.success('测试邮件发送成功');
        this.setState({ teste: false });
      })
      .catch((error) => {
        message.error(error.msg);
        this.setState({ teste: false });
      });
  };

  modalCancel = () => {
    this.setState({ smsModalVisible: false });
  };

  handleSmsTest = () => {
    const { dispatch } = this.props;
    const { sms, testm } = this.state;
    const query = {
      sms_server: sms.server,
      sms_port: Number(sms.port),
    };
    if (testm) return;
    this.setState({ testm: true });
    dispatch({
      type: 'systemAccess/testSms',
      payload: query,
    })
      .then((json) => {
        if (json.error_code === 0) {
          // message.success('测试短信发送成功');
          message.success(json.msg);
        } else {
          message.error(`测试短信发送失败:${json.msg}`);
        }
        this.setState({ testm: false });
      })
      .catch((error) => {
        console.log(314, error);
        // message.error(error.msg);
        message.error(`测试短信发送失败:${error.msg}`);
        this.setState({ testm: false });
      });
  };

  onOKSave = () => {
    const { form, dispatch } = this.props;
    const { testm } = this.state;
    // const { sms } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        const query = {
          // server: sms.server,
          // port: Number(sms.port),
          phone: values.phoneNum,
        };
        console.log(296, values, query);
        if (testm) return;
        this.setState({ testm: true });
        dispatch({
          type: 'systemAccess/testSms',
          payload: query,
        })
          .then((json) => {
            if (json.error_code === 0) {
              // message.success('测试短信发送成功');
              message.success(json.msg);
            } else {
              message.error(json.msg);
            }
            this.setState({ testm: false });
          })
          .catch((error) => {
            console.log(321, error);
            // message.error(error.msg);
            message.error('测试短信发送失败');
            this.setState({ testm: false });
          });
        this.setState({ smsModalVisible: false });
      }
    });
  };

  validatPhone = (rule, value, callback) => {
    const myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (myreg.test(value)) {
      callback();
    } else {
      callback('手机号填写有误');
    }
  };

  render() {
    const { form } = this.props;
    const {
      mail,
      syslog,
      smsing,
      teste,
      tests,
      testm,
      email,
      sys,
      sms,
      smsModalVisible,
    } = this.state;
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
    return (
      <div className="TableTdPaddingWrap">
        <div className={styles.accessWrap}>
          <div>
            <h4 className={styles.title2}>邮件服务器配置</h4>
            <Row>
              <Col span={3}>
                <p>服务器地址：</p>
              </Col>
              <Col span={6}>
                <Input
                  value={mail.server || ''}
                  onBlur={(e) => {
                    this.portBlur('mail', 'server', e);
                  }}
                  onChange={(e) => {
                    this.handleInputChange('mail', 'server', e);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={3}>
                <p>端口：</p>
              </Col>
              <Col span={6}>
                <Input
                  value={mail.port || ''}
                  onBlur={(e) => {
                    this.portBlur('mail', 'port', e);
                  }}
                  onChange={(e) => {
                    this.handleInputChange('mail', 'port', e);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={3}>
                <p>用户名：</p>
              </Col>
              <Col span={6}>
                <Input
                  value={mail.reserve1 || ''}
                  onBlur={(e) => {
                    this.portBlur('mail', 'reserve1', e);
                  }}
                  onChange={(e) => {
                    this.handleInputChange('mail', 'reserve1', e);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={3}>
                <p>密码：</p>
              </Col>
              <Col span={6}>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={mail.reserve2 || ''}
                  onChange={(e) => {
                    this.handleInputChange('mail', 'reserve2', e);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={3}>
                <p>协议：</p>
              </Col>
              <Col span={6}>
                <Select
                  value={mail.reserve3 || 'SMTP'}
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    this.handleInputChange('mail', 'reserve3', e);
                  }}
                >
                  <Option value="SMTP">SMTP</Option>
                  <Option value="SMTPS">SMTPS</Option>
                  <Option value="SMTP-STARTTLS">SMTP-STARTTLS</Option>
                </Select>
              </Col>
              <Col span={5}>
                {this.accessAuth === 'rw' && (
                  <Button loading={teste} className={styles.btnStyle} onClick={this.handleMailTest}>
                    测试邮件
                  </Button>
                )}
              </Col>
            </Row>
          </div>
          <Divider />
          <div>
            <h4 className={styles.title2}>Syslog配置</h4>
            <Row>
              <Col span={3}>
                <p>服务器地址：</p>
              </Col>
              <Col span={6}>
                <Input
                  value={syslog.server || ''}
                  onBlur={(e) => {
                    this.portBlur('syslog', 'server', e);
                  }}
                  onChange={(e) => {
                    this.handleInputChange('syslog', 'server', e);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={3}>
                <p>端口：</p>
              </Col>
              <Col span={6}>
                <Input
                  value={syslog.port || ''}
                  onBlur={(e) => {
                    this.portBlur('syslog', 'port', e);
                  }}
                  onChange={(e) => {
                    this.handleInputChange('syslog', 'port', e);
                  }}
                />
              </Col>
              {/* <Col span={5}>
                <Button className={styles.btnStyle} onClick={this.handleSysTest}>
                  测试syslog
                </Button>
              </Col> */}
            </Row>
            <Row>
              <Col span={3}>
                <p>协议：</p>
              </Col>
              <Col span={6}>
                <Select
                  value={syslog.reserve1 || 'UDP'}
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    this.handleInputChange('syslog', 'reserve1', e);
                  }}
                >
                  <Option value="UDP">UDP</Option>
                  <Option value="TCP">TCP</Option>
                </Select>
              </Col>
              <Col span={5}>
                {this.accessAuth === 'rw' && (
                  <Button loading={tests} className={styles.btnStyle} onClick={this.handleSysTest}>
                    测试syslog
                  </Button>
                )}
              </Col>
            </Row>
          </div>

          <Divider />
          <div>
            <h4 className={styles.title2}>短信配置</h4>
            <Row>
              <Col span={3}>
                <p>服务器地址：</p>
              </Col>
              <Col span={6}>
                <Input
                  value={sms.server || ''}
                  onBlur={(e) => {
                    this.portBlur('sms', 'server', e);
                  }}
                  onChange={(e) => {
                    this.handleInputChange('sms', 'server', e);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={3}>
                <p>端口：</p>
              </Col>
              <Col span={6}>
                <Input
                  value={sms.port || ''}
                  onBlur={(e) => {
                    this.portBlur('sms', 'port', e);
                  }}
                  onChange={(e) => {
                    this.handleInputChange('sms', 'port', e);
                  }}
                />
              </Col>
              <Col span={5}>
                {this.accessAuth === 'rw' && (
                  <Button loading={testm} className={styles.btnStyle} onClick={this.handleSmsTest}>
                    测试短信
                  </Button>
                )}
              </Col>
            </Row>
          </div>
          <Divider />
          {this.accessAuth === 'rw' && (
            <Fragment>
              <Button loading={email || sys || smsing} type="primary" onClick={this.handelSave}>
                保存更改
              </Button>
              <Button className={styles.btnStyle} onClick={this.handelCancel}>
                取消
              </Button>
            </Fragment>
          )}
        </div>
        {smsModalVisible && (
          <Modal
            title="测试短信配置"
            visible={smsModalVisible}
            onCancel={this.modalCancel}
            onOk={this.onOKSave}
          >
            <Form className="formStyle">
              <FormItem {...formItemLayout} label="测试手机号" extra="">
                {getFieldDecorator('phoneNum', {
                  initialValue: '',
                  rules: [
                    {
                      required: true,
                      message: '必填',
                    },
                    {
                      validator: this.validatPhone,
                    },
                  ],
                })(<Input placeholder="请填写手机号" />)}
              </FormItem>
            </Form>
          </Modal>
        )}
      </div>
    );
  }
}

// export default NoticeSystemAccess;
export default Form.create()(NoticeSystemAccess);
