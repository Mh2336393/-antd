import React, { Component } from 'react';
import Map from './index';
import json from './mapJSON/world.json';
import _ from 'lodash';
// import styles from './WorldMap.less';

import FlyLine from '@/components/Map/layer/FlyLine';
// import MarkPoint from '@/components/Map/layer/MarkPoint';

class FlylineMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapId: `map-id-${parseInt(Math.random() * 100000, 10)}`,
    };

    this.map = null;
    this.showNum = 6;
    this.customJson = {
      json,
      // 经度,纬度
      center: [6, 27],
      scale: 185,
      // 中国地图缩放配置 center:[108,36] scale:1200
      // 世界地图缩放位置 center:[10, 27] scale:300
    };
    this.options = {
      // customJson: this.customJson,
      province: '', // 指定 省名称
      showMapText: false,
      backgroundColor: 'rgba(49,49,73,0.7)',
      color: '#fff',
      width: '8', // 线条粗细
    };
  }

  // 洗牌算法，用于从this.data中随机选择特定数量的数据进行展示
  getShuffleData(data) {
    const arr = _.cloneDeep(data);
    if (arr.length > this.showNum) {
      const result = [];
      let count = arr.length;
      for (let i = 0; i < this.showNum; i += 1) {
        const index = ~~(Math.random() * count) + i;
        result[i] = arr[index];
        arr[index] = arr[i];
        count--;
      }
      console.log('shuffleDta', result);
      return result;
    }
    return arr;
  }

  componentDidMount = () => {
    const { mapId } = this.state;
    this.map = new Map(mapId, this.options);
    this.renderMap();
    this.timer = setInterval(this.renderMap, 60000);
  };

  componentWillReceiveProps = nextProps => {
    const {
      model: { flyline: newFlyline },
    } = nextProps;
    const {
      model: { flyline },
    } = this.props;

    if (!_.isEqual(newFlyline, flyline)) {
      // console.log('newFlyline', newFlyline);
      // console.log('flyline', flyline);
      this.renderMap(newFlyline);
    }
  };

  componentWillUnmount = () => {
    clearInterval(this.timer);
  };

  renderMap = newFlyline => {
    const {
      model: { flyline },
    } = this.props;
    const shuffleFlyline = this.getShuffleData(newFlyline || flyline);
    this.map.initCustomMap(Object.assign(this.options, this.customJson));
    this.map.clearLayer();
    if (shuffleFlyline.length > 0) {
      // 列举支持的所有图层
      const layers = [
        // {
        //   layerObj: MarkPoint,
        //   item: {
        //     name: '默认',
        //     labelTime: 6,
        //     maxLabelCount: 3,
        //     data: markpoint || [],
        //   },
        // },
        {
          layerObj: FlyLine,
          item: {
            name: '默认',
            color: 'rgba(255,197,67,1)',
            width: 1,
            data: shuffleFlyline || [],
          },
        },
      ];
      // 统一图层处理流程
      for (let i = 0; i < layers.length; i += 1) {
        const ele = layers[i];
        const { layerObj, item } = ele;
        const layer = new layerObj();
        this.map.addLayer(layer);
        layer.setAttr({ ...item });
        const { data } = item;
        layer.setData(data);
      }
    }
    this.map.resize();
  };

  render() {
    const { mapId } = this.state;
    const dft = <div id={mapId} style={{ width: '100%', height: '100%', position: 'relative' }} />;
    return dft;
  }
}

export default FlylineMap;
