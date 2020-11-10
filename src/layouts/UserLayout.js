import React from 'react';
import { Link } from 'umi';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'umi';
import GlobalFooter from '@/components/GlobalFooter';
import DocumentTitle from 'react-document-title';
import { FileTextOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styles from './UserLayout.less';
// import logo from '../assets/banner-logo.png';

class UserLayout extends React.PureComponent {
  // @TODO title
  // getPageTitle() {
  //   const { routerData, location } = this.props;
  //   const { pathname } = location;
  //   let title = 'Ant Design Pro';
  //   if (routerData[pathname] && routerData[pathname].name) {
  //     title = `${routerData[pathname].name} - Ant Design Pro`;
  //   }
  //   return title;
  // }
  // getPageTitle = pathname => {
  //   const currRouterData = this.matchParamsPath(pathname);

  //   if (!currRouterData) {
  //     return '腾讯御界';
  //   }
  //   // const message = formatMessage({
  //   //   id: currRouterData.locale || currRouterData.name,
  //   //   defaultMessage: currRouterData.name,
  //   // });
  //   return `${currRouterData.name} - 腾讯御界`;
  // };
  // constructor(props) {
  //   super(props);
  // }

  componentWillMount() {
    const { dispatch, logoUrl } = this.props;
    dispatch({
      type: 'global/fetchLicense',
    });
    dispatch({ type: 'global/fetchTceLoginName' })
      .then((json) => {
        const { redirectUrl, showTce } = json;
        if (showTce === '1') {
          window.location.href = redirectUrl;
        }
      })
      .catch(() => {});
    if (isEmpty(logoUrl)) {
      dispatch({ type: 'global/fetchLogoUrl' });
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'global/fetchVpcConfig' });
    // dispatch({ type: 'global/fetchVpcConfig' }).then(() => {
    //   // tce环境下 无登录页 修改密码页
    //   const { showTce } = this.props;
    //   if (showTce === '1') {
    //     history.push('/');
    //   }
    // });
  }

  render() {
    const { children, logoUrl, version, webName } = this.props;
    return (
      <DocumentTitle title={webName === '高级威胁检测系统' ? '高级威胁检测系统' : webName}>
        <div className={styles.container}>
          <div className={styles.companyTitle}>
            <div className={styles.companyLeft}>
              {logoUrl.logo_menu ? (
                <div
                  className={styles.companyLogo}
                  style={{ backgroundImage: `url(${logoUrl.logo_menu})` }}
                />
              ) : (
                <Spin />
              )}
              <Link to="/">
                <div className={styles.selfName}>{webName}</div>
              </Link>
            </div>
            <div className={styles.companyRight}>
              <FileTextOutlined style={{ marginRight: 3 }} />
              版本：{version}
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                {/* {logoUrl.logo_login ? <img alt="logo" className={styles.logo} src={logoUrl.logo_login} /> : <Spin size="large" />} */}
                {logoUrl.logo_login ? (
                  <div
                    className={styles.loginLogo}
                    style={{ backgroundImage: `url(${logoUrl.logo_login})` }}
                  />
                ) : (
                  <Spin size="large" />
                )}
              </div>
            </div>
            {children}
          </div>
          <GlobalFooter
            links={[]}
            copyright={<div>Copyright &copy; 1998-2020 Tencent.All Rights Reserved</div>}
          />
        </div>
      </DocumentTitle>
    );
  }
}

// export default UserLayout;
export default connect(({ global, loading }) => ({
  version: global.version,
  logoUrl: global.logoUrl,
  showTce: global.showTce,
  webName: global.webName,
  loadingVpcid: loading.effects['global/fetchVpcConfig'],
}))(UserLayout);
