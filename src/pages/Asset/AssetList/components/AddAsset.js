import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Select, Input, Button, message, Modal } from 'antd';
import { connect } from 'umi';
import { validatePortArr } from '@/utils/tools';
import configSettings from '../../../../configSettings';
import styles from './AddAsset.less';

const { assetValueMap } = configSettings;
const { Fos_types, FcategoryTypes } = assetValueMap;

const { Option } = Select;
const { confirm } = Modal;
const FormItem = Form.Item;

@connect(({ global, assetList, assetFind, loading }) => ({
  assetList,
  assetFind,
  hasVpc: global.hasVpc,
  loading: loading.effects['assetList/getAssetConfig'],
}))
class AddAsset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
    };
  }

  componentWillMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'assetList/getAssetConfig',
    }).then(() => {
      const {
        assetList: { configInfo },
      } = this.props;
      if (configInfo.assetGroup) {
        this.setState({
          groups: configInfo.assetGroup,
        });
      }
    });
  };

  cancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  submit = () => {
    const { editItem, form, isRegister, hasVpc, dispatch } = this.props;
    const self = this;
    form.validateFields((err, values) => {
      if (!err) {
        // console.log('values', values);
        let params = editItem.Fid
          ? Object.assign({}, values, { Fid: editItem.Fid })
          : Object.assign({}, values);
        if (!hasVpc) {
          params = Object.assign({}, params, {
            Fvpcid: editItem.Fvpcid ? `${editItem.Fvpcid}` : '0',
          });
        }
        console.log('params', params);
        if (isRegister) {
          const data = { Fids: [editItem.Fid] };
          dispatch({
            type: 'assetFind/checkAsset',
            payload: { isAll: false, ...data },
          }).then((res) => {
            if (res.length) {
              confirm({
                title: '资产已经注册， 是否更新资产信息',
                onOk() {
                  dispatch({
                    type: 'assetFind/register',
                    payload: { data: params },
                  })
                    .then(() => {
                      message.success('注册资产成功');
                      self.props.success();
                    })
                    .catch((error) => {
                      message.error(`${error.msg}`);
                    });
                },
                onCancel() {},
              });
            } else {
              dispatch({
                type: 'assetFind/register',
                payload: { data: params },
              })
                .then(() => {
                  message.success('注册资产成功');
                  self.props.success();
                })
                .catch((error) => {
                  message.error(`${error.msg}`);
                });
            }
          });
          // confirm({
          //   title: '确定注册资产吗？',
          //   onOk() {
          //     // 验证资产是否已经再资产表中
          //     dispatch({
          //       type: 'assetFind/checkAsset',
          //       payload: { isAll: false, ...data },
          //     })
          //       .then(res => {
          //         console.log('res', res);
          //         if (res.length) {
          //           confirm({
          //             title: '资产已经注册，是否更新资产信息',
          //             onOk() {
          //               dispatch({
          //                 type: 'assetFind/registerAsset',
          //                 payload: { isAll: false, ...data },
          //               })
          //                 .then(() => {
          //                   // const newQuery = Object.assign({}, query, { page: newPage });
          //                   message.success('注册成功');
          //                   self.fetchAssetListData(query);
          //                   self.fetchFilterCount({ keyword, filterObj, dirObj, startTime, endTime, mustObj, timeType });
          //                   self.fetchChartData({ keyword, filterObj, mustObj, startTime, endTime });
          //                 })
          //                 .catch(error => {
          //                   message.error(error.msg);
          //                 });
          //             },
          //             onCancel() {},
          //           });
          //         } else {
          //           dispatch({
          //             type: 'assetFind/registerAsset',
          //             payload: { isAll: false, ...data },
          //           })
          //             .then(() => {
          //               // const newQuery = Object.assign({}, query, { page: newPage });
          //               message.success('注册成功');
          //               self.fetchAssetListData(query);
          //               self.fetchFilterCount({ keyword, filterObj, dirObj, startTime, endTime, mustObj, timeType });
          //               self.fetchChartData({ keyword, filterObj, mustObj, startTime, endTime });
          //             })
          //             .catch(error => {
          //               message.error(error.msg);
          //             });
          //         }
          //       })
          //       .catch(error => {
          //         message.error(`${error.msg}`);
          //       });
          //   },
          //   onCancel() {},
          // });
        } else {
          dispatch({
            type: 'assetList/addAsset',
            payload: params,
          })
            .then(() => {
              const tips = editItem.Fid ? '编辑资产成功' : '添加资产成功';
              message.success(tips);
              this.props.success();
            })
            .catch((error) => {
              message.error(`${error.msg}`);
            });
        }
      }
    });
  };

  // 校验端口
  validatePort = (rule, value, callback) => {
    if (value) {
      const arr = value.split(/[,\n]/g);
      if (arr.length > 64) {
        callback('端口数不能超过64个');
      }
      const flag = validatePortArr(value);
      if (flag === false) {
        callback('端口格式错误');
      }
      if (flag === 'repeat') {
        callback('端口重复');
      }
      if (flag === true) {
        callback();
      }
    } else {
      callback();
    }
  };

  validateName = (rule, value, callback) => {
    if (value) {
      if (value.trim()) {
        callback();
      } else {
        callback('名称不能只为空格');
      }
    } else {
      callback();
    }
  };

  numberValidator = (rule, value, callback) => {
    if (/[^\d]/g.test(value) || (value !== '' && parseInt(value, 10) > 4294967295)) {
      callback('vpcid格式输入不正确');
    }
    callback();
  };

  render() {
    const { form, editItem, isRegister, hasVpc } = this.props;
    const { groups } = this.state;
    if (groups.length === 0) return null;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 18 },
      },
    };

    return (
      <div className={styles.addWrapper}>
        <div>
          <Form>
            <div className={styles.formWrapper}>
              <FormItem {...formItemLayout} label="资产名称">
                {getFieldDecorator('Fasset_name', {
                  initialValue: editItem.Fasset_name || '',
                  rules: [
                    {
                      required: true,
                      message: '必填',
                    },
                    { max: 64, message: '不能超过64个字符' },
                    { validator: this.validateName },
                  ],
                })(<Input placeholder="不超过64字符" />)}
              </FormItem>

              <Row gutter={24} style={{ marginLeft: '-2%' }}>
                <Col span={24}>
                  <FormItem {...formItemLayout} label="IP">
                    {getFieldDecorator('Fip', {
                      initialValue: editItem.Fip || '',
                      rules: [
                        { required: true, message: '必填' },
                        {
                          pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/,
                          message: 'IP不合法',
                        },
                      ],
                    })(<Input disabled={!!editItem.Fid} />)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24} style={{ marginLeft: '-2%' }}>
                {hasVpc ? (
                  <Col span={24}>
                    <FormItem {...formItemLayout} label="VPCID">
                      {getFieldDecorator('Fvpcid', {
                        initialValue: editItem.Fvpcid === undefined ? '0' : `${editItem.Fvpcid}`,
                        rules: [
                          { required: true, message: 'VPCID不能为空' },
                          { validator: this.numberValidator },
                        ],
                      })(
                        <Input
                          disabled={!!editItem.Fid}
                          placeholder="支持0~4294967295位整数"
                          maxLength={10}
                        />
                      )}
                    </FormItem>
                  </Col>
                ) : null}
              </Row>
              <Row gutter={24} style={{ marginLeft: '-2%' }}>
                <Col span={24}>
                  <FormItem {...formItemLayout} label="MAC">
                    {getFieldDecorator('Fmac', {
                      initialValue: editItem.Fmac || '',
                      validateTrigger: 'onBlur',
                      rules: [
                        {
                          pattern: /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/,
                          message: 'MAC不合法',
                        },
                      ],
                    })(<Input />)}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem {...formItemLayout} label="端口">
                    {getFieldDecorator('Fport', {
                      initialValue: editItem.Fport
                        ? editItem.Fport.split(',')
                            .filter((item) => item !== '')
                            .join(',')
                        : '',
                      rules: [{ validator: this.validatePort }],
                    })(<Input.TextArea placeholder="最多支持64个，用逗号隔开" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24} style={{ marginLeft: '-2%' }}>
                <Col span={24} id="typeWrapper">
                  <FormItem {...formItemLayout} label="资产类型">
                    {getFieldDecorator('Fcategory', {
                      initialValue: editItem.Fcategory || 1,
                      // rules: [{ required: true, message: '必填' }],
                    })(
                      <Select getPopupContainer={() => document.getElementById('typeWrapper')}>
                        {FcategoryTypes.map((type) => (
                          <Option key={type.value} value={type.value}>
                            {type.text}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24} style={{ marginLeft: '-2%' }}>
                <Col span={24} id="groupWrapper">
                  <FormItem {...formItemLayout} label="资产分组">
                    {getFieldDecorator('Fgroup', {
                      initialValue: editItem.Fgroup || groups[0].Fgid,
                      rules: [{ required: true, message: '必填' }],
                    })(
                      <Select getPopupContainer={() => document.getElementById('groupWrapper')}>
                        {groups.map((group) => (
                          <Option key={group.Fgid} value={group.Fgid}>
                            {group.Fgroup_name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </div>
            <FormItem {...formItemLayout} label="操作系统">
              {getFieldDecorator('Fos_type', {
                initialValue: (editItem.Fos_type &&
                  editItem.Fos_type.split(',').filter((os) => os !== '')) || ['未知类型'],
              })(
                <Select
                  mode="tags"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  placeholder="支持多选"
                >
                  {Fos_types.map((os) => (
                    <Option key={os.key}>{os.value}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Form>
        </div>
        <div className={styles.btnWrapper}>
          <Button
            style={{ marginRight: '50px' }}
            onClick={() => {
              this.cancel();
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.submit();
            }}
          >
            {isRegister ? '完成注册' : '确定'}
          </Button>
        </div>
      </div>
    );
  }
}

const AddAssetForm = Form.create()(AddAsset);
export default AddAssetForm;
