/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-irregular-whitespace */
import React, { Component, Fragment } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Button, Table, Modal, message, Spin, Input, Popover } from 'antd';
import { connect } from 'umi';
import moment from 'moment';
import styles from './version.less';
import UploadTemplate from '@/components/UploadTemplate';
import UploadPatch from '@/components/UploadPatch';
import UploadModal from '@/components/UploadModal';
import authority from '@/utils/authority';
const { getAuth } = authority;

const FormItem = Form.Item;

const editionVerName = {
  0: '基础版',
  1: '标准版',
  2: '高级版',
};

@connect(({ version, global, loading }) => ({
  version,
  isKVM: global.isKVM,
  loading: loading.effects['version/fetchVersionInfo'],
  loadingTbCheck: loading.effects['version/fetchCheckUpdateTb'],
  loadingTb: loading.effects['version/fetchFunctionalList'],
  loadingClickCheck: loading.effects['version/fetchCheckUpdate'],
  loadingUpdate: loading.effects['version/handleUpdate'],
  loadingChangeLog: loading.effects['version/getChangelog'],
  loadingInfoList: loading.effects['version/getInfolist'],
}))
class Version extends Component {
  constructor(props) {
    super(props);
    this.versionAuth = getAuth('/systemSetting/version');
    this.state = {
      uploadVisible: false,
      uploadModalVisible: false,
      tipVisible: false,
      type: '',
      title: '',
      fileFormat: '',
      accept: '',
      patchAccept: '.bin',
      action: '',
      cmd: '',
      packVersion: '',
      timestamp: '',
      flag: '',
      uploadRes: {},
      ruleMesVisible: false,
      uploadData: {},
      threatFlag: false,
      // 是否显示发现新版本对话框
      newVersionDialogVisible: false,
      visible: false,
      visibleInfo: false,
      // flag: '',
      // upResult: '',
    };
    // 日志内容
    this.content = (changeLog) => (
      <div>
        {changeLog.map((item, logIndex) => {
          if (item.includes('规则：') || item.includes('规则:')) {
            return (
              <p style={{ fontWeight: '800' }} key={logIndex}>
                {' '}
                {item}
              </p>
            );
          }
          if (logIndex < 2) {
            return <p key={logIndex}> {item}</p>;
          }
          return <p key={logIndex}>{item}</p>;
        })}
      </div>
    );
    this.infoColumns = [
      {
        title: '补丁包名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '更新时间',
        dataIndex: 'import_time',
        key: 'import_time',
      },
      {
        title: '结果',
        dataIndex: 'result',
        key: 'result',
      },
      {
        title: '详情',
        dataIndex: 'detail',
        key: 'detail',
        render: (detail) => (
          <>
            {detail.map((tag) => {
              return (
                <p style={{ fontSize: '13px', lineHeight: '30px' }} key={tag}>
                  {tag}
                </p>
              );
            })}
          </>
        ),
      },
    ];
    this.columns = [
      {
        title: '功能组件',
        dataIndex: 'name',
        key: 'name',
        render: (text) => (
          <span>
            {text === '规则版本' && <span>安全规则</span>}
            {text === '威胁情报版本' && <span>威胁情报</span>}
          </span>
        ),
      },
      {
        title: '当前版本',
        dataIndex: 'cur_version',
        key: 'cur_version',
        render: (text, record) => {
          const {
            version: { currentChangeLog },
          } = this.props;
          if (record.name === '规则版本') {
            return (
              <Popover content={this.content(currentChangeLog)} title="版本更新日志">
                <span style={{ color: '#1890ff' }}>{`${text}`}</span>
              </Popover>
            );
          }
          return <span>{`V${text}`}</span>;
        },
      },
      {
        title: '版本发布时间',
        dataIndex: 'update_time',
        key: 'update_time',
        render: (text) => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '更新日期',
        dataIndex: 'extend_fields',
        key: 'extend_fields',
        render: (text) => {
          // console.log('text', JSON.parse(text));
          const obj = JSON.parse(text);
          return <span>{obj.insert_time ? obj.insert_time : ''}</span>;
        },
      },
      {
        title: this.versionAuth === 'rw' ? '操作' : '',
        dataIndex: '',
        key: 'action',
        width: '30%',
        render: (text, record) => {
          if (this.versionAuth !== 'rw') {
            return null;
          }
          const {
            version: {
              checkInfo,
              threatInfo: { tioffline },
            },
            loadingClickCheck,
            loadingUpdate,
            loadingChangeLog,
          } = this.props;
          // 是否是规则版本列
          const isTheRuleVersionColumn = record.name === '规则版本';
          // 自动更新
          const whetherToUpdateAutomatically = tioffline.status === 1;
          // 更新前通知
          const whetherToUpdatePriorNotice = tioffline.status === 2;
          // 不自动更新
          const doesNotAutomaticallyUpdate = tioffline.status === 0;
          // 是否有新版本需要更新
          const isNeedUpdate = checkInfo.update;
          // 检查更新按钮
          const CheckUpdateBtn = () => (
            <div style={{ display: 'inline-block', width: 64, height: 21 }}>
              {loadingClickCheck ? (
                <Spin />
              ) : (
                <span style={{ color: '#1890ff', paddingLeft: 8 }} onClick={this.checkOnClick}>
                  检查更新
                </span>
              )}
            </div>
          );

          // 导入升级包
          const ImportUpgradePackage = () => (
            <span
              style={{ color: '#1890ff' }}
              onClick={() => {
                this.uploadPack(record);
              }}
            >
              导入升级包
            </span>
          );
          return (
            <div style={{ cursor: 'pointer' }}>
              {
                // 如果该列是规则版本
                isTheRuleVersionColumn && (
                  <div>
                    {
                      // 1.如果自动更新按钮就行
                      whetherToUpdateAutomatically && (
                        <React.Fragment>
                          <ImportUpgradePackage />
                          <CheckUpdateBtn />
                        </React.Fragment>
                      )
                    }

                    {
                      // 2.如果是更新前通知确认状态
                      whetherToUpdatePriorNotice && (
                        <div>
                          {
                            // 如果没有新版本
                            !isNeedUpdate && (
                              <React.Fragment>
                                <ImportUpgradePackage />
                                <CheckUpdateBtn />
                              </React.Fragment>
                            )
                          }
                          {
                            // 如果检查到新版本，则显示为“ 发现新版本 ”， 点击时显示changelog信息，并要求二次确认，只有确认后再进行更新操作，忽略则不进行更新 */
                            isNeedUpdate && (
                              <React.Fragment>
                                {loadingUpdate || loadingChangeLog ? (
                                  <Spin style={{ marginRight: 8 }} />
                                ) : (
                                  <span
                                    style={{
                                      color: '#f56c6c',
                                      width: 64,
                                      height: 21,
                                      fontWeight: 700,
                                      marginRight: 8,
                                    }}
                                    onClick={this.handleDiscoveryNewVersionDialogBoxDisplayAndHide}
                                  >
                                    发现新版本
                                  </span>
                                )}
                                <ImportUpgradePackage />
                              </React.Fragment>
                            )
                          }
                        </div>
                      )
                    }

                    {
                      /* 3. 不自动更新 -- 只显示导入升级包（离线升级），配了这个设置咱也拿不到是否是否需要更新得状态，因为肯定是false */
                      doesNotAutomaticallyUpdate && <ImportUpgradePackage />
                    }
                  </div>
                )
              }

              {
                /* 如果该列不是规则版本 （一般是 威胁情报版本） */
                !isTheRuleVersionColumn && <ImportUpgradePackage />
              }
            </div>
          );
        },
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'version/fetchCheckUpdateTb',
    });
    dispatch({
      type: 'version/fetchVersionInfo',
    });
    dispatch({
      type: 'version/fetchAuthorizationInfo',
    });
    dispatch({
      type: 'version/fetchFunctionalList',
    });
    dispatch({
      type: 'version/getThreatInfo',
    });
    dispatch({
      type: 'version/getChangelog',
      payload: { mode: 'current' },
    });
  };

  checkOnClick = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'version/fetchCheckUpdate',
    }).then(() => {
      const {
        version: { checkInfo },
      } = this.props;
      if (checkInfo.update === false) {
        message.info('当前版本已经是最新版本，无需升级');
      }
      if (checkInfo.update === '') {
        message.error(checkInfo.msg);
      }
      if (checkInfo.update === true) {
        message.info(`检测到新版本：${checkInfo.version}`);
      }
    });
  };

  updateOnClick = () => {
    const { dispatch } = this.props;
    this.setState({
      newVersionDialogVisible: false,
    });
    dispatch({
      type: 'version/handleUpdate',
    })
      .then((json) => {
        if (json.error_code === 0) {
          message.success('规则更新成功');
        } else {
          message.error('规则更新失败');
        }
        dispatch({
          type: 'version/fetchCheckUpdateTb',
        });
        dispatch({
          type: 'version/fetchVersionInfo',
        });
        dispatch({
          type: 'version/fetchFunctionalList',
        });
        dispatch({
          type: 'version/getChangelog',
          payload: { mode: 'current' },
        });
      })
      .catch(() => {
        message.error('规则更新失败');
      });
  };

  uploadLicense = () => {
    // console.log('上传');
    this.setState({ title: '证书上传' });
    this.setState({ fileFormat: '请选择.qcer文件上传' });
    this.setState({ type: 'license' });
    this.setState({ accept: '.qcer' });
    this.setState({ action: '/api/systemset/upload' });
    // this.setState({ flag: 'version' });
    this.setState({ uploadVisible: true });
  };

  uploadPack = (item) => {
    const {
      version: { authorizationInfo },
    } = this.props;
    console.log(item);
    const time = authorizationInfo.info.EndTime;
    if (moment(time).valueOf() < moment().valueOf()) {
      message.info('证书已过期');
      return;
    }
    if (item.name === '规则版本') {
      this.setState({ title: '规则版本安装包上传' });
      this.setState({ fileFormat: '请选择安装包' });
      this.setState({
        type: 'pack',
        packVersion: item.cur_version,
        flag: 'rule',
        timestamp: item.update_time,
      });
      this.setState({ accept: undefined });
      this.setState({ action: '/api/systemset/offlineUpdate' });
      this.setState({ uploadModalVisible: true });
    } else if (item.name === '威胁情报版本') {
      const version = item.cur_version.split('.').slice(0, -1).join('.');
      this.setState({ title: '威胁情报安装包上传' });
      this.setState({ fileFormat: '请选择安装包' });
      this.setState({
        type: 'local',
        packVersion: version,
        flag: 'weixie',
        timestamp: item.update_time,
      });
      this.setState({ cmd: 'update_offline_ti' });
      this.setState({ accept: undefined });
      this.setState({ action: '/api/systemset/threatUpdate' });
      this.setState({ uploadModalVisible: true });
    }
  };

  onCancel = () => {
    this.setState({ uploadVisible: false, visible: false });
    const { dispatch } = this.props;
    const { type } = this.state;
    if (type === 'license') {
      dispatch({ type: 'version/fetchAuthorizationInfo' });
      dispatch({ type: 'global/changeWebAuth' });
    }
  };

  // 没上传前关闭弹窗
  CancelModal = () => {
    this.setState({ uploadModalVisible: false });
  };

  closeTips = () => {
    const { dispatch } = this.props;
    this.setState({ tipVisible: false });
    dispatch({ type: 'version/fetchFunctionalList' });
    dispatch({
      type: 'version/fetchVersionInfo',
    });
    dispatch({
      type: 'version/getChangelog',
      payload: { mode: 'current' },
    });
  };

  // 手动调用上传文件接口
  manualUplod = (type, data) => {
    // console.log('data', type, data);
    const { dispatch } = this.props;
    let uri;
    if (type === 'rule') {
      uri = 'systemset/offlineUpdate';
    } else if (type === 'weixie') {
      uri = 'systemset/threatUpdate';
    } else {
      uri = 'systemset/patchUpdate';
    }
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'version/manualUpload',
        payload: { uri, data },
      })
        .then((res) => {
          console.log('手动上传返回', res);
          if (type === 'rule') {
            this.setState({ ruleMesVisible: true, uploadData: res.msg });
          } else if (type === 'buding') {
            this.setState({ visible: true, uploadData: res.msg });
          }
          const uploadResult = {
            uploadMsg: `文件上传成功`,
          };
          resolve([uploadResult, res]);
        })
        .catch((error) => {
          console.log('error', error);
          const uploadResult = {
            uploadMsg: `文件上传失败${error.msg ? `：${error.msg}` : ''}`,
          };
          reject(uploadResult);
        });
    });
  };

  handeUploadResut = (res, type) => {
    let uploadResult;
    if (res.error_code === 0) {
      if (type === 'rule') {
        this.setState({ ruleMesVisible: true, uploadData: res.msg });
      }
      uploadResult = {
        uploadMsg: `文件上传成功`,
      };
      // this.setState({ uploadModalVisible: false, tipVisible: true });
    } else {
      uploadResult = {
        uploadMsg: `文件上传失败${res.msg ? `：${res.msg}` : ''}`,
      };
      // this.setState({ uploadModalVisible: false, tipVisible: true });
    }
    return uploadResult;
  };

  // 上传之后调用
  afterCancel = (data) => {
    const { flag } = this.state;
    if (data.error_code === 0 && flag === 'weixie') {
      this.setState({ uploadModalVisible: false, tipVisible: true });
    } else if (data.error_code === 0 && flag === 'rule') {
      this.setState({ uploadModalVisible: false });
    }
  };

  // 手动上传之后
  manualClose = (type) => {
    const { flag } = this.state;
    if (type === 'succ' && flag === 'weixie') {
      this.setState({ uploadModalVisible: false, tipVisible: true });
    } else if (type === 'succ' && flag === 'rule') {
      this.setState({ uploadModalVisible: false });
    }
  };

  close = () => {
    const { dispatch } = this.props;
    this.setState({ ruleMesVisible: false });
    dispatch({ type: 'version/fetchFunctionalList' });
    dispatch({
      type: 'version/fetchVersionInfo',
    });
    dispatch({
      type: 'version/getChangelog',
      payload: { mode: 'current' },
    });
  };

  changeThreat = (value) => {
    this.setState({ threatFlag: value });
  };

  saveThreat = () => {
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { onlineAppId, onlineKey, offlineAppId } = values;
        dispatch({
          type: 'version/setThreatInfo',
          payload: {
            online_appid: onlineAppId,
            online_key: onlineKey,
            offline_appid: offlineAppId,
          },
        })
          .then((res) => {
            dispatch({
              type: 'version/getThreatInfo',
            });
            console.log(res);
            this.setState({ threatFlag: false });
          })
          .catch((error) => {
            message.error(error.msg);
          });
      }
    });
  };

  // 处理发现新版本对话框显示和隐藏
  handleDiscoveryNewVersionDialogBoxDisplayAndHide = async () => {
    const { newVersionDialogVisible } = this.state;
    const { dispatch } = this.props;
    await dispatch({
      type: 'version/getChangelog',
      payload: { mode: 'update' },
    });
    this.setState({
      newVersionDialogVisible: !newVersionDialogVisible,
    });
  };

  showModal = async () => {
    this.setState({
      visible: true,
    });
    this.setState({
      action: '/api/systemset/patchUpdate',
    });
  };

  showInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'version/getInfoList',
    });

    this.setState({
      visibleInfo: true,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visibleInfo: false,
    });
  };

  render() {
    const {
      version: { versionInfo, authorizationInfo, functionalList, threatInfo, updateChangeLog },
      // loadingTbCheck,
      loadingTb,
      isKVM,
      form,
    } = this.props;
    const {
      uploadVisible,
      type,
      title,
      fileFormat,
      accept,
      action,
      cmd,
      packVersion,
      uploadModalVisible,
      flag,
      timestamp,
      uploadRes,
      ruleMesVisible,
      uploadData,
      tipVisible,
      threatFlag,
      newVersionDialogVisible,
      visible,
      patchAccept,
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
    // console.log('version', authorizationInfo);

    return (
      <div>
        <div>
          <div className="commonHeader">版本及授权管理</div>
          <div className={styles.top}>
            {/* <div className={styles.topTitlt}>全局实时安全指数</div> */}
            <div className={styles.topContent}>
              <Row gutter={16}>
                {versionInfo.map((item, index) => {
                  let mainVersion = '';
                  // let publishDate = '';
                  if (item.type === 'main') {
                    const mainArr = item.cur_version.split('_');
                    mainVersion = mainArr[0] || '';
                  }
                  return (
                    <div key={item.name} className={styles.listWrapper}>
                      {item.type === 'main' && (
                        <Col span={8}>
                          <div className={styles.vInfoWarpper}>
                            <div className={styles.vInfoTitle}>
                              <span>系统版本</span>
                            </div>
                            <div className={styles.vInfo}>
                              <span>{mainVersion}</span>
                            </div>
                            <div className={styles.vInfoFoot}>
                              <p style={{ float: 'left' }}>
                                <span style={{ marginRight: '12px' }}>版本更新日期 : </span>
                                <span>{moment(item.update_time).format('YYYY-MM-DD')}</span>
                              </p>
                              <p style={{ float: 'right' }}>
                                <span
                                  style={{
                                    marginRight: '12px',
                                    color: 'rgb(24, 144, 255)',
                                    cursor: 'pointer',
                                  }}
                                  onClick={this.showModal}
                                >
                                  导入升级包
                                </span>

                                <span
                                  style={{
                                    marginRight: '12px',
                                    color: 'rgb(24, 144, 255)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <span onClick={this.showInfo}>更新日志</span>
                                </span>
                              </p>
                            </div>
                          </div>
                        </Col>
                      )}
                      {item.type === 'platform' && (
                        <Col span={8} className={index === 1 ? styles.middle : ''}>
                          <div className={styles.vInfoWarpper}>
                            <div className={styles.vInfoTitle}>
                              <span>{item.name === '规则版本' ? '入侵规则库版本' : item.name}</span>
                            </div>
                            <div className={styles.vInfo}>
                              {item.name === '规则版本' && <span>{item.cur_version}</span>}
                              {item.name === '威胁情报版本' && (
                                <span>{`V${item.cur_version}`}</span>
                              )}
                            </div>
                            <div className={styles.vInfoFoot}>
                              {item.name === '规则版本' && (
                                <Fragment>
                                  <span
                                    style={{ marginRight: 14 }}
                                  >{`有效规则数：${item.count}`}</span>
                                  <span>{`有效事件数：${item.eventCount}`}</span>
                                </Fragment>
                              )}
                              {item.name === '威胁情报版本' && (
                                <span>{`有效威胁情报数：${item.count}`}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                      )}
                    </div>
                  );
                })}
              </Row>
            </div>
          </div>
        </div>
        <div className={styles.author}>
          <div className={styles.authorContent}>
            <Row gutter={24}>
              {authorizationInfo && (
                <Col span={12} style={{ paddingRight: '0', borderRight: '1px solid #d9deeb' }}>
                  <div className={styles.title}>产品授权管理</div>
                  <Row className={styles.leftRowWrap}>
                    <Col span={12}>
                      <div className={styles.lineHgt}>
                        <span className={styles.authLable}>KEY：</span>
                        <span className={styles.value}>{authorizationInfo.info.Number}</span>
                      </div>
                      <div className={styles.lineHgt}>
                        <span className={styles.authLable}>授权单位：</span>
                        <span className={styles.value}>{authorizationInfo.info.Company}</span>
                      </div>
                      <div className={styles.lineHgt}>
                        <span className={styles.authLable}>证书类型：</span>
                        {authorizationInfo.info.Type === 1 ? (
                          <span className={styles.value}>正式</span>
                        ) : (
                          <span className={styles.value}>测试</span>
                        )}
                      </div>
                      {!isKVM && (
                        <div className={styles.lineHgt}>
                          <span className={styles.authLable}>沙箱最大虚拟机数：</span>
                          <span className={styles.value}>{authorizationInfo.info.BoxFileCnt}</span>
                        </div>
                      )}
                    </Col>
                    <Col span={12}>
                      <div className={styles.lineHgt}>
                        <span className={styles.authLable}>规格版本：</span>
                        <span className={styles.value}>
                          {editionVerName[authorizationInfo.info.edition] || ''}
                        </span>
                      </div>
                      <div className={styles.lineHgt}>
                        <span className={styles.authLable}>证书有效期至：</span>
                        <span className={styles.value}>
                          {moment(authorizationInfo.info.EndTime).format('YYYY-MM-DD')}
                        </span>
                      </div>
                      <div className={styles.lineHgt}>
                        <span className={styles.authLable}>最大接入流量数：</span>
                        <span className={styles.value}>{authorizationInfo.info.MaxFlow}</span>
                      </div>
                      <div className={styles.lineHgt}>
                        <span className={styles.authLable}>威胁情报更新：</span>
                        {authorizationInfo.info.ThreatUpdate === 1 ? (
                          <span className={styles.value}>支持</span>
                        ) : (
                          <span className={styles.value}>不支持</span>
                        )}
                      </div>
                    </Col>
                    {this.versionAuth === 'rw' && (
                      <Button
                        type="primary"
                        onClick={this.uploadLicense}
                        className="smallBlueBtn"
                        style={{ marginTop: '14px' }}
                      >
                        导入证书
                      </Button>
                    )}
                  </Row>
                </Col>
              )}
              <Col span={12} style={{ paddingLeft: '0' }}>
                <div className={styles.title}>威胁情报授权管理</div>
                <Form>
                  <Row className={styles.rightRowWrap}>
                    <Col span={12}>
                      <h4 className={styles.lineHgt}>在线威胁情报查询授权</h4>
                      {threatFlag ? (
                        <FormItem {...formItemLayout} label="云查ID">
                          {getFieldDecorator('onlineAppId', {
                            initialValue: threatInfo.tionline.appid,
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                              { max: 10, message: '最多填写10字符，请重新填写' },
                            ],
                          })(<Input placeholder="appid" />)}
                        </FormItem>
                      ) : (
                        <Row>
                          <Col xs={8} sm={6} className={styles.lineHgtInput}>
                            云查ID:
                          </Col>
                          <Col xs={24} sm={16} className={styles.lineHgtInput}>
                            <span>{threatInfo.tionline.appid}</span>
                          </Col>
                        </Row>
                      )}
                      {threatFlag ? (
                        <FormItem {...formItemLayout} label="KEY">
                          {getFieldDecorator('onlineKey', {
                            initialValue: threatInfo.tionline.key,
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                              { max: 32, message: '最多填写32字符，请重新填写' },
                            ],
                          })(<Input placeholder="kEY" />)}
                        </FormItem>
                      ) : (
                        <Row>
                          <Col xs={8} sm={6} className={styles.lineHgtInput}>
                            KEY:
                          </Col>
                          <Col xs={24} sm={16} className={styles.lineHgtInput}>
                            <span>{threatInfo.tionline.key}</span>
                          </Col>
                        </Row>
                      )}
                    </Col>
                    <Col span={12}>
                      <h4 className={styles.lineHgt}>离线威胁情报库下载授权</h4>
                      {threatFlag ? (
                        <FormItem {...formItemLayout} label="KEY">
                          {getFieldDecorator('offlineAppId', {
                            initialValue: threatInfo.tioffline.appid,
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                              { max: 12, message: '最多填写12字符，请重新填写' },
                            ],
                          })(<Input placeholder="KEY" />)}
                        </FormItem>
                      ) : (
                        <Row>
                          <Col xs={8} sm={6} className={styles.lineHgtInput}>
                            KEY:
                          </Col>
                          <Col xs={24} sm={16} className={styles.lineHgtInput}>
                            <span>{threatInfo.tioffline.appid}</span>
                          </Col>
                        </Row>
                        //   <FormItem {...formItemLayout} label="AppId">
                        //     {getFieldDecorator('offlineAppId', {
                        //   // initialValue: threatInfo.tioffline.appid,
                        // })(<span>{threatInfo.tioffline.appid}</span>)}
                        //   </FormItem>
                      )}
                    </Col>
                  </Row>
                </Form>
                {this.versionAuth === 'rw' && (
                  <div className={styles.btnsCon}>
                    {threatFlag ? (
                      <div>
                        <Button type="primary" className="smallBlueBtn" onClick={this.saveThreat}>
                          保存
                        </Button>
                        <Button
                          className="smallWhiteBtn"
                          style={{ marginLeft: '20px' }}
                          onClick={() => {
                            this.changeThreat(false);
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="primary"
                        onClick={() => {
                          this.changeThreat(true);
                        }}
                        className="smallBlueBtn"
                      >
                        更改
                      </Button>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </div>
          <div className={styles.funContent}>
            {/* className={styles.title} */}
            <div>模块版本</div>
            <div className={styles.table}>
              {loadingTb ? <Spin /> : <Table columns={this.columns} dataSource={functionalList} />}
            </div>
          </div>
        </div>
        <UploadTemplate
          title={title}
          cmd={cmd}
          fileFormat={fileFormat}
          type={type}
          uploadVisible={uploadVisible}
          accept={accept}
          action={action}
          cancel={this.onCancel}
        />
        <UploadModal
          title={title}
          cmd={cmd}
          handeUploadResut={this.handeUploadResut}
          fileFormat={fileFormat}
          type={type}
          uploadVisible={uploadModalVisible}
          categry={flag}
          accept={accept}
          packVersion={packVersion}
          manualUplod={this.manualUplod}
          updatetime={timestamp}
          action={action}
          result={uploadRes}
          cancel={this.CancelModal}
          afterUpload={this.afterCancel}
          afterManual={this.manualClose}
          whetherToCheckTheFileSize={false}
        />
        <Modal
          title="升级包更新完成"
          visible={ruleMesVisible}
          footer={[
            <Button key="submit" type="primary" onClick={this.close}>
              确定
            </Button>,
          ]}
          // onOk={this.close}
        >
          <div className={styles.num}>
            {uploadData}
            {/* 已经更新<span>{uploadData.modify}</span>条规则，新增<span>{uploadData.insert}</span>条，去除
                        <span>{uploadData.remove}</span>
                        条,规则已下发生效。 */}
          </div>
        </Modal>
        <Modal
          title="提示"
          visible={tipVisible}
          onOk={this.closeTips}
          onCancel={this.closeTips}
          footer={
            <Button type="primary" onClick={this.closeTips}>
              确定
            </Button>
          }
        >
          <div>升级包已更新完毕</div>
        </Modal>
        {/* 发现新版本对话框 */}
        <Modal
          title="是否要更新新版本？"
          visible={newVersionDialogVisible}
          onOk={this.updateOnClick}
          onCancel={this.handleDiscoveryNewVersionDialogBoxDisplayAndHide}
        >
          {this.content(updateChangeLog)}
        </Modal>
        <UploadPatch
          title="导入补丁包"
          cmd={cmd}
          fileFormat="请选择补丁包"
          type="buding"
          uploadVisible={visible}
          accept={patchAccept}
          action={action}
          cancel={this.onCancel}
          // handeUploadResut={this.handeUploadResut}
          // packVersion={packVersion}
          manualUplod={this.manualUplod}
          updatetime={timestamp}
          result={uploadRes}
          afterUpload={this.afterCancel}
          afterManual={this.manualClose}
          whetherToCheckTheFileSize={false}
        />
        <Modal
          className={styles.infocard}
          title="更新日志"
          visible={this.state.visibleInfo}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          style={{ width: '1100px' }}
        >
          <div className={styles.infodata}>
            <Table dataSource={this.props.version.infoList} columns={this.infoColumns} />
          </div>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(Version);
