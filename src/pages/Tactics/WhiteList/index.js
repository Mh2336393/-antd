import React, { PureComponent } from 'react';
import { history } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/';

class EventIndex extends PureComponent {
  handleTabChange = (key) => {
    const { match } = this.props;
    switch (key) {
      case 'currency':
        history.push(`${match.url}/currency`);
        break;
      case 'iocWhitelist':
        history.push(`${match.url}/iocWhitelist`);
        break;
      case 'blockWhite':
        history.push(`${match.url}/blockWhite`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, children, location } = this.props;
    const tabList = [
      { tab: '通用白名单', key: 'currency', uri: '/tactics/whites/currency' },
      { tab: 'IOC白名单', key: 'iocWhitelist', uri: '/tactics/whites/iocWhitelist' },
      { tab: '阻断白名单', key: 'blockWhite', uri: '/tactics/whites/blockWhite' },
    ];
    const tabTitle = '白名单管理';
    return (
      <PageHeaderWrapper
        tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
        onTabChange={this.handleTabChange}
        tabTitle={tabTitle}
        tabList={tabList}
      >
        <div className="innerContent">{children}</div>
      </PageHeaderWrapper>
    );
  }
}

export default EventIndex;
