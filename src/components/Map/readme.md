# ChinaMap

---

基于 d3.js 构建的地图组件，简化了开发时所需要的操作。此组件实现了高拓展性，可以满足拥有多种特殊功能地图的开发。

## 使用方法

将文件直接 import 进来进行实例化即可。组件依赖 d3.js，需要在 html 中引入。

```bash
$ tnpm i @tencent/chinamap --save
```

```js
import ChinaMap from '@tencent/chinamap';

const myMap = new ChinaMap('#map', {
  projection: {
    type: 'mercator', // 映射类型，'mercator'|'miller'
    center: [104, 37], // 地图位移
    scale: 1000, // 地图比例
  },
});
```

---

## 地图 API

### map.getScreenPoint(String|Array)

可以根据省的名字或者真实的经纬度坐标来转化成屏幕坐标

```js
// 获取屏幕坐标，支持省份和真实坐标
myMap.getScreenPoint('河南');
myMap.getScreenPoint([113.17, 33.44]);
```

### map.getGeoPoint(String|Array)

根据省名或者屏幕坐标来获取真实经纬度

```js
// 获取真实坐标，支持省份和屏幕坐标
myMap.getGeoPoint('河南');
myMap.getGeoPoint([917, 516]);
```

### map.mapPath

map.mapPath 是 d3 绘制地图后的 `path`，可以继续通过 d3 的 API 进行操作

```js
// 地图路径 myMap.mapPath
myMap.mapPath.style('fill', 'rgba(0, 0, 0, 0.3)');
```

### map.mapText

map.mapPath 是 d3 绘制地图后的 `text`，可以继续通过 d3 的 API 进行操作

```js
// 地图文字 myMap.mapText
myMap.mapText.style('fill', 'url(#hello)');
```

### map.defs(type:String, options:Object, Anything)

map.defs 方法是为了简化 svg 定义 defs 操作。这里提供了线性渐变、背景图片的简化方法。如果想直接操作 defs，可以直接使用 `map._defs` 进行操作。

#### 渐进色

```js
// 添加 defs 相关内容（若想直接操作 <defs></defs>，使用 myMap._defs）
// 添加渐进色，跟 CSS 语法相近
myMap.defs('linearGradient', {
  id: 'hello',
  direction: 'to top', // 暂时只支持：to top, to left, to bottom, to right
  start: 'red',
  end: 'black',
});
```

#### 背景图片

```js
// 添加背景图片
myMap.defs('image', {
  id: 'world',
  width: 23,
  height: 23,
  src: './image/icon1.png',
});
```

### map.appendMap(className:String)

appendMap 方法可以让你更简单的生成一个全透明的地图覆盖层，你可以在覆盖层上做更多的事情。

```js
// 提供地图再覆盖功能(appendMap, prependMap)
const upperMap = myMap.appendMap('className');
upperMap.attr('fill', 'url(#world)');
```

### map.prependMap(className:String)

prependMap 方法轻松生成的地图图层，并放在最底层被覆盖。一般用作地图背景填充。

```js
// 提供地图再覆盖功能(appendMap, prependMap)
const lowerMap = myMap.appendMap('className');
lowerMap.attr('fill', 'url(#world)');
```

---

## 飞线 API

### map.flyLine(options:Object)

地图飞线是地图的一个拓展功能。考虑到实际使用飞线的应用场景，这里使用了 Canvas 覆盖 D3 地图后进行开发。

```js
// 基础配置，在飞线数据无特殊配置前都以基础配置的为准。

const flyline = myMap.FlyLine({
  controlPoint: [0, 0.3], // 控制点默认在两点连线的中点。默认为[0, 0.3]。
  tick: 0.02, // 飞线运动间隔。默认为 0.01
  colors: [{ stop: 0.9, color: '#000' }], // 飞线尾是通过渐进色实现，0和1默认都为透明色
  lineWidth: 1, // 线宽
});
```

### flyline.context

提供 canvas 的 context 来支持直接操作

```js
flyline.context.beginPath();
flyline.context.arc(10, 10, 10, Math.PI, true);
flyline.context.stroke();
```

### flyline.start(callback:Function)

flyline 实例提供启动动画的方法，并且提供启动时的回调 Hook

```js
flyline.start(function() {
  console.log('start');
});
```

### flyline.stop(callback:Function)

关闭动画的方法，并且提供关闭动画后的回调 Hook

```js
flyline.stop(function() {
  console.log('stop');
});
```

### flyline.getPathPoint(t:Number)

可以根据 t 取得当前飞线上的任意一点

```js
// t是在 [0, 1] 之间的任意一个数
flyline.getPathPoint(0.5);
```

### flyline.add(flylineData:Object|Array)

可添加飞线数据，飞线数据有格式要求和拥有更高优先级的样式功能以及需要的钩子回调。飞线数据是一个对象，可进行多种配置。支持直接传入飞线数据数组。

这里可以为特殊的飞线独立出功能和样式。以此来支持地图上有多种类型的飞线。

```js
flyline.add({
  //这里需要Canvas屏幕坐标。可使用地图方法 getScreenPoint 进行转换。
  start: myMap.getScreenPoint('广东'),
  end: myMap.getScreenPoint('北京'),

  // 这里可以为特殊的飞线独立出功能。以此来支持地图上有多种类型的飞线。
  colors: [{ stop: 0.9, color: 'rgba(0, 255, 231, 0.9)' }],
  lineWidth: 2,

  // Hook Function
  // 回调参数：context 和所传入的飞线数据 data
  onStart({ context, data }) {},
  // 回调参数：context 和所传入的飞线数据 data
  onEnd({ context, data }) {},
  // 回调参数：context 和所传入的飞线数据 data 和当前进行中的点
  onDraw({ context, point, data }) {},
});
```
