import React from 'react';
import { Col } from 'antd';
import styles from './index.less';

const Title = ({ titleName }) => (
  <Col span={2} style={{ height: 44, lineHeight: '44px' }}>
    <h3 className={styles.titleStyle}>{titleName}</h3>
  </Col>
);

export default Title;
