import React, { Component } from 'react';
import { connect } from 'umi';
import { Row, Col, Tabs, Spin } from 'antd';
import moment from 'moment';
// import Alarm from '../../AssetDetail/Alarm';
import Event from './Event';
import authority from '@/utils/authority';
const { getAuth } = authority;
import styles from './AssetDetail.less';
import configSettings from '../../../../configSettings';
// import handleFsource from '../../../../tools/handleFsource';

const { assetValueMap } = configSettings;
const { Fcategory, Fsource } = assetValueMap;
const { TabPane } = Tabs;
// const FsourceKeyObj = assetValueMap.Fsource;

// @connect(({ assetDetail, loading }) => ({
//   assetDetail,
//   loading: loading.effects['assetDetail/fetchGroup'],
// }))
@connect(({ global, assetList, loading }) => ({
  assetList,
  hasVpc: global.hasVpc,
  loading: loading.effects['assetList/getAssetDetail'],
}))
class AssetDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: '1',
      portShowMore: false,
      osShowMore: false,
      rePortShowMore: false,
      reOsShowMore: false,
      serverShowMore: false,
      componentShowMore: false,
    };
  }

  componentWillMount = () => {
    const { dispatch, Fid } = this.props;
    dispatch({
      type: 'assetList/getAssetDetail',
      payload: { Fid },
    });
    // dispatch({
    //   type: 'assetList/getAssetConfig',
    // }).then(() => {
    //   const {
    //     assetList: { configInfo },
    //   } = this.props;
    //   if (configInfo.typeMap) {
    //     this.setState({ typeMap: configInfo.typeMap });
    //   }
    // });
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
      assetList: { detailItem },
      loading,
      hasVpc,
    } = this.props;
    const {
      tab,
      portShowMore,
      osShowMore,
      rePortShowMore,
      reOsShowMore,
      serverShowMore,
      componentShowMore,
    } = this.state;
    if (loading) {
      return <Spin />;
    }
    let Fport = [];
    let Fos_type = [];
    let reFport = [];
    let reOsType = [];
    let Fserver_type = [];
    let Fcomponent_info = [];
    if (detailItem.Fid) {
      Fport = detailItem.Fport.split(',').filter((item) => item !== '');
      Fos_type = detailItem.Fos_type.split(',').filter((item) => item !== '');
      reFport = detailItem.port ? detailItem.port.split(',').filter((item) => item !== '') : [];
      reOsType = detailItem.os_type
        ? detailItem.os_type.split(',').filter((item) => item !== '')
        : [];
      Fserver_type = detailItem.Fserver_type
        ? detailItem.Fserver_type.split(',').filter((item) => item !== '')
        : [];
      Fcomponent_info = detailItem.Fcomponent_info
        ? detailItem.Fcomponent_info.split(',').filter((item) => item !== '')
        : [];
    }

    return (
      <div className={styles.detailWrapper}>
        <div className={styles.content}>
          <div className={styles.infoTitle}>注册信息</div>
          <div className={styles.basicInfo}>
            <Row>
              <Col>
                <p className={styles.textCon}>
                  <span className={styles.name}>IP:</span>
                  <span className={styles.text} title={detailItem.Fip}>
                    {detailItem.Fip}
                  </span>
                </p>
              </Col>
            </Row>
            {hasVpc ? (
              <Row>
                <Col>
                  <p className={styles.textCon}>
                    <span className={styles.name}>VPCID:</span>
                    <span className={styles.text}>{detailItem.Fvpcid}</span>
                  </p>
                </Col>
              </Row>
            ) : null}
            <Row>
              <Col>
                <p className={styles.textCon}>
                  <span className={styles.name}>MAC:</span>
                  <span className={styles.text} title={detailItem.Fmac}>
                    {detailItem.Fmac}
                  </span>
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <span className={styles.name}>端口:</span>
                <div style={{ display: 'inline-block', maxWidth: '570px', verticalAlign: 'top' }}>
                  {Fport.length <= 10 &&
                    Fport.map((item) => (
                      <span style={{ marginRight: '5px', display: 'inline-block' }}>{item}</span>
                    ))}
                  {Fport.length > 10 &&
                    !portShowMore &&
                    Fport.slice(0, 10).map((item) => (
                      <span style={{ marginRight: '5px', display: 'inline-block' }}>{item}</span>
                    ))}
                  {Fport.length > 10 &&
                    portShowMore &&
                    Fport.map((item) => (
                      <span style={{ marginRight: '5px', display: 'inline-block' }}>{item}</span>
                    ))}
                  {Fport.length > 10 && !portShowMore && (
                    <a
                      onClick={() => {
                        this.setState({ portShowMore: true });
                      }}
                    >
                      展开
                    </a>
                  )}
                  {Fport.length > 10 && portShowMore && (
                    <a
                      onClick={() => {
                        this.setState({ portShowMore: false });
                      }}
                    >
                      收起
                    </a>
                  )}
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className={styles.textCon}>
                  <span className={styles.name}>资产名称:</span>
                  <span className={styles.text} title={detailItem.Fasset_name}>
                    {detailItem.Fasset_name}
                  </span>
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className={styles.textCon}>
                  <span className={styles.name}>资产类型: </span>
                  <span className={styles.text}>{Fcategory[detailItem.Fcategory]}</span>
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className={styles.textCon}>
                  <span className={styles.name}>操作系统:</span>
                  <div style={{ display: 'inline-block', maxWidth: '570px', verticalAlign: 'top' }}>
                    {Fos_type.length <= 7 &&
                      Fos_type.map((item) => (
                        <span style={{ marginRight: '5px', display: 'inline-block' }}>{item}</span>
                      ))}
                    {Fos_type.length > 7 &&
                      !osShowMore &&
                      Fos_type.slice(0, 7).map((item) => (
                        <span style={{ marginRight: '5px', display: 'inline-block' }}>{item}</span>
                      ))}
                    {Fos_type.length > 7 &&
                      osShowMore &&
                      Fos_type.map((item) => (
                        <span style={{ marginRight: '5px', display: 'inline-block' }}>{item}</span>
                      ))}
                    {Fos_type.length > 7 && !osShowMore && (
                      <a
                        onClick={() => {
                          this.setState({ osShowMore: true });
                        }}
                      >
                        展开
                      </a>
                    )}
                    {Fos_type.length > 7 && osShowMore && (
                      <a
                        onClick={() => {
                          this.setState({ osShowMore: false });
                        }}
                      >
                        收起
                      </a>
                    )}
                  </div>
                </p>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <p className={styles.textCon}>
                  <span className={styles.name}>资产分组:</span>
                  <span className={styles.text} title={detailItem.Fgroup_name}>
                    {detailItem.Fgroup_name}
                  </span>
                </p>
              </Col>
              <Col span={12}>
                <p className={styles.textCon}>
                  <span className={styles.name}>资产来源:</span>
                  <span className={styles.text}>{Fsource[detailItem.Fsource]}</span>
                </p>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <p className={styles.textCon}>
                  <span className={styles.name}>创建时间:</span>
                  <span>
                    {detailItem.Finsert_time && detailItem.Finsert_time !== '0000-00-00 00:00:00'
                      ? moment(detailItem.Finsert_time).format('YYYY-MM-DD HH:mm:ss')
                      : '暂无'}
                  </span>
                </p>
              </Col>
              <Col span={12}>
                <p className={styles.textCon}>
                  <span className={styles.name}>更新时间:</span>
                  <span>
                    {detailItem.Fupdate_time && detailItem.Fupdate_time !== '0000-00-00 00:00:00'
                      ? moment(detailItem.Fupdate_time).format('YYYY-MM-DD HH:mm:ss')
                      : '暂无'}
                  </span>
                </p>
              </Col>
            </Row>
          </div>
          <div className={`${styles.tabBlock} tabStyle`}>
            <Tabs
              defaultActiveKey={tab}
              tabBarStyle={{ paddingLeft: 24, paddingTop: 12, backgroundColor: '#FBFBFB' }}
              tabBarGutter={6}
              type="card"
            >
              <TabPane tab="识别信息" key="1">
                <div>
                  {/* <div className={styles.infoTitle}>
                    <div>流量信息</div>
                  </div> */}
                  <div className={styles.infoContent}>
                    <Row>
                      <Col>
                        <p className={styles.textCon}>
                          <span className={styles.name}>主机名:</span>
                          <span className={styles.text} title={detailItem.Fhost_name}>
                            {detailItem.Fhost_name}
                          </span>
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <p className={styles.textCon}>
                          <span className={styles.name}>开放端口:</span>
                          <div
                            style={{
                              display: 'inline-block',
                              maxWidth: '570px',
                              verticalAlign: 'top',
                            }}
                          >
                            {reFport.length <= 10 &&
                              reFport.map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {reFport.length > 10 &&
                              !rePortShowMore &&
                              reFport
                                .slice(0, 10)
                                .map((item) => (
                                  <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                    {item}
                                  </span>
                                ))}
                            {reFport.length > 10 &&
                              rePortShowMore &&
                              reFport.map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {reFport.length > 10 && !rePortShowMore && (
                              <a
                                onClick={() => {
                                  this.setState({ rePortShowMore: true });
                                }}
                              >
                                展开
                              </a>
                            )}
                            {reFport.length > 10 && rePortShowMore && (
                              <a
                                onClick={() => {
                                  this.setState({ rePortShowMore: false });
                                }}
                              >
                                收起
                              </a>
                            )}
                          </div>
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <p className={styles.textCon}>
                          <span className={styles.name}>操作系统:</span>
                          <div
                            style={{
                              display: 'inline-block',
                              maxWidth: '570px',
                              verticalAlign: 'top',
                            }}
                          >
                            {reOsType.length <= 7 &&
                              reOsType.map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {reOsType.length > 7 &&
                              !reOsShowMore &&
                              reOsType
                                .slice(0, 7)
                                .map((item) => (
                                  <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                    {item}
                                  </span>
                                ))}
                            {reOsType.length > 7 &&
                              reOsShowMore &&
                              reOsType.map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {reOsType.length > 7 && !reOsShowMore && (
                              <a
                                onClick={() => {
                                  this.setState({ reOsShowMore: true });
                                }}
                              >
                                展开
                              </a>
                            )}
                            {reOsType.length > 7 && reOsShowMore && (
                              <a
                                onClick={() => {
                                  this.setState({ reOsShowMore: false });
                                }}
                              >
                                收起
                              </a>
                            )}
                          </div>
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <p className={styles.textCon}>
                          <span className={styles.name}>域名:</span>
                          <span className={styles.text} title={detailItem.Fdomain_name}>
                            {detailItem.Fdomain_name}
                          </span>
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <p className={styles.textCon}>
                          <span className={styles.name}>服务类型:</span>
                          <div
                            style={{
                              display: 'inline-block',
                              maxWidth: '570px',
                              verticalAlign: 'top',
                            }}
                          >
                            {Fserver_type.length <= 5 &&
                              Fserver_type.map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {Fserver_type.length > 5 &&
                              !serverShowMore &&
                              Fserver_type.slice(0, 5).map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {Fserver_type.length > 5 &&
                              serverShowMore &&
                              Fserver_type.map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {Fserver_type.length > 5 && !serverShowMore && (
                              <a
                                onClick={() => {
                                  this.setState({ serverShowMore: true });
                                }}
                              >
                                展开
                              </a>
                            )}
                            {Fserver_type.length > 5 && serverShowMore && (
                              <a
                                onClick={() => {
                                  this.setState({ serverShowMore: false });
                                }}
                              >
                                收起
                              </a>
                            )}
                          </div>
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <p className={styles.textCon}>
                          <span className={styles.name}>组件信息:</span>
                          <div
                            style={{
                              display: 'inline-block',
                              maxWidth: '570px',
                              verticalAlign: 'top',
                            }}
                          >
                            {Fcomponent_info.length <= 5 &&
                              Fcomponent_info.map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {Fcomponent_info.length > 5 &&
                              !componentShowMore &&
                              Fcomponent_info.slice(0, 5).map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {Fcomponent_info.length > 5 &&
                              componentShowMore &&
                              Fcomponent_info.map((item) => (
                                <span style={{ marginRight: '5px', display: 'inline-block' }}>
                                  {item}
                                </span>
                              ))}
                            {Fcomponent_info.length > 5 && !componentShowMore && (
                              <a
                                onClick={() => {
                                  this.setState({ componentShowMore: true });
                                }}
                              >
                                展开
                              </a>
                            )}
                            {Fcomponent_info.length > 5 && componentShowMore && (
                              <a
                                onClick={() => {
                                  this.setState({ componentShowMore: false });
                                }}
                              >
                                收起
                              </a>
                            )}
                          </div>
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <p className={styles.textCon}>
                          <span className={styles.name}>接收数据量:</span>
                          <span className={styles.text} style={{ maxWidth: '310px' }}>
                            {detailItem.Frecv_bytes ? this.formatNum(detailItem.Frecv_bytes) : '0B'}
                          </span>
                        </p>
                      </Col>
                      <Col span={12}>
                        <p className={styles.textCon}>
                          <span className={styles.name}>发送数据量: </span>
                          <span className={styles.text}>
                            {detailItem.Frecv_bytes ? this.formatNum(detailItem.Frecv_bytes) : '0B'}
                          </span>
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <p className={styles.textCon}>
                          <span className={styles.name}>发现时间:</span>
                          <span className={styles.text} style={{ maxWidth: '260px' }}>
                            {detailItem.insert_time
                              ? moment(detailItem.insert_time).format('YYYY-MM-DD HH:mm:ss')
                              : '暂无'}
                          </span>
                        </p>
                      </Col>
                      <Col span={12}>
                        <p className={styles.textCon}>
                          <span className={styles.name}>更新时间:</span>
                          <span className={styles.text} style={{ maxWidth: '280px' }}>
                            {detailItem.update_time
                              ? moment(detailItem.update_time).format('YYYY-MM-DD HH:mm:ss')
                              : '暂无'}
                          </span>
                        </p>
                      </Col>
                    </Row>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="事件" key="2">
                <Event Fip={detailItem.Fip} Fvpcid={detailItem.Fvpcid} />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}

export default AssetDetail;
