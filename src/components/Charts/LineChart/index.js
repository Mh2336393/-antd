import React, { Component } from 'react';
import { Chart, Axis, Geom, Tooltip, Legend } from 'bizcharts';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
// import numberFormat from '../../../utils/numberFormat';
import autoHeight from '../autoHeight';

/* eslint react/no-danger:0 */
/* eslint-disable no-undef */

@autoHeight()
class LineChart extends Component {
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.resize.cancel();
  }

  handleRoot = n => {
    this.root = n;
  };

  dataToSize = (value, seconds = 1) => {
    const bytes = ((value - 0) * 8) / parseInt(seconds, 10);
    if (bytes === 0 || bytes === '0') {
      return 0;
    }
    const k = 1000;
    const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'];
    // const sizes = ['', 'k', 'm', 'g', 't', 'p', 'e', 'z', 'y'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const result = `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
    // console.log('value==', value, 'bytes==', bytes, 'result==', result);
    return result;
  };

  dataTransform = value => {
    if (value > 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  // for window resize auto responsive legend
  @Bind()
  @Debounce(300)
  resize() {
    const { hasLegend } = this.props;
    if (!hasLegend || !this.root) {
      window.removeEventListener('resize', this.resize);
    }
  }

  render() {
    const {
      style,
      height,
      width,
      color,
      transform,
      xAxisName = 'time',
      yAxisName = 'value',
      title = null,
      data,
      scale = {},
      padding,
      hasArea = true,
      hasLegend = false,
      hasPoint = false,
      legendPosition = 'bottom-center',
      legendOffsetY = 0,
      grid = null,
      type,
      forceFit = true,
    } = this.props;
    let dv;
    const cols = {
      [xAxisName]: Object.assign({ type: 'cat', range: [0, 1], tickCount: 5 }, scale[xAxisName]),
      [yAxisName]: Object.assign(
        {
          min: 0,
          formatter: value => (type === 'flow' ? this.dataToSize(value) : this.dataTransform(value)),
        },
        scale[yAxisName]
      ),
    };

    if (transform) {
      const ds = new DataSet();
      dv = ds.createView().source(data);
      transform(dv);
    }

    if (this.chart && forceFit) {
      this.chart.forceFit();
    }
    const defaultPadding = [42, 'auto'];
    return (
      <div ref={this.handleRoot}>
        <div style={style}>
          <Chart
            height={height}
            width={width}
            data={dv || data}
            scale={cols}
            padding={padding || defaultPadding}
            onGetG2Instance={chart => {
              this.chart = chart;
            }}
            forceFit
          >
            <Axis name={xAxisName} title={title} />
            {grid ? <Axis name={yAxisName} grid={grid} /> : <Axis name={yAxisName} />}
            {hasLegend ? <Legend position={legendPosition} offsetY={legendOffsetY} /> : <span />}
            <Tooltip crosshairs={{ type: 'line' }} />
            {hasArea && <Geom type="area" position={`${xAxisName}*${yAxisName}`} color={color} />}
            <Geom type="line" position={`${xAxisName}*${yAxisName}`} size={2} color={color} />
            {hasPoint ? (
              <Geom
                type="point"
                position={`${xAxisName}*${yAxisName}`}
                size={4}
                shape="circle"
                color={color}
                style={{ stroke: '#fff', lineWidth: 1 }}
              />
            ) : (
              <span />
            )}
          </Chart>
        </div>
      </div>
    );
  }
}

export default LineChart;
