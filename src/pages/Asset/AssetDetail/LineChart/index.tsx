/* eslint-disable radix */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-lonely-if */
import React, { useState, useEffect, Fragment } from 'react';
import { Chart, Axis, Legend, Geom, Tooltip, Guide } from 'bizcharts';
import moment from 'moment';

const { Line } = Guide;

export interface IDataSource {
  time: string;
  count: number;
  type?: string;
  // formatTime?: string;
}

export interface ILineChartProp {
  moduleName?: String;
  color?: IColor;
  dataSource: IDataSource[];
  width?: number;
  height?: number;
  hasLegend?: boolean;
  tickCount?: number;
  format?: string;
  thresholdValue?: number;
  Falert_mode?: string;
}

export type IColor =
  | 'flow'
  | 'four'
  | 'seven'
  | 'message'
  | 'coversation'
  | 'http'
  | 'dns'
  | 'icmp'
  | 'ssh'
  | 'rdp';

const scopeOfTheUnit = {
  message: ['pkts/s'], // 报文单位范围
  conversation: ['tps'], // 会话频率单位范围
  other: ['bps', 'Kbps', 'Mbps'] // 其他流量的单位范围
}


const COLORS = {
  flow: '#2A62D1',
  four: {
    tcp: '#2A62D1',
    udp: '#E8944A',
    icmp: '#219C77',
  },
  seven: ['#2A62D1', '#E8944A', '#2B94C2', '#bda29a', '#EFE42A', '#64BD3D', '#EE9201', '#29AAE3', '#B74AE5', '#0AAF9F', '#E89589', '#16A085', '#4A235A', '#C39BD3 ', '#F9E79F', '#BA4A00', '#ECF0F1', '#616A6B', '#EAF2F8', '#4A235A', '#3498DB'],
  message: '#2B94C2',
  coversation: {
    tcp: '#2A62D1',
    udp: '#E8944A',
    icmp: '#219C77',
  },
  http: {
    "基线流量": '#2A62D1',
    "实际流量": '#219C77'
  },
  icmp: {
    "基线流量": '#2A62D1',
    "实际流量": '#219C77'
  },
  dns: {
    "基线流量": '#2A62D1',
    "实际流量": '#219C77'
  },
  ssh: {
    "基线流量": '#2A62D1',
    "实际流量": '#219C77'
  },
  rdp: {
    "基线流量": '#2A62D1',
    "实际流量": '#219C77'
  }
};

const LineChart: React.FC<ILineChartProp> = ({
  moduleName = '资产流量状态',
  color = 'flow',
  dataSource,
  width = 414,
  height = 250,
  tickCount = 5,
  format = "MM/DD HH:mm",
  thresholdValue = 0,
  Falert_mode = 'threshold'
}) => {
  const [unit, setUnit] = useState<string>('bps'); // Y轴的单位
  const [maxCountit, setMaxCount] = useState<number>(1); // Y轴的最大值
  const [symbols] = useState<string[]>(color === 'message' ? scopeOfTheUnit.message : color === 'coversation' ? scopeOfTheUnit.conversation : scopeOfTheUnit.other); // Y轴的单位范围

  useEffect(() => {
    // 计算count的峰值
    let maxCount = 0
    for (let i = 0; i < dataSource.length; i++) {
      const element = dataSource[i];
      if (element.count > maxCount) maxCount = element.count
    }
    // 确定y轴最大值
    setMaxCount(thresholdValue > maxCount ? thresholdValue : maxCount === 0 ? 1 : maxCount)


    // 如果是报文模式或者是会话频率 单位是固定的不会变化
    if (color === 'message' || color === 'coversation') {
      setUnit(symbols[0])
    } else {
      // 根据Y轴最大值，来计算单位
      const curUnit = calculatingUnit(maxCount)
      setUnit(curUnit)
    }
  }, [JSON.stringify(dataSource)]);

  const cols = {
    count: {
      min: 0,
      max: maxCountit,
      tickCount: 5,
      formatter: val => {
        return byteConvert(val)
      },
      alias: `流量单位: ${unit}`,
      range: [0, 0.95],
    },
    time: {
      type: 'cat',
      tickCount,
      formatter: (val) => {
        return moment(val).format(format);
      },
    }
  };
  // color?: string | [string, string] | [string, string[]] | [string, (d?: any) => string];
  function calculateColorSeting(): [string, string[]] | [string, (d?: any) => string] {
    if (color === 'flow' || color === 'message') {
      return [
        'type',
        () => {
          return COLORS[color]
        },
      ]
    }
    if (color === "seven") {
      return ['type', COLORS[color]]
    }

    return [
      'type',
      (type) => {
        return COLORS[color][type.toLowerCase()] || "#2A62D1"
      },
    ]

  }

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
    // 这俩种模式不需要单位转换
    if (color !== 'message' && color !== 'coversation') {
      bps = conversionFormula(bps);
    }
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
    } if (params && params.includes("实际")) {
      return "实际流量"
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
      padding={[50, 40, 30, 60]}
    >
      <Legend marker="diamond" position="top" />
      <Axis name="time" />
      <Axis name="count" title />
      <Tooltip crosshairs={{ type: 'y' }} />
      {moduleName === "资产流量状态" ? (
        <Fragment>
          <Geom
            type="line"
            position="time*count"
            shape="smooth"
            size={1}
            color={calculateColorSeting()}
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
          <Geom
            type="area"
            position="time*count"
            size={1}
            color={calculateColorSeting()}
            tooltip={false}
          />
        </Fragment>
      ) : (
          <div>
            <Geom
              type="line"
              position="time*count"
              shape="smooth"
              size={1}
              color={calculateColorSeting()}
              tooltip={[
                'count*type',
                (count: number, type) => {
                  return {
                    name: nameformatter(type),
                    value: `${byteConvert(count,3)}${unit}`,
                  };
                },
              ]}
            />
            {dataSource && dataSource.length > 0 && dataSource[0].time && dataSource[dataSource.length - 1].time && Falert_mode === 'threshold' ? (
              <Guide>
                <Line
                  top
                  start={{ time: dataSource[0].time, count: Number(thresholdValue) }}
                  end={{ time: dataSource[dataSource.length - 1].time, count: Number(thresholdValue) }}
                  lineStyle={{
                    lineWidth: 3,
                    // 线条颜色
                    stroke: "red",
                  }}
                  text={{
                    position: 'end',
                    style: {
                      fill: '#C93439',
                      fontSize: '14',
                      fontWeight: 'bold'
                    },
                    offsetX: -50,
                    content: `阈值：${byteConvert(thresholdValue, 2)}`
                  }}

                />
              </Guide>
            ) : null}
          </div>
        )}
    </Chart>
  );
};

export default LineChart;
