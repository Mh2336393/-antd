// 报表总览页
import React, { Component } from 'react';
import { connect } from 'umi';
import { Table, Progress, Spin } from 'antd';
import { LineChart, CommonIntervalChart } from '@/components/Charts';
import moment from 'moment';
import configSettings from '../../../../configSettings';
import EventHandle from './EventHandle';
import styles from './index.less';

const format = 'YYYY/MM/DD';
// const formatSec = 'YYYY-MM-DD HH:mm:ss';
const formatTrd = 'YYYY年MM月DD';
const formatFth = 'YYYY-MM-DD H时';
@connect(({ global, templateFstPreview, reportApt, loading }) => ({
  global,
  reportApt,
  templateFstPreview,
  logoLoading: loading.effects['global/fetchLogoUrl'],
  hasVpcLoading: loading.effects['global/fetchVpcConfig'],
  basicLoading: loading.effects['templateFstPreview/basicCollectionResults'],
  overviewLoading: loading.effects['templateFstPreview/safetyOverviewResults'],
  perceptionLoading: loading.effects['templateFstPreview/perceptionEventResults'],
  // perceptionAttackLoading: loading.effects['templateFstPreview/perceptionEventAttackResults'],
  riskAssetsLoading: loading.effects['templateFstPreview/riskAssetsResults'],

  aptLoading0: loading.effects['reportApt/fetchEventTrend'],
  aptLoading1: loading.effects['reportApt/fetchMd5List'],
  aptLoading2: loading.effects['reportApt/fetchRiskPropertyList'],

  loading0: loading.effects['eventHandle/fetchEventHandleStatus'],
  loading1: loading.effects['eventHandle/fetchEventStatusTrend'],
  loading2: loading.effects['eventHandle/fetchEventCatagory'],
  loading3: loading.effects['eventHandle/fetchEventIocTop'],
  loading4: loading.effects['eventHandle/fetchSandboxFileType'],
  loading5: loading.effects['eventHandle/fetchEventFallTabsList'],
  loading6: loading.effects['templateFstPreview/fetchIoctagsDesc'],
}))
class ReportPreviewFst extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: 0,
      endTime: 0,
      topn: '',
      createTime: '',
      description: '',
      assetName: '',
      isLoadend: false,
      imageLoaded: false,
    };

    this.columns = [
      {
        title: '指标项',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '数值',
        dataIndex: 'total',
        key: 'total',
      },
      {
        title: '日均数量',
        dataIndex: 'dailyAvg',
        key: 'dailyAvg',
      },
    ];
    this.perceptionColumns = [
      {
        title: '事件名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '事件评分',
        dataIndex: 'score',
        key: 'score',
        width: 100,
        render: (text) => (
          <span style={{ color: configSettings.scoreColorMap(text).color }}>
            {text}（{configSettings.scoreColorMap(text).label}）
          </span>
        ),
      },
      {
        title: '数量',
        dataIndex: 'doc_count',
        key: 'doc_count',
        width: 100,
      },
      {
        title: '占比',
        dataIndex: 'percent',
        key: 'percent',
        width: 140,
        render: (text) => (
          <div style={{ paddingRight: '15px' }}>
            <Progress percent={text} size="small" status="active" />
          </div>
        ),
      },
    ];
    this.riskAssetsColumns = [
      {
        title: '异常评分',
        dataIndex: 'score',
        key: 'score',
        render: (text) => (
          <span style={{ color: configSettings.scoreColorMap(text).color }}>
            {text}（{configSettings.scoreColorMap(text).label}）
          </span>
        ),
      },
      {
        title: '受影响资产',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '未处理事件数',
        dataIndex: 'count',
        key: 'count',
      },
    ];
  }

  componentWillMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchLogoUrl',
    });
    dispatch({ type: 'global/fetchVpcConfig' }).then(() => {
      const {
        global: { hasVpc },
      } = this.props;
      console.log('hasVpc', hasVpc);
      if (hasVpc) {
        this.riskAssetsColumns.splice(1, 0, {
          title: 'VPCID',
          dataIndex: 'vpcid',
          key: 'vpcid',
          width: 120,
        });
      }
    });
  };

  componentDidMount = () => {
    console.log('Date1', new Date());
    const {
      dispatch,
      location: { query },
      global: { isKVM },
    } = this.props;
    if (query && query.id) {
      // asset过滤资产组
      dispatch({ type: 'templateFstPreview/fetchReportInfo', payload: { id: query.id } }).then(
        (json) => {
          console.log('json', json);
          if (json) {
            const { startTime, endTime, topn, asset, createTime, description, assetName } = json;
            const start = moment(startTime).valueOf();
            const end = moment(endTime).valueOf();
            const timeRange = { startTime: start, endTime: end };
            dispatch({ type: 'templateFstPreview/fetchIoctagsDesc' });
            dispatch({ type: 'templateFstPreview/basicCollectionResults', payload: timeRange });
            dispatch({
              type: 'templateFstPreview/perceptionEventResults',
              payload: { ...timeRange, topn },
            });
            // dispatch({ type: 'templateFstPreview/perceptionEventAttackResults', payload: { ...timeRange, topn: 10 } });
            dispatch({
              type: 'templateFstPreview/riskAssetsResults',
              payload: { ...timeRange, topn },
            });
            dispatch({
              type: 'templateFstPreview/safetyOverviewResults',
              payload: { ...timeRange, selectedGid: asset },
            });

            dispatch({
              type: 'eventHandle/fetchEventHandleStatus',
              payload: { startTime: start, endTime: end },
            });
            dispatch({
              type: 'eventHandle/fetchEventStatusTrend',
              payload: { startTime: start, endTime: end },
            });
            dispatch({
              type: 'eventHandle/fetchEventCatagory',
              payload: { startTime: start, endTime: end },
            });
            dispatch({
              type: 'eventHandle/fetchEventFallTabsList',
              payload: { startTime: start, endTime: end },
            });
            dispatch({
              type: 'eventHandle/fetchEventIocTop',
              payload: { startTime: start, endTime: end, topn },
            });
            if (!isKVM) {
              dispatch({
                type: 'eventHandle/fetchSandboxFileType',
                payload: { startTime: start, endTime: end },
              });
            }
            dispatch({
              type: 'reportApt/fetchEventTrend',
              payload: { startTime: start, endTime: end },
            });
            dispatch({
              type: 'reportApt/fetchMd5List',
              payload: { startTime: start, endTime: end, size: topn },
            });
            dispatch({
              type: 'reportApt/fetchRiskPropertyList',
              payload: { startTime: start, endTime: end, size: topn },
            });

            this.setState({ ...timeRange, topn, createTime, description, assetName });
          }
        }
      );
    }
  };

  // 参数 prevProps
  componentDidUpdate = () => {
    const {
      logoLoading,
      basicLoading,
      overviewLoading,
      perceptionLoading,
      riskAssetsLoading,
      loading0,
      loading1,
      loading2,
      loading3,
      loading4,
      loading5,
      aptLoading0,
      aptLoading1,
      aptLoading2,
    } = this.props;
    const { imageLoaded } = this.state;
    const loadend =
      !logoLoading &&
      !basicLoading &&
      !overviewLoading &&
      !perceptionLoading &&
      !riskAssetsLoading &&
      !loading0 &&
      !loading1 &&
      !loading2 &&
      !loading3 &&
      !loading4 &&
      !loading5 &&
      !aptLoading0 &&
      !aptLoading1 &&
      !aptLoading2 &&
      imageLoaded;
    // const loadingList = [
    //   prevProps.basicLoading,
    //   prevProps.overviewLoading,
    //   prevProps.perceptionLoading,
    //   prevProps.riskAssetsLoading,
    //   prevProps.loading0,
    //   prevProps.loading1,
    //   prevProps.loading2,
    //   prevProps.loading3,
    //   prevProps.loading4,
    //   prevProps.loading5,
    //   prevProps.aptLoading0,
    //   prevProps.aptLoading1,
    //   prevProps.aptLoading2,
    // ].filter(item => item === true);
    // if (loadend && loadingList.length === 1) {
    //   this.setState({ isLoadend: true, imageLoaded: false });
    //   console.log('Date2', new Date());
    // }

    if (loadend) {
      this.setState({ isLoadend: true, imageLoaded: false });
      console.log('Date2', new Date());
    }
  };

  getScale = (yAlais, xAlais = '日期', count = 5, key = 'key', val = 'doc_count') => ({
    [key]: {
      alias: xAlais,
      type: 'timeCat',
      formatter: (value) => moment(value).format(formatFth),
      tickCount: count,
    },
    [val]: {
      alias: yAlais,
      formatter: (value) => {
        if (value >= 10000) {
          return `${(value / 10000).toFixed(1)}w`;
        }
        return value;
      },
    },
  });

  handleImageLoaded = () => {
    this.setState({ imageLoaded: true });
  };

  render() {
    const { startTime, endTime, topn, createTime, description, assetName, isLoadend } = this.state;
    const {
      templateFstPreview: { basicCollection, safetyOverview, perceptionEventList, riskAssetsList },
      hasVpcLoading,
      global: { logoUrl },
      // reportApt: { eventTrend, md5List, assetList },
      // basicLoading,
      // overviewLoading,
      // perceptionLoading,
      // riskAssetsLoading,
    } = this.props;
    const webName = localStorage.getItem('webName');
    const titleName = webName === '高级威胁检测系统' ? '高级威胁检测系统' : webName;
    // console.log('report', this.props.reportApt);
    return (
      <div>
        {hasVpcLoading ? (
          <Spin />
        ) : (
          <div className="root">
            <div className={`${styles.yjPage} ${styles.yjFrontPage}`}>
              <div>
                {logoUrl.logo_report ? (
                  <div className={styles.frontPageLogo}>
                    <img
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                      src={logoUrl.logo_report}
                      alt="logo"
                      onLoad={this.handleImageLoaded}
                    />
                  </div>
                ) : (
                  <Spin />
                )}
              </div>
              <div className={styles.frontPageTitle}>
                <p>{titleName}</p>
                <p>综合安全态势报表</p>
              </div>
              <div className={styles.frontPageTimeRange}>
                <span className={styles.timeRangeTitle}>时间范围</span>
                <span>{startTime ? moment(startTime).format(format) : ''}</span>
                &nbsp;-&nbsp;
                <span>{endTime ? moment(endTime).format(format) : ''}</span>
              </div>
              <div className={styles.frontPageFooter}>
                <p>
                  生成时间：
                  <span>{moment(createTime).format(format)}</span>
                </p>
                <p>
                  报告描述：
                  <span>{description}</span>
                </p>
                <p>
                  包含资产组：
                  <span>{assetName}</span>
                </p>
              </div>
            </div>
            <div className={styles.yjPage}>
              <div className={styles.yiPageContent}>
                <div className={styles.pageTitle}>一、概览</div>
                <div className={styles.pageDesc}>
                  <span>{startTime ? moment(startTime).format(formatTrd) : ''}</span>至
                  <span>{endTime ? moment(endTime).format(formatTrd) : ''}</span>
                  期间，系统中主要运行指标，安全指标如下。涉及系统基础数据采集情况、基础数据采集趋势图、安全总览情况、安全事件趋势、受影响资产数。
                </div>
                <div className={styles.pageContent}>
                  <p className={styles.pageContentTitle}> 系统基础数据采集情况</p>
                  <div className={styles.pageContentWrapper}>
                    <Table
                      rowkey="name"
                      columns={this.columns}
                      dataSource={basicCollection.list}
                      pagination={false}
                    />
                  </div>
                </div>
                <div className={styles.pageContent}>
                  <p className={styles.pageContentTitle}> 系统基础数据采集趋势图</p>
                  <div className={`${styles.pageContentWrapper} ${styles.clearFloat}`}>
                    <div className={styles.sysBasicChart}>
                      {basicCollection.logTrend.length > 0 ? (
                        <LineChart
                          hasLegend={false}
                          hasArea={false}
                          hasPoint
                          title={{
                            position: 'center',
                            offset: 45,
                            textStyle: { fontSize: '13', textAlign: 'center', fill: '#666' },
                          }}
                          xAxisName="key"
                          yAxisName="doc_count"
                          scale={this.getScale('日志数', '系统采集流量日志趋势图', 3)}
                          data={basicCollection.logTrend}
                          padding={[10, 'auto', 52, 'auto']}
                          height={248}
                          color="#26d8a3"
                        />
                      ) : (
                        <span className={styles.sysBasicChartTooltip}>暂无数据</span>
                      )}
                    </div>
                    <div className={styles.sysBasicChart}>
                      {basicCollection.sandboxTrend.length > 0 ? (
                        <CommonIntervalChart
                          scale={{
                            key: { alias: '沙箱分析文件数目趋势' },
                            doc_count: { alias: '沙箱文件数' },
                          }}
                          data={basicCollection.sandboxTrend}
                          height={248}
                          color="#5075FF"
                        />
                      ) : (
                        <span className={styles.sysBasicChartTooltip}>暂无数据</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.pageContent}>
                  <p className={styles.pageContentTitle}> 安全总览情况</p>
                  <div className={styles.pageContentWrapper}>
                    <Table
                      rowkey="name" // size="small"
                      columns={this.columns}
                      dataSource={safetyOverview.list}
                      pagination={false}
                    />
                  </div>
                </div>
                <div className={styles.pageContent}>
                  <p className={styles.pageContentTitle}> 安全事件趋势图</p>
                  <div className={styles.pageContentWrapper}>
                    {safetyOverview.eventTrend.length > 0 ? (
                      <LineChart
                        hasLegend={false}
                        hasArea={false}
                        hasPoint
                        xAxisName="key"
                        yAxisName="doc_count"
                        scale={this.getScale('安全事件数')}
                        data={safetyOverview.eventTrend}
                        padding={[10, 'auto', 42, 'auto']}
                        height={248}
                        color="#26d8a3"
                      />
                    ) : (
                      <span>暂无数据</span>
                    )}
                  </div>
                </div>
                <div className={styles.pageContent}>
                  <p className={styles.pageContentTitle}> 受影响资产数趋势图</p>
                  <div className={styles.pageContentWrapper}>
                    {safetyOverview.affectedAssetsTrend.length > 0 ? (
                      <LineChart
                        hasLegend={false}
                        hasArea={false}
                        hasPoint
                        xAxisName="key"
                        yAxisName="num"
                        scale={this.getScale('受影响资产数', '日期', 5, 'key', 'num')}
                        data={safetyOverview.affectedAssetsTrend}
                        padding={[10, 'auto', 42, 'auto']}
                        height={248}
                        color="#5075FF"
                      />
                    ) : (
                      <span>暂无数据</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.yjPage}>
              <div className={styles.yiPageContent}>
                <div className={styles.pageTitle}>二、安全事件</div>
                <div className={styles.pageDesc}>
                  <span>{startTime ? moment(startTime).format(formatTrd) : ''}</span>至
                  <span>{endTime ? moment(endTime).format(formatTrd) : ''}</span>
                  期间，系统中发现威胁指标如下。
                </div>
                <div className={styles.pageContent}>
                  <p className={styles.pageContentTitle}>
                    感知最多的安全事件列表
                    {topn === '100' ? '' : `TOP${topn}`}
                  </p>
                  <div className={styles.pageContentWrapper}>
                    <Table
                      rowkey="key" // size="small"
                      columns={this.perceptionColumns}
                      dataSource={perceptionEventList}
                      pagination={false}
                    />
                  </div>
                </div>
                <div className={styles.pageContent}>
                  <p className={styles.pageContentTitle}>
                    系统当前风险最高的资产列表
                    {topn === '100' ? '' : `TOP${topn}`}
                  </p>
                  <div className={styles.pageContentWrapper}>
                    <Table
                      rowkey="name" // size="small"
                      columns={this.riskAssetsColumns}
                      dataSource={riskAssetsList}
                      pagination={false}
                    />
                  </div>
                  <EventHandle topn={topn} startTime={startTime} endTime={endTime} />
                </div>
              </div>
            </div>
            {isLoadend && <span id="loadend" style={{ display: 'none' }} />}
          </div>
        )}
      </div>
    );
  }
}
export default ReportPreviewFst;
