import React, { Component } from 'react';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
// import numberFormat from '../../../utils/numberFormat';
import moment from 'moment';
import autoHeight from '../autoHeight';

/* eslint react/no-danger:0 */

@autoHeight()
class CommonIntervalChart extends Component {
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.resize.cancel();
  }

  getG2Instance = chart => {
    this.chart = chart;
  };

  handleRoot = n => {
    this.root = n;
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
      title,
      titleOffset = 45,
      hasXtitle = true,
      xAxisName = 'key',
      yAxisName = 'doc_count',
      data,
      scale = {},
      padding,
      format,
    } = this.props;
    const titleDefault = {
      autoRotate: true, // 是否需要自动旋转，默认为 true
      offset: titleOffset,
      textStyle: {
        fontSize: '13',
        textAlign: 'center',
        fill: '#666',
      }, // 坐标轴文本属性配置
      position: 'center', // 标题的位置，**新增**
    };
    const cols = {
      [xAxisName]: Object.assign(
        {
          type: 'timeCat',
          tickCount: 3,
          formatter: value => moment(value).format(format || 'YYYY/MM/DD'),
        },
        scale[xAxisName]
      ),
      [yAxisName]: Object.assign(
        {
          min: 0,
          formatter: value => {
            if (value > 10000) {
              return `${(value / 10000).toFixed(1)}w`;
            }
            return value;
          },
        },
        scale[yAxisName]
      ),
    };
    const defaultPadding = [10, 'auto', 52, 'auto'];
    return (
      <div ref={this.handleRoot}>
        <div style={style}>
          <Chart height={height} width={width} data={data} scale={cols} padding={padding || defaultPadding} forceFit>
            {hasXtitle ? <Axis name={xAxisName} title={title || titleDefault} /> : <Axis name={xAxisName} />}
            <Axis name={yAxisName} />
            <Tooltip crosshairs={{ type: 'line' }} />
            <Geom type="interval" position={`${xAxisName}*${yAxisName}`} size={10} color={color} />
          </Chart>
        </div>
      </div>
    );
  }
}

export default CommonIntervalChart;
