import React, { PureComponent } from 'react';
import { LeftOutlined, UndoOutlined } from '@ant-design/icons';
import { Divider, Spin } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { IntervalChart } from '@/components/Charts';
import esAdaptiveSearch from '@/tools/esAdaptiveSearch';
import formatNumber from '@/tools/formatNumber';
import styles from './index.less';

/* eslint no-underscore-dangle: ["error", { "allow": ["_origin"] }] */
const timeFormat = 'YYYY-MM-DD HH:mm:ss';
class HistogramBrush extends PureComponent {
    // 存放最近框选的时间戳范围（默认存放50个操作记录）
    preTimeRange = [];

    activeEv = {
        key: '',
        startX: 0,
        width: 0,
        height: 0,
    };

    componentWillReceiveProps = nextProps => {
        const { preTimeRange } = nextProps;
        if (this.preTimeRange !== preTimeRange) {
            this.preTimeRange = preTimeRange;
        }
    };

    ontimePiker = (startTime, endTime) => {
        const { ontimePiker } = this.props;
        ontimePiker(startTime, endTime, this.preTimeRange);
    };

    // 返回上一次框选时间范围
    backToBefore = () => {
        const { length } = this.preTimeRange;
        if (length > 0) {
            const { startTime, endTime } = this.preTimeRange[length - 1];
            this.ontimePiker(startTime, endTime);
            this.preTimeRange.splice(length - 1, 1);
        }
    };

    // 直方图中框选时间范围的下钻
    timeDrill = (startKey, endKey) => {
        const { startTime, endTime } = this.props;
        // 每次框选时间范围改变，就将上一个框选的时间范围值存入数组，用于返回操作
        if (this.preTimeRange.length > 50) {
            this.preTimeRange.splice(0, 1);
        }
        this.preTimeRange.push({ startTime, endTime });
        this.ontimePiker(moment(startKey), moment(endKey));
    };

    onbrushend = (chart, ev) => {
        const { key: keyArr } = ev;
        const { interval } = this.props;
        console.log('ev.key::::', keyArr);
        if (keyArr && keyArr.length > 0) {
            keyArr.sort();
            const timeRange = esAdaptiveSearch.intervalFormatMapping[interval].timestampRange;
            this.timeDrill(keyArr[0], keyArr[keyArr.length - 1] + timeRange);
        }
    };

    plotclick = ev => {
        const { interval } = this.props;
        const { key, startX, width, height } = this.activeEv;
        const halfWidth = width / 2;
        if (ev.x >= startX - halfWidth && ev.x <= startX + halfWidth && ev.y >= height) {
            const timeRange = esAdaptiveSearch.intervalFormatMapping[interval].timestampRange;
            this.timeDrill(key, key + timeRange);
        }
    };

    intervalMouseEnter = (chart, ev) => {
        // console.log('enter', ev);
        const key = ev.data._origin.key;
        this.activeEv = {
            key,
            startX: ev.data.x, // 获取当前柱子的中心x轴坐标
            width: chart.getAllGeoms()[0].getSize(), // 获取每根柱子的宽度
            height: ev.data.y, // 获取每根柱子的高度
        };
    };

    newSearch = () => {
        const { onNewSearch } = this.props;
        const { length } = this.preTimeRange;
        if (length > 0) {
            onNewSearch();
            this.preTimeRange = [];
        }
    };

    render() {
        const { chartLoading, chartData, recordsTotal, intervalFormatMapping, visible, startTime, endTime, took, bodyStyle } = this.props;
        const { xAxisName, format } = intervalFormatMapping;
        const scale = {
            key: {
                type: 'timeCat', // 重要
                alias: xAxisName,
                tickCount: 8,
                formatter: key => moment(key).format(format),
            },
            doc_count: {
                alias: '数量',
                tickCount: 5,
                min: 0,
                formatter: count => {
                    if (count >= 10000 && count < 10000000) {
                        return `${Math.floor(count / 10000)}万`;
                    }
                    if (count >= 10000000) {
                        return `${Math.floor(count / 10000000)}千万`;
                    }
                    return Math.floor(count);
                },
            },
        };
        return (
            <div>
                {visible && (
                    <div className={styles['timechart-block']} style={bodyStyle || {}}>
                        {chartLoading ? (
                            <div className={styles.center}>
                                <Spin />
                            </div>
                        ) : (
                            <div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div className={styles['timechart-totalCount']}>
                                        已搜索完成，共 <span style={{ color: '#3369D9' }}>{formatNumber(recordsTotal)}</span> 条结果，用时{' '}
                                        {took} 毫秒
                                    </div>
                                    <div className={styles['timechart-timeRange']}>
                                        <a
                                            onClick={this.backToBefore}
                                            className={this.preTimeRange.length === 0 ? styles.disabledClick : ''}
                                        >
                                            <LeftOutlined />
                                            返回
                                        </a>
                                        <Divider type="vertical" />
                                        <a onClick={this.newSearch} className={this.preTimeRange.length === 0 ? styles.disabledClick : ''}>
                                            <UndoOutlined />
                                            还原
                                        </a>
                                        {startTime.format(timeFormat)}
                                        &nbsp;至&nbsp;
                                        {endTime.format(timeFormat)}
                                    </div>
                                </div>
                                <IntervalChart
                                    padding={[42, 40, 42, 55]}
                                    customScales={scale}
                                    data={chartData}
                                    height={208}
                                    xAxisName="key"
                                    yAxisName="doc_count"
                                    yTitleVisble={false}
                                    itemTpl='<li data-index={index}><div style="margin-bottom:4px;"><span style="display:inline-block; width:125px;">数量 : </span>{doc_count}</div><div style="margin-bottom:4px;"><span style="display:inline-block; width:125px;">{xAxisName} : </span>{key}</div></li>'
                                    tooltip={[
                                        'key*doc_count',
                                        (key, doc_count) => ({
                                            key: moment(key).format(timeFormat),
                                            doc_count,
                                            xAxisName: xAxisName,
                                        }),
                                    ]}
                                    // brushstart={this.onbrushstart}
                                    brushend={this.onbrushend}
                                    intervalMouseEnter={this.intervalMouseEnter}
                                    plotclick={this.plotclick}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default HistogramBrush;
