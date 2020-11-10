import $ from 'jquery';
import MapLayer from '../MapLayer';

/**
 * 标记点
 */
export default class MarkPoint extends MapLayer {
  constructor() {
    super();

    this.attr.size = 5;
    this.attr.labelTime = 6; // 显示时间
    this.attr.maxLabelCount = 3; // 最多同时显示点个数
    this.attr.color = '#01AFFF';

    this.randomLabel = [];

    this.points = [];
    this.lastTs = null;
  }

  setData(data) {
    this.data = data;
    this.points = [];
    const attr = this.attr;

    this.randomLabel = [];
    //
    this.wrap.style('color', '#fff');
    const len = data.length;
    for (let index = 0; index < len; index += 1) {
      const ele = data[index];
      // 获取起点
      const p = this.map.getScreenPoint([ele.lng, ele.lat]);
      const r = attr.size + Math.random() * 1.2;

      const obj = {
        // 中心点
        cx: p[0],
        cy: p[1],

        // 半径
        radius: r,

        // 转折点
        turnX: p[0] - 18,
        turnY: p[1] - 18,
      };
      // TODO，随机方向
      // 横线起点
      obj.hrX = obj.turnX - 80;
      obj.hrY = obj.turnY;

      this.points.push(obj);

      this.randomLabel.push(0);
    }

    for (let i = 0; i < attr.maxLabelCount; i++) {
      this.addRandomLabel();
    }
    // console.log(this.data)
  }

  draw(ts) {
    this.clear();
    if (this.lastTs === null) {
      this.lastTs = ts;
    }
    const ctx = this._context;
    const points = this.points;

    const len = points.length;

    let currentShowCount = 0;
    const $wrap = $(this.wrap.node());

    for (let i = 0; i < len; i++) {
      const p = points[i];
      let draw = true;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(1,175,255,0.5)';
      // ctx.fillRect(p.realX, p.realY, p.radius, p.radius);
      ctx.arc(p.cx, p.cy, p.radius, 0, 2 * Math.PI);
      ctx.fill();

      if (this.randomLabel[i] > 0) {
        this.randomLabel[i] -= ts - this.lastTs;
        if (this.randomLabel[i] <= 0) {
          draw = false;
          $wrap.find(`div[mark-index=${i}]`).remove();
          // console.log('remove',i)
        }
      } else {
        draw = false;
      }

      if (draw) {
        currentShowCount++;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.turnX, p.turnY);
        ctx.strokeStyle = 'rgba(1,175,255,1)';
        ctx.stroke();

        ctx.moveTo(p.turnX, p.turnY);
        ctx.lineTo(p.hrX, p.hrY);
        ctx.strokeStyle = 'rgba(1,175,255,1)';
        ctx.stroke();
      }
    }

    while (currentShowCount < this.attr.maxLabelCount) {
      this.addRandomLabel();
      currentShowCount++;
    }
    // console.log(this.randomLabel)
    this.lastTs = ts;
  }

  genShowTime() {
    return 2000 * Math.random() + this.attr.labelTime * 1000;
  }

  addRandomLabel() {
    const points = this.points;
    const index = parseInt(Math.random() * points.length);
    this.randomLabel[index] = this.genShowTime();

    const p = points[index];
    // console.log(p);
    if (p) {
      this.wrap
        .append('div')
        .style('position', 'absolute')
        .style('left', `${p.hrX}px`)
        .style('top', `${p.hrY - 20}px`)
        .style('width', '80px')
        .style('height', '23px')
        .style('white-space', 'no-wrap')
        .style('overflow', 'hidden')
        .attr('mark-index', index)
        .text(this.data[index].title);
    }
    // console.log('addrandom',index)
  }
}
