import React, { Component } from 'react';
import { history } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/';

class DataAccess extends Component {
  handleTabChange = (key) => {
    const { match } = this.props;
    switch (key) {
      case 'userList':
        history.push(`${match.url}/userList`);
        break;
      case 'authList':
        history.push(`${match.url}/authList`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, children, location } = this.props;
    const tabList = [
      { tab: '用户管理', key: 'userList', uri: '/systemSetting/user/userList' },
      { tab: '权限管理', key: 'authList', uri: '/systemSetting/user/authList' },
    ];
    const tabTitle = '用户及权限';
    return (
      <div className="container">
        {/* <div className="pjHeader">用户及权限</div> */}
        <PageHeaderWrapper
          tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
          onTabChange={this.handleTabChange}
          tabList={tabList}
          tabTitle={tabTitle}
        >
          {children}
          {/* <div className="mainContent">{children}</div> */}
        </PageHeaderWrapper>
        {/* </div> */}
      </div>
    );
  }
}
export default DataAccess;
