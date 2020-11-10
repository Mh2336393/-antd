/* 世界地图整个的组件 */
import Map from '.';
import json from '@/static/json/world.json';

/* eslint-disable */

const map = new Map('#world-map', {
  customJson: {
    json,
    // center: [0, 20],
    center: [500, 20],
    // scale: 308
    scale: 250,
  },
  province: '',
  showMapText: false,
  // backgroundColor: 'rgb(22, 27, 63)',
  backgroundColor: 'rgb(167,192,224)',
  // backgroundColor:'#fff',
  hasFlyLine: true,
});

map.setMapStrokeArr({ width: '1' });
/* map.setFlyLineAttr() */
map.startFlyLine();

let remoteInterval;
let saveRemoteData = [];
let saveRemoteDataMap = {};
let saveRiskData = [];
let saveRiskDataMap = {};

let judTimeInterval;
let saveData = [];
let saveDataMap = {};
/* 根据时间入队飞线 */
function judTimeFlyline(data) {
  if (judTimeInterval) clearTimeout(judTimeInterval);
  /* 验证数据 */
  if (!data || !Array.isArray(data) || !data.length) return showOne();
  const newData = [];
  data.forEach(d => {
    if (!d.bcity || !d.blng || !d.ecity || !d.elat || !d.elng || !d.ts) return;

    if (!d.type) d.type = 'in';
    newData.push(d);
  });

  data = newData.reverse();
  if (!data.length) return;
  const zero = new Date(data[0].ts).getTime();
  const minus = Math.abs(new Date().getTime() - zero);

  saveData = data;

  showOne();
  function showOne() {
    if (saveData.length > 0) {
      const now = new Date().getTime();
      const random = saveData.length > 2 ? Math.floor(Math.random() * 2) + 1 : 1;
      const tmpList = saveData.splice(0, random);
      saveData = saveData.concat(tmpList);
      for (let i = 0; i < random; i++) {
        const one = tmpList[i];
        const obj = {
          start: [+one.blng, +one.blat],
          end: [+one.elng, +one.elat],
          startName: one.bcity,
          endName: one.ecity,
          colors:
            one.type === 'in'
              ? [
                  {
                    stop: 0.7,
                    color: 'rgb(158, 55, 58)',
                  },
                  {
                    stop: 0.9,
                    color: 'rgb(255, 247, 25)',
                  },
                ]
              : [
                  {
                    stop: 0.7,
                    color: 'rgb(5, 86, 178)',
                  },
                  {
                    stop: 0.9,
                    color: 'rgb(0, 241, 255)',
                  },
                ],
          lineWidth: 2,
          getScreenPoint: true,
        };
        if (Math.abs(obj.start[0] - obj.end[0]) < 10) {
          obj.controlPoint = [0, 0.1];
        } else if (Math.abs(obj.start[0] - obj.end[0]) < 20) {
          obj.controlPoint = [0, 0.2];
        } else if (Math.abs(obj.start[0] - obj.end[0]) < 30) {
          obj.controlPoint = [0, 0.3];
        }
        map.doFlyLine(obj);
      }
    }

    judTimeInterval = setTimeout(() => showOne(), Math.round(Math.random() * 500 + 2500));
  }
}

/*
export default {
  getMap() {
    return map
  },
  stopFlyLine() {
    map && map.stopFlyLine()
  },
  startFlyLine() {
    map && map.startFlyLine()
  },
  updateData(data) {
    map && judTimeFlyline(data)
  }
}
*/

const renderWorldMap = data => {
  map && judTimeFlyline(data);
  map && showRemoteData([]);
  map && showRiskData([]);
};

renderWorldMap([]);
function addData(data) {
  const filterData = [];
  if (data && data.length > 0) {
    for (let i = 0, len = data.length; i < len; i += 1) {
      // if(!d.bcity || !d.blng || !d.ecity || !d.elat || !d.elng || !d.ts) return
      const key = `${data[i].blng}_${data[i].blat}_${data[i].elng}_${data[i].elat}_${data[i].type}`;
      if (saveDataMap[key]) {
        continue;
      }
      saveDataMap[key] = data[i];
      filterData.push(data[i]);
    }
  }

  saveData = filterData.concat(saveData);
}

function clearData() {
  saveData = [];
  saveDataMap = {};

  saveRemoteData = [];
  saveRemoteDataMap = {};

  saveRiskData = [];
  saveRiskDataMap = {};
}

function setPointData(points) {
  map.setPointData(points);
}
setPointData();

function setRemotelogData(data) {
  const filterData = [];
  if (data && data.length > 0) {
    for (let i = 0, len = data.length; i < len; i += 1) {
      const key = `${data[i].lng}_${data[i].lat}`;
      if (saveDataMap[key]) {
        continue;
      }
      saveRemoteDataMap[key] = data[i];
      filterData.push(data[i]);
    }
  }
  saveRemoteData = filterData.concat(saveRemoteData);
}

function showRemoteData() {
  if (remoteInterval) clearTimeout(remoteInterval);

  showRemote();
  function showRemote() {
    if (saveRemoteData.length > 0) {
      const now = new Date().getTime();
      const random = saveRemoteData.length > 3 ? Math.floor(Math.random() * 3) + 1 : 1;
      const tmpList = saveRemoteData.splice(0, random);
      saveRemoteData = saveRemoteData.concat(tmpList);
      for (let i = 0; i < random; i++) {
        const obj = tmpList[i]; // [+one.lng, +one.blat]
        map.doRemoteBubble(obj);
      }
    }

    remoteInterval = setTimeout(() => showRemote(), Math.round(Math.random() * 500 + 2500));
  }
}

function showRiskData() {
  if (saveRiskData.length > 0) {
    // const now = new Date().getTime();
    const tmpList = saveRiskData.splice(0, 5);
    console.log('showRiskData', tmpList);
    for (let i = 0; i < tmpList.length; i += 1) {
      const obj = tmpList[i]; // [+one.lng, +one.blat]
      map.doRiskRectangle(obj);
    }
  }
}

function setRiskData(data) {
  const filterData = [];
  if (data && data.length > 0) {
    for (let i = 0, len = data.length; i < len; i++) {
      const key = `${data[i].lng}_${data[i].lat}`;
      if (saveDataMap[key]) {
        continue;
      }
      saveRiskDataMap[key] = data[i];
      filterData.push(data[i]);
    }
  }
  saveRiskData = filterData;
  showRiskData();
}

if (window.addEventListener) {
  // Set the name of the hidden property and the change event for visibility
  let hidden;
  let visibilityChange;
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }

  // If the page is hidden, pause the video;
  // if the page is shown, play the video
  function handleVisibilityChange() {
    if (document[hidden]) {
      clearTimeout(judTimeInterval);
      clearTimeout(remoteInterval);
    } else {
      judTimeFlyline([]);
      showRemoteData([]);
      showRiskData([]);
    }
  }

  // Warn if the browser doesn't support addEventListener or the Page Visibility API
  if (typeof document.addEventListener === 'undefined' || typeof document.hidden === 'undefined') {
  } else {
    // Handle page visibility change
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
  }
}

window.worldMap = {
  renderMap: renderWorldMap,
  addData,
  clearData,
  setPointData,
  setRemotelogData,
  setRiskData,
};

const lineData = [
  { bcity: '多伦多', blng: -79.3854, blat: 43.6486, ecity: '', elng: 113.281, elat: 23.1252, type: 'in', ts: 1515416716037 },
  { bcity: '', blng: 35.3612, blat: 31.3893, ecity: '', elng: 113.281, elat: 23.1252, type: 'in', ts: 1515416716037 },
];

const remoteData = [
  { city: '北京', coordinates: [116.405, 39.905] },
  { city: '北京', coordinates: [116.405, 39.905] },
  { city: '天津', coordinates: [117.19, 39.1256] },
];
const riskData = [
  { city: '深圳', wording: '发现有主机被成功暴破', link: 'https://guanjia.qq.com', coordinates: [114.086, 22.547] },
  { city: '首尔3', wording: '发现有主机正在被暴力破解', link: 'https://guanjia.qq.com', coordinates: [-16.978, 3.5665] },
  { city: '法兰克福', wording: '发现有主机被DDOS攻击', link: 'https://guanjia.qq.com', coordinates: [8.6821, 50.1109] },
  { city: '硅谷', wording: '发现有网站被Web攻击', link: 'https://guanjia.qq.com', coordinates: [-122.181, 37.4027] },
  { city: '首尔', wording: '发现有主机正在被暴力破解', link: 'https://guanjia.qq.com', coordinates: [126.978, 37.5665] },
  { city: '首尔1', wording: '发现有主机正在被暴力破解', link: 'https://guanjia.qq.com', coordinates: [12.978, 37.5665] },
  { city: '首尔2', wording: '发现有主机正在被暴力破解', link: 'https://guanjia.qq.com', coordinates: [126.978, 3.5665] },
];

const pointData = [
  { city: '法兰克福', num: 1001, type: 'map12', coordinates: [8.6821, 50.1109] },
  { city: '硅谷', num: 20, type: 'map11', coordinates: [-122.181, 37.4027] },
  { city: '多伦多', num: 20, type: 'map11', coordinates: [-79.3854, 43.6486] },
  { city: '首尔', num: 20, type: 'map11', coordinates: [126.978, 37.5665] },
  { city: '新加坡', num: 7, type: 'map12', coordinates: [103.704, 1.314] },
  { city: '中国香港', num: 20, type: 'map12', coordinates: [113.988, 22.3527] },
  { city: '成都', num: 20, type: 'map13', coordinates: [104.0668, 30.5728] },
  { city: '北京', num: 20, type: 'map13', coordinates: [116.4074, 39.9042] },
  { city: '上海', num: 14, type: 'map11', coordinates: [121.473, 31.2317] },
  { city: '广州', num: 13, type: 'map11', coordinates: [113.281, 23.1252] },
  { city: '达拉斯', num: 13, type: 'map11', coordinates: [-96.797, 32.7767] },
  { city: '华盛顿', num: 13, type: 'map11', coordinates: [-77.0369, 38.9072] },
  { city: '圣保罗', num: 13, type: 'map11', coordinates: [-46.6333, -23.5505] },
  { city: '伦敦', num: 13, type: 'map13', coordinates: [-0.1278, 51.5074] },
  { city: '阿姆斯特丹', num: 13, type: 'map11', coordinates: [4.8952, 52.3702] },
  { city: '莫斯科', num: 13, type: 'map11', coordinates: [37.6173, 55.7558] },
  { city: '金奈', num: 13, type: 'map11', coordinates: [80.2707, 13.0827] },
  { city: '孟买', num: 13, type: 'map11', coordinates: [72.8777, 19.076] },
  { city: '曼谷', num: 13, type: 'map12', coordinates: [100.5018, 13.7563] },
  { city: '东京', num: 13, type: 'map11', coordinates: [139.732, 35.709] },
  { city: '悉尼', num: 13, type: 'map13', coordinates: [151.2093, -33.8688] },
];

if (window.location.host === 'localhost:8081') {
  window.worldMap.addData(lineData);
  window.worldMap.setRemotelogData(remoteData);
  window.worldMap.setPointData(pointData);
  setInterval(() => window.worldMap.setRiskData(riskData), 6000);
  window.worldMap.setRiskData(riskData);
}

export default renderWorldMap;
