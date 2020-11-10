import React, { Component } from 'react';
import { connect } from 'umi';
import { FileTextOutlined, InfoCircleFilled } from '@ant-design/icons';
import { Card, Col, Row, Radio, Progress, Spin, Modal, Tooltip, message } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { LineChart } from '@/components/Charts';
import styles from './sourceMonitor.less';
import { numberTransform } from '../../tools/formatNumber';
import serverAvator from '../../assets/image/icon_monitor_server_2.png';
import serverAvator2 from '../../assets/image/icon_monitor_server_3.png';
import packsAvator from '../../assets/image/sysMonitor.png';

@connect(({ sourceMonitor, loading }) => ({
  sourceMonitor,
  loading: loading.effects['sourceMonitor/fetchEventList'],
  loading1: loading.effects['sourceMonitor/fetchProbesData'],
}))
class SourceMonitor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeRange: [],
      // probesData: [],
    };
    this.timer = [];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'sourceMonitor/fetchProbesData' }).then(() => {
      const {
        sourceMonitor: { esError },
      } = this.props;
      if (esError) {
        message.error(esError);
      }
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const {
      sourceMonitor: { probesData },
      dispatch,
    } = nextProps;
    const { sourceMonitor: preData } = this.props;
    if (!_.isEqual(probesData, preData.probesData)) {
      const len = probesData.length;
      this.setState({ timeRange: Array(len).fill(24) });
      this.timer.push(
        setInterval(() => {
          for (let i = 0; i < probesData.length; i += 1) {
            if (probesData[i].sensor_id) {
              dispatch({
                type: 'sourceMonitor/fetchRealTimePacks',
                payload: { id: probesData[i].sensor_id },
              });
            }
          }
        }, 10000)
      );
    }
  };

  componentWillUnmount = () => {
    this.timer.forEach((item) => {
      clearInterval(item);
    });
  };

  handleChangeChartData = (e, item, index) => {
    const { value } = e.target;
    const {
      dispatch,
      sourceMonitor: { probesData },
    } = this.props;
    const { timeRange } = this.state;
    const newTimeRange = _.clone(timeRange);
    newTimeRange[index] = value;
    this.setState({ timeRange: newTimeRange });
    // 发请求
    dispatch({
      type: 'sourceMonitor/fetchChartListData',
      payload: { value: e.target.value, id: probesData[index].sensor_id, num: index },
    });
  };

  handleLoghandleLog = (item) => {
    const { dispatch } = this.props;
    dispatch({ type: 'sourceMonitor/fetchListLog', payload: { ip: item.ip } });
  };

  suricataStateClick = (status) => {
    // console.log('status==', status);
    if (status === false) {
      Modal.warn({
        title: '探针发送流量日志到数据分析平台失败，请下载诊断日志进行分析',
      });
    }
  };

  downloadSourceLogFile = (ip) => {
    const time = moment().valueOf();
    window.location.href = `/api/dashboard/downloadLog?ip=${ip}&time=${time}`;
  };

  render() {
    const {
      sourceMonitor: { probesData },
      loading,
      loading1,
    } = this.props;
    // console.log('data', probesData);
    const { timeRange } = this.state;
    // console.log('range', timeRange);
    if (loading1) {
      return (
        <div style={{ background: '#fff', minHeight: 400 }}>
          <Spin />
        </div>
      );
    }
    return (
      <div>
        {probesData.length === 0 ? (
          <div>
            <div style={{ textAlign: 'center' }}>暂无数据</div>
          </div>
        ) : (
          probesData.map((item, index) => (
            <div loading={loading} key={item.sensor_id} className={styles.wrapper}>
              <div className={item.status ? styles.normal : styles.abnormal}>
                <Card title={`流量探针${index + 1}`}>
                  <Row gutter={32}>
                    <Col span={1}>
                      <div className={styles.avator}>
                        <img
                          src={
                            (item.suricata_state !== 'stop' &&
                              item.status &&
                              item.interface_state) ||
                            (item.suricata_state === 'stop' && item.interface_state)
                              ? serverAvator
                              : serverAvator2
                          }
                          alt="avator"
                        />
                      </div>
                    </Col>
                    <Col span={6} style={{ lineHeight: '28px' }}>
                      <div className={styles.ipcontent}>{item.ip}</div>
                      <div>
                        {item.suricata_state !== 'stop' && (
                          <Tooltip
                            title={
                              item.status
                                ? ''
                                : '探针发送流量日志到数据分析平台失败，请下载诊断日志进行分析'
                            }
                          >
                            <span
                              // onClick={() => {
                              //   this.suricataStateClick(item.status);
                              // }}
                              className={item.status ? styles.online : styles.expect}
                            >
                              {item.status ? '数据发送正常' : '数据发送异常'}
                            </span>
                          </Tooltip>
                        )}
                        <Tooltip
                          title={
                            item.interface_state
                              ? ''
                              : '流量探针采集网口配置异常，请检测探针采集网口配置情况'
                          }
                        >
                          <span className={item.interface_state ? styles.online : styles.expect}>
                            {item.interface_state ? '流量采集网口正常' : '流量采集网口异常'}
                          </span>
                        </Tooltip>
                        <Tooltip
                          placement="bottomLeft"
                          title={
                            item.node_state ? '' : '流量探针状态异常，请检查探针服务状态或网卡状态'
                          }
                        >
                          <span className={item.node_state ? styles.online : styles.expect}>
                            {item.node_state ? '探针状态正常' : '探针状态异常'}
                          </span>
                        </Tooltip>
                        {item.suricata_state === 'stop' && (
                          <span className={styles.expect}>流量引擎关闭</span>
                        )}
                      </div>
                      <Row gutter={2}>
                        <Col span={8}>CPU使用率:</Col>
                        <Col span={15}>
                          {item.cpu_usage < 85 ? (
                            <Progress percent={item.cpu_usage} size="small" />
                          ) : (
                            <Progress
                              size="small"
                              percent={item.cpu_usage}
                              status="exception"
                              format={() => `${item.cpu_usage}%`}
                            />
                          )}
                        </Col>
                      </Row>
                      <Row gutter={2}>
                        <Col span={8}>内存使用率:</Col>
                        <Col span={15}>
                          {item.mem_usage < 85 ? (
                            <Progress percent={item.mem_usage} size="small" />
                          ) : (
                            <Progress
                              size="small"
                              percent={item.mem_usage}
                              status="exception"
                              format={() => `${item.mem_usage}%`}
                            />
                          )}
                        </Col>
                      </Row>
                      <Row gutter={2}>
                        <Col span={8}>硬盘使用率:</Col>
                        <Col span={15}>
                          {item.disk_usage < 85 ? (
                            <Progress percent={item.disk_usage} size="small" />
                          ) : (
                            <Progress
                              size="small"
                              percent={item.disk_usage}
                              status="exception"
                              format={() => `${item.disk_usage}%`}
                            />
                          )}
                        </Col>
                      </Row>
                      <Row gutter={2}>
                        <Col span={8}>硬盘负载:</Col>
                        <Col span={15}>
                          {item.disk_load < 85 ? (
                            <Progress percent={item.disk_load} size="small" />
                          ) : (
                            <Progress
                              size="small"
                              percent={item.disk_load}
                              status="exception"
                              format={() => `${item.disk_load}%`}
                            />
                          )}
                        </Col>
                      </Row>
                      <Row gutter={2}>
                        <Col span={8}>CPU负载:</Col>
                        <Col span={15}>
                          {item.cpu_load < 85 ? (
                            <Progress percent={item.cpu_load} size="small" />
                          ) : (
                            <Progress
                              size="small"
                              percent={item.cpu_load}
                              status="exception"
                              format={() => `${item.cpu_load}%`}
                            />
                          )}
                        </Col>
                      </Row>
                      <Row gutter={2}>
                        <Col span={8}>服务数:</Col>
                        <Col span={15}>{item.normal_service + item.unnormal_service}</Col>
                      </Row>
                      <Row gutter={2}>
                        <Col span={8}>异常服务数:</Col>
                        <Col span={15}>
                          <span style={{ marginRight: 6 }}>{item.unnormal_service}</span>
                          {item.unnormal_service !== 0 && (
                            <Tooltip
                              placement="topRight"
                              title={`异常服务名：${item.unnormal_service_name.join('、')}`}
                            >
                              <InfoCircleFilled className="fontRed" />
                            </Tooltip>
                          )}
                        </Col>
                      </Row>
                      <Row gutter={2}>
                        <Col span={8}>持续运行时间:</Col>
                        <Col span={15}>{numberTransform(item.runtime)}</Col>
                      </Row>
                      <Row gutter={2}>
                        <Col span={8}>最近流量接收时间:</Col>
                        <Col span={15}>{item.timestamp}</Col>
                      </Row>
                      <div className={styles.download}>
                        <FileTextOutlined />
                        <a
                          onClick={() => {
                            this.downloadSourceLogFile(item.node_ip);
                          }}
                        >
                          <span>下载诊断日志</span>
                        </a>
                      </div>
                      {/* )} */}
                    </Col>
                    <Col span={4}>
                      <div className={styles.realpackTitle}>实时流量采集数</div>
                      <div className={styles.packCon}>
                        {item.real_pack * 8 < 1000 && (
                          <div className={styles.pack}>
                            <span className={styles.num}>
                              <img src={packsAvator} alt="avator" />
                              <span style={{ padding: '0 5px' }}>
                                {Number(item.real_pack).toFixed(2) * 8}
                              </span>
                            </span>
                            <span>bps</span>
                          </div>
                        )}
                        {item.real_pack * 8 >= 1000 && item.real_pack * 8 < 1000000 && (
                          <div className={styles.pack}>
                            <span className={styles.num}>
                              <img src={packsAvator} alt="avator" />
                              <span style={{ padding: '0 5px' }}>
                                {((item.real_pack * 8) / 1000).toFixed(2)}
                              </span>
                            </span>
                            <span>Kbps</span>
                          </div>
                        )}
                        {item.real_pack * 8 >= 1000000 && item.real_pack * 8 < 1000000000 && (
                          <div className={styles.pack}>
                            <span className={styles.num}>
                              <img src={packsAvator} alt="avator" />
                              <span style={{ padding: '0 5px' }}>
                                {((item.real_pack * 8) / 1000000).toFixed(2)}
                              </span>
                            </span>
                            <span>Mbps</span>
                          </div>
                        )}
                        {item.real_pack * 8 >= 1000000000 && (
                          <div className={styles.pack}>
                            <span className={styles.num}>
                              <img src={packsAvator} alt="avator" />
                              <span style={{ padding: '0 5px' }}>
                                {((item.real_pack * 8) / 1000000000).toFixed(2)}
                              </span>
                            </span>
                            <span>Gbps</span>
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col span={13}>
                      <div style={{ width: '120px', marginLeft: '75%' }}>
                        <Radio.Group
                          value={timeRange[index]}
                          onChange={(e) => {
                            this.handleChangeChartData(e, item, index);
                          }}
                        >
                          <Radio.Button value={24}>24h</Radio.Button>
                          <Radio.Button value={1}>1h</Radio.Button>
                        </Radio.Group>
                      </div>
                      {item.chartData.length > 0 && (
                        <LineChart
                          hasLegend={false}
                          scale={{
                            value: { alias: '速率', tickCount: 6, type: 'linear', nice: false },
                          }}
                          data={item.chartData}
                          height={248}
                          xAxisName="timestamp"
                          color="#5075FF"
                          type="flow"
                        />
                      )}
                      {item.chartData.length === 0 && (
                        <div
                          style={{
                            height: '248px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <div>暂无数据</div>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
}
export default SourceMonitor;
