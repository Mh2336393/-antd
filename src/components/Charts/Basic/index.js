import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Legend, Coord } from 'bizcharts';

class Basic extends Component {
  render() {
    const { data } = this.props;
    return (
      <div>
        <Chart data={data}>
          <Axis name="time" />
          <Axis name="value" />
          <Tooltip crosshairs={{ type: 'line' }} />
          <Geom type="area" />
          <Geom type="line" />
        </Chart>
      </div>
    );
  }
}

export default Basic;
