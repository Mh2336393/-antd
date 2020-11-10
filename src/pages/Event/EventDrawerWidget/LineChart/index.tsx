/* eslint-disable radix */
/* eslint-disable no-lonely-if */
import React, { useState, useEffect, Fragment } from 'react';
import { Chart, Axis, Legend, Geom, Tooltip } from 'bizcharts';
import moment from 'moment';

export interface IDataSource {
  time: string;
  count: number;
  type?: string;
}

export interface ILineChartProp {
  dataSource: IDataSource[];
  width?: number;
  height?: number;
  tickCount?: number;
  format?: string;
}


const COLORS = {
  "实际流量": '#78CCF0',
  "基线流量": '#219C77',
  "阈值": "#C93439"
};

const LineChart: React.FC<ILineChartProp> = ({
  dataSource,
  width = 898,
  height = 240,
  tickCount = 5,
  format = "MM/DD HH:mm"
}) => {
  const [unit, setUnit] = useState<string>('bps'); // Y轴的单位
  const [symbols] = useState<string[]>(['bps', 'Kbps', 'Mbps']); // Y轴的单位范围
  const [maxCountit, setMaxCount] = useState<number>(1); // Y轴的最大值

  useEffect(() => {
    // setData([...dataSource]);

    // 计算count的峰值
    let maxCount = 0
    for (let i = 0; i < dataSource.length; i++) {
      const element = dataSource[i];
      if (element.count > maxCount) maxCount = element.count
    }
    setMaxCount(maxCount)
    const curUnit = calculatingUnit(maxCount)
    setUnit(curUnit)
  }, [JSON.stringify(dataSource)]);

  const cols = {
    count: {
      formatter: val => {
        return byteConvert(val)
      },
      alias: `流量单位: ${unit}`,
    },
    time: {
      type: 'cat',
      tickCount,
      formatter: (val) => {
        return moment(val).format(format);
      },
    }
  };

  const colorSeting: [string, string] | [string, string[]] | [string, (d?: any) => string] = [
    'type',
    (type) => {
      return COLORS?.[type] || '#85878A';
    },
  ]

  /** 根据峰值计算单位 */
  function calculatingUnit(bps) {
    if (!bps) {
      return symbols[0];
    }
    let exp = Math.floor(Math.log(bps) / Math.log(2));
    if (exp < 1) {
      exp = 0;
    }
    const i = Math.floor(exp / 10);
    return symbols[i]
  };



  /** Y轴数据的换算 */
  function byteConvert(bps, decimalReservation = 0) {
    if (!bps) return `${0}`;
    function conversionFormula(value) {
      const index = symbols.findIndex((item) => { return item === unit; });
      if (symbols[index] === 'Kbps') {
        value /= 1024;
      }
      else if (symbols[index] === 'Mbps') {
        value = value / 1024 / 1024;
      }
      return value
    }
    bps = conversionFormula(bps);
    // 代表想保留指定位的小数
    if (decimalReservation) {
      bps = bps.toFixed(decimalReservation);
    } else {
      // 代表想上取整,但是得判断一下 maxCountit
      const newMaxCountit = conversionFormula(maxCountit)
      if (newMaxCountit > 5) {
        bps = Math.ceil(bps)
      } else {
        // 判断是整数还是小数
        if (parseInt(bps) !== parseFloat(bps)) {
          // 找出小数点后不为0的位置
          const index = bps.toString().split('.')[1].search(/[1-9]/)
          if (index !== -1) {
            bps = bps.toFixed(index + 1);
          }
        }
      }

    }
    return `${bps}`;
  };


  function nameformatter(params: String) {
    if (!params) return '流量'
    if (params && params.includes("基线")) {
      return '基线流量'
    }
    if (params && params.includes("实际")) {
      return "实际流量"
    }
    if (params && params.includes("阈值")) {
      return "阈值"
    }
    return `${params}流量`
  }



  return (
    <Chart
      width={width}
      height={height}
      data={dataSource}
      scale={cols}
      forceFit
      padding={[25, 40, 60, 60]}
    >
      <Legend marker="diamond" position="top" />
      <Axis name="time" />
      <Axis name="count" title />
      <Tooltip crosshairs={{ type: 'y' }} />
      <Geom
        type="line"
        position="time*count"
        size={2}
        shape="smooth"
        color={colorSeting}
        tooltip={[
          'count*type',
          (count: number, type) => {
            return {
              name: nameformatter(type),
              value: `${byteConvert(count, 3)}${unit}`,
            };
          },
        ]}
      />
    </Chart>
  );
};

export default LineChart;
