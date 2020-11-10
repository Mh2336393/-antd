/* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import { Chart, Axis, Geom, Legend, Tooltip } from 'bizcharts';
import DataSet from '@antv/data-set';
import ReactFitText from 'react-fittext';
import moment from 'moment';
// import Debounce from 'lodash-decorators/debounce';
// import Bind from 'lodash-decorators/bind';
import autoHeight from '../autoHeight';

/* eslint react/no-danger:0 */
@autoHeight()
class LineChartMul extends Component {
  render() {
    const {
      style,
      height,
      width,
      color,
      xAxisName = 'time',
      yAxisName = 'value',
      transform,
      offsetX,
      data,
      gridStyle = null,
      scale = {},
      hasLegend = false,
      hasArea = false,
      padding = [22, 20, 40, 50],
      showToolTip,
      legendPosition = 'bottom',
    } = this.props;

    const cols = {
      [xAxisName]: Object.assign(
        {
          type: 'time',
          tickCount: 8,
          formatter: key =>
            `\n${moment(key).format('YYYY-MM-DD')}\n${moment(key).format('HH:mm:ss')}`,
        },
        scale[xAxisName]
      ),
      [yAxisName]: Object.assign(
        {
          min: 0,
          formatter: value => {
            if (value > 1000 * 1000) {
              return `${(value / (1000 * 1000)).toFixed(1)}M`;
            }
            if (value > 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value ? `${value}` : 0;
          },
        },
        scale[yAxisName]
      ),
    };

    const labelStyle = {
      textStyle: {
        fill: '#6c6f85',
        fontSize: '12',
      },
    };
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    transform && transform(dv);
    if (this.chart) {
      this.chart.forceFit();
    }

    return (
      <div ref={this.handleRoot}>
        <ReactFitText maxFontSize={25}>
          <div style={style}>
            <Chart
              key={data.length}
              height={height}
              width={width}
              data={dv || data}
              scale={cols}
              padding={padding}
              onGetG2Instance={chart => {
                this.chart = chart;
              }}
              forceFit
            >
              {showToolTip && <Tooltip />}
              <Axis name={yAxisName} label={labelStyle} grid={gridStyle || null} />
              <Axis name={xAxisName} label={labelStyle} tickLine={null} grid={gridStyle} />
              {/* <Legend position="top-right" offsetX={offsetX} offsetY={offsetY} marker="circle" /> */}
              {hasLegend && <Legend position={legendPosition} offsetX={offsetX} marker="square" />}
              {hasArea && (
                <Geom type="area" position={`${xAxisName}*${yAxisName}`} size={2} color={color} />
              )}
              <Geom type="line" position={`${xAxisName}*${yAxisName}`} size={2} color={color} />
            </Chart>
          </div>
        </ReactFitText>
      </div>
    );
  }
}

export default LineChartMul;
