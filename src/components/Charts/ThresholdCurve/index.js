/* eslint-disable prefer-destructuring */
/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import { Chart, Geom, Axis, Guide, Tooltip } from 'bizcharts';

import { isEqual } from "lodash"
import moment from 'moment';

const { Line } = Guide;
class ThresholdCurve extends Component {
    constructor(props) {
        super(props);
        this.state = {
            /** 阈值单位 */
            unit: 'bps',
            symbols: ['bps', 'Kbps', 'Mbps'],
            /** Y轴最大数据 */
            maxYData: 0
        };
    }

    componentDidMount() {


    };

    componentDidUpdate(prevProps) {
        const { symbols } = this.state
        const { thresholdValueArr, data } = this.props
        if (!isEqual(data, prevProps.data) && data.length > 0) {
            const arrayValue = data.map(item => { return item.value })
            const maxValue = Math.max(...arrayValue)// Y轴最大值(bps)

            let thresholdValue = 0 // 阈值
            const index = thresholdValueArr.findIndex(item => { return item.text === "阈值" })
            if (index !== -1) thresholdValue = thresholdValueArr[index].thresholdValue
            // 1.如果 thresholdValue》maxValue 那么要根据阈值来 确定单位,以及Y轴最大数据
            let unit = 'bps'
            if (thresholdValue > maxValue) {
                unit = this.calculatingUnit(thresholdValue, symbols)
                this.setState({
                    unit,
                    maxYData: Number(this.byteConversionHasNoUnits(thresholdValue))
                })
            } else {
                unit = this.calculatingUnit(maxValue, symbols);
                this.setState({
                    unit,
                    maxYData: maxValue === 0 ? 1 : Number(this.byteConversionHasNoUnits(maxValue))
                })
            }


        }
    }

    /** 字节转换 返回结果带单位 */
    byteConvert = (bps, unit) => {
        const { symbols } = this.state
        if (!bps) {
            return `${0} (${unit})`;
        }
        const index = symbols.findIndex((item) => { return item === unit })
        if (symbols[index] === 'Kbps') {
            bps /= 1024
        } else if (symbols[index] === 'Mbps') {
            bps = bps / 1024 / 1024
        }

        if (bps.toString().length > bps.toFixed(2).toString().length) {
            bps = bps.toFixed(2);
        }
        return `${bps} (${symbols[index]})`;

    };

    /** 字节转换 返回结果不带单位 */
    byteConversionHasNoUnits = (bps, unit) => {
        const { symbols } = this.state
        if (!bps) {
            return 0;
        }
        const index = symbols.findIndex((item) => { return item === unit })
        if (symbols[index] === 'Kbps') {
            bps /= 1024
        } else if (symbols[index] === 'Mbps') {
            bps = bps / 1024 / 1024
        }

        if (bps.toString().length > bps.toFixed(2).toString().length) {
            bps = bps.toFixed(2);
        }
        return bps;
    };

    /** 根据峰值计算单位 */
    calculatingUnit = (bps, symbols) => {
        if (!bps) {
            return symbols[0];
        }
        let exp = Math.floor(Math.log(bps) / Math.log(2));
        if (exp < 1) {
            exp = 0;
        }
        const i = Math.floor(exp / 10);
        return symbols[i]
    };

    onPlotClick = (e) => {
        const { unit } = this.state
        if (e.target && e.target.name === "guide-line-text") {
            const {
                target: {
                    _attrs: {
                        text
                    }
                }
            } = e
            const { handleThresholdSelection } = this.props
            if (text && text.includes('峰值') && handleThresholdSelection) {
                handleThresholdSelection("峰值", unit)
            } else if (text && text.includes('均值') && handleThresholdSelection) {
                handleThresholdSelection("均值", unit)
            }
        }
    }

    render() {
        // const data = [
        //     {date: "2020-07-30 14:00:00", value: 0},
        //     ....
        // ]
        const {
            data,
            thresholdValueArr,// 如果有多个长度，峰值必须索引为0
            width = 330,
            height = 220,
            dateTickCount = 5,
            padding = [10, 20, 80, 40],
            dateRange = [0, 0.85],
            additionalContent = '',
            offsetX = -30
        } = this.props
        const { unit, maxYData } = this.state
        const colors = ['#C93439', '#000'];
        const scale = {
            value: {
                type: "linear",
                formatter: val => {
                    const value = this.byteConvert(val, unit)
                    return value
                },
                min: 0, // 定义数值范围的最小值
                max: maxYData || 1, // 定义数值范围的最大值
                tickCount: 5,
                range: [0, 0.95],
                alias: '流量'
            },
            date: {
                tickCount: dateTickCount,
                formatter: (val) => {
                    return moment(val).format('MM-DD HH:mm');
                },
                range: dateRange,
            },
        };

        return (
            <div>
                <Chart
                    onPlotClick={this.onPlotClick}
                    padding={padding}
                    width={width}
                    height={height}
                    data={data}
                    scale={scale}>
                    <Axis
                        name="date"
                    />
                    <Axis name="value" />
                    {/* 提示信息(tooltip)组件，是指当鼠标悬停在图表上的某点时，以提示框的形式展示该点的数据，比如该点的值，数据单位等。 */}
                    <Tooltip />
                    <Geom type="line" position="date*value" shape='smooth' />
                    {data && data.length > 0 && data[0].date && data[data.length - 1].date ? (
                        <Guide>{
                            thresholdValueArr.map((item, index) => {
                                // if (item.thresholdValue === 0) {
                                //     return null
                                // }
                                // debugger
                                return (
                                    <Line
                                        key={index}
                                        top
                                        start={{ date: data[0].date, "value": Number(item.thresholdValue) }}
                                        end={{ date: data[data.length - 1].date, "value": Number(item.thresholdValue) }}
                                        lineStyle={{
                                            lineWidth: 3,
                                            // 线条颜色
                                            stroke: colors[index],
                                        }}
                                        text={{
                                            position: 'end',
                                            style: {
                                                fill: colors[index],
                                                fontSize: '14',
                                                fontWeight: 'bold'
                                            },
                                            offsetX,
                                            content: `${additionalContent}${item.text}：${this.byteConvert(item.thresholdValue, unit)}`
                                        }}

                                    />
                                )
                            })
                        }
                        </Guide>
                    ) : (<div />)}

                </Chart>
            </div>

        );
    }
}
export default ThresholdCurve;
