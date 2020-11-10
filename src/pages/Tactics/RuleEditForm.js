import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import _ from 'lodash';
import { CaretRightOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, Select, message, Checkbox, Row, Col, Tooltip, Popover } from 'antd';
import styles from './form.less';
import configSettings from '@/configSettings';

/* eslint-disable camelcase */
/* eslint-disable react/no-array-index-key */

const FormItem = Form.Item;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;
const keyArr = ['msg', 'credit', 'proto', 'src_ip', 'src_port', 'direction', 'dst_ip', 'dst_port']; // 'sid',
const labelData = {
  msg: '规则名称',
  sid: '规则ID',
  credit: '置信度',
  proto: '协议',
  src_ip: 'IP',
  src_port: '端口',
  direction: '方向',
  dst_ip: 'IP',
  dst_port: '端口',
};
// 传入的默认字段  威胁等级 分了 子类 规则id 事件id
const iniFieldKeys = ['priority', 'classtype', 'sid', 'gid']; //  'sub-category',

// nocase 应该是不区分大小写
const modifiersOptions = [
  { label: '区分大小写', value: 'case' },
  { label: '优先匹配', value: 'fast_pattern' },
];

const reqAndResKeywords = [
  { keyword: 'http_uri', type: 'modifier', direction: 'request' },
  { keyword: 'http_raw_uri', type: 'modifier', direction: 'request' },
  { keyword: 'http_method', type: 'modifier', direction: 'request' },
  { keyword: 'http_request_line', type: 'sticky_buffer', direction: 'request' },
  { keyword: 'http_client_body', type: 'modifier', direction: 'request' },
  { keyword: 'http_header', type: 'modifier', direction: 'both' },
  { keyword: 'http_raw_header', type: 'modifier', direction: 'both' },
  { keyword: 'http_cookie', type: 'modifier', direction: 'both' },
  { keyword: 'http_user_agent', type: 'modifier', direction: 'request' },
  { keyword: 'http_host', type: 'modifier', direction: 'request' },
  { keyword: 'http_raw_host', type: 'modifier', direction: 'request' },
  { keyword: 'http_accept', type: 'sticky_buffer', direction: 'request' },
  { keyword: 'http_accept_lang', type: 'sticky_buffer', direction: 'request' },
  { keyword: 'http_accept_enc', type: 'sticky_buffer', direction: 'request' },
  { keyword: 'http_referer', type: 'sticky_buffer', direction: 'request' },
  { keyword: 'http_connection', type: 'sticky_buffer', direction: 'request' },
  { keyword: 'http_content_type', type: 'sticky_buffer', direction: 'both' },
  { keyword: 'http_content_len', type: 'sticky_buffer', direction: 'both' },
  { keyword: 'http_start', type: 'sticky_buffer', direction: 'both' },
  { keyword: 'http_protocol', type: 'sticky_buffer', direction: 'both' },
  { keyword: 'http_header_names', type: 'sticky_buffer', direction: 'both' },
  { keyword: 'http_stat_msg', type: 'modifier', direction: 'response' },
  { keyword: 'http_stat_code', type: 'modifier', direction: 'response' },
  { keyword: 'http_response_line', type: 'sticky_buffer', direction: 'response' },
  { keyword: 'http_server_body', type: 'modifier', direction: 'response' },
  { keyword: 'http.server', type: 'modifier', direction: 'response' },
  { keyword: 'http.location', type: 'modifier', direction: 'response' },
  // { keyword: 'file_data', type: 'sticky_buffer', direction: 'response' },
];

const ipTipTitle = (
  <div>
    <div>内网网段需要通过流量探针编辑页中的监控网段进行配置</div>
    <div style={{ marginBottom: 10 }}>外网网段无需配置，自动通过非内网网段来定义</div>
    <div>自定义输入范例：</div>
    <div>
      <span className={styles.ipTipSpan}>10.0.0.0</span>针对某个IP
    </div>
    <div>
      <span className={styles.ipTipSpan}>[10.0.0.1,10.0.0.2]</span>针对多个IP
    </div>
    <div>
      <span className={styles.ipTipSpan}>10.0.0.0/24</span>针对网段
    </div>
    <div>
      <span className={styles.ipTipSpan}>!10.0.0.0</span>排除某个IP
    </div>
    <div>
      <span className={styles.ipTipSpan}>![1.1.1.1, 1.1.1.2]</span>排除个多IP
    </div>
    <div>
      <span className={styles.ipTipSpan}>!10.0.0./24</span>排除某个网段
    </div>
    <div>
      <span className={styles.ipTipSpan}>[10.0.0.0/24,!10.0.0.5]</span>
      针对该网段但排除网段内的某个IP
    </div>
  </div>
);

const portTipTitle = (
  <div>
    <div>自定义输入范例：</div>
    <div>
      <span className={styles.portTipSpan}>80</span>针对某个端口
    </div>
    <div>
      <span className={styles.portTipSpan}>[80,81,82]</span>针对多个端口
    </div>
    <div>
      <span className={styles.portTipSpan}>[80:82]</span>针对80到82端口范围
    </div>
    <div>
      <span className={styles.portTipSpan}>[1024:]</span>针对所有大于等于1024的端口
    </div>
    <div>
      <span className={styles.portTipSpan}>!80</span>排除某个端口
    </div>
    <div>
      <span className={styles.portTipSpan}>[80:100,!99]</span>针对80到100所有端口，但排除99端口
    </div>
    <div>
      <span className={styles.portTipSpan}>[1:80,![2,4]]</span>针对1到80所有端口，但排除2和4端口
    </div>
  </div>
);

@connect(({ tacticsInvasion, loading }) => ({
  tacticsInvasion,
  loading: loading.effects['tacticsInvasion/fetchEditInfo'],
}))
class RuleEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fastPatternIdx: [],
      matchFieldsOptions: [
        { value: 'labelName', label: '匹配字段' },
        { value: 'payload', label: 'Payload' },
        { value: 'request', label: 'Request' },
        { value: 'response', label: 'Response' },
      ],
      matchContentOnlyStr: true, // 匹配内容先固定为字符串 string
      contentArr: [
        {
          contentKey: 'labelName',
          response_self: 'http_header',
          response_type: 'modifier',
          request_self: 'http_uri',
          request_type: 'modifier',
          not: false,
          matchContentLabel: 'labelName',
          string_self: '',
          regExp_self: '',
          modifiers: [],
        },
      ],
    };
  }

  componentDidMount() {
    const { editItem } = this.props;
    const {
      content: contentData = [],
      src_ip = '',
      src_port = '',
      dst_ip = '',
      dst_port = '',
    } = editItem;
    // 自定义ip 和 端口 数据处理
    const ipSelectArr = ['$HOME_NET', '$EXTERNAL_NET', 'any'];
    if (src_ip && ipSelectArr.indexOf(src_ip) < 0) {
      editItem.src_ip_self = src_ip;
      editItem.src_ip = 'self';
    }
    if (dst_ip && ipSelectArr.indexOf(dst_ip) < 0) {
      editItem.dst_ip_self = dst_ip;
      editItem.dst_ip = 'self';
    }
    if (src_port && src_port !== 'any') {
      editItem.src_port_self = src_port;
      editItem.src_port = 'self';
    }
    if (dst_port && dst_port !== 'any') {
      editItem.dst_port_self = dst_port;
      editItem.dst_port = 'self';
    }
    console.log(118, contentData, 'editItem==', editItem);
    // 匹配字段 content相关数据处理
    if (contentData.length) {
      const modifierOption = ['nocase', 'fast_pattern'];
      const contentArr = [];
      contentData.forEach((cobj) => {
        const item = {
          contentKey: 'labelName',
          response_self: 'http_header',
          response_type: 'modifier',
          request_self: 'http_uri',
          request_type: 'modifier',
          not: false,
          matchContentLabel: 'labelName',
          string_self: '',
          regExp_self: '',
          modifiers: [],
        };
        const { sticky_buffer = '', modifiers = [], content = [], not } = cobj;
        const modifierFieldArr = modifiers.filter((arr) => modifierOption.indexOf(arr[0]) < 0);
        let curMatchField = '';
        if (sticky_buffer) {
          curMatchField = sticky_buffer;
        } else if (modifierFieldArr[0] && modifierFieldArr[0][0]) {
          curMatchField = modifierFieldArr[0][0] || '';
        } else if (modifierFieldArr.length === 0) {
          // sticky_buffer 和 modifiers 没有匹配到字段 表示为payload
          curMatchField = '';
        }
        if (curMatchField) {
          const curFieldObj = reqAndResKeywords.filter((obj) => obj.keyword === curMatchField)[0];
          if (curFieldObj.direction !== 'response') {
            item.contentKey = 'request';
            item.request_self = curFieldObj.keyword;
            item.request_type = curFieldObj.type;
          } else {
            item.contentKey = 'response';
            item.response_self = curFieldObj.keyword;
            item.response_type = curFieldObj.type;
          }
        } else {
          item.contentKey = 'payload';
        }
        item.not = not;
        if (content.indexOf('content') > -1) {
          item.matchContentLabel = 'string';
          const string_self = content.filter((cet) => cet && cet !== 'content')[0];
          item.string_self = string_self;
        }

        // modifiers.forEach(marr => {
        //   if (modifierOption.indexOf(marr[0]) > -1) {
        //     item.modifiers.push(marr[0]);
        //   }
        // });

        const modifiersKey = modifiers.map((marr) => marr[0]);
        // 优先匹配
        if (modifiersKey.indexOf('fast_pattern') > -1) {
          item.modifiers.push('fast_pattern');
        }
        // 不区分大小写
        if (modifiersKey.indexOf('nocase') < 0) {
          item.modifiers.push('case');
        }

        contentArr.push(item);
      });
      console.log(164, '编辑页content数据处理contentArr==', contentArr);
      this.setState({ contentArr });
    }
  }

  onOKSave = () => {
    const { contentArr, matchContentOnlyStr } = this.state;
    const { form, editItem, onSave, dispatch, eventName } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log(133, 'values==', JSON.stringify(values));
        const params = { action: 'alert' };
        const noDataLabel = [];
        keyArr.forEach((tmpKey) => {
          if (tmpKey === 'src_ip') {
            params.src_ip = values[tmpKey] === 'self' ? values.src_ip_self : values[tmpKey];
          } else if (tmpKey === 'src_port') {
            params.src_port = values[tmpKey] === 'self' ? values.src_port_self : values[tmpKey];
          } else if (tmpKey === 'dst_ip') {
            params.dst_ip = values[tmpKey] === 'self' ? values.dst_ip_self : values[tmpKey];
          } else if (tmpKey === 'dst_port') {
            params.dst_port = values[tmpKey] === 'self' ? values.dst_port_self : values[tmpKey];
          } else if (tmpKey === 'msg') {
            params.msg = eventName;
          } else {
            params[tmpKey] = values[tmpKey];
          }
          if (params[tmpKey] === 'labelName') {
            noDataLabel.push(labelData[tmpKey]);
          }
        });
        // console.log(79, 'params===', params);
        if (noDataLabel.length) {
          message.error(`全部项必填：${noDataLabel.join('、')}不能为空`);
          return;
        }

        // 子类 置信度 必须放到metadata中
        const metadata = [{ key: 'credit', value: params.credit }];
        if (editItem['sub-category']) {
          metadata.push({ value: editItem['sub-category'], key: 'sub-category' });
        }
        params.metadata = metadata;
        // 添加传入的字段数据
        iniFieldKeys.forEach((tmpKey) => {
          params[tmpKey] = editItem[tmpKey];
        });

        const content = [];
        // const fastPatternCount = 0;
        const contentErr = [];
        contentArr.forEach((cobj, cidx) => {
          const item = { modifiers: [] };
          const { response_self, response_type, request_self, request_type } = cobj;
          // 匹配字段
          const curContentKeyVal = form.getFieldValue(`contentKey_${cidx}`);
          // 匹配内容
          let curMatchContentLabelVal = 'string';
          if (matchContentOnlyStr === false) {
            curMatchContentLabelVal = form.getFieldValue(`matchContentLabel_${cidx}`);
          }
          // modifiers 复选框
          const curModifiersVal = form.getFieldValue(`modifiers_${cidx}`);
          // 包含 不包含
          const curNotVal = form.getFieldValue(`not_${cidx}`);
          if (curContentKeyVal === 'labelName') {
            if (contentErr.indexOf('匹配字段不能为空') < 0) {
              contentErr.push('匹配字段不能为空');
            }
            return;
          }
          if (curContentKeyVal === 'payload') {
            item.sticky_buffer = '';
          }
          if (curContentKeyVal === 'request' || curContentKeyVal === 'response') {
            const curMatchField = curContentKeyVal === 'request' ? request_self : response_self;
            const curMatchFieldType = curContentKeyVal === 'request' ? request_type : response_type;
            if (curMatchFieldType === 'modifier') {
              item.sticky_buffer = '';
              item.modifiers.push([curMatchField, '']);
            } else {
              item.sticky_buffer = curMatchField;
            }
          }
          if (curMatchContentLabelVal === 'labelName') {
            if (contentErr.indexOf('匹配内容不能为空') < 0) {
              contentErr.push('匹配内容不能为空');
            }
            return;
          }
          if (curMatchContentLabelVal === 'regExp') {
            console.log(4);
          }
          if (curMatchContentLabelVal === 'string') {
            const curStrSelfVal = form.getFieldValue(`string_self_${cidx}`);
            if (curStrSelfVal) {
              item.content = ['content', curStrSelfVal];
            } else {
              if (contentErr.indexOf('字符串匹配内容不能为空') < 0) {
                contentErr.push('字符串匹配内容不能为空');
              }
              return;
            }
          }
          // 优先匹配
          if (curModifiersVal.indexOf('fast_pattern') > -1) {
            item.modifiers.push(['fast_pattern', 'only']);
          }
          // 不区分大小写
          if (curModifiersVal.indexOf('case') < 0) {
            item.modifiers.push(['nocase', '']);
          }
          item.not = curNotVal;
          content.push(item);
        });
        // console.log(211, 'content==', JSON.stringify(content));
        if (contentErr.length) {
          message.error(`${contentErr.join('\n')}`);
          return;
        }
        if (content.length < 1) {
          message.error(`至少完整填写一行匹配字段数据`);
          return;
        }
        params.content = content;

        // const reqObj = { ...editItem, ...params, action: 'alert' };
        const reqObj = { ...params };
        console.log(79, 'buildRule_reqObj===', reqObj);
        const jsonStr = JSON.stringify(reqObj);
        const paramVal = Buffer.from(jsonStr, 'utf8').toString('hex');
        const param = paramVal.toUpperCase();
        dispatch({
          type: 'tacticsInvasion/buildRule',
          payload: { param },
        })
          .then((json) => {
            const { msg = '' } = json;
            const ruleCxt = Buffer.from(msg, 'hex').toString('utf-8');

            // 调用李杰的规则校验接口
            dispatch({
              type: 'tacticsInvasion/validateRule',
              payload: { signature: ruleCxt },
            })
              .then((vjson) => {
                if (vjson.error_code === 0) {
                  message.success('规则配置成功');
                  if (onSave) {
                    const curGuideObj = Object.assign({}, editItem, reqObj);
                    const ruleArrNewObj = {
                      mode: 'guide',
                      rule: ruleCxt,
                      sid: Number(reqObj.sid),
                      gid: Number(reqObj.gid),
                      guideObj: curGuideObj,
                      name: form.getFieldValue(`msg`) || '', // 规则名
                    };
                    onSave(ruleArrNewObj);
                  }
                } else {
                  message.error(`规则校验失败（${vjson.msg}）`);
                }
              })
              .catch((error) => {
                console.log(382, 'error==', error);
                message.error(`规则校验失败（${error.msg}）`);
              });
          })
          .catch((error) => {
            console.log(93, 'error==', error);
            message.error(`规则校验失败（${error.msg}）`);
          });
      }
    });
  };

  validateProto = (rule, value, callback) => {
    let { matchFieldsOptions } = this.state;
    const { contentArr } = this.state;
    const { form } = this.props;
    let contentKeyArr = [];
    if (value === 'labelName' || value === 'http') {
      matchFieldsOptions = [
        { value: 'labelName', label: '匹配字段' },
        { value: 'payload', label: 'Payload' },
        { value: 'request', label: 'Request' },
        { value: 'response', label: 'Response' },
      ];
      contentKeyArr = ['labelName', 'payload', 'request', 'response'];
    } else {
      matchFieldsOptions = [
        { value: 'labelName', label: '匹配字段' },
        { value: 'payload', label: 'Payload' },
      ];
      contentKeyArr = ['labelName', 'payload'];
    }

    contentArr.forEach((item, index) => {
      const curContentKeyVal = form.getFieldValue(`contentKey_${index}`);
      console.log(231, 'index=', index, 'curContentKeyVal==', curContentKeyVal);
      if (contentKeyArr.indexOf(curContentKeyVal) < 0) {
        form.setFieldsValue({ [`contentKey_${index}`]: 'labelName' });
      }
    });
    this.setState({ matchFieldsOptions });
    callback();
  };

  modifiersValidator = (value, callback, cidx) => {
    const { fastPatternIdx } = this.state;
    if (fastPatternIdx.indexOf(cidx) > -1 && value.indexOf('fast_pattern') < 0) {
      fastPatternIdx.pop();
    }
    if (fastPatternIdx.indexOf(cidx) < 0 && value.indexOf('fast_pattern') > -1) {
      fastPatternIdx.push(cidx);
    }
    // console.log(410, 'value=', value, 'fastPatternIdx==', fastPatternIdx);
    this.setState({ fastPatternIdx });
    callback();
  };

  resAndReqMenu = (notDirection, index) => (
    <div>
      {reqAndResKeywords.map((resObj) => {
        if (resObj.direction === notDirection) {
          return null;
        }
        return (
          <a
            className={styles.popverAStyle}
            key={resObj.keyword}
            onClick={() =>
              this.resAndReqKeywordClick(index, notDirection, resObj.keyword, resObj.type)
            }
          >
            {resObj.keyword}
          </a>
        );
      })}
    </div>
  );

  resAndReqKeywordClick = (index, notDirection, value, type) => {
    const { form } = this.props;
    const { contentArr } = this.state;
    const curContentKey = notDirection === 'request' ? 'response' : 'request';
    const key = notDirection === 'request' ? 'response_self' : 'request_self';
    const typeKey = notDirection === 'request' ? 'response_type' : 'request_type';
    contentArr[index] = { ...contentArr[index], [key]: value, [typeKey]: type };
    // console.log(189, index, 'key==', key, 'value==', value, 'contentArr==', contentArr);
    this.setState({ contentArr });
    form.setFieldsValue({ [`contentKey_${index}`]: curContentKey });
    this[`contentKeyNode_${index}`].rcSelect.onOuterBlur();
  };

  contentArrAdd = () => {
    const { contentArr } = this.state;
    contentArr[contentArr.length] = {
      contentKey: 'labelName',
      response_self: 'http_header',
      response_type: 'modifier',
      request_self: 'http_uri',
      request_type: 'modifier',
      not: false,
      matchContentLabel: 'labelName',
      string_self: '',
      regExp_self: '',
      modifiers: [],
    };
    this.setState({ contentArr });
  };

  contentArrDel = (index) => {
    const { contentArr, fastPatternIdx } = this.state;
    const newFastPatternIdx = fastPatternIdx.indexOf(index) < 0 ? fastPatternIdx : [];
    delete contentArr[index];
    // contentArr = contentArr.filter((cobj, cidx) => cidx !== index);
    // console.log(255, 'contentArr==', contentArr);
    this.setState({ contentArr, fastPatternIdx: newFastPatternIdx });
  };

  render() {
    const { matchFieldsOptions, contentArr, matchContentOnlyStr, fastPatternIdx } = this.state;
    const { editItem, visible, form, onCancel, loading } = this.props;

    console.log(130, '编辑页面数据 ', 'editItem==', editItem);

    const { getFieldDecorator } = form;
    return (
      <Modal
        width={850}
        destroyOnClose
        title="规则向导"
        maskClosable={false}
        editItem={editItem}
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOKSave}
      >
        <Form className={styles.FormWrap} loading={loading}>
          <Row gutter={10}>
            <Col span={15} className={styles.InnerItemShow}>
              <FormItem>
                {getFieldDecorator('msg', {
                  initialValue: editItem.msg || '',
                })(<Input placeholder="规则名称" />)}
              </FormItem>
            </Col>
            <Col span={5} className={styles.InnerItemShow}>
              <FormItem>
                {getFieldDecorator('sid', {
                  initialValue: `规则ID：${editItem.sid}`,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                {getFieldDecorator('credit', {
                  initialValue: editItem.credit || 'labelName',
                })(
                  <Select mode="">
                    <Option key="labelName" value="labelName">
                      <div style={{ color: '#BFBFBF' }}>置信度</div>
                    </Option>

                    {configSettings.confidenceOpetion.map((item) => {
                      return (
                        <Option key={item.valueStr} value={item.valueStr}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={3}>
              <FormItem>
                {getFieldDecorator('proto', {
                  initialValue: editItem.proto || 'labelName',
                  rules: [
                    {
                      validator: this.validateProto,
                    },
                  ],
                })(
                  <Select>
                    <Option value="labelName">
                      <div style={{ color: '#BFBFBF' }}>协议</div>
                    </Option>
                    <Option value="http">HTTP</Option>
                    <Option value="tcp">TCP</Option>
                    <Option value="udp">UDP</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Tooltip
              placement="leftTop"
              title={ipTipTitle}
              getPopupContainer={(triggerNode) => triggerNode}
              overlayStyle={{ maxWidth: 380, width: 380 }}
            >
              <Col span={5} className={styles.InnerItemShow}>
                <FormItem>
                  {getFieldDecorator('src_ip', {
                    initialValue: editItem.src_ip || 'labelName',
                  })(
                    <Select>
                      <Option value="labelName">
                        <div style={{ color: '#BFBFBF' }}>IP</div>
                      </Option>
                      <Option value="$HOME_NET">内网</Option>
                      <Option value="$EXTERNAL_NET">外网</Option>
                      <Option value="any">任意</Option>
                      <Option value="self">
                        <div className={styles.selfOption} style={{ display: 'flex' }}>
                          <div className={styles.selfText}>自定义</div>
                          <div className={styles.innerFormItem}>
                            <FormItem>
                              {getFieldDecorator('src_ip_self', {
                                initialValue: editItem.src_ip_self || '',
                              })(<Input placeholder="请输入ip" />)}
                            </FormItem>
                          </div>
                        </div>
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Tooltip>
            <Tooltip
              placement="leftTop"
              title={portTipTitle}
              getPopupContainer={(triggerNode) => triggerNode}
              overlayStyle={{ maxWidth: 360, width: 360 }}
            >
              <Col span={4} className={styles.InnerItemShow}>
                <FormItem>
                  {getFieldDecorator('src_port', {
                    initialValue: editItem.src_port || 'labelName',
                  })(
                    <Select>
                      <Option value="labelName">
                        <div style={{ color: '#BFBFBF' }}>端口</div>
                      </Option>
                      <Option value="any">任意</Option>
                      <Option value="self">
                        <div className={styles.selfOption} style={{ display: 'flex' }}>
                          <div className={styles.selfText}>自定义</div>
                          <div className={styles.innerFormItem}>
                            <FormItem>
                              {getFieldDecorator('src_port_self', {
                                initialValue: editItem.src_port_self || '',
                              })(<Input placeholder="请输入" />)}
                            </FormItem>
                          </div>
                        </div>
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Tooltip>
            <Col span={3}>
              <FormItem>
                {getFieldDecorator('direction', {
                  initialValue: editItem.direction || 'labelName',
                })(
                  <Select>
                    <Option value="labelName">
                      <div style={{ color: '#BFBFBF' }}>报文方向</div>
                    </Option>
                    <Option value="->">-&gt;</Option>
                    <Option value="<>">&lt;&gt;</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Tooltip
              placement="leftTop"
              title={ipTipTitle}
              getPopupContainer={(triggerNode) => triggerNode}
              overlayStyle={{ maxWidth: 380, width: 380 }}
            >
              <Col span={5} className={styles.InnerItemShow}>
                <FormItem>
                  {getFieldDecorator('dst_ip', {
                    initialValue: editItem.dst_ip || 'labelName',
                    // rules: [
                    //   {
                    //     validator: this.validateDstIp,
                    //   },
                    // ],
                  })(
                    <Select>
                      <Option value="labelName">
                        <div style={{ color: '#BFBFBF' }}>IP</div>
                      </Option>
                      <Option value="$HOME_NET">内网</Option>
                      <Option value="$EXTERNAL_NET">外网</Option>
                      <Option value="any">任意</Option>
                      <Option value="self">
                        <div className={styles.selfOption} style={{ display: 'flex' }}>
                          <div className={styles.selfText}>自定义</div>
                          <div className={styles.innerFormItem}>
                            <FormItem>
                              {getFieldDecorator('dst_ip_self', {
                                initialValue: editItem.dst_ip_self || '',
                              })(<Input placeholder="请输入ip" />)}
                            </FormItem>
                          </div>
                        </div>
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Tooltip>
            <Tooltip
              placement="leftTop"
              title={portTipTitle}
              getPopupContainer={(triggerNode) => triggerNode}
              overlayStyle={{ maxWidth: 360, width: 360 }}
            >
              <Col span={4} className={styles.InnerItemShow}>
                <FormItem>
                  {getFieldDecorator('dst_port', {
                    initialValue: editItem.dst_port || 'labelName',
                  })(
                    <Select>
                      <Option value="labelName">
                        <div style={{ color: '#BFBFBF' }}>端口</div>
                      </Option>
                      <Option value="any">任意</Option>
                      <Option value="self">
                        <div className={styles.selfOption} style={{ display: 'flex' }}>
                          <div className={styles.selfText}>自定义</div>
                          <div className={styles.innerFormItem}>
                            <FormItem>
                              {getFieldDecorator('dst_port_self', {
                                initialValue: editItem.dst_port_self || '',
                              })(<Input placeholder="请输入" />)}
                            </FormItem>
                          </div>
                        </div>
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Tooltip>
          </Row>
          <Fragment>
            {contentArr.map((cobj, cidx) => {
              const curModifiersOptions = _.cloneDeep(modifiersOptions);
              if (
                fastPatternIdx.length !== 1 ||
                (fastPatternIdx.length === 1 && fastPatternIdx[0] === cidx)
              ) {
                curModifiersOptions[1].disabled = false;
              } else {
                curModifiersOptions[1].disabled = true;
              }
              console.log(cidx, 'curModifiersOptions==', curModifiersOptions);
              return (
                <Row gutter={10} key={cidx}>
                  <Col span={5} className={styles.InnerItemShow}>
                    <FormItem className={styles.morePopoverItem}>
                      {getFieldDecorator(`contentKey_${cidx}`, {
                        initialValue: cobj.contentKey || 'labelName',
                      })(
                        <Select
                          ref={(node) => {
                            this[`contentKeyNode_${cidx}`] = node;
                          }}
                          getPopupContainer={(triggerNode) => triggerNode}
                        >
                          {matchFieldsOptions.map((obj) => {
                            let { label } = obj;
                            if (obj.value === 'labelName') {
                              label = <div style={{ color: '#BFBFBF' }}>匹配字段</div>;
                            }
                            if (obj.value === 'request') {
                              const reqmenu = this.resAndReqMenu('response', cidx);
                              return (
                                <Option disabled key={obj.value} value={obj.value}>
                                  <div className={styles.selfOption} style={{ display: 'flex' }}>
                                    <div className={styles.selfText}>
                                      <Popover
                                        content={reqmenu}
                                        overlayStyle={{
                                          maxHeight: 310,
                                          overflow: 'auto',
                                          backgroundColor: '#fff',
                                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                        }}
                                        getPopupContainer={(triggerNode) => triggerNode}
                                        placement="rightTop"
                                        trigger="hover"
                                      >
                                        <div className={styles.popoverOptionDiv}>
                                          <span>{label}</span>
                                          <CaretRightOutlined style={{ color: '#ccc' }} />
                                        </div>
                                      </Popover>
                                    </div>
                                    <div className={styles.innerFormItem}>
                                      <div type={cobj.request_type} title={cobj.request_self}>
                                        {cobj.request_self}
                                      </div>
                                    </div>
                                  </div>
                                </Option>
                              );
                            }
                            if (obj.value === 'response') {
                              const resmenu = this.resAndReqMenu('request', cidx);
                              return (
                                <Option disabled key={obj.value} value={obj.value}>
                                  <div className={styles.selfOption} style={{ display: 'flex' }}>
                                    <div className={styles.selfText}>
                                      <Popover
                                        content={resmenu}
                                        overlayStyle={{
                                          maxHeight: 310,
                                          overflow: 'auto',
                                          backgroundColor: '#fff',
                                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                        }}
                                        getPopupContainer={(triggerNode) => triggerNode}
                                        placement="rightTop"
                                        trigger="hover"
                                      >
                                        <div className={styles.popoverOptionDiv}>
                                          <span>{label}</span>
                                          <CaretRightOutlined style={{ color: '#ccc' }} />
                                        </div>
                                      </Popover>
                                    </div>
                                    <div className={styles.innerFormItem}>
                                      <div type={cobj.response_type} title={cobj.response_self}>
                                        {cobj.response_self}
                                      </div>
                                    </div>
                                  </div>
                                </Option>
                              );
                            }
                            return (
                              <Option key={obj.value} value={obj.value}>
                                {label}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={3}>
                    <FormItem>
                      {getFieldDecorator(`not_${cidx}`, {
                        initialValue: cobj.not || false,
                      })(
                        <Select>
                          <Option value={false}>包含</Option>
                          <Option value>不包含</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  {matchContentOnlyStr === true && (
                    <Col span={9} className={styles.InnerItemShow}>
                      <FormItem>
                        {getFieldDecorator(`string_self_${cidx}`, {
                          initialValue: cobj.string_self || '',
                        })(<Input placeholder="请输入匹配内容" />)}
                      </FormItem>
                    </Col>
                  )}
                  {matchContentOnlyStr === false && (
                    <Col span={9} className={styles.InnerItemShow}>
                      <FormItem>
                        {getFieldDecorator(`matchContentLabel_${cidx}`, {
                          initialValue: cobj.matchContentLabel || 'labelName',
                        })(
                          <Select>
                            <Option value="labelName">
                              <div style={{ color: '#BFBFBF' }}>匹配内容</div>
                            </Option>
                            <Option value="string">
                              <div className={styles.selfOption} style={{ display: 'flex' }}>
                                <div className={styles.selfText}>字符串</div>
                                <div className={styles.innerFormItem}>
                                  <FormItem>
                                    {getFieldDecorator(`string_self_${cidx}`, {
                                      initialValue: cobj.string_self || '',
                                    })(<Input placeholder="请输入" />)}
                                  </FormItem>
                                </div>
                              </div>
                            </Option>
                            <Option disabled value="regExp">
                              <div className={styles.selfOption} style={{ display: 'flex' }}>
                                <div className={styles.selfText}>正则</div>
                                <div className={styles.innerFormItem}>
                                  <FormItem>
                                    {getFieldDecorator(`regExp_self_${cidx}`, {
                                      initialValue: cobj.regExp_self || '',
                                    })(<Input placeholder="请输入" />)}
                                  </FormItem>
                                </div>
                              </div>
                            </Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  )}
                  <Col span={7}>
                    <div style={{ display: 'flex' }}>
                      <div>
                        <FormItem>
                          {getFieldDecorator(`modifiers_${cidx}`, {
                            initialValue: cobj.modifiers || [],
                            rules: [
                              {
                                validator: (rule, value, callback) => {
                                  this.modifiersValidator(value, callback, cidx);
                                },
                              },
                            ],
                          })(<CheckboxGroup options={curModifiersOptions} />)}
                        </FormItem>
                      </div>
                      <div className={styles.iconBtnsDiv}>
                        {cidx === 0 && (
                          <PlusSquareOutlined className={styles.plusIcon} onClick={this.contentArrAdd} />
                        )}
                        {cidx > 0 && (
                          <MinusSquareOutlined
                            className={styles.minusIcon}
                            onClick={() => {
                              this.contentArrDel(cidx);
                            }} />
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              );
            })}
          </Fragment>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(RuleEditForm);
