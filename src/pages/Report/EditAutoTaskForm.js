import React, { Component } from 'react';
import { connect } from 'umi';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import _ from 'lodash';
import { Modal, Input, Select, Col, TimePicker } from 'antd';

/* eslint-disable camelcase */

const FormItem = Form.Item;
const { Option } = Select;

@connect()
class EditAutoTaskForm extends Component {
  constructor(props) {
    super(props);
    const { editItem } = this.props;
    // 'daily','weekly','monthly'
    const dateArray = this.getDateArr(editItem.period);
    const curTime = moment(editItem.next_working_time).format('HH:mm:ss');
    let curDate = '';
    if (editItem.period === 'weekly') {
      const dayNum = moment(editItem.next_working_time).day();
      if (dayNum === 0) curDate = 'Sun';
      if (dayNum === 1) curDate = 'Mon';
      if (dayNum === 2) curDate = 'Tues';
      if (dayNum === 3) curDate = 'Wed';
      if (dayNum === 4) curDate = 'Thur';
      if (dayNum === 5) curDate = 'Fri';
      if (dayNum === 6) curDate = 'Sat';
    }
    if (editItem.period === 'monthly') {
      const dateNum = moment(editItem.next_working_time).date();
      if (dateNum === 1) curDate = 'start';
      if (dateNum === 15) curDate = 'middle';
      if (dateNum === 30) curDate = 'finish';
      if (dateNum === 31) curDate = 'finish';
    }
    // console.log('curDate===', curDate, curTime, editItem.period);
    this.state = {
      dateArray,
      timeVal: curTime,
      dateVal: curDate,
    };
  }

  onOKSave = () => {
    const { form, editItem, onSave, modalType } = this.props;
    const { timeVal } = this.state;
    // console.log('time', timeVal.substring(0, 2) > 10 ? timeVal.substring(0, 2) : timeVal.substring(1, 2));
    const { time_start } = editItem;
    const iniRangeVal = this.timeToPeriod(editItem.time_start, editItem.time_end);
    form.validateFields((err, values) => {
      if (!err) {
        if (modalType === 'editor') {
          const { asset, topn, template_id, date, timeRange, ...merge } = values;
          const params = { ...merge };
          params.asset = Number(asset);
          params.topn = Number(topn);
          params.template_id = Number(template_id);
          params.generate_date = date;
          params.generate_time = timeVal.substring(0, 2);
          params.time_end = moment(editItem.time_end).format('YYYY-MM-DD HH:mm:ss');
          params.time_start = moment(time_start).format('YYYY-MM-DD HH:mm:ss');

          // console.log('iniRangeVal==', iniRangeVal, 'timeRange', timeRange, iniRangeVal !== timeRange);
          if (iniRangeVal !== timeRange) {
            if (timeRange === '1') {
              params.time_start = moment(editItem.time_end)
                .subtract(1, 'days')
                .format('YYYY-MM-DD HH:mm:ss');
            }
            if (timeRange === '7') {
              params.time_start = moment(editItem.time_end)
                .subtract(1, 'weeks')
                .format('YYYY-MM-DD HH:mm:ss');
            }
            if (timeRange === '30') {
              params.time_start = moment(editItem.time_end)
                .subtract(1, 'months')
                .format('YYYY-MM-DD HH:mm:ss');
            }
            if (timeRange === '90') {
              params.time_start = moment(editItem.time_end)
                .subtract(3, 'months')
                .format('YYYY-MM-DD HH:mm:ss');
            }
            if (timeRange === '365') {
              params.time_start = moment(editItem.time_end)
                .subtract(1, 'years')
                .format('YYYY-MM-DD HH:mm:ss');
            }
          }
          delete params.time;
          if (editItem.id) {
            params.id = editItem.id;
          }
          if (onSave) {
            onSave(params);
          }
        } else if (modalType === 'save') {
          const params = { ...values };
          params.time = timeVal.substring(0, 2);
          if (onSave) {
            onSave(params);
          }
        }

        // console.log('3333editItem==', editItem);
        // console.log('333params==', params);

        // console.log('onSave==', onSave);
      }
    });
  };

  onTimeChange = (time, timeString) => {
    this.setState({ timeVal: timeString });
  };

  switchSelectChange = (value) => {
    const { form } = this.props;
    const dateArray = this.getDateArr(value);
    this.setState({ dateArray, dateVal: dateArray[0].value });
    form.setFieldsValue({
      date: dateArray[0].value,
    });
  };

  changeDate = (value) => {
    const { form } = this.props;
    this.setState({ dateVal: value });
    form.setFieldsValue({
      date: value,
    });
  };

  timeToPeriod = (start, end) => {
    let periodStr = '';
    const range = moment(end).diff(moment(start), 'days');
    if (moment(end).diff(moment(start), 'days') <= 1) {
      periodStr = '1';
    } else if (range > 1 && range <= 7) {
      periodStr = '7';
    } else if (range > 7 && range <= 31) {
      periodStr = '30';
    } else if (range > 31 && range <= 92) {
      periodStr = '90';
    } else if (range > 92) {
      periodStr = '365';
    }
    return periodStr;
  };

  // 生成时间--前部分
  getDateArr = (type) => {
    if (type === 'daily') {
      return [{ name: '每天', value: '' }];
    }
    if (type === 'weekly') {
      return [
        { name: '周一', value: 'Mon' },
        { name: '周二', value: 'Tues' },
        { name: '周三', value: 'Wed' },
        { name: '周四', value: 'Thur' },
        { name: '周五', value: 'Fri' },
        { name: '周六', value: 'Sat' },
        { name: '周日', value: 'Sun' },
      ];
    }
    return [
      { name: '每月第一天', value: 'start' },
      { name: '每月15日', value: 'middle' },
      { name: '每月最后一天', value: 'finish' },
    ];
  };

  validateTaskName = (rule, value, callback) => {
    if (value) {
      const patternReprt = new RegExp(
        "[`~!@#$^&*()={}\\/\\\\'.:,+\";'\\[\\]%<>?~！@#￥……&*（）+《》——{}【】‘；：”“'。，、？]"
      );
      // console.log('strReg==', strReg, 'strReg.test(value)==', strReg.test(value));
      if (patternReprt.test(value)) {
        callback('名称不能包含“!#$^&*=|{}%”等非法字符');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  render() {
    const { dateArray, timeVal, dateVal } = this.state;
    const { editItem, visible, form, onCancel, modalTitle, modalType, tml, groups } = this.props;
    // console.log('edit===', editItem);
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

    const rangeVal = this.timeToPeriod(editItem.time_start, editItem.time_end);
    // console.log('editItem.time_start===', editItem.time_start, editItem.time_end);
    return (
      <Modal
        title={modalTitle}
        editItem={editItem}
        visible={visible}
        destroyOnClose
        onCancel={onCancel}
        onOk={this.onOKSave}
      >
        <Form>
          {modalType === 'editor' && (
            <div>
              <FormItem {...formItemLayout} label="任务名称" extra="">
                {getFieldDecorator('task_name', {
                  initialValue: editItem.task_name || '',
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: '必填',
                    },
                    { max: 64, message: '最多填写64字符，请重新填写' },
                    {
                      validator: this.validateTaskName,
                    },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem {...formItemLayout} label="报告描述" extra="">
                {getFieldDecorator('description', {
                  initialValue: editItem.description || '',
                  rules: [{ max: 512, message: '最多填写512字符，请重新填写' }],
                })(<Input.TextArea />)}
              </FormItem>
              <FormItem {...formItemLayout} label="报表模板">
                {getFieldDecorator('template_id', {
                  initialValue: `${editItem.template_id || ''}`,
                })(
                  <Select>
                    {tml.map((list) => (
                      <Option key={`${list.id}`} value={`${list.id}`}>
                        {list.template_name}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="时间范围">
                {getFieldDecorator('timeRange', {
                  initialValue: rangeVal || '1',
                })(
                  <Select mode="">
                    <Option key="1" value="1">
                      近24小时
                    </Option>
                    <Option key="7" value="7">
                      近一周
                    </Option>
                    <Option key="30" value="30">
                      近一月
                    </Option>
                    <Option key="90" value="90">
                      近一季度
                    </Option>
                    <Option key="365" value="365">
                      近一年
                    </Option>
                    {/* <Option key="0" value="0">
                      自定义
                    </Option> */}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="包含资产组">
                {getFieldDecorator('asset', {
                  initialValue: `${editItem.asset || 0}`,
                })(
                  <Select onChange={this.changeSelect}>
                    {groups.map((list) => (
                      <Option key={`${list.Fgid}`} value={`${list.Fgid}`}>
                        {list.Fgroup_name}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="数据展示">
                {getFieldDecorator('topn', {
                  initialValue: `${editItem.topn || 10}`,
                })(
                  <Select>
                    <Option key="10" value="10">
                      Top10
                    </Option>
                    <Option key="50" value="50">
                      Top50
                    </Option>
                  </Select>
                )}
              </FormItem>
            </div>
          )}
          <FormItem {...formItemLayout} label="重复">
            {getFieldDecorator('period', {
              initialValue: editItem.period || 'daily',
            })(
              <Select onChange={this.switchSelectChange}>
                <Option key="daily" value="daily">
                  每天一次
                </Option>
                <Option key="weekly" value="weekly">
                  每周一次
                </Option>
                <Option key="monthly" value="monthly">
                  每月一次
                </Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="生成时间">
            <Col span={11}>
              <FormItem>
                {getFieldDecorator('date', {
                  initialValue: dateVal,
                })(
                  <Select onChange={this.changeDate}>
                    {dateArray.map((tag) => (
                      <Option key={tag.value} value={tag.value}>
                        {tag.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={2} />
            <Col span={11}>
              <FormItem>
                {getFieldDecorator('time', {
                  initialValue: moment(`${timeVal}`, 'HH:mm:ss'),
                })(
                  <TimePicker
                    format="HH:00:00"
                    onChange={this.onTimeChange}
                    style={{ width: '100%' }}
                    placeholder="请选择小时"
                  />
                )}
              </FormItem>
            </Col>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(EditAutoTaskForm);
