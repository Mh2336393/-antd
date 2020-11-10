import React, { PureComponent } from 'react';
import { history } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/';

class DataAccess extends PureComponent {
  handleTabChange = (key) => {
    const { match } = this.props;
    switch (key) {
      case 'source':
        history.push(`${match.url}/source`);
        break;
      case 'sandbox':
        history.push(`${match.url}/sandbox`);
        break;
      case 'clound':
        history.push(`${match.url}/clound`);
        break;
      case 'block':
        history.push(`${match.url}/block`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, children, location } = this.props;
    const tabList = [
      { tab: '流量源接入', key: 'source', uri: '/systemSetting/dataAccess/source' },
      { tab: '沙箱配置', key: 'sandbox', uri: '/systemSetting/dataAccess/sandbox' },
      { tab: '云端智能接入', key: 'clound', uri: '/systemSetting/dataAccess/clound' },
      { tab: '阻断模块接入', key: 'block', uri: '/systemSetting/dataAccess/block' },
    ];
    const tabTitle = '数据接入';
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

export default DataAccess;
