import React, { PureComponent } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Layout, Dropdown, Spin, Menu, Modal } from 'antd';
import Cookies from 'js-cookie';
import pathToRegexp from 'path-to-regexp';
import classNames from 'classnames';
import { Link } from 'umi';
import { history } from 'umi';
import { connect } from 'umi';
import moment from 'moment';
import styles from './index.less';
import BaseMenu, { getMenuMatches } from './BaseMenu';
import { urlToList } from '../_utils/pathTools';
import NoticeIcon from '../NoticeIcon';

import eventAvator from '../../assets/image/event_icon.png';
import settingAvator from '../../assets/image/setting_icon.png';
import reportAvator from '../../assets/image/report_icon.png';

const { Sider } = Layout;

/**
 * 获得菜单子节点
 * @memberof SiderMenu
 */
const getDefaultCollapsedSubMenus = (props) => {
  const {
    location: { pathname },
    flatMenuKeys,
  } = props;
  return urlToList(pathname)
    .map((item) => getMenuMatches(flatMenuKeys, item)[0])
    .filter((item) => item);
};

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => {path,path2}
 * @param  menu
 */
export const getFlatMenuKeys = (menu) =>
  menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = (flatMenuKeys, paths) =>
  paths.reduce(
    (matchKeys, path) =>
      matchKeys.concat(flatMenuKeys.filter((item) => pathToRegexp(item).test(path))),
    []
  );

// @connect(({ messageCenter }) => ({
//   messageCenter,
// }))
class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.flatMenuKeys = getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus(props),
      msgModalVisible: false,
      msgModalCxt: {},
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { pathname } = state;
    if (props.location.pathname !== pathname) {
      return {
        pathname: props.location.pathname,
        openKeys: getDefaultCollapsedSubMenus(props),
      };
    }
    return null;
  }

  isMainMenu = (key) => {
    const { menuData } = this.props;
    return menuData.some((item) => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange = (openKeys) => {
    const moreThanOne = openKeys.filter((openKey) => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys],
    });
  };

  msgLinkClick = (link, data, e) => {
    if (
      data.message_type === 'sec' ||
      (data.message_type === 'sys' && data.sub_type !== 'flow_exception') ||
      data.sub_type === 'new_report'
    ) {
      e.preventDefault();
      const { dispatch } = this.props;
      if (data.msg_num) {
        const numArr = data.msg_num.split('|').slice(1);
        const allIdArr = numArr.map((id) => Number(id));
        let idArr = allIdArr;
        if (
          data.message_type === 'sys' &&
          data.sub_type !== 'flow_exception' &&
          allIdArr.length > 10
        ) {
          idArr = allIdArr.slice(0, 10);
        }
        try {
          dispatch({
            type: 'messageCenter/fetchDetailInfo',
            payload: { ids: idArr, type: data.sub_type },
          })
            .then(() => {
              const {
                messageCenter: { detailInfo },
              } = this.props;
              // console.log(5, 'detailInfo==', detailInfo);
              if (data.message_type === 'sec' || data.sub_type === 'new_report') {
                const secDetail = detailInfo.map((obj) => {
                  const item = JSON.parse(obj.detail);
                  if (data.message_type === 'sec') {
                    return { msg_id: obj.msg_id, time: item.time };
                  }
                  return { msg_id: obj.msg_id, time: item.generate_time };
                });
                const timeSort = secDetail.sort((a, b) => {
                  const t1 = moment(a.time).valueOf();
                  const t2 = moment(b.time).valueOf();
                  if (t1 > t2) {
                    return 1;
                  }
                  if (t1 < t2) {
                    return -1;
                  }
                  return 0;
                });
                const timeStart = moment(moment(timeSort[0].time).subtract(1, 'seconds')).valueOf();
                const timeStop = moment(
                  moment(timeSort[timeSort.length - 1].time).add(1, 'seconds')
                ).valueOf();
                const reportStart = moment(timeStart).format('YYYY-MM-DD HH:mm:ss');
                const reportStop = moment(timeStop).format('YYYY-MM-DD HH:mm:ss');
                // console.log(timeStart, timeStop);
                // console.log(moment(timeStart).format('YYYY-MM-DD HH:mm:ss'), moment(timeStop).format('YYYY-MM-DD HH:mm:ss'));
                let secLink = '';
                if (data.message_type === 'sec') {
                  let scoreParam = '&score=5';
                  if (data.sub_type === 'urgent_sec_event') {
                    scoreParam = '&score=4';
                  }
                  secLink = `${link}${scoreParam}&startTime=${timeStart}&endTime=${timeStop}&sort=score&dir=desc`;
                }
                if (data.sub_type === 'new_report') {
                  secLink = `${link}?startTime=${reportStart}&endTime=${reportStop}`;
                }
                // window.location.href = secLink;
                history.push(secLink);
              }
              if (data.message_type === 'sys' && data.sub_type !== 'flow_exception') {
                this.setState({ msgModalVisible: true, msgModalCxt: { detail: detailInfo } });
              }
            })
            .catch((error) => {
              console.log('获取消息详情1 error==', error);
            });
        } catch (err) {
          console.log('获取消息详情2 err==', err);
        }
      }
    }
    const { msgCenterLinkClick } = this.props;
    if (msgCenterLinkClick) {
      msgCenterLinkClick(data);
    }
  };

  render() {
    const {
      logo,
      msgScrollLeft,
      collapsed,
      onCollapse,
      fixSiderbar,
      theme,
      onMenuClick,
      count,
      noticeData,
    } = this.props;
    const { openKeys, msgModalVisible, msgModalCxt } = this.state;
    const msgDetail =
      msgModalCxt.detail && msgModalCxt.detail.length > 10
        ? msgModalCxt.detail.slice(0, 10)
        : msgModalCxt.detail;
    // console.log('msgDetail==', msgDetail);
    const defaultProps = collapsed ? {} : { openKeys };
    const currentUser = Cookies.get('username');
    const role = Cookies.get('role');
    const siderClassName = classNames(styles.sider, {
      [styles.fixSiderbar]: fixSiderbar,
      [styles.light]: theme === 'light',
    });
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="logout">退出登录</Menu.Item>
        <Menu.Item key="modify">修改密码</Menu.Item>
      </Menu>
    );
    const btmCls = classNames(styles.siderBottom, {
      [styles.siderBottomCollapsed]: collapsed,
    });

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
    // console.log('collapsed', collapsed);
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={256}
        theme={theme}
        className={siderClassName}
      >
        <div className={styles.logo} id="logo">
          <Link to="/">
            <img src={logo} alt="logo" />
            <h1>御界高级威胁检测系统</h1>
          </Link>
        </div>
        <BaseMenu
          {...this.props}
          mode="inline"
          handleOpenChange={this.handleOpenChange}
          onOpenChange={this.handleOpenChange}
          style={{ padding: '16px 0', width: '100%' }}
          {...defaultProps}
        />

        <div className={btmCls} style={{ left: 0 - msgScrollLeft }}>
          <div className={styles.btmMsgs}>
            {role !== '3' && (
              <NoticeIcon className={styles.action} count={count} popupAlign={{ offset: [20, -4] }}>
                <NoticeIcon.Tab
                  list={showListDate}
                  showAll={
                    <div className={styles.msgAllDiv}>
                      <Link className={styles.msga} to="/systemSetting/msg/messageCenter">
                        查看全部
                      </Link>
                    </div>
                  }
                  title="消息"
                  emptyText="您已读完所有消息"
                  emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
                />
              </NoticeIcon>
            )}
          </div>
          <div className={styles.btmUser}>
            {currentUser ? (
              <Dropdown overlay={menu} trigger={['click']} placement="topLeft">
                <span className={`${styles.action} ${styles.account}`}>
                  <span className={styles.name} title={currentUser}>
                    {currentUser}
                  </span>
                  <CaretDownOutlined style={{ color: '#fff', marginLeft: 3 }} />
                </span>
              </Dropdown>
            ) : (
              <Spin size="small" style={{ marginLeft: 8 }} />
            )}
          </div>
          <Modal
            title="系统消息告警日志"
            visible={msgModalVisible}
            destroyOnClose
            footer={null}
            onCancel={() => {
              this.setState({ msgModalVisible: false, msgModalCxt: {} });
            }}
          >
            {msgDetail &&
              msgDetail.map((obj, index) => (
                <div key={obj.msg_id}>
                  <div>{`detail_${index + 1}：`}</div>
                  <p>{`${obj.detail}`}</p>
                </div>
              ))}
            {/* <p>{`"detail":${JSON.stringify(msgModalCxt.detail)}`}</p> */}
          </Modal>
        </div>
      </Sider>
    );
  }
}
// export default SiderMenu;
export default connect(({ messageCenter }) => ({
  messageCenter,
}))(SiderMenu);
