import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { Link } from 'umi';

const CommonDetailHeader = React.memo((props) => {
  const { url, title, ...rest } = props;
  // console.log('rest::', rest);
  return (
    <div className="commonDetailHeader">
      <LeftOutlined style={{ color: '#3369D9' }} />
      &nbsp;
      <Link to={url} style={{ color: '#3369D9' }} {...rest}>
        返回
      </Link>
      <span className="divider" />
      <span>{title}</span>
    </div>
  );
});
export default CommonDetailHeader;
