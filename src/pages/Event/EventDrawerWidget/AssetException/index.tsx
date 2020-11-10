/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import styles from './index.less';
import LineChart, { IDataSource as ChartDataSource } from '../LineChart';

const moment = require('moment');

export type IEventByte = {
  max: number;
  time: string;
};
export interface IDataSource {
  [key: string]: IEventByte[]
}

export interface IAssetExceptionProp {
  wrapperStyle?: React.CSSProperties;
  dataSource?: IDataSource;
  timestamp?: string;
}

const AssetException: React.FC<IAssetExceptionProp> = ({
  wrapperStyle,
  dataSource,
  timestamp
}) => {
  const [data, setChartData] = useState<ChartDataSource[]>([]);
  function renderChart() {
    return (
      <LineChart
        height={330}
        tickCount={8}
        format="MM/DD HH:mm"
        dataSource={data}
      />
    );
  }

  useEffect(() => {
    if (dataSource) {
      const array = []
      const startTime = moment(timestamp).subtract(1, 'hours')
      const endTime = moment(timestamp)
      Object.keys(dataSource).forEach(key => {
        dataSource[key].forEach(item => {
          if (moment(item.time).isAfter(startTime) && moment(item.time).isBefore(endTime)) {
            array.push({
              time: item.time,
              count: item.max / 300, // 转换为bps
              type: key === 'actual_curve' ? '实际流量' : key === 'baseline_curve' ? '基线流量' : '阈值'
            })
          }
        })
      })
      setChartData(array)
    }
  }, [dataSource]);

  return (
    <div className={styles.wrapper} style={{ ...wrapperStyle }}>
      <header className={styles.header}>资产告警时刻流量趋势情况</header>
      <div className={styles.content}>
        <div className={styles.content_header}>
          <p className={styles.title}>
            告警前 <b style={{ color: "#000" }}>1小时</b> 流量曲线
          </p>
        </div>
        <div className={styles.chart_content}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default AssetException
