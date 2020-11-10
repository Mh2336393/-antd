import * as d3geoProjection from 'd3-geo-projection';
import * as topojson from 'topojson-client';
import chinaJSON from './mapJSON/china_topojson';

const d3 = require('d3');

const defaultOptions = {
  projection: {
    type: 'mercator',
    center: [104, 37],
    scale: 1000,
  },
};

export default class ChinaMap {
  constructor(pattern, options = {}) {
    if (typeof pattern !== 'string') {
      this.container = pattern;
    } else {
      this.container = d3.select(pattern);
    }
    this.resize();
    this.options = Object.assign({}, defaultOptions, options);
    // 可以设置不同 geoJSON
    if (options.geoJSON) {
      this.geoJSON = options.geoJSON;
    } else {
      this.geoJSON = topojson.feature(chinaJSON, chinaJSON.objects.china);
    }

    this._init();
  }

  /**
   * 调整大小
   */
  resize() {
    this.width = this.container.node().offsetWidth;
    this.height = this.container.node().offsetHeight;

    if (this.svg) {
      this.svg.attr('width', this.width).attr('height', this.height);
    }
  }

  _init() {
    this._defineProjection();
    this._definePath();
  }

  // 定义地图投影
  _defineProjection() {
    const { center, scale, type } = this.options.projection;

    switch (type) {
      case 'miller':
        this.projection = d3geoProjection.geoMiller();
        break;

      case 'mercator':
        this.projection = d3.geoMercator();
        break;

      default:
        this.projection = d3.geoMercator();
    }

    this.projection
      .center(center)
      .scale(scale)
      .translate([this.width / 2, this.height / 2]);
  }

  // 定义地图路径 Path
  _definePath() {
    this.path = d3.geoPath().projection(this.projection);
  }

  // 定义地图文字
  _renderText() {
    this.mapText = this.svg
      .append('g')
      .selectAll('.map-text')
      .data(this.geoJSON.features)
      .enter()
      .append('text')
      .attr('class', 'map-text')
      .attr('transform', d => {
        const province = d.properties.name;
        const coordinates = this.path.centroid(d);
        if (province === '甘肃') {
          coordinates[0] += 30;
          coordinates[1] -= 10;
        }

        // 河北省特殊调整
        if (province === '河北') {
          coordinates[0] -= 20;
          coordinates[1] += 30;
        }

        if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
          return 'translate(0, 0)';
        }

        return `translate(${coordinates})`;
      })
      .text(d => d.properties.name);
  }

  // 渲染基础地图
  _renderMap() {
    this.mapPath = this.svg
      .append('g')
      .attr('class', 'map-g')
      .selectAll('.map-path')
      .data(this.geoJSON.features)
      .enter()
      .append('path')
      .attr('class', 'map-path')
      .attr('stroke', '#333')
      .attr('fill', 'rgba(255, 255, 255, .7)')
      .attr('d', this.path);
  }

  // 绘制地图
  init() {
    this.destory();
    // console.log('init map svg')
    this.svg = this.container
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('rand', parseInt(Math.random() * 1000));
    this._defs = this.svg.append('defs');
    this._renderMap();
    this._renderText();
  }

  // 销毁地图
  destory() {
    this.svg && this.svg.remove();
  }

  // 获取真实屏幕坐标
  getScreenPoint(province) {
    if (!province) return console.warn('function need args like province name of coordinates array');

    let coordinates = [];
    if (typeof province === 'string') {
      this.geoJSON.features.forEach(d => {
        if (d.properties.name === province) {
          coordinates = this.path.centroid(d);

          // 甘肃坐标需要特殊调整
          if (province === '甘肃') {
            coordinates[0] += 30;
            coordinates[1] -= 10;
          }

          // 河北省特殊调整
          if (province === '河北') {
            coordinates[0] -= 20;
            coordinates[1] += 30;
          }
        }
      });
    } else if (Array.isArray(province) && province.length > 0) {
      coordinates = this.projection(province);
    } else {
      return console.warn('getScreenPoint need args like province name or coordinates array');
    }

    return coordinates;
  }

  // 根据省份获取地理坐标
  getGeoPoint(province) {
    if (typeof province === 'string') {
      return this.projection.invert(this.getScreenPoint(province));
    }
    return this.projection.invert(province);
  }

  // 地图覆盖层
  appendMap(className) {
    return this.svg
      .append('g')
      .attr('class', 'map-g')
      .selectAll(`.${className}`)
      .data(this.geoJSON.features)
      .enter()
      .append('path')
      .attr('class', `${className}`)
      .attr('stroke', 'transparent')
      .attr('fill', 'transparent')
      .attr('d', this.path);
  }

  // 背景地图(多用于背景填充)
  prependMap(className) {
    return this.svg
      .insert('g', '.map-g')
      .attr('class', 'map-g')
      .selectAll(`.${className}`)
      .data(this.geoJSON.features)
      .enter()
      .append('path')
      .attr('class', `${className}`)
      .attr('stroke', 'transparent')
      .attr('fill', 'transparent')
      .attr('d', this.path);
  }

  // 提供 defs 简化操作
  defs(type, options, options2) {
    switch (type) {
      case 'linearGradient':
        return this._defLinearGradient(options, options2);

      case 'image':
        return this._defImage(options);
    }
  }

  // def image
  _defImage(options) {
    const g = this._defs
      .append('pattern')
      .attr('id', options.id)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', options.width)
      .attr('height', options.height)
      .append('image')
      .attr('xlink:href', options.src)
      .attr('width', options.width)
      .attr('height', options.height);

    return g;
  }

  // def gradient
  _defLinearGradient(options) {
    const g = this._defs.append('linearGradient').attr('id', options.id);

    let xy = [];
    switch (options.direction) {
      case 'to top':
        xy = ['0%', '100%', '0%', '0%'];
        break;
      case 'to bottom':
        xy = ['0%', '0%', '0%', '100%'];
        break;
      case 'to left':
        xy = ['100%', '0%', '0%', '0%'];
        break;
      case 'to right':
        xy = ['0%', '0%', '100%', '0%'];
        break;
      default:
        xy = ['0%', '0%', '0%', '100%'];
        break;
    }

    g.attr('x1', xy[0])
      .attr('y1', xy[1])
      .attr('x2', xy[2])
      .attr('y2', xy[3]);

    g.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', options.start);

    g.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', options.stop || options.start);

    return g;
  }
}
