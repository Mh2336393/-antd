import React, { PureComponent } from 'react';
import { FileTextOutlined } from '@ant-design/icons';
import { Spin, Menu, Dropdown, Modal, message, Row, Col } from 'antd';
import moment from 'moment';
import { Link } from 'umi';
import Cookies from 'js-cookie';
import { connect } from 'umi';
import NoticeIcon from '../NoticeIcon';
import styles from './index.less';
import eventAvator from '../../assets/image/event_icon.png';
import settingAvator from '../../assets/image/setting_icon.png';
import reportAvator from '../../assets/image/report_icon.png';

/* eslint-disable camelcase */

@connect(({ msgNotify, global, messageCenter, loading }) => ({
  messageCenter,
  msgNotify,
  global,
  authMap: global.authMap,
  msgLoading: loading.effects['msgNotify/fetchMsgList'],
}))
class GlobalHeaderRight extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      drawerObj: {},
    };
  }

  componentDidMount() {
    const {
      dispatch,
      authMap,
      msgLoading,
      // login: { currentUser },
    } = this.props;
    // const role = Cookies.get('role');
    const showTce = Cookies.get('showTce');

    // tce环境 铃铛消息请求移除
    if (authMap['/systemSetting/msg/messageCenter'] && msgLoading !== true && showTce !== '1') {
      dispatch({ type: 'msgNotify/fetchMsgList' });
    }
  }

  versionOnClick = () => {
    window.location.href = '/systemSetting/version';
  };

  msgLinkClick = (link, record, e) => {
    e.preventDefault();
    const { dispatch } = this.props;
    const { message_type, sub_type, detail, content, is_read, msg_id } = record;
    try {
      if (message_type === 'sec' || (sub_type === 'new_report' && content === '有新的报表生成')) {
        const info = JSON.parse(detail);
        const { eventid } = info;
        let secLink = '';
        if (sub_type === 'new_report') {
          const timeStart = moment(info.generate_time)
            .subtract(1, 'seconds')
            .format('YYYY-MM-DD HH:mm:ss');
          const timeStop = moment(info.generate_time)
            .add(1, 'seconds')
            .format('YYYY-MM-DD HH:mm:ss');
          secLink = `/reports/lists?startTime=${timeStart}&endTime=${timeStop}`;
        }
        if (message_type === 'sec') {
          const timeStart = moment(info.time).subtract(1, 'seconds').valueOf();
          const timeStop = moment(info.time).add(1, 'seconds').valueOf();
          let scoreParam = `score=${encodeURIComponent('["信息","低危", "中危", "高危"]')}`;
          if (sub_type === 'urgent_sec_event') {
            scoreParam = 'score=严重';
          }
          secLink = `/event/safeEvent/alarm?${scoreParam}&startTime=${timeStart}&endTime=${timeStop}&eventid=${eventid}`; // &sort=score&dir=desc
        }
        window.location.href = secLink;
        // 消息变已读
        if (!is_read) {
          dispatch({
            type: 'messageCenter/stausHandleEvent',
            payload: { ids: [msg_id], status: 'MarkedRead' },
          });
        }
      } else {
        const reqObj = { message_type, sub_type, content };
        dispatch({ type: 'messageCenter/fetchMsgDetail', payload: reqObj })
          .then((json) => {
            const { data = {} } = json;
            if (data.sub_type) {
              const { detail_translation, ...other } = data;
              const drawerObj = { ...other };
              drawerObj.detail = JSON.parse(detail);
              drawerObj.translation = JSON.parse(detail_translation);
              this.setState({ drawerVisible: true, drawerObj });
              // 消息变已读
              if (!is_read) {
                dispatch({
                  type: 'messageCenter/stausHandleEvent',
                  payload: { ids: [msg_id], status: 'MarkedRead' },
                });
              }
            } else {
              message.error('消息详情获取失败');
            }
          })
          .catch((error) => {
            console.log('消息详情获取失败error==', error);
            message.error('消息详情获取失败');
          });
      }
    } catch (err) {
      console.log('获取消息详情2 err==', err);
    }
  };

  msgModalCancel = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'msgNotify/fetchMsgList' });
    dispatch({ type: 'global/fetchAlarmMessages' });
    this.setState({ drawerVisible: false, drawerObj: {} });
  };

  msgShowListData = (noticeData) => {
    const showListDate = [];
    for (let j = 0; j < noticeData.length; j += 1) {
      if (j < 99) {
        showListDate.push(noticeData[j]);
        let imgSrc = reportAvator;
        if (noticeData[j].message_type === 'sec') {
          imgSrc = eventAvator;
        }
        if (noticeData[j].message_type === 'sys') {
          imgSrc = settingAvator;
        }
        const mmDD = moment(noticeData[j].create_time).format('MM-DD');
        showListDate[j].listItemTitle = (
          <div style={{ position: 'relative' }}>
            <div className={styles.msgDiv} title={`${mmDD} ${noticeData[j].title}`}>
              <span>
                <img src={imgSrc} alt="message pic" />
              </span>
              <Link
                className={styles.msga}
                to={noticeData[j].link}
                // target="_blank"
                onClick={(e) => {
                  this.msgLinkClick(noticeData[j].link, noticeData[j], e);
                }}
              >
                {noticeData[j].title}
              </Link>
            </div>
            <div className={styles.msgDateDiv}>{mmDD}</div>
          </div>
        );
      }
    }
    return showListDate;
  };

  showAzMenu = (isMysql) => {
    const {
      global: { ccsData },
      onAzClick,
    } = this.props;

    const { ccsNames, ccsList, ccsEsVal, ccsSqlVal, curCcsVal } = ccsData;
    let showList = [];
    if (isMysql) {
      // sql切换下拉
      showList = ccsNames.filter((key) => key !== ccsSqlVal);
    } else {
      // es切换下拉
      showList = ccsList.filter((key) => key !== ccsEsVal);
    }
    console.log('showList===', showList);
    const azMenu = (
      <Menu
        className={styles.menu}
        selectedKeys={[]}
        onClick={(iniObj) => {
          const { key } = iniObj;
          const {
            global: { aliveObj },
          } = this.props;
          console.log('key===', key, 'aliveObj==', aliveObj, 'aliveObj[key]==');
          if (key === 'all') {
            // 选择全部
            onAzClick(iniObj, isMysql, curCcsVal);
          }
          if (key !== 'all') {
            if (aliveObj[key] === 'alive') {
              onAzClick(iniObj, isMysql, curCcsVal);
            }
            if (aliveObj[key] === 'dead') {
              message.error(`设备 ${key} 当前为离线状态，无法进行切换显示`);
            }
            if (aliveObj[key] === 'exception') {
              message.error(`设备 ${key} 配置异常，无法进行切换显示`);
            }
          }
        }}
      >
        {showList.map((tmp) => (
          <Menu.Item
            key={tmp}
            title={tmp === 'all' ? '全部' : `${tmp}(${tmp === curCcsVal ? '上级' : '下级'})`}
          >
            {tmp === 'all' ? '全部' : `${tmp}(${tmp === curCcsVal ? '上级' : '下级'})`}
          </Menu.Item>
        ))}
      </Menu>
    );
    return azMenu;
  };

  currentUserShow = (currentUser, menu) => {
    const showTce = Cookies.get('showTce');
    if (currentUser) {
      if (showTce === '1') {
        return (
          <div className={`${styles.action}`}>
            <span className={styles.name} title={currentUser}>
              用户：
            </span>
            <span
              style={{ maxWidth: '200px', cursor: 'pointer', display: 'inline-block' }}
              className="ellipsis"
              title={currentUser}
            >
              {currentUser}
            </span>
          </div>
        );
      }
      return (
        <Dropdown overlay={menu}>
          <div className={`${styles.action}`}>
            <span className={styles.name} title={currentUser}>
              用户：
            </span>
            <span
              style={{ maxWidth: '200px', cursor: 'pointer', display: 'inline-block' }}
              className="ellipsis"
              title={currentUser}
            >
              {currentUser}
            </span>
          </div>
        </Dropdown>
      );
    }
    return <Spin size="small" style={{ marginLeft: 8 }} />;
  };

  render() {
    const {
      version,
      location: { pathname },
      // showModify,
      onMenuClick,
      // theme,
      msgNotify,
      authMap,
      global: { ccsData }, // showTce
    } = this.props;
    const noticeData = msgNotify.msgList || [];
    const count = msgNotify.msgCount || 0;
    const { drawerVisible, drawerObj } = this.state;

    // const role = Cookies.get('role');
    let MsgShow = false;
    if (authMap['/systemSetting/msg/messageCenter']) {
      MsgShow = true;
    }
    const showListDate = this.msgShowListData(noticeData);

    const currentUser = Cookies.get('username');
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="logout">退出登录</Menu.Item>
        <Menu.Item key="modify">修改密码</Menu.Item>
      </Menu>
    );

    // "策略“   “报表”   “系统设置页” es: 平台运行监控 本地文件上传
    const isMysql =
      pathname.startsWith('/tactics/') ||
      pathname.startsWith('/reports/') ||
      pathname.startsWith('/systemSetting/') ||
      pathname.startsWith('/dashboard/systemMonitor/') ||
      pathname.startsWith('/dashboard/debugConfig') ||
      pathname.startsWith('/asset/') ||
      pathname.startsWith('/analysis/caughtTask') ||
      window.location.href.endsWith('/event/safeEvent/alarmFile?uploadPageShow=true');
    console.log(379, 'pathname==', pathname, 'href=', window.location.href, 'isMysql==', isMysql);
    const { ccsEsVal, ccsSqlVal, ccsNames, curCcsVal } = ccsData;
    const ccsShowVal = isMysql ? ccsSqlVal : ccsEsVal;
    const showCcsHtml = ccsNames.length > 0;
    // 用户及权限管理页 不做级联控制
    const isUserPage =
      ['/systemSetting/user/userList', '/systemSetting/user/authList'].indexOf(pathname) > -1;

    return (
      <div className={styles.right}>
        <span className={styles.version} onClick={this.versionOnClick}>
          <FileTextOutlined style={{ marginRight: 3 }} />
          版本：{version}
        </span>
        {showCcsHtml && !isUserPage && (
          <Dropdown overlay={this.showAzMenu(isMysql)}>
            <div className={`${styles.action}`}>
              <span
                style={{ maxWidth: '112px', cursor: 'pointer', display: 'inline-block' }}
                className="ellipsis"
              >
                设备：
                {ccsShowVal === 'all'
                  ? '全部'
                  : `${ccsShowVal}(${ccsShowVal === curCcsVal ? '上级' : '下级'})`}
              </span>
            </div>
          </Dropdown>
        )}
        {showCcsHtml && isUserPage && (
          <div className={styles.userCcs}>
            <span
              style={{ maxWidth: '112px', display: 'inline-block' }}
              className="ellipsis"
              title={curCcsVal}
            >
              设备：{curCcsVal}(上级)
            </span>
          </div>
        )}
        {MsgShow && (
          <div className={styles.rightMsgDiv}>
            <NoticeIcon count={count} popupAlign={{ offset: [-22, 0] }}>
              <NoticeIcon.Tab
                list={showListDate}
                showAll={
                  <div className={styles.msgAllDiv}>
                    <a
                      className={styles.msga}
                      onClick={() => {
                        window.location.href = '/systemSetting/msg/messageCenter';
                      }}
                    >
                      查看全部
                    </a>
                  </div>
                }
                title="消息"
                emptyText="您已读完所有消息"
                emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
              />
            </NoticeIcon>
            {drawerVisible && (
              <Modal
                title="消息详情"
                width={600}
                visible={drawerVisible}
                destroyOnClose
                footer={null}
                onCancel={this.msgModalCancel}
              >
                <div className={styles.drawerContent}>
                  <div>
                    <h4 className={styles.title4}>基本信息</h4>
                    <div style={{ padding: '0 0 10px 30px' }}>
                      <Row>
                        <Col className={styles.labelCol} span={7}>
                          消息名称：
                        </Col>
                        <Col span={17}>
                          <div className={styles.cxtCol}>{drawerObj.content}</div>
                        </Col>
                      </Row>
                      {drawerObj.translation.map((arr) => (
                        <Row key={arr[0]}>
                          <Col className={styles.labelCol} span={7}>
                            {arr[1]}：
                          </Col>
                          <Col span={17}>
                            <div className={styles.cxtCol}>{drawerObj.detail[arr[0]]}</div>
                          </Col>
                        </Row>
                      ))}
                    </div>
                  </div>
                  {drawerObj.guide && (
                    <div>
                      <h4 className={styles.title4}>恢复建议</h4>
                      <div style={{ padding: '0 0 10px 30px', lineHeight: '32px' }}>
                        {drawerObj.guide}
                      </div>
                    </div>
                  )}
                </div>
              </Modal>
            )}
          </div>
        )}
        {this.currentUserShow(currentUser, menu)}
      </div>
    );
  }
}
export default GlobalHeaderRight;
