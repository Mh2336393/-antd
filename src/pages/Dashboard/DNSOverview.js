import React, { Component } from 'react';
import { connect } from 'umi';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Row, Col, Card, Table, Button, Progress, Popover, Tooltip } from 'antd';
import numeral from 'numeral';
import { Pie, TagCloudCustom } from '@/components/Charts';
import moment from 'moment';
// import PageHeaderWrapper from '@/components/PageHeaderWrapper/';
import FilterBlock from '@/components/FilterBlock/Filter';
import styles from './Overview.less';
import Yuan from '@/utils/Yuan';
import DNSViewAll from './DNSViewAll';

const Desc = ({ value }) => (
  <div>
    <h4 style={{ color: '#fff' }}>场景描述</h4>
    <p>{value[0]}</p>
    <h4 style={{ color: '#fff' }}>使用方法</h4>
    <p>{value[1]}</p>
  </div>
);

@connect(({ global, dashboardDns, loading }) => ({
  dashboardDns,
  hasVpc: global.hasVpc,
  typeAnalyzeLoading: loading.effects['dashboardDns/fetchDnsTypeAnalyzeChartData'],
  errorAnalyzeLoading: loading.effects['dashboardDns/fetchDnsErrorAnalyzeChartData'],
  dnsServerLoading: loading.effects['dashboardDns/fetchDnsWhiteList'],
  dynamicDomainLoading: loading.effects['dashboardDns/fetchDomainWhiteList'],
}))
class DashboardDNS extends Component {
  constructor(props) {
    super(props);
    console.log('cpv', props.hasVpc);
    this.state = {
      query: {
        size: 5,
        startTime: moment().subtract(1, 'day').valueOf(),
        endTime: moment().valueOf(),
        search: '',
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
        name: '搜索',
        key: 'search',
        pressEnter: true,
        placeholder: props.hasVpc ? 'IP/域名/VPCID' : 'IP/域名',
      },
    ];

    this.dnsServerColumns = [
      { title: 'DNS服务器IP', dataIndex: 'key', key: 'key', width: 300 },
      // { title: 'IP归属地', dataIndex: 'location', key: 'location' },
      { title: '请求数', dataIndex: 'doc_count', key: 'doc_count', width: 200 },
      {
        title: '最近请求时间',
        dataIndex: 'time',
        key: 'time',
        width: 200,
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
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
    this.dynamicDomainColumns = [
      {
        title: '受影响资产',
        dataIndex: 'asset',
        key: 'asset',
        render: (text, record) => (text ? `${text} (${record.key})` : `${record.key}`),
      },
      { title: '请求域名', dataIndex: 'rrname', key: 'rrname' },
      { title: '请求数', dataIndex: 'doc_count', key: 'doc_count' },
      {
        title: '最近请求时间',
        dataIndex: 'time',
        key: 'time',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '域名IP',
        dataIndex: 'domainIp',
        key: 'domainIp',
        render: (text) => {
          const popContent = (
            <div>
              {text.map((ip) => (
                <p key={ip}>{ip}</p>
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
                  title="域名IP"
                >
                  <p>
                    多个( <span className="fontBlue"> {text.length} </span>)
                  </p>
                </Popover>
              ) : (
                <p> {text[0] ? text[0] : ''} </p>
              )}
            </div>
          );
        },
      },
    ];
    if (props.hasVpc) {
      this.dynamicDomainColumns.splice(1, 0, {
        title: 'VPCID',
        dataIndex: 'vpcid',
        key: 'vpcid',
        width: 120,
      });
    }
  }

  fetchGraphData = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    dispatch({ type: 'dashboardDns/fetchDnsTypeAnalyzeChartData', payload: query });
    dispatch({ type: 'dashboardDns/fetchDnsErrorAnalyzeChartData', payload: query });
    dispatch({ type: 'dashboardDns/fetchDnsWhiteList', payload: query });
    dispatch({ type: 'dashboardDns/fetchDomainWhiteList', payload: query });
  };

  componentDidMount = () => {
    this.fetchGraphData();
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

  submitFilter = () => {
    this.fetchGraphData();
  };

  showDetail = (type) => {
    this.setState({ showDetail: true, detailType: type });
  };

  showOverview = () => {
    this.setState({ showDetail: false, detailType: '' });
    this.fetchGraphData();
  };

  reactNodeCard1 = () => (
    <div>
      <span style={{ margin: '0px 5px 0px 0px' }}>DNS解析类型分析</span>
      <Tooltip
        placement="rightTop"
        title={
          <Desc
            value={[
              '不常用的解析类型能被恶意软件会使用进行控制指令的通信，如Xshell采用DNS TXT类型进行控制指令传输。分析网络流量中不常用的解析类型，有可能发现异常主机。',
              '关注请求数较低的解析类型，下钻到“检索”进行进一步分析，查看该解析类型是否来自于相同的IP请求。如果是，建议关注这些IP做进一步调查。',
            ]}
          />
        }
      >
        <QuestionCircleFilled className="fontBlue" />
      </Tooltip>
    </div>
  );

  reactNodeCard2 = () => (
    <div>
      <span style={{ margin: '0px 5px 0px 0px' }}>DNS解析错误类型分析</span>
      <Tooltip
        placement="rightTop"
        title={
          <Desc
            value={[
              '恶意的DNS解析经常会伴随大量的解析失败，如DGA域名会产生大量“不存在的域名（NXDOMAIN）”错误等。若网络中DNS解析错误数量大幅增加，或单一主机产生大量DNS解析错误，均有很大可能相关主机已失陷。',
              '关注错误类型，错误类型的请求数。如果数量较大，可以下钻到“检索”进行进一步分析，查看错误的解析失败是否来自于相同的IP请求。如果是，建议关注这些IP做进一步调查',
            ]}
          />
        }
      >
        <QuestionCircleFilled className="fontBlue" />
      </Tooltip>
    </div>
  );

  render() {
    const {
      dashboardDns: { dnsTypeChartList, dnsErrorChartList, dnsServerList, dnsDynamicDomainList },
      typeAnalyzeLoading,
      errorAnalyzeLoading,
      dnsServerLoading,
      dynamicDomainLoading,
    } = this.props;
    // console.log('dnsServer', dnsServerList);
    // console.log('data', dnsTypeChartList, dnsErrorChartList, dnsServerList, dnsDynamicDomainList);
    const { detailType, showDetail, query, timeRange } = this.state;
    return (
      <div>
        {showDetail ? (
          <DNSViewAll type={detailType} showOverview={this.showOverview} preQuery={query} />
        ) : null}
        {/* <PageHeaderWrapper> */}
        <div>
          {showDetail ? null : (
            <div>
              <div className="commonHeader">域名解析</div>
              {/* <div className={`filterBlock ${styles.filterwrap}`}> */}
              <div className="filterWrap">
                <FilterBlock
                  key={query}
                  filterList={this.filterList}
                  filterOnChange={this.filterOnChange}
                  submitFilter={this.submitFilter}
                  colNum={4}
                  query={query}
                  timeRange={timeRange}
                />
              </div>
              <div className={styles.contentWrap}>
                <Row gutter={20}>
                  <Col span={12}>
                    <div className={styles.tableBlock} style={{ paddingBottom: 0 }}>
                      <Card
                        loading={typeAnalyzeLoading}
                        className={styles.salesCard}
                        bordered={false}
                        title={this.reactNodeCard1()}
                        bodyStyle={{ padding: 24 }}
                        style={{ minHeight: 440 }}
                        extra={
                          <a
                            style={{ lineHeight: '35px' }}
                            onClick={() => {
                              this.showDetail('parseType');
                            }}
                          >
                            查看全部
                          </a>
                        }
                      >
                        <Pie
                          hasLegend
                          subTitle="事件数"
                          total={() => (
                            <Yuan>{dnsTypeChartList.reduce((pre, now) => now.y + pre, 0)}</Yuan>
                          )}
                          data={dnsTypeChartList}
                          valueFormat={(value) => numeral(value).format('0,0')}
                          height={248}
                          lineWidth={4}
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
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.tableBlock} style={{ paddingBottom: 0 }}>
                      <Card
                        loading={errorAnalyzeLoading}
                        className={styles.salesCard}
                        bordered={false}
                        title={this.reactNodeCard2()}
                        bodyStyle={{ padding: 24 }}
                        style={{ minHeight: 440 }}
                        extra={
                          <a
                            style={{ lineHeight: '35px' }}
                            onClick={() => {
                              this.showDetail('parseError');
                            }}
                          >
                            查看全部
                          </a>
                        }
                      >
                        <TagCloudCustom
                          data={dnsErrorChartList}
                          height={300}
                          tooltip="errorType*text*value*percent"
                          customScale={{
                            value: { alias: '请求数' },
                            percent: { alias: '占比' },
                            errorType: { alias: '错误类型' },
                            text: { alias: 'rcode' },
                          }}
                        />
                      </Card>
                    </div>
                  </Col>
                </Row>
                <div className={styles.overall} style={{ marginTop: 20 }}>
                  <p className={styles.blockTitle}>
                    <span style={{ marginRight: '5px' }}>DNS服务器解析</span>
                    <Tooltip
                      placement="rightTop"
                      title={
                        <Desc
                          value={[
                            '不常用的DNS服务器地址会被用于DNS隧道通信，例如Xshell会使用不常用的DNS服务器地址进行DNS解析。了解企业内哪些流量使用了不常用的DNS服务器地址，并将有助于判断恶意流量。',
                            '关注企业内请求数异常，且不再企业管理范围内的DNS服务器地址（通常是请求数较低的DNS服务器），下钻到“检索”进行进一步分析，查看该解析类型是否来自于相同的IP请求。如果是，建议关注这些IP做进一步调查。',
                          ]}
                        />
                      }
                    >
                      <QuestionCircleFilled className="fontBlue" />
                    </Tooltip>
                  </p>
                  <Table
                    loading={dnsServerLoading}
                    rowKey={(record) => record.index}
                    size="small"
                    dataSource={dnsServerList}
                    columns={this.dnsServerColumns}
                    pagination={false}
                  />
                  <div
                    className={styles.showMore}
                    style={dnsServerLoading ? { display: 'none' } : {}}
                  >
                    <Button
                      style={{ marginTop: 18 }}
                      onClick={() => {
                        this.showDetail('serverAnalysis');
                      }}
                    >
                      查看全部
                    </Button>
                  </div>
                </div>
                <div className={styles.overall} style={{ marginTop: 20 }}>
                  <p className={styles.blockTitle}>
                    <span style={{ marginRight: '5px' }}>动态域名流量分析</span>
                    <Tooltip
                      placement="rightTop"
                      title={
                        <Desc
                          value={[
                            '动态域名可以为黑客提供匿名的免费的DNS服务，很多恶意程序的远端控制服务（C&C）会使用动态域名，而正常情况下这类域名较少被使用（包含上百个动态域名），因此企业内的动态域名流量需要被额外关注。',
                            '确认是否有动态域名流量，如果有动态域名流量，建议针对该流量源主机做进一步调查。',
                          ]}
                        />
                      }
                    >
                      <QuestionCircleFilled className="fontBlue" />
                    </Tooltip>
                  </p>
                  <Table
                    loading={dynamicDomainLoading}
                    rowKey={(record) => record.index}
                    size="small"
                    dataSource={dnsDynamicDomainList}
                    columns={this.dynamicDomainColumns}
                    pagination={false}
                  />
                  <div
                    className={styles.showMore}
                    style={dynamicDomainLoading ? { display: 'none' } : {}}
                  >
                    <Button
                      style={{ marginTop: 18 }}
                      onClick={() => {
                        this.showDetail('dynamicDomain');
                      }}
                    >
                      查看全部
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* </PageHeaderWrapper> */}
      </div>
    );
  }
}
export default DashboardDNS;
