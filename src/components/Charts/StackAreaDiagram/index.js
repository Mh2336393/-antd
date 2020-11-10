import React, { Component } from 'react';
import {
    // G2,
    Chart,
    Geom,
    Axis,
    Tooltip,
    // Coord,
    // Label,
    Legend,
    // View,
    // Guide,
    // Shape,
    // Facet,
    // Util
} from "bizcharts";
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
// import { DataSet } from '@antv/data-set';
import autoHeight from '../autoHeight';

/* eslint react/no-danger:0 */
/* eslint-disable no-underscore-dangle */

let chart;
@autoHeight()

class StackAreaDiagram extends Component {
    componentDidMount() {
        this.resize();
        window.addEventListener('resize', this.resize);
        //  点击柱子添加事件响应
        chart.on('plotclick', e => {
            const { data } = e;
            if (!data || !Array.isArray(data) || data.length === 0) return
            const { toLink } = this.props;
            if (!toLink) return
            if(!e.target||!e.target.name||!e.target.name||e.target.name!=="area"||!e.target._id)return
            console.log('e', e);
            const tooltipData = chart.getTooltipItems({ x: e.x, y: e.y })
            // tooltipData可能有重复数据过滤一下
            const curPointTooltipData = []
            for (let i = 0; i < tooltipData.length; i += 1) {
                const nodeData = tooltipData[i]
                const index = curPointTooltipData.findIndex(item => nodeData.title === item.title && nodeData.name === item.name)
                if (index === -1) {
                    curPointTooltipData.push(nodeData)
                }
            }
            console.log("当前的点击的tooltip数据", curPointTooltipData)


            // // 还得把下一个节点的tooltip数据找出来（因为es的时间聚合，比如1小时为间隔，那么1点的数据就是聚合的1点到2点的数据，所以是找下一个）
            const nextPointTooltipData = []
            const appProtos = []
            const { data: nodeList } = this.props;
            for (let i = 0; i < curPointTooltipData.length; i += 1) {
                const nodeData = curPointTooltipData[i];
                const index = nodeList.findIndex(item => nodeData.title === item.formattedTime && nodeData.name === item.appProto)
                if (index && nodeList[index + 1]) {
                    const nextTooltipData = nodeList[index + 1]
                    if (nextTooltipData.appProto === nodeData.name && nextTooltipData.formattedTime !== nodeData.title)
                        nextPointTooltipData.push(nextTooltipData)
                }
                // if (!appProtos.includes(nodeData.name)) appProtos.push(nodeData.name)
            }
            console.log("下一个节点的tooltip数据", nextPointTooltipData)
            const array= e.target._id.split("-")
            appProtos.push(array[array.length-1]) 
            // 代表当前点击的是第一个节点，没有区间，不做任何跳转
            if (nextPointTooltipData.length === 0) return
            // 否则把跳转条件都取出来，时间段，协议数组，
            const toLinkParameter = {
                startTime: curPointTooltipData[0].title,
                endTime: nextPointTooltipData[0].formattedTime,
                appProtos
            }
            toLink(toLinkParameter);
        });
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
        this.resize.cancel();
    };

    // for window resize auto responsive legend
    @Bind()
    @Debounce(300)
    resize() {
        const { hasLegend } = this.props;
        if (!hasLegend || !this.root) {
            window.removeEventListener('resize', this.resize);
        }
    }

    render() {
        const {
            height,
            // color,
            // padding = { top: 10, right: 50, bottom: 60, left: 50 },
            data
        } = this.props;
        // const data = [
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 09:00:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 09:10:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 09:20:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 09:30:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 09:40:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 09:50:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 10:00:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 10:10:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 10:20:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 10:30:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 10:40:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 10:50:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 11:00:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 11:10:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 11:20:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 11:30:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 11:40:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 11:50:00" },
        //     { "appProto": "ssh", "count": 982, "formattedTime": "2020-06-04 12:00:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 12:10:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 12:20:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 12:30:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 12:40:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 12:50:00" },
        //     { "appProto": "ssh", "count": 0, "formattedTime": "2020-06-04 13:00:00" },

        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 09:00:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 09:10:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 09:20:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 09:30:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 09:40:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 09:50:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 10:00:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 10:10:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 10:20:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 10:30:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 10:40:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 10:50:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 11:00:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 11:10:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 11:20:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 11:30:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 11:40:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 11:50:00" },
        //     { "appProto": "ftp", "count": 2, "formattedTime": "2020-06-04 12:00:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 12:10:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 12:20:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 12:30:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 12:40:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 12:50:00" },
        //     { "appProto": "ftp", "count": 0, "formattedTime": "2020-06-04 13:00:00" }
        // ]



        const scale = {
            formattedTime: {
                type: "time",
                // 这块必须这么写，当初你是怎么用moment(elementTwo.key).format('YYYY-MM-DD HH:mm:ss')
                // 转换得，mask就必须是format得指定格式
                mask: "YYYY-MM-DD HH:mm:ss",
            }
        }

        return (
          <div>
            {/* 图表的组件，内部生成了一个 G2 chart 实例，同时控制着其他子组件的加载和更新。padding={[0, 60, 90, 60]} */}
            <Chart
              height={height}
              data={data}
              scale={scale}
              padding={[20, 60, 60, 60]}
              forceFit
              onGetG2Instance={g2Chart => {
                        chart = g2Chart;
                    }}
            >
              {/* 坐标轴的配置，BizCharts中将Axis抽离为一个单独的组件，不使用Axis组件则默认不显示所有坐标轴及相关的信息。 */}
              <Axis name="formattedTime" rotate="12" />
              <Axis name="count" />
              {/* 图例（legend）是图表的辅助元素，使用颜色、大小、形状区分不同的数据类型，用于图表中数据的筛选。 */}
              <Legend position="top-center" />
              {/* 提示信息(tooltip)组件，是指当鼠标悬停在图表上的某点时，以提示框的形式展示该点的数据，比如该点的值，数据单位等。 */}
              <Tooltip />
              {/* 几何标记对象，决定创建图表的类型。 */}
              <Geom type="areaStack" position="formattedTime*count" color="appProto" />
              <Geom type="lineStack" position="formattedTime*count" size={2} color="appProto" />
            </Chart>
          </div>
        );
    }
}
export default StackAreaDiagram;
