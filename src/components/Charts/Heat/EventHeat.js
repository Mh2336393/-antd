/* eslint-disable consistent-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */

import React, { Component } from 'react';
import { Chart, Axis, Tooltip, Geom, Shape, Util } from 'bizcharts';
import Brush from '@antv/g2-brush';
import { DataView } from '@antv/data-set';
import moment from 'moment';
import styles from '../index.less';
// 根据 Heat/index.js 改写 事件页热力图
let chart;
let move = false; // 框选一次会触发 start--move-end-click,用来标记是否是框选，若是框选，则不触发click事件
class EventHeat extends Component {
  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    if (nextProps.data === data) {
      return false;
    }
    return true;
  }

  handleRoot = n => {
    this.root = n;
  };

  handleRef = n => {
    this.node = n;
  };

  componentDidMount = () => {
    // window.dispatchEvent(new Event('resize'));
    const { brushstart, brushmove, brushend, polygonMouseEnter, plotclick } = this.props;
    /* eslint-disable no-new */
    /* eslint-disable no-unused-expressions */
    new Brush({
      canvas: chart.get('canvas'),
      chart,
      type: 'X',
      onBrushstart(startPoint) {
        brushstart && brushstart(startPoint);
      },
      onBrushmove(ev) {
        move = true;
        brushmove && brushmove(ev);
      },
      onBrushend(ev) {
        brushend && brushend(chart, ev);
      },
    });
    // 框选一次会触发 start--move-end-click
    // 点击触发：start-click
    plotclick &&
      chart.on('plotclick', () => {
        if (!move) {
          plotclick();
        }
        move = false;
      });
    polygonMouseEnter &&
      chart.on('polygon:mouseenter', ev => {
        polygonMouseEnter(chart, ev);
      });
  };

  render() {
    Shape.registerShape('polygon', 'boundary-polygon', {
      draw(cfg, container) {
        if (!Util.isEmpty(cfg.points)) {
          const attrs = {
            stroke: '#fff',
            lineWidth: 0,
            fill: cfg.color,
            fillOpacity: cfg.opacity,
          };
          const points = cfg.points;
          const path = [
            ['M', points[0].x, points[0].y],
            ['L', points[1].x, points[1].y],
            ['L', points[2].x, points[2].y],
            ['L', points[3].x, points[3].y],
            ['Z'],
          ];
          attrs.path = this.parsePath(path);
          const polygon = container.addShape('path', {
            attrs,
          });

          if (cfg.origin._origin) {
            const linePath = [['M', points[2].x, points[2].y], ['L', points[3].x, points[3].y]]; // 最后一周的多边形添加右侧边框

            container.addShape('path', {
              zIndex: 1,
              attrs: {
                path: this.parsePath(linePath),
                lineWidth: 5,
                stroke: '#fff',
              },
            });
          }

          container.sort();
          return polygon;
        }
      },
    });

    const {
      height = 400,
      forceFit = true,
      data,
      geomColor,
      // geomStyle,
      xAxisGridStyle,
      yAxisGridStyle,
      xAxisLabel,
      yAxisLabel = {},
      // color = [
      // '#e6f7ff-#1890FF-#0050B3',
      // '#e6f7ff-#1890FF-#0050B3',
      // '#e6f7ff-#1890FF-#0050B3',
      // '#e6f7ff-#1890FF-#0050B3',
      // '#e6f7ff-#1890FF-#0050B3',
      // '#e6f7ff-#1890FF-#0050B3',
      // '#fff0f6-#ff4d4f-#820014',
      // '#fcffe6-#a0d911-#254000',
      // '#f9f0ff-#d3adf7-#22075e',
      // '#feffe6-#ffec3d-#876800',
      // '#fafafa-#bfbfbf-#595959',
      // ],
      padding = [10, 60, 40, 140],
      typeList,
      typeValueList = ['攻陷系统', '恶意文件投递', '横向渗透', '内部侦查', '网络入侵', '外部侦查'],
    } = this.props;
    const scale = {
      time: { type: 'timeCat', tickCount: 5, formatter: key => moment(key).format('YYYY-MM-DD HH:mm:ss') },
      type: {
        type: 'cat',
        values: typeValueList, // ['攻陷系统', '恶意文件投递', '横向渗透', '内部侦查', '网络入侵', '外部侦查'],
      },
      eventNum: { alias: '事件数', type: 'log', base: 10 },
    };
    const gridStyle = { lineStyle: { lineWidth: 1, lineDash: null, stroke: '#f0f0f0' }, align: 'center', showFirstLine: true };
    // console.log('typeList', typeList);
    const yLabel =
      typeList.length > 0
        ? {
            formatter: text => {
              const obj = typeList.filter(item => item.title === text)[0];
              const { count } = obj;
              if (count > 1000) {
                return `${text}: ${(count / 1000).toFixed(1)}k`;
              }
              return `${text}: ${count}`;
            },
          }
        : {};
    const newYLabel = { ...yLabel, ...yAxisLabel };

    // 对数据进行排序
    const dv = new DataView();
    dv.source(data).transform({ type: 'sort-by', fields: ['time'], order: 'ASC' });
    // console.log('typeList', typeList);
    return (
      <div className={styles.chart} ref={this.handleRoot}>
        <div ref={this.handleRef}>
          <Chart
            scale={scale}
            height={height}
            forceFit={forceFit}
            padding={padding || 'auto'}
            onGetG2Instance={g2Chart => {
              chart = g2Chart;
            }}
            data={data}
          >
            <Axis name="time" grid={xAxisGridStyle || gridStyle} label={xAxisLabel !== undefined ? xAxisLabel : {}} />
            <Axis
              name="type"
              grid={yAxisGridStyle || gridStyle}
              label={newYLabel}
              // label={
              //   typeList.length > 0 && {
              //     formatter: text => {
              //       const obj = typeList.filter(item => item.title === text)[0];
              //       const { count } = obj;
              //       if (count > 1000) {
              //         return `${text}: ${(count / 1000).toFixed(1)}k`;
              //       }
              //       return `${text}: ${count}`;
              //     },
              //   }
              // }
            />
            <Tooltip />
            <Geom
              type="polygon"
              position="time*type"
              shape="boundary-polygon"
              color={geomColor || ['eventNum', '#EAF0FD-#5481DC-#0A4BCC']}
              // style={
              //   geomStyle || {
              //     stroke: '#fff',
              //     lineWidth: 5,
              //   }
              // }
            />
          </Chart>
        </div>
      </div>
    );
  }
}

export default EventHeat;
