import React, { Component } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import ButtonListBlock from '../ButtonListBlock';
import configSettings from '../../configSettings';
import styles from './index.less';
/**
 * 1. 操作button
 * 2. Table
 */
const { pageSizeOptions } = configSettings;

class CommonTable extends Component {



  handleTableChange = (pagination, filters, sorter) => {
    // debugger
    const {
      tableProps: { page, pageSize },
    } = this.props;
    const { current, pageSize: currentPageSize } = pagination;
    console.log(currentPageSize)
    // console.log("current::", current, "  pageSize::",pageSize);
    //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
    const changePart = {
      filters
    };
    if (current !== page || pageSize !== currentPageSize) {
      changePart.page = current
      changePart.pageSize = currentPageSize
    } else {
      const { field, order } = sorter;
      if (field) {
        if (order) {
          changePart.dir = order.slice(0, -3)
        } else {
          changePart.dir = ''
        }

        changePart.sort = field
        changePart.page = 1
      }

    }
    // const newObj = Object.assign({}, table, changePart);
    if (this.props.tableProps && this.props.tableProps.handleTableChange) {
      this.props.tableProps.handleTableChange(changePart);
    }
  };

  renderOperationExtra = () => {
    const {
      operationProps: { extra },
    } = this.props;
    if (extra.toString() === '[object Object]' || typeof extra === 'string') {
      return <div>{extra}</div>;
    }
    if (typeof extra === 'function') {
      return extra();
    }
  };


  render() {
    const { tableProps, operationProps, wrapperClass } = this.props;
    const { checkAllBlock } = tableProps;
    return (
      <div>
        <div className={`TableTdPaddingWrap ${wrapperClass}`}>
          <div className={styles.handleBar}>
            {operationProps.btnList && <ButtonListBlock btnList={operationProps.btnList} wrapperStyle={{ margin: 0 }} />}
            {operationProps.extra && this.renderOperationExtra()}
          </div>
          {checkAllBlock && checkAllBlock.selectedNum > 0 && (
            <div className={styles.selectBlock}>
              <ExclamationCircleOutlined
                style={{
                  color: '#2662EE',
                  marginRight: 14,
                }} />
              <span style={{ marginRight: 16 }}>
                已选择
                <span className={styles.fontBlue} style={{ margin: '0 4px' }}>
                  {checkAllBlock.selectedNum}
                </span>
                项
              </span>
              <span className={styles.fontBlue} style={{ cursor: 'pointer' }} onClick={checkAllBlock.checkAll}>
                选中全部
              </span>
              <span className="divider" />
              <span className={styles.fontBlue} style={{ cursor: 'pointer' }} onClick={checkAllBlock.cancelCheck}>
                取消勾选
              </span>
            </div>
          )}
          {tableProps && (
            <div style={{ width: "100%" }}>
              {
                tableProps.showFlag ? (<Table
                  style={{ width: "100%" }}
                  rowKey={tableProps.rowKey}
                  loading={tableProps.loading}
                  bordered={!!tableProps.bordered}
                  components={tableProps.components}
                  rowSelection={tableProps.rowSelection || null}
                  scroll={{ x: tableProps.tableScrollX || true }}
                  pagination={{
                    showSizeChanger: true,
                    pageSize: tableProps.pageSize,
                    current: tableProps.page,
                    total: tableProps.data.total,
                    pageSizeOptions:['20', '50', '100','200'],
                    showQuickJumper: true,
                    showTotal: total => `（${total}项）`,
                  }}
                  columns={tableProps.columns}
                  dataSource={tableProps.data.list}
                  size={tableProps.size || 'middle'}
                  onChange={this.handleTableChange}
                />) : (
                    <Table
                      style={{ width: "100%" }}
                      rowKey={tableProps.rowKey}
                      loading={tableProps.loading}
                      bordered={!!tableProps.bordered}
                      rowSelection={tableProps.rowSelection || null}
                      scroll={{ x: tableProps.tableScrollX || true }}
                      pagination={{
                        showSizeChanger: true,
                        pageSize: tableProps.pageSize,
                        current: tableProps.page,
                        total: tableProps.data.total,
                        pageSizeOptions,
                        showQuickJumper: true,
                        showTotal: total => `（${total}项）`,
                      }}
                      columns={tableProps.columns}
                      dataSource={tableProps.data.list}
                      size={tableProps.size || 'middle'}
                      onChange={this.handleTableChange}
                    />)
              }
              {tableProps.data.gt10000 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span>页面最多展示10000条数据</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CommonTable;
