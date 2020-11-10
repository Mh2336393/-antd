import React from 'react';
import styles from './index.less';

export interface IHeaderProp {
  ip: string;
  threshold: number;
  actual_value: number;
  over_range: number;
  app_proto: string;
}

function calculateTextStyle(over_range) {
  const range = (over_range * 100).toFixed(2) as any;
  let textStyle;
  if (range > 0 && range <= 20) {
    textStyle = styles.textRange_0;
  } else if (range > 20 && range <= 50) {
    textStyle = styles.textRange_1;
  } else if (range > 50 && range <= 75) {
    textStyle = styles.textRange_2;
  } else {
    textStyle = styles.textRange_3;
  }
  return textStyle
}


const Header: React.FC<IHeaderProp> = ({ ip, threshold, actual_value, over_range,  app_proto }) => {
  return (
    <div className={styles.wrapper}>

      <h3>
        资产
        <span>
          {`${ip} ${app_proto}`}
        </span>
        上行流量阈值配置：<em className={styles.green}>{ (threshold/300).toFixed(2) }</em>bps，
        实际流量：<em className={styles.green}>{(actual_value/300).toFixed(2)}</em>bps，
        超出阈值：<em className={calculateTextStyle(over_range)}>{(over_range * 100).toFixed(2)}%</em>
      </h3>

      <div className={styles.content}>

        <div className={styles.content_box}>
          <div className={styles.icon_wrapper}>
            <i className={styles.ycyz}></i>
          </div>
          <div className={styles.content_body}>
            <h3 className={styles.box_title}>预测阈值</h3>
            <p className={styles.box_item}>{(threshold/300).toFixed(2)} bps</p>
          </div>
        </div>

        <div className={styles.content_box}>
          <div className={styles.icon_wrapper}>
            <i className={styles.sjz}></i>
          </div>
          <div className={styles.content_body}>
            <h3 className={styles.box_title}>实际值</h3>
            <p className={styles.box_item}>{(actual_value/300).toFixed(2)} bps</p>
          </div>
        </div>

        <div className={styles.content_box}>
          <div className={styles.icon_wrapper}>
            <i className={styles.plcd}></i>
          </div>
          <div className={styles.content_body}>
            <h3 className={styles.box_title}>偏离程度</h3>
            <p className={`${styles.box_item} ${calculateTextStyle(over_range)}`}>
              {(over_range * 100).toFixed(2)}%
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Header;

