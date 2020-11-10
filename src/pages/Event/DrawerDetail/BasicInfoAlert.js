/*
 * @Author: finazhang
 * @Date: 2018-12-29 11:28:09
 * @Last Modified by: finazhang
 * @Last Modified time: 2019-01-30 14:58:22
 * 入侵感知详情-基本信息页面
 */

import React, { Component } from 'react';
import { message, Button, Col, Tabs, Row, Table, Spin, Modal, Popover, Tooltip, Tag } from 'antd';
import ReactJson from 'react-json-view';
import { connect } from 'umi';
import Cookies from 'js-cookie';
// import { Link } from 'umi';
import moment from 'moment';
import _ from 'lodash';
import configSettings from '../../../configSettings';
// import DialogModal from './DialogModal';
import DialogTabPage from './DialogTabPage';
import styles from './BasicInfo.less';
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-eval */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-no-target-blank */

const { TabPane } = Tabs;
const formatDate = 'YYYY-MM-DD';
const formatTime = 'HH:mm:ss';
const { assetValueMap } = configSettings;
const { Fcategory, Fsource } = assetValueMap;

@connect(({ alertDetail, global, msgNotify, loading }) => ({
  alertDetail,
  hasVpc: global.hasVpc,
  locationImgs: msgNotify.locationImgs,
  loading: loading.effects['alertDetail/fetchEventDetail'],
  warnLoading: loading.effects['alertDetail/fetchWarningData'],
  pcapLoading: loading.effects['alertDetail/fetchPcapInfo'],
}))
class BasicInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // dialogWidth: 1200,
      expandedRowKeys: [],
      expandedRowPcap: {},
      warningListShowMore: false,
      srcData: [],
      srcShowMore: false,
      assetShowMore: false,
      assetData: [],
      assetMap: {},
      dstData: [],
      dstShowMore: false,

      showPacpModal: false,
      // dialogModalVisible: false,
      // dialogRecord: {},
      query: {
        originalIds: props.alertDetail.eventDetail.originalIds,
        tsOldest: parseInt(props.location.query.tsOldest, 10),
        tsLatest: parseInt(props.location.query.tsLatest, 10),
      },
      warningQuery: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        sort: 'timestamp',
        dir: 'desc',
      },
      // logQuery: { page: 1, pageSize: parseInt(configSettings.pageSizeOptions[0], 10), sort: 'timestamp', dir: 'desc' },
      divChange: {
        desc: true,
        sugg: true,
        warn: true,
      },
    };
    this.warningColumns = [
      {
        title: '告警时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        // width: 180,
        sorter: true,
        render: (text) => (
          <div style={{ whiteSpace: 'noWrap' }}>
            <div>{moment(text).format(formatDate)}</div>
            <div>{moment(text).format(formatTime)}</div>
          </div>
        ),
      },
      {
        title: '触发规则',
        width: 225,
        render: (text, record) => {
          const {
            alertDetail: { ruleNameObj, eventDetail, blockEventRes },
          } = this.props;
          let ruleName = '';
          let signatureId; // signature_id 为规则id  gid为事件id
          if (record && record.alert && typeof record.alert.signature_id === 'number') {
            signatureId = record.alert.signature_id;
            ruleName = ruleNameObj[signatureId] || eventDetail.name;
          }
          const blockJson = blockEventRes[record.id] || {};
          const { showBlockFlag } = blockJson;

          // console.log('author==', author);
          const showVal = `${ruleName || eventDetail.name} (${signatureId})`;
          return (
            <span style={{ display: 'inline-block', width: 200, wordBreak: 'break-all' }}>
              {showVal}
              {showBlockFlag && <span className={styles.spanSucc}>调用阻断</span>}
            </span>
          );
        },
      },
      {
        title: '置信度',
        dataIndex: 'confidence',
        key: 'confidence',
        width: 60,
        // render: text => configSettings.confidenceLabel(text),
      },
      {
        title: '源IP',
        dataIndex: 'src_ip',
        key: 'src_ip',
        render: (text, record) => {
          let xffVal = [];
          if (record.http && record.http.xff) {
            xffVal = record.http.xff.split(',');
          }
          const xffContent = (
            <div>
              {xffVal.map((tmp) => (
                <div key={tmp} style={{ padding: '2px 5px ' }}>
                  {tmp}
                </div>
              ))}
            </div>
          );
          return (
            <span style={{ display: 'inline-block', wordBreak: 'break-all' }}>
              {text}
              {xffVal.length > 0 && (
                <Tooltip placement="rightTop" title={xffContent}>
                  <span className={styles.spanNot}>XFF</span>
                </Tooltip>
              )}
            </span>
          );
        },
      },
      { title: '源端口', dataIndex: 'src_port', key: 'src_port', width: 58 },
      {
        title: '目的IP',
        dataIndex: 'dst_ip',
        key: 'dst_ip',
        render: (text) => {
          return <span style={{ display: 'inline-block', wordBreak: 'break-all' }}>{text}</span>;
        },
      },
      { title: '目的端口', dataIndex: 'dst_port', key: 'dst_port', width: 72 },
      {
        title: '操作',
        dataIndex: '',
        key: 'action',
        width: 88,
        render: (text, record) => {
          const {
            timestamp,
            id,
            esIndex,
            src_ip,
            dst_ip,
            dst_port,
            brute_info: bruteInfo,
          } = record;
          let sgid;
          if (record.alert && record.alert.gid) {
            sgid = record.alert.gid;
          }
          let pcapdown = true;
          let startTime = moment(timestamp).subtract(1, 'seconds').valueOf();
          let endTime = moment(timestamp).add(1, 'seconds').valueOf();
          let type = esIndex.split('-')[1];
          let constr = record.flow_id;
          if (sgid === 100000 || sgid === 100001 || sgid === 100002) {
            pcapdown = false;
            startTime = moment(timestamp).subtract(60, 'seconds').valueOf();
            endTime = moment(timestamp).valueOf();
            type = 'tcp/udp';
            if (sgid === 100000) {
              constr = `(src_ip:${src_ip}) AND (dst_port:${dst_port})`;
            } else {
              constr = `(src_ip:${src_ip}) AND (dst_ip:${dst_ip})`;
            }
          }

          if (sgid === 100003) {
            const { type: bruteType } = bruteInfo;
            pcapdown = false;
            startTime = moment(timestamp).subtract(60, 'seconds').valueOf();
            endTime = moment(timestamp).valueOf();
            type = 'login';
            if (bruteType === 'vertical') {
              constr = `event_type:login AND src_ip:${src_ip} AND dst_ip:${dst_ip}`;
            } else {
              constr = `event_type:login AND src_ip:${src_ip}`;
            }
          }

          if (sgid === 100004 || sgid === 100005) {
            pcapdown = false;
          }

          let showOperateBtns = true;
          if (
            record &&
            record.alert &&
            record.alert.signature_id &&
            record.alert.signature_id === 1
          ) {
            showOperateBtns = false;
          }

          if (!showOperateBtns) {
            return <span />;
          }

          return (
            <div>
              {pcapdown && (
                <div>
                  <a
                    style={{ marginRight: 8 }}
                    onClick={(e) => {
                      window.location.href = `/api/event/downloadPcapInfo?id=${encodeURIComponent(
                        id
                      )}&startTime=${startTime}&endTime=${endTime}&esIndex=${esIndex}`;
                      e.stopPropagation();
                    }}
                  >
                    PCAP下载
                  </a>
                </div>
              )}
              <div>
                <a
                  onClick={(e) => {
                    const urlAddr = `/analysis/search?type=${type}&startTime=${startTime}&endTime=${endTime}&condition=${constr}`;
                    window.open(urlAddr, '_blank');
                    e.stopPropagation();
                  }}
                >
                  检索
                </a>
              </div>
            </div>
          );
        },
      },
    ];
    if (props.hasVpc) {
      this.warningColumns.splice(2, 0, {
        title: 'VPCID',
        dataIndex: 'vpcid',
        key: 'vpcid',
        // width: 80,
      });
    }
  }

  componentDidMount() {
    const {
      dispatch,
      alertDetail: { eventDetail },
      location,
    } = this.props;
    const { warningQuery, query } = this.state;
    const isNewDrawer = eventDetail._id === location.query.id;
    if (isNewDrawer) {
      console.log('eventDetail=', eventDetail._id, 'location==', location.query.id, isNewDrawer);

      if (query.originalIds) {
        dispatch({
          type: 'alertDetail/fetchWarningData',
          payload: {
            ...query,
            ...warningQuery,
          },
        });
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
              console.log('受影响资产信息', error);
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

  componentDidUpdate = (prevProps) => {
    const {
      alertDetail: { pcapInfo },
    } = this.props;
    if (pcapInfo.html !== prevProps.alertDetail.pcapInfo.html) {
      // const extractscript = /<script\b[^>]*>[\s\S]*<\/script>/g.exec(pcapInfo.html);
      const extractscript = /<script\b[^>]*>([\s\S]*?)<\/script>/gm.exec(pcapInfo.html);
      // console.log('extractscript', extractscript[0]);
      const script = extractscript[0].substring(32, extractscript[0].length - 11);
      try {
        window.eval(script);
      } catch (error) {
        console.log(error);
      }
    }
  };

  fetchPcap = (id, startTime, endTime, esIndex) => {
    const { dispatch } = this.props;
    this.setState({ showPacpModal: true });
    dispatch({ type: 'alertDetail/fetchPcapInfo', payload: { id, startTime, endTime, esIndex } })
      .then(() => {})
      .catch((err) => {
        message.error(err.msg);
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
    dispatch({ type: 'alertDetail/fetchWarningData', payload: newQuery });
  };

  backWarningShow = () => {
    const { warningQuery, query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, warningQuery, { page: 1, pageSize: 20 });
    this.setState({ warningQuery: newQuery, warningListShowMore: false });
    dispatch({ type: 'alertDetail/fetchWarningData', payload: newQuery });
  };

  showAllAsset = () => {
    const {
      alertDetail: { eventDetail },
    } = this.props;
    this.setState({ assetData: eventDetail.affectedAssets, assetShowMore: true });
  };

  showAllSrc = () => {
    const {
      alertDetail: { eventDetail },
    } = this.props;
    this.setState({ srcData: eventDetail.src, srcShowMore: true });
  };

  showAllDst = () => {
    const {
      alertDetail: { eventDetail },
    } = this.props;
    this.setState({ dstData: eventDetail.dst, dstShowMore: true });
  };

  showPartSrc = () => {
    const {
      alertDetail: { eventDetail },
    } = this.props;
    this.setState({ srcData: eventDetail.src.slice(0, 2), srcShowMore: false });
  };

  showPartDst = () => {
    const {
      alertDetail: { eventDetail },
    } = this.props;
    this.setState({ dstData: eventDetail.dst.slice(0, 2), dstShowMore: false });
  };

  showPartAsset = () => {
    const {
      alertDetail: { eventDetail },
    } = this.props;
    this.setState({ assetData: eventDetail.affectedAssets.slice(0, 2), assetShowMore: false });
  };

  // 事件描述。
  eventDescription = (signatureId, description) => {
    const {
      alertDetail: {
        warningData: { list },
      },
    } = this.props;
    let showDesc = '暂无';
    // 没准以前得老日志缺啥字段，报错了显示暂无 拉倒
    try {
      // 爆破
      if (signatureId === 100003) {
        let bruteDescInfo;
        list.forEach((obj, idx) => {
          const { brute_info: bruteInfo } = obj;
          if (idx === 0) {
            const { attacker, victim, login_cnt, fail_cnt, username, password_num } = bruteInfo;
            bruteDescInfo = {
              src: Array.isArray(attacker) ? attacker.join('、') : attacker,
              dst: Array.isArray(victim) ? victim.join('、') : victim,
              loginCnt: login_cnt,
              fallCnt: fail_cnt,
              users: username.join('、'),
              pwdNum: password_num,
            };
          }
        });
        if (bruteDescInfo) {
          const { src, dst, loginCnt, fallCnt, users, pwdNum } = bruteDescInfo;
          const userInfo = users ? `，尝试的用户名有${users}等` : '';
          const pwdInfo = pwdNum ? `，尝试的密码数有${pwdNum}个` : '';
          showDesc = `主机${src}对${dst}发起暴力破解，尝试登录${loginCnt}次，失败${fallCnt}次${userInfo}${pwdInfo}。`;
        }
        return showDesc;
      }
      // 端口扫描
      if (signatureId === 100000 || signatureId === 100001 || signatureId === 100002) {
        const typeData = [];
        const scannerData = [];
        let typeArr = [];
        let scannerArr = [];
        let ipArr = [];
        let portArr = [];
        const ipData = [];
        const portData = [];
        let sumNum;
        list.forEach((obj, idx) => {
          const { scan_info: scanInfo } = obj;
          const { type, scanner, target_ip, target_port, sum } = scanInfo;

          if (type) {
            typeArr = Array.isArray(type) ? type : [type];
            typeArr.forEach((typeVal) => {
              if (typeData.indexOf(typeVal) < 0) {
                typeData.push(typeVal);
              }
            });
          }
          if (scanner) {
            scannerArr = Array.isArray(scanner) ? scanner : [scanner];
          }
          if (target_ip) {
            ipArr = Array.isArray(target_ip) ? target_ip : [target_ip];
          }
          if (target_port) {
            portArr = Array.isArray(target_port) ? target_port : [target_port];
          }
          // if (type === 'ip_scan') {
          // 只取第一条日志
          if (idx === 0) {
            sumNum = sum;
            scannerArr.forEach((sVal) => {
              if (scannerData.indexOf(sVal) < 0) {
                scannerData.push(sVal);
              }
            });
            ipArr.forEach((iVal) => {
              if (ipData.indexOf(iVal) < 0) {
                ipData.push(iVal);
              }
            });
            portArr.forEach((pVal) => {
              if (portData.indexOf(pVal) < 0) {
                portData.push(pVal);
              }
            });
          }
        });

        if (typeData[0] === 'port_scan') {
          showDesc = `${scannerData.join('、')} 主机对 ${ipData.join(
            '、'
          )} 目标主机发起端口扫描，共扫描${sumNum}个端口，扫描的端口包括：${portData.join('、')}。`;
        }
        if (typeData[0] === 'port_sweep') {
          showDesc = `${scannerData.join('、')} 主机对多个目标主机发起针对 ${portData.join(
            '、'
          )} 端口的扫描，共扫描${sumNum}个目标主机，目标主机包括：${ipData.join('、')}。`;
        }
        return showDesc;
      }
      // 邮件
      if (signatureId === 100004 || signatureId === 100005) {
        let mailFrom = ''; // 邮件发送者
        let reptTO = ''; // 邮件接收者
        let subject = ''; // 邮件主题
        const ioc_Tags = {}; // 钓鱼链接标签
        let domain = ''; // 服务器域名
        let ip = '';
        list.forEach((obj, idx) => {
          const { smtp, email, alert } = obj;
          if (idx === 0) {
            mailFrom = smtp.mail_from || 'null';
            reptTO = smtp.rcpt_to ? smtp.rcpt_to.toString() : 'null';
            subject = email.subject || 'null';
            if (signatureId === 100005) {
              const { iocs } = alert;
              iocs.forEach((iocItem) => {
                const { ioc_level1_tags, ioc, ioc_plaintext } = iocItem;
                ioc_Tags[`${ioc_plaintext}-`] = ioc_level1_tags;
              });
            }
            if (signatureId === 100004) {
              // eslint-disable-next-line prefer-destructuring
              domain = alert.domain;
              // eslint-disable-next-line prefer-destructuring
              ip = alert.ip;
            }
          }
        });
        if (signatureId === 100005) {
          showDesc = `在发送者（${mailFrom}）发给接收者（${reptTO}）的主题为“${subject}”的邮件中，发现了钓鱼链接：`;
          const iocKeys = Object.keys(ioc_Tags);
          const iocs = iocKeys.map((key) => {
            const iocItems = ioc_Tags[key].map((tag, tagIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <Tag color="magenta" key={tagIndex}>
                {tag}
              </Tag>
            ));
            return (
              <span key={key}>
                {key}
                {iocItems}
              </span>
            );
          });

          return (
            <div>
              <span>{showDesc}</span>
              {iocs}
            </div>
          );
        }
        if (signatureId === 100004) {
          showDesc = `接收者（${reptTO}）收到来自（${mailFrom}）的邮件，其发送邮件服务器域名（${domain}）和IP（${ip}）与SPF记录不符，疑似邮件伪造攻击。`;
        }
        return showDesc;
      }
    } catch (error) {
      console.error('eventDescription error', error);
      return '暂无';
    }
    return description || '暂无';
  };

  // 处置建议
  eventProcessSuggest = (signatureId, processSuggest) => {
    if (signatureId === 100004 || signatureId === 100005) {
      const {
        alertDetail: {
          warningData: { list },
        },
      } = this.props;
      try {
        if (
          processSuggest &&
          processSuggest.indexOf('[RCPT_TO]') !== -1 &&
          list &&
          list.length > 0 &&
          list[0].smtp &&
          list[0].smtp.rcpt_to &&
          Array.isArray(list[0].smtp.rcpt_to) &&
          list[0].smtp.rcpt_to.length > 0
        ) {
          const rcptTo = `（${list[0].smtp.rcpt_to.toString()}）`;
          const newProcessSuggest = processSuggest.replace('[RCPT_TO]', rcptTo);
          return newProcessSuggest;
        }
        return '暂无';
      } catch (error) {
        console.error('eventProcessSuggest error', error);
        return '暂无';
      }
    }
    return processSuggest || '暂无';
  };

  // 表格 展开收缩相关

  expandedRowRender = (record) => {
    // console.log(12344, '12344record==', record);
    const {
      pcapLoading,
      // search: { esSearchFields },
    } = this.props;
    const { expandedRowPcap } = this.state; // selectFields,, dialogWidth

    // const diaLogWrapWid = dialogWidth - 128;
    const {
      id: _id,
      alert: { gid },
    } = record;
    // console.log(12344, 22, '显示pcap的标签页时expandedRowPcap==', expandedRowPcap);
    // console.log(12344, 23, '当前id的pcap数据==', expandedRowPcap[_id]);
    // console.log(123445, 'expandedRowPcap[_id] && expandedRowPcap[_id].html==', expandedRowPcap[_id] && expandedRowPcap[_id].html);
    let pcapShow = false;
    if (expandedRowPcap[_id] && expandedRowPcap[_id].html) {
      pcapShow = true;
      const pcapHtml = expandedRowPcap[_id].html;

      const extractscript = /<script\b[^>]*>([\s\S]*?)<\/script>/gm.exec(pcapHtml);
      // console.log('extractscript', extractscript[0]);
      const script = extractscript[0].substring(32, extractscript[0].length - 11);
      try {
        window.eval(script);
      } catch (error) {
        console.log('pcap window.eval==', error);
      }
    }

    return (
      <Tabs type="card" style={{ textAlign: 'left' }}>
        {gid >= 100000 && gid <= 101000 ? null : (
          <TabPane tab="会话还原" key="dialog">
            <div key={_id}>
              <div className={styles.pcapWrap} style={{ width: 886 }}>
                <DialogTabPage record={record} />
              </div>
            </div>
          </TabPane>
        )}

        {(expandedRowPcap[_id] !== undefined && expandedRowPcap[_id].flowReq === 'false') ||
        (gid >= 100000 && gid <= 101000) ? null : (
          <TabPane tab="PCAP查看" key="pcap">
            {pcapLoading && !expandedRowPcap[_id] ? (
              <div>
                <Spin />
              </div>
            ) : (
              <div>
                {pcapShow ? (
                  <div className={styles.pcapWrap}>
                    <div className={styles.pcapDiv}>
                      <div className={styles.pcapTitle}>
                        <span>PCAP信息</span>
                      </div>
                      <div className={styles.pcapCxt}>
                        <div
                          id={_id}
                          className="pcapSetInnerHTML"
                          dangerouslySetInnerHTML={{ __html: expandedRowPcap[_id].html }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px' }}>暂无pcap信息</div>
                )}
              </div>
            )}
          </TabPane>
        )}
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

  onExpandedRowsChange = (expandedRows) => {
    const { expandedRowKeys, expandedRowPcap } = this.state;
    let newExpandedRowPcap = expandedRowPcap;
    const curKeys = Object.keys(expandedRowPcap);
    // console.log('============================');
    // console.log(5, 'pcap数据对象curKeys==', curKeys);
    // console.log(5, '之前展开状态expandedRowKeys==', expandedRowKeys);
    // console.log(5, '当前展开状态expandedRows==', expandedRows);
    if (expandedRows.length > expandedRowKeys.length) {
      let newPcapObj = {};
      // let pcapKey = '';
      // 新增pcap对象的键名
      const newKeyArr = expandedRows.filter((tmpKey) => curKeys.indexOf(tmpKey) < 0);
      const pcapKey = newKeyArr[0];
      // console.log(6, '新增的pcap键名pcapKey==', pcapKey, 'newKeyArr==', newKeyArr);
      const {
        alertDetail: {
          warningData: { list },
        },
        dispatch,
      } = this.props;
      if (pcapKey) {
        const curRow = list.filter((obj) => obj.id === pcapKey);
        console.log(7, 'curRow数据==', curRow);

        const { timestamp, id, esIndex } = curRow[0];
        const startTime = moment(timestamp).subtract(1, 'seconds').valueOf();
        const endTime = moment(timestamp).add(1, 'seconds').valueOf();
        dispatch({
          type: 'alertDetail/fetchPcapInfo',
          payload: { id, startTime, endTime, esIndex },
        })
          .then(() => {
            const {
              alertDetail: { pcapInfo },
            } = this.props;
            // console.log(798, 'pcapInfo==', pcapInfo);
            newPcapObj = { [pcapKey]: { ...pcapInfo } };
            newExpandedRowPcap = Object.assign({}, expandedRowPcap, newPcapObj);
            this.setState({ expandedRowPcap: newExpandedRowPcap });
          })
          .catch((error) => {
            console.log('pcap error==', error);
            newPcapObj = { [pcapKey]: {} };
            newExpandedRowPcap = Object.assign({}, expandedRowPcap, newPcapObj);
            this.setState({ expandedRowPcap: newExpandedRowPcap });
          });
      }
      // console.log(13, '新设置pcap对象信息newExpandedRowPcap==', newExpandedRowPcap);
    }
    this.setState({ expandedRowKeys: expandedRows });
  };

  ipListShow = (ipData) => {
    const {
      alertDetail: { ipCateObj },
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

  // eslint-disable-next-line consistent-return
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
      alertDetail: { eventDetail, warningData, pcapInfo },
      hasVpc,
      loading,
      pcapLoading,
      // logLoading,
      warnLoading,
    } = this.props;
    const {
      warningListShowMore,
      // logListShowMore,
      warningQuery,
      // logQuery,
      showPacpModal,
      srcData,
      srcShowMore,
      assetShowMore,
      assetData,
      dstData,
      dstShowMore,
      expandedRowKeys,
      divChange,
      assetMap,
    } = this.state;
    // console.log('srcData==', srcData, 'ipCateObj==', ipCateObj);
    // const urls = configSettings.urlKey('ip');
    // console.log('eventdetail', eventDetail.dst);
    // console.log('warndata', warningData);
    if (warningData.list) {
      warningData.list.forEach((list) => {
        eventDetail.dst.forEach((dst) => {
          if (list.dst_ip === dst.ip) {
            list.dst_ipCountry = dst.ipCountry;
          }
        });
        eventDetail.src.forEach((src) => {
          // console.log('src', src);
          if (list.src_ip === src.ip) {
            list.src_ipCountry = src.ipCountry;
          }
        });
      });
    }

    // 事件名称跳转链接
    const { eid, author } = eventDetail;
    let urlAddr = '';
    if (eid && author) {
      urlAddr = `/tactics/invasion?search=${eid}`;
      console.log('urlAddr===', urlAddr);
    }

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
              <div className={styles.row}>
                <div style={{ width: 100 }}>
                  <span className={styles.name}>受影响资产:</span>
                </div>
                <div className={styles.text}>
                  {eventDetail.affectedAssets &&
                    assetData.map((item) => {
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
                                key={item.ip}
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

                  {!assetShowMore &&
                    eventDetail.affectedAssets &&
                    eventDetail.affectedAssets.length > 2 &&
                    assetData.length <= 2 && (
                      <span
                        style={{ color: '#2662EE', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        onClick={this.showAllAsset}
                      >
                        查看全部
                      </span>
                    )}
                  {assetShowMore && eventDetail.affectedAssets && assetData.length > 2 && (
                    <span
                      style={{ color: '#2662EE', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      onClick={this.showPartAsset}
                    >
                      收起
                    </span>
                  )}
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
                <span className={styles.name}>事件名称: </span>
                {urlAddr ? (
                  <span className={styles.text}>
                    <a href={urlAddr} target="_blank">
                      {eventDetail.name}（{eventDetail.signatureId}）
                    </a>
                  </span>
                ) : (
                  <span className={styles.text}>
                    {eventDetail.name}（{eventDetail.signatureId}）
                  </span>
                )}
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
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>归并事件数:</span>{' '}
                <span className={styles.text}>
                  {eventDetail.originalIds && eventDetail.originalIds.length}
                </span>
              </p>
            </Col>
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

        <div>
          <div className={styles.titleDiv}>
            <span
              className={styles.themeSpan}
              onClick={() => {
                this.divChangeClick('desc');
              }}
            >
              事件描述
            </span>
            <a
              onClick={() => {
                this.divChangeClick('desc');
              }}
            >
              {divChange.desc ? '收起' : '展开'}
            </a>
          </div>
          {divChange.desc && (
            <div className={styles.ctxDiv}>
              {this.eventDescription(eventDetail.signatureId, eventDetail.description)}
            </div>
          )}
        </div>
        <div>
          <div className={styles.titleDiv}>
            <span
              className={styles.themeSpan}
              onClick={() => {
                this.divChangeClick('sugg');
              }}
            >
              处置建议
            </span>
            <a
              onClick={() => {
                this.divChangeClick('sugg');
              }}
            >
              {divChange.sugg ? '收起' : '展开'}
            </a>
          </div>
          {divChange.sugg && (
            <div className={styles.ctxDiv}>
              {this.eventProcessSuggest(eventDetail.signatureId, eventDetail.process_suggest)}
            </div>
          )}
        </div>
        <div>
          <div className={styles.titleDiv}>
            <span
              className={styles.themeSpan}
              onClick={() => {
                this.divChangeClick('warn');
              }}
            >
              归并告警
            </span>
            <a
              onClick={() => {
                this.divChangeClick('warn');
              }}
            >
              {divChange.warn ? '收起' : '展开'}
            </a>
          </div>

          {divChange.warn && (
            <div className={styles.ctxDiv}>
              <Table
                className={styles.warnTable}
                loading={warnLoading}
                pagination={
                  warningListShowMore
                    ? {
                        total: warningData.recordsTotal,
                        showSizeChanger: true,
                        pageSize: warningQuery.pageSize,
                        pageSizeOptions: configSettings.pageSizeOptions,
                        current: warningQuery.page,
                        showTotal: (total) => `（${total}项）`,
                      }
                    : false
                }
                columns={this.warningColumns}
                dataSource={warningListShowMore ? warningData.list : warningData.list.slice(0, 5)}
                size="middle"
                onChange={this.warningTableChange}
                rowKey="id"
                expandRowByClick
                expandedRowRender={this.expandedRowRender}
                expandedRowKeys={expandedRowKeys}
                onExpandedRowsChange={this.onExpandedRowsChange}
              />
              {!warningListShowMore && warningData.recordsTotal > 5 && (
                <Button
                  type="primary"
                  className={styles.showMore}
                  onClick={() => {
                    this.setState({ warningListShowMore: true });
                  }}
                >
                  显示全部
                  {warningData.recordsTotal}条
                </Button>
              )}
              {warningListShowMore && (
                <Button type="primary" className={styles.showMore} onClick={this.backWarningShow}>
                  还原
                </Button>
              )}
            </div>
          )}
        </div>

        <Modal
          title="PCAP包查看"
          visible={showPacpModal}
          width={800}
          onCancel={() => {
            this.setState({ showPacpModal: false });
          }}
          footer={null}
        >
          {pcapLoading ? (
            <Spin />
          ) : (
            <div
              id="pcapDangerouslySetInnerHTML"
              dangerouslySetInnerHTML={{ __html: pcapInfo.html }}
            />
          )}
        </Modal>
        {/* <DialogModal
          key={dialogModalVisible}
          // editItem={editItem}
          visible={dialogModalVisible}
          record={dialogRecord}
          // tiTags={tiTags}
          onCancel={this.onCancelDialog}
          // onSave={this.onFormSave}
        /> */}
      </div>
    );
  }
}

export default BasicInfo;
