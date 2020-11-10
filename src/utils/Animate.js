/**
 * 动画类
 * 实现自动无限循环
 * todo 封装性能监控,设置帧率
 *
 * 使用方法：
 * var a=new Animate(function(ts){})
 * a.start();a.stop();
 */

export default class Animate {
  constructor(func, scope) {
    //标记状态
    this.running = false;
    this.enable = true;
    this.setAction(func, scope);
    this.scope = window;

    this._id = 0;
  }

  setAction(func, scope) {
    if (typeof func != 'function') {
      console.error('Animate must initial by callback funcion');
      return;
    }
    // this.func=func

    //包装一个方法
    var wrapFunc = ts => {
      this._id = window.requestAnimationFrame(ts => {
        if (this.enable) {
          if (typeof scope == 'object') {
            func.call(scope, ts);
          } else {
            func(ts);
          }
          wrapFunc(ts);
        }
      });
    };
    this.runable = wrapFunc;
  }
  start() {
    this.runable();
  }
  stop() {
    this.enable = false;
    window.cancelAnimationFrame(this._id);
    this._id = 0;
  }
}
