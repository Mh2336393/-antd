import React, { PureComponent } from 'react';
import { history } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/';

class Audit extends PureComponent {
  handleTabChange = (key) => {
    const { match } = this.props;
    switch (key) {
      case 'operateLogs':
        history.push(`${match.url}/operateLogs`);
        break;
      case 'sysLogs':
        history.push(`${match.url}/sysLogs`);
        break;
      case 'blockLogs':
        history.push(`${match.url}/blockLogs`);
        break;
      case 'configuration':
        history.push(`${match.url}/configuration`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, children, location } = this.props;
    const tabList = [
      { tab: '操作日志', key: 'operateLogs', uri: '/systemSetting/audit/operateLogs' },
      { tab: '系统日志', key: 'sysLogs', uri: '/systemSetting/audit/sysLogs' },
      { tab: '阻断日志', key: 'blockLogs', uri: '/systemSetting/audit/blockLogs' },
      { tab: '配置', key: 'configuration', uri: '/systemSetting/audit/configuration' },
    ];
    const tabTitle = '审计管理';
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

export default Audit;
