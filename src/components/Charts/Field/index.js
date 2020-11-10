import React from 'react';

import styles from './index.less';

const Field = ({ label, valueStyle, value, ...rest }) => (
  <div className={styles.field} {...rest}>
    <span>{label}</span>
    <span style={valueStyle || {}}>{value}</span>
  </div>
);

export default Field;
