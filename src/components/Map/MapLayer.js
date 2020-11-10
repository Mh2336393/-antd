// import { debug, isNullOrUndefined } from 'util';
import Animate from '../../utils/Animate';

/**
 * 地图蒙层
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API
 *
 */
export default class MapLayer {
  constructor() {
    // this.container=box
    this.id = `map-layer-${Math.random() * 1000000}`;

    this.animate = new Animate(this.draw, this);
    this.map = null;
    this.canvas = null;
    this.wrap = null;

    // 是否可以显示
    this.status = true;

    this.attr = {};
  }

  /**
   * 设置属性
   */
  setAttr(attr) {
    for (const i in this.attr) {
      if (attr[i] === undefined) {
        continue;
      }
      this.attr[i] = attr[i];
    }
  }

  setMap(map) {
    const container = map.container;
    this.wrap = container
      .append('div')
      .style('width', '100%')
      .style('height', '100%')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0);

    this.map = map;
    const w = 0;
    const h = 0;
    this.canvas = this.wrap
      .append('canvas')
      .attr('id', this.id)
      .attr('width', this.wrap.node().offsetWidth)
      .attr('height', this.wrap.node().offsetHeight)
      .style('pointer-events', 'none')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0);
    this._context = this.canvas.node().getContext('2d');
  }

  resize() {
    const container = this.map.container;
    this.canvas.attr('width', container.node().offsetWidth).attr('height', container.node().offsetHeight);
  }

  /**
   * 每帧绘制函数
   */
  draw(time) {
    this.clear();
  }

  clear() {
    this._context.clearRect(0, 0, this.canvas.attr('width'), this.canvas.attr('height'));
  }

  /**
   * 刷新重绘
   */
  refresh() {}

  start() {
    this.animate.start();
  }

  stop() {
    this.animate.stop();
  }

  /**
   * 定义获取数据的方法
   */
  getData() {
    console.log('get data not implement');
  }

  /**
   * 设置本地数据
   */
  setData(d) {
    this.data = d;
  }
}
