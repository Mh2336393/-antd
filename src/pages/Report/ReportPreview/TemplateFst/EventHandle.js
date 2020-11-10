import React, { Component } from 'react';
import { connect } from 'umi';
import { Table, Progress, Tooltip, Popover } from 'antd';
import moment from 'moment';
import { LineChart, Pie } from '@/components/Charts';
import numeral from 'numeral';
import configSettings from '../../../../configSettings';
import Yuan from '@/utils/Yuan';

import styles from './index.less';

/* eslint-disable react/jsx-no-target-blank */

const formatTrd = 'YYYY年MM月DD';
const formatFth = 'YYYY-MM-DD H时';
@connect(({ reportApt, eventHandle, global, templateFstPreview }) => ({
  isKVM: global.isKVM,
  reportApt,
  eventHandle,
  templateFstPreview,
}))
class EventHandle extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: '指标项',
        dataIndex: 'scoreRange',
        key: 'scoreRange',
        render: (text) => configSettings.scoreRangeMap(text),
      },
      { title: '总事件数', dataIndex: 'total', key: 'total' },
      // { title: '已忽略', dataIndex: 'ignored', key: 'ignored', render: text => text || 0 },
      {
        title: '待处理事件数',
        dataIndex: 'unhandled',
        key: 'unhandled',
        render: (text) => text || 0,
      },
      { title: '已处理事件数', dataIndex: 'handled', key: 'handled', render: (text) => text || 0 },
    ];
    this.sandboxCloumns = [
      { title: '类型', dataIndex: 'key', key: 'key' },
      { title: '数量', dataIndex: 'doc_count', key: 'doc_count' },
    ];
    this.fallColumns = [
      { title: '情报标签', dataIndex: 'key', key: 'key' },
      { title: '受影响资产数', dataIndex: 'assetCardinality', key: 'assetCardinality' },
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

    this.iocColumns = [
      {
        title: '失陷指标',
        dataIndex: 'name',
        key: 'name',
        width: 180,
        render: (text) => (
          <span style={{ width: 180 }} className="ellipsis">
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
          const str = text.join(',');
          return (
            <span style={{ maxWidth: 200 }} className="ellipsis">
              {str}
            </span>
          );
        },
      },
      {
        title: '标签',
        dataIndex: 'iocTags',
        key: 'iocTags',
        width: 100,
        render: (text) => {
          if (!text || text.length === 0) return <span />;
          const {
            templateFstPreview: { tagsDesc },
          } = this.props;
          // console.log(45, "tagsDesc==", tagsDesc);
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
    this.md5Cloumns = [
      { title: 'MD5', dataIndex: 'key', key: 'key' },
      // { title: '资产名称', dataIndex: 'assetName', key: 'assetName' },
      { title: '数量', dataIndex: 'doc_count', key: 'doc_count' },
      { title: '事件评分', dataIndex: 'score', key: 'score' },
      { title: '占比', dataIndex: 'percent', key: 'percent' },
    ];
    this.assetCloumns = [
      { title: '受影响资产', dataIndex: 'assetIP', key: 'assetIP' },
      { title: '异常文件数量', dataIndex: 'doc_count', key: 'doc_count' },
      { title: '占比', dataIndex: 'percent', key: 'percent' },
    ];
  }

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

  render() {
    const {
      templateFstPreview: { safetyOverview },
      eventHandle: {
        eventHandleList,
        eventStatusTrend,
        invationList,
        fileList,
        eventIocTopList,
        sandboxFileTypeList,
        eventFallTabsList,
      },
      topn,
      startTime,
      endTime,
      reportApt: { eventTrend, md5List, assetList },
      isKVM,
    } = this.props;
    console.log('md5', md5List);
    console.log('assetList', assetList);
    const customTotalStyle = {
      fontSize: 12,
    };
    return (
      <div>
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>入侵感知安全事件分布</p>
          <Pie
            hasLegend
            subTitle="事件数"
            total={() => <Yuan>{invationList.reduce((pre, now) => now.y + pre, 0)}</Yuan>}
            data={invationList}
            valueFormat={(value) => numeral(value).format('0,0')}
            height={258}
            lineWidth={4}
            customTotalStyle={customTotalStyle}
            inner={0.66}
            padding={[60, 30]}
            hasLabel
            legendOnclick={this.eventlegendOnclick}
          />
        </div>
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>入侵感知安全事件趋势图</p>
          <div className={styles.pageContentWrapper}>
            {safetyOverview.eventTrendAttack.length > 0 ? (
              <LineChart
                hasLegend={false}
                hasArea={false}
                hasPoint
                xAxisName="key"
                yAxisName="doc_count"
                scale={this.getScale('入侵感知事件数')}
                data={safetyOverview.eventTrendAttack}
                padding={[10, 'auto', 42, 'auto']}
                height={248}
                color="#26d8a3"
              />
            ) : (
              <span>暂无数据</span>
            )}
          </div>
        </div>
        {/* <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>入侵感知安全事件等级分布图</p>
        </div>
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>入侵感知高威胁等级告警Top10</p>
          <div className={styles.pageContentWrapper}>
            <Table rowkey="key" columns={this.perceptionColumns} dataSource={perceptionEventAttackList} pagination={false} />
          </div>
        </div> */}
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>失陷感知威胁情报标签事件统计</p>
          <Table
            rowKey={(record) => record.index}
            size="small"
            dataSource={eventFallTabsList}
            columns={this.fallColumns}
            pagination={false}
          />
        </div>
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>
            失陷指标（IOC）命中 {topn === '100' ? '' : `TOP${topn}`}
          </p>
          <Table
            rowKey={(record) => record.index}
            size="small"
            dataSource={eventIocTopList}
            columns={this.iocColumns}
            pagination={false}
          />
        </div>

        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>异常文件事件趋势图</p>
          <div className={styles.pageContentWrapper}>
            {eventTrend.length > 0 ? (
              <LineChart
                hasLegend={false}
                hasArea={false}
                hasPoint
                xAxisName="key"
                yAxisName="doc_count"
                scale={this.getScale('异常文件事件数')}
                data={eventTrend}
                padding={[10, 'auto', 42, 'auto']}
                height={248}
                color="#5075FF"
              />
            ) : (
              <span>暂无数据</span>
            )}
          </div>
        </div>
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>异常文件安全事件分布</p>
          <Pie
            hasLegend
            subTitle="事件数"
            customTotalStyle={customTotalStyle}
            total={() => <Yuan>{fileList.reduce((pre, now) => now.y + pre, 0)}</Yuan>}
            data={fileList}
            valueFormat={(value) => numeral(value).format('0,0')}
            height={258}
            inner={0.66}
            padding={[60, 30]}
            lineWidth={4}
            hasLabel
            legendOnclick={this.eventlegendOnclick}
          />
        </div>
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>感知最多的异常文件MD5 TOP{topn}</p>
          <Table columns={this.md5Cloumns} dataSource={md5List} pagination={false} />
        </div>

        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>异常文件影响资产 TOP{topn}</p>
          <Table columns={this.assetCloumns} dataSource={assetList} pagination={false} />
        </div>
        {!isKVM && (
          <div className={styles.infoBlock}>
            <p className={styles.pageContentTitle}>沙箱分析文件类型分布</p>
            <Table
              columns={this.sandboxCloumns}
              dataSource={sandboxFileTypeList}
              pagination={false}
            />
          </div>
        )}
        <h4 className={styles.titleOneLevel}>三、事件处理</h4>
        <p>
          <span>{startTime ? moment(startTime).format(formatTrd) : ''}</span>至
          <span>{endTime ? moment(endTime).format(formatTrd) : ''}</span>
          期间，系统中发现威胁指标如下。
        </p>
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>安全事件处理情况</p>
          <Table columns={this.columns} dataSource={eventHandleList} pagination={false} />
        </div>
        <div className={styles.infoBlock}>
          <p className={styles.pageContentTitle}>事件处理趋势图</p>
          <LineChart
            scale={{
              time: { formatter: (value) => moment(value).format(formatFth) },
              value: { alais: '事件数' },
            }}
            data={eventStatusTrend}
            transform={(dv) => {
              dv.transform({
                type: 'fold',
                fields: ['未处理', '已处理', '已忽略'],
                key: 'status',
                value: 'value',
              }); // value字段
            }}
            height={210}
            padding={[40, 70, 50, 60]}
            color="status"
            hasArea={false}
            hasLegend
            legendPosition="top-right"
            legendOffsetY={-8}
            grid={
              { type: 'line', lineStyle: { stroke: '#333', lineWidth: 0.5, lineDash: [4, 0] } } // 网格的类型 // 网格线的颜色 // 网格线的宽度复制代码 // 网格线的虚线配置，第一个参数描述虚线的实部占多少像素，第二个参数描述虚线的虚部占多少像素 // 网格线的样式配置，原有属性为 line
            }
          />
        </div>
      </div>
    );
  }
}
export default EventHandle;
