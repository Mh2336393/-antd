import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import styles from './index.less';

// export default function QuotaTips({ title, subtitle, wrapperStyle }) {
//   const [currTitle] = useState(title);
//   const [currSubtitle] = useState(subtitle);

//   return (
//     <span className={styles.quota_tips_wrapper} style={{ ...wrapperStyle }}>
//       <span style={{ marginRight: '5px' }}>{currTitle}</span>
//       <Tooltip title={currSubtitle}>
//         <Icon className="fontBlue" type="question-circle" theme="filled" />
//       </Tooltip>
//     </span>
//   );
// }

class QuotaTips extends PureComponent {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const { title, subtitle, wrapperStyle } = this.props;
    return (
      <span className={styles.quota_tips_wrapper} style={{ ...wrapperStyle }}>
        <span style={{ marginRight: '5px' }}>{title}</span>
        <Tooltip title={subtitle}>
          <QuestionCircleFilled className="fontBlue" />
        </Tooltip>
      </span>
    );
  }
}

export default QuotaTips;

QuotaTips.defaultProps = {
  title: '',
  subtitle: '',
  wrapperStyle: {
    padding: 0,
    margin: 0,
  },
};

QuotaTips.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  wrapperStyle: PropTypes.object,
};
