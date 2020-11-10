import numeral from 'numeral';
import './g2';
import ChartCard from './ChartCard';
import Bar from './Bar';
import Pie from './Pie';
import Radar from './Radar';
import Gauge from './Gauge';
import MiniArea from './MiniArea';
import MiniBar from './MiniBar';
import MiniProgress from './MiniProgress';
import Field from './Field';
import WaterWave from './WaterWave';
import TagCloud from './TagCloud';
import TagCloudCustom from './TagCloud/TagCloudCustom';
import TimelineChart from './TimelineChart';
import Heat from './Heat';
import IntervalChart from './Interval';
import CalendarHeatChart from './Heat/CalendarHeatChart';
import EventHeat from './Heat/EventHeat';
import PolarHeat from './Heat/PolarHeat';
import PointChart from './Point';
import LineChart from './LineChart';
import LineChartMul from './LineChart/LineChartMul';
import CommonIntervalChart from './IntervalChart';
import IntervalStackBarchart from './IntervalStackBarchart'; // 柱状堆叠图
import StackAreaDiagram from './StackAreaDiagram';
import ThresholdCurve from './ThresholdCurve';
import BubbleMap from './worldMap';
import HistogramBrush from './HistogramBrush';

const yuan = val => `${numeral(val).format('0,0')}`;

const Charts = {
  yuan,
  Bar,
  Pie,
  Gauge,
  Radar,
  MiniBar,
  MiniArea,
  MiniProgress,
  ChartCard,
  Field,
  WaterWave,
  TagCloud,
  TimelineChart,
  Heat,
  IntervalChart,
  CalendarHeatChart,
  EventHeat,
  PolarHeat,
  PointChart,
  LineChart,
  CommonIntervalChart,
  TagCloudCustom,
  IntervalStackBarchart,
  StackAreaDiagram,
  ThresholdCurve,
  BubbleMap,
  HistogramBrush,
};
// console.log('chart', Charts.Bubblemap);
export {
  Charts as default,
  yuan,
  Bar,
  Pie,
  Gauge,
  Radar,
  MiniBar,
  MiniArea,
  MiniProgress,
  ChartCard,
  Field,
  WaterWave,
  TagCloud,
  TimelineChart,
  Heat,
  IntervalChart,
  CalendarHeatChart,
  EventHeat,
  PolarHeat,
  PointChart,
  LineChart,
  LineChartMul,
  CommonIntervalChart,
  TagCloudCustom,
  IntervalStackBarchart,
  StackAreaDiagram,
  ThresholdCurve,
  BubbleMap,
  HistogramBrush,
};
