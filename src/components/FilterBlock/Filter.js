import React, { Component } from 'react';
import { Button, Select, Input, DatePicker } from 'antd';
// import array from 'lodash/array';
import moment from 'moment';
import styles from './index.less';
// import FilterBlock from '.';

/* eslint-disable no-unused-vars */

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
    const timeStart = startTime ? moment(startTime) : moment();
    const timeEnd = endTime ? moment(endTime) : moment();
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
      const timeStart = startTime ? moment(startTime) : moment();
      const timeEnd = endTime ? moment(endTime) : moment();
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
      case '近90天':
      case 90:
        interval = 90;
        break;
      default:
        interval = 0;
        break;
    }
    const timeStart = moment().subtract(interval, 'days');
    return [timeStart.valueOf(), timeEnd.valueOf(), timeSelect];
  };

  filterOnChange = async (type, value) => {
    const { filterOnChange, isShowSearchBtn = true, submitFilter } = this.props;
    if (type === 'timeRange') {
      if (value === '自定义') {
        this.setState({ timePickerShow: true });
      } else {
        this.setState({ timeSelect: value });
        filterOnChange(type, this.onSearchTimeRefresh(value));
      }
    } else {
      filterOnChange(type, value, () => {
        if (!isShowSearchBtn) {
          submitFilter()
        }
      });
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
    const { query, filterList, submitFilter, filterOnChange, labelWidth = 40, totalWidth = 250, selectStyle = {}, isShowSearchBtn = true } = this.props;
    // const { endTime, startTime } = query;
    // const chunkList = array.chunk(filterList, colNum); // 分割后的数组
    // console.log('filterList', this.props);
    return (
      <div className={styles.filterBlock}>
        <div className={styles.leftContent}>
          {filterList.map((item, index) => (
            <div key={`${item.key}${item.name}`} className={styles.col}>
              <div style={{ minWidth: labelWidth }}>
                <span style={{ lineHeight: '26px', color: '#7D7D7D ' }}>{item.name}：</span>
              </div>
              <div>
                {item.type === 'select' && (
                  <Select
                    mode={item.mode || ''}
                    placeholder={item.placeholder || ''}
                    style={{ width: totalWidth - labelWidth, ...selectStyle }}
                    showSearch={item.showSearch}
                    filterOption={
                      item.showSearch ? (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : null
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
                    maxLength={40}
                    style={{ width: totalWidth - labelWidth }}
                    onChange={e => {
                      let inputChangeVal = e.target.value;
                      // if (item.key === 'search') {
                      inputChangeVal = inputChangeVal.replace(/(^\s*)|(\s*$)/g, '');
                      // }
                      filterOnChange(item.key, inputChangeVal);
                    }}
                    value={query[item.key]}
                    placeholder={item.placeholder}
                    onPressEnter={() => {
                      if (item.pressEnter) {
                        submitFilter();
                      }
                      // console.log(158, 'onPressEnter', e);
                    }}
                  />
                )}
                {timePickerShow && item.key === 'timeRange' && (
                  <div>
                    <RangePicker
                      disabledDate={current => current > moment().endOf('day')}
                      style={{ height: 26 }}
                      allowClear={false}
                      defaultValue={[timeStart, timeEnd]}
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
            </div>
          ))}
        </div>

        {isShowSearchBtn && (
          <Button type="primary" onClick={submitFilter} className="smallBlueBtn">
            搜索
          </Button>
        )}

      </div>
    );
  }
}

export default FiltBlock;
