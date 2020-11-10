import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Shape, Util } from 'bizcharts';
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return  */

class CalendarHeatChart extends Component {
  render() {
    Shape.registerShape('polygon', 'boundary-polygon', {
      draw(cfg, container) {
        if (!Util.isEmpty(cfg.points)) {
          const attrs = {
            stroke: '#fff',
            lineWidth: 1,
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

          if (cfg.origin._origin.lastWeek) {
            const linePath = [['M', points[2].x, points[2].y], ['L', points[3].x, points[3].y]];
            // 最后一周的多边形添加右侧边框
            container.addShape('path', {
              zIndex: 1,
              attrs: {
                path: this.parsePath(linePath),
                lineWidth: 1,
                // stroke: '#333',
                stroke: '#505050',
              },
            });
            // 某月的最后一天 添加底部边框线
            if (cfg.origin._origin.lastDay) {
              container.addShape('path', {
                zIndex: 1,
                attrs: {
                  path: this.parsePath([['M', points[1].x, points[1].y], ['L', points[2].x, points[2].y]]),
                  lineWidth: 1,
                  // stroke: '#404040',
                  stroke: '#505050',
                },
              });
            }
          }
          container.sort();
          return polygon;
        }
      },
    });
    const cols = {
      day: {
        type: 'cat',
        values: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      },
      week: {
        type: 'cat',
      },
      count: {
        sync: true,
        alais: '事件数',
        type: 'log',
        base: 10,
      },
    };

    const { height = 400, forceFit = true, data } = this.props;
    return (
      <div>
        <Chart height={height} data={data} scale={cols} forceFit={forceFit}>
          <Tooltip title="date" />
          <Axis
            name="week"
            position="top"
            tickLine={null}
            line={null}
            label={{
              autoRotate: false,
              offset: 12,
              textStyle: {
                fontSize: 12,
                fill: '#666',
                textBaseline: 'top',
              },
              formatter: val => {
                let str = '';
                if (val === '2') {
                  data.forEach(item => {
                    if (`${item.week}` === val) {
                      str = `${new Date(item.date).getFullYear()}年${item.month + 1}月`;
                    }
                  });
                  return str;
                } else if (val === '6') {
                  data.forEach(item => {
                    if (`${item.week}` === val) {
                      str = `${new Date(item.date).getFullYear()}年${item.month + 1}月`;
                    }
                  });
                  return str;
                } else if (val === '10') {
                  data.forEach(item => {
                    if (`${item.week}` === val) {
                      str = `${new Date(item.date).getFullYear()}年${item.month + 1}月`;
                    }
                  });
                  return str;
                } else if (val === '15') {
                  data.forEach(item => {
                    if (`${item.week}` === val) {
                      str = `${new Date(item.date).getFullYear()}年${item.month + 1}月`;
                    }
                  });
                  return str;
                } else if (val === '19') {
                  data.forEach(item => {
                    if (`${item.week}` === val) {
                      str = `${new Date(item.date).getFullYear()}年${item.month + 1}月`;
                    }
                  });
                  return str;
                } else if (val === '24') {
                  data.forEach(item => {
                    if (`${item.week}` === val) {
                      str = `${new Date(item.date).getFullYear()}年${item.month + 1}月`;
                    }
                  });
                  return str;
                }
                return '';
              },
            }}
          />
          <Axis name="day" grid={null} />
          <Geom type="polygon" position="week*day*date" shape="boundary-polygon" color={['count', '#EAF0FD-#5481DC-#0A4BCC']} />
          <Coord reflect="y" />
        </Chart>
      </div>
    );
  }
}

export default CalendarHeatChart;
