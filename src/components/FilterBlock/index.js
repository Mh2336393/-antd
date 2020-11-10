import React, { Component } from 'react';
import { Row, Col, Button, Select, Input, DatePicker } from 'antd';
import array from 'lodash/array';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
const format = 'YYYY-MM-DD HH:mm:ss';
class FiltBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timePickerShow: false,
      timeSelect: '近7天', // RangePicker选择的时间范围
      timeStart: '', // RangePicker选择的开始时间
      timeEnd: '',
    };
  }

  componentDidMount = () => {
    const {
      timeRange,
      query: { startTime, endTime },
    } = this.props;
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
    const {
      timeRange,
      query: { startTime, endTime },
    } = nextProps;
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
    const timeStart = moment().subtract(interval, 'days');
    return [timeStart.valueOf(), timeEnd.valueOf(), timeSelect];
  };

  filterOnChange = (type, value) => {
    const { filterOnChange } = this.props;
    if (type === 'timeRange') {
      if (value === '自定义') {
        this.setState({ timePickerShow: true });
      } else {
        this.setState({ timeSelect: value });
        filterOnChange(type, this.onSearchTimeRefresh(value));
      }
    } else {
      filterOnChange(type, value);
    }
  };

  timePickerChange = moments => {
    this.setState({ timeStart: moments[0], timeEnd: moments[1] });
  };

  ontimePiker = (timeStart, timeEnd) => {
    const { filterOnChange } = this.props;
    const timeSelect = `${timeStart.format(format)} 至 ${timeEnd.format(format)}`;
    filterOnChange('timeRange', [timeStart.valueOf(), timeEnd.valueOf(), timeSelect]);
    this.setState({ timePickerShow: false, timeSelect });
  };

  render() {
    const { timePickerShow, timeSelect, timeStart, timeEnd } = this.state;
    const { colNum, query, filterList, submitFilter, filterOnChange, searchColStyle } = this.props;
    const { endTime, startTime } = query;
    const chunkList = array.chunk(filterList, colNum); // 分割后的数组
    return (
      <div style={{ margin: '0 24px' }}>
        <Row gutter={48}>
          <Col span={20}>
            {chunkList.map((rowList, index) => (
              <Row key={rowList[0].name} gutter={24} style={{ paddingTop: index === 0 ? 0 : 10, paddingBottom: 10 }}>
                {rowList.map(item => (
                  <Col span={24 / colNum} key={`${item.key}${item.name}`}>
                    <Row gutter={16}>
                      <Col span={8} style={{ textAlign: 'right', padding: 0 }}>
                        <span style={{ lineHeight: '32px' }}>{item.name}:</span>
                      </Col>
                      <Col span={16} style={{ display: 'relative' }}>
                        {item.type === 'select' && (
                          <Select
                            style={{ width: '100%' }}
                            showSearch={item.showSearch}
                            filterOption={
                              item.showSearch
                                ? (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                : null
                            }
                            onChange={value => {
                              this.filterOnChange(item.key, value);
                            }}
                            value={item.key === 'timeRange' ? timeSelect : query[item.key]}
                          >
                            {item.list.map(option => (
                              <Option key={`${item.value}${option.name}`} value={option.value}>
                                {option.name}
                              </Option>
                            ))}
                          </Select>
                        )}
                        {item.type === 'input' && (
                          <Input
                            style={{ width: '100%' }}
                            onChange={e => {
                              filterOnChange(item.key, e.target.value);
                            }}
                            value={query[item.key]}
                            placeholder={item.placeholder}
                          />
                        )}
                        {timePickerShow && item.key === 'timeRange' && (
                          <div>
                            <RangePicker
                              disabledDate={current => current > moment().endOf('day')}
                              // popupClassName={styles['timeRange-picker']}
                              allowClear={false}
                              defaultValue={[moment(startTime), moment(endTime)]}
                              // value={[timeStart, timeEnd]}
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
                      </Col>
                    </Row>
                  </Col>
                ))}
              </Row>
            ))}
          </Col>
          <Col span={4} style={searchColStyle || ''}>
            <Button type="primary" onClick={submitFilter}>
              搜索
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default FiltBlock;
