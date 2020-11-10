/* eslint-disable camelcase */
/* eslint-disable react/no-array-index-key */
import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import Cookies from 'js-cookie';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import { EyeOutlined, QuestionCircleFilled, UploadOutlined } from '@ant-design/icons';
import {
  Upload,
  Modal,
  Tooltip,
  Spin,
  message,
  Input,
  Button,
  Col,
  Row,
  Table,
  Radio,
  Select,
  InputNumber,
  DatePicker,
  Cascader,
  Tabs,
} from 'antd';

import configSettings from '../../configSettings';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

const { TabPane } = Tabs;
const RadioGroup = Radio.Group;
const { Option } = Select;
@connect(({ systemSafety, global, loading }) => ({
  systemSafety,
  showTce: global.showTce,
  loading: loading.effects['systemSafety/fetchNetAddrList'],
  loading1: loading.effects['systemSafety/fetchLogosPath'],
}))
class SystemSafety extends Component {
  constructor(props) {
    super(props);
    this.safetyAuth = getAuth('/systemSetting/safety');
    this.state = {
      loginSet: {
        failure_time: '',
        lock_time: '',
        session_invalid_time: '',
        password_invalid_time: '',
      },
      password: {
        password_complexity: '',
      },
      timeSet: {
        cmd: 'set_ntp_info',
        status: 1,
        timezone: 'CST',
        ntp_ip: '192.168.1.104',
        now: '',
      },
      devArea: [],
      currentHoverRow: '', // 当前hover的行
      ipOperation: false, // 显示操作
      logoUrl: { logoLogin: '', logoMenu: '', logoFavicon: '', logoReport: '' },
      previewVisible: false,
      previewImage: '',
      previewImgBgColor: '',
      loadingLogoLogin: false,
      loadingLogoMenu: false,
      loadingLogoFavicon: false,
      loadingLogoReport: false,
      webName: '高级威胁检测系统',
      failReqing: false,
      passwordReqing: false,
      lockReqing: false,
      outReqing: false,
      ntpReqing: false,
      addressReqing: false,
    };

    this.columns = [
      {
        title: '网络接口',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          if (text) {
            return <span className={styles.greenStyle}>正常</span>;
          }
          return <span className={styles.redStyle}>异常</span>;
        },
      },
      {
        title: 'IP/掩码',
        dataIndex: 'ip',
        key: 'ip',
        // render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        render: (text, record) => {
          const { ipOperation } = this.state;

          const uerCls = classNames(styles.userText, {
            [styles.noUserText]: ipOperation,
          });
          return (
            <div className={styles.tableAction}>
              <div className={uerCls}>
                <div className={styles.showText}>{text}</div>
                {/* 编辑功能暂时隐藏 */}
                {/* <div className={styles.showIcon}>
                  <Icon
                    onClick={() => {
                      this.setState({ ipOperation: !ipOperation });
                    }}
                    type="form"
                    theme="outlined"
                    style={{ color: '#5cbaea' }}
                  />
                </div> */}
              </div>
              {ipOperation && (
                <div className={styles.userInput}>
                  <Input
                    size="small"
                    onPressEnter={(e) => {
                      const { value } = e.target;
                      const flag = configSettings.validIpAndMask(value);
                      if (flag) {
                        this.updateIpEvent(record.id, value);
                      } else {
                        message.error('ip格式不正确，请重新输入');
                      }
                      this.setState({ ipOperation: false });
                    }}
                  />
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '属性',
        dataIndex: 'property',
        key: 'property',
        render: (text) => {
          return (
            <div>
              <span>{text}</span>
            </div>
          );
        },
      },
    ];
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'systemSafety/fetchTimeZones',
    });
    // dispatch({
    //   type: 'systemSafety/fetchNetCard',
    //   payload: { ipVal: '127.0.0.1' },
    // });
  }

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'systemSafety/fetchNetAddrList',
      payload: { ipVal: '127.0.0.1' },
    });
    dispatch({
      type: 'systemSafety/fetchNtpObj',
      payload: { cmd: 'get_ntp_info' },
    }).then(() => {
      const {
        systemSafety: { ntpObj },
      } = this.props;
      const { timeSet } = this.state;
      const newSet = Object.assign({}, timeSet, ntpObj);
      this.setState({ timeSet: newSet });
    });
    dispatch({
      type: 'systemSafety/fetchLogin',
    }).then(() => {
      const {
        systemSafety: { loginSet },
      } = this.props;
      this.setState({ loginSet });
    });
    dispatch({
      type: 'systemSafety/fetchPassword',
    }).then(() => {
      const {
        systemSafety: { password },
      } = this.props;
      this.setState({ password });
    });

    dispatch({
      type: 'systemSafety/fetchLogosPath',
    }).then(() => {
      const {
        systemSafety: { logoUrl, webName },
      } = this.props;
      const showUrl = {
        logoLogin: logoUrl.logo_login || logoUrl.logo_login_default,
        logoMenu: logoUrl.logo_menu || logoUrl.logo_menu_default,
        logoFavicon: logoUrl.logo_favicon || logoUrl.logo_favicon_default,
        logoReport: logoUrl.logo_report || logoUrl.logo_report_default,
      };
      this.setState({ logoUrl: showUrl, webName });
    });

    dispatch({
      type: 'systemSafety/fetchAreaAndDeviceAddress',
    })
      .then((devArea) => {
        this.setState({ devArea });
      })
      .catch((err) => {
        message.error(err.msg);
      });
  }

  updateIpEvent = (id, value) => {
    console.log('表格ip编辑--', 'id', id, 'value', value);
  };

  // handleProperty = record => {
  //   const { flowReqing } = this.state;
  //   const { dispatch } = this.props;
  //   if (flowReqing) return;
  //   this.setState({ flowReqing: true });
  //   dispatch({
  //     type: 'systemSafety/updateNetCard',
  //     payload: { ipVal: record.curIp, eth1: record.name },
  //   })
  //     .then(() => {
  //       message.success('设置成功');
  //       dispatch({ type: 'systemSafety/fetchNetCard', payload: { ipVal: '127.0.0.1' } });
  //       this.setState({ flowReqing: false });
  //     })
  //     .catch(error => {
  //       message.error(error.msg);
  //       this.setState({ flowReqing: false });
  //     });
  // };

  handleInputChange = (type, key, e) => {
    const { [type]: curType } = this.state;
    let curVal = '';
    if (type === 'loginSet') {
      curVal = typeof e === 'number' ? e : '';
    } else {
      const { value } = e.target;
      curVal = value;
      if (key === 'status') {
        curVal = Number(value);
      }
    }

    const newType = Object.assign({}, curType, { [key]: curVal });
    this.setState({ [type]: newType });
  };

  inputBlur = (type, key, e) => {
    const { value } = e.target;
    if (value) {
      let flag = true;
      let tip = '';
      if (type === 'timeSet' && key === 'ntp_ip') {
        tip = 'NTP服务器地址格式有误，请重新填写';
        flag = configSettings.isValidIP(value) || configSettings.validIpv6(value);
        const ipValidata = configSettings.isValidIP(value);
        const ipv6Validata = configSettings.validIpv6(value);
        const domainValidate = configSettings.validateServer(value);
        flag = ipValidata || ipv6Validata || domainValidate;
      }

      if (!flag) {
        message.error(`${tip}`);
        e.target.value = '';
        const { [type]: curType } = this.state;
        const newType = Object.assign({}, curType, { [key]: '' });
        this.setState({ [type]: newType });
      }
    }
  };

  webNameBlur = (e) => {
    const { value: val } = e.target;
    const value = configSettings.trimStr(val);
    let flag = true;
    let tip = '';
    if (!value) {
      tip = '名称不能为空';
      flag = false;
    }
    if (value.length > 20) {
      tip = '名称长度不能超过20个字符';
      flag = false;
    }
    const pattern = new RegExp(
      "[`~!@#$^&*()={}\\/\\\\'.:,+_\";'\\[\\]%<>?~！@#￥……&*（）|\\s+《》——{}【】‘；：”“'。，、？]"
    );
    // console.log('pattern==', pattern);
    if (pattern.test(value)) {
      tip = '名称不能包含“~!@#$^&*()={}”等非法字符';
      flag = false;
    }
    if (!flag) {
      message.info(`${tip}，自动填充为默认值`);
      e.target.value = '高级威胁检测系统';
      this.setState({ webName: '高级威胁检测系统' });
    }
  };

  webNameChange = (e) => {
    const { value } = e.target;
    this.setState({ webName: value });
  };

  // logo图上传
  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  beforeUpload = (file) => {
    // image/x-icon
    // const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
    let isPic = true;
    if (file.type) {
      isPic = file.type.split('/')[0] === 'image';
    }
    if (!isPic) {
      message.error('请上传图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
      message.error('图片大小不得超过 1MB!');
    }
    return isPic && isLt2M;
  };

  handleChangeLogo = async (info, logoNum) => {
    const logoState = `loadingLogo${logoNum}`;
    const logoName = `logo${logoNum}`;

    try {
      if (info.file.status === 'uploading') {
        this.setState({ [logoState]: true });
        return;
      }
      if (info.file.status === 'done') {
        const { response } = info.file;
        if (response.error_code === 0) {
          const { logoUrl } = this.state;
          const curUrl = { [logoName]: response.data.path };
          const newUrl = Object.assign({}, logoUrl, curUrl);
          // console.log(555, 'newUrl==', newUrl);

          let logoType = logoNum.toLowerCase();
          if (logoType === 'logintop') {
            logoType = 'loginTop';
          }

          const web_key = `logo_${logoType}`;
          let type = 'add';
          const {
            systemSafety: { curLogo },
            dispatch,
          } = this.props;
          if (curLogo[web_key] !== undefined) {
            type = 'update';
          }
          await dispatch({
            type: 'systemSafety/updateLogosPath',
            payload: { type, web_key, web_value: response.data.path },
          });
          await dispatch({ type: 'global/fetchLogoUrl' });
          await dispatch({ type: 'systemSafety/fetchLogosPath' });
          this.setState({
            logoUrl: newUrl,
            [logoState]: false,
          });
          message.success('logo上传成功');
        } else {
          this.setState({
            [logoState]: false,
          });
          message.error(`logo上传失败：${response.msg}`);
        }
      }
    } catch (error) {
      console.log('logo上传失败_error==', error);
      this.setState({
        [logoState]: false,
      });
      message.error(`logo上传失败：${error.msg}`);
    }
  };

  backIniLogo = (logoNum) => {
    // const logoState = `loadingLogo${logoNum}`;
    const {
      systemSafety: { logoUrl: propsUrl, curLogo },
      dispatch,
    } = this.props;

    const logoType = logoNum.toLowerCase();
    // if (logoType === 'logintop') {
    //   logoType = 'loginTop';
    // }

    const defaultPath = propsUrl[`logo_${logoType}_default`];

    const { logoUrl } = this.state;
    const logoName = `logo${logoNum}`;
    const curUrl = { [logoName]: defaultPath };
    const newUrl = Object.assign({}, logoUrl, curUrl);

    const web_key = `logo_${logoType}`;
    let type = 'add';
    if (curLogo[web_key] !== undefined) {
      type = 'update';
    }
    dispatch({
      type: 'systemSafety/updateLogosPath',
      payload: { type, web_key, web_value: defaultPath },
    })
      .then(() => {
        message.success('恢复默认设置成功');
        dispatch({ type: 'global/fetchLogoUrl' });
        dispatch({ type: 'systemSafety/fetchLogosPath' });
        this.setState({
          logoUrl: newUrl,
        });
        // this.setState({ [logoState]: false });
      })
      .catch(() => {
        message.error('恢复默认设置失败');
        // this.setState({ [logoState]: false });
      });
  };

  handleSaveClick = () => {
    const {
      timeSet,
      failReqing,
      passwordReqing,
      lockReqing,
      outReqing,
      ntpReqing,
      addressReqing,
      webName,
    } = this.state;
    const { status, now } = timeSet; // ntp_ip: ntpIp,
    // if (status === 1 && !ntpIp) {
    //   message.error('请填写NTP服务器地址');
    //   return;
    // }
    if (status === 0 && !now) {
      message.error('请选择设备时间');
      return;
    }

    const reqFlag =
      failReqing || passwordReqing || lockReqing || outReqing || ntpReqing || addressReqing;
    const {
      dispatch,

      // showTce,
      systemSafety: { webName: webNameProps, curLogo, ntpObj },
    } = this.props;

    if (webNameProps !== webName) {
      if (reqFlag) return;
      const type = typeof curLogo.web_name === 'undefined' ? 'add' : 'update';
      dispatch({
        type: 'systemSafety/updateWebName',
        payload: { type, web_key: 'web_name', web_value: webName },
      })
        .then(() => {
          message.success('自定义标题设置成功');
          dispatch({ type: 'global/fetchLogoUrl' });
          dispatch({ type: 'systemSafety/fetchLogosPath' });
        })
        .catch(() => {
          message.error('自定义标题设置失败');
        });
    }

    const ntpInfo = Object.assign({}, ntpObj, { cmd: 'set_ntp_info' });
    if (!_.isEqual(ntpInfo, timeSet)) {
      if (reqFlag) return;
      this.setState({ ntpReqing: true });
      dispatch({
        type: 'systemSafety/updateNtpObj',
        payload: timeSet,
      })
        .then(() => {
          message.success('系统时间设置成功');
          dispatch({
            type: 'systemSafety/fetchNtpObj',
            payload: { cmd: 'get_ntp_info' },
          }).then(() => {
            const {
              systemSafety: { ntpObj: ntpObj1 },
            } = this.props;
            const { timeSet: timeSet1 } = this.state;
            const newSet = Object.assign({}, timeSet1, ntpObj1);
            this.setState({ timeSet: newSet, ntpReqing: false });
          });
        })
        .catch((error) => {
          // message.error(`系统时间设置失败：${error.msg}`);
          message.error(`系统时间设置失败`);
          this.setState({ ntpReqing: false });
        });
    }

    const {
      systemSafety: {
        loginSet: {
          failure_time: failuretime1,
          lock_time: locktime1,
          session_invalid_time: sessioninvalidtime1,
          password_invalid_time: passwordinvalidtime1,
        },
        devAreaSave,
      },
    } = this.props;
    const {
      loginSet: {
        failure_time: failuretime2,
        lock_time: locktime2,
        session_invalid_time: sessioninvalidtime2,
        password_invalid_time: passwordinvalidtime2,
      },
      devArea,
    } = this.state;
    if (failuretime1 !== failuretime2) {
      if (reqFlag) return;
      this.setState({ failReqing: true });
      dispatch({
        type: 'systemSafety/updateLogin',
        payload: { name: 'failure_time', value: failuretime2 },
      })
        .then(() => {
          message.success('登录失败次数上限设置成功');
          dispatch({
            type: 'systemSafety/fetchLogin',
          });
          this.setState({ failReqing: false });
        })
        .catch(() => {
          message.error('登录失败次数上限设置失败');
          this.setState({ failReqing: false });
        });
    }
    if (locktime1 !== locktime2) {
      if (reqFlag) return;
      this.setState({ lockReqing: true });
      dispatch({
        type: 'systemSafety/updateLogin',
        payload: { name: 'lock_time', value: locktime2 },
      })
        .then(() => {
          message.success('锁定时间设置成功'); // 登录失败
          dispatch({
            type: 'systemSafety/fetchLogin',
          });
          this.setState({ lockReqing: false });
        })
        .catch(() => {
          message.error('锁定时间设置失败');
          this.setState({ lockReqing: false });
        });
    }
    if (sessioninvalidtime1 !== sessioninvalidtime2) {
      if (reqFlag) return;
      this.setState({ outReqing: true });
      dispatch({
        type: 'systemSafety/updateLogin',
        payload: { name: 'session_invalid_time', value: sessioninvalidtime2 },
      })
        .then(() => {
          message.success('页面超出时间设置成功');
          this.setState({ outReqing: false });
          dispatch({
            type: 'systemSafety/fetchLogin',
          });
        })
        .catch(() => {
          message.error('页面超出时间设置失败');
          this.setState({ outReqing: false });
        });
    }
    if (!_.isEqual(devAreaSave, devArea)) {
      if (addressReqing) return;
      this.setState({ addressReqing: true });
      dispatch({
        type: 'systemSafety/updateDeviceAddress',
        payload: { address: devArea },
      })
        .then(() => {
          message.success('设备安装地址设置成功');
          this.setState({ addressReqing: false });
          dispatch({
            type: 'systemSafety/fetchDeviceAddress',
          })
            .then((devAreaNew) => {
              this.setState({ devArea: devAreaNew });
            })
            .catch(() => {});
        })
        .catch(() => {
          this.setState({ failReqing: false });
        });
    }
    if (passwordinvalidtime1 !== passwordinvalidtime2) {
      if (reqFlag) return;
      this.setState({ outReqing: true });
      dispatch({
        type: 'systemSafety/updateLogin',
        payload: { name: 'password_invalid_time', value: passwordinvalidtime2 },
      })
        .then(() => {
          message.success('密码过期时间设置成功');
          this.setState({ outReqing: false });
          dispatch({
            type: 'systemSafety/fetchLogin',
          });
        })
        .catch(() => {
          message.error('密码过期时间设置失败');
          this.setState({ outReqing: false });
        });
    }
    const {
      systemSafety: {
        password: { password_complexity: password_complexity1 },
      },
    } = this.props;
    const {
      password: { password_complexity: password_complexity2 },
    } = this.state;
    if (password_complexity1 !== password_complexity2) {
      console.log('xx', password_complexity1, password_complexity2);
      if (reqFlag) return;
      this.setState({ passwordReqing: true });
      dispatch({
        type: 'systemSafety/updatePassword',
        payload: { name: 'password_complexity', value: password_complexity2 },
      })
        .then(() => {
          message.success('密码复杂度设置成功');
          this.setState({ passwordReqing: false });
          dispatch({
            type: 'systemSafety/fetchPassword',
          });
        })
        .catch(() => {
          message.error('密码复杂度设置失败');
          this.setState({ passwordReqing: false });
        });
    }
  };

  onRef = (ref) => {
    this.child = ref;
  };

  render() {
    const {
      loginSet,
      password,
      timeSet,
      currentHoverRow,
      devArea,
      logoUrl,
      previewImage,
      previewImgBgColor,
      previewVisible,
      loadingLogoLogin,
      loadingLogoFavicon,
      loadingLogoMenu,
      loadingLogoReport,
      webName,

      failReqing,
      passwordReqing,
      lockReqing,
      outReqing,
      ntpReqing,
      addressReqing,
    } = this.state;
    const reqFlaging =
      failReqing || passwordReqing || lockReqing || outReqing || ntpReqing || addressReqing;
    const {
      systemSafety: {
        timeZoneTags,
        netAddrList: { list },
        areaInfo,
      },
      loading,
      loading1,
      showTce, // tce 登录 密码相关不显示
    } = this.props;
    const { status } = timeSet;
    let deviceTimeDis = false;
    let ntpDis = true;
    if (status) {
      ntpDis = false;
      deviceTimeDis = true;
    }
    // console.log('timeZoneTags--', timeZoneTags);
    const { logoLogin, logoMenu, logoFavicon, logoReport } = logoUrl;

    if (loading) {
      return (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <Spin size="large" />
        </div>
      );
    }
    return (
      // <PageHeaderWrapper>
      // </PageHeaderWrapper>
      <div>
        {/* <div className="commonHeader">安全性及其他设置</div> */}
        <div className={styles.contentWrap}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="安全性" key="1">
              {showTce !== '1' && (
                <Fragment>
                  <Row className={styles.rowBlock}>
                    <Col span={5}>
                      <h4 className={styles.title4}>登录安全</h4>
                    </Col>
                    <Col span={19}>
                      <Row>
                        <Col span={6}>
                          <p>登录失败次数上限：</p>
                        </Col>
                        <Col span={10}>
                          <InputNumber
                            min={1}
                            max={999}
                            formatter={(value) => value}
                            parser={(value) => value.replace(/[,.$@]/g, '')}
                            style={{ width: '100%' }}
                            value={loginSet.failure_time || ''}
                            onChange={(e) => {
                              this.handleInputChange('loginSet', 'failure_time', e);
                            }}
                          />
                        </Col>
                        <Col span={2}>
                          <p>&nbsp;次</p>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={6}>
                          <p>登录失败锁定时间：</p>
                        </Col>
                        <Col span={10}>
                          <InputNumber
                            min={1}
                            max={999}
                            formatter={(value) => value}
                            parser={(value) => value.replace(/[,.$@]/g, '')}
                            style={{ width: '100%' }}
                            value={loginSet.lock_time || ''}
                            onChange={(e) => {
                              this.handleInputChange('loginSet', 'lock_time', e);
                            }}
                          />
                        </Col>
                        <Col span={2}>
                          <p>&nbsp;分钟</p>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={6}>
                          <p>页面超出时间：</p>
                        </Col>
                        <Col span={10}>
                          <InputNumber
                            min={1}
                            max={9999}
                            formatter={(value) => value}
                            parser={(value) => value.replace(/[,.$@]/g, '')}
                            style={{ width: '100%' }}
                            value={loginSet.session_invalid_time || ''}
                            onChange={(e) => {
                              this.handleInputChange('loginSet', 'session_invalid_time', e);
                            }}
                          />
                        </Col>
                        <Col span={2}>
                          <p>&nbsp;分钟</p>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={6}>
                          <p>密码过期时间：</p>
                        </Col>
                        <Col span={10}>
                          <InputNumber
                            min={10}
                            max={999}
                            formatter={(value) => value}
                            parser={(value) => value.replace(/[,.$@]/g, '')}
                            style={{ width: '100%' }}
                            value={loginSet.password_invalid_time || ''}
                            onChange={(e) => {
                              this.handleInputChange('loginSet', 'password_invalid_time', e);
                            }}
                          />
                        </Col>
                        <Col span={2}>
                          <p>&nbsp;天</p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row className={styles.rowBlock}>
                    <Col span={5}>
                      <h4 className={styles.title4}>密码安全</h4>
                    </Col>
                    <Col span={19}>
                      <Radio.Group
                        onChange={(e) => {
                          this.handleInputChange('password', 'password_complexity', e);
                        }}
                        value={password.password_complexity || '2'}
                      >
                        <Radio className={styles.radioStyle} value="1">
                          高密码强度(密码长度8位以上，必须包含大小写字母、数字、下划线中的三类)
                        </Radio>
                        <Radio className={styles.radioStyle} value="2">
                          中密码强度(密码长度8位及以上，必须包含大写字母、小写字母、数字中的两类且不能全部都是字母)
                        </Radio>
                        <Radio className={styles.radioStyle} value="3">
                          弱密码强度(密码长度6位以上)
                        </Radio>
                      </Radio.Group>
                    </Col>
                  </Row>
                </Fragment>
              )}
            </TabPane>

            <TabPane tab="自定义" key="2">
              {loading1 ? (
                <div style={{ textAlign: 'center', marginTop: 80 }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Fragment>
                  <Row className={styles.rowBlock}>
                    <Col span={5}>
                      <h4 className={styles.title4}>自定义标题</h4>
                    </Col>
                    <Col span={19}>
                      <Row>
                        <Col span={6}>
                          <p>名称：</p>
                        </Col>
                        <Col span={10}>
                          <Input
                            value={webName}
                            onBlur={this.webNameBlur}
                            onChange={this.webNameChange}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Row className={styles.rowBlock}>
                    <Col span={5}>
                      <h4 className={styles.title4}>自定义logo</h4>
                    </Col>
                    <Col span={19}>
                      <div className={styles.logoWrapCol}>
                        <div className={styles.logoWrapDiv}>
                          <div className={styles.logoImgDiv}>
                            <div className={styles.imgBox}>
                              <img className={styles.logoImg} alt="logoLogin" src={logoLogin} />
                            </div>

                            <a
                              title="预览logo"
                              className={styles.logoImga}
                              onClick={() => {
                                this.setState({
                                  previewImage: logoLogin,
                                  previewVisible: true,
                                });
                              }}
                            >
                              <EyeOutlined />
                            </a>
                          </div>
                          <div>
                            登录页logo{` `}
                            <Tooltip title="建议图片尺寸：320 * 120">
                              <QuestionCircleFilled style={{ color: '#2662EE' }} />
                            </Tooltip>
                          </div>
                          {this.safetyAuth === 'rw' && (
                            <Fragment>
                              <div>
                                <Upload
                                  name="file"
                                  showUploadList={false}
                                  action="/api/safety/upload_logo"
                                  beforeUpload={this.beforeUpload}
                                  headers={{
                                    Authorization: Cookies.get('token'),
                                  }}
                                  onChange={(info) => this.handleChangeLogo(info, 'Login')}
                                >
                                  <div style={{ width: 91 }}>
                                    {!loadingLogoLogin ? (
                                      <Button className="smallWhiteBtn">
                                        <UploadOutlined /> 上传图片
                                      </Button>
                                    ) : (
                                      <Spin size="small" />
                                    )}
                                  </div>
                                </Upload>
                              </div>
                              <div>
                                <a onClick={() => this.backIniLogo('Login')}>恢复默认</a>
                              </div>
                            </Fragment>
                          )}
                        </div>

                        <div className={styles.logoWrapDiv}>
                          <div className={styles.logoImgDiv}>
                            <div className={styles.imgBox}>
                              {' '}
                              <img
                                className={styles.logoImg}
                                style={{ backgroundColor: '#383648' }}
                                alt="logoMenu"
                                src={logoMenu}
                              />
                            </div>

                            <a
                              title="预览logo"
                              className={styles.logoImga}
                              onClick={() => {
                                this.setState({
                                  previewImage: logoMenu,
                                  previewVisible: true,
                                  previewImgBgColor: '#383648',
                                });
                              }}
                            >
                              <EyeOutlined />
                            </a>
                          </div>
                          <div>
                            导航栏logo{` `}
                            <Tooltip title="建议图片尺寸：29 * 32">
                              <QuestionCircleFilled style={{ color: '#2662EE' }} />
                            </Tooltip>
                          </div>

                          {this.safetyAuth === 'rw' && (
                            <Fragment>
                              <div>
                                <Upload
                                  name="file"
                                  showUploadList={false}
                                  action="/api/safety/upload_logo"
                                  beforeUpload={this.beforeUpload}
                                  headers={{
                                    Authorization: Cookies.get('token'),
                                  }}
                                  onChange={(info) => this.handleChangeLogo(info, 'Menu')}
                                >
                                  <div style={{ width: 91 }}>
                                    {!loadingLogoMenu ? (
                                      <Button className="smallWhiteBtn">
                                        <UploadOutlined /> 上传图片
                                      </Button>
                                    ) : (
                                      <Spin size="small" />
                                    )}
                                  </div>
                                </Upload>
                              </div>
                              <div>
                                <a onClick={() => this.backIniLogo('Menu')}>恢复默认</a>
                              </div>
                            </Fragment>
                          )}
                        </div>

                        <div className={styles.logoWrapDiv}>
                          <div className={styles.logoImgDiv}>
                            <div className={styles.imgBox}>
                              <img className={styles.logoImg} alt="logoReport" src={logoReport} />
                            </div>
                            <a
                              title="预览logo"
                              className={styles.logoImga}
                              onClick={() => {
                                this.setState({
                                  previewImage: logoReport,
                                  previewVisible: true,
                                });
                              }}
                            >
                              <EyeOutlined />
                            </a>
                          </div>
                          <div>
                            报表logo{` `}
                            <Tooltip title="建议图片尺寸：200 * 66">
                              <QuestionCircleFilled style={{ color: '#2662EE' }} />
                            </Tooltip>
                          </div>

                          {this.safetyAuth === 'rw' && (
                            <Fragment>
                              <div>
                                <Upload
                                  name="file"
                                  // listType="picture-card"
                                  // className="avatar-uploader"
                                  showUploadList={false}
                                  action="/api/safety/upload_logo"
                                  beforeUpload={this.beforeUpload}
                                  headers={{
                                    Authorization: Cookies.get('token'),
                                  }}
                                  onChange={(info) => this.handleChangeLogo(info, 'Report')}
                                >
                                  <div style={{ width: 91 }}>
                                    {!loadingLogoReport ? (
                                      <Button className="smallWhiteBtn">
                                        <UploadOutlined /> 上传图片
                                      </Button>
                                    ) : (
                                      <Spin size="small" />
                                    )}
                                  </div>
                                </Upload>
                              </div>
                              <div>
                                <a onClick={() => this.backIniLogo('Report')}>恢复默认</a>
                              </div>
                            </Fragment>
                          )}
                        </div>

                        <div className={styles.logoWrapDiv}>
                          <div className={styles.logoImgDiv}>
                            <div className={styles.imgBox}>
                              <img className={styles.logoImg} alt="logoFavicon" src={logoFavicon} />
                            </div>

                            <a
                              title="预览logo"
                              className={styles.logoImga}
                              onClick={() => {
                                this.setState({
                                  previewImage: logoFavicon,
                                  previewVisible: true,
                                });
                              }}
                            >
                              <EyeOutlined />
                            </a>
                          </div>
                          <div>
                            favicon图标
                            <Tooltip title="建议图片尺寸：32 * 32">
                              <QuestionCircleFilled style={{ color: '#2662EE' }} />
                            </Tooltip>
                          </div>

                          {this.safetyAuth === 'rw' && (
                            <Fragment>
                              <div>
                                <Upload
                                  name="file"
                                  showUploadList={false}
                                  action="/api/safety/upload_logo"
                                  headers={{
                                    Authorization: Cookies.get('token'),
                                  }}
                                  beforeUpload={this.beforeUpload}
                                  onChange={(info) => this.handleChangeLogo(info, 'Favicon')}
                                >
                                  <div style={{ width: 91 }}>
                                    {!loadingLogoFavicon ? (
                                      <Button className="smallWhiteBtn">
                                        <UploadOutlined /> 上传图片
                                      </Button>
                                    ) : (
                                      <Spin size="small" />
                                    )}
                                  </div>
                                </Upload>
                              </div>
                              <div>
                                <a onClick={() => this.backIniLogo('Favicon')}>恢复默认</a>
                              </div>
                            </Fragment>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Fragment>
              )}
            </TabPane>

            <TabPane tab="设备管理" key="3">
              <Row className={styles.rowBlock}>
                <Col span={5}>
                  <h4 className={styles.title4}>平台网络地址配置</h4>
                </Col>
                <Col span={19}>
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={this.columns}
                    dataSource={list}
                    pagination={false}
                    rowClassName={(record, index) =>
                      index === currentHoverRow ? styles.handleAction : ''
                    }
                    onRow={(record, index) => ({
                      onMouseEnter: () => {
                        this.setState({ currentHoverRow: index });
                      },
                      onMouseLeave: () => {
                        this.setState({
                          currentHoverRow: '',
                          ipOperation: false,
                        });
                      },
                    })}
                  />
                </Col>
              </Row>
              <Row className={styles.rowBlock}>
                <Col span={5}>
                  <h4 className={styles.title4}>系统时间配置</h4>
                </Col>
                <Col span={19}>
                  <Row>
                    <Col span={6}>
                      <p>NTP时间同步：</p>
                    </Col>
                    <Col span={10}>
                      <RadioGroup
                        value={`${timeSet.status}`}
                        onChange={(e) => {
                          this.handleInputChange('timeSet', 'status', e);
                        }}
                      >
                        <Radio value="1">开启</Radio>
                        <Radio value="0">关闭</Radio>
                      </RadioGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <p>NTP服务器地址：</p>
                    </Col>
                    <Col span={10}>
                      <Input
                        disabled={ntpDis}
                        value={timeSet.ntp_ip || ''}
                        onBlur={(e) => {
                          this.inputBlur('timeSet', 'ntp_ip', e);
                        }}
                        onChange={(e) => {
                          this.handleInputChange('timeSet', 'ntp_ip', e);
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <p>选择时区：</p>
                    </Col>
                    <Col span={10}>
                      <Select
                        style={{ width: '100%' }}
                        disabled={ntpDis}
                        value={timeSet.timezone || ''}
                        onChange={(e) => {
                          this.handleInputChange('timeSet', 'timezone', e);
                        }}
                      >
                        {timeZoneTags &&
                          timeZoneTags.map((tag) => (
                            <Option key={tag.value} value={tag.value}>
                              {tag.name}
                            </Option>
                          ))}
                      </Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <p>设备时间：</p>
                    </Col>
                    <Col span={10}>
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="请选择设备时间"
                        disabled={deviceTimeDis}
                        style={{ width: '100%' }}
                        value={timeSet.now ? moment(`${timeSet.now}`, 'YYYY-MM-DD HH:mm:ss') : ''}
                        onChange={(date, dateString) => {
                          const newSet = Object.assign({}, timeSet, { now: dateString });
                          this.setState({ timeSet: newSet });
                        }}
                        // onOk={() => {
                        //   const {
                        //     timeSet: { now },
                        //   } = this.state;
                        //   console.log('onOK', now);
                        // }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <p>设备安装地址：</p>
                    </Col>
                    <Col span={10}>
                      <Cascader
                        style={{ width: '100%' }}
                        defaultValue={devArea}
                        value={devArea}
                        options={areaInfo}
                        onChange={(value, selectOps) => {
                          console.log('value', value, 'selectOps', selectOps);
                          let valueArr = value;
                          if (
                            value.length > 1 &&
                            ['北京市', '上海市', '重庆市', '天津市'].indexOf(value[1]) > -1
                          ) {
                            valueArr = [value[0]];
                          }
                          // else if (value.length === 0) {
                          //   valueArr = [''];
                          // }
                          this.setState({ devArea: valueArr });
                        }}
                        placeholder="请选择地区"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </TabPane>
          </Tabs>

          <Row>
            <Col span={5} />
            <Col span={19}>
              <Row>
                <Col xs={4} sm={4} />
                <Col xs={14} sm={14}>
                  {this.safetyAuth === 'rw' && (
                    <Button
                      className="smallBlueBtn"
                      loading={reqFlaging}
                      style={{ minWidth: 86, height: 34 }}
                      onClick={this.handleSaveClick}
                    >
                      保存更改
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <Modal
          visible={previewVisible}
          bodyStyle={{ textAlign: 'center', padding: '40px 30px' }}
          footer={null}
          onCancel={() => {
            this.setState({ previewImage: '', previewImgBgColor: '', previewVisible: false });
          }}
        >
          <img
            alt="logo"
            style={{ maxWidth: 460, backgroundColor: previewImgBgColor }}
            src={previewImage}
          />
        </Modal>
      </div>
    );
  }
}

export default SystemSafety;
