/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { Button, Spin, Popover } from 'antd';
import { connect } from 'umi';
import _ from 'lodash';
import Cookies from 'js-cookie';
import styles from './detail.less';
// import AttackChain from './AttackChain';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FileBehaviorApt from './FileBehaviorAptUpload';
import BasicInfo from './BasicInfoAptUpload';
import configSettings from '../../../configSettings';

// const { TabPane } = Tabs;

@connect(({ aptUpload, aptDetail, loading }) => ({
  aptUpload,
  aptDetail,
  loading: loading.effects['aptUpload/fetchDetail'],
  loading1: loading.effects['aptUpload/fileExists'],
}))
class EventAptUpload extends Component {
  constructor(props) {
    super(props);
    this.userId = Cookies.get('username');
    // this.fileMd5 = '';
    this.state = {
      divChange: {
        file: false,
      },
    };
  }

  componentDidMount() {
    const { dispatch, query = {} } = this.props;
    if (query && query.id) {
      dispatch({
        type: 'aptUpload/fetchDetail',
        payload: {
          id: query.id,
        },
      });
      dispatch({ type: 'aptUpload/fileExists', payload: { md5: query.md5 } });
    }
    // if (query && query.md5) {
    //   this.fileMd5 = query.md5;
    // }
  }
  // handleEvent = () => {
  //   const {
  //     aptUpload: { upDetail },
  //     dispatch,
  //   } = this.props;
  //   dispatch({ type: 'eventFile/handleEvent', payload: { ids: [eventDetail._id] } })
  //     .then(() => {
  //       message.success('已将该事件标识为“已处理”状态，有延时，请稍后刷新页面查看');
  //     })
  //     .catch(error => {
  //       message.error(error.msg);
  //     });
  // };

  statusShow = (record) => {
    console.log('statusShow===record==', record);
    const text = record.status;
    let fontCxt = '';
    if (text === 0) {
      fontCxt = '分析中';
    }
    if (text === 1) {
      fontCxt = '成功';
    }
    if (text === 2) {
      fontCxt = '失败';
    }
    const { color, bgColor, borderColor } = configSettings.fileStatusMap(text);
    if (text === 2) {
      const popContent = <div>{record.msg}</div>;
      return (
        <Popover
          content={popContent}
          getPopupContainer={(triggerNode) => triggerNode}
          placement="bottomLeft"
          title="失败原因"
        >
          <span
            style={{
              padding: '2px 10px',
              color,
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
            }}
          >
            {fontCxt}
          </span>
        </Popover>
      );
    }
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
        {fontCxt}
      </span>
    );
  };

  divChangeClick = (key) => {
    const { divChange } = this.state;
    const oldStatus = divChange[key];
    const newDivchange = { ...divChange, [key]: !oldStatus };
    this.setState({ divChange: newDivchange });
  };

  render() {
    const {
      aptUpload: { upDetail, fileExists },
      loading,
      loading1,
      query,
    } = this.props;
    const { md5 } = query;
    const { divChange } = this.state;
    // const { victimIps, attackerIps, tsLatest, status } = eventDetail;
    if (loading || loading1)
      return (
        <div>
          <Spin />
        </div>
      );
    if (!loading && _.isEmpty(upDetail)) {
      return (
        <PageHeaderWrapper>
          <p>该文件详情不存在</p>
        </PageHeaderWrapper>
      );
    }

    return (
      <div>
        <div style={{ margin: '10px 20px' }}>
          <a href={`/api/file/getFileSamples?md5=${md5}`}>
            <Button type="primary" className={styles.handleItem}>
              样本下载
            </Button>
          </a>
          {fileExists === true && (
            <a href={`/api/file/getFilePDF?md5=${md5}`}>
              <Button type="primary" className={styles.handleItem}>
                沙箱报告下载
              </Button>
            </a>
          )}
        </div>
        <div>
          <BasicInfo location={{ query }} md5={md5} upDetail={upDetail} />
        </div>
        <div>
          <div className={styles.titleDiv}>
            <span
              className={styles.themeSpan}
              onClick={() => {
                this.divChangeClick('file');
              }}
            >
              文件行为
            </span>
            <a
              onClick={() => {
                this.divChangeClick('file');
              }}
            >
              {divChange.file ? '收起' : '展开'}
            </a>
          </div>
          {divChange.file && (
            <div className={styles.ctxDiv}>
              <FileBehaviorApt md5={md5} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default EventAptUpload;
