目标
GIS 组件，绘制地理轨迹，地理飞线，热力分布、地域区块，3D 视图效果，地理数据多层叠加
绘制的流程，效果是怎么叠加上去的
坐标系

index.js 入口文件
@/containers/cloud.js ->  
 @/cloud/mapComponent.js 模拟数据，在这里调试效果;  
 @/static/json/world.json 应该是世界地图数据，背景图是画"MultiPolygon",
coordinary 出来的，不是一个图片文件，如果要向左右移动，需要向里面所有的数据进行平移操作，然后刷新整体数据
{//格式
geometry:
type:"Polygon"||"MultiPolygon",
coordinates:[//多边形为一个数组，多多边形为二维数组
[[x,y],[x,y]],[[x,y],[x,y]],
]
properties:
formal_en:"Argentine Republic"
name:"Argentina"
name_long:"Argentina"
type:"Feature"
}
@/components/map/index.js map 的入口
定义了 Map()，
customJson 可以指定中心点，放大，地图偏移值
Map.map=new ChinaMap()，处理画国家界线功能，所以它本来是一个中国地图，但是传入了一个世界地图的经纬度数据

@/components/map/mapJSON 有各个省份的地图数据,以拼音命名.
china_topojson.js 为中国地图数据

    ChinaMap.FlyLine() 飞线类

怎么绘制飞线
加入一个 canvas 后填入 svg-path

动画类 - 控制动画的
算法类 -画 bezier

飞线条数
飞线数据获取
显示飞线顺序
