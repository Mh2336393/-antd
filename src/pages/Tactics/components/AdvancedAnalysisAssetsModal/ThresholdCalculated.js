/* eslint-disable default-case */
import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { DatePicker, Spin, Button, Select } from 'antd';
import { ThresholdCurve } from '@/components/Charts';
import moment from 'moment';
import styles from './ThresholdCalculated.less';

const { RangePicker } = DatePicker;
const { Option } = Select;
const format = 'YYYY-MM-DD HH:mm:ss';
const options = ['近24小时', '近3天', '近7天', '自定义'];
@connect(({ loading }) => ({
  loading: loading.effects['advancedAnalysis/fetchThresholdValueAggs'],
  thresholdLoading: loading.effects['advancedAnalysis/fetchThresholdValue'],
}))
/**
 * 阈值计算组件
 */
class ThresholdCalculated extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /** 单个资产的阈值聚合数据 */
      thresholdValueAggs: [],
      /** 阈值峰值 */
      maxThresholdValue: 0,
      /** 阈值均值 */
      meanThresholdValue: 0,

      timePickerShow: false,
      timeSelect: '24小时',
      timeStart: moment().subtract(1, 'days'), // 时间选择器的起始时间戳(ms)
      timeEnd: moment(), // 时间选择器的结束时间戳(ms)
    };
    this.handleThresholdSelection = this.handleThresholdSelection.bind(this);
  }

  async componentDidMount() {
    // 把实例给到父组件
    this.props.onRef(this);
    await this.dataInitialization();
  }

  onSelectTimeChange = (value) => {
    if (value === '自定义') {
      this.setState({ timePickerShow: true });
    } else {
      const timeEnd = moment();
      let timeStart;
      switch (value) {
        case '近24小时':
          timeStart = moment().subtract(1, 'days');
          break;
        case '近3天':
          timeStart = moment().subtract(3, 'days');
          break;
        case '近7天':
          timeStart = moment().subtract(7, 'days');
          break;
      }
      this.setState(
        {
          timeStart,
          timeEnd,
          timeSelect: value,
        },
        () => {
          this.dataInitialization();
        }
      );
    }
  };

  ontimePiker = () => {
    const { timeStart, timeEnd } = this.state;
    this.setState(
      {
        timeSelect: `${timeStart.format(format)} 至 ${timeEnd.format(format)}`,
        timePickerShow: false,
      },
      () => {
        this.dataInitialization();
      }
    );
  };

  timePickerChange = (moments) => {
    this.setState({ timeStart: moments[0], timeEnd: moments[1] });
  };

  /** 阈值选择 */
  handleThresholdSelection = (mode, unit) => {
    const { onThresholdSelection, sceneName } = this.props;
    onThresholdSelection(sceneName, mode, unit);
  };

  dataInitialization = async () => {
    const { dispatch, sceneName, assetsSelected } = this.props;
    const { timeStart, timeEnd } = this.state;
    // 计算阈值
    const promiseArray = [];
    promiseArray.push(
      dispatch({
        type: 'advancedAnalysis/fetchThresholdValue',
        payload: {
          thresholded: '峰值',
          sceneKey: sceneName,
          assetIPs: assetsSelected.map((item) => {
            return item.Fip;
          }),
          startTime: timeStart.valueOf(),
          endTime: timeEnd.valueOf(),
        },
      })
    );
    promiseArray.push(
      dispatch({
        type: 'advancedAnalysis/fetchThresholdValue',
        payload: {
          thresholded: '均值',
          sceneKey: sceneName,
          assetIPs: assetsSelected.map((item) => {
            return item.Fip;
          }),
          startTime: timeStart.valueOf(),
          endTime: timeEnd.valueOf(),
        },
      })
    );
    const promiseArrRes = await Promise.all(promiseArray);
    let thresholdValueAggs = [];
    if (assetsSelected.length === 1) {
      // 计算曲线图数据
      const { Fip } = assetsSelected[0];
      thresholdValueAggs = await dispatch({
        type: 'advancedAnalysis/fetchThresholdValueAggs',
        payload: {
          sceneName,
          Fip,
          startTime: timeStart.valueOf(),
          endTime: timeEnd.valueOf(),
        },
      });
    }
    this.setState({
      maxThresholdValue: Number(parseFloat(promiseArrRes[0]).toFixed(2)),
      meanThresholdValue: Number(parseFloat(promiseArrRes[1]).toFixed(2)),
      thresholdValueAggs,
      timePickerShow: false,
    });
  };

  render() {
    const { assetsSelected, loading, thresholdLoading } = this.props;
    const {
      maxThresholdValue,
      meanThresholdValue,
      thresholdValueAggs,
      timePickerShow,
      timeStart,
      timeEnd,
      timeSelect,
    } = this.state;
    const thresholdValueArr = [
      {
        text: '峰值',
        thresholdValue: maxThresholdValue,
      },
      {
        text: '均值',
        thresholdValue: meanThresholdValue,
      },
    ];
    return (
      <div className={styles.ThresholdCalculated}>
        <div className={styles.timeBox}>
          <p className={styles.key}>阈值时间段：</p>
          <Select
            className={styles['search-time-select']}
            size="small"
            value={timeSelect}
            onChange={this.onSelectTimeChange}
          >
            {options.map((key) => (
              <Option key={key} value={key}>
                {key}
              </Option>
            ))}
          </Select>
          <span
            style={{ fontSize: '14px', display: 'inline-block', marginLeft: '44px' }}
          >{`从${timeStart.format(format)} 到 ${timeEnd.format(format)}`}</span>
        </div>

        {assetsSelected && assetsSelected.length > 1 && (
          <Fragment>
            <span style={{ fontSize: '16px' }}>
              资产流量峰值为:
              {thresholdLoading ? (
                <Spin />
              ) : (
                <Button
                  style={{ fontSize: '16px', marginLeft: '10px' }}
                  type="primary"
                  onClick={() => {
                    this.handleThresholdSelection('峰值');
                  }}
                >
                  {maxThresholdValue}(bps)
                </Button>
              )}
            </span>
            <span style={{ fontSize: '16px', marginLeft: '24px' }}>
              流量均值为:
              {thresholdLoading ? (
                <Spin />
              ) : (
                <Button
                  style={{ fontSize: '16px', marginLeft: '10px' }}
                  type="primary"
                  onClick={() => {
                    this.handleThresholdSelection('均值');
                  }}
                >
                  {meanThresholdValue}(bps)
                </Button>
              )}
            </span>
          </Fragment>
        )}

        {assetsSelected && assetsSelected.length === 1 && (
          <div>
            {loading ? (
              <Spin />
            ) : (
              <ThresholdCurve
                data={thresholdValueAggs}
                thresholdValueArr={thresholdValueArr}
                width={568}
                height={240}
                padding={[20, 40, 40, 80]}
                dateRange={[0, 0.95]}
                additionalContent="点选"
                offsetX={-100}
                handleThresholdSelection={this.handleThresholdSelection}
                dateTickCount={thresholdValueAggs.length > 3 ? 5 : 3}
              />
            )}
          </div>
        )}

        {timePickerShow && (
          <div className={styles.timeRangePicker}>
            <RangePicker
              disabledDate={(current) => current > moment().endOf('day')}
              popupClassName={styles['timeRange-picker']}
              allowClear={false}
              defaultValue={[timeStart, timeEnd]}
              value={[timeStart, timeEnd]}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss"
              open
              onChange={this.timePickerChange}
              onOk={() => {
                this.ontimePiker();
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
export default Form.create()(ThresholdCalculated);
