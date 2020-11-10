import React, { PureComponent } from 'react';
import { Link } from 'umi';
import { Spin } from 'antd';
import RightContent from '../GlobalHeader/RightContent';
import BaseMenu from '../SiderMenu/BaseMenu';
import { getFlatMenuKeys } from '../SiderMenu/SiderMenuUtils';
import styles from './index.less';
// import { title } from '../../defaultSettings';

/* eslint-disable camelcase */

export default class TopNavHeader extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maxWidth: undefined,
    };
  }

  static getDerivedStateFromProps(props) {
    return {
      maxWidth: (props.contentWidth === 'Fixed' ? 1200 : window.innerWidth) - 480 - 165 - 40,
    };
  }

  render() {
    const { theme, contentWidth, menuData, logo, webName } = this.props;
    const { maxWidth } = this.state;
    const flatMenuKeys = getFlatMenuKeys(menuData);
    // console.log("xxx", this.props);
    return (
      <div className={`${styles.head} ${theme === 'light' ? styles.light : ''}`}>
        <div
          ref={(ref) => {
            this.maim = ref;
          }}
          className={`${styles.main} ${contentWidth === 'Fixed' ? styles.wide : ''}`}
        >
          <div className={styles.left}>
            <div className={styles.logo} key="logo" id="logo">
              <Link to="/">
                {logo ? (
                  <div className={styles.logoImg} style={{ backgroundImage: `url(${logo})` }} />
                ) : (
                  <Spin />
                )}
                <h1>{webName}</h1>
              </Link>
            </div>
            <div
              style={{
                maxWidth: maxWidth > 586 ? maxWidth : 586,
                minWidth: 586,
              }}
            >
              <BaseMenu {...this.props} flatMenuKeys={flatMenuKeys} className={styles.menu} />
            </div>
          </div>
          <RightContent {...this.props} />
        </div>
      </div>
    );
  }
}
