import React from 'react';
import { Chart, Geom, Tooltip, Coord, Shape } from 'bizcharts';
import DataSet from '@antv/data-set';

// import data from "./mock.json";

/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */

const imgUrl = '/image/mask.png';
class Wordcloud extends React.Component {
  state = {
    dv: null,
  };

  componentDidMount() {
    this.renderChart();
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    const { preData } = this.props;
    if (JSON.stringify(preData) !== JSON.stringify(data)) {
      this.renderChart(this.props);
    }
  }

  saveRootRef = node => {
    this.root = node;
  };

  renderChart = nextProps => {
    const rootDiv = this.root;
    const { data, height } = nextProps || this.props;
    if (data.length < 1 || !this.root) {
      return;
    }
    const onload = () => {
      const dv = new DataSet.View().source(data);
      const range = dv.range('value');
      const [min, max] = range;
      const h = height;
      const w = rootDiv.offsetWidth - 10;
      dv.transform({
        type: 'tag-cloud',
        fields: ['name', 'value'],
        imageMask: this.imageMask,
        size: [w, h],
        font: 'Verdana',
        padding: 0,
        timeInterval: 5000,
        // max execute time
        rotate() {
          return 0;
        },

        fontSize(d) {
          if (data.length === 1) {
            return 30;
          }
          return ((d.value - min) / (max - min) ** 2) * (70 - 40) + 20;
        },
      });
      this.setState({
        dv,
        h,
      });
    };
    if (!this.imageMask) {
      this.imageMask = new Image();
      this.imageMask.crossOrigin = '';
      this.imageMask.src = imgUrl;
      this.imageMask.onload = onload;
    } else {
      onload();
    }
  };

  render() {
    const { height, customScale, tooltip } = this.props;
    const { dv, h } = this.state;
    function getTextAttrs(cfg) {
      return Object.assign(
        {},
        {
          fillOpacity: cfg.opacity,
          fontSize: cfg.origin._origin.size,
          rotate: cfg.origin._origin.rotate,
          text: cfg.origin._origin.text,
          textAlign: 'center',
          fontFamily: cfg.origin._origin.font,
          fill: cfg.color,
          textBaseline: 'Alphabetic',
        },
        cfg.style
      );
    } // 给point注册一个词云的shape

    Shape.registerShape('point', 'cloud', {
      drawShape(cfg, container) {
        const attrs = getTextAttrs(cfg);
        return container.addShape('text', {
          attrs: Object.assign(attrs, {
            x: cfg.x,
            y: cfg.y,
          }),
        });
      },
    });
    const scale = Object.assign(
      {},
      {
        x: {
          nice: false,
        },
        y: {
          nice: false,
        },
      },
      customScale
    );
    return (
      <div style={{ width: '100%', height }} ref={this.saveRootRef}>
        {dv && (
          <Chart height={h} data={dv} scale={scale} padding={0} forceFit>
            <Tooltip showTitle={false} />
            <Coord reflect="y" />
            <Geom type="point" position="x*y" color="text" shape="cloud" tooltip={tooltip} />
          </Chart>
        )}
      </div>
    );
  }
}

export default Wordcloud;
