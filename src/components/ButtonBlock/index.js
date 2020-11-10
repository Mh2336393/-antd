import React, { Component } from 'react';
import { Button, Pagination, message } from 'antd';
import styles from './index.less';
import configSettings from '../../configSettings';
/* eslint-disable react/no-array-index-key */
/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
class ButtonBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
    };
  }

  onChange = (page, pageSize) => {
    const { onPageChange } = this.props;
    this.setState({ page, pageSize });
    onPageChange(page, pageSize);
  };

  goTo = e => {
    const { hrefStr } = this.props;
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

  render() {
    const { btnList, total, bpage, bsize, hrefStr, hidePage } = this.props;
    // console.log('href', hrefStr);
    const showBtnList = btnList.filter(item => !item.hide);
    const { page, pageSize } = this.state;
    return (
      <div className={styles.wrapperStyle}>
        <div className={styles.btnGroup}>
          {showBtnList.map((item, index) => {
            if (item.label === '导出' && hrefStr) {
              return (
                <Button
                  href={hrefStr}
                  key={index}
                  onClick={this.goTo}
                  className={`${item.color === 'blue' ? 'smallBlueBtn' : 'smallWhiteBtn'} ${styles['btn-common']}`}
                >
                  导出
                </Button>
              );
            }
            if (item.label === '全部导出') {
              return (
                <Button
                  href={hrefStr}
                  key={index}
                  download
                  onClick={this.exportLog}
                  className={`${item.color === 'blue' ? 'smallBlueBtn' : 'smallWhiteBtn'} ${styles['btn-common']}`}
                >
                  全部导出
                </Button>
              );
            }
            return (
              <Button
                key={index}
                disabled={item.disabled}
                className={`${item.color === 'blue' ? 'smallBlueBtn' : 'smallWhiteBtn'} ${styles['btn-common']}`}
                onClick={item.func}
                loading={item.hasOwnProperty('loading') ? item.loading : false}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
        {!hidePage && (
          <Pagination
            style={{ marginRight: '11px' }}
            current={bpage || page}
            defaultPageSize={bsize || pageSize}
            pageSizeOptions={configSettings.pageSizeOptions}
            size="small"
            total={total}
            showTotal={totals => `( ${totals}项 )`}
            onChange={this.onChange}
            onShowSizeChange={this.onChange}
            showSizeChanger
            showQuickJumper
          />
        )}
      </div>
    );
  }
}

export default ButtonBlock;
