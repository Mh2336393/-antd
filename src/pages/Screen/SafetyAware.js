/*
 * @Author: finazhang
 * @Date: 2018-10-16 16:06:01
 * 仪表盘 安全总览
 */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */

import React, { Component } from 'react';
import { connect } from 'umi';
import { Spin } from 'antd';
import {
  ChartCard,
  MiniArea,
  MiniBar,
  Field,
  Heat,
  PolarHeat,
  PointChart,
} from '@/components/Charts';
import FlylineMap from '@/components/Map/FlylineMap';
// import { Row, Col, Table, Card, Radio, Popover } from 'antd';

import numeral from 'numeral';
import Trend from '@/components/Trend';
// import PageHeaderWrapper from '@/components/PageHeaderWrapper/';
import { Link } from 'umi';
import moment from 'moment';
import { history } from 'umi';
import styles from './SafetyAware.less';
import Yuan from '@/utils/Yuan';
import logoImg from '../../assets/logo-screen.png';
// import configSettings from '../../configSettings';

@connect(({ global, safetyAware, loading }) => ({
  hasVpc: global.hasVpc,
  isKVM: global.isKVM,
  safetyAware,
  hasVpcLoading: loading.effects['global/fetchVpcConfig'],
  loading0: loading.effects['safetyAware/fetchRealTimeOverall'],
  loading1: loading.effects['safetyAware/fetchEventDistribution'],
  loading2: loading.effects['safetyAware/fetchAttackList'],
  loading3: loading.effects['safetyAware/fetchAssetScoreDistribute'],
}))
class SafetyAware extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realTime: moment(),
      // timeRange: 7, // 安全事件分布的时间搜索范围
      extraStyles: {},
      // attactHeight: 300,
      // cardHeight: 65,
      // heatHeight: 210,
      // pointHeight: 300,
    };
    this.weekDayMap = {
      0: '星期天',
      1: '星期一',
      2: '星期二',
      3: '星期三',
      4: '星期四',
      5: '星期五',
      6: '星期六',
    };
    this.currentDay = [
      moment(`${moment().format('YYYY-MM-DD')} 00:00:00`).valueOf(),
      moment(`${moment().format('YYYY-MM-DD')} 23:59:59`).valueOf(),
    ];

    this.scale = {
      unhanledNum: {
        alias: '事件数',
      },
      score: { alias: '风险评分' },
    };
    // tickCount: 10,
  }

  // componentWillMount = () => {
  //   this.resize();
  // };

  componentDidMount = () => {
    // const { timeRange } = this.state;
    const { dispatch } = this.props;
    dispatch({ type: 'global/fetchVpcConfig' }).then(() => {
      // tce 环境，先等Config接口请求完毕，再请求数据接口
      this.refreshData();
    });
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
    });
    this.timer = setInterval(() => {
      this.setState({ realTime: moment() });
    }, 1000);
    this.refreshDataTimer = setInterval(() => {
      this.refreshData();
    }, 180000);
    // this.refreshData();
  };

  componentWillUnmount = () => {
    clearInterval(this.timer);
    clearInterval(this.refreshDataTimer);
  };

  refreshData = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'safetyAware/fetchEventMapData' });
    dispatch({ type: 'safetyAware/fetchRealTimeOverall' });
    dispatch({ type: 'safetyAware/fetchEventDistribution' });
    dispatch({ type: 'safetyAware/fetchAttackList' });
    dispatch({ type: 'safetyAware/fetchAssetScoreDistribute' });
  };

  getTrendFlag = (number) => {
    switch (true) {
      case number > 0:
        return 'up';
      case number < 0:
        return 'down';
      default:
        return '';
    }
  };

  // 安全事件根本 按攻击意图
  timeDrill = (startTime, endTime) => {
    history.push({
      pathname: `/event/safeEvent/alarm`,
      query: {
        startTime,
        endTime,
        // status: '',
      },
    });
  };

  onbrushend = (chart, ev) => {
    // console.log('ev', ev);
    const { data } = ev;
    if (data && data.length > 0) {
      const { type } = data[0];
      const timeArr = [];
      data.forEach((item) => {
        if (item.type === type) {
          timeArr.push(item.time);
        }
      });
      timeArr.sort();
      const timeRange = 10800000;
      this.timeDrill(timeArr[0], timeArr[timeArr.length - 1] + timeRange);
    }
  };

  plotclick = () => {
    const key = this.activeKey;
    const timeRange = 10800000;
    this.timeDrill(key, key + timeRange);
  };

  resize() {
    // const attactHt = parseInt(window.getComputedStyle(this.attack, null).getPropertyValue('height'), 10);
    // const cardHt = parseInt(window.getComputedStyle(this.card, null).getPropertyValue('height'), 10);
    // const heatHt = parseInt(window.getComputedStyle(this.heat, null).getPropertyValue('height'), 10);
    // const pointHt = parseInt(window.getComputedStyle(this.ponit, null).getPropertyValue('height'), 10);
    // console.log('height', cardHt, heatHt);
    // this.setState({
    //   attactHeight: parseInt((attactHt * 300) / 384, 10),
    //   cardHeight: parseInt((cardHt * 65) / 242, 10),
    //   heatHeight: parseInt((heatHt * 210) / 242, 10),
    //   pointHeight: parseInt((pointHt * 300) / 384, 10),
    // });
    const { clientWidth } = document.documentElement;
    const { clientHeight } = document.documentElement;
    console.log('clientWidth', clientWidth, 'clientHeight', clientHeight);
    let scalex = 1;
    let scaley = 1;
    let style = {};
    if (clientWidth < 1920 || clientHeight < 1080) {
      scalex = clientWidth / 1920;
      scaley = clientHeight / 1080;
      style = {
        transform: `scale(${scalex},${scaley})`,
        transformOrigin: '0 0',
      };
    } else {
      style = {
        transform: 'none',
        transformOrigin: 'center center',
      };
    }

    this.setState({ extraStyles: style });
  }

  render() {
    const {
      safetyAware: { overall, eventDistributionList, attackInfoList, scoreDistribute, mapModel },
      hasVpc,
      isKVM,
      loading,
      hasVpcLoading,
    } = this.props;
    console.log('has', hasVpc);
    const {
      realTime,
      // attactHeight, cardHeight, heatHeight, pointHeight,
      extraStyles,
    } = this.state;
    // style={extraStyles}
    const { typeList, list: chartDataList } = eventDistributionList;
    const attackInfoListData = attackInfoList[0] ? attackInfoList[0].aggs : [];
    const chartCardFootStyle = { borderTop: '1px solid #2B2B47', color: '#8F909E' };
    const yuanDivStyle = { color: '#fff', fontSize: 36, marginTop: -6 };

    // console.log(1, "typeList==", typeList, "chartDataList==", chartDataList);
    // style={extraStyles}
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {hasVpcLoading ? (
          <Spin />
        ) : (
          <div className={styles.container} style={extraStyles}>
            <div className={styles.header}>
              <span className={styles.headerTitle}>腾讯安全态势感知</span>
              <div className={styles.headerLogo}>
                <img src={logoImg} alt="logo" />
              </div>
              <div className={styles.headerTimer}>
                <div className={styles.time}>{realTime.format('HH:mm:ss')}</div>
                <div className={styles.dateCon}>
                  <span className={styles.datestr}>{realTime.format('YYYY/MM/DD')}</span>
                  <span className={styles.weekstr}>{this.weekDayMap[realTime.day()]}</span>
                </div>
              </div>
            </div>
            <div className={styles.innerContent}>
              <div className={styles.sideWrapper}>
                <div
                  className={styles.contentBlock}
                  ref={(el) => {
                    this.attack = el;
                  }}
                >
                  <div className={styles.title}>攻击事件画像(近24小时)</div>
                  <div className={styles.content}>
                    <PolarHeat
                      data={attackInfoListData}
                      geomColor={['count', '#2D3C82-#384EAB-#5075FF']}
                      geomStyle={{ stroke: '#161630', lineWidth: 1 }}
                      timeLabel={{ textStyle: { fill: '#8F909E', textAlign: 'center' } }}
                      padding={[65, 0]}
                      height={300}
                      // height={attactHeight}
                    />
                  </div>
                </div>
                <div
                  className={styles.contentBlock}
                  ref={(el) => {
                    this.card = el;
                  }}
                >
                  <div className={styles.title}>今日新增受影响资产数</div>
                  <div className={styles.content}>
                    <ChartCard
                      bordered={false}
                      style={{ background: '#16162F' }}
                      // title="今日新增受影响资产数"
                      loading={loading}
                      total={() => (
                        // <Link to="/event/propertyRisk?sort=latestTimestamp&dir=desc">
                        <div style={yuanDivStyle}>
                          <Yuan>{overall.asset.todayNum}</Yuan>
                        </div>
                        // </Link>
                      )}
                      footer={
                        <Field
                          label="近30天平均数量"
                          valueStyle={{ color: '#8F909E' }}
                          value={`${numeral(overall.asset.thirtyAvg).format('0,0')}`}
                        />
                      }
                      footStyle={chartCardFootStyle}
                      contentHeight={65}
                      // contentHeight={cardHeight}
                    >
                      <Trend
                        flag={this.getTrendFlag(overall.asset.diff)}
                        style={{ marginRight: 16 }}
                      >
                        <span style={{ marginRight: 14, color: '#8F909E' }}>相比昨日</span>
                        <span
                          style={
                            this.getTrendFlag(overall.asset.diff) === 'up'
                              ? { color: '#F5222D' }
                              : { color: '#52C41A' }
                          }
                          className={styles.trendText}
                        >
                          {numeral(overall.asset.diff).format('0,0')}
                        </span>
                      </Trend>
                    </ChartCard>
                  </div>
                </div>
                <div className={styles.contentBlock}>
                  <div className={styles.title}>今日新增安全事件数</div>
                  <div className={styles.content}>
                    <ChartCard
                      bordered={false}
                      style={{ background: '#16162F' }}
                      // title="今日新增安全事件数"
                      loading={loading}
                      total={() => (
                        // <Link to={`/event/safeEvent/alarm?status=&startTime=${this.currentDay[0]}&endTime=${this.currentDay[1]}`}>
                        <div style={yuanDivStyle}>
                          <Yuan>{overall.event.todayNum}</Yuan>
                        </div>
                        // </Link>
                      )}
                      footer={
                        <Field
                          label="近30天平均数量"
                          valueStyle={{ color: '#8F909E' }}
                          value={`${numeral(overall.event.thirtyAvg).format('0,0')}`}
                        />
                      }
                      footStyle={chartCardFootStyle}
                      contentHeight={65}
                      // contentHeight={cardHeight}
                    >
                      <Trend
                        flag={this.getTrendFlag(overall.event.diff)}
                        style={{ marginRight: 16 }}
                      >
                        <span style={{ marginRight: 14, color: '#8F909E' }}>相比昨日</span>
                        <span
                          style={
                            this.getTrendFlag(overall.event.diff) === 'up'
                              ? { color: '#F5222D' }
                              : { color: '#52C41A' }
                          }
                          className={styles.trendText}
                        >
                          {numeral(overall.event.diff).format('0,0')}
                        </span>
                      </Trend>
                    </ChartCard>
                  </div>
                </div>
              </div>
              <div className={styles.centerWrapper}>
                <div className={styles.mapBlock}>
                  <FlylineMap model={mapModel} />
                </div>
                <div
                  className={styles.attackBlock}
                  ref={(el) => {
                    this.heat = el;
                  }}
                >
                  <div className={styles.title}>安全事件分布（按攻击意图）</div>
                  <div className={styles.content}>
                    <Heat
                      data={chartDataList}
                      typeList={typeList}
                      height={210}
                      // height={heatHeight}
                      padding={[18, 60, 40, 120]}
                      geomColor={['eventNum', '#16162F-#2D3C82-#5075FF']}
                      geomStyle={{ lineWidth: 1, stroke: '#2B2B47' }}
                      xAxisGridStyle={{ lineStyle: { lineWidth: 0, lineDash: null } }}
                      yAxisGridStyle={{ lineStyle: { lineWidth: 0, lineDash: null } }}
                      xAxisLabel={{ textStyle: { fill: '#8F909E' } }}
                      yAxisLabel={{ textStyle: { fill: '#8F909E' } }}
                      brushend={this.onbrushend}
                      polygonMouseEnter={(chart, ev) => {
                        if (ev.data) this.activeKey = ev.data._origin.time;
                      }}
                      // plotclick={this.plotclick}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.sideWrapper}>
                <div
                  className={styles.contentBlock}
                  ref={(el) => {
                    this.ponit = el;
                  }}
                >
                  <div className={styles.title}>资产风险</div>
                  <div className={styles.content}>
                    <PointChart
                      customScales={this.scale}
                      data={scoreDistribute}
                      height={300}
                      // height={pointHeight}
                      padding={[42, 20, 50, 50]}
                      filterField="score"
                      xTitleShow
                      yTitleShow
                      xTitle={{
                        autoRotate: true,
                        offset: 35,
                        textStyle: {
                          fontSize: '14',
                          textAlign: 'center',
                          fill: '#666',
                        },
                        position: 'center',
                      }}
                      yTitle={{
                        autoRotate: true,
                        offset: 45,
                        textStyle: {
                          fontSize: '14',
                          textAlign: 'center',
                          fill: '#666',
                        },
                        position: 'center',
                      }}
                      xAxisLine={{ stroke: '#2B2B47', lineWidth: 1 }}
                      xAxisTickLine={null}
                      xAxisLabel={{ textStyle: { fill: '#8F909E' } }}
                      yAxisLabel={{ textStyle: { fill: '#8F909E' } }}
                      yAxisGrid={{ lineStyle: { stroke: '#2B2B47', lineDash: null } }}
                      // onFilter={this.onFilter}
                      // fetchFilter={this.fetchFilter}
                      xAxisName={scoreDistribute.length === 0 ? '风险评分' : 'score'}
                      yAxisName={scoreDistribute.length === 0 ? '事件数' : 'unhanledNum'}
                      xtitleOffset={10}
                      ytitleOffset={10}
                      size={['unhanledNum']}
                      itemTpl='<li data-index={index} style="margin-bottom:4px">{value}</li>'
                      // TooltipTitle="Fasset_name"
                      // tooltip={[
                      //   'Fasset_name*Fip*score*unhanledNum',
                      //   (Fasset_name, Fip, score, unhanledNum) => ({
                      //     title: Fasset_name || Fip || '',
                      //     value: `风险评分：${
                      //       score // 化圆圈
                      //     }<br /> 事件数:${unhanledNum}`,
                      //   }),
                      // ]}
                      tooltip={
                        hasVpc
                          ? [
                              'Fasset_name*Fip*Fvpcid*score*unhanledNum',
                              (Fasset_name, Fip, Fvpcid, score, unhanledNum) => ({
                                title: Fasset_name || Fip || '',
                                value: `VPCID：${Fvpcid === '0' ? '' : Fvpcid}<br />风险评分：${
                                  score // 化圆圈
                                }<br /> 事件数:${unhanledNum}`,
                              }),
                            ]
                          : [
                              'Fasset_name*Fip*score*unhanledNum',
                              (Fasset_name, Fip, score, unhanledNum) => ({
                                title: Fasset_name || Fip || '',
                                value: `风险评分：${
                                  score // 化圆圈
                                }<br /> 事件数:${unhanledNum}`,
                              }),
                            ]
                      }
                    />
                  </div>
                </div>
                {!isKVM && (
                  <div className={styles.contentBlock}>
                    <div className={styles.title}>今日沙箱分析文件数</div>
                    <div className={styles.content}>
                      <ChartCard
                        bordered={false}
                        style={{ background: '#16162F' }}
                        // title="今日沙箱分析文件数"
                        loading={loading}
                        total={() => (
                          <div style={yuanDivStyle}>
                            <Yuan>{overall.file.todayNum}</Yuan>
                          </div>
                        )}
                        footer={
                          <Field
                            label="近30天平均数量"
                            valueStyle={{ color: '#8F909E' }}
                            value={`${numeral(overall.file.thirtyAvg).format('0,0')}`}
                          />
                        }
                        footStyle={chartCardFootStyle}
                        contentHeight={65}
                        // contentHeight={cardHeight}
                      >
                        <MiniBar data={overall.file.trend} color="#26D8A3" />
                      </ChartCard>
                    </div>
                  </div>
                )}
                <div className={styles.contentBlock}>
                  <div className={styles.title}>今日采集流量日志数</div>
                  <div className={styles.content}>
                    <ChartCard
                      bordered={false}
                      style={{ background: '#16162F' }}
                      // title="今日采集流量日志数"
                      loading={loading}
                      total={() => (
                        <Link
                          to={`/analysis/search?startTime=${this.currentDay[0]}&endTime=${this.currentDay[1]}&type=flow`}
                        >
                          <div style={yuanDivStyle}>
                            <Yuan>{overall.log.todayNum}</Yuan>
                          </div>
                        </Link>
                      )}
                      footer={
                        <Field
                          label="近30天平均数量"
                          valueStyle={{ color: '#8F909E' }}
                          value={`${numeral(overall.log.thirtyAvg).format('0,0')}`}
                        />
                      }
                      footStyle={chartCardFootStyle}
                      contentHeight={65}
                      // contentHeight={cardHeight}
                    >
                      <MiniArea color="#5075FF" data={overall.log.trend} showTooltip={false} />
                    </ChartCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default SafetyAware;
