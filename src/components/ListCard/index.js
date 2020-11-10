import React, { PureComponent, Fragment } from 'react';
import { FileTextOutlined, InfoCircleFilled } from '@ant-design/icons';
import { Row, Col, Card, Progress, Tooltip, Button } from 'antd';
// import moment from 'moment';
import styles from './index.less';
import { numberTransform } from '../../tools/formatNumber';
import serverAvator from '../../assets/image/icon_monitor_server_2.png';
import serverAvator2 from '../../assets/image/icon_monitor_server_3.png';

class ListCard extends PureComponent {
  render() {
    const { listData, listType, showVmWin10, ipsInfo = {} } = this.props; // setModalVisable
    // const listElement = [];
    // visible = false
    // title = '诊断日志'
    // console.log('showVmWin10==', showVmWin10, 'listType===', listType);
    return (
      <Row gutter={16}>
        {listData.map((item, index) => (
          <Col key={parseInt(index.toString(), 10)} span={8}>
            <Card>
              <div className={styles.cardContent}>
                <div className={styles.des}>
                  {listType === 'platRun' && (
                    <div className={styles.avator}>
                      <img src={item.online ? serverAvator : serverAvator2} alt="avator" />
                    </div>
                  )}
                  {listType === 'hardware' && (
                    <div className={styles.avator}>
                      <img src={item.online ? serverAvator : serverAvator2} alt="avator" />
                    </div>
                  )}
                  {listType === 'running' && (
                    <div className={styles.avator}>
                      <img src={item.abnormal_num === 0 ? serverAvator : serverAvator2} alt="avator" />
                    </div>
                  )}
                  {listType === 'sandbox' && item.type === 'master' && (
                    <div className={styles.avator}>
                      <img src={item.online ? serverAvator : serverAvator2} alt="avator" />
                    </div>
                  )}
                  {listType === 'sandbox' && item.type === 'slaver' && (
                    <div className={styles.avator}>
                      <img src={item.online ? serverAvator : serverAvator2} alt="avator" />
                    </div>
                  )}
                  <div className={styles.contentRight}>
                    <div className={styles.desTitle}>
                      {(listType === 'hardware' || listType === 'running' || listType === 'platRun') && (
                        <Fragment>
                          <span className={styles.ip}>{item.ip}&nbsp;&nbsp;</span>
                          <span style={{ fontWeight: 'bold' }}>
                            类型：{ipsInfo[item.ip] && ipsInfo[item.ip].cate && ipsInfo[item.ip].cate.join(' ')}
                          </span>
                        </Fragment>
                      )}
                      {listType === 'sandbox' && item.type === 'master' && <span>沙箱调度控制服务</span>}
                      {listType === 'sandbox' && item.type === 'slaver' && <span>沙箱分析机</span>}
                      {listType === 'sandbox' && <span className={styles.ip}>{item.ip}</span>}
                    </div>
                    {listType === 'platRun' && (
                      <div>
                        <span className={item.online ? styles.online : styles.underline}>{item.online ? '在线' : '离线'}</span>
                        <span className={item.abnormal_num === 0 ? styles.normal : styles.abnormal}>
                          {item.abnormal_num === 0 ? '服务状态正常' : '服务状态异常'}
                        </span>
                      </div>
                    )}
                    {listType === 'hardware' && (
                      <div>
                        <span className={item.online ? styles.online : styles.underline}>{item.online ? '在线' : '离线'}</span>
                        <span className={item.online ? styles.normal : styles.abnormal}>{item.online ? '状态正常' : '状态异常'}</span>
                      </div>
                    )}
                    {listType === 'running' && (
                      <div>
                        <span className={item.online ? styles.online : styles.underline}>{item.online ? '在线' : '离线'}</span>
                        <span className={item.abnormal_num === 0 ? styles.normal : styles.abnormal}>
                          {item.abnormal_num === 0 ? '状态正常' : '状态异常'}
                        </span>
                      </div>
                    )}
                    {listType === 'sandbox' && (
                      <div>
                        {item.type === 'master' && (
                          <span className={item.online ? styles.online : styles.underline}>{item.online ? '在线' : '离线'}</span>
                        )}
                        {item.type === 'slaver' && (
                          <Fragment>
                            {item.online ? (
                              <span className={styles.normal}>状态正常</span>
                            ) : (
                                <Tooltip
                                  placement="topLeft"
                                  title={`沙箱运行状态异常，${item.extra_info ? `自检结果：${item.extra_info}。` : ''
                                    }详情请下载诊断日志进行分析`}
                                >
                                  <span className={styles.abnormal}>状态异常</span>
                                </Tooltip>
                              )}
                          </Fragment>
                        )}
                      </div>
                    )}
                    {listType === 'platRun' && (
                      <div>
                        <Row gutter={2}>
                          <Col span={8}>CPU使用率:</Col>
                          <Col span={15}>
                            {item.cpu_usage < 85 ? (
                              <Progress percent={item.cpu_usage} size="small" />
                            ) : (
                                <Progress size="small" percent={item.cpu_usage} status="exception" format={() => `${item.cpu_usage}%`} />
                              )}
                          </Col>
                        </Row>
                        <Row gutter={2}>
                          <Col span={8}>内存使用率:</Col>
                          <Col span={15}>
                            {item.mem_usage < 85 ? (
                              <Progress percent={item.mem_usage} size="small" />
                            ) : (
                                <Progress size="small" percent={item.mem_usage} status="exception" format={() => `${item.mem_usage}%`} />
                              )}
                          </Col>
                        </Row>
                        <Row gutter={2}>
                          <Col span={8}>硬盘使用率:</Col>
                          <Col span={15}>
                            {item.disk_usage < 85 ? (
                              <Progress percent={item.disk_usage} size="small" />
                            ) : (
                                <Progress size="small" percent={item.disk_usage} status="exception" format={() => `${item.disk_usage}%`} />
                              )}
                          </Col>
                        </Row>
                        <Row gutter={2}>
                          <Col span={8}>硬盘负载:</Col>
                          <Col span={15}>
                            {item.disk_load < 85 ? (
                              <Progress percent={item.disk_load} size="small" />
                            ) : (
                                <Progress size="small" percent={item.disk_load} status="exception" format={() => `${item.disk_load}%`} />
                              )}
                          </Col>
                        </Row>
                        <Row gutter={2}>
                          <Col span={8}>CPU负载:</Col>
                          <Col span={15}>
                            {item.cpu_load < 85 ? (
                              <Progress percent={item.cpu_load} size="small" />
                            ) : (
                                <Progress size="small" percent={item.cpu_load} status="exception" format={() => `${item.cpu_load}%`} />
                              )}
                          </Col>
                        </Row>
                        <Row gutter={2}>
                          <Col span={8}>持续运行时间:</Col>
                          <Col span={15}>{numberTransform(item.sys_up_time)}</Col>
                        </Row>
                        <Row gutter={2}>
                          <Col span={8}>服务总数:</Col>
                          <Col span={15}>{item.server_num}</Col>
                        </Row>
                        {item.abnormal_num !== 0 && (
                          <Row gutter={2}>
                            <Col span={8}>异常服务:</Col>
                            <Col span={15}>
                              <span style={{ marginRight: 6 }}>{item.abnormal_num}</span>
                              {item.abnormal_num && (
                                <Tooltip placement="topRight" title={`异常服务名：${item.abnormal_psName.join('、')}`}>
                                  <InfoCircleFilled className="fontRed" />
                                </Tooltip>
                              )}
                            </Col>
                          </Row>
                        )}
                      </div>
                    )}
                    {listType === 'hardware' && (
                      <div>
                        <Row gutter={32}>
                          <Col span={4}>CPU:</Col>
                          <Col span={18}>
                            {item.cpu_usage < 85 ? (
                              <Progress percent={item.cpu_usage} size="small" />
                            ) : (
                                <Progress size="small" percent={item.cpu_usage} status="exception" format={() => `${item.cpu_usage}%`} />
                              )}
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={4}>内存: </Col>
                          <Col span={18}>
                            {item.mem_usage < 85 ? (
                              <Progress percent={item.mem_usage} size="small" />
                            ) : (
                                <Progress size="small" percent={item.mem_usage} status="exception" format={() => `${item.mem_usage}%`} />
                              )}
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={4}>硬盘: </Col>
                          <Col span={18}>
                            {item.disk_usage < 85 ? (
                              <Progress percent={item.disk_usage} size="small" />
                            ) : (
                                <Progress size="small" percent={item.disk_usage} status="exception" format={() => `${item.disk_usage}%`} />
                              )}
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={9}>持续运行时间:</Col>
                          <Col span={10}>{numberTransform(item.sys_up_time)}</Col>
                        </Row>
                      </div>
                    )}
                    {listType === 'running' && (
                      <div>
                        <p>服务总数: {item.server_num}</p>
                        {item.abnormal_num !== 0 && (
                          <p className={styles.ser_abnormal}>
                            <span style={{ marginRight: 6 }}>异常服务: {item.abnormal_num}</span>
                            {item.abnormal_num && (
                              <Tooltip placement="topRight" title={`异常服务名：${item.abnormal_psName.join('、')}`}>
                                <InfoCircleFilled className="fontRed" />
                              </Tooltip>
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {listType === 'sandbox' && item.type === 'master' && (
                      <div style={{ minHeight: '228px' }}>
                        <p>当前Windows XP待分析文件: {item.winxp}</p>
                        <p>当前Windows 7待分析文件: {item.win7}</p>
                        {showVmWin10 !== 'no' && <p>当前Windows 10待分析文件: {item.win10}</p>}
                        <p>当前Linux待分析文件: {item.linux}</p>
                        {/* {showVmWin10 !== 'no' && <p>当前Android待分析文件: {item.android}</p>} */}
                        {item.type === 'master' && <p>持续运行时间: {numberTransform(item.run_time)}</p>}
                      </div>
                    )}
                    {listType === 'sandbox' && item.type === 'slaver' && (
                      <div style={{ minHeight: '228px' }}>
                        {item.winxp !== 0 && <p>当前运行Windows XP: {item.winxp}</p>}
                        {item.win7 !== 0 && <p>当前运行Windows 7: {item.win7}</p>}
                        {item.win10 !== 0 && showVmWin10 !== 'no' && <p>当前运行Windows 10: {item.win10}</p>}
                        {item.linux !== 0 && <p>当前运行Linux: {item.linux}</p>}
                        {/* {item.android !== 0 && showVmWin10 !== 'no' && <p> 当前运行Android: {item.android}</p>} */}
                      </div>
                    )}
                  </div>

                  {listType === 'sandbox' && item.type === 'master' && !item.online && (
                    <div className={styles.download}>
                      <FileTextOutlined />
                      <Button
                        type="link"
                        size="size"
                        onClick={() => {
                          window.open(`/api/dashboard/sanboxLog?params={"slaver_name":""}&timestamp=${new Date().getTime()}`)
                        }}
                      >
                        下载诊断日志
                      </Button>
                    </div>
                  )}

                  {listType === 'sandbox' && item.type === 'slaver' && !item.online && (
                    <div className={styles.download}>
                      <FileTextOutlined />
                      <Button
                        type="link"
                        size="size"
                        onClick={() => {
                          window.open(`/api/dashboard/sanboxLog?params={"slaver_name":"slaver_${item.ip}"}&timestamp=${new Date().getTime()}`)
                        }}
                      >
                        下载诊断日志
                        </Button>
                    </div>
                  )}
 
                  {listType === 'platRun' && (!item.online || item.abnormal_num !== 0)  && (
                    <div className={styles.download}>
                      <FileTextOutlined />
                      <Button
                        type="link"
                        size="size"
                        onClick={() => {
                          window.open(`/api/dashboard/getCenterLog?timestamp=${new Date().getTime()}`)
                        }}
                      >
                        下载诊断日志
                        </Button>
                    </div>
                  )}

                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }
}

export default ListCard;
