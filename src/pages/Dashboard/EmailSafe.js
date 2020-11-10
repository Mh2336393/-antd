/* eslint-disable no-prototype-builtins */
import React, { Component } from 'react';
import { connect } from 'umi';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Row, Col, Card, Table, Button, Progress, Popover, Tooltip } from 'antd';
import { Pie, IntervalStackBarchart } from '@/components/Charts';
// import { Link } from 'umi';
import { history } from 'umi';
import numeral from 'numeral';
import FilterBlock from '@/components/FilterBlock/Filter';
import moment from 'moment';
import styles from './EmailSafe.less';
import Yuan from '@/utils/Yuan';
import configSettings from '../../configSettings';
import EmailViewAll from './EmailViewAll';
import authority from '@/utils/authority';
const { getAuth } = authority;
// import PageHeaderWrapper from '@/components/PageHeaderWrapper/';
// import DNSViewAll from './DNSViewAll';

const Desc = ({ value }) => (
  <div>
    <h4 style={{ color: '#fff' }}>场景描述</h4>
    <p>{value[0]}</p>
    <h4 style={{ color: '#fff' }}>使用方法</h4>
    <p>{value[1]}</p>
  </div>
);
@connect(({ emailSafe, global, loading }) => ({
  emailSafe,
  isKVM: global.isKVM,
  // emailCountLoading: loading.effects['emailSafe/fetchEmailCount'],
  attachCountLoading: loading.effects['emailSafe/fetchAttachCount'],
  sourceCountryLoading: loading.effects['emailSafe/fetchSourceCountry'],
  sendDataLoading: loading.effects['emailSafe/fetchSendData'],
  reciveDataLoading: loading.effects['emailSafe/fetchReciveData'],
  fishMailLoading: loading.effects['emailSafe/fetchFishMailData'],
  falseMailLoading: loading.effects['emailSafe/fetchFalseMailList'],
  maliciousMailLoading: loading.effects['emailSafe/fetchMaliciousMail'],
  mailAttachLoading: loading.effects['emailSafe/fetchMailAttach'],
}))
class DashboardEmail extends Component {
  constructor(props) {
    super(props);
    this.fileAuth = getAuth('/event/safeEvent/alarmFile');
    this.state = {
      query: {
        size: 5, // 返回条数
        startTime: moment().subtract(1, 'day').valueOf(),
        endTime: moment().valueOf(),
        recipient: '', // 收件人
        sender: '', // 发件人
        searchContent: '', // 搜索条件
        sort: '',
        dir: '',
      },
      timeRange: '近24小时',
      showDetail: false,
      detailType: '', // type类型
    };
    this.filterList = [
      {
        type: 'select',
        name: '时间',
        key: 'timeRange',
        list: [
          {
            name: '近24小时',
            value: '近24小时',
          },
          {
            name: '近7天',
            value: '近7天',
          },
          {
            name: '近30天',
            value: '近30天',
          },
          {
            name: '自定义',
            value: '自定义',
          },
        ],
      },
      {
        type: 'input',
        name: '发件人',
        key: 'sender',
        pressEnter: true,
      },
      {
        type: 'input',
        name: '收件人',
        key: 'recipient',
        pressEnter: true,
      },
      {
        type: 'input',
        name: '搜索',
        key: 'searchContent',
        placeholder: '邮件主题/邮件内容',
        pressEnter: true,
      },
    ];

    this.sourceCountryColumns = [
      { title: '来源国家', dataIndex: 'key', key: 'key', width: 260 },
      { title: '邮件数', dataIndex: 'doc_count', key: 'doc_count' },
      {
        title: '占比',
        dataIndex: 'percent',
        key: 'percent',
        width: 200,
        render: (text) => (
          <Progress
            style={{ width: 140 }}
            percent={text}
            status="normal"
            format={() => `${text}%`}
          />
        ),
      },
    ];

    this.sendDataColumns = [
      {
        title: '发件人',
        dataIndex: 'key',
        key: 'key',
        width: 300,
      },
      {
        title: '收件人数',
        dataIndex: 'reciver',
        key: 'reciver',
        // width: 400,
        render: (text) => text.length,
      },
      {
        title: '邮件数',
        dataIndex: 'doc_count',
        key: 'doc_count',
        // width: 200,
      },
      {
        title: '占比',
        dataIndex: 'percent',
        key: 'percent',
        width: 200,
        render: (text) => (
          <Progress
            style={{ width: 140 }}
            status="normal"
            percent={text}
            format={() => `${text}%`}
          />
        ),
      },
    ];
    this.reciveDataColumns = [
      {
        title: '收件人',
        dataIndex: 'key',
        key: 'key',
        width: 300,
      },
      {
        title: '发件人数',
        dataIndex: 'sender',
        key: 'sender',
        // width: 400,
        render: (text) => text.length,
      },
      {
        title: '邮件数',
        dataIndex: 'doc_count',
        key: 'doc_count',
        // width: 200,
      },
      {
        title: '占比',
        dataIndex: 'percent',
        key: 'percent',
        width: 200,
        render: (text) => (
          <Progress
            style={{ width: 140 }}
            status="normal"
            percent={text}
            format={() => `${text}%`}
          />
        ),
      },
    ];
    this.fishMailColumns = [
      {
        title: '邮件正文包含域名',
        dataIndex: 'key',
        key: 'key',
        width: 300,
      },
      {
        title: '邮件数',
        dataIndex: 'doc_count',
        key: 'doc_count',
        width: 200,
      },
      {
        title: '收件人',
        dataIndex: 'mailTo',
        key: 'mailTo',
        width: 200,
        render: (text) => {
          const popContent = (
            <div>
              {text.map((item) => (
                <p key={item.key}>{item.key}</p>
              ))}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              {text.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                  title="收件人"
                >
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p> {text[0] ? text[0].key : ''} </p>
              )}
            </div>
          );
        },
      },
      {
        title: '最近一次收件时间',
        dataIndex: 'time',
        key: 'time',
        width: 300,
        render: (text) => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '该域名请求次数',
        dataIndex: 'resCount',
        key: 'resCount',
        width: 200,
      },
    ];
    this.falseMailColumns = [
      {
        title: '发件人IP',
        dataIndex: 'key',
        key: 'key',
        width: 200,
      },
      {
        title: '发件人邮箱',
        dataIndex: 'mailFrom',
        key: 'mailFrom',
        // width: 200,
        render: (text) => {
          const popContent = (
            <div>
              {text.map((item) => (
                <p key={item.key}>{item.key}</p>
              ))}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              {text.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                  title="发件人邮箱"
                >
                  <p>
                    多个(<span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p> {text[0] ? text[0].key : ''} </p>
              )}
            </div>
          );
        },
      },
      {
        title: '收件人',
        dataIndex: 'mailTo',
        key: 'mailTo',
        // width: 200,
        render: (text) => {
          const popContent = (
            <div>
              {text.map((item) => (
                <p key={item.key}>{item.key}</p>
              ))}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              {text.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                  title="收件人"
                >
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p> {text[0] ? text[0].key : ''} </p>
              )}
            </div>
          );
        },
      },
      {
        title: '邮件主题',
        dataIndex: 'theme',
        key: 'theme',
        width: 300,
        render: (text) => {
          const popContent = (
            <div>
              {text.map((item) => (
                <p key={item.key}>{item.key}</p>
              ))}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              {text.length > 1 ? (
                <Popover
                  content={popContent}
                  getPopupContainer={(triggerNode) => triggerNode}
                  placement="bottomLeft"
                  title="邮件主题"
                >
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p> {text[0] ? text[0].key : ''} </p>
              )}
            </div>
          );
        },
      },
      {
        title: '告警时间',
        dataIndex: 'time',
        key: 'time',
        width: 200,
        render: (text) => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
    ];
    this.maliciousMailColumns = [
      {
        title: '事件评分',
        dataIndex: 'score',
        key: 'score',
        width: 200,
        render: (text) => (
          <span style={{ color: configSettings.scoreColorMap(text).color }}>
            {text}（{configSettings.scoreColorMap(text).label}）
          </span>
        ),
      },
      {
        title: '事件名称',
        dataIndex: 'md5',
        key: 'md5',
        width: 500,
        render: (text) => (
          <span>
            文件检测:
            {text}
          </span>
        ),
      },
      {
        title: '分类',
        dataIndex: 'category_2',
        key: 'category_2',
        width: 300,
      },
      {
        title: '病毒名',
        dataIndex: 'virusName',
        key: 'virusName',
        width: 200,
      },
      {
        title: '告警时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 200,
        render: (text) => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
    ];
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { query } = this.state;
    const { dispatch, isKVM } = this.props;
    dispatch({
      type: 'emailSafe/fetchAttachCount',
      payload: { ...query },
    });
    dispatch({
      type: 'emailSafe/fetchSourceCountry',
      payload: { ...query },
    });
    dispatch({
      type: 'emailSafe/fetchSendWhiteList',
      payload: { ...query },
    });
    dispatch({
      type: 'emailSafe/fetchReciveWhiteList',
      payload: { ...query },
    });
    dispatch({
      type: 'emailSafe/fetchFishWhiteList',
      payload: { ...query },
    });
    dispatch({
      type: 'emailSafe/fetchFalseWhiteList',
      payload: { ...query },
    });
    if (!isKVM) {
      dispatch({
        type: 'emailSafe/fetchMaliciousMail',
        payload: { ...query },
      });
      dispatch({
        type: 'emailSafe/fetchMailAttach',
        payload: { ...query },
      });
    }
  };

  filterOnChange = (type, value) => {
    const { query } = this.state;
    let changePart;
    if (type === 'timeRange') {
      changePart = {
        startTime: value[0],
        endTime: value[1],
      };
      this.setState({
        timeRange: value[2],
      });
    } else {
      changePart = { [type]: value };
    }
    const newQuery = Object.assign({}, query, changePart);
    this.setState({
      query: newQuery,
    });
  };

  toLink = (type, data) => {
    // const { query: { recipient, sender, searchContent } } = this.state;
    const {
      emailSafe: { mailXYobj, picInterval },
      // dispatch,
    } = this.props;
    if (type === 'content') {
      const emailType = data.type;
      const emailTime = data['时间'];
      const startTime = new Date(emailTime).getTime();
      const endTime = startTime + picInterval;
      if (emailType !== '其他邮件') {
        // 跳转到事件页
        const obj = mailXYobj[emailType][emailTime];
        console.log('obj==', obj);
        let name = [];
        if (emailType === '钓鱼邮件') {
          name = ['钓鱼邮件攻击'];
        } else if (emailType === '邮件伪造') {
          name = ['邮件伪造攻击'];
        } else if (emailType === '恶意附件') {
          name = ['SMTP邮件恶意附件发送', 'POP邮件恶意附件下载'];
        }
        // encodeURIComponent(name)
        const secLink = `/event/safeEvent/alarm?startTime=${startTime}&endTime=${endTime}&name=${JSON.stringify(
          name
        )}`;
        window.open(secLink);
      } else {
        // 其他邮件原来的需求是跳转到检索页，但是这个条件是没法写的flowid可能是重的，并且你数据量大了带几千个flow_id,你都没办法url传参
        // let totalFlows = [];
        // let evilFlow = [];
        // const array = ['其他邮件', '钓鱼邮件', '邮件伪造', '恶意附件']
        // array.forEach(name => {
        //   console.log('name==', name, "emailTime==", emailTime);
        //   if (mailXYobj.hasOwnProperty(name)) {
        //     const obj = mailXYobj[name][emailTime];
        //     if (name === '其他邮件') {
        //       totalFlows = obj.flow_id;
        //     } else {
        //       evilFlow = evilFlow.concat(obj.flow_id);
        //     }
        //   }
        // });
        // console.log('全部邮件总数==', totalFlows);
        // console.log('钓鱼+伪造+附件==', evilFlow);
        // if (totalFlows.length) {
        //   const smtpFlows = totalFlows.filter(flowid => evilFlow.indexOf(flowid) < 0);
        //   console.log('其他邮件总数==', smtpFlows);
        //   const condition = `flow_id:${smtpFlows.join(' OR ')}`;
        //   const linkHref = `/analysis/search?startTime=${startTime}&endTime=${endTime}&type=smtp,pop,imap&condition=${condition}`;
        //   // console.log();
        //   window.open(linkHref);
        // }
      }
    }
  };

  // 饼图 legend 跳转-新增，不一定要加，到时候看需求
  eventlegendOnclick = (value) => {
    const {
      query: { startTime, endTime, recipient, sender, searchContent },
    } = this.state;
    console.log(377, startTime, endTime, recipient, sender, searchContent, 'value==', value);
  };

  showDetail = (type) => {
    this.setState({ showDetail: true, detailType: type });
  };

  jump = () => {
    // console.log('跳转到异常文件感知');
    if (this.fileAuth.indexOf('r') > -1) {
      const { query, timeRange } = this.state;
      console.log('range', timeRange);
      history.push({
        pathname: '/event/safeEvent/alarmFile',
        query: {
          startTime: query.startTime,
          endTime: query.endTime,
          appProtocol: ['smtp', 'imap', 'pop'],
          // protocol: ['smtp', 'imap', 'pop3', timeRange],
        },
      });
    }
  };

  showOverview = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    this.setState({ showDetail: false, detailType: '' });
    dispatch({
      type: 'emailSafe/fetchSendWhiteList',
      payload: { ...query },
    });
    dispatch({
      type: 'emailSafe/fetchReciveWhiteList',
      payload: { ...query },
    });
    dispatch({
      type: 'emailSafe/fetchFishWhiteList',
      payload: { ...query },
    });
    dispatch({
      type: 'emailSafe/fetchFalseWhiteList',
      payload: { ...query },
    });
  };

  submitFilter = () => {
    this.fetchData();
  };

  reactNodeHeader = () => (
    <div>
      <span style={{ margin: '0px 5px 0px 0px' }}>钓鱼邮件</span>
      <Tooltip
        placement="rightTop"
        title={
          <Desc
            value={[
              '通过对邮件的正文内容进行检测，发现钓鱼链接。同时通过对网络内DNS流量分析判断该钓鱼链接是否已被用户点击。',
              '可关注“该域名请求次数”字段，若不为0，则该钓鱼链接已有用户点击。用户可通过“域名检索”（全部列表页每一条记录均提供该菜单），查看该钓鱼链接的请求流量日志；或者可通过“邮件检索”（全部列表页每一条记录均提供该菜单），查看该钓鱼邮件原始流量记录。',
            ]}
          />
        }
      >
        <QuestionCircleFilled className="fontBlue" />
      </Tooltip>
    </div>
  );

  falseMailHeader = () => (
    <div>
      <span style={{ margin: '0px 5px 0px 0px' }}>邮件伪造</span>
      <Tooltip
        placement="rightTop"
        title="SMTP协议不需要身份认证，利用这个特性可以伪造任意发件人。邮件伪造检测技术使用SPF记录，首先检查发件人对应域名的SPF记录，来确定发件人的IP地址是否被包含在SPF记录里面，如果在，就认为是一封正确的邮件，否则会认为是伪造的邮件。"
      >
        <QuestionCircleFilled className="fontBlue" />
      </Tooltip>
    </div>
  );

  emailTotal = (mailAttach) => {
    let total = 0;
    mailAttach.forEach((item) => {
      if (item.y) {
        total += item.y;
      }
    });
    return total;
  };

  render() {
    const {
      emailSafe: {
        attacheCount,
        sourceCountry,
        sendData,
        reciveData,
        fishMailData,
        falseMailList,
        maliciousMail,
        mailAttach,
      },
      // emailCountLoading,
      attachCountLoading,
      sourceCountryLoading,
      sendDataLoading,
      reciveDataLoading,
      fishMailLoading,
      falseMailLoading,
      maliciousMailLoading,
      mailAttachLoading,
      isKVM,
    } = this.props;
    const { query, timeRange, showDetail, detailType } = this.state;
    return (
      <div className="contentWraper">
        {showDetail ? (
          <EmailViewAll type={detailType} showOverview={this.showOverview} preQuery={query} />
        ) : null}
        {showDetail ? null : (
          <div>
            <div className="commonHeader">邮件安全</div>
            <div>
              <div className="filterWrap">
                <FilterBlock
                  key={query}
                  filterList={this.filterList}
                  filterOnChange={this.filterOnChange}
                  submitFilter={this.submitFilter}
                  colNum={3}
                  query={query}
                  timeRange={timeRange}
                />
              </div>
              <div style={{ padding: '12px' }}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Card
                      loading={attachCountLoading}
                      title={
                        <div>
                          <span style={{ marginRight: 10 }}>恶意邮件趋势</span>
                          <Tooltip
                            placement="rightTop"
                            title="统计邮件伪造、钓鱼邮件、恶意邮件附件等邮件安全问题的邮件数量。"
                          >
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                        </div>
                      }
                      bodyStyle={{ padding: 24 }}
                      style={{ minHeight: 440 }}
                    >
                      <IntervalStackBarchart
                        toLink={this.toLink}
                        linkType="content"
                        data={attacheCount}
                        height={248}
                        // color={['type', ['#1890ff', '#0050b3', '#5075FF', '#4BBDF5']]}
                        color={[
                          'type',
                          [
                            '#9DD96C',
                            '#4BBDF5',
                            '#F3EB4A',
                            '#5075FF',
                            '#13C2C2',
                            '#6CD9B3',
                            '#2FC25B',
                          ],
                        ]}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      loading={sourceCountryLoading}
                      title={
                        <div>
                          <span style={{ marginRight: 10 }}>来源国家统计</span>
                          <Tooltip
                            placement="rightTop"
                            title="恶意邮件往往会通过海外邮件服务器发送，跟踪邮件来源国家可作为恶意邮件溯源的线索。"
                          >
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                        </div>
                      }
                      bodyStyle={{ padding: 24 }}
                      style={{ minHeight: 440 }}
                    >
                      <Table
                        dataSource={sourceCountry}
                        columns={this.sourceCountryColumns}
                        size="small"
                        pagination={false}
                      />
                      <div className={styles.showMore}>
                        <Button
                          onClick={() => {
                            this.showDetail('sourceType');
                          }}
                        >
                          查看全部
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>
                <Row gutter={24} style={{ marginTop: '20px' }}>
                  <Col span={12}>
                    <Card
                      loading={sendDataLoading}
                      title={
                        <div>
                          <span style={{ marginRight: 10 }}>发件人统计</span>
                          <Tooltip
                            placement="rightTop"
                            title="通过对发件人发送的邮件数进行统计来发现异常。"
                          >
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                        </div>
                      }
                      bodyStyle={{ padding: 24 }}
                      style={{ minHeight: 440 }}
                    >
                      <Table
                        dataSource={sendData}
                        columns={this.sendDataColumns}
                        size="small"
                        pagination={false}
                      />
                      <div className={styles.showMore}>
                        <Button
                          onClick={() => {
                            this.showDetail('sendType');
                          }}
                        >
                          查看全部
                        </Button>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      loading={reciveDataLoading}
                      title={
                        <div>
                          <span style={{ marginRight: 10 }}>收件人统计</span>
                          <Tooltip
                            placement="rightTop"
                            title="通过对收件人接收的邮件数进行统计来发现异常。"
                          >
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                        </div>
                      }
                      bodyStyle={{ padding: 24 }}
                      style={{ minHeight: 440 }}
                    >
                      <Table
                        dataSource={reciveData}
                        columns={this.reciveDataColumns}
                        size="small"
                        pagination={false}
                      />
                      <div className={styles.showMore}>
                        <Button
                          onClick={() => {
                            this.showDetail('reciveType');
                          }}
                        >
                          查看全部
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>
                <div style={{ marginTop: '20px' }}>
                  <Card loading={fishMailLoading} title={this.reactNodeHeader()}>
                    <Table
                      dataSource={fishMailData}
                      columns={this.fishMailColumns}
                      pagination={false}
                    />
                    <div className={styles.showMore}>
                      <Button
                        onClick={() => {
                          this.showDetail('fishType');
                        }}
                      >
                        查看全部
                      </Button>
                    </div>
                  </Card>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <Card loading={falseMailLoading} title={this.falseMailHeader()}>
                    <Table
                      dataSource={falseMailList}
                      columns={this.falseMailColumns}
                      pagination={false}
                    />
                    <div className={styles.showMore}>
                      <Button
                        onClick={() => {
                          this.showDetail('falseType');
                        }}
                      >
                        查看全部
                      </Button>
                    </div>
                  </Card>
                </div>
                {!isKVM && (
                  <div style={{ marginTop: '20px' }}>
                    <Card
                      loading={maliciousMailLoading}
                      title={
                        <div>
                          <span style={{ marginRight: 10 }}>恶意邮件附件</span>
                          <Tooltip placement="rightTop" title="附件被沙箱鉴别为恶意的邮件。">
                            <QuestionCircleFilled className="fontBlue" />
                          </Tooltip>
                        </div>
                      }
                    >
                      <Table
                        dataSource={maliciousMail}
                        columns={this.maliciousMailColumns}
                        pagination={false}
                      />
                      <div className={styles.showMore}>
                        {this.fileAuth.indexOf('r') > -1 && (
                          <Button onClick={this.jump}>查看全部</Button>
                        )}
                        {/* <Link to={`/event/safeEvent/file?startTime=${query.startTime}&endTime=${query.endTime}`}>查看全部</Link> */}
                      </div>
                    </Card>
                  </div>
                )}
                {!isKVM && (
                  <Row gutter={24} style={{ marginTop: '20px' }}>
                    <Col span={12}>
                      <Card
                        loading={mailAttachLoading}
                        title={
                          <div>
                            <span style={{ marginRight: 10 }}>邮件附件类型分布</span>
                            <Tooltip
                              placement="rightTop"
                              title="按照附件的真实类型统计数量及占比。"
                            >
                              <QuestionCircleFilled className="fontBlue" />
                            </Tooltip>
                          </div>
                        }
                        bodyStyle={{ padding: 24 }}
                        style={{ minHeight: 440 }}
                      >
                        <Pie
                          hasLegend
                          subTitle="邮件数"
                          total={() => <Yuan>{this.emailTotal(mailAttach)}</Yuan>}
                          data={mailAttach}
                          valueFormat={(value) => numeral(value).format('0,0')}
                          height={248}
                          lineWidth={4}
                          legendOnclick={this.eventlegendOnclick}
                          itemTpl='<li data-index={index} style="margin-bottom:4px;">
                            <p style="margin-bottom:0;">
                              <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
                              {num}  
                            </p>
                            <p style="margin-bottom:0;">
                            <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
                            {percent}
                            </p>
                            </li>'
                          geoTootip={[
                            'y*percent',
                            (y, p) => ({
                              num: `数量:${y}`,
                              percent: `占比: ${(p * 100).toFixed(2)}%`,
                            }),
                          ]}
                        />
                      </Card>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default DashboardEmail;
