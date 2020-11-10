import React, { Component } from 'react';
import { connect } from 'umi';
import { InfoCircleFilled } from '@ant-design/icons';
import { Alert, message } from 'antd';
import { history } from 'umi';
import Login from '@/components/Login';
import UploadTml from '@/components/Upload';
// import moment from 'moment';
import styles from './Login.less';

const crypto = require('crypto');

const { UserName, Password, Submit } = Login;

@connect(({ global, login, loading }) => ({
  login,
  global,
  submitting: loading.effects['login/login'],
  licenseLoading: loading.effects['global/fetchLicense'],
}))
class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'account',
      userName: '',
      userPwd: '',
      // showQcer: false,
      // loadingQcer: false,
      accept: '.qcer',
      action: '/api/user/uploadLicense',
      fileType: 'license',
      showUploadError: false,
      errorMsg: '',
    };
  }

  onTabChange = (type) => {
    this.setState({ type });
  };

  handleSubmit = (err, values) => {
    const { dispatch } = this.props;
    if (!err) {
      const { pass, user } = values;
      const hexPass = crypto.createHash('md5').update(pass).digest('hex');
      dispatch({
        type: 'login/login',
        payload: {
          user,
          pass: hexPass,
          cmd: 'login',
        },
      })
        .then(() => {
          const {
            login: {
              loginStatus: { msg = '' },
            },
          } = this.props;
          if (msg === '密码过期，请修改密码，再重新登录') {
            message.warn('密码过期，请修改密码');
            history.push('/user/modifyPwd');
          } else {
            // this.licenseExpiredTip();
          }
        })
        .catch((err) => {
          console.error('登录失败==', err);
        });
    }
  };

  onPressEnter = () => {
    const { userName, userPwd } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'login/login',
      payload: {
        user: userName,
        pass: userPwd,
        cmd: 'login',
      },
    }).then(() => {
      const {
        login: {
          loginStatus: { msg = '' },
        },
      } = this.props;
      if (msg === '密码过期，请修改密码，再重新登录') {
        message.warn('密码过期，请修改密码');
        history.push('/user/modifyPwd');
      } else {
        // this.licenseExpiredTip();
      }
    });
  };

  renderMessage = (content) => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  beforeUpload = (file) => {
    // image/x-icon  '.qcer'
    console.log('file.type==', file.type, 'file.name', file.name);

    const type = file.name.split('.').pop();
    const isOk = type === 'qcer';
    if (!isOk) {
      message.error('上传文件类型不合法，请选择.qcer文件上传！');
    }
    const is1G = file.size / 1024 / 1024 < 1024;
    if (!is1G) {
      message.error('文件大小不能超过1G，请重试');
    }
    return isOk && is1G;
  };

  closeAlert = () => {
    this.setState({ showUploadError: false, errorMsg: '' });
  };

  uploadError = (msg) => {
    this.setState({ showUploadError: true, errorMsg: msg });
  };

  uploadSuccess = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchLicense',
    }).then(() => {
      dispatch({ type: 'global/changeWebAuth' });
    });
    this.setState({ showUploadError: false });
  };

  render() {
    const {
      login: { loginStatus },
      global: { hasLicense },
      licenseLoading,
      submitting,
    } = this.props;
    const {
      type,
      userName,
      userPwd,
      accept,
      action,
      fileType,
      showUploadError,
      errorMsg,
    } = this.state;
    const errmsg = loginStatus.msg;
    return (
      <div className={styles.main}>
        {showUploadError && (
          <div className={styles.msg}>
            <Alert
              type="error"
              message={errorMsg}
              showIcon
              closable
              onClose={() => {
                this.closeAlert();
              }}
            />
          </div>
        )}
        {hasLicense ? (
          <Login
            defaultActiveKey={type}
            onTabChange={this.onTabChange}
            onSubmit={this.handleSubmit}
          >
            {errmsg && !submitting && this.renderMessage(errmsg)}
            <UserName
              name="user"
              placeholder="账号"
              defaultValue={userName}
              onChange={(e) => {
                const { value } = e.target;
                this.setState({ userName: value });
              }}
              onPressEnter={this.onPressEnter}
            />
            <Password
              name="pass"
              placeholder="密码"
              defaultValue={userPwd}
              onChange={(e) => {
                const { value } = e.target;
                const hexPass = crypto.createHash('md5').update(value).digest('hex');
                this.setState({ userPwd: hexPass });
              }}
              onPressEnter={this.onPressEnter}
            />
            <Submit loading={submitting}>登录</Submit>
          </Login>
        ) : !this.state.showUploadError ? (
          <div loading={licenseLoading}>
            <div className={styles.uploadCon}>
              <div className={styles.tips}>
                <InfoCircleFilled className="fontBlue" />
                <span className={styles.tipsText}>登录前请导入.qcer格式许可证</span>
              </div>
            </div>
            <div className={styles.uploadCon}>
              <div className={styles.upload}>
                <UploadTml
                  // cmd="upload_license"
                  style={{ background: 'red' }}
                  type={fileType}
                  accept={accept}
                  action={action}
                  error={this.uploadError}
                  success={this.uploadSuccess}
                />
              </div>
            </div>
          </div>
        ) : (
          <div loading={licenseLoading}>
            <div className={styles.uploadCon}>
              {/* <Alert  className={styles.tipsError} message="许可证导入失败，请重试" type="warning" showIcon  />   */}
              <div className={styles.tipsError}>
                <InfoCircleFilled className="fontBlue" style={{ color: '#ff8d1a' }} />
                <span className={styles.tipsText}>许可证导入失败，请重试</span>
              </div>
            </div>
            <div className={styles.uploadCon}>
              <div className={styles.upload}>
                <UploadTml
                  // cmd="upload_license"
                  type={fileType}
                  accept={accept}
                  action={action}
                  error={this.uploadError}
                  showUploadError={this.state.showUploadError}
                  success={this.uploadSuccess}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default LoginPage;
