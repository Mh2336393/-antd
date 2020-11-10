/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */

import React, { memo } from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Legend, View } from 'bizcharts';
import DataSet from '@antv/data-set';

import mapData from './mapData.json';

// // let queryParameter = null  对比函数，加上就特别卡
// function areEqual(prevProps, nextProps) {
//   /*
//   如果把 nextProps 传入 render 方法的返回结果与
//   将 prevProps 传入 render 方法的返回结果一致则返回 true，
//   否则返回 false
//   */
//   // queryParameter = nextProps.queryParameter || null
// }

// draw the map
const Bubblemap = memo(props => {
  const { height, data, skipSearchPage } = props;
  // queryParameter = props.queryParameter || null
  const cols = {
    x: {
      sync: true,
      nice: false,
    },
    y: {
      sync: true,
      nice: false,
    },
    location: { alias: '地点' },
    _count: { alias: '登录次数' },
    percent: { alias: '成功率' },
  };
  const handledData = data.filter(item => item.lat && item.lng);
  // data set
  const ds = new DataSet();

  const dv = ds
    .createView('back')
    .source(mapData, {
      type: 'GeoJSON',
    })
    .transform({
      type: 'geo.projection',
      projection: 'geoMercator',
      as: ['x', 'y', 'centroidX', 'centroidY'],
    }); // draw the bubble plot

  const userData = ds.createView().source(handledData);
  userData.transform({
    type: 'map',
    callback: obj => {
      const projectedCoord = dv.geoProjectPosition([obj.lng * 1, obj.lat * 1], 'geoMercator');
      obj.x = projectedCoord[0];
      obj.y = projectedCoord[1];
      obj._count *= 1;
      obj._percent = obj.percent;
      obj.percent = `${obj.percent}%`;
      return obj;
    },
  });
  return (
    <div>
      <Chart
        height={height}
        data={dv}
        scale={cols}
        padding={[0, 20, 20]}
        forceFit
        onClick={(e) => {
          console.log("map====e", e)
          if (!e.target || !e.target.name || e.target.name !== 'point') return // 不是点击圆圈直接退
          if (!e.target._cfg || !e.target._cfg.origin || !e.target._cfg.origin._origin) return
          skipSearchPage(e.target._cfg.origin._origin.location)
        }}
      >
        {/** 坐标系组件。 */}
        <Coord reflect />
        {/** 图例组件。 */}
        <Legend visible={false} />
        {/** 坐标轴的配置 */}
        <Axis visible={false} />
        {/** 提示 */}
        <Tooltip showTitle={false} />

        <View data={dv}>
          <Geom
            type="polygon"
            tooltip={false}
            position="x*y"
            style={{
              fill: '#ddd',
              lineWidth: 0.5,
              stroke: '#fff',
              fillOpacity: 0.85,
            }}
          />
        </View>

        <View data={userData}>
          <Geom
            type="point"
            position="x*y"
            size={['_count', [5, 18]]}
            shape="circle"
            opacity={0.45}
            color={['_percent', '#91d5ff-#1890FF-#0050B3']}
            tooltip="location*_count*percent"
          />
        </View>
      </Chart>
    </div>
  );
});

export default Bubblemap;