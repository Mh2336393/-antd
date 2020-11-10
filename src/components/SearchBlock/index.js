import React, { Component } from 'react';
import { Button, message, Input } from 'antd';
import styles from './index.less';
// import configSettings from '../../configSettings';
/* eslint-disable react/no-array-index-key */
/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
const { Search } = Input;
class SearchBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  goTo = e => {
    const { hrefStr } = this.props;
    console.log('href', hrefStr);
    if (!hrefStr.split('=')[1]) {
      e.preventDefault();
      message.info('请选择导出的行');
      return false;
    }
    return true;
  };

  exportLog = e => {
    const { hrefStr, dataLen } = this.props;
    console.log('log', hrefStr, dataLen);
    if (dataLen === 0) {
      e.preventDefault();
      message.info('无数据导出');
      return false;
    }
    return true;
  };

  searchChange = e => {
    let { value } = e.target;
    value = value.trim();
    const { searchChange } = this.props;
    if (searchChange) {
      searchChange(value);
      this.input.input.input.value = value;
    }
  };

  render() {
    const { btnList, hrefStr, hideSearch, placeholder, searchStyle = {}, onSearchFn, roleAuthority } = this.props;
    const iniSearchStyle = { width: 250, ...searchStyle };

    let btnsAuthState = true;
    if (roleAuthority) {
      btnsAuthState = roleAuthority.indexOf('w') > -1;
    }

    return (
      <div
        style={{
          margin: '0 0 12px 0',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div className={styles.btnGroup}>
          {btnList.map((item, index) => {
            if (btnsAuthState || item.auth) {
              if (item.label === '导出' && hrefStr) {
                return (
                  <Button key={index} href={hrefStr} onClick={this.goTo} className="smallWhiteBtn">
                    导出
                  </Button>
                );
              }
              if (item.label === '全部导出') {
                return (
                  <Button key={index} href={hrefStr} download onClick={this.exportLog} className="smallWhiteBtn">
                    全部导出
                  </Button>
                );
              }
              return (
                <Button
                  key={index}
                  // type={item.type || 'default'}
                  className={`${item.color === 'blue' ? 'smallBlueBtn' : 'smallWhiteBtn'} ${styles['btn-common']}`}
                  onClick={item.func}
                  disabled={item.disabled || false}
                >
                  {item.label}
                </Button>
              );
            }
            return null;
          })}
        </div>
        {!hideSearch && (
          <Search
            ref={node => {
              this.input = node;
            }}
            style={iniSearchStyle}
            placeholder={placeholder || ''}
            onChange={this.searchChange}
            onSearch={value => {
              onSearchFn(value);
            }}
          />
        )}
      </div>
    );
  }
}

export default SearchBlock;
