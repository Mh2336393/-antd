/*
 * @Author: finazhang
 * @Date: 2018-10-24 21:09:21
 * @Last Modified by: finazhang
 * @Last Modified time: 2018-12-29 12:17:22
 * 失陷关联指标页面
 */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/jsx-closing-tag-location */
import React, { Component, Fragment } from 'react';
import { Table, Tabs, Spin, Tooltip, Popover } from 'antd';
// import { Link } from 'umi';
import { connect } from 'umi';
import moment from 'moment';
import configSettings from '../../../configSettings';
import styles from './AlertRelevanceInfo.less';
// import moment = require('moment');

const { TabPane } = Tabs;
const ipUrl = configSettings.urlKey('ip');
const md5Url = configSettings.urlKey('md5');
const domainUrl = configSettings.urlKey('domain');

@connect(({ iocDetail }) => ({
  iocDetail,
}))
class AlertRelevanceInfo extends Component {
  constructor(props) {
    super(props);
    this.resolution_ip_cloumns = [
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
        render: (text) => (
          <Popover content={this.ipPopContent(text, ipUrl)} placement="bottomLeft">
            <span>{text}</span>
          </Popover>
        ),
        // {
        //   const tagMoreLink = `https://eti.qq.com/query/ip/${text}`;
        //   return (
        //     <a href={tagMoreLink} target="_blank">
        //       {text}
        //     </a>
        //   );
        // },
      },
      {
        title: '检测时间',
        dataIndex: 'end_time',
        key: 'end_time',
      },
    ];
    this.black_md5_visit_domain_cloumns = [
      {
        title: 'MD5',
        dataIndex: 'md5',
        key: 'md5',
        render: (text) => (
          <Popover content={this.md5PopContent(text, md5Url)} placement="bottomLeft">
            <span>{text}</span>
          </Popover>
        ),
        // {
        //   const tagMoreLink = `https://eti.qq.com/query/md5/${text}`;
        //   // const popContent = <div>md5Url.map(item)</div>;
        //   return (
        //     <Popover content={this.md5PopContent(text, md5Url)} placement="bottomLeft">
        //       <span>{text}</span>
        //     </Popover>
        //     // <a href={tagMoreLink} target="_blank">
        //     //   {text}
        //     // </a>
        //   );
        // },
      },
      {
        title: '检测时间',
        dataIndex: 'end_time',
        key: 'end_time',
      },
    ];
    this.black_md5_download_from_domain_cloumns = [
      {
        title: 'URL',
        dataIndex: 'url',
        key: 'url',
      },
      {
        title: 'MD5',
        dataIndex: 'md5',
        key: 'md5',
        render: (text) => (
          <Popover content={this.md5PopContent(text, md5Url)} placement="bottomLeft">
            <span>{text}</span>
          </Popover>
        ),
        // {
        //   const tagMoreLink = `https://eti.qq.com/query/md5/${text}`;
        //   return (
        //     <a href={tagMoreLink} target="_blank">
        //       {text}
        //     </a>
        //   );
        // },
      },
      {
        title: '检测时间',
        dataIndex: 'end_time',
        key: 'end_time',
      },
    ];
    this.black_url_of_domain_cloumns = [
      {
        title: 'URL',
        dataIndex: 'url',
        key: 'url',
      },
      {
        title: '检测时间',
        dataIndex: 'end_time',
        key: 'end_time',
      },
    ];
    this.threat_info_cloumns = [
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: '链接',
        dataIndex: 'url',
        key: 'url',
      },
      // {
      //   title: '描述',
      //   dataIndex: 'desc',
      //   key: 'desc',
      // },
      {
        title: '时间',
        dataIndex: 'time',
        key: 'time',
      },
    ];
    this.historical_domain_columns = [
      {
        title: '域名',
        dataIndex: 'domain',
        key: 'domain',
        render: (text) => (
          <Popover content={this.domainPopContent(text, domainUrl)} placement="bottomLeft">
            <span>{text}</span>
          </Popover>
        ),
        // {
        //   const tagMoreLink = `https://eti.qq.com/query/domain/${text}`;
        //   return (
        //     <a href={tagMoreLink} target="_blank">
        //       {text}
        //     </a>
        //   );
        // },
      },
      {
        title: '检测时间',
        dataIndex: 'end_time',
        key: 'end_time',
      },
    ];
  }

  ipPopContent = (ip, urls) => (
    <div>
      {urls.map((item) => (
        <p>
          <a href={`${item.url}/${ip}`} target="_blank">
            {item.name}
          </a>
        </p>
      ))}
    </div>
  );

  md5PopContent = (md5, urls) => (
    <div>
      {urls.map((item) => (
        <p>
          <a href={`${item.url}/${md5}`} target="_blank">
            {item.name}
          </a>
        </p>
      ))}
    </div>
  );

  domainPopContent = (domain, urls) => (
    <div>
      {urls.map((item) => (
        <p>
          <a href={`${item.url}/${domain}`} target="_blank">
            {item.name}
          </a>
        </p>
      ))}
    </div>
  );

  renderTabPane = () => {
    const { eventDetail } = this.props;
    const { ioc_context } = eventDetail;
    // console.log('ioc_context', ioc_context);
    const tagMoreLink = `https://eti.qq.com/query/${eventDetail.iocType}/${eventDetail.ioc_plaintext}`;
    // domain
    let resolution_ip = [];
    let black_md5_visit_domain = [];
    let black_md5_contain_domain = [];
    let black_md5_download_from_domain = [];
    let black_url_of_domain = [];
    // ip
    let historical_domain = [];
    let black_md5_visit_ip = [];
    let black_md5_contain_ip = [];
    let black_md5_download_from_ip = [];
    let black_url_of_ip = [];
    let threat_info = [];
    if (ioc_context) {
      resolution_ip = ioc_context.resolution_ip || [];
      black_md5_visit_domain = ioc_context.black_md5_visit_domain || [];
      black_md5_contain_domain = ioc_context.black_md5_contain_domain || [];
      black_md5_download_from_domain = ioc_context.black_md5_download_from_domain || [];
      black_url_of_domain = ioc_context.black_url_of_domain || [];
      // ip
      historical_domain = ioc_context.historical_domain || [];
      black_md5_visit_ip = ioc_context.black_md5_visit_ip || [];
      black_md5_contain_ip = ioc_context.black_md5_contain_ip || [];
      black_md5_download_from_ip = ioc_context.black_md5_download_from_ip || [];
      black_url_of_ip = ioc_context.black_url_of_ip || [];
      threat_info = ioc_context.threat_info || [];
    }
    if (eventDetail.iocType === 'domain') {
      return (
        <Tabs defaultActiveKey="1">
          <TabPane tab="域名历史解析IP" key="1">
            <Table
              columns={this.resolution_ip_cloumns}
              dataSource={resolution_ip}
              pagination={false}
            />
            {resolution_ip.length !== 0 && (
              <div className={styles.moreDiv}>
                <a href={tagMoreLink} target="_blank">
                  查看完整列表
                </a>
              </div>
            )}
          </TabPane>
          <TabPane tab="访问该domain样本" key="2">
            <Table
              rowKey="md5"
              columns={this.black_md5_visit_domain_cloumns}
              dataSource={black_md5_visit_domain}
              pagination={false}
            />
            {black_md5_visit_domain.length !== 0 && (
              <div className={styles.moreDiv}>
                <a href={tagMoreLink} target="_blank">
                  查看完整列表
                </a>
              </div>
            )}
          </TabPane>
          <TabPane tab="包含该domain样本" key="3">
            <Table
              rowKey="md5"
              columns={this.black_md5_visit_domain_cloumns}
              dataSource={black_md5_contain_domain}
              pagination={false}
            />
            {black_md5_contain_domain.length !== 0 && (
              <div className={styles.moreDiv}>
                <a href={tagMoreLink} target="_blank">
                  查看完整列表
                </a>
              </div>
            )}
          </TabPane>
          <TabPane tab="domain下的可疑样本" key="4">
            <Table
              rowKey="md5"
              columns={this.black_md5_download_from_domain_cloumns}
              dataSource={black_md5_download_from_domain}
              pagination={false}
            />
            {black_md5_download_from_domain.length !== 0 && (
              <div className={styles.moreDiv}>
                <a href={tagMoreLink} target="_blank">
                  查看完整列表
                </a>
              </div>
            )}
          </TabPane>
          <TabPane tab="domain下的可疑URL" key="5">
            <Table
              rowKey="url"
              columns={this.black_url_of_domain_cloumns}
              dataSource={black_url_of_domain}
              pagination={false}
            />
            {black_url_of_domain.length !== 0 && (
              <div className={styles.moreDiv}>
                <a href={tagMoreLink} target="_blank">
                  查看完整列表
                </a>
              </div>
            )}
          </TabPane>
          <TabPane tab="威胁情报对应文章" key="6">
            <Table columns={this.threat_info_cloumns} dataSource={threat_info} pagination={false} />
            {threat_info.length !== 0 && (
              <div className={styles.moreDiv}>
                <a href={tagMoreLink} target="_blank">
                  查看完整列表
                </a>
              </div>
            )}
          </TabPane>
        </Tabs>
      );
    }
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="IP历史域名" key="1">
          <Table
            columns={this.historical_domain_columns}
            dataSource={historical_domain}
            pagination={false}
          />
          {historical_domain && historical_domain.length !== 0 && (
            <div className={styles.moreDiv}>
              <a href={tagMoreLink} target="_blank">
                查看完整列表
              </a>
            </div>
          )}
        </TabPane>
        <TabPane tab="访问该IP样本" key="2">
          <Table
            rowKey="md5"
            columns={this.black_md5_visit_domain_cloumns}
            dataSource={black_md5_visit_ip}
            pagination={false}
          />
          {black_md5_visit_ip.length !== 0 && (
            <div className={styles.moreDiv}>
              <a href={tagMoreLink} target="_blank">
                查看完整列表
              </a>
            </div>
          )}
        </TabPane>
        <TabPane tab="包含该IP样本" key="3">
          <Table
            rowKey="md5"
            columns={this.black_md5_visit_domain_cloumns}
            dataSource={black_md5_contain_ip}
            pagination={false}
          />
          {black_md5_contain_ip.length !== 0 && (
            <div className={styles.moreDiv}>
              <a href={tagMoreLink} target="_blank">
                查看完整列表
              </a>
            </div>
          )}
        </TabPane>
        <TabPane tab="IP下的可疑样本" key="4">
          <Table
            rowKey="md5"
            columns={this.black_md5_download_from_domain_cloumns}
            dataSource={black_md5_download_from_ip}
            pagination={false}
          />
          {black_md5_download_from_ip.length !== 0 && (
            <div className={styles.moreDiv}>
              <a href={tagMoreLink} target="_blank">
                查看完整列表
              </a>
            </div>
          )}
        </TabPane>
        <TabPane tab="IP下的可疑URL" key="5">
          <Table
            rowKey="url"
            columns={this.black_url_of_domain_cloumns}
            dataSource={black_url_of_ip}
            pagination={false}
          />
          {black_url_of_ip.length !== 0 && (
            <div className={styles.moreDiv}>
              <a href={tagMoreLink} target="_blank">
                查看完整列表
              </a>
            </div>
          )}
        </TabPane>
        <TabPane tab="威胁情报对应文章" key="6">
          <Table columns={this.threat_info_cloumns} dataSource={threat_info} pagination={false} />
          {threat_info.length !== 0 && (
            <div className={styles.moreDiv}>
              <a href={tagMoreLink} target="_blank">
                查看完整列表
              </a>
            </div>
          )}
        </TabPane>
      </Tabs>
    );
  };

  render() {
    const {
      loading,
      eventDetail,
      iocDetail: { tagsDesc },
    } = this.props;
    console.log('eventDetail', eventDetail.iocTags, eventDetail.iocLevel1Tags);
    let domainRegistrar = '暂无';
    let domainOrganization = '暂无';
    let domainCreatedate = '暂无';
    let ipLocation = '暂无';
    if (eventDetail.ioc_basic_info) {
      domainRegistrar = eventDetail.ioc_basic_info.registrar
        ? eventDetail.ioc_basic_info.registrar
        : '暂无';
      domainOrganization = eventDetail.ioc_basic_info.organization
        ? eventDetail.ioc_basic_info.organization
        : '暂无';
      domainCreatedate = eventDetail.ioc_basic_info.create_date
        ? moment(eventDetail.ioc_basic_info.create_date).format('YYYY-MM-DD HH:mm:ss')
        : '暂无';
      ipLocation = eventDetail.ioc_basic_info.location
        ? eventDetail.ioc_basic_info.location
        : '暂无';
    }
    // console.log("eventDetail==", eventDetail, "domainRegistrar", domainRegistrar, "domainOrganization", domainOrganization, "domainCreatedate", domainCreatedate);
    if (loading) {
      return (
        <div>
          <Spin />
        </div>
      );
    }
    return (
      <div>
        <div className={styles.infoBlock}>
          {eventDetail.iocType === 'domain' ? (
            <div>
              <p>
                <span className={styles.name}>域名：</span>
                <span>{eventDetail.ioc_plaintext}</span>
              </p>
              {domainCreatedate && (
                <p>
                  <span className={styles.name}>创建时间：</span>
                  <span>{domainCreatedate}</span>
                </p>
              )}
              {domainRegistrar && (
                <p>
                  <span className={styles.name}>注册者：</span>
                  <span>{domainRegistrar}</span>
                </p>
              )}
              {domainOrganization && (
                <p>
                  <span className={styles.name}>注册机构：</span>
                  <span>{domainOrganization}</span>
                </p>
              )}
              <p className={styles.name} style={{ display: 'flex', width: '100%' }}>
                <span className={styles.name} style={{ lineHeight: '27px' }}>
                  标签：
                </span>
                <div>
                  {Array.isArray(eventDetail.iocTags) &&
                    eventDetail.iocTags.map((tag) => {
                      if (tagsDesc[tag]) {
                        const tagMoreLink = `https://eti.qq.com/query/family/${tag}`;
                        const content = (
                          <div className={styles.popoverCxt}>
                            <p>{tagsDesc[tag]}</p>
                            <p style={{ textAlign: 'right' }}>
                              <a href={tagMoreLink} target="_blank">
                                更多信息
                              </a>
                            </p>
                          </div>
                        );
                        return (
                          <Tooltip title={content} trigger="hover" placement="bottomLeft">
                            <span className={styles.iocTagLink}>{tag}</span>
                          </Tooltip>
                        );
                      }
                      return (
                        <Fragment>
                          {tag ? <span className={styles.iocTag}>{tag}</span> : ''}
                        </Fragment>
                      );
                    })}
                </div>
              </p>
            </div>
          ) : (
            <div>
              <p>
                <span className={styles.name}>IP：</span>
                <span>{eventDetail.ioc_plaintext}</span>
              </p>
              <p>
                <span className={styles.name}>地理位置：</span>
                <span>{ipLocation}</span>
              </p>
              <p className={styles.name} style={{ display: 'flex', width: '100%' }}>
                <span style={{ lineHeight: '27px' }}>标签：</span>
                <div>
                  {Array.isArray(eventDetail.iocTags) &&
                    eventDetail.iocTags.map((tag) => {
                      if (tagsDesc[tag]) {
                        const tagMoreLink = `https://eti.qq.com/query/family/${tag}`;
                        const content = (
                          <div className={styles.popoverCxt}>
                            <p>{tagsDesc[tag]}</p>
                            <p style={{ textAlign: 'right' }}>
                              <a href={tagMoreLink} target="_blank">
                                更多信息
                              </a>
                            </p>
                          </div>
                        );
                        return (
                          <Tooltip title={content} trigger="hover" placement="bottomLeft">
                            <span className={styles.iocTagLink}>{tag}</span>
                          </Tooltip>
                        );
                      }
                      return (
                        <Fragment>
                          {tag ? <span className={styles.iocTag}>{tag}</span> : ''}
                        </Fragment>
                      );
                    })}
                </div>
              </p>
            </div>
          )}
        </div>
        <div className={styles.infoBlock}>{this.renderTabPane()}</div>
      </div>
    );
  }
}

export default AlertRelevanceInfo;
