import React, { Component } from 'react';
import { connect } from 'umi';
import { Table } from 'antd';
import moment from 'moment';
import { Link } from 'umi';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import configSettings from '../../../configSettings';
import styles from './index.less';

const format = 'YYYY-MM-DD HH:mm:ss';
const blockerType = {
  alert: '告警阻断',
  blacklist: '黑名单阻断',
  ioc_alert: '威胁情报阻断',
  apt_black: '沙箱阻断',
  xff: 'XFF阻断',
};
@connect(({ block, loading }) => ({
  block,
  loading: loading.effects['block/fetchLogList'],
  loading1: loading.effects['block/fetchBlockModules'],
}))
class BlockLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        page: 1,
        limit: parseInt(configSettings.pageSizeOptions[0], 10),
        startTime: moment().subtract(1, 'day').valueOf(),
        endTime: moment().valueOf(),
        Fblock_type: '', // 类型
        Fresponse: '', // 结果
        search: '',
        sort: 'Fid',
        dir: 'desc',
      },
      timeRange: '近24小时',
    };

    this.filterList = [
      {
        type: 'select',
        name: '时间',
        key: 'timeRange',
        list: [
          { name: '近24小时', value: '近24小时' },
          { name: '近7天', value: '近7天' },
          { name: '近30天', value: '近30天' },
          { name: '自定义', value: '自定义' },
        ],
      },
      {
        type: 'select',
        name: '阻断类型',
        key: 'Fblock_type',
        list: [
          { name: '全部', value: '' },
          { name: '告警阻断', value: 'alert' },
          { name: '黑名单阻断', value: 'blacklist' },
          { name: '威胁情报阻断', value: 'ioc_alert' },
          { name: '沙箱阻断', value: 'apt_black' },
          { name: 'XFF阻断', value: 'xff' },
        ],
      },
      {
        type: 'select',
        name: '结果',
        key: 'Fresponse',
        list: [
          { name: '全部', value: '' },
          { name: '成功', value: 'success' },
          { name: '失败', value: 'fail' },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: '策略名/源IP/目的IP',
        pressEnter: true,
      },
    ];

    this.columns = [
      {
        title: '响应设备名称', // 响应设备类型
        dataIndex: 'Fblocker_name',
        key: 'Fblocker_name',
        render: (text) => {
          const {
            block: { blockModuleObj },
          } = this.props;
          const Fid = Number(text);
          return blockModuleObj[Fid] || '';
        },
      },
      {
        title: '阻断策略名称',
        dataIndex: 'Fblock_strategy_name',
        key: 'Fblock_strategy_name',
        width: 400,
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 400 }}>{text}</div>,
      },
      {
        title: '阻断策略类型',
        dataIndex: 'Fblock_type',
        key: 'Fblock_type',
        render: (text) => blockerType[text],
      },
      {
        title: '触发条件',
        dataIndex: 'Fblock_rule',
        key: 'Fblock_rule',
        render: (text) => {
          if (!text) {
            return '';
          }
          let rid = [];
          let eid = [];
          try {
            const json = JSON.parse(text);
            if (typeof json.signature_id === 'object') {
              rid = json.signature_id;
            }
            if (typeof json.signature_id === 'number') {
              rid = [json.signature_id];
            }

            if (typeof json.gid === 'object') {
              eid = json.gid;
            }
            if (typeof json.gid === 'number') {
              eid = [json.gid];
            }
          } catch (error) {
            console.log(99, 'error=', error);
          }
          const conditionArr = [];
          let showTxt = '';
          if (rid.length) {
            conditionArr.push(`alert.signature_id: (${rid.join(' OR ')})`);
            showTxt += `规则ID:${rid.join(',')}; `;
          }
          if (eid.length) {
            conditionArr.push(`alert.gid: (${eid.join(' OR ')})`);
            showTxt += `事件ID:${eid.join(',')};`;
          }
          if (conditionArr.length) {
            const { query } = this.state;
            const condition = conditionArr.join(' AND ');
            return (
              <Link
                target="_blank"
                to={`/analysis/search?startTime=${query.startTime}&endTime=${query.endTime}&type=alert&condition=${condition}`}
                style={{ maxWidth: '300px', wordBreak: 'break-all' }}
              >
                {showTxt}
              </Link>
            );
          }

          return <div style={{ maxWidth: '300px', wordBreak: 'break-all' }}>{text}</div>;
        },
      },
      {
        title: '阻断源IP',
        dataIndex: 'Fsrc_ip',
        key: 'Fsrc_ip',
      },
      {
        title: '阻断目的IP',
        dataIndex: 'Fdst_ip',
        key: 'Fdst_ip',
      },
      {
        title: '响应时间',
        dataIndex: 'Fupdate_time',
        key: 'Fupdate_time',
        render: (text) => moment(text).format(format),
      },
      {
        title: '阻断结果',
        dataIndex: 'Fresponse',
        key: 'Fresponse',
        render: (text) => {
          let styleName = '';
          let blockTxt = '';
          if (text === 'success') {
            styleName = 'spanSucc';
            blockTxt = '成功';
          }
          if (text === 'fail') {
            styleName = 'spanErr';
            blockTxt = '失败';
          }
          return <span className={styles[styleName]}>{blockTxt}</span>;
        },
      },
      // {
      //   title: '结果详情',
      //   dataIndex: 'Fdescription',
      //   key: 'Fdescription',
      //   width: 200,
      //   render: text => (
      //     <div style={{ maxWidth: '200px' }} className="ellipsis" title={text}>
      //       {text}
      //     </div>
      //   ),
      // },
    ];

    this.btnList = [
      {
        label: '全部导出',
        func: this.export,
        type: 'primary',
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({ type: 'block/fetchBlockModules' });
    dispatch({
      type: 'block/fetchLogList',
      payload: query,
    });
  };

  export = () => {};

  filterOnChange = (type, value) => {
    const { query } = this.state;
    let changePart;
    if (type === 'timeRange') {
      changePart = {
        startTime: value[0],
        endTime: value[1],
      };
      this.setState({
        timeRange: value[2],
      });
    } else {
      changePart = { [type]: value };
    }
    const newQuery = Object.assign({}, query, changePart);
    this.setState({ query: newQuery });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    dispatch({
      type: 'block/fetchLogList',
      payload: newQuery,
    });
    this.setState({ query: newQuery });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, limit: pageSize });

    dispatch({
      type: 'block/fetchLogList',
      payload: newQuery,
    });
    this.setState({ query: newQuery });
  };

  render() {
    const { query, timeRange } = this.state;
    const {
      block: {
        logList: { recordsTotal, list },
      },
      loading,
      loading1,
    } = this.props;
    const { page, limit, ...paramsObj } = query;

    return (
      <div>
        <div className="filterWrap">
          <FilterBlock
            filterList={this.filterList}
            filterOnChange={this.filterOnChange}
            submitFilter={this.submitFilter}
            colNum={3}
            query={query}
            timeRange={timeRange}
          />
        </div>
        <div className="TableTdPaddingWrap">
          <ButtonBlock
            btnList={this.btnList}
            total={recordsTotal}
            onPageChange={this.paginationChange}
            bpage={query.page}
            dataLen={list.length}
            hrefStr={`/api/block/exportBlockLog?params=${JSON.stringify(paramsObj)}`}
          />
          <Table
            rowKey="id"
            loading={loading || loading1}
            columns={this.columns}
            dataSource={list}
            pagination={{
              pageSize: query.limit,
              current: query.page,
              total: recordsTotal,
              onChange: this.paginationChange,
            }}
          />
        </div>
      </div>
    );
  }
}
export default BlockLogs;
