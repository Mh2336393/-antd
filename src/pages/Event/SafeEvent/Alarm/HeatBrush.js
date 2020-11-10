import React, { PureComponent } from 'react';
import { LeftOutlined, UndoOutlined } from '@ant-design/icons';
import { Divider, Spin } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { EventHeat } from '@/components/Charts';
import esAdaptiveSearch from '../../../../tools/esAdaptiveSearch';
import formatNumber from '../../../../tools/formatNumber';
import styles from './HeatBrush.less';

/* eslint-disable camelcase */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */

/* eslint no-underscore-dangle: ["error", { "allow": ["_origin"] }] */
const format = 'YYYY-MM-DD HH:mm:ss';
class HeatBrush extends PureComponent {
  // 存放最近框选的时间戳范围（默认存放50个操作记录）
  preTimeRange = [];

  activeKey = 0;

  ontimePiker = (startTime, endTime) => {
    const { query, ontimePiker } = this.props;
    const newQuery = Object.assign({}, query, {
      startTime,
      endTime,
      page: 1,
    });
    ontimePiker(newQuery);
  };

  // 返回上一次框选时间范围
  backToBefore = () => {
    const preTimeRange = _.cloneDeep(this.preTimeRange);
    const { length } = preTimeRange;
    if (length > 0) {
      const { startTime, endTime } = preTimeRange[length - 1];
      this.ontimePiker(startTime, endTime);
      this.preTimeRange.splice(length - 1, 1);
    }
  };

  // 直方图中框选时间范围的下钻
  timeDrill = (start, end) => {
    const {
      query: { startTime, endTime },
    } = this.props;
    // 每次框选时间范围改变，就将上一个框选的时间范围值存入数组，用于返回操作
    if (this.preTimeRange.length > 50) {
      this.preTimeRange.splice(0, 1);
    }
    this.preTimeRange.push({ startTime, endTime });
    this.ontimePiker(start, end);
  };

  onbrushend = (chart, ev) => {
    // console.log('ev', ev);
    const { data } = ev;
    if (data && data.length > 0) {
      const { type } = data[0];
      const timeArr = [];
      data.forEach(item => {
        if (item.type === type) {
          timeArr.push(item.time);
        }
      });
      timeArr.sort();
      const {
        chartData: { interval },
      } = this.props;
      const timeRange = esAdaptiveSearch.intervalFormatMapping[interval].timestampRange;
      this.timeDrill(timeArr[0], timeArr[timeArr.length - 1] + timeRange);
    }
  };

  plotclick = () => {
    const {
      chartData: { interval },
    } = this.props;
    const key = this.activeKey;
    // console.log('interval', interval);
    const timeRange = esAdaptiveSearch.intervalFormatMapping[interval].timestampRange;
    this.timeDrill(key, key + timeRange);
  };

  newSearch = () => {
    const { onNewSearch } = this.props;
    if (this.preTimeRange.length > 0) {
      onNewSearch();
      this.preTimeRange = [];
    }
  };

  render() {
    const { chartLoading, chartData, recordsTotal, query,height=202, padding=[10, 60, 30, 160] } = this.props; // , intentType
    const { typeList, list } = chartData;
    const { startTime, endTime } = query;
    return (
      <div className={styles.chart} style={{ marginTop: 12 }}>
        {chartLoading ? (
          <Spin />
        ) : (
          <div>
            <div style={{ overflow: 'hidden' }}>
              <div className={styles.totalCount}>
                共 <span>{formatNumber(recordsTotal)}</span> 条结果
              </div>
              <div className={styles.timeRange}>
                <a onClick={this.backToBefore} className={this.preTimeRange.length === 0 ? styles.disableClick : ''}>
                  <LeftOutlined />
                  返回
                </a>
                <Divider type="vertical" />
                <a onClick={this.newSearch} className={this.preTimeRange.length === 0 ? styles.disableClick : ''}>
                  <UndoOutlined />
                  还原
                </a>
                {moment(startTime).format(format)}
                &nbsp;至&nbsp;
                {moment(endTime).format(format)}
              </div>
            </div>
            <EventHeat
              data={list}
              typeList={typeList}
              height={height}
              brushend={this.onbrushend}
              // typeValueList={intentType}
              padding={padding}
              polygonMouseEnter={(chart, ev) => {
                if (ev.data) this.activeKey = ev.data._origin.time;
              }}
              plotclick={this.plotclick}
            />
          </div>
        )}
      </div>
    );
  }
}

export default HeatBrush;
