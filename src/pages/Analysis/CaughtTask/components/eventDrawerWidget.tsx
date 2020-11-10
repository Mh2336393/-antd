import React, {
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { connect } from 'dva';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import Cookies from 'js-cookie';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Row, Col, Select, Radio, DatePicker, Button, message } from 'antd';
import styles from './eventDrawerWidget.less';
import configSettings from '@/configSettings';
import { Task, node } from '../interface/event';

const moment = require('moment');

const { Option } = Select;
const { TextArea } = Input;

const flowDirection = [
  { name: '双向流量', value: 'double' },
  { name: '单向流量', value: 'single' }
]

const startOpetion = [
  { name: '立即启动', value: '立即启动' },
  { name: '自定义', value: '自定义' },
]

const networkLayerProtocol = [
  { name: 'ALL', value: 'all' },
  { name: 'TCP', value: 'tcp' },
  { name: 'UDP', value: 'udp' },
  { name: 'ICMP', value: 'icmp' },
]

interface IEventDrawerWidgetProp {
  isvisible: boolean;
  title: string | ReactNode;
  record: Task,
  nodeList: [node],
  onClose?: (isRefresh: boolean) => void;
  dispatch?: any;
  addloading: boolean,
  editloading: boolean,
  form: any
}



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


const EventDrawerWidget: React.FC<IEventDrawerWidgetProp> = ({
  isvisible,
  title,
  record,
  nodeList,
  onClose,
  dispatch,
  addloading,
  editloading,
  form
}) => {
  const [visibile, setVisible] = useState<boolean>(false);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);// 告诉父组件是否需要刷新数据

  useEffect(() => {
    setVisible(isvisible);
  }, [isvisible]);

  useEffect(() => {
    if (!visibile) {
      onClose(isRefresh);
    }
    return () => { };
  }, [visibile]);

  useEffect(() => {
    dispatch({
      type: 'asset/fetchAssetConfig',
    });
  }, []);



  const formRenderer = () => {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    return (
      <div>
        <Form className={styles.warnForm} onSubmit={(e) => { handleSubmit(e) }}>

          <Row className={styles.rowBlock}>
            <Col span={4}>
              <h4 className={styles.title4}>任务信息</h4>
            </Col>
            <Col span={20}>

              <Form.Item {...formItemLayout} label="任务名称">
                {getFieldDecorator('name', {
                  initialValue: record?.name || '',
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: '必填',
                    },
                    { max: 64, message: '最多填写64字符，请重新填写' },
                    {
                      validator: configSettings.validateEventName,
                    },
                  ],
                })(<Input disabled={record.status === 'running'} />)}
              </Form.Item>

              <Form.Item {...formItemLayout} label="用户名称">
                {getFieldDecorator('user', {
                  initialValue: record?.user || decodeURI(Cookies.get('username')),
                  rules: [
                    {
                      required: true
                    }
                  ],
                })(<Input disabled />)}
              </Form.Item>

              <Form.Item {...formItemLayout} label="探针选择">
                {getFieldDecorator('probeChoice', {
                  initialValue: record?.node?.ip || nodeList[0]?.ip,
                  validateTrigger: 'onChange',
                  rules: [{ required: true, message: '必选' }, { validator: validIpv4 }],
                })(
                  <Select disabled={record.status === 'running'}>
                    {nodeList.map(item => (
                      <Option key={item.ip} value={item.ip}>
                        {`${item.name}(${item.ip})`}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <Form.Item {...formItemLayout} label="启动时间" className={styles.startTime}>
                {getFieldDecorator('startupTime', {
                  initialValue: record?.start_time || '立即启动',
                  rules: [{ required: true, message: '启动时间必选!' }],
                })(
                  <Select disabled={record.status === 'running'}>
                    {startOpetion.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                )}

                {getFieldValue('startupTime') === '自定义' && (
                  <DatePicker
                    open
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    disabledDate={(current) => {
                      return current && current < moment().subtract(1, 'hours');
                    }}
                    renderExtraFooter={() => {
                      return (
                        <Button
                          style={{ margin: "6px 7px 0 0", float: "left", height: 24, fontSize: 14, padding: "0 9px" }}
                          onClick={() => {
                            setFieldsValue({
                              startupTime: '立即启动'
                            })
                          }}
                        >
                          取消
                        </Button>
                      )
                    }}
                    onOk={(date) => {
                      setFieldsValue({
                        startupTime: moment(date).format('YYYY-MM-DD HH:mm:ss')
                      })
                    }}
                  />
                )}


              </Form.Item>

            </Col>
          </Row>


          <Row className={styles.rowBlock}>
            <Col span={4}>
              <h4 className={styles.title4}>过滤条件</h4>
            </Col>
            <Col span={20}>

              <Form.Item {...formItemLayout} label="流量方向">
                {getFieldDecorator('flowDirection', {
                  initialValue: record?.rule?.type || flowDirection[0].value,
                })(
                  <Radio.Group disabled={record.status === 'running'}>
                    {flowDirection.map(item => (
                      <Radio key={item.value} value={item.value}>
                        {item.name}
                      </Radio>
                    ))}
                  </Radio.Group>
                )}
              </Form.Item>

              <Form.Item {...formItemLayout} label="源IP">
                {getFieldDecorator('sourceIP', {
                  initialValue: record?.rule?.tuple[0] || '',
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      validator: configSettings.validateIpList,
                    },
                  ],
                })(<TextArea disabled={record.status === 'running'} autoSize={{ minRows: 2, maxRows: 6 }} placeholder="支持 192.168.0.1 或 192.168.0.0/24 允许输入多个，以英文逗号或者换行分隔" />)}
              </Form.Item>

              <Form.Item {...formItemLayout} label="源端口">
                {getFieldDecorator('sourcePort', {
                  initialValue: record?.rule?.tuple[1] || '',
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      validator: configSettings.validPort,
                    },
                  ],
                })(<Input disabled={record.status === 'running'} placeholder="支持 80 或 1-65535 允许输入多个，以英文逗号或者换行分隔" />)}
              </Form.Item>

              <Form.Item {...formItemLayout} label="目的IP">
                {getFieldDecorator('destinationIP', {
                  initialValue: record?.rule?.tuple[2] || '',
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      validator: configSettings.validateIpList,
                    },
                  ],
                })(<TextArea disabled={record.status === 'running'} autoSize={{ minRows: 2, maxRows: 6 }} placeholder="支持 192.168.0.1 或 192.168.0.0/24 允许输入多个，以英文逗号或者换行分隔" />)}
              </Form.Item>

              <Form.Item {...formItemLayout} label="目的端口">
                {getFieldDecorator('destinationPort', {
                  initialValue: record?.rule?.tuple[3] || '',
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      validator: configSettings.validPort,
                    },
                  ],
                })(<Input disabled={record.status === 'running'} placeholder="支持 80 或 1-65535 允许输入多个，以英文逗号或者换行分隔" />)}
              </Form.Item>

              <Form.Item {...formItemLayout} label="网络层协议">
                {getFieldDecorator('networkLayerProtocol', {
                  initialValue: record?.rule?.tuple[4] || networkLayerProtocol[0].value,
                })(
                  <Select disabled={record.status === 'running'}>
                    {networkLayerProtocol.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <Form.Item {...formItemLayout} label="最大捕获时长">
                {getFieldDecorator('maximumCaptureTime', {
                  initialValue: record?.rule?.time || 60,
                })(
                  <Input
                    disabled={record.status === 'running'}
                    onBlur={(event) => {
                      onBlur(event, 1440, 'maximumCaptureTime', /^[0-9]+$/)
                    }}
                    placeholder="限制最大值1440,只允许输入整数"
                    addonAfter="min"
                  />
                )}
              </Form.Item>

              <Form.Item {...formItemLayout} label="最大捕获大小">
                {getFieldDecorator('maximumCaptureTrafficSize', {
                  initialValue: record?.rule?.size || 500,
                })(
                  <Input
                    disabled={record.status === 'running'}
                    onBlur={(event) => {
                      onBlur(event, 500, 'maximumCaptureTrafficSize', /^[0-9]*(\.[0-9]*)?$/)
                    }}
                    placeholder="限制最大值500"
                    addonAfter="MB"
                  />
                )}
              </Form.Item>

            </Col>
          </Row>

          <Form.Item>
            <div className={styles.btnBox}>
              <Button
                style={{ marginRight: 20 }}
                onClick={() => {
                  setIsRefresh(false)
                  setVisible(false)
                }}
              >
                取消
              </Button>

              <Button
                loading={addloading || editloading}
                type="primary"
                htmlType="submit"
                disabled={getFieldValue('startupTime') === '自定义' || record.status === 'running'}>
                确定
              </Button>

            </div>

          </Form.Item>

        </Form>
      </div>
    );
  };

  function validIpv4(rule, value, callback) {
    if (value) {
      if (!configSettings.isValidIP(value)) {
        callback('必须选择一个探针ip');
      } else {
        callback();
      }
    } else {
      callback('必须选择一个探针ip');
    }
  };

  /**
   * 
   * @param e 事件对象
   * @param maxNum 允许得最大值
   * @param decoratorName 装饰器名称
   * @param reg 正则检查
   */
  function onBlur(e, maxNum, decoratorName, reg) {
    const { value } = e.target;
    const { setFieldsValue } = form
    const obj = {}
    // 如果不匹配或者大于最大值，那么强制设置为maxNum
    if (!reg.test(value) || Number(value) > maxNum || Number(value) === 0) {
      obj[`${decoratorName}`] = maxNum
      setFieldsValue(obj);
      return
    }
    // 限制小数范围
    obj[`${decoratorName}`] = Number(parseFloat(value).toFixed(2))
    setFieldsValue(obj);
  };

  /**
   * 表单提交逻辑
   */
  function handleSubmit(e) {
    e.preventDefault();
    form.validateFields(async (err, values) => {
      if (!err) {
        console.log("当前表单数据", values)
        // 组合抓包任务数据结构
        const taskDataStructure: Task = {
          name: values.name,
          user: values.user,
          node: {
            id: nodeList.find(item => {
              return item.ip === values.probeChoice;
            }).id,
            ip: values.probeChoice
          },
          rule: {
            type: values.flowDirection,
            tuple: [values.sourceIP, values.sourcePort, values.destinationIP, values.destinationPort, values.networkLayerProtocol],
            time: values.maximumCaptureTime,
            size: values.maximumCaptureTrafficSize
          }
        };
        if (values.startupTime !== '立即启动') {
          taskDataStructure.start = values.startupTime
        }

        console.log("组合出来得抓包任务数据结构", taskDataStructure)
        // 编辑
        if (title !== '新建任务' && record?.tid) {
          taskDataStructure.tid = record.tid
          const res = await dispatch({
            type: 'caughtTask/editCaptureTask',
            payload: taskDataStructure
          });
          message.success(res.msg)
          setIsRefresh(true)
          setVisible(false)
        } else {
          // 新建
          const res = await dispatch({
            type: 'caughtTask/addCaptureTask',
            payload: taskDataStructure
          });
          message.success(res.msg)
          setIsRefresh(true)
          setVisible(false)
        }
      }
    })
  };


  return (
    <DrawerWidget
      width={960}
      visible={visibile}
      title={title}
      contentStyle={{ padding: 20 }}
      onClose={() => {
        setVisible(false);
      }}
    >
      {formRenderer()}
    </DrawerWidget>
  );
};



export default connect(({ loading }) => ({
  addloading: loading.effects['caughtTask/addCaptureTask'],
  editloading: loading.effects['caughtTask/editCaptureTask'],
}))(Form.create({ name: 'caughtTaskForm' })(EventDrawerWidget));



