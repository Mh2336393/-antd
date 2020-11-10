import React, { PureComponent } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Popover, Tabs, Badge, Spin } from 'antd';
import classNames from 'classnames';
import List from './NoticeList';
import styles from './index.less';

const { TabPane } = Tabs;

export default class NoticeIcon extends PureComponent {
  static Tab = TabPane;

  static defaultProps = {
    onItemClick: () => {},
    onPopupVisibleChange: () => {},
    onTabChange: () => {},
    onClear: () => {},
    loading: false,
    locale: {
      emptyText: '暂无数据',
      clear: '清空',
    },
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
  };

  onItemClick = (item, tabProps) => {
    const { onItemClick } = this.props;
    onItemClick(item, tabProps);
  };

  onTabChange = tabType => {
    const { onTabChange } = this.props;
    onTabChange(tabType);
  };

  getNotificationBox() {
    const { children, loading, locale, onClear, count } = this.props;
    if (!children) {
      return null;
    }
    const panes = React.Children.map(children, child => {
      const title = child.props.list && count > 0 ? `${child.props.title} (${count})` : child.props.title;
      // const title =
      //   child.props.list && child.props.list.length > 0
      //     ? `${child.props.title} (${child.props.list.length})`
      //     : child.props.title;
      return (
        <TabPane tab={title} key={child.props.title}>
          <List
            {...child.props}
            data={child.props.list}
            onClick={item => this.onItemClick(item, child.props)}
            onClear={() => onClear(child.props.title)}
            title={child.props.title}
            locale={locale}
            showClear={false}
            showAll={child.props.showAll}
          />
        </TabPane>
      );
    });
    return (
      <Spin spinning={loading} delay={0}>
        <Tabs size="small" className={styles.tabs} onChange={this.onTabChange}>
          {panes}
        </Tabs>
      </Spin>
    );
  }

  render() {
    const { className, count, popupAlign, popupVisible, onPopupVisibleChange, bell } = this.props;
    const noticeButtonClass = classNames(className, styles.noticeButton);
    const notificationBox = this.getNotificationBox();
    const NoticeBellIcon = bell || (
      <div style={{ position: 'relative', top: '-2px' }}>
        <BellOutlined
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
          className={styles.icon} />
        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>&nbsp;消息</span>
      </div>
    );
    const trigger = (
      <span style={{ display: 'block' }} className={noticeButtonClass}>
        <Badge count={count} offset={[5, 2]} overflowCount={99} className={styles.badge}>
          {NoticeBellIcon}
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }
    const popoverProps = {};
    if ('popupVisible' in this.props) {
      popoverProps.visible = popupVisible;
    }
    return (
      <Popover
        placement="topLeft"
        content={notificationBox}
        popupClassName={styles.popover}
        getPopupContainer={triggerNode => triggerNode}
        // trigger="click"
        trigger="hover"
        arrowPointAtCenter
        popupAlign={popupAlign}
        onVisibleChange={onPopupVisibleChange}
        {...popoverProps}
      >
        {trigger}
      </Popover>
    );
  }
}
