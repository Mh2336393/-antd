/* eslint-disable prefer-destructuring */
import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { DownSquareOutlined, LeftOutlined } from '@ant-design/icons';
import {
  Table,
  message,
  Modal,
  Progress,
  Popover,
  Divider,
  DatePicker,
  Input,
  Button,
} from 'antd';
import moment from 'moment';
import { Link } from 'umi';
// import FilterBlock from '@/components/FilterBlock';
import ButtonBlock from '@/components/ButtonBlock';
import configSettings from '../../configSettings';
import styles from './EmailViewAll.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

const { RangePicker } = DatePicker;

@connect(({ emailSafe, emailViewAll, loading }) => ({
  emailSafe,
  emailViewAll,
  loading: loading.effects['emailViewAll/fetchEmailList'],
}))
class EmailViewAll extends Component {
  constructor(props) {
    super(props);
    this.searchAuth = getAuth('/analysis/search');
    this.alertAuth = getAuth('/event/safeEvent/alarmAlert').indexOf('r') > -1;
    this.mailAuth = getAuth('/topic/email');
    this.state = {
      typeLabel: '来源国家统计',
      page: 1,
      limit: parseInt(configSettings.pageSizeOptions[0], 10),
      query: {
        size: 100,
        startTime: '',
        endTime: '',
        recipient: '', // 收件人
        sender: '', // 发件人
        searchContent: '', // 搜索条件
        sort: 'doc_count',
        dir: 'desc',
        whiteList: [],
      },
      whiteManageVisible: false, // 显示操作
      modalType: false, // 控制显示不一样的modal
      columns: [],
      whiteColumns: [],
      whiteList: [],
      btnList: [],
    };

    this.commonFstColumn = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          let actionStyle;
          const {
            emailViewAll: { emailList },
            type,
          } = this.props;
          if (type === 'sourceType' && this.searchAuth.indexOf('r') < 0) {
            return null;
          }
          if (
            (type === 'sendType' || type === 'reciveType' || type === 'fishType') &&
            this.searchAuth.indexOf('r') < 0 &&
            this.mailAuth !== 'rw'
          ) {
            return null;
          }
          const { showOperation, query } = this.state;
          const { key, originalIds = [] } = record;
          const { recipient, sender, searchContent } = query;
          let href;
          const conditionArr = [];
          if (recipient) {
            conditionArr.push(`email.to.address.keyword: *${recipient}*`);
          }
          if (sender) {
            conditionArr.push(`email.from.address.keyword: *${sender}*`);
          }
          if (searchContent) {
            conditionArr.push(`email.subject.keyword:*${searchContent}*`);
          }
          if (type === 'fishType') {
            href = conditionArr
              .concat([`email.url.keyword:"${key}" AND alert.gid:100005`])
              .join(' AND ');
          } else if (type === 'sendType') {
            const tmpKey = key.replace(/"/g, '\\"');
            href = conditionArr
              .filter((item) => item.indexOf('email.from') < 0)
              .concat([`email.from.address.keyword:"${tmpKey}"`])
              .join(' AND ');
          } else if (type === 'reciveType') {
            const tmpKey = key.replace(/"/g, '\\"');
            href = conditionArr
              .filter((item) => item.indexOf('email.to') < 0)
              .concat([`email.to.address.keyword:"${tmpKey}"`])
              .join(' AND ');
          } else if (type === 'sourceType') {
            href = conditionArr.concat([`src_ip_location.country.keyword:${key}`]).join(' AND ');
          } else if (type === 'falseType') {
            href = conditionArr.concat([`(_id: ${originalIds.join(' OR ')})`]).join(' AND ');
            href = href.replace(/\//g, '\\/'); // 特殊符号转义
            console.log('href===', href);
            href = stringToHex(href); // 转为16进制，去了检索页再转回来吧，+号 屈了检索页就变成空字符串了，可能是 框架底层 进行了俩次url解码.....
          }
          function stringToHex(str) {
            const arr = [];
            for (let i = 0; i < str.length; i++) {
              arr[i] = `00${str.charCodeAt(i).toString(16)}`.slice(-4);
            }
            return `\\u${arr.join('\\u')}`;
          }

          if (index < emailList.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }
          return (
            <div style={{ width: 20 }}>
              <div className={styles.tableAction}>
                <DownSquareOutlined
                  onClick={() => {
                    this.setOperation();
                  }}
                  style={{ color: '#5cbaea' }} />
                {showOperation && (
                  <div className={styles.actionContent} style={actionStyle}>
                    {this.searchAuth.indexOf('r') > -1 && (
                      <Fragment>
                        {type === 'fishType' && (
                          <div>
                            <div>
                              <Link
                                target="_blank"
                                to={`/analysis/search?startTime=${query.startTime}&endTime=${query.endTime}&type=dns&condition=dns.type.keyword:query AND dns.rrname.keyword:${key}`}
                              >
                                域名检索
                              </Link>
                            </div>
                            <div>
                              <Link
                                target="_blank"
                                to={`/analysis/search?startTime=${query.startTime}&endTime=${query.endTime}&type=alert&condition=${href}`}
                              >
                                邮件检索
                              </Link>
                            </div>
                          </div>
                        )}
                        {(type === 'sourceType' ||
                          type === 'sendType' ||
                          type === 'reciveType') && (
                          <Link
                            target="_blank"
                            to={`/analysis/search?startTime=${query.startTime}&endTime=${query.endTime}&type=dashboardEmail&condition=${href}`}
                          >
                            数据检索
                          </Link>
                        )}
                        {type === 'falseType' && (
                          <Link
                            target="_blank"
                            to={`/analysis/search?startTime=${query.startTime}&endTime=${query.endTime}&type=alert&isHex=true&condition=${href}`}
                          >
                            数据检索
                          </Link>
                        )}
                      </Fragment>
                    )}
                    {this.alertAuth && (type === 'fishType' || type === 'falseType') && (
                      <div>
                        <a onClick={() => this.toAlertLink(record)}>告警详情</a>
                      </div>
                    )}
                    {(type === 'sendType' ||
                      type === 'reciveType' ||
                      type === 'fishType' ||
                      type === 'falseType') &&
                      this.mailAuth === 'rw' && (
                        <div
                          onClick={() => {
                            // 将该记录添加到白名单
                            this.addToWhiteList(record);
                          }}
                        >
                          忽略该记录
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
    ];

    this.sourceTableColumns = [
      {
        title: '来源国家',
        dataIndex: 'key',
        key: 'key',
        width: 300,
      },
      {
        title: '邮件数',
        dataIndex: 'doc_count',
        key: 'doc_count',
        sorter: true,
        width: 200,
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
    this.sendDataColumns = [
      {
        title: '发件人',
        dataIndex: 'key',
        key: 'key',
        width: 300,
      },
      {
        title: '收件人',
        dataIndex: 'reciver',
        key: 'reciver',
        width: 400,
        render: (text) => this.popContent(text, '收件人'),
      },
      {
        title: '邮件数',
        dataIndex: 'doc_count',
        key: 'doc_count',
        sorter: true,
        width: 200,
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
        title: '发件人',
        dataIndex: 'sender',
        key: 'sender',
        width: 400,
        render: (text) => this.popContent(text, '发件人'),
      },
      {
        title: '邮件数',
        dataIndex: 'doc_count',
        key: 'doc_count',
        sorter: true,
        width: 200,
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
    this.fishEmailColumns = [
      {
        title: '邮件正文包含域名',
        dataIndex: 'key',
        key: 'key',
        width: 300,
      },
      // {
      //   title: '标签',
      //   dataIndex: 'tag',
      //   key: 'tag',
      //   width: 200,
      //   render: text => this.popContent(text, '标签'),
      // },
      {
        title: '邮件数',
        dataIndex: 'doc_count',
        key: 'doc_count',
        sorter: true,
        width: 200,
      },
      {
        title: '收件人',
        dataIndex: 'mailTo',
        key: 'mailTo',
        width: 200,
        render: (text) => this.popContent(text, '收件人'),
      },
      {
        title: '最近一次收件时间',
        dataIndex: 'time',
        key: 'time',
        sorter: true,
        width: 300,
        render: (text) => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '该域名请求次数',
        dataIndex: 'resCount',
        key: 'resCount',
        sorter: true,
        width: 200,
      },
    ];
    this.falseEmailColumns = [
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
        render: (text) => this.popContent(text, '发件人邮箱'),
      },
      {
        title: '收件人',
        dataIndex: 'mailTo',
        key: 'mailTo',
        // width: 200,
        render: (text) => this.popContent(text, '收件人'),
      },
      {
        title: '邮件主题',
        dataIndex: 'theme',
        key: 'theme',
        width: 300,
        render: (text) => this.popContent(text, '邮件主题'),
      },
      {
        title: '告警时间',
        dataIndex: 'time',
        key: 'time',
        width: 200,
        render: (text) => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
    ];
    this.whitelistColumns = [
      {
        title: '发件人',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '收件人',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '邮件正文包含域名',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '操作',
        dataIndex: '',
        key: 'action',
        render: (text, record) => (
          <a
            onClick={() => {
              this.whiteOpetation(record.email);
            }}
          >
            删除
          </a>
        ),
      },
    ];

    this.whitelistFalseMailColumns = [
      {
        title: '发件人IP',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '操作',
        dataIndex: '',
        key: 'action',
        render: (text, record) => (
          <a
            onClick={() => {
              this.whiteOpetation(record.email);
            }}
          >
            删除
          </a>
        ),
      },
    ];

    this.btnList = [
      {
        label: '白名单管理',
        hide: this.mailAuth !== 'rw',
        func: () => {
          this.whiteManage();
        },
      },
    ];
  }

  componentDidMount = () => {
    const {
      type,
      preQuery,
      emailSafe: { sendWhiteList, reciveWhiteList, fishWhiteList, falseWhiteList },
      dispatch,
    } = this.props;
    const { query } = this.state;
    const { whiteList: list, ...other } = query;
    const { startTime, endTime, recipient, sender, searchContent } = preQuery;
    let uri;
    let label;
    let finalQuery;
    let columns;
    let btnList = [];
    let whiteColumns = [];
    let whiteList = [];
    if (type === 'sourceType') {
      label = '来源国家统计';
      finalQuery = { ...other };
      finalQuery.dir = 'asc';
      uri = 'topic/getSourceCountry';
      columns = this.commonFstColumn.concat(this.sourceTableColumns);
    } else if (type === 'sendType') {
      label = '发件人统计';
      finalQuery = Object.assign(query, { whiteList: sendWhiteList });
      uri = 'topic/getSendData';
      columns = this.commonFstColumn.concat(this.sendDataColumns);
      btnList = this.btnList;
      whiteList = sendWhiteList;
      whiteColumns = [this.whitelistColumns[0], this.whitelistColumns[3]];
    } else if (type === 'reciveType') {
      label = '收件人统计';
      finalQuery = Object.assign(query, { whiteList: reciveWhiteList });
      uri = 'topic/getReciveData';
      btnList = this.btnList;
      whiteList = reciveWhiteList;
      columns = this.commonFstColumn.concat(this.reciveDataColumns);
      whiteColumns = [this.whitelistColumns[1], this.whitelistColumns[3]];
    } else if (type === 'fishType') {
      label = '钓鱼邮件';
      finalQuery = Object.assign(query, { whiteList: fishWhiteList });
      uri = 'topic/getFishMailData';
      btnList = this.btnList;
      whiteList = fishWhiteList;
      columns = this.commonFstColumn.concat(this.fishEmailColumns);
      whiteColumns = this.whitelistColumns.slice(2);
    } else if (type === 'falseType') {
      label = '邮件伪造';
      finalQuery = Object.assign(query, { whiteList: falseWhiteList });
      uri = 'topic/getFalseMailList';
      btnList = this.btnList;
      whiteList = falseWhiteList;
      columns = this.commonFstColumn.concat(this.falseEmailColumns);
      // whiteColumns = this.whitelistColumns.slice(2);
      whiteColumns = this.whitelistFalseMailColumns;
    }
    finalQuery = Object.assign(finalQuery, {
      startTime,
      endTime,
      recipient,
      sender,
      searchContent,
    });
    const newQuery = Object.assign(query, { ...finalQuery });
    console.log('newQuery', newQuery);
    this.setState({ query: newQuery, typeLabel: label, whiteList, btnList, columns, whiteColumns });
    dispatch({
      type: 'emailViewAll/fetchEmailList',
      payload: { uri, body: finalQuery },
    });
  };

  // componentWillReceiveProps = nextProps => {
  //   const {
  //     type,
  //     emailSafe: { sendWhiteList, reciveWhiteList, fishWhiteList },
  //     dispatch,
  //   } = nextProps;
  //   const { emailSafe: preData } = this.props;
  //   const { query } = this.state;
  //   if (
  //     (type === 'sendType' && sendWhiteList !== preData.sendWhiteList) ||
  //     (type === 'reciveType' && reciveWhiteList !== preData.reciveWhiteList) ||
  //     (type === 'fishType' && fishWhiteList !== preData.fishWhiteList)
  //   ) {
  //     console.log('fishWhiteList', fishWhiteList, ' pre fishWhiteList', preData.fishWhiteList);
  //     let uri;
  //     let whiteList;
  //     if (type === 'sendType') {
  //       uri = 'topic/getSendData';
  //       whiteList = sendWhiteList;
  //     } else if (type === 'reciveType') {
  //       uri = 'topic/getReciveData';
  //       whiteList = reciveWhiteList;
  //     } else {
  //       uri = 'topic/getFishMailData';
  //       whiteList = fishWhiteList;
  //     }
  //     const emailQuery = Object.assign(query, { whiteList });
  //     this.setState({ query: emailQuery });
  //     dispatch({
  //       type: 'emailViewAll/fetchEmailList',
  //       payload: { uri, body: emailQuery },
  //     });
  //   }
  // };

  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }

  popContent = (text, title) => {
    if (!text) return '';
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
            title={title}
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
  };

  toAlertLink = (record) => {
    const { originalIds = [] } = record;
    if (originalIds.length) {
      const { dispatch } = this.props;
      dispatch({
        type: 'emailSafe/fetchEventId',
        payload: { originalIds },
      })
        .then((json) => {
          // console.log('hson==',json);
          const { data: jsonData } = json;
          if (jsonData.id) {
            const { id = '', category_1: category, tsLatest = 0, tsOldest = 0 } = jsonData;
            const linkpath = configSettings.getEventDetailRoute(category);
            // console.log('category_1==', category);
            const linkHref = `${linkpath}?id=${encodeURIComponent(
              id
            )}&tsOldest=${tsOldest}&tsLatest=${tsLatest}`;
            window.open(linkHref);
          }
        })
        .catch((error) => {
          console.log('fetchEventId_error==', error);
          message.error('数据获取失败');
        });
    }
    // console.log(2134, record);
  };

  // 将记录添加到白名单
  addToWhiteList = (record) => {
    const { type, dispatch } = this.props;
    const { query } = this.state;
    let queryType = '';
    let uri;
    let succTip = '已将该邮箱添加到白名单，记录将不再显示';
    // console.log('type', type);
    if (type === 'sendType') {
      queryType = 'email_sender';
      uri = 'topic/getSendData';
    } else if (type === 'reciveType') {
      queryType = 'email_reciver';
      uri = 'topic/getReciveData';
    } else if (type === 'fishType') {
      queryType = 'email_domain';
      uri = 'topic/getFishMailData';
    } else if (type === 'falseType') {
      queryType = 'email_srcIp';
      uri = 'topic/getFalseMailList';
      succTip = '已将该发件人IP添加到白名单，记录将不再显示';
    }
    const value = record.key;
    dispatch({
      type: 'emailViewAll/addToWhiteList',
      payload: { email: value, type: queryType },
    })
      .then((addRes) => {
        if (addRes.length) {
          // addRes.insertId
          dispatch({
            type: 'emailViewAll/fetchWhiteList',
            payload: { type: queryType },
          })
            .then((res) => {
              console.log('add', res);
              query.whiteList = res.map((item) => item.email);
              message.success(succTip);
              dispatch({
                type: 'emailViewAll/fetchEmailList',
                payload: { uri, body: query },
              });
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  };

  whiteOpetation = (queryemail) => {
    console.log('删除');
    const { type, dispatch } = this.props;
    const { whiteList, query } = this.state;
    let deleteType = '';
    let uri;
    if (type === 'sendType') {
      deleteType = 'email_sender';
      uri = 'topic/getSendData';
    } else if (type === 'reciveType') {
      deleteType = 'email_reciver';
      uri = 'topic/getReciveData';
    } else if (type === 'fishType') {
      deleteType = 'email_domain';
      uri = 'topic/getFishMailData';
    } else if (type === 'falseType') {
      deleteType = 'email_srcIp';
      uri = 'topic/getFalseMailList';
    }
    dispatch({
      type: 'emailViewAll/deleteWhiteList',
      payload: { email: queryemail, type: deleteType },
    })
      .then((res) => {
        if (res.error_code === 0) {
          const deleteList = whiteList.filter((item) => item !== queryemail);
          const queryList = query.whiteList.filter((item) => item !== queryemail);
          query.whiteList = queryList;
          this.setState({ whiteList: deleteList });
          // message.success('已将邮箱从白名单删除');
          message.success('已将数据从白名单删除');
          dispatch({
            type: 'emailViewAll/fetchEmailList',
            payload: { uri, body: query },
          });
        }
      })
      .catch(() => {});
  };

  fetchEmailList = (query, callback) => {
    const { type, dispatch } = this.props;
    const { whiteList, ...other } = query;
    let uri;
    let finalQuery;
    if (type === 'sourceType') {
      finalQuery = { ...other };
      uri = 'topic/getSourceCountry';
    } else if (type === 'sendType') {
      finalQuery = query;
      uri = 'topic/getSendData';
    } else if (type === 'reciveType') {
      finalQuery = query;
      uri = 'topic/getReciveData';
    } else {
      finalQuery = query;
      uri = 'topic/getFishMailData';
    }
    dispatch({
      type: 'emailViewAll/fetchEmailList',
      payload: { uri, body: finalQuery },
    }).then(() => {
      if (callback) {
        callback();
      }
    });
  };

  timePickerChange = (momentArr) => {
    const { query } = this.state;
    const newQuery = Object.assign(query, {
      startTime: momentArr[0].valueOf(),
      endTime: momentArr[1].valueOf(),
    });
    this.setState({ query: newQuery });
  };

  ontimePiker = () => {
    const { query } = this.state;
    this.fetchEmailList(query);
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query, page, limit } = this.state;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== page || pageSize !== limit) {
      this.setState({ page: current, limit: pageSize });
    } else {
      const { field, order } = sorter;
      if (field === 'doc_count' || field === 'time' || field === 'resCount') {
        const dir = order === 'descend' ? 'desc' : 'asc';
        newQuery = Object.assign({}, query, {
          dir,
          sort: field,
        });
        // // 根据type调用不同接口
        this.fetchEmailList(newQuery, () => {
          this.setState({ page: 1 });
        });
      }
    }
  };

  paginationChange = (page, pageSize) => {
    this.setState({ page, limit: pageSize });
  };

  showOverview = () => {
    const { showOverview, dispatch } = this.props;
    dispatch({ type: 'emailViewAll/clearEmailList' });
    showOverview();
  };

  whiteManage = () => {
    const { type, dispatch } = this.props;
    let queryType = '';
    // const { whiteList } = this.state;
    if (type === 'sendType') {
      queryType = 'email_sender';
    } else if (type === 'reciveType') {
      queryType = 'email_reciver';
    } else if (type === 'fishType') {
      queryType = 'email_domain';
    } else if (type === 'falseType') {
      queryType = 'email_srcIp';
    }
    dispatch({
      type: 'emailViewAll/fetchWhiteList',
      payload: { type: queryType },
    })
      .then((res) => {
        const emails = res.map((item) => item.email);
        console.log('white', emails);
        this.setState({ whiteList: emails });
      })
      .catch(() => {});
    this.setState({ whiteManageVisible: true, modalType: true });
  };

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ value });
  };

  searchEmail = (value, type) => {
    // console.log('value', value);
    // console.log('type', type);
    const { dispatch } = this.props;
    let queryType = '';
    if (type === '发件人统计') {
      queryType = 'email_sender';
    } else if (type === '收件人统计') {
      queryType = 'email_reciver';
    } else if (type === '钓鱼邮件') {
      queryType = 'email_domain';
    } else if (type === '邮件伪造') {
      queryType = 'email_srcIp';
    }
    dispatch({
      type: 'emailViewAll/searchWhiteList',
      payload: { email: value, type: queryType },
    })
      .then((res) => {
        const emails = res.map((item) => item.value);
        this.setState({ whiteList: emails });
      })
      .catch((error) => {
        message.error(error.msg);
      });
  };

  render() {
    const {
      typeLabel,
      query,
      currentHoverRow,
      whiteManageVisible,
      modalType,
      page,
      limit,
      whiteList,
      btnList,
      columns,
      whiteColumns,
      value,
    } = this.state;
    const { startTime, endTime } = query;
    const {
      type,
      emailViewAll: { emailList },
      loading,
    } = this.props;
    console.log('type', type);
    const newWhiteList = whiteList.map((email) => ({ email }));
    return (
      <div className={styles.TableTdPaddingWrap}>
        <div className={styles.emailHeader}>
          <span onClick={this.showOverview}>
            <LeftOutlined />
            &nbsp; 返回
          </span>
          <Divider type="vertical" />
          <span>{typeLabel}</span>
        </div>
        <div className={styles.timeRangePicker}>
          <span className={styles.timeRangeLabel}>时间范围：</span>
          <RangePicker
            disabledDate={(current) => current > moment().endOf('day')}
            popupClassName={styles['timeRange-picker']}
            allowClear={false}
            defaultValue={[moment(startTime), moment(endTime)]}
            value={[moment(startTime), moment(endTime)]}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            format="YYYY-MM-DD HH:mm:ss"
            onChange={this.timePickerChange}
            onOk={this.ontimePiker}
            onOpenChange={(status) => {
              if (!status) {
                this.ontimePiker();
              }
            }}
          />
        </div>
        <div className={styles.tableWrapper}>
          <ButtonBlock
            btnList={btnList}
            total={emailList.length}
            onPageChange={this.paginationChange}
            bpage={page}
          />
          <Table
            // rowKey={type === 'dynamicDomain' ? 'id' : 'key'}
            rowKey="key"
            loading={loading}
            columns={columns}
            dataSource={emailList}
            pagination={{
              pageSize: limit,
              current: page,
              total: emailList.length,
            }}
            onChange={this.handleTableChange}
            rowClassName={(record, index) => (index === currentHoverRow ? styles.handleAction : '')}
            onRow={(record, index) => ({
              onMouseEnter: () => {
                this.setState({ currentHoverRow: index });
              },
              onMouseLeave: () => {
                this.setState({ currentHoverRow: '', showOperation: false });
              },
            })}
          />
        </div>
        {modalType && (
          <Modal
            title="白名单"
            visible={whiteManageVisible}
            footer={null}
            onCancel={() => {
              this.setState({ whiteManageVisible: false, value: '' });
            }}
          >
            <div>
              <div>
                <span>搜索:</span>
                <Input
                  // placeholder={type === 'fishType' ? '请输入完整域名' : '请输入完整邮箱'}
                  placeholder="请输入搜索内容"
                  value={value}
                  onChange={this.handleChange}
                  style={{ width: '200px', margin: '0px 10px 0px 10px' }}
                  size="small"
                  onPressEnter={() => {
                    this.searchEmail(value, typeLabel);
                  }}
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    this.searchEmail(value, typeLabel);
                  }}
                >
                  搜索
                </Button>
              </div>
            </div>
            <Table
              rowKey="ip"
              columns={whiteColumns}
              dataSource={newWhiteList}
              pagination={false}
            />
          </Modal>
        )}
      </div>
    );
  }
}

export default EmailViewAll;
