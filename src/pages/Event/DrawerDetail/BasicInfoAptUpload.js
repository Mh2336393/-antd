/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-unused-state */

import React, { Component } from 'react';
import { Button, Col, Row, Table, Spin, Tooltip, Popover, Modal } from 'antd';
import { connect } from 'umi';
import { Link } from 'umi';
import moment from 'moment';
import configSettings from '../../../configSettings';
import styles from './BasicInfo.less';

@connect(({ aptDetail, global, loading }) => ({
  aptDetail,
  hasVpc: global.hasVpc,
  // loading: loading.effects['aptDetail/getEventDetail'],
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
      logListShowMore: false,
      imageModal: false,
      showImage: '',
      divChange: {
        process: true,
        pic: true,
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
    const { dispatch, md5 } = this.props;
    // const { warningQuery, logQuery, query } = this.state;
    dispatch({ type: 'aptDetail/fetchUoloadFileBehavior', payload: { md5 } });

    dispatch({ type: 'aptDetail/fetchImgaeData', payload: { md5 } });
    // console.log('md5', md5);
  }

  scan = (data) => {
    this.setState({ imageModal: true, showImage: data.src });
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

  divChangeClick = (key) => {
    const { divChange } = this.state;
    const oldStatus = divChange[key];
    const newDivchange = { ...divChange, [key]: !oldStatus };
    this.setState({ divChange: newDivchange });
  };

  render() {
    const {
      aptDetail: { eventDetail, analyzeProcessUpload, imageData },
      upDetail,
      // hasVpc,
      loading,
      md5,
    } = this.props;
    console.log('文件基本信息  ==upDetail==', upDetail);

    const {
      divChange,
      imageModal,
      showImage,
      srcData,
      srcShowMore,
      dstData,
      dstShowMore,
    } = this.state;
    const urls = configSettings.urlKey('ip');
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
                <span className={styles.name}>上传时间:</span>{' '}
                <span className={styles.text}>
                  {moment(upDetail.add_time).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </p>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>上传者:</span>{' '}
                <span className={styles.text}>{upDetail.uploader}</span>
              </p>
            </Col>
            {/* <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>攻击意图:</span> <span className={styles.text}>{eventDetail.attackStage}</span>
              </p>
            </Col> */}
          </Row>

          <Row>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>文件名称:</span>{' '}
                <span className={styles.text}>{upDetail.file_name}</span>
              </p>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>文件大小:</span>{' '}
                <span className={styles.text}>
                  {configSettings.bytesToSize(upDetail.file_size)}
                </span>
              </p>
            </Col>
            {/* <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>文件类型:</span>
                <span className={styles.text}>{eventDetail.fileType}</span>
              </p>
            </Col> */}
          </Row>
          <Row>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>病毒名:</span>{' '}
                <span className={styles.text}>{upDetail.virus_name || '-'}</span>
              </p>
            </Col>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>MD5:</span>
                <Popover content={this.urlPopContent(upDetail.md5, md5Url)} placement="bottomLeft">
                  <span>{upDetail.md5}</span>
                </Popover>
                {/* <span className={styles.text}>{eventDetail.md5}</span> */}
              </p>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <p className={styles.row}>
                <span className={styles.name}>分类:</span>{' '}
                <span className={styles.text}>
                  {upDetail.virus_name ? upDetail.virus_type : '-'}
                </span>
              </p>
            </Col>
          </Row>
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
                dataSource={analyzeProcessUpload}
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
                <Row
                  gutter={24}
                  style={{
                    borderTop: '1px solid #e8e8e8',
                    borderBottom: '1px solid #e8e8e8',
                    padding: '10px',
                  }}
                >
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
                            href={`/api/file/downloadImg?params={"cmd":"download_pic","md5":"${md5}","name":"${item.pic}"}`}
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

export default BasicInfo;
