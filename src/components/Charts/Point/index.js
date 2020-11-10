import React, { PureComponent, Component } from 'react';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
// import classNames from 'classnames';
import { DataSet } from '@antv/data-set';
// import Brush from '@antv/g2-brush';
// import lodash from 'lodash';
// import moment from 'moment';

import ReactFitText from 'react-fittext';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import autoHeight from '../autoHeight';

/* eslint-disable lines-between-class-members */
/* eslint-disable no-unreachable */
/* eslint-disable react/sort-comp */
/* eslint-disable prefer-const  */
/* eslint-disable no-underscore-dangle */

let chart;
// let move;
/* eslint react/no-danger:0 */
@autoHeight()
class PointChart extends PureComponent {
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
    chart.on('plotclick', e => {
      const { data } = e;
      const { toLink } = this.props;
      if (toLink && data) {
        toLink(data._origin);
      }
    });
   
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.resize.cancel();
  }

  @Bind()
  @Debounce(300)
  resize() {
    const { hasLegend } = this.props;
    if (!hasLegend || !this.root) {
      window.removeEventListener('resize', this.resize);
    }
  }
  getColor = score => {
    switch (true) {
      case score > 40 && score <= 60:
        return '#5075ff';
        break;
      case score > 61 && score <= 80:
        return '#f6a70a';
        break;
      case score > 81 && score <= 100:
        return '#ff4056';
        break;
      default:
        return '#52c41a';
        break;
    }
  };
  handleRoot = n => {
    this.root = n;
  };
  render() {
    const {
      style,
      height,
      xAxisName,
      xAxisVisible = true,
      xTitleShow,
      yTitleShow,
      xTitle,
      yTitle,
      yAxisName,
      yAxisVisible = true,
      data,
      padding = [42, 80, 60, 100],
      customScales = {},
      // size,
      itemTpl,
      tooltip,
      // xtitleOffset = 30,
      // ytitleOffset = 20,
      // TooltipTitle,
      showToolTips = true,
      xAxisLine,
      xAxisTickLine,
      xAxisLabel,
      yAxisLabel,
      yAxisGrid,
    } = this.props;
    const cols = {
      [xAxisName]: customScales[xAxisName],
      [yAxisName]: Object.assign(
        {},
        {
          min: 0,
          formatter: value => {
            if (value > 1000) {
              return `${(value / 1000).toFixed(1)}k`;
            }
            return value;
          },
        },
        customScales[yAxisName]
      ),
    };
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    return (
      <div ref={this.handleRoot}>
        <ReactFitText maxFontSize={25}>
          <div style={style}>
            <Chart
              height={height}
              data={dv}
              scale={cols}
              padding={padding}
              onGetG2Instance={g2Chart => {
                chart = g2Chart;
              }}
              forceFit
            >
              {showToolTips && <Tooltip itemTpl={itemTpl} />}
              <Axis
                title={xTitleShow ? xTitle : {}}
                // title={xTitle}
                line={xAxisLine !== undefined ? xAxisLine : {}}
                tickLine={xAxisTickLine !== undefined ? xAxisTickLine : {}}
                label={xAxisLabel !== undefined ? xAxisLabel : {}}
                name={xAxisName}
                visible={xAxisVisible}
              />
              <Axis
                title={yTitleShow ? yTitle : {}}
                // title={yTitle}
                label={yAxisLabel !== undefined ? yAxisLabel : {}}
                grid={yAxisGrid !== undefined ? yAxisGrid : {}}
                name={yAxisName}
                visible={yAxisVisible}
              />
              <Geom
                type="point"
                position={`${xAxisName}*${yAxisName}`}
                // size={size}
                shape="circle"
                opacity={0.65}
                // style={{
                //   lineWidth: 1,
                //   strokeOpacity: 1,
                //   fillOpacity: 0.3,
                //   opacity: 0.9,
                //   stroke: '#1890ff',
                // }}
                tooltip={tooltip}
              />
            </Chart>
          </div>
        </ReactFitText>
      </div>
    );
  }
}
export default PointChart;
