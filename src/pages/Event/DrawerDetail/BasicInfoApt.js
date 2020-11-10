/*
 * @Author: finazhang
 * @Date: 2018-12-29 11:28:43
 * @Last Modified by: finazhang
 * @Last Modified time: 2018-12-29 11:36:38
 * 异常文件详情-基本信息页面
 */
import React, { Component } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Tabs, Col, Row, Spin, Tooltip, Popover, message } from 'antd';
import { connect } from 'umi';
import moment from 'moment';
import ReactJson from 'react-json-view';
import configSettings from '../../../configSettings';
import styles from './BasicInfo.less';
import DialogTabPage from './DialogTabPage';
/* eslint-disable no-underscore-dangle */

const { TabPane } = Tabs;
const { assetValueMap } = configSettings;
const { Fcategory, Fsource } = assetValueMap;

@connect(({ aptDetail, global, msgNotify, loading }) => ({
  aptDetail,
  hasVpc: global.hasVpc,
  locationImgs: msgNotify.locationImgs,
  loading: loading.effects['aptDetail/getEventDetail'],
  logLoading: loading.effects['aptDetail/fetchLogData'],
}))
class BasicInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      srcData: [],
      srcShowMore: false,
      dstData: [],
      dstShowMore: false,
      // logListShowMore: false,
      // imageModal: false,
      // showImage: '',
      query: {
        originalIds: props.aptDetail.eventDetail.originalIds,
        tsOldest: parseInt(props.location.query.tsOldest, 10),
        tsLatest: parseInt(props.location.query.tsLatest, 10),
      },
      warningQuery: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        dir: 'desc',
        sort: 'timestamp',
      },
      logQuery: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        sort: 'timestamp',
        dir: 'desc',
      },
      divChange: {
        // process: true,
        // pic: true,
        log: true,
      },
      assetMap: {},
      assetData: [],
    };

    this.logColumns = [
      {
        title: '日志时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 160,
        sorter: true,
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '内容',
        dataIndex: 'payload',
        key: 'payload',
        render: (text, record) => (
          <div style={{ wordBreak: 'break-all' }}>{JSON.stringify(record)}</div>
        ),
      },
    ];
  }

  componentDidMount() {
    const {
      dispatch,
      // md5,
      aptDetail: { eventDetail },
      location,
    } = this.props;
    const { warningQuery, logQuery, query } = this.state;
    const isNewDrawer = eventDetail._id === location.query.id;
    if (isNewDrawer) {
      console.log('eventDetail=', eventDetail._id, 'location==', location.query.id, isNewDrawer);

      if (query.originalIds) {
        dispatch({ type: 'aptDetail/fetchWarningData', payload: { ...query, ...warningQuery } });
        dispatch({ type: 'aptDetail/fetchLogData', payload: { ...query, ...logQuery } });
      }

      if (eventDetail.src) {
        if (eventDetail.src.length > 2) {
          this.setState({ srcData: eventDetail.src.slice(0, 2) });
        } else {
          this.setState({ srcData: eventDetail.src });
        }
      }
      if (eventDetail.dst) {
        if (eventDetail.dst.length > 2) {
          this.setState({ dstData: eventDetail.dst.slice(0, 2) });
        } else {
          this.setState({ dstData: eventDetail.dst });
        }
      }
      if (eventDetail.affectedAssets) {
        if (eventDetail.affectedAssets.length) {
          const ipmacs = eventDetail.affectedAssets.map((item) => item.ipMac);
          // console.log('ipmacs',ipmacs);
          dispatch({
            type: 'alertDetail/fetchAssetMap',
            payload: { FipVpcids: ipmacs },
          })
            .then((res) => {
              // console.log('res', res);
              this.setState({ assetMap: res });
            })
            .catch((error) => {
              // console.log('受影响资产信息', error);
              message.error(`${error.msg}`);
            });
        }
        const uniqAffectedAssets = _.uniqBy(eventDetail.affectedAssets, 'ipMac');
        console.log('uniqAffectedAssets', uniqAffectedAssets);
        if (uniqAffectedAssets.length > 2) {
          this.setState({ assetData: uniqAffectedAssets.slice(0, 2) });
        } else {
          this.setState({ assetData: uniqAffectedAssets });
        }
      }
    }
  }

  warningTableChange = (pagination, filters, sorter) => {
    const { warningQuery, query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
    let newQuery;
    if (
      (current && current !== warningQuery.page) ||
      (pageSize && pageSize !== warningQuery.pageSize)
    ) {
      newQuery = Object.assign({}, query, warningQuery, { page: current, pageSize });
    } else {
      const { field, order } = sorter;
      const dir = order.slice(0, -3);
      newQuery = Object.assign({}, query, warningQuery, { dir, sort: field, page: 1 });
    }
    this.setState({ warningQuery: newQuery });
    dispatch({ type: 'aptDetail/fetchWarningData', payload: newQuery });
  };

  // backLogShow = () => {
  //   const { logQuery, query } = this.state;
  //   const { dispatch } = this.props;
  //   const newQuery = Object.assign({}, query, logQuery, { page: 1, pageSize: 20 });
  //   this.setState({ logQuery: newQuery, logListShowMore: false });
  //   dispatch({ type: 'aptDetail/fetchLogData', payload: newQuery });
  // };

  showAllSrc = () => {
    const {
      aptDetail: { eventDetail },
    } = this.props;
    this.setState({ srcData: eventDetail.src, srcShowMore: true });
  };

  showAllDst = () => {
    const {
      aptDetail: { eventDetail },
    } = this.props;
    this.setState({ dstData: eventDetail.dst, dstShowMore: true });
  };

  showPartSrc = () => {
    const {
      aptDetail: { eventDetail },
    } = this.props;
    this.setState({ srcData: eventDetail.src.slice(0, 2), srcShowMore: false });
  };

  showPartDst = () => {
    const {
      aptDetail: { eventDetail },
    } = this.props;
    this.setState({ dstData: eventDetail.dst.slice(0, 2), dstShowMore: false });
  };

  logTableChange = (pagination, filters, sorter) => {
    const { logQuery, query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
    let newQuery;
    if ((current && current !== logQuery.page) || (pageSize && pageSize !== logQuery.pageSize)) {
      newQuery = Object.assign({}, query, logQuery, { page: current, pageSize });
    } else {
      const { field, order } = sorter;
      const dir = order.slice(0, -3);
      newQuery = Object.assign({}, query, logQuery, { dir, sort: field, page: 1 });
    }
    this.setState({ logQuery: newQuery });
    dispatch({ type: 'aptDetail/fetchLogData', payload: newQuery });
  };

  // scan = data => {
  //   this.setState({ imageModal: true, showImage: data.src });
  // };

  // paramObj = (md5, name) => {
  //   const params = {};
  //   params.cmd = 'download_pic';
  //   params.md5 = md5;
  //   params.name = name;
  //   return params;
  // };

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

  // 表格 展开收缩相关

  expandedRowRender = (record) => {
    const { id: _id } = record;
    return (
      <Tabs type="card">
        <TabPane tab="会话还原" key="dialog">
          <div key={_id}>
            <div className={styles.pcapWrap}>
              <DialogTabPage record={record} />
            </div>
          </div>
        </TabPane>
        <TabPane tab="JSON格式" key="json" className={styles.reactJsonTab}>
          <div style={{ border: '1px solid #eaedf3' }}>
            <ReactJson
              name={false}
              src={record}
              displayDataTypes={false}
              enableClipboard={false}
              displayObjectSize={false}
              sortKeys
              theme={{
                base00: 'white',
                base01: '#ddd',
                base02: 'white',
                base03: '#444',
                base04: 'purple',
                base05: 'rgba(0, 0, 0, 0.75)',
                base06: '#444',
                base07: 'rgb(49, 132, 149)',
                base08: '#444',
                base09: 'rgb(3, 106, 7)',
                base0A: 'rgba(0, 0, 0, 0.65)',
                base0B: 'rgba(70, 70, 230, 1)',
                base0C: 'rgb(49, 132, 149)',
                base0D: 'rgba(0, 0, 0, 0.55)',
                base0E: 'rgba(0, 0, 0, 0.55)',
                base0F: 'rgba(70, 70, 230, 1)',
              }}
            />
          </div>
        </TabPane>
        <TabPane tab="原始日志" key="log">
          <div>
            <div className={styles.pcapWrap}>
              <div className={styles.pcapDiv}>
                <div className={styles.pcapTitle}>
                  <span>原始日志</span>
                </div>
                <div className={styles.pcapCxt}>
                  <div style={{ wordBreak: 'break-all' }}>{JSON.stringify(record)}</div>
                </div>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
    );
  };

  ipListShow = (ipData) => {
    const {
      aptDetail: { ipCateObj },
      locationImgs,
    } = this.props;
    const urls = configSettings.urlKey('ip');
    const ipListEle = ipData.map((item) => (
      <div>
        {item.ipCountry === '内网' ? (
          <span>
            {item.ip}/{item.port}
            &nbsp;
            {ipCateObj[item.ip] && (
              <span
                className={
                  styles[`${ipCateObj[item.ip] === '攻击者' ? 'spanAttacker' : 'spanVictim'}`]
                }
              >
                {ipCateObj[item.ip]}
              </span>
            )}
          </span>
        ) : (
          <Popover content={this.urlPopContent(item.ip, urls)} placement="bottomLeft">
            <span>
              {item.ip}/{item.port}&nbsp;
              {item.ipCountry && locationImgs.indexOf(item.ipCountry) > -1 && (
                <span
                  title={`${item.ipCountry}${item.ipProvince ? ` ${item.ipProvince}` : ''}${
                    item.ipCity && configSettings.topCity.indexOf(item.ipCity) < 0
                      ? ` ${item.ipCity}`
                      : ''
                  }`}
                  className={styles.locationSpan}
                  style={{ backgroundImage: `url('/image/location/${item.ipCountry}.svg')` }}
                />
              )}
              {item.ipCountry && locationImgs.indexOf(item.ipCountry) < 0 && (
                <span> ({item.ipCountry})</span>
              )}
              &nbsp;
              {ipCateObj[item.ip] && (
                <span
                  className={
                    styles[`${ipCateObj[item.ip] === '攻击者' ? 'spanAttacker' : 'spanVictim'}`]
                  }
                >
                  {ipCateObj[item.ip]}
                </span>
              )}
            </span>
          </Popover>
        )}
      </div>
    ));
    return ipListEle;
  };

  divChangeClick = (key) => {
    const { divChange } = this.state;
    const oldStatus = divChange[key];
    const newDivchange = { ...divChange, [key]: !oldStatus };
    this.setState({ divChange: newDivchange });
  };

  formatNum = (num) => {
    if (num >= 0 && num < 1024) {
      return `${num}B`;
    }
    if (num >= 1024 && num < 1024 * 1024) {
      return `${(num / 1024).toFixed(2)}KB`;
    }

    if (num >= 1024 * 1024 && num < 1024 * 1024 * 1024) {
      return `${(num / 1024 / 1024).toFixed(2)}MB`;
    }

    if (num >= 1024 * 1024 * 1024) {
      return `${(num / 1024 / 1024 / 1024).toFixed(2)}GB`;
    }
  };

  render() {
    const {
      aptDetail: { eventDetail, logData },
      hasVpc,
      loading,
      // md5,
    } = this.props;

    const {
      divChange,
      srcData,
      srcShowMore,
      dstData,
      assetData,
      assetMap,
      dstShowMore,
    } = this.state;
    // const urls = configSettings.urlKey('ip');
    const md5Url = configSettings.urlKey('md5');

    if (loading)
      return (
        <div>
          <Spin />
        </div>
      );
    return (
      <div>
        <div style={{ padding: '0 20px' }}>
          <Row>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>告警时间:</span>{' '}
                <span className={styles.text}>
                  {moment(eventDetail.tsLatest).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </p>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>攻击意图:</span>{' '}
                <span className={styles.text}>{eventDetail.attackStage}</span>
              </p>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>模块:</span>{' '}
                <span className={styles.text}>{eventDetail.category_1}</span>
              </p>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>分类:</span>{' '}
                <span className={styles.text}>{eventDetail.category_2}</span>
              </p>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>文件名:</span>{' '}
                <span className={styles.text}>{eventDetail.fileName}</span>
              </p>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>文件类型:</span>
                <span className={styles.text}>{eventDetail.fileType}</span>
              </p>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>病毒名:</span>{' '}
                <span className={styles.text}>{eventDetail.virusName}</span>
              </p>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>MD5:</span>
                <Popover
                  content={this.urlPopContent(eventDetail.md5, md5Url)}
                  placement="bottomLeft"
                >
                  <span>{eventDetail.md5}</span>
                </Popover>
                {/* <span className={styles.text}>{eventDetail.md5}</span> */}
              </p>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <div className={styles.row}>
                <div style={{ width: 100 }}>
                  <span className={styles.name}>受影响资产:</span>
                </div>
                <div className={styles.text}>
                  {eventDetail.affectedAssets &&
                    assetData.map((item) => {
                      console.log('item', item);
                      if (assetMap[`${item.ipMac}`]) {
                        const { assets, find } = assetMap[`${item.ipMac}`];
                        if (assets.length) {
                          const obj = assets[0];
                          const popContent = (
                            <div className={styles.popCon}>
                              <p>
                                <span>IP:</span>
                                <span>{obj.Fip}</span>
                              </p>
                              {hasVpc ? (
                                <p>
                                  <span className={styles.name}>VPCID:</span>
                                  <span>{obj.Fvpcid}</span>
                                </p>
                              ) : null}
                              <p>
                                <span>MAC:</span>
                                <span>{obj.Fmac}</span>
                              </p>
                              <p>
                                <span>端口:</span>
                                <span>
                                  {obj.Fport
                                    ? obj.Fport.split(',')
                                        .filter((v_item) => v_item !== '')
                                        .join(',')
                                    : ''}
                                </span>
                              </p>
                              <p>
                                <span>资产名称:</span>
                                <span>{obj.Fasset_name}</span>
                              </p>
                              <p>
                                <span>资产类型:</span>
                                <span>{Fcategory[obj.Fcategory]}</span>
                              </p>
                              <p>
                                <span>资产分组:</span>
                                <span>{obj.Fgroup_name}</span>
                              </p>
                              <p>
                                <span>操作系统:</span>
                                <span
                                  title={
                                    obj.Fos_type
                                      ? obj.Fos_type.split(',')
                                          .filter((v_item) => v_item !== '')
                                          .join(',')
                                      : ''
                                  }
                                >
                                  {obj.Fos_type
                                    ? obj.Fos_type.split(',')
                                        .filter((v_item) => v_item !== '')
                                        .join(',')
                                    : ''}
                                </span>
                              </p>
                              <p>
                                <span>资产来源:</span>
                                <span>{Fsource[obj.Fsource]}</span>
                              </p>
                              <p>
                                <span>创建时间:</span>
                                <span>
                                  {obj.Finsert_time && obj.Finsert_time !== '0000-00-00 00:00:00'
                                    ? moment(obj.Finsert_time).format('YYYY-MM-DD HH:mm:ss')
                                    : '暂无'}
                                </span>
                              </p>
                              <p>
                                <span>更新时间:</span>
                                <span>
                                  {obj.Fupdate_time && obj.Fupdate_time !== '0000-00-00 00:00:00'
                                    ? moment(obj.Fupdate_time).format('YYYY-MM-DD HH:mm:ss')
                                    : '暂无'}
                                </span>
                              </p>
                            </div>
                          );
                          return (
                            <div key={item.ip}>
                              <Popover
                                getPopupContainer={(triggerNode) => triggerNode}
                                placement="bottom"
                                content={popContent}
                                trigger="click"
                                style={{ marginRight: 5 }}
                              >
                                <a style={{ marginRight: 5, cursor: 'pointer' }}>
                                  {item.ip ? `${item.ip}` : ''}
                                </a>
                              </Popover>
                            </div>
                          );
                        }
                        if (find.length) {
                          const obj = find[0];
                          const popContent = (
                            <div className={styles.popCon}>
                              <p>
                                <span className={styles.name}>IP:</span>
                                <span>{obj.Fip}</span>
                              </p>
                              {hasVpc ? (
                                <p>
                                  <span className={styles.name}>VPCID:</span>
                                  <span>{obj.Fvpcid}</span>
                                </p>
                              ) : null}
                              <p>
                                <span className={styles.name}>MAC:</span>
                                <span>{obj.Fmac}</span>
                              </p>
                              <p>
                                <span className={styles.name}>开放端口:</span>
                                <span
                                  title={
                                    obj.Fport
                                      ? obj.Fport.split(',')
                                          .filter((v_item) => v_item !== '')
                                          .join(',')
                                      : ''
                                  }
                                >
                                  {obj.Fport
                                    ? obj.Fport.split(',')
                                        .filter((v_item) => v_item !== '')
                                        .join(',')
                                    : ''}
                                </span>
                              </p>
                              <p>
                                <span className={styles.name}>操作系统:</span>
                                <span>
                                  {obj.Fos_type
                                    ? obj.Fos_type.split(',')
                                        .filter((v_item) => v_item !== '')
                                        .join(',')
                                    : ''}
                                </span>
                              </p>
                              <p>
                                <span className={styles.name}>主机名:</span>
                                <span>{obj.Fhost_name}</span>
                              </p>
                              <p>
                                <span className={styles.name}>资产域名:</span>
                                <span>{obj.Fdomain_name}</span>
                              </p>
                              <p>
                                <span className={styles.name}>服务类型:</span>
                                <span>
                                  {obj.Fserver_type
                                    ? obj.Fserver_type.split(',')
                                        .filter((v_item) => v_item !== '')
                                        .join(',')
                                    : ''}
                                </span>
                              </p>
                              <p>
                                <span className={styles.name}>组件信息:</span>
                                <span
                                  title={
                                    obj.Fcomponent_info
                                      ? obj.Fcomponent_info.split(',')
                                          .filter((v_item) => v_item !== '')
                                          .join(',')
                                      : ''
                                  }
                                >
                                  {obj.Fcomponent_info
                                    ? obj.Fcomponent_info.split(',')
                                        .filter((v_item) => v_item !== '')
                                        .join(',')
                                    : ''}
                                </span>
                              </p>
                              <p>
                                <span className={styles.name}>接收数据量:</span>
                                <span>{this.formatNum(obj.Frecv_bytes)}</span>
                              </p>
                              <p>
                                <span className={styles.name}>发送数据量: </span>
                                <span>{this.formatNum(obj.Fsend_bytes)}</span>
                              </p>
                              <p>
                                <span className={styles.name}>发现时间:</span>
                                <span>
                                  {obj.Finsert_time && obj.Finsert_time !== '0000-00-00 00:00:00'
                                    ? moment(obj.Finsert_time).format('YYYY-MM-DD HH:mm:ss')
                                    : '暂无'}
                                </span>
                              </p>
                              <p>
                                <span className={styles.name}>更新时间:</span>
                                <span>
                                  {obj.Fupdate_time && obj.Fupdate_time !== '0000-00-00 00:00:00'
                                    ? moment(obj.Fupdate_time).format('YYYY-MM-DD HH:mm:ss')
                                    : '暂无'}
                                </span>
                              </p>
                            </div>
                          );
                          return (
                            <div key={item.ip}>
                              <Popover
                                getPopupContainer={(triggerNode) => triggerNode}
                                placement="bottom"
                                content={popContent}
                                trigger="click"
                              >
                                <a style={{ marginRight: 5, cursor: 'pointer' }}>
                                  {item.ip ? `${item.ip}` : ''}
                                </a>
                              </Popover>
                            </div>
                          );
                        }
                      }
                      return (
                        <p key={item.ip}>
                          <span>{item.ip ? `${item.ip}` : ''}</span>
                        </p>
                      );
                    })}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>协议:</span>{' '}
                <span className={styles.text}>{eventDetail.protocol}</span>
              </p>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <div className={styles.row}>
                <div style={{ width: 100 }}>
                  <span className={styles.name}>源IP/端口:</span>
                </div>
                <div>
                  {eventDetail.src && this.ipListShow(srcData)}
                  {!srcShowMore &&
                    eventDetail.src &&
                    eventDetail.src.length > 2 &&
                    srcData.length <= 2 && (
                      <span
                        style={{ color: '#2662EE', cursor: 'pointer' }}
                        onClick={this.showAllSrc}
                      >
                        查看全部
                      </span>
                    )}
                  {srcShowMore && eventDetail.src && srcData.length > 2 && (
                    <span
                      style={{ color: '#2662EE', cursor: 'pointer' }}
                      onClick={this.showPartSrc}
                    >
                      收起
                    </span>
                  )}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.row}>
                <div style={{ width: 100 }}>
                  <span className={styles.name}>目的IP/端口:</span>
                </div>
                <div>
                  {eventDetail.dst && this.ipListShow(dstData)}
                  {!dstShowMore &&
                    eventDetail.dst &&
                    eventDetail.dst.length > 2 &&
                    dstData.length <= 2 && (
                      <span style={{ color: '#2662EE' }} onClick={this.showAllDst}>
                        查看全部
                      </span>
                    )}
                  {dstShowMore && eventDetail.dst && dstData.length > 2 && (
                    <span style={{ color: '#2662EE' }} onClick={this.showPartDst}>
                      收起
                    </span>
                  )}
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>
                  置信度
                  {` `}
                  <Tooltip title=" “置信度”反映该事件的可信程度">
                    <QuestionCircleFilled className="fontBlue" />
                  </Tooltip>
                  {` :`}
                </span>
                <span className={styles.text}>
                  {eventDetail.confidence}({configSettings.confidenceLabel(eventDetail.confidence)})
                </span>
              </p>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>数据源:</span>
                <span className={styles.text}>
                  {eventDetail.probeName}({eventDetail.probeIp || ''})
                </span>
              </p>
            </Col>
          </Row>
          <Row>
            {hasVpc ? (
              <Col span={12}>
                <p className={styles.row}>
                  <span className={styles.name}>VPCID:</span>
                  <span className={styles.text}>{eventDetail.vpcid || ''}</span>
                </p>
              </Col>
            ) : null}
          </Row>
        </div>

        {logData.list[0] && (
          <div>
            <div className={styles.titleDiv}>
              <span
                className={styles.themeSpan}
                onClick={() => {
                  this.divChangeClick('log');
                }}
              >
                日志详情
              </span>
              <a
                onClick={() => {
                  this.divChangeClick('log');
                }}
              >
                {divChange.log ? '收起' : '展开'}
              </a>
            </div>
            {divChange.log && (
              <div className={styles.ctxDiv}>
                <div className={styles.warnTable}>{this.expandedRowRender(logData.list[0])}</div>
              </div>
            )}
          </div>
        )}

        {/* <Modal
          visible={imageModal}
          footer={null}
          width="588px"
          onCancel={() => {
            this.setState({ imageModal: false });
          }}
        >
          <div style={{ width: '540px', height: '400px', marginTop: '30px' }}>
            <img src={showImage} alt="" style={{ width: '100%', height: '100%' }} />
          </div>
        </Modal> */}
      </div>
    );
  }
}

export default BasicInfo;
