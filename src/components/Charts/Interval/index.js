import React, { Component } from 'react';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import { DataSet } from '@antv/data-set';
import Brush from '@antv/g2-brush';
import ReactFitText from 'react-fittext';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import autoHeight from '../autoHeight';

let chart;
let move = false; // 框选一次会触发 start--move-end-click,用来标记是否是框选，若是框选，则不触发click事件
/* eslint react/no-danger:0 */
@autoHeight()
class IntervalChart extends Component {
    componentDidMount() {
        this.resize();
        window.addEventListener('resize', this.resize);
        const { brushstart, brushmove, brushend, intervalMouseEnter, plotclick } = this.props;
        // 图表下钻
        /* eslint-disable no-new */
        /* eslint-disable no-unused-expressions */
        /* eslint-disable react/sort-comp */
        new Brush({
            canvas: chart.get('canvas'),
            chart,
            type: 'X',
            onBrushstart(startPoint) {
                brushstart && brushstart(startPoint);
            },
            onBrushmove(ev) {
                move = true;
                brushmove && brushmove(ev);
            },
            onBrushend(ev) {
                brushend && brushend(chart, ev);
            },
        });
        // 框选一次会触发 sart--move-end-click
        // 点击触发：start-click
        plotclick &&
            chart.on('plotclick', ev => {
                if (!move) {
                    plotclick(ev);
                }
                move = false;
            });
        intervalMouseEnter &&
            chart.on('interval:mouseenter', ev => {
                intervalMouseEnter(chart, ev);
            });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
        this.resize.cancel();
    }

    // for window resize auto responsive legend
    @Bind()
    @Debounce(300)
    resize() {
        const { hasLegend } = this.props;
        if (!hasLegend || !this.root) {
            window.removeEventListener('resize', this.resize);
        }
    }

    handleRoot = n => {
        this.root = n;
    };

    render() {
        const {
            style,
            height,
            xAxisName,
            xAxisVisible = true,
            yAxisName,
            yAxisVisible = true,
            xTitleVisble = false,
            yTitleVisble = false,
            data,
            padding,
            customScales,
            size,
            itemTpl,
            tooltip,
            titleOffset = 50,
            TooltipTitle,
            showTitle = false,
            customToolTips = true, // 默认需要定制tooltip
            color = '#5075FF',
        } = this.props;
        const defaultPadding = [42, 40, 42, 75];
        const ds = new DataSet();
        const title = {
            autoRotate: true, // 是否需要自动旋转，默认为 true
            offset: titleOffset,
            textStyle: {
                fontSize: '14',
                textAlign: 'center',
                fill: '#666',
            }, // 坐标轴文本属性配置
            position: 'center', // 标题的位置，**新增**
        };
        // console.log('root', this.root.offsetWidth);
        const dv = ds.createView().source(data);
        return (
            <div ref={this.handleRoot}>
                <ReactFitText maxFontSize={25}>
                    <div style={style}>
                        <Chart
                            height={height}
                            data={dv}
                            scale={customScales}
                            onGetG2Instance={g2Chart => {
                                chart = g2Chart;
                            }}
                            padding={padding || defaultPadding}
                            forceFit
                        >
                            {customToolTips ? (
                                <Tooltip showTitle={showTitle} title={TooltipTitle} itemTpl={itemTpl} />
                            ) : (
                                <Tooltip showTitle={showTitle} title={TooltipTitle} />
                            )}
                            <Axis title={xTitleVisble ? title : null} name={xAxisName} visible={xAxisVisible} />
                            <Axis title={yTitleVisble ? title : null} name={yAxisName} visible={yAxisVisible} />
                            {customToolTips ? (
                                <Geom type="interval" position={`${xAxisName}*${yAxisName}`} size={size} tooltip={tooltip} color={color} />
                            ) : (
                                <Geom type="interval" position={`${xAxisName}*${yAxisName}`} size={size} color={color} />
                            )}
                        </Chart>
                    </div>
                </ReactFitText>
            </div>
        );
    }
}
export default IntervalChart;
