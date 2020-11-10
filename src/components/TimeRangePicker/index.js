import React, { Component } from 'react';
import { Select, DatePicker } from 'antd';
import moment, { months } from 'moment';

/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */

const { RangePicker } = DatePicker;
const { Option } = Select;
const format = 'YYYY-MM-DD HH:mm:ss';
const options = [
  {
    name: '近24小时',
    value: 1,
  },
  {
    name: '近7天',
    value: 7,
  },
  {
    name: '近30天',
    value: 30,
  },
  {
    name: '自定义',
    value: '自定义',
  },
];
class TimeRangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timePickerShow: false,
      timeSelect: 1, // RangePicker选择的时间范围
      timeStart: '', // RangePicker选择的开始时间
      timeEnd: '',

    };
  }

  componentDidMount = () => {
    const { timeRange, startTime, endTime } = this.props;
    const { timeSelect } = this.state;
    const timeStart = moment(startTime);

    const timeEnd = moment(endTime);
    if (timeRange && timeRange !== timeSelect) {
      this.setState({ timeSelect: timeRange });
    }
    this.setState({
      timeStart,
      timeEnd,
    });
  };

  componentWillReceiveProps = nextProps => {
    const { timeRange, startTime, endTime } = nextProps;
    const { timeSelect } = this.state;
    if (timeRange && timeRange !== timeSelect) {
      const timeStart = moment(startTime);
      const timeEnd = moment(endTime);
      this.setState({
        timeStart,
        timeEnd,
        timeSelect: timeRange,
      });
    }
  };

  onSearchTimeRefresh = timeSelect => {
    const timeEnd = moment();
    let interval;
    switch (timeSelect) {
      case '今天':
        interval = '';
        break;
      case '近24小时':
      case 1:
        interval = 1;
        break;
      case '近7天':
      case 7:
        interval = 7;
        break;
      case '近15天':
      case 15:
        interval = 15;
        break;
      case '近30天':
      case 30:
        interval = 30;
        break;
      default:
        interval = 90;
        break;
    }
    const timeStart = interval ? moment().subtract(interval, 'days') : moment(moment().format('YYYY-MM-DD 00:00:00'));
    return [timeStart.valueOf(), timeEnd.valueOf(), timeSelect];
  };

  filterOnChange = value => {
    const { timePickerOnchange } = this.props;
    if (value === '自定义') {
      this.setState({ timePickerShow: true });
    } else {
      this.setState({ timeSelect: value });
      timePickerOnchange(this.onSearchTimeRefresh(value));
    }
  };

  timePickerChange = moments => {
    this.setState({ timeStart: moments[0], timeEnd: moments[1] });
    // const newendtimes = moment().endOf('day').format(format).split(/[ ]+/)[0]
    // const endtimes=moments[1].format("YYYY-MM-DD 23:59:59").split(/[ ]+/)[0]
    // if(newendtimes===endtimes){
    //   this.setState({ timeStart: moment(new Date(moments[0].format("YYYY-MM-DD ")).getTime()) , timeEnd: moment() });
    // }else{
    //   this.setState({ timeStart:moment(new Date(moments[0].format("YYYY-MM-DD ")).getTime()) , timeEnd: moment(new Date(moments[1].format("YYYY-MM-DD 23:59:59")).getTime()) });
    // }
  };

  ontimePiker = (timeStart, timeEnd) => {
    const { timePickerOnchange } = this.props;
    const timeSelect = `${timeStart.format(format)} 至 ${timeEnd.format(format)}`;
    timePickerOnchange([timeStart.valueOf(), timeEnd.valueOf(), timeSelect]);
    this.setState({ timePickerShow: false, timeSelect });
  };

  render() {
    const { timePickerShow, timeSelect, timeStart, timeEnd } = this.state;
    const { endTime, startTime, customOptions, selectWidth = '100%' } = this.props;
    const op = customOptions || options;

    return (
      <div>
        <Select
          style={{ width: selectWidth }}
          showSearch
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onChange={value => {
            this.filterOnChange(value);
          }}
          value={timeSelect}
        >
          {op.map(option => (
            <Option key={`${option.value}${option.name}`} value={option.value}>
              {option.name}
            </Option>
          ))}
        </Select>
        {timePickerShow && (
          <div>
            <RangePicker
              disabledDate={current => current > moment().endOf('day')}
              allowClear={false}
              // defaultValue={[moment(moment(startTime).format("YYYY-MM-DD 00:00:00")), moment(currentdate===newtime?endTime:moment(endTime).format("YYYY-MM-DD 23:59:59"))]}
               defaultValue={[moment(startTime), moment(endTime)]}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={this.timePickerChange}
              onOk={() => {
                this.ontimePiker(timeStart, timeEnd);
              }}
              onOpenChange={status => {
                if (!status) {
                  this.ontimePiker(timeStart, timeEnd);
                }
              }}
              open
            />
          </div>
        )}
      </div>
    );
  }
}

export default TimeRangePicker;
