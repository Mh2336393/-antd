import $ from 'jquery';
import ChinaMap from './ChinaMap';
// import mapFillImage from './img/map-fill.png';
// import * as provinceToCity from './provinceToCity';
// import projectionDesc from './mapJSON/projection';

// const provinceToCityMap = removeDollar(d3.map(provinceToCity.province, (d)=>d.ename))
// const provinceCnMap = removeDollar(d3.map(provinceToCity.province, (d)=>d.province))
// const provinceFullMap = removeDollar(d3.map(provinceToCity.province, (d)=>d.full))

import './index.css';
// import { lstat } from 'fs';
// const d3 = require('d3');

/* 如果带上背景图，这个是offset到对应的位置的数据 */
const mapLeft = 662;
const mapTop = 435;

class Map {
  constructor(id, option = {}) {
    id = `#${id}`;
    if (!id || !document.querySelector(id)) {
      console.error('Map no id');
      return false;
    }
    const { backgroundContainer, showMapText, totalPosition, customJson } = option;
    this.id = id;
    $(id).addClass('_map-container');
    const map = new ChinaMap(id, {
      projection: {
        type: 'miller', // 映射类型，'mercator'|'miller'
        center: [111.8, 37], // 地图位移
        scale: 1100, // 地图比例
      },
    });
    this.map = map;
    // 如果自己传入json
    if (customJson) {
      this.initCustomMap(Object.assign(option, customJson));
    } else {
      map.init();
      this.mapRender(option);
      this.isChina = true;
      if (backgroundContainer) {
        $(backgroundContainer).addClass('_map-background-container');
        $(id).addClass('_map-svg');
        if (totalPosition) {
          $('._map-background-container').css({
            backgroundPosition: `${totalPosition[0]}px ${totalPosition[1]}px`,
          });
          $('._map-svg').css({
            left: `${mapLeft + totalPosition[0]}px`,
            top: `${mapTop + totalPosition[1]}px`,
          });
        }
      }
    }

    // 记录加过的层
    this.layers = [];
  }

  resize() {
    this.map.resize();
    const layers = this.layers;
    for (let index = 0; index < layers.length; index += 1) {
      const element = layers[index];
      element.resize();
    }
  }

  /**
   * 添加图层
   *
   */
  addLayer(layer) {
    layer.setMap(this.map);

    layer.start();

    this.layers.push(layer);
  }

  /**
   * 清除所有图层
   */
  clearLayer() {
    const ls = this.layers || [];
    ls.forEach(ele => {
      ele.stop();
      ele.clear();
      ele.wrap.remove();
    });
    this.layers = [];
  }

  // 地图基础配置
  mapRender(option) {
    const { map } = this;
    const { showMapText, backgroundColor } = option;
    // 初始设定
    map.defs('image', {
      id: 'map-fill',
      width: 5,
      height: 5,
    });
    map.prependMap().attr('fill', backgroundColor || 'url(#map-fill)');
    map.mapPath
      .attr('fill', 'transparent')
      .style('stroke', 'rgba(22,22,47,0.5)')
      .style('stroke-width', '1');
    if (!showMapText) map.mapText.text('');
    this.defaultSetting();
    this.ready = true;
  }

  /* 默认配置 */
  defaultSetting() {}

  /* 销毁方法 */
  destroy() {
    if (this.bubbleInterval) clearInterval(this.bubbleInterval);
    this.map.svg.remove();
  }

  /* 自定义的传入地图 */
  initCustomMap(customJson) {
    const { json, center, scale, showMapText, backgroundContainer, totalPosition } = customJson;
    const { map } = this;
    map.geoJSON = json;

    map.projection.center(center || [0, 0]).scale(scale || 6700);
    map.init();
    this.mapRender(customJson);
    if (backgroundContainer) {
      $(backgroundContainer)
        .addClass('_map-background-container')
        .css({ backgroundImage: 'none' });
      $(id).addClass('_map-svg');
      if (totalPosition) {
        $('._map-background-container').css({
          backgroundPosition: `${totalPosition[0]}px ${totalPosition[1]}px`,
        });
        $('._map-svg').css({
          left: `${mapLeft + totalPosition[0]}px`,
          top: `${mapTop + totalPosition[1]}px`,
        });
      }
    }
  }
}

export default Map;
