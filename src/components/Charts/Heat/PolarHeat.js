import React, { Component } from 'react';
import { Chart, Axis, Geom, Coord, Tooltip } from 'bizcharts';

class PolarHeat extends Component {
  componentWillUnmount() {
    // window.removeEventListener('resize', this.resize);
  }

  handleRoot = n => {
    this.root = n;
  };

  handleRef = n => {
    this.node = n;
  };

  // @Bind()
  // @Debounce(400)
  // resize() {
  //   if (!this.node) {
  //     return;
  //   }
  //   const canvasWidth = this.node.parentNode.clientWidth;
  //   const { data = [], autoLabel = true } = this.props;
  //   if (!autoLabel) {
  //     return;
  //   }
  //   const minWidth = data.length * 30;
  //   const { autoHideXLabels } = this.state;

  //   if (canvasWidth <= minWidth) {
  //     if (!autoHideXLabels) {
  //       this.setState({
  //         autoHideXLabels: true,
  //       });
  //     }
  //   } else if (autoHideXLabels) {
  //     this.setState({
  //       autoHideXLabels: false,
  //     });
  //   }
  // }

  render() {
    const {
      height = 380,
      width,
      forceFit = true,
      data,
      padding = [70, 0],
      geomColor = ['count', '#BAE7FF-#1890FF-#0050B3'],
      geomStyle,
      timeLabel,
      // typeList,
    } = this.props;
    const scale = {
      count: { alias: '事件数', type: 'log', base: 10 },
      attack: { alias: '攻击意图' },
      time: { alias: '时间' },
      category_2: { alias: '分类' },
    };
    // const gridStyle = { lineStyle: { lineWidth: 1, lineDash: null, stroke: '#f0f0f0' }, align: 'center', showFirstLine: true };
    return (
      <div ref={this.handleRoot}>
        <div ref={this.handleRef}>
          <Chart height={height} width={width} data={data} scale={scale} padding={padding} forceFit={forceFit}>
            <Coord type="polar" innerRadius={0.2} />
            <Tooltip showTitle={false} />
            <Axis name="attack" grid={null} line={null} label={null} />
            <Axis name="time" label={timeLabel || {}} grid={null} line={null} tickLine={null} />
            <Geom
              type="polygon"
              position="time*attack"
              color={geomColor}
              tooltip="attack*time*count"
              style={geomStyle || { stroke: '#f1f1f1', lineWidth: 1 }}
            />
          </Chart>
        </div>
      </div>
    );
  }
}

export default PolarHeat;
