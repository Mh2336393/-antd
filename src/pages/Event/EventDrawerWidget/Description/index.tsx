import React from 'react';
import moment from 'moment';
import { Descriptions, Tag } from 'antd';
import styles from './index.less';

const LEVEL = {
  信息: '#54576A',
  低危: '#7f7f7f',
  中危: '#EB964B',
  高危: '#E06F00',
  严重: '#F5222D',
};

export interface IDescriptionInfoProp {
  wrapperStyle?: React.CSSProperties;
  asset_ip: string;
  level: number;
  app_proto: string;
  proto: string;
  alert_mode: string;
  suggestion: string;
  time: string;
}

const DescriptionInfo: React.FC<IDescriptionInfoProp> = ({
  wrapperStyle,
  asset_ip,
  level,
  app_proto,
  proto,
  alert_mode,
  suggestion,
  time,
}) => {
  function transformLevel(value) {
    switch (true) {
      case value > 0 && value <= 20:
        return '信息';
      case value > 20 && value <= 40:
        return '低危';
      case value > 40 && value <= 60:
        return '中危';
      case value > 60 && value <= 80:
        return '高危';
      case value > 80 && value <= 100:
        return '严重';
      default:
        return '信息';
    }
  }

  return (
    <div className={styles.wrapper} style={{ ...wrapperStyle }}>

      <div className={styles.content}>
        <Descriptions column={2}>
          <Descriptions.Item label="事件发生时间">
            {moment(time).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="资产IP">{asset_ip}</Descriptions.Item>
          <Descriptions.Item label="事件级别">
            {
              <Tag style={{ borderRadius: '1.2rem' }} color={LEVEL[transformLevel(level)]}>
                {transformLevel(level)}
              </Tag>
            }
          </Descriptions.Item>
          <Descriptions.Item label="应用层协议">{app_proto.toUpperCase()}</Descriptions.Item>
          <Descriptions.Item label="网络层协议">{proto.toUpperCase()}</Descriptions.Item>
          <Descriptions.Item label="告警模式">
            {alert_mode === 'threshold' ? '阈值告警' : '基线告警'}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div className={styles.content}>
        <Descriptions>
          <Descriptions.Item label="处置建议">{suggestion}</Descriptions.Item>
        </Descriptions>
      </div>

    </div>
  );
};

export default DescriptionInfo;
