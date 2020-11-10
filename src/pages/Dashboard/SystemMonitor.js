import React, { PureComponent } from 'react';
import { history } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/';

class MonitorIndex extends PureComponent {
  handleTabChange = (key) => {
    const { match } = this.props;
    switch (key) {
      case 'platform':
        history.push(`${match.url}/platform`);
        break;
      case 'source':
        history.push(`${match.url}/source`);
        break;
      case 'debugConfig':
        history.push(`${match.url}/debugConfig`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, children, location } = this.props;
    const tabList = [
      { tab: '平台运行监控', key: 'platform', uri: '/dashboard/systemMonitor/platform' },
      { tab: '采集源运行监控', key: 'source', uri: '/dashboard/systemMonitor/source' },
      { tab: '高级管理模式', key: 'debugConfig', uri: '/dashboard/systemMonitor/debugConfig' },
    ];
    const tabTitle = '系统监控';
    return (
      <PageHeaderWrapper
        tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
        onTabChange={this.handleTabChange}
        tabList={tabList}
        tabTitle={tabTitle}
      >
        <div>{children}</div>
      </PageHeaderWrapper>
    );
  }
}

export default MonitorIndex;
