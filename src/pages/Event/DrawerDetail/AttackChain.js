/*
 * @Author: finazhang
 * @Date: 2018-11-03 13:50:15
 * 攻击链还原
 * @Last Modified by: finazhang
 * @Last Modified time: 2018-11-22 12:00:18
 */

import React, { Component } from 'react';
import { connect } from 'umi';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Table, Popover, Pagination, Tooltip, Select, Button } from 'antd';
import moment from 'moment';
import { Link } from 'umi';
import configSettings from '../../../configSettings';
import { CalendarHeatChart } from '@/components/Charts';
import styles from './BasicInfo.less';
// import FilterBlock from '@/components/FilterBlock';

/* eslint-disable react/jsx-no-target-blank */

const { Option } = Select;
@connect(({ attackChainDetail, eventOverview, loading }) => ({
  attackChainDetail,
  eventOverview,
  loading: loading.effects['attackChainDetail/fetchEventList'],
}))
class AttackChain extends Component {
  constructor(props) {
    super(props);
    const { affectedAssets } = this.props;
    this.state = {
      query: {
        ip: affectedAssets[0] && affectedAssets[0].ip,
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        sort: '',
        dir: '',
      },
    };

    this.srcIPList = affectedAssets.map((item) => ({ name: item.ip, value: item.ip }));
    this.columns = [
      {
        title: '告警时间',
        dataIndex: 'tsLatest',
        key: 'tsLatest',
        width: 170,
        sorter: true,
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
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
              }}
            >
              {text}
            </span>
          );
        },
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        key: 'name',
        // width: 280,
        // render: text => <span>{text}</span>,
        render: (text, record) => {
          // const path = this.getEventDetailRoute(record.category_1);
          if (record.iocType) {
            const linkUrl = configSettings.urlKey(record.iocType);
            return (
              <Popover
                content={this.linkPopContent(record.ioc_plaintext, linkUrl)}
                placement="bottomLeft"
              >
                <a
                  style={{ display: 'inline-block', maxWidth: 250 }}
                  onClick={() => {
                    this.detailShowOpen(record);
                  }}
                  // target="_blank"
                  // to={`/event/safeEvent/${path}?id=${record.id}&tsOldest=${record.tsOldest}&tsLatest=${record.tsLatest}`}
                >
                  {text}
                </a>
              </Popover>
            );
          }
          return (
            <a
              style={{ display: 'inline-block', maxWidth: 250 }}
              onClick={() => {
                this.detailShowOpen(record);
              }}
              // target="_blank"
              // to={`/event/safeEvent/${path}?id=${record.id}&tsOldest=${record.tsOldest}&tsLatest=${record.tsLatest}`}
            >
              {text}
            </a>
          );
        },
      },
      {
        title: '受影响资产',
        dataIndex: 'affectedAssets',
        key: 'affectedAssets',
        width: 180,
        render: (text) => {
          if (!text) return <span />;
          const popContent = (
            <div>
              {text.map((item) => {
                if (item.assetName) {
                  return <p style={{ marginBottom: '4px' }}>{`${item.assetName}(${item.ip})`}</p>;
                }
                return <p key={item.ip}>{item.ip ? `${item.ip}` : ''}</p>;
              })}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              {text.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                  title="受影响资产"
                >
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p>
                  {text[0] && text[0].assetName ? (
                    <p>{text[0] ? `${text[0].assetName}(${text[0].ip})` : ''}</p>
                  ) : (
                    <p>{text[0] ? `${text[0].ip}` : ''}</p>
                  )}
                </p>
              )}
            </div>
          );
        },
      },
      {
        title: '源IP',
        dataIndex: 'src',
        key: 'src',
        // width: 140,
        render: (text) => {
          const urls = configSettings.urlKey('ip');
          const popContent = (
            <div>
              {text.map((item) => (
                <div>
                  {item.ipCountry === '内网' ? (
                    <p key={item.ip}>
                      {item.ip}
                      {item.ipCountry ? `(${item.ipCountry})` : ''}
                    </p>
                  ) : (
                    <Popover content={this.urlPopContent(item.ip, urls)} placement="bottomLeft">
                      <p key={item.ip}>
                        {item.ip}
                        {item.ipCountry ? `(${item.ipCountry})` : ''}
                      </p>
                    </Popover>
                  )}
                </div>
              ))}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              {text.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                  title="源IP"
                >
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <div>
                  {text[0] ? (
                    <div>
                      {text[0].ipCountry ? (
                        <div>
                          {text[0].ipCountry === '内网' ? (
                            <p>{`${text[0].ip}(${text[0].ipCountry})`}</p>
                          ) : (
                            <Popover
                              content={this.urlPopContent(text[0].ip, urls)}
                              placement="bottomLeft"
                            >
                              <p>{`${text[0].ip}(${text[0].ipCountry})`}</p>
                            </Popover>
                          )}
                        </div>
                      ) : (
                        <p>{text[0].ip}</p>
                      )}
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '目的IP',
        dataIndex: 'dst',
        key: 'dst',
        // width: 140,
        render: (text) => {
          const urls = configSettings.urlKey('ip');
          const popContent = (
            // <div>
            //   {text.map(item => (
            //     <p key={item.ip}>
            //       {item.ip}
            //       {item.ipCountry ? `(${item.ipCountry})` : ''}
            //     </p>
            //   ))}
            // </div>
            <div>
              {text.map((item) => (
                <div>
                  {item.ipCountry === '内网' ? (
                    <p key={item.ip}>
                      {item.ip}
                      {item.ipCountry ? `(${item.ipCountry})` : ''}
                    </p>
                  ) : (
                    <Popover content={this.urlPopContent(item.ip, urls)} placement="bottomLeft">
                      <p key={item.ip}>
                        {item.ip}
                        {item.ipCountry ? `(${item.ipCountry})` : ''}
                      </p>
                    </Popover>
                  )}
                </div>
              ))}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              {text.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                  title="目的IP"
                >
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                // <p> {text[0] ? `${text[0].ip}${text[0].ipCountry ? `(${text[0].ipCountry})` : ''}` : ''} </p>
                <div>
                  {text[0] ? (
                    <div>
                      {text[0].ipCountry ? (
                        <div>
                          {text[0].ipCountry === '内网' ? (
                            <p>{`${text[0].ip}(${text[0].ipCountry})`}</p>
                          ) : (
                            <Popover
                              content={this.urlPopContent(text[0].ip, urls)}
                              placement="bottomLeft"
                            >
                              <p>{`${text[0].ip}(${text[0].ipCountry})`}</p>
                            </Popover>
                          )}
                        </div>
                      ) : (
                        <p>{text[0].ip}</p>
                      )}
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              )}
            </div>
          );
        },
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch, affectedAssets, tsLatest } = this.props;
    const { query } = this.state;
    const { ip, ...other } = query;
    if (affectedAssets.length === 0) return;
    const selectedObj = affectedAssets.filter((item) => item.ip === query.ip)[0];
    dispatch({
      type: 'attackChainDetail/fetchAttackChain',
      payload: { ipMac: selectedObj.ipMac, tsLatest },
    });
    dispatch({
      type: 'attackChainDetail/fetchEventList',
      payload: { ...other, ipMac: selectedObj.ipMac, tsLatest },
    });
  };

  linkPopContent = (ip, urls) => (
    <div>
      {urls.map((item) => (
        <p>
          <a href={`${item.url}/${ip}`} target="_blank">
            {item.name}
          </a>
        </p>
      ))}
    </div>
  );

  filterOnChange = (type, value) => {
    const { query } = this.state;
    // const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, {
      [type]: value,
    });
    this.setState({
      query: newQuery,
    });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch, affectedAssets, tsLatest } = this.props;
    const selectedObj = affectedAssets.filter((item) => item.ip === query.ip)[0];
    dispatch({
      type: 'attackChainDetail/fetchAttackChain',
      payload: { ipMac: selectedObj.ipMac, tsLatest },
    });
    const { ip, ...other } = query;
    dispatch({
      type: 'attackChainDetail/fetchEventList',
      payload: { ...other, ipMac: selectedObj.ipMac, tsLatest },
    });
  };

  urlPopContent = (ip, urls) => (
    <div>
      {urls.map((item) => (
        <p>
          <a href={`${item.url}/${ip}`} target="blank">
            {item.name}
          </a>
        </p>
      ))}
    </div>
  );

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
    let newQuery;
    if ((current && current !== query.page) || (pageSize && pageSize !== query.pageSize)) {
      newQuery = Object.assign({}, query, {
        page: current,
        pageSize,
      });
    } else {
      const { field, order } = sorter;
      const dir = order.slice(0, -3);
      newQuery = Object.assign({}, query, {
        dir,
        sort: field,
        page: 1,
      });
    }
    this.setState({
      query: newQuery,
    });
    dispatch({
      type: 'attackChainDetail/fetchEventList',
      payload: newQuery,
    });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { affectedAssets, tsLatest } = this.props;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, {
      page,
      pageSize,
    });
    this.setState({
      query: newQuery,
    });
    const { ip, ...other } = query;
    const selectedObj = affectedAssets.filter((item) => item.ip === ip)[0];
    dispatch({
      type: 'attackChainDetail/fetchEventList',
      payload: { ...other, ipMac: selectedObj.ipMac, tsLatest },
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { dispatch, affectedAssets, tsLatest } = this.props;
    const { current, pageSize } = pagination;
    //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
    let newQuery;
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, {
        page: current,
        pageSize,
      });
    } else {
      const { field, order } = sorter;
      const dir = order.slice(0, -3);
      newQuery = Object.assign({}, query, {
        dir,
        sort: field,
        page: 1,
      });
    }
    const { ip, ...other } = newQuery;
    const selectedObj = affectedAssets.filter((item) => item.ip === ip)[0];
    this.setState({ query: newQuery });
    dispatch({
      type: 'attackChainDetail/fetchEventList',
      payload: { ...other, ipMac: selectedObj.ipMac, tsLatest },
    });
  };

  // 右侧详情再次打开
  detailShowOpen = (record) => {
    const {
      dispatch,
      drawerID,
      drawerFLAG,
      eventOverview: { drawerList },
    } = this.props;
    const curDrawerList = drawerList[drawerFLAG][drawerID];
    const lastDrawerObj = curDrawerList[curDrawerList.length - 1];
    const lastId = lastDrawerObj.id;
    if (lastId !== record.id) {
      drawerList[drawerFLAG][drawerID].push(record);
      dispatch({ type: 'eventOverview/saveFilterCount', payload: { drawerList } });
    }
  };

  render() {
    const { query } = this.state;

    const {
      attackChainDetail: { eventList, chartData },
      loading,
      affectedAssets,
    } = this.props;
    const { recordsTotal, list } = eventList;
    if (affectedAssets.length === 0) {
      return <div>没有事件</div>;
    }
    // console.log('affectedAssets', affectedAssets);
    // const popContent = <div>通过对事件中“受影响资产“180天范围内安全事件日历通过时序展现还原与资产相关的安全事件</div>;
    return (
      <div className={styles.chainWrap}>
        <div>
          <div>
            <Select
              style={{ width: 200, marginRight: 20 }}
              onChange={(value) => {
                this.filterOnChange('ip', value);
              }}
              value={query.ip}
            >
              {this.srcIPList.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.name}
                </Option>
              ))}
            </Select>
            <Button type="primary" onClick={this.submitFilter}>
              搜索
            </Button>
          </div>
          <CalendarHeatChart data={chartData} height={300} />
        </div>
        <div style={{ overflow: 'hidden', margin: '0 0 10px' }}>
          <div style={{ float: 'left' }}>
            <Tooltip title=" 通过对事件中“受影响资产“180天范围内安全事件日历，通过时序展现还原与资产相关的安全事件">
              <QuestionCircleFilled className="fontBlue" />
            </Tooltip>
            <span className="fontBlue">{query.ip}</span>
            {`六个月被攻击${recordsTotal}次`}
          </div>
          <div style={{ float: 'right' }}>
            <Pagination
              size="small"
              total={recordsTotal}
              showSizeChanger
              showQuickJumper
              defaultPageSize={query.pageSize}
              pageSizeOptions={configSettings.pageSizeOptions}
              current={query.page}
              showTotal={(total) => `（${total}项）`}
              onChange={this.paginationChange}
              onShowSizeChange={this.paginationChange}
            />
          </div>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={this.columns}
          dataSource={list}
          pagination={{ pageSize: query.pageSize, current: query.page, total: recordsTotal }}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default AttackChain;
