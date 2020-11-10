/* eslint-disable react/require-default-props */
/* eslint-disable react/no-array-index-key */
/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint-disable array-callback-return */
import React, { Component } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button, Menu, Dropdown } from 'antd';
import PropTypes from 'prop-types';
import styles from './index.less';

class ButtonListBlock extends Component {
  static defaultProps = {
    btnList: [],
    mode: 'ant',
  };

  static propTypes = {
    btnList: PropTypes.array,
    btnStyle: PropTypes.object,
    wrapperStyle: PropTypes.object,
    mode: PropTypes.string,
  };

  getMenuList = ({ menu = [], selectedKeys = [], func }) => (
    <Menu onClick={func} selectedKeys={selectedKeys}>
      {menu.map(item => (
        <Menu.Item key={item.key} disabled={item.disable}>
          {item.type === 'link' ? <a href={item.href}>{item.value}</a> : item.value}
        </Menu.Item>
      ))}
    </Menu>
  );

  render() {
    const { btnList, btnStyle, wrapperStyle } = this.props;
    const showBtnList = btnList.filter(item => !item.hide);
    return (
      <div className={styles.wrapperStyle}>
        {showBtnList.length > 0 && (
          <div className={styles.btnGroup} style={wrapperStyle}>
            {showBtnList.map((item, index) => {
              if (item.label === '导出' || item.label === '全部导出') {
                return (
                  <Button
                    key={index}
                    className={`${item.color === 'blue' ? 'smallBlueBtn' : 'smallWhiteBtn'} ${styles['btn-common']}`}
                    onClick={item.func}
                    disabled={item.disabled || false}
                    loading={item.loading}
                  >
                    {item.label}
                  </Button>
                );
              }
              if (item.type === 'dropDown') {
                return (
                  <Dropdown overlay={this.getMenuList(item)} key={index} disabled={item.disabled || false}>
                    <Button
                      className={`${item.color === 'white' ? 'smallWhiteBtn' : 'smallBlueBtn'} ${styles['btn-common']}`}
                      style={btnStyle}
                    >
                      {item.label}
                      <DownOutlined />
                    </Button>
                  </Dropdown>
                );
              }
              if (item.customRender) {
                return item.customRender();
              }
              return (
                <Button
                  key={index}
                  className={`${
                    item.color === 'blue' ? 'smallBlueBtn' : 'smallWhiteBtn' // type={item.type || 'default'}
                  } ${styles['btn-common']}`}
                  onClick={item.func}
                  disabled={item.disabled || false}
                  loading={item.loading}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default ButtonListBlock;
