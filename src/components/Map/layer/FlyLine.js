import MapLayer from '../MapLayer';

const d3 = require('d3');

/**
 * 定义飞线层
 * 配置项：
 * 	轮流动|同时动
 *  线样式
 *  起点特效，落点特效
 *  线宽
 *  线速
 * 	线高
 *  渐变色
 */
export default class FlyLine extends MapLayer {
  constructor() {
    super();

    this.data = [];

    // 2秒跑完，speed=(d/2000)
    this.attr.doneMs = 3200; // 2000
    this.attr.lineLength = 0.3; // 飞线的长度占比
    this.attr.color = 'rgb(17,171,209)'; // 飞线颜色
    this.attr.width = 1.3;
    /*
		//分辨率导致锯齿
		var canvas=this.canvas
		let width = canvas.width, height = canvas.height;
		if (window.devicePixelRatio) {
			canvas.style.width = width + "px";
			canvas.style.height = height + "px";
			canvas.height = height * window.devicePixelRatio;
			canvas.width = width * window.devicePixelRatio;
			this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		} */

    this.attr.circleMaxRadius = 8; // 圆最大的半径
    this.attr.circleDoneMs = this.attr.doneMs * 0.6;
    // ED7A09
  }

  /**
   * 画线
   */
  drawLine(startX, startY, endX, endY) {}

  // 重载设置方法
  setData(data) {
    this._line = [];
    this.data = data;
    this._context.font = '14px "Microsoft YaHei"';
    const lineArr = this._line;

    // 预处理
    for (let index = 0; index < data.length; index += 1) {
      const ele = data[index];
      const line = {};
      // 获取起点
      line.start = this.map.getScreenPoint([ele.blng, ele.blat]);
      line.end = this.map.getScreenPoint([ele.elng, ele.elat]);

      const x1 = line.start[0];

      const y1 = line.start[1];
      const x2 = line.end[0];

      const y2 = line.end[1];
      if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        console.warn('line point error', x1, y1, x2, y2);
        this.status = false;
      }

      const vx = line.end[0] - line.start[0];
      const vy = line.end[1] - line.start[1];

      const [sx, sy] = line.start;
      const [ex, ey] = line.end;
      line.distance = Math.sqrt((sx - ex) * (sx - ex) + (sy - ey) * (sy - ey));

      const lineVector = this._getUnitVector(vx, vy);
      const heightVector = this._getNormalVector(vx, vy);

      // 计算贝塞尔曲线的 control point
      const height = line.distance * 0.3;
      const len = line.distance * 0.2;

      line.cp = [x1 + len * lineVector[0] + height * heightVector[0], y1 + len * lineVector[1] + height * heightVector[1]];

      line.speed = line.distance / this.attr.doneMs;
      line.circleSpeed = this.attr.circleMaxRadius / this.attr.circleDoneMs;

      lineArr.push(line);
    }
  }

  draw(ts) {
    this.clear();
    if (!this.status) return;
    const { _context: ctx, data, _line: line, attr } = this;
    const color = attr.color || 'rgb(17,171,209)';
    for (let i = 0; i < data.length; i += 1) {
      ctx.beginPath();

      const ele = data[i];
      const { bcity, bip, ecity, eip } = ele;
      if (!ele._sts) {
        ele._sts = ts;
      }
      const dt = ts - ele._sts;
      // 初始点
      const [sx, sy] = line[i].start;
      const [ex, ey] = line[i].end;

      // 画点
      const r = line[i].circleSpeed * dt;
      if (r < this.attr.circleMaxRadius) {
        ctx.fillStyle = 'rgba(80,231,244,0.5)';
        ctx.arc(sx, sy, r, 0, 2 * Math.PI);
        ctx.fill();
      } else if (r < this.attr.circleMaxRadius * 1.3) {
        const dr = this.attr.circleMaxRadius * 1.3 - r;
        const alpha = (dr / r) * 0.8;
        ctx.fillStyle = `rgba(80,231,244,${alpha})`;
        ctx.arc(sx, sy, r, 0, 2 * Math.PI);
        ctx.fill();
      }
      // if (r < this.attr.circleMaxRadius) {
      //   ctx.fillStyle = 'rgba(80,231,244,0.5)';
      //   ctx.arc(sx, sy, r, 0, 2 * Math.PI);
      //   ctx.fill();
      // } else {
      //   const multi = Math.floor(r / this.attr.circleMaxRadius);
      //   const rNew = r - multi * this.attr.circleMaxRadius;
      //   ctx.fillStyle = `rgba(80,231,244,0.5)`;
      //   ctx.arc(sx, sy, rNew, 0, 2 * Math.PI);
      //   ctx.fill();
      // }
      ctx.beginPath();

      // 根据速度计算步长
      const d = line[i].distance;
      const cd = line[i].speed * dt;
      // console.log('aaa:'+cd)
      const slocationObj = document.querySelector(`#slocation${i}`); // 源位置的ip和city名
      const elocationObj = document.querySelector(`#elocation${i}`); // 目的位置的ip和city名

      if (cd > d * 0.75) {
        if (slocationObj) {
          this.wrap.select(`#slocation${i}`).remove();
        }
        if (!elocationObj) {
          this.wrap
            .append('div')
            .attr('id', `elocation${i}`)
            .style('position', 'absolute')
            .style('left', `${ex - 60}px`)
            .style('top', `${ey - 45}px`)
            .style('text-align', 'center')
            .style('width', '120px')
            .style('white-space', 'no-wrap')
            .style('overflow', 'hidden')
            .style('font-size', '12px')
            .html(`<span>${eip}</span><br /><span>${ecity}</span>`);
        }
        if (!ele._ets) {
          ele._ets = ts;
        }
        const e_dt = ts - ele._ets;
        const e_r = line[i].circleSpeed * e_dt;
        if (e_r < this.attr.circleMaxRadius) {
          ctx.fillStyle = 'rgba(80,231,244,0.5)';
          ctx.arc(ex, ey, e_r, 0, 2 * Math.PI);
          ctx.fill();
        } else if (e_r < this.attr.circleMaxRadius * 1.3) {
          const dr = this.attr.circleMaxRadius * 1.3 - e_r;
          const alpha = (dr / e_r) * 0.8;
          ctx.fillStyle = `rgba(80,231,244,${alpha})`;
          ctx.arc(ex, ey, e_r, 0, 2 * Math.PI);
          ctx.fill();
        }
      } else if (!slocationObj) {
        this.wrap
          .append('div')
          .attr('id', `slocation${i}`)
          .style('position', 'absolute')
          .style('left', `${sx - 60}px`)
          .style('top', `${sy - 45}px`)
          .style('text-align', 'center')
          .style('width', '120px')
          .style('white-space', 'no-wrap')
          .style('overflow', 'hidden')
          .style('font-size', '12px')
          .html(`<span>${bip}</span><br /><span>${bcity}</span>`);
      }
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      // 计算control点
      const gap = 0.2; // 透明的空隙
      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      const gs = cd / d - attr.lineLength;
      let ge = 0;
      // gs=0.1
      ge = gs + attr.lineLength;

      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(this._make(gs - gap), 'rgba(1,1,1,0)');
      grad.addColorStop(this._make(gs), color);
      grad.addColorStop(this._make(ge), 'rgba(237,122,9,0.8)');
      grad.addColorStop(this._make(ge + gap), 'rgba(255,74,74,0.3)');
      grad.addColorStop(1, 'rgba(255,74,74,0.2)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = attr.width;

      ctx.quadraticCurveTo(line[i].cp[0], line[i].cp[1], ex, ey);
      ctx.stroke();

      this.drawLine();

      // 判断是否结束，归零，必须用gs来判断
      if (gs >= 1) {
        // 重头来
        ele._sts = ts;
        ele._ets = null;
        if (elocationObj) {
          this.wrap.select(`#elocation${i}`).remove();
        }
      }
    }
  }

  _make(val) {
    if (val <= 0) return 0;
    if (val >= 1) return 1;

    return val;
  }

  /**
   * 单位向量
   */
  _getUnitVector(x, y) {
    let L = x * x + y * y;
    L = Math.sqrt(L);
    return [x / L, y / L];
  }

  /**
   * 法向量
   */
  _getNormalVector(a, b) {
    const vy = Math.sqrt((a * a) / (b * b + a * a));
    const vx = (-b / a) * vy;

    return this._getUnitVector(vx, vy);
  }
}
