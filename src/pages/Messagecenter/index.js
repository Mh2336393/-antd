import React, { PureComponent } from 'react';
import { history } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/';

class EventIndex extends PureComponent {
  handleTabChange = (key) => {
    const { match } = this.props;
    switch (key) {
      case 'messageCenter':
        history.push(`${match.url}/messageCenter`);
        break;
      case 'strategy':
        history.push(`${match.url}/strategy`);
        break;
      case 'systemAccess':
        history.push(`${match.url}/systemAccess`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, children, location } = this.props;
    const tabList = [
      { tab: '消息中心', key: 'messageCenter', uri: '/systemSetting/msg/messageCenter' },
      { tab: '通知策略', key: 'strategy', uri: '/systemSetting/msg/strategy' },
      { tab: '通知系统接入', key: 'systemAccess', uri: '/systemSetting/msg/systemAccess' },
    ];
    const tabTitle = '消息管理';
    return (
      <PageHeaderWrapper
        tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
        onTabChange={this.handleTabChange}
        tabList={tabList}
        tabTitle={tabTitle}
      >
        <div className="innerContent">{children}</div>
      </PageHeaderWrapper>
    );
  }
}

export default EventIndex;
