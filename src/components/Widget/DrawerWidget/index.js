import React, { Component } from 'react';
// import React, { Component, Fragment } from 'react';
import { Drawer } from 'antd';
import styles from './index.less';

class DrawerWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { contentStyle, onClose, width = 800, title = '', visible, children } = this.props;
    return (
      <Drawer
        onClose={onClose}
        className={styles.drawer_widget}
        destroyOnClose
        width={width}
        title={title}
        visible={visible}
      >
        <div className={styles.drawer_content} style={{ ...contentStyle }}>
          {children}
        </div>
      </Drawer>
    );
  }
}
export default DrawerWidget;
