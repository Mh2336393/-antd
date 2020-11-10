import React, { Component } from 'react';
import { LeftOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Steps, Radio, Button, Select, Tooltip, message, Input, Row, Col, Spin } from 'antd';
import { connect } from 'umi';
import { history } from 'umi';
import authority from '@/utils/authority';
const { getAuth } = authority;
import configSettings from '../../../configSettings';
// { handleConfirmIp, isValidIP }
// import _ from 'lodash';
import styles from './sourceAdd.less';

message.config({
  top: 160,
});

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@connect(({ sourceAccess, global, loading }) => ({
  sourceAccess,
  hasVpc: global.hasVpc,
  loading: loading.effects['sourceAccess/connection'],
  loading1: loading.effects['sourceAccess/fetchXffConfig'],
  loading2: loading.effects['sourceAccess/fetchPcapConfig'],
  loading3: loading.effects['sourceAccess/fetchLogsConfig'],
  loading4: loading.effects['sourceAccess/getEngineCard'],
  loading5: loading.effects['sourceAccess/getGroupAddress'],
  loading6: loading.effects['sourceAccess/fetchNetworkCard'],
  loading7: loading.effects['sourceAccess/fetchSourceData'],
}))
class sourceAdd extends Component {
  constructor(props) {
    super(props);
    this.dataAuth = getAuth('/systemSetting/dataAccess/source');
    // 御界3个版本各自有对应的权限值，这是当前获取的
    this.addCount = getAuth('_systemSetting_dataAccess_source_add');
    this.state = {
      // showInfo: true,
      current: 0,
      steps: [
        {
          title: '填写流量地址',
          content: '第一步',
        },
        {
          title: '填写配置信息',
          content: '第二部',
        },
        {
          title: '完成',
          content: '第三部',
        },
      ],
      ipInput: '',
      sourceName: '',
      cardsList: [],
      selectedCard: [],
      descript: '',
      HOME_NET: '',
      NGINX_NET: '',
      tceConfig: false,
      // pcapSizeShow: 'none',
      // xffSetShow: false,
      openValue: 'true',
      showRadio1: true,
      // logCbxState: [...logAllArr],
      // allState: true,
      // selectDisplay: 'none',
      isReqing: false,
      saving: false,
      shoFlag: 'none',
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'sourceAccess/fetchSourceData' }).then(() => {
      const {
        sourceAccess: { recordsTotal },
      } = this.props;
      let addAuth = true;
      if (this.addCount) {
        addAuth = recordsTotal < Number(this.addCount);
      }
      if (!addAuth || this.dataAuth !== 'rw') {
        history.push('/auth/noAuth');
      }
    });
  }

  secondFetchDispatch = (ipInput) => {
    const { dispatch } = this.props;
    // 流量采集网口
    dispatch({
      type: 'sourceAccess/getEngineCard',
      payload: { ip: ipInput },
    })
      .then((netCard) => {
        const { msg, tceRes } = netCard;
        const netWorkArr = msg.interfaces.split(',');
        // const netWorkArr = [];
        // if (msg.eth1) {
        //   netWorkArr.push(msg.eth1);
        // }
        // if (msg.eth2 && msg.eth2 !== 'default') {
        //   netWorkArr.push(msg.eth2);
        // }
        let tceConfig = false;
        if (tceRes && tceRes.msg) {
          tceConfig = tceRes.msg['tce-config'] || false;
        }
        this.setState({ selectedCard: netWorkArr, tceConfig });
      })
      .catch((error) => {
        
        message.error(error.msg);
      });

    // 监控网段
    dispatch({
      type: 'sourceAccess/getGroupAddress',
      payload: { ip: ipInput },
    })
      .then((group) => {
        // console.log('监控网段group==', group);
        this.setState({
          HOME_NET: group.msg.HOME_NET || '',
          NGINX_NET: group.msg.NGINX_NET || '',
        });
        if (this.state.HOME_NET === 'any') {
          this.setState({
            shoFlag: 'block',
          });
        }
      })
      .catch((error) => {
        message.error(error.msg);
      });
  };

  // 填写流量源ip
  changeSourceIp = (e) => {
    this.setState({ ipInput: e.target.value });
  };

  handleBlank = (rule, value, callback) => {
    if (/\s+/g.test(value)) {
      callback('名称不能有空格');
    } else {
      callback();
    }
  };

  // changeSelect = value => {
  //   this.setState({ selectedCard: value });
  // };

  selectCardValidate = (rule, value, callback) => {
    const {
      form,
      sourceAccess: { netCardIp },
    } = this.props;
    if (value.length > 4) {
      message.error('目前最多支持四块网卡');
      const arr = [value[0], value[1], value[2], value[3]];
      // const { form } = this.props;
      form.setFieldsValue({
        selectedCard: arr,
      });
      callback();
    } else {
      const newArr = [];
      value.forEach((key) => {
        if (!netCardIp[key]) {
          newArr.push(key);
        }
      });
      if (newArr.length !== value.length) {
        message.error('该接口有ip，暂不允许配置为流量采集网口');
        form.setFieldsValue({
          selectedCard: newArr,
        });
      }
      callback();
    }
  };

  validateNetworkSeg = (rule, value, callback) => {
    const flag = configSettings.validateNetworkSegment(value);
    if (flag === false) {
      // callback(
      //     '支持格式：any，1.2.3.4，!2.3.4.5，1.2.3.4/24，!2.3.4.5/24，1.2.3.4-2.3.4.5，!1.2.3.4-2.3.4.5，允许输入多个，以“,”或者换行分隔'
      // );
      callback('输入格式有误');
    }
    if (flag === 'repeat') {
      callback('请移除重复网段');
    }
    if (flag === true) {
      callback();
    }
  };

  // 代理服务器网段
  validateNginxSeg = (rule, value, callback) => {
    if (value) {
      const flag = configSettings.validateNginxNet(value);
      if (flag === false) {
        // callback('支持格式：1.2.3.4，1.2.3.4/24，1.2.3.4-2.3.4.5，允许输入多个，以“,”或者换行分隔');
        callback('输入格式有误');
      }
      if (flag === 'repeat') {
        callback('请移除重复网段');
      }
      if (flag === true) {
        callback();
      }
    } else {
      callback();
    }
  };

  goBack = () => {
    history.go(-1);
  };

  pre = () => {
    const { current } = this.state;
    const preCurrent = current - 1;
    this.setState({ current: preCurrent });
  };

  firstNext = () => {
    const { dispatch, form } = this.props;
    const { current } = this.state;
    // console.log('current', current);

    form.validateFields((err, value) => {
      console.log('err', err, value);
      if (!err) {
        dispatch({
          type: 'sourceAccess/connection',
          payload: { ip: value.ipInput },
        })
          .then(() => {
            this.secondFetchDispatch(value.ipInput);
            
            dispatch({
              type: 'sourceAccess/fetchNetworkCard',
              payload: { ip: value.ipInput },
            }).then((cards) => {
              const nextCurrent = current + 1;
              this.setState({ cardsList: cards });
              // this.setState({ selectedCard: [cards[0]] });
              this.setState({ current: nextCurrent });
              this.setState({ ipInput: value.ipInput });
              message.success(`流量源${value.ipInput}已连通`);
            });
          })
          .catch((error) => {
            console.error(error)
            message.error('流量源ip连接不通');
          });
      }
    });
  };

  secondNext = () => {
    const {
      dispatch,
      form,
      // sourceAccess: { xffConfig },
    } = this.props;
    const { current, ipInput, isReqing } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        // console.log('val', values);
        const netWorkArr = values.selectedCard;
        const interfaces = netWorkArr.join(',');
        // const netWork2 = netWorkArr[1] || 'default';
        const query = {
          ip: ipInput,
          name: values.sourceName,
          desc: values.descript,
          interfaces,
          // netWork2,
          tceConfig: values.tceConfig || 'false',
          homeNet: values.HOME_NET.replace(/\n/g, ','),
          nginxNet: values.NGINX_NET.replace(/\n/g, ','),
        };
        // console.log('query', query);

        if (isReqing) {
          return;
        }
        this.setState({ isReqing: true });

        dispatch({
          type: 'sourceAccess/addSourceList',
          payload: { ...query },
        })
          .then((josn) => {
            message.info('添加节点成功');
            let showRadio1 = true;
            let openValue = 'true';
            if (josn.ruleCurVersion === 'R-20190101000000') {
              showRadio1 = false;
              openValue = 'false';
            }

            // dispatch({
            //   type: 'sourceAccess/updateLogsConfig',
            //   payload: logReq,
            // })
            //   .then(() => {
            //     message.success('流量日志配置成功');

            //     dispatch({
            //       type: 'sourceAccess/updatePcapConfig',
            //       payload: { ...pcap, ...xffReq },
            //     })
            //       .then(() => {
            //         message.success('pcap配置成功');
            //         this.setState({ isReqing: false });
            //       })
            //       .catch(error => {
            //         message.error(error.msg);
            //         this.setState({ isReqing: false });
            //       });

            //   })
            //   .catch(error => {
            //     this.setState({ isReqing: false });
            //     message.error(error.msg);
            //   });

            const nextCurrent = current + 1;
            this.setState({ current: nextCurrent, showRadio1, openValue, isReqing: false });
          })
          .catch((error) => {
            message.error(error.msg);
            this.setState({ isReqing: false });
          });
        // const nextCurrent = current + 1;
        // this.setState({ current: nextCurrent });
      }
    });
  };

  save = () => {
    const { openValue, ipInput, saving } = this.state;
    const { dispatch } = this.props;
    // console.log('插入状态', openValue, ipInput);
    if (openValue === 'true') {
      if (saving) {
        return;
      }
      this.setState({ saving: true });
      dispatch({
        type: 'sourceAccess/addRules',
        payload: { ip: ipInput },
      })
        .then((res) => {
          if (res.error_code === 0) {
            const { data } = res;
            dispatch({
              type: 'sourceAccess/probeDistribution',
              payload: { id: data.id, ip: ipInput },
            }).then(() => {
              // 重启探针，才会生效
              dispatch({
                type: 'sourceAccess/updateSourceState',
                payload: {
                  uri: 'systemset/stopSource',
                  body: { ip: ipInput },
                },
              }).then(() => {
                dispatch({
                  type: 'sourceAccess/updateSourceState',
                  payload: {
                    uri: 'systemset/startSource',
                    body: { ip: ipInput },
                  },
                }).then(() => {
                  this.setState({ saving: false });
                  history.push('/systemSetting/dataAccess/source');
                });
              });
            });
          }
        })
        .catch((error) => {
          message.error(error.msg);
          this.setState({ saving: false });
        });
    } else {
      history.push('/systemSetting/dataAccess/source');
    }
  };

  changeOpenState = (e) => {
    this.setState({ openValue: e.target.value });
  };

  render() {
    const {
      form,
      loading,
      loading1,
      loading2,
      loading3,
      loading4,
      loading5,
      loading6,
      loading7,
      hasVpc,
      // sourceAccess: { xffConfig },
    } = this.props;
    const {
      // showInfo,
      current,
      steps,
      ipInput,
      cardsList,
      sourceName,
      selectedCard,
      descript,
      HOME_NET,
      NGINX_NET,
      tceConfig,
      // pcapSizeShow,
      // xffSetShow,
      openValue,
      // logCbxState,
      // selectDisplay,
      isReqing,
      showRadio1,
      saving,
    } = this.state;
    const cardFilter = selectedCard.filter((ckey) => cardsList.indexOf(ckey) > -1);
    // console.log('selectedCard==', selectedCard, 'cardsList==', cardsList, 'cardFilter==', cardFilter);
    const { getFieldDecorator } = form;
    const formItemLayout1 = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 14 },
      },
    };
    const formItemLayout2 = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 14 },
      },
    };
    const networkSegTips =
      '支持格式：any，1.2.3.4，!2.3.4.5，1.2.3.4/24，!2.3.4.5/24，1.2.3.4-2.3.4.5，!1.2.3.4-2.3.4.5，允许输入多个，以“,”或者换行分隔。支持ipv6格式';

    // const xffEnableIni = xffConfig.enable === 'yes' ? 'yes' : 'no';
    // const xffHeaderIni = xffConfig.header || '';
    // const xffModeIni = xffConfig.mode === 'extra-data' ? 'extra-data' : 'overwrite';
    // const xffDeploymentIni = xffConfig.deployment ? xffConfig.deployment : 'forward';

    const firstLoading =
      loading || loading1 || loading2 || loading3 || loading4 || loading5 || loading6;

    // const selectName = this.logSelectedLabel();
    if (loading7) {
      return <Spin />;
    }
    return (
      <div>
        <div className="commonDetailHeader">
          <LeftOutlined style={{ color: '#2662EE' }} />
          <span style={{ cursor: 'pointer', color: '#2662EE' }} onClick={this.goBack}>
            返回
          </span>
          <span className="divider" />
          <span>新建流量接入</span>
        </div>
        <div className={styles.content}>
          <div style={{ marginTop: '20px' }}>
            <Steps current={current}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            {current === 0 && (
              <div>
                <Form>
                  <Row className={styles.rowBlock} style={{ padding: '100px 0' }}>
                    <Col span={20} offset={4}>
                      <FormItem {...formItemLayout1} label="流量源IP">
                        {getFieldDecorator('ipInput', {
                          initialValue: ipInput || '',
                          validateTrigger: 'onBlur',
                          rules: [
                            { required: true, message: '必填' },
                            {
                              validator: configSettings.validSingleIp,
                            },
                          ],
                        })(<Input />)}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}
            {current === 1 && loading4 && (
              <div style={{ height: 200, padding: 40 }}>
                <Spin />
              </div>
            )}
            {current === 1 && !loading4 && (
              <div>
                <Form>
                  <Row className={styles.rowBlock} style={{ marginTop: 50 }}>
                    <Col span={3}>
                      <h4 className={styles.title4}>基础配置</h4>
                    </Col>
                    <Col span={21}>
                      <FormItem {...formItemLayout2} label="流量源名称">
                        {getFieldDecorator('sourceName', {
                          initialValue: sourceName || '',
                          rules: [
                            { required: true, message: '请填写流量源名称' },
                            {
                              validator: this.handleBlank,
                            },
                            { max: 128, message: '长度不能超过128个字符' },
                          ],
                        })(<Input />)}
                      </FormItem>
                      <FormItem {...formItemLayout2} label="流量采集网口">
                        {getFieldDecorator('selectedCard', {
                          initialValue: cardFilter || [],
                          validateTrigger: 'onChange',
                          rules: [
                            { required: true, message: '必选' },
                            { validator: this.selectCardValidate },
                          ],
                        })(
                          <Select mode="multiple">
                            {cardsList.map((card) => (
                              <Option key={card} value={card}>
                                {card}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                      <FormItem {...formItemLayout2} label="监控网段" extra={networkSegTips}>
                        {getFieldDecorator('HOME_NET', {
                          initialValue: HOME_NET || '',
                          rules: [
                            { required: true, message: '请输入监控网段' },
                            { validator: this.validateNetworkSeg },
                          ],
                        })(<TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                      </FormItem>
                      {hasVpc === 1 ? (
                        <FormItem {...formItemLayout2} label="TCE解析开关">
                          {getFieldDecorator('tceConfig', {
                            initialValue: `${tceConfig}`,
                          })(
                            <RadioGroup>
                              <Radio value="true">启用</Radio>
                              <Radio value="false">不启用</Radio>
                            </RadioGroup>
                          )}
                        </FormItem>
                      ) : null}

                      <Row>
                        <Col xs={5} sm={5}>
                          <div className={styles.colLabel}>
                            <span>
                              <QuestionCircleFilled className="fontBlue" />
                              NGINX代理服务器网段{` `}
                              <Tooltip title="如果镜像流量中有Nginx服务器将外网地址转为内网服务器地址的流量，请将Nginx代理服务器地址填入用于检测外网攻击。"></Tooltip>
                              {` :`}
                            </span>
                          </div>
                        </Col>
                        <Col xs={14} sm={14}>
                          <FormItem
                            // {...formItemLayout2}
                            // label="NGINX代理服务器网段"
                            extra="支持格式：1.2.3.4，1.2.3.4/24，1.2.3.4-2.3.4.5，允许输入多个，以“,”或者换行分隔。支持ipv6格式"
                          >
                            {getFieldDecorator('NGINX_NET', {
                              initialValue: NGINX_NET,
                              rules: [{ validator: this.validateNginxSeg }],
                            })(<TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                          </FormItem>
                        </Col>
                      </Row>
                      <FormItem {...formItemLayout2} label="备注">
                        {getFieldDecorator('descript', {
                          initialValue: descript || '',
                          rules: [{ max: 128, message: '长度不能超过128个字符' }],
                        })(<TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}
            {current === 2 && (
              <div
                style={{
                  minHeight: '300px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '220px' }}>
                  <RadioGroup value={openValue} onChange={this.changeOpenState}>
                    {showRadio1 && <Radio value="true">保存配置并自动创建流量源安全策略</Radio>}
                    <Radio value="false">仅保存配置</Radio>
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>
          <div className={styles.stepsAction}>
            {current === 0 && (
              <div style={{ padding: '10px 0' }}>
                <Button
                  className="smallBlueBtn"
                  style={{ height: 34 }}
                  loading={firstLoading}
                  onClick={() => this.firstNext()}
                >
                  下一步
                </Button>
              </div>
            )}
            {current === 1 && (
              <div style={{ padding: '10px 0', marginBottom: 50 }}>
                <Button
                  className="smallWhiteBtn"
                  style={{ marginLeft: 8, height: 34 }}
                  onClick={() => this.pre()}
                >
                  上一步
                </Button>
                <Button
                  className="smallBlueBtn"
                  style={{ marginLeft: 8, height: 34 }}
                  loading={isReqing}
                  onClick={() => this.secondNext()}
                >
                  下一步
                </Button>
              </div>
            )}
            {current === 2 && (
              <Button
                className="smallBlueBtn"
                loading={saving}
                style={{ height: 34 }}
                onClick={() => this.save()}
              >
                完成
              </Button>
            )}
          </div>
          {/* {selectDisplay === 'block' && <div className={styles.fixedWrap} onClick={this.fixedWrapClick} />} */}
        </div>
      </div>
    );
  }
}

const sourceAddForm = Form.create()(sourceAdd);
export default sourceAddForm;
// export default sourceAdd;
