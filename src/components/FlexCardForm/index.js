import React from 'react';
import { Row, Col } from 'antd';
import CardWrap from './CardWrap';
// import styles from './index.less';

const FlexCardForm = React.memo(props => {
  const { formList, data, onSave, disabled = false, col = 6, gutter = 0 } = props;
  return (
    <Row gutter={gutter}>
      {formList.map((item, idx) => (
        <Col span={24 / col} key={idx}>
          <CardWrap
            disabled={disabled || item.disabled}
            data={item}
            defaultValue={data[item.key]}
            onSave={onSave}
            footerType={item.footerType}
            wrapstyle={props.wrapstyle}
          />
        </Col>
      ))}
    </Row>
  );
});

export default FlexCardForm;
