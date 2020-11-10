/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react';
import { Button, Spin, message, Table, Col, Row, Modal } from 'antd';
import { connect } from 'umi';
import _ from 'lodash';
import moment from 'moment';
import styles from './detail.less';
import AttackChain from './AttackChain';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FileBehaviorApt from './FileBehaviorApt';
import AttackVictimProfile from './AttackVictimProfile';
import BasicInfo from './BasicInfoApt';
// import configSettings from '../../../configSettings';

// const { TabPane } = Tabs;
@connect(({ aptDetail, loading }) => ({
  aptDetail,
  loading: loading.effects['aptDetail/fetchEventDetail'],
  loading1: loading.effects['aptDetail/fileExists'],
}))
class EventApt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageModal: false,
      showImage: '',
      divChange: {
        chain: false,
        image: false,
        file: false,
        process: false,
        pic: false,
      },
    };

    this.analyzeProcessColumns = [
      {
        title: '分析过程',
        dataIndex: 'key',
        key: 'key',
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        key: 'startTime',
        render: (text) => <span>{moment.unix(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
        key: 'endTime',
        render: (text) => <span>{moment.unix(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '耗时',
        dataIndex: 'diffTime',
        key: 'diffTime',
        render: (text, record) => (
          <span>{moment.unix(record.endTime).diff(moment.unix(record.startTime), 's')}s</span>
        ),
      },
    ];
  }

  componentDidMount() {
    const { dispatch, query = {} } = this.props;
    if (query && query.id) {
      dispatch({
        type: 'aptDetail/fetchEventDetail',
        payload: {
          id: query.id,
          ccsName: query.ccsName || '',
        },
      }).then(() => {
        const {
          aptDetail: {
            eventDetail: { md5 },
          },
        } = this.props;
        dispatch({ type: 'aptDetail/fileExists', payload: { md5 } });
        dispatch({ type: 'aptDetail/fetchFileAnalyzeProcess', payload: { md5 } });
        dispatch({ type: 'aptDetail/fetchImgaeData', payload: { md5 } });
      });
    }
  }

  handleEvent = () => {
    const {
      aptDetail: { eventDetail },
      dispatch,
    } = this.props;
    dispatch({ type: 'eventFile/handleEvent', payload: { ids: [eventDetail._id] } })
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

  scan = (data) => {
    this.setState({ imageModal: true, showImage: data.src });
  };

  render() {
    const {
      aptDetail: { analyzeProcess, imageData, eventDetail, fileExists },
      loading,
      loading1,
      query,
    } = this.props;
    const { drawerID, drawerFLAG } = query;
    const { divChange, imageModal, showImage } = this.state;
    const { victimIps, attackerIps, tsLatest, status } = eventDetail;
    if (loading || loading1)
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
          {status === 'unhandled' && (
            <Button type="primary" onClick={this.handleEvent} className={styles.handleItem}>
              处理
            </Button>
          )}
          <a href={`/api/file/getFileSamples?md5=${eventDetail.md5}`}>
            <Button type="primary" className={styles.handleItem}>
              样本下载
            </Button>
          </a>
          {fileExists === true && (
            <a href={`/api/file/getFilePDF?md5=${eventDetail.md5}`}>
              <Button type="primary" className={styles.handleItem}>
                沙箱报告下载
              </Button>
            </a>
          )}
        </div>
        <div>
          <BasicInfo location={{ query }} md5={eventDetail.md5} />
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
                tsLatest={tsLatest}
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
                tsLatest={tsLatest}
                victimIps={victimIps}
                attackerIps={attackerIps}
              />
            </div>
          )}
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
              <FileBehaviorApt md5={eventDetail.md5} />
            </div>
          )}
        </div>
        <div>
          <div className={styles.titleDiv}>
            <span
              className={styles.themeSpan}
              onClick={() => {
                this.divChangeClick('process');
              }}
            >
              文件分析过程
            </span>
            <a
              onClick={() => {
                this.divChangeClick('process');
              }}
            >
              {divChange.process ? '收起' : '展开'}
            </a>
          </div>
          {divChange.process && (
            <div className={styles.ctxDiv}>
              <Table
                size="middle"
                dataSource={analyzeProcess}
                columns={this.analyzeProcessColumns}
              />
            </div>
          )}
        </div>
        <div>
          <div className={styles.titleDiv}>
            <span
              className={styles.themeSpan}
              onClick={() => {
                this.divChangeClick('pic');
              }}
            >
              截屏记录
            </span>
            <a
              onClick={() => {
                this.divChangeClick('pic');
              }}
            >
              {divChange.pic ? '收起' : '展开'}
            </a>
          </div>
          {divChange.pic && (
            <div className={styles.ctxDiv}>
              {imageData.length > 0 ? (
                <Row gutter={24}>
                  {imageData.map((item) => (
                    <Col span={12}>
                      <div>
                        <img style={{ width: '280px', height: '200px' }} src={item.src} alt="" />
                        <div style={{ padding: '10px 0' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '140px',
                              textAlign: 'center',
                              color: '#2662EE',
                              cursor: 'pointer',
                            }}
                            onClick={() => this.scan(item)}
                          >
                            查看
                          </span>
                          <a
                            style={{ display: 'inline-block', width: '140px', textAlign: 'center' }}
                            href={`/api/file/downloadImg?params={"cmd":"download_pic","md5":"${eventDetail.md5}","name":"${item.pic}"}`}
                          >
                            下载
                          </a>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#000000',
                    opacity: '0.45',
                    padding: '10px 0',
                    borderTop: '1px solid #e8e8e8',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  暂无数据
                </div>
              )}
            </div>
          )}
        </div>
        <Modal
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
        </Modal>
      </div>
    );
  }
}

export default EventApt;
