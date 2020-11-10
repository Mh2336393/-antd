import React, { PureComponent } from 'react';
import { connect } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import { Table, Pagination, Row, Col, Divider } from 'antd';
import styles from './FiledAllRanges.less';

const format = 'YYYY-MM-DD HH:mm:ss';
@connect(({ search: { esFieldRanges } }) => ({
  esFieldRanges,
}))
class FieldAllRanges extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      pageSize: 10,
    };
  }

  pageOnchange = (page) => {
    this.setState({ page });
  };

  render() {
    const {
      esFieldRanges,
      field,
      logIndex,
      searchState,
      timeStart,
      timeEnd,
      columns,
      back,
    } = this.props;
    const { page, pageSize } = this.state;
    const { buckets } = esFieldRanges[field];
    return (
      <div style={{ background: '#eceff5' }}>
        <div className={styles.headWraper}>
          <div className={styles['headWraper-name']}>
            <span onClick={back}>
              <LeftOutlined />
              &nbsp; 返回
            </span>
            <Divider type="vertical" />
            <span>{field} 字段</span>
          </div>
          <div className={styles['headWraper-content']}>
            <Row gutter={16} className={styles['headWraper-content-row']}>
              <Col span={2} className={styles['headWraper-content-box']}>
                <div>日志范围：</div>
              </Col>
              <Col span={18}>
                <div className="gutter-box">{logIndex}</div>
              </Col>
            </Row>
            <Row gutter={16} className={styles['headWraper-content-row']}>
              <Col span={2} className={styles['headWraper-content-box']}>
                <div>搜索语句：</div>
              </Col>
              <Col span={18}>
                <div className="gutter-box">{searchState}</div>
              </Col>
            </Row>
            <Row gutter={16} className={styles['headWraper-content-row']}>
              <Col span={2} className={styles['headWraper-content-box']}>
                <div>时间：</div>
              </Col>
              <Col span={18}>
                <div className="gutter-box">
                  {timeStart.format(format)}
                  &nbsp;至&nbsp;
                  {timeEnd.format(format)}
                </div>
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.tableWraper}>
          <div className={styles['tableWraper-header']}>
            <Pagination
              style={{ float: 'right', marginRight: '11px' }}
              current={page}
              defaultPageSize={pageSize}
              size="small"
              total={buckets.length}
              onChange={this.pageOnchange}
              onShowSizeChange={(current, size) => {
                this.setState({ pageSize: size });
              }}
              showSizeChanger
              showQuickJumper
            />
          </div>
          <div style={{ padding: '0 20px' }}>
            <Table
              pagination={{
                current: page,
                total: buckets.length,
                pageSize,
                onChange: this.pageOnchange,
              }}
              columns={columns}
              dataSource={buckets}
              size="middle"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FieldAllRanges;
