import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Spin, Button, Col, Row, message, InputNumber } from 'antd';
// import configSettings from '../../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
import styles from './index.less';

const FormItem = Form.Item;

@connect(({ block, loading }) => ({
  block,
  loading: loading.effects['block/fetchLogClean'],
  loading2: loading.effects['block/editLogClean'],
}))
class Configuration extends Component {
  constructor(props) {
    super(props);
    // this.operaAuth = getAuth('/systemSetting/audit/operateLogs');
    // this.syskAuth = getAuth('/systemSetting/audit/sysLogs');
    // this.blockAuth = getAuth('/systemSetting/audit/blockLogs');
    this.configAuth = getAuth('/systemSetting/audit/configuration');
    this.state = {};
  }

  componentDidMount = () => {
    this.fetchInfo();
  };

  fetchInfo = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'block/fetchLogClean' });
  };

  onOKSave = () => {
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'block/editLogClean',
          payload: { ...values },
        })
          .then((json) => {
            if (json.error_code === 0) {
              message.success('保存成功');
              this.fetchInfo();
            } else {
              message.error('保存失败');
            }
          })
          .catch((error) => {
            message.error(error.msg);
          });
      }
    });
  };

  render() {
    const {
      form,
      loading,
      loading2,
      block: { logCleanData },
    } = this.props;
    const { getFieldDecorator } = form;
    // console.log(45, 'this.operaAuth==', this.operaAuth, 'this.syskAuth=', this.syskAuth, 'this.blockAuth=', this.blockAuth, 'this.configAuth=', this.configAuth);

    if (loading) {
      return <Spin />;
    }
    return (
      <div>
        <div className={styles.contentWrap}>
          <Form>
            <Row className={styles.rowBlock}>
              <Col span={5}>
                <h4 className={styles.title4}>配置</h4>
              </Col>
              <Col span={19}>
                <Row>
                  <Col span={6}>
                    <p>操作日志保留 天 数：</p>
                  </Col>
                  <Col span={12}>
                    <FormItem>
                      {getFieldDecorator(`t_operation_log`, {
                        initialValue: logCleanData.t_operation_log || 90,
                        rules: [
                          {
                            required: true,
                            message: '必填',
                          },
                        ],
                      })(
                        <InputNumber
                          min={1}
                          max={365}
                          formatter={(value) => value}
                          parser={(value) => value.replace(/[,.$@]/g, '')}
                          style={{ width: '100%' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <p>系统日志保留 条 数：</p>
                  </Col>
                  <Col span={12}>
                    <FormItem>
                      {getFieldDecorator(`t_component_monitor_log_alarm_record`, {
                        initialValue: logCleanData.t_component_monitor_log_alarm_record || 1000,
                        rules: [
                          {
                            required: true,
                            message: '必填',
                          },
                        ],
                      })(
                        <InputNumber
                          min={1}
                          max={1000}
                          formatter={(value) => value}
                          parser={(value) => value.replace(/[,.$@]/g, '')}
                          style={{ width: '100%' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <p>阻断日志保留 天 数：</p>
                  </Col>
                  <Col span={12}>
                    <FormItem>
                      {getFieldDecorator(`t_blocker_log`, {
                        initialValue: logCleanData.t_blocker_log || 90,
                        rules: [
                          {
                            required: true,
                            message: '必填',
                          },
                          // { max: 32, message: '最多填写32字符，请重新填写' },
                          // {
                          //   validator: this.validateFname,
                          // },
                        ],
                      })(
                        <InputNumber
                          min={1}
                          max={365}
                          formatter={(value) => value}
                          parser={(value) => value.replace(/[,.$@]/g, '')}
                          style={{ width: '100%' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row>
              <Col span={5} />
              <Col span={19}>
                <Row>
                  <Col xs={4} sm={4} />
                  <Col xs={14} sm={14}>
                    {this.configAuth === 'rw' && (
                      <Fragment>
                        <Button
                          className="smallWhiteBtn"
                          // className="v2-soc-button default"
                          style={{ marginRight: 10, width: 86, height: 34 }}
                          onClick={this.fetchInfo}
                        >
                          取消
                        </Button>
                        <Button
                          className="smallBlueBtn"
                          // className="v2-soc-button primary"
                          style={{ width: 86, height: 34 }}
                          loading={loading2}
                          onClick={this.onOKSave}
                        >
                          保存
                        </Button>
                      </Fragment>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
export default Form.create()(Configuration);
