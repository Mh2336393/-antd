import React, { PureComponent } from 'react';
import { history } from 'umi';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/';

/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */

class EventIndex extends PureComponent {
  handleTabChange = (key) => {
    const { match } = this.props;
    switch (key) {
      case 'overview':
        history.push(`${match.url}/overview`);
        break;
      case 'alarm':
        history.push(`${match.url}/alarm`);
        break;
      case 'alarmAlert':
        history.push(`${match.url}/alarmAlert`);
        break;
      case 'alarmIoc':
        history.push(`${match.url}/alarmIoc`);
        break;
      case 'alarmFile':
        history.push(`${match.url}/alarmFile`);
        break;
      case 'invasion':
        history.push(`${match.url}/invasion`);
        break;
      case 'fall':
        history.push(`${match.url}/fall`);
        break;
      case 'file':
        history.push(`${match.url}/file`);
        break;
      case 'propertyRisk':
        history.push(`${match.url}/propertyRisk`);
        break;
      case 'apt':
        history.push(`${match.url}/apt`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, children, location } = this.props;
    const tabList = [
      { tab: '总体感知', key: 'alarm', uri: '/event/safeEvent/alarm' },
      { tab: '入侵感知', key: 'alarmAlert', uri: '/event/safeEvent/alarmAlert' },
      { tab: '威胁情报', key: 'alarmIoc', uri: '/event/safeEvent/alarmIoc' },
      { tab: '异常文件感知', key: 'alarmFile', uri: '/event/safeEvent/alarmFile' },
    ];
    const tabTitle = '安全事件';
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
