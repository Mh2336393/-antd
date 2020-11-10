import React, { Component, Fragment } from 'react';
import { Chart, Axis, Geom, Tooltip, Legend } from 'bizcharts';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { DataSet } from '@antv/data-set';
import autoHeight from '../autoHeight';

/* eslint react/no-danger:0 */
/* eslint-disable no-underscore-dangle */

let chart;
@autoHeight()
class IntervalStackBarchart extends Component {
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
    //  点击柱子添加事件响应
    chart.on('plotclick', e => {
      const { data } = e;
      const { toLink, linkType } = this.props;
      // console.log('linkType', linkType);
      console.log('link', data);
      if (toLink && data && data._origin) {
        if (linkType) {
          toLink(linkType, data._origin);
        } else {
          toLink(data._origin);
        }
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.resize.cancel();
  }

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
      legend,
      height,
      color,
      xAxisName = '时间',
      yAxisName = '次数',
      data,
      scale = {},
      padding = [42, 120, 42, 50],
    } = this.props;
    const cols = {
      [xAxisName]: {
        type: 'cat',
        range: [0.1, 0.9],
        tickCount: 3,
      },
      [yAxisName]: Object.assign(
        {
          min: 0,
          formatter: value => {
            if (value > 1000) {
              return `${(value / 1000).toFixed(1)}k`;
            }
            return value;
          },
        },
        scale[yAxisName]
      ),
    };
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    const fields = data[0] ? Object.keys(data[0]).slice(1) : [];
    dv.transform({
      type: 'fold',
      fields,
      key: '时间',
      value: '次数',
    });
    return (
      <div ref={this.handleRoot}>
        <div style={style}>
          <Chart
            height={height}
            scale={cols}
            data={dv}
            forceFit
            padding={padding}
            onGetG2Instance={g2Chart => {
              chart = g2Chart;
            }}
          >
            {legend ? <Fragment>{legend}</Fragment> : <Legend position="right-center" />}
            <Axis name="时间" />
            <Axis name="次数" />
            <Tooltip />
            <Geom
              type="intervalStack"
              position="时间*次数"
              color={color}
              style={{
                stroke: '#fff',
                lineWidth: 1,
              }}
            />
          </Chart>
        </div>
      </div>
    );
  }
}

export default IntervalStackBarchart;
