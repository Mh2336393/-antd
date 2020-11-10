import React, { Fragment } from 'react';
import { Layout, ConfigProvider, Spin, message, Modal, Button, Alert, Row, Col } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import DocumentTitle from 'react-document-title';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import isEmpty from 'lodash/isEmpty';
import Cookies from 'js-cookie';
import { connect } from 'umi';
import { history, Redirect } from 'umi';
// import { Link } from 'umi';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
// import { formatMessage } from 'umi';
import SiderMenu from '@/components/SiderMenu';
import PageLoading from '@/components/PageLoading';
import Authorized from '@/utils/Authorized';
import SettingDrawer from '@/components/SettingDrawer';
import Header from './Header';
import styles from './BasicLayout.less';
// import logo from '../assets/logo.png';
// import logo from '../assets/logo_white.png';
import Context from './MenuContext';

/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-param-reassign */

const { Content } = Layout;

function flattenChild(routes, arr) {
  routes.forEach((item) => {
    if (item.routes) {
      arr.push(item);
      flattenChild(item.routes, arr);
    } else {
      arr.push(item);
    }
  });
  return arr;
}

// Conversion router to menu.
function formatter(data, authMap, parentPath = '', parentAuthority) {
  return data.map((item) => {
    const { path, redirect } = item;
    const locale = item.name;
    // /exception/* 做特殊处理，不加权限
    const result = {
      ...item,
      path,
      locale,
      // authority: item.authority || parentAuthority,
      authority: /exception/g.test(path)
        ? undefined
        : authMap[path] || item.authority || parentAuthority || 'no_auth',
    };
    // 根目录特殊处理,判断其转向的路由是否有权限，有的话改写权限为r
    if (path === '/' || redirect) {
      result.authority = 'r';
    }

    // 当孩子节点有一个有权限，父节点的authority 改为r
    if (item.routes) {
      const showInMenuRoutes = item.routes.filter((route) => !route.hideInMenu); // 过滤掉在菜单中隐藏的router
      const child = flattenChild(showInMenuRoutes, []);
      const hasAuthChild = child.filter((element) => authMap[element.path]);

      if (hasAuthChild.length > 0) {
        result.authority = 'r';
      }
      const children = formatter(
        item.routes,
        authMap,
        `${parentPath}${item.path}/`,
        item.authority
      );
      // Reduce memory usage
      result.children = children;
    }
    delete result.routes;
    return result;
  });
}

const widtQquery = {
  'screen-lg': {
    minWidth: 575,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1589,
  },
  'screen-xxl': {
    minWidth: 1590,
  },
};

class BasicLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.getBreadcrumbNameMap = memoizeOne(this.getBreadcrumbNameMap, isEqual);
    this.breadcrumbNameMap = {};
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
    this.tabListFirstRedirect = {};
    this.aliveAutoTimer = null;
  }

  state = {
    rendering: true,
    isMobile: false,
    sLeft: 0,
    azReqing: false,
  };

  componentWillMount() {
    const { dispatch, logoUrl, authMap } = this.props;
    dispatch({ type: 'global/fetchTceLoginName' })
      .then((json) => {
        const { role, username, redirectUrl, showTce } = json;
        if (showTce === '1' && (!username || !role)) {
          window.location.href = redirectUrl;
        }
      })
      .catch(() => {});

    const webName = localStorage.getItem('webName');
    if (isEmpty(logoUrl) || !webName) {
      dispatch({ type: 'global/fetchLogoUrl' });
    }

    if (!isEmpty(authMap) && isEmpty(this.breadcrumbNameMap)) {
      this.breadcrumbNameMap = this.getBreadcrumbNameMap(authMap);
    }
  }

  componentDidMount() {
    const {
      dispatch,
      authMap,
      route: { routes },
      location: { pathname },
      login: { currentUser },
    } = this.props;
    dispatch({ type: 'global/fetchVpcConfig' }).then(() => {
      const {
        global: {
          ccsData: { ccsLevel },
        },
      } = this.props;
      // 如果为上级且定时器没有开启，就要开启定时器,获取所有子级存活状态
      if (ccsLevel === 'leader' && !this.aliveAutoTimer) {
        dispatch({ type: 'global/fetchAliveObj' });
        this.aliveAutoTimer = setInterval(() => {
          dispatch({ type: 'global/fetchAliveObj' });
        }, 60000);
      }
      // 如果为子级且有定时器，就关闭定时器
      if (ccsLevel === 'sub' && this.aliveAutoTimer) {
        clearInterval(this.aliveAutoTimer);
        this.aliveAutoTimer = null;
      }
    });

    if (!currentUser) {
      history.push('/user/login');
      return;
    }
    if (currentUser && isEmpty(authMap)) {
      dispatch({ type: 'global/fetchAuthMap' }).then(() => {
        const { authMap: authMapProps } = this.props;
        this.tabListChangeRedirect(routes, authMapProps);
        // console.log(2020202, 'this.tabListFirstRedirect==', this.tabListFirstRedirect);
        const tabFirstRedirect = this.tabListFirstRedirect[pathname];
        if (tabFirstRedirect) {
          window.location.href = tabFirstRedirect;
          // history.push('/event/safeEvent/alarmFile');
          // return;
        }
      });
    } else {
      this.tabListChangeRedirect(routes, authMap);
      // console.log(112020202, 'this.tabListFirstRedirect==', this.tabListFirstRedirect);
      const tabFirstRedirect = this.tabListFirstRedirect[pathname];
      if (tabFirstRedirect) {
        window.location.href = tabFirstRedirect;
        // history.push('/event/safeEvent/alarmFile');
        // return;
      }
    }

    dispatch({ type: 'global/fetchAlarmMessages' });

    dispatch({
      type: 'setting/getSetting',
    });
    this.renderRef = requestAnimationFrame(() => {
      this.setState({
        rendering: false,
      });
    });
    this.enquireHandler = enquireScreen((mobile) => {
      const { isMobile } = this.state;
      if (isMobile !== mobile) {
        this.setState({
          isMobile: mobile,
        });
      }
    });
    // window.onscroll = () => {
    //   const sLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    //   this.setState({ sLeft });
    // };
  }

  componentWillReceiveProps(nextProps) {
    const { authMap } = nextProps;
    // eslint-disable-next-line react/destructuring-assignment
    if (!isEmpty(authMap) && isEmpty(this.props.authMap)) {
      this.breadcrumbNameMap = this.getBreadcrumbNameMap(authMap);
    }
  }

  componentDidUpdate(prevProps) {
    // After changing to phone mode,
    // if collapsed is true, you need to click twice to display

    const { authMap } = this.props;
    const {
      location: { pathname },
    } = prevProps;
    // console.log('pathname', pathname, this.props.location.pathname)
    // 动态改变 根路径'/' 的转向，转到有权限的页面，避免登陆后输入ip,跳转到的页面没权限，显示403，优化体验
    if (
      pathname === '/' &&
      !isEmpty(this.breadcrumbNameMap) &&
      this.breadcrumbNameMap[this.props.location.pathname] &&
      this.breadcrumbNameMap[this.props.location.pathname].authority
    ) {
      history.push(Object.keys(authMap)[0]);
    }

    // this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    const { isMobile } = this.state;
    const { collapsed } = this.props;
    if (isMobile && !prevProps.isMobile && !collapsed) {
      this.handleMenuCollapse(false);
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.renderRef);
    unenquireScreen(this.enquireHandler);
  }

  getContext() {
    const { location } = this.props;
    return {
      location,
      breadcrumbNameMap: this.breadcrumbNameMap,
    };
  }

  // 记得补tce内容
  getMenuData(authMap) {
    const {
      route: { routes },
    } = this.props;
    let result = formatter(routes, authMap);
    result = this.changeRedirect(result, authMap);
    // console.log('resulst', result);
    return result;
  }

  /**
   * 获取面包屑映射
   * @param {Object} menuData 菜单配置
   */
  getBreadcrumbNameMap(authMap) {
    const routerMap = {};
    const mergeMenuAndRouter = (data) => {
      data.forEach((menuItem) => {
        if (menuItem.children) {
          mergeMenuAndRouter(menuItem.children);
        }
        // Reduce memory usage
        routerMap[menuItem.path] = menuItem;
      });
    };
    mergeMenuAndRouter(this.getMenuData(authMap));
    return routerMap;
  }

  changeRedirect = (list, authMap) => {
    list.forEach((item) => {
      if (item.children) {
        const idx = item.children.findIndex((r) => r.redirect);
        // has redirect and no auth
        if (idx > -1 && !authMap[item.children[idx].redirect]) {
          const brotherList = item.children.filter(
            (child) => ['r', 'rw'].includes(child.authority) && !child.hideInMenu && !child.redirect
          );
          if (brotherList.length > 0) {
            item.children[idx].redirect = brotherList[0].path;
          }
        }
        // 还有下层
        if (item.children.some((i) => i.children)) {
          this.changeRedirect(item.children, authMap);
        }
      }
    });
    return list;
  };

  tabListChangeRedirect = (list, authMap) => {
    list.forEach((item) => {
      // 当tabList页面中，第一个path没有权限时，也无法自动跳转到后面有权限的页面
      if (item.hideChildrenInMenu && item.routes && item.routes.length) {
        const firstPath = item.routes[0].path;
        const firstAuth = authMap[firstPath];
        // console.log('firstPath==', firstPath, 'firstAuth==', firstAuth);
        if (firstAuth !== 'r' && firstAuth !== 'rw') {
          const hasAuthChild = item.routes.filter(
            (obj) => ['r', 'rw'].includes(authMap[obj.path]) && !obj.hideInMenu
          );
          if (hasAuthChild.length) {
            // item.routes[0].tabRedirect = hasAuthChild[0].path;
            this.tabListFirstRedirect[firstPath] = hasAuthChild[0].path;
          }
        }
      }
      if (item.routes) {
        this.tabListChangeRedirect(item.routes, authMap);
      }
    });
    // return list;
  };

  matchParamsPath = (pathname) => {
    console.log('this.breadcrumbNameMap===', this.breadcrumbNameMap);
    const pathKey = Object.keys(this.breadcrumbNameMap).find((key) =>
      pathToRegexp(key).test(pathname)
    );
    console.log('在面包屑表里面找出匹配的===pathKey', pathKey);
    return this.breadcrumbNameMap[pathKey];
  };

  getPageTitle = (pathname) => {
    const currRouterData = this.matchParamsPath(pathname);

    const webName = localStorage.getItem('webName');
    const titleName = webName === '高级威胁检测系统' ? '高级威胁检测系统' : webName;

    if (!currRouterData) {
      return titleName;
    }
    // const message = formatMessage({
    //   id: currRouterData.locale || currRouterData.name,
    //   defaultMessage: currRouterData.name,
    // });
    return `${currRouterData.name} - ${titleName}`;
  };

  getLayoutStyle = () => {
    const { isMobile } = this.state;
    const { fixSiderbar, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '256px',
      };
    }
    return null;
  };

  getContentStyle = () => {
    const { fixedHeader } = this.props;
    return {
      margin: 0,
      paddingTop: fixedHeader ? 64 : 0,
    };
  };

  handleMenuCollapse = (collapsed) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'modify') {
      history.push('/user/modifyPwd');
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  };

  msgAlarmContent = (drawerObj) => (
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
          <div style={{ padding: '0 0 10px 30px', lineHeight: '32px' }}>{drawerObj.guide}</div>
        </div>
      )}
    </div>
  );

  msgAlarmModal = () => {
    const {
      dispatch,
      global: { alarmTip: record },
    } = this.props;
    const { message_type, sub_type, detail, content, is_read, msg_id } = record;
    const reqObj = { message_type, sub_type, content };
    dispatch({ type: 'messageCenter/fetchMsgDetail', payload: reqObj })
      .then((json) => {
        const { data = {} } = json;
        if (data.sub_type) {
          const { detail_translation, ...other } = data;
          const drawerObj = { ...other };
          drawerObj.detail = JSON.parse(detail);
          drawerObj.translation = JSON.parse(detail_translation);
          // 消息变已读
          if (!is_read) {
            dispatch({
              type: 'messageCenter/stausHandleEvent',
              payload: { ids: [msg_id], status: 'MarkedRead' },
            });
          }
          const modalcxt = this.msgAlarmContent(drawerObj);
          // const self = this;
          Modal.confirm({
            title: '错误详情',
            content: modalcxt,
            okText: '知道了',
            cancelText: '已处理',
            width: '600px',
            onCancel() {
              try {
                dispatch({ type: 'msgNotify/fetchMsgList' });
                dispatch({ type: 'global/fetchAlarmMessages' });
              } catch (error) {
                // message.error(error);
              }
            },
          });
        } else {
          message.error('详情获取失败');
        }
      })
      .catch((error) => {
        console.log('详情获取失败error==', error);
        message.error('详情获取失败');
      });
  };

  alarmAlertClose = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'global/setVersion', payload: { alarmTip: {} } });
  };

  // tce az切换
  onAzClick = ({ key }, isMysql, curCcsVal) => {
    const { azReqing } = this.state;
    if (azReqing) {
      return;
    }
    this.setState({ azReqing: true });
    if (isMysql) {
      if (key === curCcsVal) {
        Cookies.set('ccsaz', 'all');
      } else {
        Cookies.set('ccsaz', key);
      }
      Cookies.set('sqlaz', key);
    } else {
      // es切换
      if (key === 'all') {
        Cookies.set('sqlaz', curCcsVal);
      } else {
        Cookies.set('sqlaz', key);
      }
      Cookies.set('ccsaz', key);
    }
    const {
      location: { pathname },
    } = this.props;
    const sourceArr = ['/systemSetting/dataAccess/add', '/systemSetting/dataAccess/editor'];
    // const routes = Object.keys(authMap);
    // const path = routes[0] || '/dashboard/overview';
    setTimeout(() => {
      this.setState({ azReqing: false });
      if (sourceArr.indexOf(pathname) > -1) {
        history.push('/systemSetting/dataAccess/source');
      } else {
        window.location.reload();
      }
      // 跳转到有权限的首页
      // window.location.href = path;
    }, 100);
  };

  msgCenterLinkClick = (data) => {
    const {
      dispatch,
      login: { currentUser },
    } = this.props;
    const { msg_num: msgNum } = data;
    const msgIds = msgNum.split('|').slice(1);
    const newIds = msgIds.join(',');
    const req = { ids: newIds, status: 'MarkedRead', user_id: currentUser };
    try {
      dispatch({ type: 'messageCenter/stausHandleEvent', payload: req })
        .then(() => {
          dispatch({ type: 'msgNotify/fetchMsgList' });
        })
        .catch((error) => {
          console.log('设置已读状态error==', error);
        });
    } catch (err) {
      console.log('浮窗消息设置已读状态err==', err);
    }
  };

  renderSettingDrawer() {
    // Do show SettingDrawer in production
    // unless deployed in preview.pro.ant.design as demo
    const { rendering } = this.state;
    if ((rendering || process.env.NODE_ENV === 'production') && APP_TYPE !== 'site') {
      return null;
    }
    return <SettingDrawer />;
  }

  render() {
    const {
      authMap,
      fixedHeader,
      msgNotify,
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname, query },
      loadingVpcid,
      global,
      // showTce,
    } = this.props;
    const { isMobile, sLeft, azReqing } = this.state;
    const isTop = PropsLayout === 'topmenu';
    const contentStyle = !fixedHeader ? { paddingTop: 0 } : {};

    if (isEmpty(authMap)) {
      return <PageLoading />;
    }
    const { version, webName, logoUrl, alarmTip } = global;
    const isAlarmVisible = !!alarmTip.content;

    const messageLink = (
      <div>
        {alarmTip.content}！
        <Button className={styles.errorWhyBtn} onClick={this.msgAlarmModal}>
          查看错误详情
        </Button>
      </div>
    );

    console.log('BasicLayout>pathname:', pathname);
    const menuData = this.getMenuData(authMap);
    const routerConfig = this.matchParamsPath(pathname);
    console.log('BasicLayout>routerConfig:', routerConfig);

    const currentUser = Cookies.get('username');
    const noMatchTo = currentUser ? <Redirect to="/auth/noAuth" /> : <Redirect to="/user/login" />;
    const layout = (
      <Layout>
        {isTop ? null : ( // isTop && !isMobile
          <SiderMenu
            logo={logoUrl.logo_menu}
            Authorized={Authorized}
            theme={navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuData}
            isMobile={isMobile}
            msgScrollLeft={sLeft}
            onMenuClick={this.handleMenuClick}
            noticeData={msgNotify.msgList}
            count={
              msgNotify.msgCount // 消息显示数据
            }
            msgCenterLinkClick={
              this.msgCenterLinkClick // 消息总条数
            }
            {...this.props}
          />
        )}
        <Layout
          style={{
            height: '100%',
            minWidth: 1400,
          }}
        >
          {loadingVpcid ? (
            <Spin />
          ) : (
            <Fragment>
              {/* 高级威胁检测系统导航栏 */}
              <Header
                onAzClick={this.onAzClick}
                menuData={menuData}
                handleMenuCollapse={this.handleMenuCollapse}
                logo={logoUrl.logo_menu}
                webName={webName}
                Authorized={Authorized}
                isMobile={isMobile}
                // showModify={currentRole ? currentRole.toString() === '4' : false}
                version={version}
                {...this.props}
              />

              {/* 页面内容 */}
              {azReqing ? (
                <Spin />
              ) : (
                <Content className={styles.content} style={contentStyle}>
                  {isAlarmVisible ? (
                    <Alert
                      style={{ height: '40px' }}
                      message={messageLink}
                      type="error"
                      showIcon
                      closable
                      onClose={this.alarmAlertClose}
                    />
                  ) : null}
                  {query.hasPermission === '1' ? (
                    <div style={{ height: isAlarmVisible ? 'calc(100% - 40px)' : '100%' }}>
                      {children}
                    </div>
                  ) : (
                    <ConfigProvider locale={zhCN}>
                      <Authorized authority={routerConfig.authority} noMatch={noMatchTo}>
                        <div style={{ height: isAlarmVisible ? 'calc(100% - 40px)' : '100%' }}>
                          {children}
                        </div>
                      </Authorized>
                    </ConfigProvider>
                  )}
                </Content>
              )}
            </Fragment>
          )}
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={this.getPageTitle(pathname)}>
          <ContainerQuery query={widtQquery}>
            {(params) => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </React.Fragment>
    );
  }
}

export default connect(({ global, setting, login, msgNotify, loading }) => ({
  collapsed: global.collapsed,
  authMap: global.authMap,
  hasVpc: global.hasVpc,
  showTce: global.showTce,
  logoUrl: global.logoUrl,
  global,
  login,
  layout: setting.layout,
  ...setting,
  msgNotify,
  loadingVpcid: loading.effects['global/fetchVpcConfig'],
}))(BasicLayout);
