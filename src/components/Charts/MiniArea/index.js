import React from 'react';
import { Chart, Axis, Tooltip, Geom } from 'bizcharts';
import autoHeight from '../autoHeight';
import styles from '../index.less';

@autoHeight()
class MiniArea extends React.PureComponent {
  render() {
    const {
      height,
      data = [],
      forceFit = true,
      color = 'rgba(24, 144, 255, 0.2)',
      borderColor = '#1089ff',
      scale = {},
      borderWidth = 2,
      line,
      xAxis = {},
      yAxis = {},
      animate = true,
      // showTooltip = true,
    } = this.props;

    const padding = [36, 5, 30, 5];
    const scaleProps = { key_as_string: { type: 'cat', range: [0, 1], ...scale.x }, doc_count: { min: 0, ...scale.y } };
    const tooltip = [
      'key_as_string*doc_count',
      (x, y) => ({
        name: x,
        value: y,
      }),
    ];
    const chartHeight = height + 54;
    return (
      <div className={styles.miniChart} style={{ height }}>
        <div className={styles.chartContent}>
          {height > 0 && (
            <Chart animate={animate} scale={scaleProps} height={chartHeight} forceFit={forceFit} data={data} padding={padding}>
              <Axis key="axis-x" name="key_as_string" label={false} line={false} tickLine={false} grid={false} {...xAxis} />
              <Axis key="axis-y" name="doc_count" label={false} line={false} tickLine={false} grid={false} {...yAxis} />
              <Tooltip showTitle={false} crosshairs={false} />
              <Geom
                type="area"
                position="key_as_string*doc_count"
                color={color}
                tooltip={tooltip}
                shape="smooth"
                style={{ fillOpacity: 1 }}
              />
              {line ? (
                <Geom
                  type="line"
                  position="key_as_string*doc_count"
                  shape="smooth"
                  color={borderColor}
                  size={borderWidth}
                  tooltip={false}
                />
              ) : (
                <span style={{ display: 'none' }} />
              )}
            </Chart>
          )}
        </div>
      </div>
    );
  }
}

export default MiniArea;
