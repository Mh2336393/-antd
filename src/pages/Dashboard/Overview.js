/*
 * @Author: finazhang
 * @Date: 2018-12-29 11:27:45
 * @Last Modified by:   finazhang
 * @Last Modified time: 2018-12-29 11:27:45
 */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-target-blank */

import React, { Component } from 'react';
import { connect } from 'umi';
import { Row, Col, Table, Card, Radio, Tooltip, Popover } from 'antd';
import {
  ChartCard,
  MiniArea,
  MiniBar,
  Field,
  Pie,
  LineChart,
  Heat,
  PointChart,
} from '@/components/Charts';
import numeral from 'numeral';
import Trend from '@/components/Trend';
// import PageHeaderWrapper from '@/components/PageHeaderWrapper/';
import { Link } from 'umi';
import moment from 'moment';
import { history } from 'umi';
import styles from './Overview.less';
import Yuan from '@/utils/Yuan';
import configSettings from '../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
/* eslint no-underscore-dangle: ["error", { "allow": ["_origin"] }] */

@connect(({ global, dashboardOverview, iocDetail, loading }) => ({
  dashboardOverview,
  iocDetail,
  hasVpc: global.hasVpc,
  isKVM: global.isKVM,
  // loading0: loading.effects['dashboardOverview/fetchRealTimeOverall'],
  loading1: loading.effects['dashboardOverview/fetchEventDistribution'],
  loading2: loading.effects['dashboardOverview/fetchEventWithScoreOrder'],
  loading3: loading.effects['dashboardOverview/fetchEventWithAssetOrder'],
  loading4: loading.effects['dashboardOverview/fetchEventCategory2Num'],
  loading5: loading.effects['dashboardOverview/fetchEventTrend'],
  loading6: loading.effects['dashboardOverview/fetchEventIocTop'],
  loading7: loading.effects['dashboardOverview/fetchSandboxFileType'],
  loading8: loading.effects['iocDetail/fetchIoctagsDesc'],
}))
class DashboardOverview extends Component {
  constructor(props) {
    super(props);
    this.riskAuth = getAuth('/event/propertyRisk');
    this.alarmAuth = getAuth('/event/safeEvent/alarm');
    this.fileAuth = getAuth('/event/safeEvent/alarmFile');
    this.fallAuth = getAuth('/event/safeEvent/alarmIoc');
    this.alertAuth = getAuth('/event/safeEvent/alarmAlert');
    this.searchAuth = getAuth('/analysis/search');
    this.state = {
      eventType: { category_1: '入侵感知' },
      eventTrend: { timeRange: 1 },
    };
    this.activeKey = 0;
    this.activeType = '外部侦查';
    this.currentDay = [
      moment(`${moment().format('YYYY-MM-DD')} 00:00:00`).valueOf(),
      moment(`${moment().format('YYYY-MM-DD')} 23:59:59`).valueOf(),
    ];
    this.eventScoreColumns = [
      {
        title: '事件评分',
        dataIndex: 'score',
        key: 'score',
        width: 140,
        render: (text) => (
          <span style={{ color: configSettings.scoreColorMap(text).color }}>
            {text}（{configSettings.scoreColorMap(text).label}）
          </span>
        ),
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        key: 'name',
        width: 220,
        render: (text, record) => {
          const pagePath = configSettings.getEventDetailRoute(record.category_1);
          let linkTrue = false;
          if (pagePath === '/event/safeEvent/alarmAlert') {
            linkTrue = this.alertAuth.indexOf('r') > -1;
          }
          if (pagePath === '/event/safeEvent/alarmIoc') {
            linkTrue = this.fallAuth.indexOf('r') > -1;
          }
          if (pagePath === '/event/safeEvent/alarmFile') {
            linkTrue = this.fileAuth.indexOf('r') > -1;
          }
          if (linkTrue) {
            return (
              <span
                style={{ display: 'inline-block', maxWidth: 220 }}
                className="ellipsis"
                title={text}
              >
                <Link
                  target="blank"
                  to={`${pagePath}?id=${record.id}&tsOldest=${record.tsOldest}&tsLatest=${record.tsLatest}`}
                >
                  {text}
                </Link>
              </span>
            );
          }
          return (
            <span
              style={{ display: 'inline-block', maxWidth: 220 }}
              className="ellipsis"
              title={text}
            >
              {text}
            </span>
          );
        },
      },
      {
        title: '攻击意图',
        dataIndex: 'attackStage',
        key: 'attackStage',
        width: 150,
        render: (text) => {
          const { color, bgColor, borderColor } = configSettings.attackStageMap(text);
          return (
            <span
              style={{
                padding: '2px 10px',
                color,
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
              }}
            >
              {text}
            </span>
          );
        },
      },
    ];
    this.eventAssetColumns = [
      {
        title: '异常评分',
        dataIndex: 'assetScore',
        key: 'assetScore',
        render: (text) => (
          <span
            style={{ display: 'inline-block', color: configSettings.scoreColorMap(text).color }}
            className="ellipsis"
          >
            {text}（{configSettings.scoreColorMap(text).label}）
          </span>
        ),
      },
      {
        title: '受影响资产',
        dataIndex: 'assetName',
        key: 'assetName',
        render: (text, record) => <span>{text ? `${text}(${record.ip})` : `${record.ip}`}</span>,
      },
      {
        title: '未处理事件数',
        dataIndex: 'eventNum',
        key: 'eventNum',
        render: (text, record) => {
          if (this.alarmAuth.indexOf('r') > -1) {
            return (
              <Link
                to={`/event/safeEvent/alarm?affectedAssets.ip=${
                  record.ip
                }&startTime=${moment()
                  .subtract(90, 'days')
                  .valueOf()}&endTime=${moment().valueOf()}&status=unhandled`}
                target="blank"
              >
                {text}
              </Link>
            );
          }
          return text;
        },
      },
    ];
    this.iocColumns = [
      {
        title: '失陷指标',
        dataIndex: 'name',
        key: 'name',
        width: 220,
        render: (text) => (
          <span
            style={{ display: 'inline-block', maxWidth: 220 }}
            className="ellipsis"
            title={text}
          >
            {text}
          </span>
        ),
      },
      {
        title: '分类',
        dataIndex: 'iocLevel1Tags',
        key: 'iocLevel1Tags',
        render: (text) => {
          if (!text) return <span />;
          const popContent = (
            <div>
              {text.map((item) => (
                <p key={item}>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          );
          return (
            <div>
              {text.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft" title="分类">
                  <div>
                    多个(
                    <span className="fontBlue">{text.length}</span>)
                  </div>
                </Popover>
              ) : (
                <div>{text[0] ? <span>{text[0]}</span> : ''}</div>
              )}
            </div>
          );
        },
      },
      {
        title: '标签',
        dataIndex: 'iocTags',
        key: 'iocTags',
        width: 140,
        render: (text) => {
          if (!text || text.length === 0) return <span />;
          const {
            iocDetail: { tagsDesc },
          } = this.props;
          if (text.length === 1) {
            const txt = text[0];
            if (tagsDesc[txt]) {
              const tagMoreLink1 = `https://eti.qq.com/query/family/${txt}`;
              const content = (
                <div className={styles.popoverCxt}>
                  <p>{tagsDesc[txt]}</p>
                  <p style={{ textAlign: 'right' }}>
                    <a href={tagMoreLink1} target="_blank">
                      更多信息
                    </a>
                  </p>
                </div>
              );
              return (
                <Tooltip title={content} trigger="hover" placement="bottomLeft">
                  <span className={styles.iocTagLink}>{txt}</span>
                </Tooltip>
              );
            }
            return <div>{txt ? <span className={styles.iocTag}>{txt}</span> : ''}</div>;
          }

          const popContent = (
            <div>
              {text.map((tag) => {
                if (tagsDesc[tag]) {
                  const tagMoreLink2 = `https://eti.qq.com/query/family/${tag}`;
                  const content = (
                    <div className={styles.popoverCxt}>
                      <p>{tagsDesc[tag]}</p>
                      <p style={{ textAlign: 'right' }}>
                        <a href={tagMoreLink2} target="_blank">
                          更多信息
                        </a>
                      </p>
                    </div>
                  );
                  return (
                    <p key={tag}>
                      <Tooltip title={content} trigger="hover" placement="bottomLeft">
                        <span className={styles.iocTagLink}>{tag}</span>
                      </Tooltip>
                    </p>
                  );
                }
                return <p key={tag}>{tag ? <span className={styles.iocTag}>{tag}</span> : ''}</p>;
              })}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              <Popover
                content={popContent}
                getPopupContainer={(triggerNode) => triggerNode}
                placement="bottomLeft"
                title="标签"
              >
                <div>
                  多个(
                  <span className="fontBlue">{text.length}</span>)
                </div>
              </Popover>
            </div>
          );
        },
      },
      { title: '受影响资产数', dataIndex: 'doc_count', key: 'doc_count' },
    ];
    if (props.hasVpc) {
      this.eventAssetColumns.splice(1, 0, {
        title: 'VPCID',
        dataIndex: 'vpcid',
        key: 'vpcid',
        width: 120,
      });
    }
    this.scale = {
      unhanledNum: {
        alias: '事件数',
      },
      score: { alias: '异常评分' },
    };
    // tickCount: 10,
  }

  componentDidMount() {
    const { dispatch, isKVM } = this.props;
    const { eventTrend, eventType } = this.state;
    dispatch({ type: 'iocDetail/fetchIoctagsDesc' });
    // dispatch({ type: 'dashboardOverview/fetchRealTimeOverall' });
    dispatch({ type: 'dashboardOverview/fetchRealTimeOverallAsset' });
    dispatch({ type: 'dashboardOverview/fetchRealTimeOverallEvent' });

    dispatch({ type: 'dashboardOverview/fetchRealTimeOverallLog' });
    dispatch({ type: 'dashboardOverview/fetchRealTimeOverallLogPic' });
    dispatch({ type: 'dashboardOverview/fetchEventDistribution' });
    dispatch({ type: 'dashboardOverview/fetchEventWithScoreOrder' });
    dispatch({ type: 'dashboardOverview/fetchEventWithAssetOrder' });
    dispatch({ type: 'dashboardOverview/fetchEventCategory2Num', payload: eventType });
    dispatch({ type: 'dashboardOverview/fetchEventTrend', payload: eventTrend });
    dispatch({ type: 'dashboardOverview/fetchEventIocTop' });

    if (!isKVM) {
      dispatch({ type: 'dashboardOverview/fetchRealTimeOverallFile' });
      dispatch({ type: 'dashboardOverview/fetchSandboxFileType' });
    }
    dispatch({
      type: 'dashboardOverview/fetchAssetScoreDistribute',
      payload: {
        startTime: moment().subtract(1, 'day').valueOf(),
        endTime: moment().valueOf(),
        Fcategory: -1,
      },
    });
  }

  handleChangeEventType = (e) => {
    const { dispatch } = this.props;
    this.setState({ eventType: { category_1: e.target.value } });
    dispatch({
      type: 'dashboardOverview/fetchEventCategory2Num',
      payload: { category_1: e.target.value },
    });
  };

  eventlegendOnclick = (value) => {
    const { eventType } = this.state;
    let path;
    if (eventType.category_1 === '入侵感知') {
      path = 'alarmAlert';
    } else {
      path = 'alarmFile';
    }
    const pagePath = `/event/safeEvent/${path}`;
    let linkTrue = false;
    if (pagePath === '/event/safeEvent/alarmAlert') {
      linkTrue = this.alertAuth.indexOf('r') > -1;
    }
    if (pagePath === '/event/safeEvent/alarmIoc') {
      linkTrue = this.fallAuth.indexOf('r') > -1;
    }
    if (pagePath === '/event/safeEvent/alarmFile') {
      linkTrue = this.fileAuth.indexOf('r') > -1;
    }
    if (linkTrue) {
      history.push({
        pathname: pagePath,
        query: {
          startTime: moment().subtract(1, 'day').valueOf(),
          endTime: moment().valueOf(),
          category_2: value,
          // status: '',
        },
      });
    }
  };

  sandBoxlegendOnclick = (value) => {
    if (this.fileAuth.indexOf('r') > -1) {
      history.push({
        pathname: '/event/safeEvent/alarmFile',
        query: {
          startTime: moment().subtract(7, 'day').valueOf(),
          endTime: moment().valueOf(),
          category_2: value,
        },
      });
    }
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

  // 事件趋势onchange
  handleChangeEventTrend = (e) => {
    const { dispatch } = this.props;
    this.setState({ eventTrend: { timeRange: e.target.value } });
    dispatch({ type: 'dashboardOverview/fetchEventTrend', payload: { timeRange: e.target.value } });
  };

  timeDrill = (startTime, endTime) => {
    const type = this.activeType;
    if (this.alarmAuth.indexOf('r') > -1) {
      history.push({
        pathname: `/event/safeEvent/alarm`,
        query: {
          startTime,
          endTime,
          // status: '',
          attackStage: type,
        },
      });
    }
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

  toLink = (data) => {
    if (this.riskAuth.indexOf('r') > -1) {
      window.open(`/event/propertyRisk?search=${data.Fip}`, '_blank');
    }
  };

  render() {
    const {
      dashboardOverview: {
        // overall,
        overallAsset,
        overallEvent,
        overallFile,
        overallLog,
        overallLogTrend,
        eventWithAssetList,
        eventWithScoreList,
        eventCategoryList,
        sandboxFileTypeList,
        eventIocTopList,
        eventTrendDataList,
        eventDistributionList,
        scoreDistribute,
        todaySearchFile: tSFile,
      },
      hasVpc,
      isKVM,
      loading,
    } = this.props;
    const spanNum = isKVM ? 8 : 6;
    // console.log('总览', scoreDistribute);
    const { typeList, list: chartDataList } = eventDistributionList;
    const { eventType, eventTrend } = this.state;
    const riskLinkTrue = this.riskAuth.indexOf('r') > -1;
    const alarmLinkTrue = this.alarmAuth.indexOf('r') > -1;
    const searchLinkTrue = this.searchAuth.indexOf('r') > -1;

    return (
      <div>
        <div className="commonHeader">安全总览</div>
        {/* <PageHeaderWrapper> */}
        <div style={{ padding: 12 }}>
          <div className={styles.overall}>
            <Row gutter={24}>
              <Col span={spanNum} style={{ minWidth: '214px' }}>
                <ChartCard
                  bordered={false}
                  title="今日新增受影响资产数"
                  loading={loading}
                  total={() => {
                    if (riskLinkTrue) {
                      return (
                        <Link to="/event/propertyRisk?sort=latestTimestamp&dir=desc">
                          <Yuan>{overallAsset.todayNum}</Yuan>
                        </Link>
                      );
                    }
                    return <Yuan>{overallAsset.todayNum}</Yuan>;
                  }}
                  footer={
                    <Field
                      label="近30天平均数量"
                      value={`${numeral(overallAsset.thirtyAvg).format('0,0')}`}
                    />
                  }
                  contentHeight={46}
                >
                  <Trend flag={this.getTrendFlag(overallAsset.diff)} style={{ marginRight: 16 }}>
                    <span style={{ marginRight: 14 }}>相比昨日</span>
                    <span className={styles.trendText}>
                      {numeral(overallAsset.diff).format('0,0')}
                    </span>
                  </Trend>
                </ChartCard>
              </Col>
              <Col span={spanNum} style={{ minWidth: '214px' }}>
                <ChartCard
                  bordered={false}
                  title="今日新增安全事件数"
                  loading={loading}
                  total={() => {
                    if (alarmLinkTrue) {
                      return (
                        <Link
                          to={`/event/safeEvent/alarm?startTime=${this.currentDay[0]}&endTime=${this.currentDay[1]}`}
                        >
                          <Yuan>{overallEvent.todayNum}</Yuan>
                        </Link>
                      );
                    }
                    return <Yuan>{overallEvent.todayNum}</Yuan>;
                  }}
                  footer={
                    <Field
                      label="近30天平均数量"
                      value={`${numeral(overallEvent.thirtyAvg).format('0,0')}`}
                    />
                  }
                  contentHeight={46}
                >
                  <Trend flag={this.getTrendFlag(overallEvent.diff)} style={{ marginRight: 16 }}>
                    <span style={{ marginRight: 14 }}>相比昨日</span>
                    <span className={styles.trendText}>
                      {numeral(overallEvent.diff).format('0,0')}
                    </span>
                  </Trend>
                </ChartCard>
              </Col>
              {!isKVM && (
                <Col span={spanNum} style={{ minWidth: '214px' }}>
                  <ChartCard
                    bordered={false}
                    title="今日沙箱分析文件数"
                    loading={loading}
                    total={() => {
                      if (searchLinkTrue) {
                        return (
                          <Link
                            to={`/analysis/search?startTime=${tSFile.startTime}&endTime=${tSFile.endTime}&type=fileinfo&condition=event_type:fileinfo${tSFile.hostSearch}`}
                          >
                            <Yuan>{overallFile.todayNum}</Yuan>
                          </Link>
                        );
                      }
                      return <Yuan>{overallFile.todayNum}</Yuan>;
                    }}
                    footer={
                      <Field
                        label="近30天平均数量"
                        value={`${numeral(overallFile.thirtyAvg).format('0,0')}`}
                      />
                    }
                    contentHeight={46}
                  >
                    <MiniBar data={overallFile.trend} />
                  </ChartCard>
                </Col>
              )}
              <Col span={spanNum} style={{ minWidth: '214px' }}>
                <ChartCard
                  bordered={false}
                  title="今日采集流量日志数"
                  loading={loading}
                  total={() => {
                    if (searchLinkTrue) {
                      return (
                        <Link
                          to={`/analysis/search?startTime=${this.currentDay[0]}&endTime=${this.currentDay[1]}&type=flow`}
                        >
                          <Yuan>{overallLog.todayNum}</Yuan>
                        </Link>
                      );
                    }
                    return <Yuan>{overallLog.todayNum}</Yuan>;
                  }}
                  footer={
                    <Field
                      label="近30天平均数量"
                      value={`${numeral(overallLog.thirtyAvg).format('0,0')}`}
                    />
                  }
                  contentHeight={46}
                >
                  <MiniArea color="#975FE4" data={overallLogTrend} showTooltip={false} />
                </ChartCard>
              </Col>
            </Row>
          </div>
          <div className={styles.chart}>
            <p className={styles.chartTitle}>安全事件分类(按攻击意图，近24小时)</p>
            <Heat
              data={chartDataList}
              typeList={typeList}
              height={250}
              brushend={this.onbrushend}
              polygonMouseEnter={(chart, ev) => {
                if (ev.data) {
                  this.activeKey = ev.data._origin.time;
                  this.activeType = ev.data._origin.type;
                }
              }}
              plotclick={this.plotclick}
            />
          </div>
          <div className={styles.rowBlock}>
            <Row gutter={16}>
              <Col span={12}>
                <div className={styles.tableBlock} style={{ paddingBottom: 0, minHeight: 344 }}>
                  <p className={styles.blockTitle}>评分最高安全事件Top 5 (近24小时)</p>
                  <Table
                    rowKey={(record) => record.index}
                    size="small"
                    dataSource={eventWithScoreList}
                    columns={this.eventScoreColumns}
                    pagination={false}
                  />
                  <div className={styles.showMore}>
                    {alarmLinkTrue && (
                      <Link
                        to={`/event/safeEvent/alarm?startTime=${moment()
                          .subtract(1, 'day')
                          .valueOf()}&endTime=${moment().valueOf()}&status=unhandled&sort=score&dir=desc
                          `}
                      >
                        查看全部
                      </Link>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.tableBlock} style={{ paddingBottom: 0, minHeight: 344 }}>
                  <p className={styles.blockTitle}>风险最高的资产 TOP5</p>
                  <Table
                    rowKey={(record) => record.index}
                    size="small"
                    dataSource={eventWithAssetList}
                    columns={this.eventAssetColumns}
                    pagination={false}
                  />
                  <div className={styles.showMore}>
                    {riskLinkTrue && <Link to="/event/propertyRisk">查看全部</Link>}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <div className={styles.rowBlock}>
            <Row gutter={16}>
              <Col span={12}>
                <div className={styles.tableBlock} style={{ paddingBottom: 0 }}>
                  <Card
                    loading={loading}
                    className={styles.salesCard}
                    bordered={false}
                    title="安全事件分类 (近24小时)"
                    bodyStyle={{ padding: 24 }}
                    extra={
                      <div>
                        <Radio.Group
                          value={eventType.category_1}
                          onChange={this.handleChangeEventType}
                        >
                          <Radio.Button value="入侵感知">入侵感知</Radio.Button>
                          {!isKVM && <Radio.Button value="异常文件感知">异常文件感知</Radio.Button>}
                        </Radio.Group>
                      </div>
                    }
                    style={{ minHeight: 440 }}
                  >
                    <Pie
                      hasLegend
                      subTitle="事件数"
                      total={() => (
                        <Yuan>{eventCategoryList.reduce((pre, now) => now.y + pre, 0)}</Yuan>
                      )}
                      data={eventCategoryList}
                      valueFormat={(value) => numeral(value).format('0,0')}
                      height={248}
                      lineWidth={4}
                      legendOnclick={this.eventlegendOnclick}
                      itemTpl='<li data-index={index} style="margin-bottom:4px;">
                        <p style="margin-bottom:0;">
                          <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
                          {num}
                        </p>
                        <p style="margin-bottom:0;">
                        <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
                        {percent}
                        </p>
                        </li>'
                      geoTootip={[
                        'y*percent',
                        (y, p) => ({ num: `数量:${y}`, percent: `占比: ${(p * 100).toFixed(2)}%` }),
                      ]}
                    />
                  </Card>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.tableBlock} style={{ paddingBottom: 0 }}>
                  <Card
                    loading={loading}
                    className={styles.salesCard}
                    bordered={false}
                    title="安全事件趋势"
                    bodyStyle={{ padding: 24 }}
                    extra={
                      <div>
                        <Radio.Group
                          value={eventTrend.timeRange}
                          onChange={this.handleChangeEventTrend}
                        >
                          <Radio.Button value={1}>24h</Radio.Button>
                          <Radio.Button value={7}>7天</Radio.Button>
                          <Radio.Button value={15}>15天</Radio.Button>
                          <Radio.Button value={30}>30天</Radio.Button>
                        </Radio.Group>
                      </div>
                    }
                    style={{ minHeight: 440 }}
                  >
                    <LineChart
                      hasLegend={false}
                      scale={{ value: { alias: '事件数' } }}
                      data={eventTrendDataList}
                      height={248}
                      color="#26d8a3"
                    />
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
          <div className={styles.chart}>
            <p className={styles.chartTitle}>风险资产(近24小时)</p>
            <PointChart
              customScales={this.scale}
              data={scoreDistribute}
              height={300}
              toLink={this.toLink}
              filterField="score"
              onFilter={this.onFilter}
              fetchFilter={this.fetchFilter}
              xAxisName={scoreDistribute.length === 0 ? '风险评分' : 'score'}
              yAxisName={scoreDistribute.length === 0 ? '事件数' : 'unhanledNum'}
              // ytitleOffset={80}
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
                offset: 80,
                textStyle: {
                  fontSize: '14',
                  textAlign: 'center',
                  fill: '#666',
                },
                position: 'center',
              }}
              size={['unhanledNum']}
              itemTpl='<li data-index={index} style="margin-bottom:4px">{value}</li>'
              // TooltipTitle="Fasset_name"
              tooltip={
                hasVpc
                  ? [
                      'Fasset_name*Fip*Fvpcid*score*unhanledNum',
                      (Fasset_name, Fip, Fvpcid, score, unhanledNum) => ({
                        title: Fasset_name || Fip || '',
                        value: `VPCID：${Fvpcid === '0' ? '' : Fvpcid || ''}<br />风险评分：${
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
          <div className={styles.rowBlock}>
            <Row gutter={16}>
              <Col span={12}>
                <div className={styles.tableBlock} style={{ paddingBottom: 0, minHeight: 452 }}>
                  <div style={{ paddingBottom: 0 }}>
                    <p className={styles.blockTitle}>失陷指标IOC Top5 (近24小时)</p>
                    <Table
                      rowKey={(record) => record.key}
                      size="small"
                      dataSource={eventIocTopList}
                      columns={this.iocColumns}
                      pagination={false}
                    />
                  </div>
                  <div className={styles.showMore}>
                    {this.fallAuth.indexOf('r') > -1 && (
                      <Link to="/event/safeEvent/alarmIoc">查看全部</Link>
                    )}
                  </div>
                </div>
              </Col>
              {!isKVM && (
                <Col span={12}>
                  <div className={styles.tableBlock} style={{ paddingBottom: 0 }}>
                    <Card
                      loading={loading}
                      className={styles.salesCard}
                      bordered={false}
                      title="沙箱分析文件类型 (近24小时)"
                      bodyStyle={{ padding: 24 }}
                      style={{ minHeight: 440 }}
                    >
                      <Pie
                        hasLegend
                        subTitle="数量"
                        total={() => (
                          <Yuan>{sandboxFileTypeList.reduce((pre, now) => now.y + pre, 0)}</Yuan>
                        )}
                        data={sandboxFileTypeList}
                        valueFormat={(value) => numeral(value).format('0,0')}
                        height={248}
                        lineWidth={4}
                        itemTpl='<li data-index={index} style="margin-bottom:4px;">
                          <p style="margin-bottom:0;">
                            <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
                            {num}
                          </p>
                          <p style="margin-bottom:0;">
                          <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
                          {percent}
                          </p>
                          </li>'
                        geoTootip={[
                          'y*percent',
                          (y, p) => ({
                            num: `数量:${y}`,
                            percent: `占比: ${(p * 100).toFixed(2)}%`,
                          }),
                        ]}
                      />
                    </Card>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </div>
        {/* </PageHeaderWrapper> */}
      </div>
    );
  }
}

export default DashboardOverview;
