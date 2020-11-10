/* eslint-disable react/jsx-no-target-blank */
/*
 * @Author: finazhang
 * @Date: 2018-11-03 13:27:45
 * 攻击者受害者画像页面
 * @Last Modified by: finazhang
 * @Last Modified time: 2018-11-20 22:04:16
 */

import React, { Component } from 'react';
import { connect } from 'umi';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Button, Row, Col, Tooltip, Popover } from 'antd';
import moment from 'moment';
import configSettings from '../../../configSettings';
import { Link } from 'umi';

import styles from './AttackVictimProfile.less';
import { PolarHeat } from '@/components/Charts';
/* eslint-disable no-param-reassign */
@connect(({ attackVictimProfile, eventOverview, loading }) => ({
  attackVictimProfile,
  eventOverview,
  loading: loading.effects['attackVictimProfile/fetchEventList'],
}))
class AttackVictimProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch, tsLatest, victimIps, attackerIps } = this.props;
    dispatch({
      type: 'attackVictimProfile/fetchAttackList',
      payload: { tsLatest, type: 'attack', ips: attackerIps },
    });
    dispatch({
      type: 'attackVictimProfile/fetchVictimList',
      payload: { tsLatest, type: 'victim', ips: victimIps },
    });
  }

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
    const {
      attackVictimProfile: { attackInfoList, victimInfoList },
    } = this.props;
    const urls = configSettings.urlKey('ip');
    console.log('attackInfoList', attackInfoList);
    const popContent = (
      <div>
        <p className={styles.popcontent}>
          <span>圆周: </span>
          <span>圆周为时间范围，取0点到24点，共24粒度</span>
        </p>
        <p className={styles.popcontent}>
          <span>半径: </span>
          <span>取各攻击意图，从圆周的“外部侦察”到圆心的“攻陷系统”逐层反应攻击的严重程度。</span>
        </p>
        <p className={styles.popcontent}>
          <span>区块: </span>
          <span> 当能够区块有安全事件时，用颜色填充，颜色深浅代表事件多少。</span>
        </p>
      </div>
    );
    const labalSpan = 8;
    const valSpan = 16;
    return (
      <div>
        <div>
          <h4 className={styles.title}>攻击者画像</h4>
          {attackInfoList.map((item) => {
            const tsLatest = item.hits[0];
            const tsOldest = item.hits[1];
            // const tsLatestPath = this.getEventDetailRoute(tsLatest.category_1);
            // const tsOldestPath = this.getEventDetailRoute(tsOldest.category_1);

            if (item.ip === tsLatest.dst[0].ip) {
              item.ipCountry = tsLatest.dst[0].ipCountry;
            } else if (item.ip === tsLatest.src[0].ip) {
              item.ipCountry = tsLatest.src[0].ipCountry;
            } else if (item.ip === tsOldest.dst[0].ip) {
              item.ipCountry = tsOldest.dst[0].ipCountry;
            } else if (item.ip === tsOldest.src[0]) {
              item.ipCountry = tsOldest.src[0].ipCountry;
            }
            // console.log('ipContry', item.ipCountry);
            return (
              <Row key={item.ip} className={styles.attackBlock}>
                <Col span={12}>
                  <div className={styles.attackTips}>
                    <Popover title="图像说明" content={popContent} placement="rightTop">
                      <QuestionCircleFilled className="fontBlue" />
                    </Popover>
                  </div>
                  <PolarHeat data={item.aggs} height={400} />
                </Col>
                <Col span={12} style={{ paddingTop: 20, lineHeight: '50px' }}>
                  <Row>
                    <Col span={labalSpan}>IP:</Col>
                    <Col span={valSpan}>
                      {
                        <span>
                          {item.ipCountry === '内网' ? (
                            <span>{item.ip}</span>
                          ) : (
                            <Popover
                              content={this.urlPopContent(item.ip, urls)}
                              placement="bottomLeft"
                            >
                              {item.ip}
                            </Popover>
                          )}
                        </span>
                      }
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>攻击事件数:</Col>
                    <Col span={valSpan}>
                      <span className={styles.count}>{item.total}</span>
                      <Tooltip title=" 事件发生后取近6个自然月含本月，该攻击者IP发起的攻击事件数">
                        <QuestionCircleFilled className="fontBlue" />
                      </Tooltip>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>最近攻击事件时间：</Col>
                    <Col span={valSpan}>
                      {moment(tsLatest.tsLatest).format('YYYY-MM-DD HH:mm:ss')}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>最近攻击事件：</Col>
                    <Col span={valSpan}>
                      {/* <a
                        href={`/event/safeEvent/${tsLatestPath}?id=${tsLatest.id}&tsOldest=${tsLatest.tsOldest}&tsLatest=${tsLatest.tsLatest}`}
                        target="_blank"
                      >
                        {tsLatest.name}
                      </a> */}
                      <a
                        onClick={() => {
                          this.detailShowOpen(tsLatest);
                        }}
                      >
                        {tsLatest.name}
                      </a>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>最早攻击事件时间：</Col>
                    <Col span={valSpan}>
                      {moment(tsOldest.tsOldest).format('YYYY-MM-DD HH:mm:ss')}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>最早攻击事件：</Col>
                    <Col span={valSpan}>
                      {/* <a
                        href={`/event/safeEvent/${tsOldestPath}?id=${tsOldest.id}&tsOldest=${tsOldest.tsOldest}&tsLatest=${tsOldest.tsLatest}`}
                        target="_blank"
                      >
                        {tsOldest.name}
                      </a> */}
                      <a
                        onClick={() => {
                          this.detailShowOpen(tsOldest);
                        }}
                      >
                        {tsOldest.name}
                      </a>
                    </Col>
                  </Row>
                  <div className={styles.operation}>
                    <Button className={styles.aBtn} disabled={item.ipCountry === '内网'}>
                      <Link target="_blank" to="/">
                        查看威胁情报
                      </Link>
                    </Button>
                    <Button className={styles.aBtn}>
                      <Link
                        target="_blank"
                        to={`/event/safeEvent/alarm?search=${item.ip}&startTime=${moment()
                          .subtract(6, 'months')
                          .valueOf()}&endTime=${moment().valueOf()}`}
                      >
                        搜索所有事件
                      </Link>
                    </Button>
                  </div>
                </Col>
              </Row>
            );
          })}
        </div>
        <div>
          <h4 className={styles.title}>受害者画像</h4>
          {victimInfoList.map((item) => {
            const tsLatest = item.hits[0];
            const tsOldest = item.hits[1];
            // const tsLatestPath = this.getEventDetailRoute(tsLatest.category_1);
            // const tsOldestPath = this.getEventDetailRoute(tsOldest.category_1);
            if (item.ip === tsLatest.dst[0].ip) {
              item.ipCountry = tsLatest.dst[0].ipCountry;
            } else if (item.ip === tsLatest.src[0].ip) {
              item.ipCountry = tsLatest.src[0].ipCountry;
            } else if (item.ip === tsOldest.dst[0].ip) {
              item.ipCountry = tsOldest.dst[0].ipCountry;
            } else if (item.ip === tsOldest.src[0]) {
              item.ipCountry = tsOldest.src[0].ipCountry;
            }
            // console.log('ipContry', item.ipCountry);
            return (
              <Row key={item.ip} className={styles.attackBlock}>
                <Col span={12}>
                  <div className={styles.attackTips}>
                    <Popover title="图像说明" content={popContent} placement="rightTop">
                      <QuestionCircleFilled className="fontBlue" />
                    </Popover>
                  </div>
                  <PolarHeat data={item.aggs} height={400} />
                </Col>
                <Col span={12} style={{ lineHeight: '40px' }}>
                  <Row>
                    <Col span={labalSpan}>IP:</Col>
                    <Col span={valSpan}>
                      {
                        <span>
                          {item.ipCountry === '内网' ? (
                            <span>{item.ip}</span>
                          ) : (
                            <Popover
                              content={this.urlPopContent(item.ip, urls)}
                              placement="bottomLeft"
                            >
                              {item.ip}
                            </Popover>
                          )}
                        </span>
                      }
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>被攻击事件数:</Col>
                    <Col span={valSpan}>
                      <span className={styles.count}>{item.total}</span>
                      <Tooltip title=" 事件发生后取近6个自然月含本月，该受害者IP受到的攻击事件数">
                        <QuestionCircleFilled className="fontBlue" />
                      </Tooltip>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>最近被攻击事件时间：</Col>
                    <Col span={valSpan}>
                      {moment(tsLatest.tsLatest).format('YYYY-MM-DD HH:mm:ss')}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>最近被攻击事件：</Col>
                    <Col span={valSpan}>
                      {/* <a
                        href={`/event/safeEvent/${tsLatestPath}?id=${tsLatest.id}&tsOldest=${tsLatest.tsOldest}&tsLatest=${tsLatest.tsLatest}`}
                        target="_blank"
                      >
                        {tsLatest.name}
                      </a> */}
                      <a
                        onClick={() => {
                          this.detailShowOpen(tsLatest);
                        }}
                      >
                        {tsLatest.name}
                      </a>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>最早被攻击事件时间：</Col>
                    <Col span={valSpan}>
                      {moment(tsOldest.tsOldest).format('YYYY-MM-DD HH:mm:ss')}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={labalSpan}>最早被攻击事件：</Col>
                    <Col span={valSpan}>
                      {/* <a
                        href={`/event/safeEvent/${tsOldestPath}?id=${tsOldest.id}&tsOldest=${tsOldest.tsOldest}&tsLatest=${tsOldest.tsLatest}`}
                        target="_blank"
                      >
                        {tsOldest.name}
                      </a> */}
                      <a
                        onClick={() => {
                          this.detailShowOpen(tsOldest);
                        }}
                      >
                        {tsOldest.name}
                      </a>
                    </Col>
                  </Row>
                  <div className={styles.operation}>
                    <Button className={styles.aBtn}>
                      <Link
                        target="_blank"
                        to={`/event/safeEvent/alarm?search=${item.ip}&startTime=${moment()
                          .subtract(6, 'months')
                          .valueOf()}&endTime=${moment().valueOf()}`}
                      >
                        搜索所有事件
                      </Link>
                    </Button>
                  </div>
                </Col>
              </Row>
            );
          })}
        </div>
      </div>
    );
  }
}

export default AttackVictimProfile;
