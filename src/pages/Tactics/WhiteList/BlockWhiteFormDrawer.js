import React, { Component } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import _ from 'lodash';
import { Input, Row, Col, Spin, Button, message, Radio } from 'antd';
// import moment from 'moment';
import styles from '../form.less';
// import configSettings from '../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
// import handleConfirmIp from '@/tools/ipValidCheck';
import configSettings from '../../../configSettings';

/* eslint-disable camelcase */
/* eslint-disable prefer-const */

const FormItem = Form.Item;
const { TextArea } = Input;
// const { Option } = Select;
const RadioGroup = Radio.Group;

@connect(({ block, global }) => ({
  block,
  hasVpc: global.hasVpc,
  // loading: loading.effects['tacticsInvasion/fetchEditInfo'],
  // ruleLoading: loading.effects['tacticsInvasion/validateRule'],
}))
class BlockWhiteFormDrawer extends Component {
  constructor(props) {
    super(props);
    this.rwAuth = getAuth('/tactics/whites/blockWhite');
    this.state = {
      editItem: {},
      isProcessing: false,
    };
  }

  componentDidMount() {
    const { drawerTitle, drawerObj } = this.props;
    // console.log('drawerObj==', drawerObj);
    let editItem = {};
    if (drawerTitle === '编辑') {
      const { Fcreator, Fupdate_time, ...other } = drawerObj;
      editItem = { ...other };
    }
    this.setState({ editItem });
  }

  onOKSave = () => {
    const { drawerTitle, form } = this.props;
    const { isProcessing, editItem } = this.state;

    form.validateFields((err, values) => {
      if (!err) {
        if (isProcessing) {
          return;
        }
        this.setState({ isProcessing: true });
        const { Factivated, Fip, Fcomment } = values;

        const params = {
          Factivated: Factivated ? 1 : 0,
          Fip: Fip.replace(/\n/g, ','),
          Fcomment,
        };
        if (drawerTitle === '编辑') {
          params.Fid = editItem.Fid;
        }
        console.log(91, 'params==', params);
        this.onFormSave(params);
      }
    });
  };

  onFormSave = (values) => {
    const { dispatch, drawerTitle, backTablePage } = this.props;
    const mType = drawerTitle === '编辑' ? 'block/updateWhiteList' : 'block/addWhiteList';
    dispatch({ type: mType, payload: { ...values } })
      .then((json) => {
        if (json.error_code === 0) {
          message.success(`${drawerTitle}成功`);
          this.setState({ isProcessing: false }, () => {
            backTablePage();
          });
        } else {
          message.error(`${drawerTitle}失败`);
          this.setState({ isProcessing: false });
        }
      })
      .catch((error) => {
        message.error(error.msg);
        this.setState({ isProcessing: false });
      });
  };

  render() {
    const { isProcessing, editItem } = this.state;
    const { form, loading, backTablePage } = this.props;

    // console.log('editItem==', editItem);

    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 14 },
      },
    };

    if (loading) {
      return (
        <div className={styles.loadingStyle}>
          <Spin />
        </div>
      );
    }

    return (
      <div>
        <div className={styles.drawerContent}>
          <Form className={styles.warnForm}>
            <Row className={styles.rowBlock}>
              <Col span={4}>
                <h4 className={styles.title4}>策略启用</h4>
              </Col>
              <Col span={20}>
                <FormItem {...formItemLayout} label="策略启用">
                  {getFieldDecorator('Factivated', {
                    initialValue: editItem.Factivated === 0 ? 0 : 1,
                  })(
                    <RadioGroup>
                      <Radio value={1}>启用</Radio>
                      <Radio value={0}>停用</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row className={styles.rowBlock}>
              <Col span={4}>
                <h4 className={styles.title4}>基本信息</h4>
              </Col>
              <Col span={20}>
                <FormItem {...formItemLayout} label="IP地址">
                  {getFieldDecorator('Fip', {
                    initialValue: editItem.Fip || '',
                    validateTrigger: 'onBlur',
                    rules: [
                      { required: true, message: '请填写IP地址' },
                      {
                        validator: configSettings.validateIpList,
                      },
                    ],
                  })(
                    <TextArea
                      rows={4}
                      placeholder="支持 192.168.0.1 或 192.168.0.0/24 ipv4格式, 同时支持 2001:0db8:85a3:08d3:1319:8a2e:0370:7344 或 2001:0db8:85a3:08d3:1319:8a2e:0370:7344/24 IPv6格式，允许输入多个，以“,”或者换行分隔"
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator('Fcomment', {
                    initialValue: editItem.Fcomment || '',
                    validateTrigger: 'onBlur',
                    rules: [{ max: 256, message: '最多填写256字符，请重新填写' }],
                  })(<TextArea rows={4} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={4} />
              <Col span={20}>
                <Row>
                  <Col xs={4} sm={4} />
                  {this.rwAuth === 'rw' && (
                    <Col xs={14} sm={14}>
                      <Button
                        style={{ marginRight: 20 }}
                        onClick={() => {
                          backTablePage();
                        }}
                      >
                        取消
                      </Button>
                      <Button type="primary" onClick={this.onOKSave} loading={isProcessing}>
                        保存
                      </Button>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(BlockWhiteFormDrawer);
