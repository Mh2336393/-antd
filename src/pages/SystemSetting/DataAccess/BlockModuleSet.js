/* eslint-disable react/no-array-index-key */
/* eslint-disable camelcase */
import React, { Component, Fragment } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
// Upload,
Modal, // Tooltip,
Spin, // Icon,
// message,
Input, Button, Col, Row, // Table,
// Radio,
Select, message
} from 'antd';
import { connect } from 'umi';
import authority from '@/utils/authority';
const { getAuth } = authority;
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
// const RadioGroup = Radio.Group;
// const { Option } = Select;

@connect(({ block, loading }) => ({
  block,
  loading: loading.effects['block/fetchBlockModules'],
}))
class BlockModuleSet extends Component {
  constructor(props) {
    super(props);
    this.blockAuth = getAuth('/systemSetting/dataAccess/block');
    this.state = {
      isProcessing: false,
      editIds: [],
      blocks: [
        {
          Fname: '',
          Faddr: '',
          Fsecret_id: '',
          Fsecret_key: '',
          Fblock_time: '',
        },
      ],
    };
  }

  componentDidMount() {
    this.fetchBlocks();
  }

  fetchBlocks = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'block/fetchBlockModules' }).then(() => {
      const {
        block: { blockModules },
      } = this.props;
      const editIds = blockModules.map((bobj) => bobj.Fid);
      console.log('数据——blockModules=', blockModules, 'editIds=', editIds);
      this.setState({ blocks: blockModules, editIds });
    });
  };

  onOKSave = () => {
    const { form, dispatch } = this.props;
    const { blocks, isProcessing, editIds } = this.state;

    const promises = blocks.map((element, bidx) => {
      const Faddr = form.getFieldValue(`Faddr_${bidx}`);
      const Fsecret_id = form.getFieldValue(`Fsecret_id_${bidx}`);
      const Fsecret_key = form.getFieldValue(`Fsecret_key_${bidx}`);
      const item = { Faddr, Fsecret_id, Fsecret_key };
      return dispatch({
        type: 'block/testModuleLink',
        payload: { ...item },
      });
    });

    Promise.all(promises)
      .then((res) => {
        const index = res.findIndex((item) => item.error_code !== 0);
        if (index !== -1) {
          message.error(`第${index + 1}个模块联通失败，请检查参数是否正确`);
        } else {
          form.validateFields((err, values) => {
            if (!err) {
              if (isProcessing) {
                return;
              }
              this.setState({ isProcessing: true });
              const blockArr = [];
              const lastEditIds = [];
              // let count = 0;
              blocks.forEach((bobj, bidx) => {
                console.log('bindx==', bidx, 'bobj==', bobj);
                if (bobj) {
                  // count += 1;
                  const Fname = form.getFieldValue(`Fname_${bidx}`);
                  const Faddr = form.getFieldValue(`Faddr_${bidx}`);
                  const Fsecret_id = form.getFieldValue(`Fsecret_id_${bidx}`);
                  const Fsecret_key = form.getFieldValue(`Fsecret_key_${bidx}`);
                  const Fblock_time = 30;
                  const item = { Fname, Faddr, Fsecret_id, Fsecret_key, Fblock_time };
                  if (bobj.Fid) {
                    item.Fid = bobj.Fid;
                    lastEditIds.push(bobj.Fid);
                    // console.log('编辑', 'bobj.Fid=', bobj.Fid, 'count==', count);
                  }
                  blockArr.push(item);
                }
              });
              const delIds = editIds.filter((fid) => lastEditIds.indexOf(fid) < 0);
              console.log(77, 'blockArr==', blockArr, 'values==', values, 'delIds=', delIds);

              dispatch({
                type: 'block/setBlockModules',
                payload: { blockArr, delIds },
              })
                .then((json) => {
                  if (json.error_code === 0) {
                    message.success('保存成功');
                    this.fetchBlocks();
                  } else {
                    message.error('保存失败');
                  }
                  this.setState({ isProcessing: false });
                })
                .catch((error) => {
                  message.error(error.msg);
                  this.setState({ isProcessing: false });
                });
            }
          });
        }
      })
      .catch((err) => {
        message.error(`联通失败：${err.msg}`);
      });
  };

  testLink = (bidx) => {
    const { form, dispatch } = this.props;
    const Faddr = form.getFieldValue(`Faddr_${bidx}`);
    const Fsecret_id = form.getFieldValue(`Fsecret_id_${bidx}`);
    const Fsecret_key = form.getFieldValue(`Fsecret_key_${bidx}`);

    const item = { Faddr, Fsecret_id, Fsecret_key };
    // console.log('测试连通性 item=', item);
    dispatch({
      type: 'block/testModuleLink',
      payload: { ...item },
    })
      .then((json) => {
        if (json.error_code === 0) {
          message.success('联通成功');
        } else {
          message.error('联通失败，请检查参数是否正确');
        }
      })
      .catch((err) => {
        message.error(`联通失败：${err.msg}`);
      });
  };

  addBlocks = () => {
    const { blocks } = this.state;
    const realBlocks = blocks.filter((obj) => !!obj);
    const top = realBlocks.length * 370 + 200;
    blocks.push({
      Fname: '',
      Faddr: '',
      Fsecret_id: '',
      Fsecret_key: '',
      Fblock_time: '',
    });
    this.setState({ blocks }, () => {
      if (document.documentElement) {
        document.documentElement.scrollTop = Number(top);
      } else if (document.body) {
        document.body.scrollTop = Number(top);
      }
    });
  };

  delBlocks = (index) => {
    const { form } = this.props;
    const { blocks } = this.state;
    const Fname = form.getFieldValue(`Fname_${index}`);
    const self = this;
    Modal.confirm({
      title: `确认删除 “${Fname}” 吗？`,
      content: '删除阻断器的同时，该阻断器对应的阻断策略会失效，是否继续？',
      okText: '确认',
      cancelText: '取消',
      width: '500px',
      onOk() {
        delete blocks[index];
        self.setState({ blocks });
        // message.warn(`删除：${Fname}`);
      },
      onCancel() {},
    });
  };

  afterSelector = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return getFieldDecorator('mergeTime', {
      // initialValue: defaultVal || 'h',
      initialValue: 's',
    })(
      <Select style={{ width: 70 }} disabled>
        <Option value="s">分钟</Option>
        <Option value="h">小时</Option>
      </Select>
    );
  };

  validateFname = (rule, value, callback) => {
    const { form } = this.props;
    const { blocks } = this.state;
    const allName = [];
    const noRepeatName = [];
    blocks.forEach((bobj, bidx) => {
      if (bobj) {
        const Fname = form.getFieldValue(`Fname_${bidx}`);
        allName.push(Fname);
        if (noRepeatName.indexOf(Fname) < 0) {
          noRepeatName.push(Fname);
        }
      }
    });
    if (noRepeatName.length === allName.length) {
      callback();
      blocks.forEach((bobj, bidx) => {
        if (bobj) {
          const Fname = form.getFieldValue(`Fname_${bidx}`);
          form.setFieldsValue({ [`Fname_${bidx}`]: Fname });
        }
      });
    } else {
      callback('阻断器名称不能重复');
    }
  };

  render() {
    const { form, loading } = this.props;
    const { blocks, isProcessing } = this.state;
    const { getFieldDecorator } = form;
    // const formItemLayout = {
    //   labelCol: {
    //     xs: { span: 4 },
    //     sm: { span: 4 },
    //   },
    //   wrapperCol: {
    //     xs: { span: 14 },
    //     sm: { span: 14 },
    //   },
    // };
    if (loading) {
      return <Spin />;
    }

    let count = 0;
    return (
      <div>
        <div className={styles.contentWrap}>
          <Form>
            <Row className={styles.rowBlock}>
              <Col span={5}>
                <h4 className={styles.title4}>阻断模块接入配置</h4>
              </Col>
              <Col span={19}>
                <div className={styles.bootstrap_wrapper}>
                  <p>
                    <a onClick={this.addBlocks}>+新增阻断模块</a>
                  </p>
                  {blocks.map((item, index) => {
                    count += 1;
                    return (
                      <div key={index}>
                        <div className={styles.box}>
                          <div className={styles.topDiv}>
                            <div>{`阻断模块 ${count}`}</div>
                            <a
                              className={styles.delA}
                              onClick={() => {
                                this.delBlocks(index);
                              }}
                            >
                              删除
                            </a>
                          </div>
                          <div>
                            <Row>
                              <Col span={6}>
                                <p>阻断器名称：</p>
                              </Col>
                              <Col span={12}>
                                <FormItem>
                                  {getFieldDecorator(`Fname_${index}`, {
                                    initialValue: item.Fname || `阻断模块 ${count}`,
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      {
                                        required: true,
                                        message: '必填',
                                      },
                                      { max: 32, message: '最多填写32字符，请重新填写' },
                                      {
                                        validator: this.validateFname,
                                      },
                                    ],
                                  })(<Input />)}
                                </FormItem>
                              </Col>
                            </Row>

                            <Row>
                              <Col span={6}>
                                <p>天幕域名：</p>
                              </Col>
                              <Col span={12}>
                                <FormItem>
                                  {getFieldDecorator(`Faddr_${index}`, {
                                    initialValue: item.Faddr || '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      {
                                        required: true,
                                        message: '必填',
                                      },
                                      { max: 258, message: '最多填写258字符，请重新填写' },
                                    ],
                                  })(<Input />)}
                                </FormItem>
                              </Col>
                            </Row>

                            <Row>
                              <Col span={6}>
                                <p>天幕secretid：</p>
                              </Col>
                              <Col span={12}>
                                <FormItem>
                                  {getFieldDecorator(`Fsecret_id_${index}`, {
                                    initialValue: item.Fsecret_id || '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      {
                                        required: true,
                                        message: '必填',
                                      },
                                      { max: 128, message: '最多填写128字符，请重新填写' },
                                    ],
                                  })(<Input />)}
                                </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={6}>
                                <p>天幕secretkey：</p>
                              </Col>
                              <Col span={12}>
                                <FormItem>
                                  {getFieldDecorator(`Fsecret_key_${index}`, {
                                    initialValue: item.Fsecret_key || '',
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      {
                                        required: true,
                                        message: '必填',
                                      },
                                      { max: 128, message: '最多填写128字符，请重新填写' },
                                    ],
                                  })(<Input />)}
                                </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={6}>
                                <p>阻断时长(分钟)：</p>
                              </Col>
                              <Col span={12} title="当前固定为30分钟，不可修改">
                                <FormItem>
                                  {getFieldDecorator(`Fblock_time_${index}`, {
                                    initialValue: item.Fblock_time || 30,
                                    validateTrigger: 'onBlur',
                                    rules: [
                                      {
                                        required: true,
                                        message: '必填',
                                      },
                                    ],
                                  })(
                                    <Select disabled>
                                      <Option value="30">30</Option>
                                    </Select>
                                    // <Input disabled placeholder="请填写正整数" addonAfter={this.afterSelector()} />
                                  )}
                                </FormItem>
                              </Col>
                            </Row>
                            {/* <Row>
                              <Col span={6}>
                                <p>备注：</p>
                              </Col>
                              <Col span={12}>
                                <FormItem>
                                  {getFieldDecorator(`Fdesc_${index}`, {
                                    initialValue: '',
                                    // validateTrigger: 'onBlur',
                                    // rules: [
                                    //   {
                                    //     required: true,
                                    //     message: '必填',
                                    //   },
                                    //   { max: 64, message: '最多填写64字符，请重新填写' },
                                    //   {
                                    //     validator: this.validateEventName,
                                    //   },
                                    // ],
                                  })(<Input.TextArea style={{ height: 52 }} />)}
                                </FormItem>
                              </Col>
                            </Row> */}
                            <Row>
                              <Col span={12} offset={6}>
                                <Button
                                  style={{ marginBottom: 10 }}
                                  className="v2-soc-button default"
                                  onClick={() => this.testLink(index)}
                                >
                                  测试联通性
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={5} />
              <Col span={19}>
                <Row>
                  <Col xs={4} sm={4} />
                  <Col xs={14} sm={14}>
                    {this.blockAuth === 'rw' && (
                      <Fragment>
                        <Button
                          className="smallWhiteBtn"
                          // className="v2-soc-button default"
                          style={{ marginRight: 10, width: 86, height: 34 }}
                          onClick={this.fetchBlocks}
                        >
                          取消
                        </Button>
                        <Button
                          className="smallBlueBtn"
                          // className="v2-soc-button primary"
                          style={{ width: 86, height: 34 }}
                          loading={isProcessing}
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
export default Form.create()(BlockModuleSet);
