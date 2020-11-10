import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Row, Col, Radio, TimePicker, message } from 'antd';
import moment from 'moment';
import configSettings from '../../../configSettings';
// import _ from 'lodash';
import styles from './clound.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

@connect(({ cloundAccess, loading }) => ({
  cloundAccess,
  loading: loading.effects['cloundAccess/fetchCloundData'],
}))
class Clound extends Component {
  constructor(props) {
    super(props);
    this.cloundAuth = getAuth('/systemSetting/dataAccess/clound');
    this.state = {
      // 云端自动更新选项
      offlineRadio: [
        { label: '自动更新', value: '自动更新' },
        { label: '更新前通知确认', value: '更新前通知确认' },
        { label: '不自动更新', value: '不自动更新' },
      ],
      // 云查开关选项
      onlineRadio: [
        { label: '启用', value: '启用' },
        { label: '不启用', value: '不启用' },
      ],
      // 云端自动更新 值
      offlineValue: '',
      // 云查开关 值
      onlineValue: '',
      startTime: '00:00',
      endTime: '23:59',
      // 安全规则更新地址
      safeUrl: '',
      // 威胁情报更新地址
      offlineUrl: '',
      // 威胁情报云查地址
      onlineUrl: '',
      // 异常文件云查地址
      cloudUrl: '',
      // 是否显示自动更新时间段
      showTime: false,
      // 是否显示更新地址
      showUpdateAddress: false,
      showTime2: false,
      isProcessing: false, // 点击标志
      // startOpen: false,
      // endOpen: false,
      // onlineQuery: {},
      // offlineQuery: {},
      // cloudQuery: {},
    };
  }

  revertOffline = (obj) => {
    const { form } = this.props;
    form.setFieldsValue({
      offlineUrl: obj.default_url,
    });
    this.setState({ offlineUrl: obj.default_url });
  };

  revertSafe = (obj) => {
    const { form } = this.props;
    form.setFieldsValue({
      safeUrl: obj.default_url,
    });
    this.setState({ safeUrl: obj.default_url });
  };

  revertOnline = (obj) => {
    const { form } = this.props;
    form.setFieldsValue({
      onlineUrl: obj.default_url,
    });
    this.setState({ onlineUrl: obj.default_url });
  };

  revertCloud = (obj) => {
    const { form } = this.props;
    form.setFieldsValue({
      cloudUrl: obj.default_url,
    });
    this.setState({ cloudUrl: obj.default_url });
  };

  onIptChange = (type, e) => {
    if (e.target) {
      const { value } = e.target;
      console.log(74, type, value);
      this.setState({ [type]: value });
    }
  };

  // 云端更新配置 进行选择时
  changeOfflineOption = (e) => {
    const { form } = this.props;
    // 使用 setFieldsValue 来动态设置其他控件的值。
    form.setFieldsValue({
      offlineValue: e.target.value,
    });
    // console.log(1111, e.target.value)
    if (e.target.value === '自动更新') {
      this.setState({
        showTime: true,
        showUpdateAddress: true,
        offlineValue: e.target.value,
      });
    } else if (e.target.value === '更新前通知确认') {
      this.setState({
        showTime: false,
        showUpdateAddress: true,
        offlineValue: e.target.value,
      });
    } else if (e.target.value === '不自动更新') {
      this.setState({
        showTime: false,
        showUpdateAddress: false,
        offlineValue: e.target.value,
      });
    }
  };

  changeOnlineOption = (e) => {
    const { form } = this.props;
    const { showTime2 } = this.state;
    form.setFieldsValue({
      onlineValue: e.target.value,
    });
    this.setState({ showTime2: !showTime2 });
  };

  // handleOpenStart = () => {
  //   const { startOpen } = this.state;
  //   this.setState({ startOpen: !startOpen });
  // };

  changeStart = (time, timeString) => {
    const { form } = this.props;
    form.setFieldsValue({
      startTime: timeString,
    });
    this.setState({ startTime: timeString });
  };

  changeEnd = (time, timeString) => {
    const { form } = this.props;
    form.setFieldsValue({
      endTime: timeString,
    });
    this.setState({ endTime: timeString });
  };

  saveChange = () => {
    // console.log('保存更改');
    const { dispatch, form } = this.props;
    const { isProcessing } = this.state;

    // 校验并获取一组输入域的值与 Error，若 fieldNames 参数为空，则校验全部组件
    form.validateFields((err, values) => {
      const { startTime, endTime } = this.state;
      if (!err) {
        console.log('value', values);
        // 在线查询  搜索请求
        const onlineQuery = {};
        // 离线查询
        const offlineQuery = {};
        // 安全查询
        const safeQuery = {};
        // 云查询
        const cloudQuery = {};
        // const { offlineValue, onlineValue, offlineUrl, onlineUrl, cloudUrl, safeUrl } = values;
        const { offlineValue, onlineValue } = values;
        const { offlineUrl, onlineUrl, cloudUrl, safeUrl } = this.state;

        if (offlineValue === '不自动更新') {
          offlineQuery.status = 0;
          offlineQuery.begintime = '00:00';
          offlineQuery.endtime = '23:59';

          safeQuery.status = 0;
          safeQuery.begintime = '00:00';
          safeQuery.endtime = '23:59';
        } else if (offlineValue === '更新前通知确认') {
          offlineQuery.status = 2;
          offlineQuery.begintime = '00:00';
          offlineQuery.endtime = '23:59';

          safeQuery.status = 2;
          safeQuery.begintime = '00:00';
          safeQuery.endtime = '23:59';
        } else if (offlineValue === '自动更新') {
          offlineQuery.status = 1;
          offlineQuery.begintime = startTime;
          offlineQuery.endtime = endTime;

          safeQuery.status = 1;
          safeQuery.begintime = startTime;
          safeQuery.endtime = endTime;
        }

        if (onlineValue === '不启用') {
          onlineQuery.status = 0;
          cloudQuery.status = 0;
        } else {
          onlineQuery.status = 1;
          cloudQuery.status = 1;
        }
        offlineQuery.url = offlineUrl;
        offlineQuery.cmd = 'update_access_conf';
        offlineQuery.req_type = 'tioffline';

        safeQuery.url = safeUrl;
        // safeQuery.cmd = 'update_access_safe';
        safeQuery.name = 'safeUrl';

        onlineQuery.url = onlineUrl;
        onlineQuery.cmd = 'update_access_conf';
        onlineQuery.req_type = 'tionline';
        cloudQuery.url = cloudUrl;
        cloudQuery.name = 'habo_cloud';
        if (isProcessing) return;
        this.setState({ isProcessing: true });

        dispatch({
          type: 'cloundAccess/changeCloud',
          payload: {
            online: onlineQuery,
            offline: offlineQuery,
            cloud: cloudQuery,
            safe: safeQuery,
          },
        })
          .then((Res) => {
            // console.log('res', Res);
            const keys = Object.keys(Res);
            let errorCode;
            keys.forEach((item) => {
              errorCode = errorCode || Res[item].error_code;
            });
            if (errorCode === 0) {
              message.info('保存成功');
              dispatch({
                type: 'cloundAccess/fetchCloundData',
              }).then((res) => {
                this.updateTimeShow();
              });
              this.setState({ isProcessing: false });
            } else {
              this.setState({ isProcessing: false });
            }
          })
          .catch((e) => {
            console.log('err==', e);
            this.setState({ isProcessing: false });
          });
      }
    });
  };

  componentDidMount = async () => {
    const { dispatch } = this.props;
    await dispatch({ type: 'cloundAccess/fetchCloundData' });

    const {
      cloundAccess: {
        cloundData: {
          safe: { processing_time },
        },
      },
    } = this.props;

    if (processing_time) {
      this.setState({
        startTime: processing_time.split('-')[0],
        endTime: processing_time.split('-')[1],
      });
    }
  };

  // 会在已挂载的组件接收新的 props 之前被调用
  componentWillReceiveProps = (nextProps) => {
    const {
      cloundAccess: { cloundData },
    } = nextProps;
    const { cloundAccess: preData } = this.props;
    if (cloundData !== preData.cloundData) {
      const { cloud, offline, online, safe = {} } = cloundData;
      this.setState({
        offlineUrl: offline.url,
        onlineUrl: online.url,
        cloudUrl: cloud.url,
        safeUrl: safe.url || '',
      });
      // 开关值初始化的初始化
      // 1 自动更新，0 不自动更新，2 更新前通知确认
      if (cloundData.offline && cloundData.offline.status === 1) {
        this.setState({ offlineValue: '自动更新' });
        this.setState({ showTime: true, showUpdateAddress: true });
      } else if (cloundData.offline && cloundData.offline.status === 0) {
        this.setState({ offlineValue: '不自动更新' });
        this.setState({ showTime: false, showUpdateAddress: false });
      } else if (cloundData.offline && cloundData.offline.status === 2) {
        this.setState({ offlineValue: '更新前通知确认' });
        this.setState({ showTime: false, showUpdateAddress: true });
      }
      if (cloundData.online && cloundData.online.status) {
        this.setState({ onlineValue: '启用', showTime2: true });
      } else {
        this.setState({ onlineValue: '不启用', showTime2: false });
      }
    }
  };

  validatorDomain = (rule, value, callback) => {
    // const flag = configSettings.validateDomain(value);
    const flag = configSettings.checkAllUrL(value);
    // console.log('value==', value, 'flag==', flag);
    if (flag) {
      callback();
    } else {
      callback('请输入正确的地址');
    }
  };

  /** 更新时间显示 */
  updateTimeShow() {
    const {
      cloundAccess: {
        cloundData: {
          safe: { processing_time },
        },
      },
    } = this.props;

    if (processing_time) {
      this.setState({
        startTime: processing_time.split('-')[0],
        endTime: processing_time.split('-')[1],
      });
    }
  }

  render() {
    // 导入了组件Form自然就有了this.props.form 不明白为啥....就这么用吧
    const {
      cloundAccess: { cloundData },
      form,
    } = this.props;
    // console.log('cloundData', cloundData);
    const { cloud, offline, online, safe = {} } = cloundData;

    const {
      offlineRadio,
      onlineRadio,
      offlineValue,
      onlineValue,
      startTime,
      endTime,
      offlineUrl,
      onlineUrl,
      cloudUrl,
      showTime,
      showUpdateAddress,
      showTime2,
      safeUrl,
      isProcessing,
      // startOpen,
      // endOpen,
    } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 12, offset: 1 },
        sm: { span: 12, offset: 1 },
      },
    };
    // console.log('showTime2==', showTime2);
    const format = 'HH:mm';
    return (
      <div className="TableTdPaddingWrap">
        <div className={styles.contentWrapper}>
          {/* <div className={styles.title}>云端智能接入</div> */}
          <div className={styles.itemCon}>
            <Form>
              <div className={styles.partTheme}>云端更新配置</div>
              <FormItem {...formItemLayout} label="云端自动更新">
                {/* 用于和表单进行双向绑定 */}
                {getFieldDecorator('offlineValue', {
                  initialValue: offlineValue || '',
                  rules: [
                    {
                      required: true,
                      message: '请选择',
                    },
                  ],
                })(<RadioGroup onChange={this.changeOfflineOption} options={offlineRadio} />)}
              </FormItem>
              {showTime && (
                <Row>
                  <Col xs={4} sm={4}>
                    <div className={styles.colFourLabel}>
                      自动更新时间段<span>:</span>
                    </div>
                  </Col>
                  <Col xs={18} sm={18} offset={1}>
                    <FormItem>
                      <div>
                        <span className={styles.Time}>
                          <FormItem>
                            {getFieldDecorator('startTime', {
                              initialValue: moment(`${startTime}`, 'HH:mm'),
                              rules: [
                                {
                                  required: true,
                                  message: '请选择时间',
                                },
                              ],
                            })(
                              <TimePicker
                                format={format}
                                onChange={this.changeStart}
                                onOpenChange={this.handleOpenStart}
                              />
                            )}
                          </FormItem>
                        </span>
                        <span style={{ padding: '0 10px' }}>至</span>
                        <span className={styles.Time}>
                          <FormItem>
                            {getFieldDecorator('endTime', {
                              initialValue: moment(`${endTime}`, 'HH:mm') || '',
                              rules: [
                                {
                                  required: true,
                                  message: '请选择时间',
                                },
                              ],
                            })(<TimePicker format={format} onChange={this.changeEnd} />)}
                          </FormItem>
                        </span>
                      </div>
                    </FormItem>
                  </Col>
                </Row>
              )}
              {showUpdateAddress && (
                <Fragment>
                  <FormItem {...formItemLayout} label="威胁情报更新地址">
                    <Row gutter={12}>
                      <Col span={14}>
                        {getFieldDecorator('offlineUrl', {
                          initialValue: offlineUrl || '',
                          rules: [
                            // {
                            //     required: true,
                            //     pattern: /^((https?|http):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                            //     message: '请输入正确的地址',
                            // },
                            {
                              validator: this.validatorDomain,
                            },
                          ],
                        })(
                          <Input
                            onChange={(e) => {
                              this.onIptChange('offlineUrl', e);
                            }}
                            placeholder="请填写云端IP或者域名"
                          />
                        )}
                      </Col>
                      <Col span={4} style={{ color: '#1890ff', cursor: 'pointer' }}>
                        {this.cloundAuth === 'rw' && (
                          <span
                            onClick={() => {
                              this.revertOffline(offline);
                            }}
                          >
                            还原
                          </span>
                        )}
                      </Col>
                    </Row>
                  </FormItem>
                  <FormItem {...formItemLayout} label="安全规则更新地址">
                    <Row gutter={12}>
                      <Col span={14}>
                        {getFieldDecorator('safeUrl', {
                          initialValue: safeUrl || '',
                          rules: [
                            // {
                            //   required: true,
                            //   pattern: /^((https?|http):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                            //   message: '请输入正确的地址',
                            // },
                            {
                              validator: this.validatorDomain,
                            },
                          ],
                        })(
                          <Input
                            onChange={(e) => {
                              this.onIptChange('safeUrl', e);
                            }}
                            placeholder="请填写云端IP或者域名"
                          />
                        )}
                      </Col>
                      <Col span={4} style={{ color: '#1890ff', cursor: 'pointer' }}>
                        {this.cloundAuth === 'rw' && (
                          <span
                            onClick={() => {
                              this.revertSafe(safe);
                            }}
                          >
                            还原
                          </span>
                        )}
                      </Col>
                    </Row>
                  </FormItem>
                </Fragment>
              )}
              <div className={styles.partTheme}>云查配置</div>
              <FormItem {...formItemLayout} label="云查开关">
                {getFieldDecorator('onlineValue', {
                  initialValue: onlineValue || '',
                  rules: [
                    {
                      required: true,
                      message: '请选择',
                    },
                  ],
                })(<RadioGroup onChange={this.changeOnlineOption} options={onlineRadio} />)}
              </FormItem>
              {showTime2 && (
                <Fragment>
                  <FormItem {...formItemLayout} label="威胁情报云查地址">
                    <Row gutter={12}>
                      <Col span={14}>
                        {getFieldDecorator('onlineUrl', {
                          initialValue: onlineUrl || '',
                          rules: [
                            // {
                            //     required: true,
                            //     pattern: /^((https?|http):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                            //     message: '请输入正确的地址',
                            // },
                            {
                              validator: this.validatorDomain,
                            },
                          ],
                        })(
                          <Input
                            onChange={(e) => {
                              this.onIptChange('onlineUrl', e);
                            }}
                            placeholder="请填写云端IP或者域名"
                          />
                        )}
                      </Col>
                      <Col span={4} style={{ color: '#1890ff', cursor: 'pointer' }}>
                        {this.cloundAuth === 'rw' && (
                          <span
                            onClick={() => {
                              this.revertOnline(online);
                            }}
                          >
                            还原
                          </span>
                        )}
                      </Col>
                    </Row>
                  </FormItem>
                  <FormItem {...formItemLayout} label="异常文件云查地址">
                    <Row gutter={12}>
                      <Col span={14}>
                        {getFieldDecorator('cloudUrl', {
                          initialValue: cloudUrl || '',
                          rules: [
                            // {
                            //   required: true,
                            //   pattern: /^((https?|http):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                            //   message: '请输入正确的地址',
                            // },
                            {
                              validator: this.validatorDomain,
                            },
                          ],
                        })(
                          <Input
                            onChange={(e) => {
                              this.onIptChange('cloudUrl', e);
                            }}
                            placeholder="请填写云端IP或者域名"
                          />
                        )}
                      </Col>
                      <Col span={4} style={{ color: '#1890ff', cursor: 'pointer' }}>
                        {this.cloundAuth === 'rw' && (
                          <span
                            onClick={() => {
                              this.revertCloud(cloud);
                            }}
                          >
                            还原
                          </span>
                        )}
                      </Col>
                    </Row>
                  </FormItem>
                </Fragment>
              )}
            </Form>
          </div>
        </div>
        <div className={styles.footer}>
          {this.cloundAuth === 'rw' && (
            <Button type="primary" loading={isProcessing} onClick={this.saveChange}>
              保存更改
            </Button>
          )}
        </div>
      </div>
    );
  }
}

// export default Clound;
const cloundFrom = Form.create()(Clound);
export default cloundFrom;
