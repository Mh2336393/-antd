import React, { Component } from 'react';
import moment from 'moment';
import { Table, Popover, Spin } from 'antd';
import { connect } from 'umi';
import { Link } from 'umi';
import TimeRangePicker from '@/components/TimeRangePicker';
import cloneDeep from 'lodash/cloneDeep';
import HeatBrush from '../../../Event/SafeEvent/Alarm/HeatBrush';
import configSettings from '../../../../configSettings';
// import styles from '../../../Event.SafeEvent/Alarm/AlarmList.less';

import styles from './AssetDetail.less';

const DetailMap = {
  入侵感知: '/event/safeEvent/alarmAlert',
  失陷感知: '/event/safeEvent/alarmIoc',
  异常文件感知: '/event/safeEvent/alarmFile',
};
class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        startTime: moment().subtract(1, 'day').valueOf(),
        endTime: moment().valueOf(),
        page: 1,
        pageSize: 10,
        Fip: props.Fip,
        Fvpcid: props.Fvpcid,
        sort: 'tsLatest',
        dir: 'desc',
      },
      timeRange: 1,
    };
    this.defaultQuery = cloneDeep(this.state.query);
    this.columns = [
      {
        title: '告警时间',
        dataIndex: 'tsLatest',
        key: 'tsLatest',
        width: 145,
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        key: 'name',
        width: 140,
        render: (text, record) => {
          const { category_1, id, tsOldest, tsLatest } = record;
          const linkPath = DetailMap[category_1];
          console.log('linkPath', linkPath);
          return (
            <Link
              target="_blank"
              to={`${linkPath}?id=${encodeURIComponent(
                id
              )}&tsOldest=${tsOldest}&tsLatest=${tsLatest}`}
            >
              {text}
            </Link>
          );
        },
      },
      {
        title: '源IP',
        dataIndex: 'src.ip',
        key: 'src.ip',
        width: 140,
        render: (text, record) => {
          const { src } = record;
          const popContent = (
            <div>
              {src.map((item) => (
                <p key={item.ip}>{item.ip}</p>
              ))}
            </div>
          );
          return (
            <div>
              {src.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                >
                  <p>
                    多个( <span className="fontBlue"> {src.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p>{src[0] ? src[0].ip : ''}</p>
              )}
            </div>
          );
        },
      },
      {
        title: '目的IP',
        dataIndex: 'dst.ip',
        key: 'dst.ip',
        width: 140,
        render: (text, record) => {
          const { dst } = record;
          const popContent = (
            <div>
              {dst.map((item) => (
                <p key={item.ip}>{item.ip}</p>
              ))}
            </div>
          );
          return (
            <div>
              {dst.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                >
                  <p>
                    多个( <span className="fontBlue"> {dst.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p>{dst[0] ? dst[0].ip : ''}</p>
              )}
            </div>
          );
        },
      },
      {
        title: '攻击意图',
        dataIndex: 'attackStage',
        key: 'attackStage',
        width: 140,
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
                whiteSpace: 'noWrap',
              }}
            >
              {text}
            </span>
          );
        },
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({ type: 'assetList/fetchEventList', payload: query });
  }

  timePickerOnchange = (arr) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, {
      startTime: arr[0],
      endTime: arr[1],
    });
    dispatch({ type: 'assetList/fetchEventList', payload: newQuery });
    this.setState({ query: newQuery, timeRange: arr[3] });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { current, pageSize } = pagination;
    const { dispatch } = this.props;
    //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
    let newQuery;
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, {
        page: current,
        pageSize,
      });
    } else {
      const { field, order } = sorter;
      if (!field) return;
      const dir = order.slice(0, -3);
      newQuery = Object.assign({}, query, {
        dir,
        sort: field,
        page: 1,
      });
    }
    dispatch({ type: 'assetList/fetchEventList', payload: newQuery });
    this.setState({
      query: newQuery,
    });
  };

  ontimePiker = (newQuery) => {
    // console.log('newQuery', newQuery);
    const { dispatch } = this.props;
    const { startTime, endTime } = newQuery;
    this.setState(
      {
        query: newQuery,
        timeRange: `${moment(startTime).format('YYYY-MM-DD HH:mm:ss')} 至 ${moment(endTime).format(
          'YYYY-MM-DD HH:mm:ss'
        )}`,
        // selectedNum: 0,
        // isAllCheck: false,
        // selectedRowKeys: [],
        // ids: [],
        // // selectedRows: [],
        // // checkAllPage: [],
        // // unCheckedIds: [],
      },
      () => {
        dispatch({ type: 'assetList/fetchEventList', payload: newQuery });
      }
    );
  };

  // 左侧栏新增
  onNewSearch = () => {
    const { dispatch } = this.props;
    const newQuery = cloneDeep(this.defaultQuery);
    this.setState(
      {
        query: newQuery,
        timeRange: 1,
        // selectedNum: 0,
        // isAllCheck: false,
        // selectedRowKeys: [],
        // ids: [],
        // selectedRows: [],
        // checkAllPage: [],
        // unCheckedIds: [],
      },
      () => {
        dispatch({ type: 'assetList/fetchEventList', payload: newQuery });
        // this.fetchAlarmData(newQuery);
        // this.fetchFilterCount(newQuery);
      }
    );
  };

  render() {
    const {
      query,
      query: { startTime, endTime },
      timeRange,
    } = this.state;
    const {
      tableLoading,
      assetList: { eventList, eventChart },
    } = this.props;
    // console.log('eventChartData',eventChartData);
    return (
      <div style={{ padding: '10px 20px' }}>
        <div style={{ width: 224, paddingBottom: 20 }}>
          <TimeRangePicker
            timeRange={timeRange}
            startTime={startTime}
            endTime={endTime}
            timePickerOnchange={this.timePickerOnchange}
          />
        </div>
        <div className={styles.chartBlock}>
          {/* <LineChart
            hasLegend={false}
            offsetY={3}
            offsetX={-60}
            padding={[30, 60]}
            data={eventChartData}
            height={240}
          /> */}
          <HeatBrush
            chartLoading={tableLoading}
            chartData={eventChart}
            recordsTotal={eventList.total}
            query={query}
            ontimePiker={this.ontimePiker}
            onNewSearch={this.onNewSearch}
            height={250}
            padding={[0, 60, 60, 120]}
          />
          <Table
            rowKey="id"
            loading={tableLoading}
            pagination={{
              showSizeChanger: true,
              defaultPageSize: query.pageSize,
              pageSizeOptions: ['10', '20', '30', '50'],
              current: query.page,
              total: eventList.total,
              showQuickJumper: true,
              showTotal: (total) => `（${total}项）`,
            }}
            columns={this.columns}
            dataSource={eventList.list}
            size="middle"
            onChange={this.handleTableChange}
          />
          {eventList.gt10000 && (
            <div className={styles.flexEnd}>
              <span>页面最多展示10000条数据</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
export default connect(({ assetList, loading }) => ({
  assetList,
  tableLoading: loading.effects['assetList/fetchEventList'],
}))(Event);
