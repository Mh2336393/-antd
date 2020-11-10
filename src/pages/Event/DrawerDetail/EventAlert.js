// 入侵感知详情页面
/* eslint-disable no-underscore-dangle */

import React, { Component } from 'react';
import { Button, Spin, message } from 'antd';
import { connect } from 'umi';
import _ from 'lodash';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import AttackVictimProfile from './AttackVictimProfile';
import AttackChain from './AttackChain';
import BasicInfoAlert from './BasicInfoAlert';
import styles from './detail.less';

// import configSettings from '../../../configSettings';

// const { TabPane } = Tabs;
@connect(({ alertDetail, loading }) => ({
  alertDetail,
  loading: loading.effects['alertDetail/fetchEventDetail'],
}))
class EventAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      divChange: {
        chain: false,
        image: false,
      },
    };
  }

  componentDidMount() {
    const { dispatch, query = {} } = this.props;
    if (query && query.id) {
      dispatch({
        type: 'alertDetail/fetchEventDetail',
        payload: {
          id: query.id,
          ccsName: query.ccsName || '',
        },
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'alertDetail/saveWarningData',
      payload: { warningData: { recordTotal: 0, list: [] } },
    });
  }

  handleEvent = () => {
    const {
      alertDetail: { eventDetail },
      dispatch,
    } = this.props;
    dispatch({ type: 'eventInvasion/handleEvent', payload: { ids: [eventDetail._id] } })
      .then(() => {
        message.success('已将该事件标识为“已处理”状态，有延时，请稍后刷新页面查看');
      })
      .catch((error) => {
        message.error(error.msg);
      });
  };

  divChangeClick = (key) => {
    const { divChange } = this.state;
    const oldStatus = divChange[key];
    const newDivchange = { ...divChange, [key]: !oldStatus };
    this.setState({ divChange: newDivchange });
  };

  render() {
    const {
      alertDetail: { eventDetail },
      loading,
      query,
    } = this.props;
    const { drawerID, drawerFLAG } = query;
    const { divChange } = this.state;
    // console.log('eventDetail', eventDetail);
    if (loading)
      return (
        <div>
          <Spin />
        </div>
      );
    if (!loading && _.isEmpty(eventDetail)) {
      return (
        <PageHeaderWrapper>
          <p>该事件不存在</p>
        </PageHeaderWrapper>
      );
    }

    return (
      <div>
        <div style={{ margin: '10px 20px' }}>
          {eventDetail.status === 'unhandled' && (
            <Button type="primary" onClick={this.handleEvent} className={styles.handleItem}>
              处理
            </Button>
          )}
        </div>
        <div>
          <BasicInfoAlert location={{ query }} />
        </div>

        <div>
          <div className={styles.titleDiv}>
            <span
              className={styles.themeSpan}
              onClick={() => {
                this.divChangeClick('chain');
              }}
            >
              攻击链还原
            </span>
            <a
              onClick={() => {
                this.divChangeClick('chain');
              }}
            >
              {divChange.chain ? '收起' : '展开'}
            </a>
          </div>
          {divChange.chain && (
            <div className={styles.ctxDiv}>
              <AttackChain
                drawerID={drawerID}
                drawerFLAG={drawerFLAG}
                affectedAssets={eventDetail.affectedAssets}
                tsLatest={eventDetail.tsLatest}
              />
            </div>
          )}
        </div>

        <div>
          <div className={styles.titleDiv}>
            <span
              className={styles.themeSpan}
              onClick={() => {
                this.divChangeClick('image');
              }}
            >
              攻击/受害者画像
            </span>
            <a
              onClick={() => {
                this.divChangeClick('image');
              }}
            >
              {divChange.image ? '收起' : '展开'}
            </a>
          </div>
          {divChange.image && (
            <div className={styles.ctxDiv}>
              <AttackVictimProfile
                drawerID={drawerID}
                drawerFLAG={drawerFLAG}
                tsLatest={eventDetail.tsLatest}
                victimIps={eventDetail.victimIps}
                attackerIps={eventDetail.attackerIps}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default EventAlert;
