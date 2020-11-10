import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import styles from './index.less';
import { IEventByte } from '../interface/event';
import { bytesToSize } from '@/utils/utils';

const moment = require('moment');

export interface IDataSource {
  [key: string]: {
    [key: string]: IEventByte;
  };
}
export interface IAssetInfoProp {
  wrapperStyle?: React.CSSProperties;
  dataSource: IDataSource;
  asset_ip: string;
  app_proto: string;
  timestamp: string;
}

const AssetInfo: React.FC<IAssetInfoProp> = ({
  wrapperStyle,
  dataSource,
  asset_ip,
  app_proto,
  timestamp
}) => {

  const [more, setLoadMore] = useState<boolean>(false);// 是否展示显示全部按钮
  const [PackUpMore, setPackUpMore] = useState<boolean>(false);// 是否展示收起按钮

  useEffect(() => {
    // 数量大于十，默认展示 显示全部按钮，
    // 数量小于等于10 默认按钮全部不展示
    if (Object.keys(dataSource).length > 10) {
      setLoadMore(true)
      setPackUpMore(false)
    } else {
      setLoadMore(false)
      setPackUpMore(false)
    }
  }, [JSON.stringify(dataSource)]);

  function toLink(ip): string {
    // 除了ICMP都是app_proto，ICMP是proto
    const condition = `(${app_proto.toLowerCase() === 'icmp' ? "proto" : "app_proto"}:${app_proto.toLowerCase() === 'icmp' ? app_proto.toUpperCase() : app_proto.toLowerCase()}) AND ((src_ip:${asset_ip} AND dst_ip:${ip}) OR (src_ip:${ip} AND dst_ip:${asset_ip}))`;
    const linkHref = `/analysis/search?startTime=${moment(timestamp).subtract(60, 'minutes').valueOf()}&endTime=${moment(timestamp).valueOf()}&type=flow&condition=${condition}`;
    return linkHref
  }

  function renderContent() {
    let keys = Object.keys(dataSource).sort((key_a, key_b) => {
      return dataSource[key_b]?.['1h']?.bytes_out - dataSource[key_a]?.['1h']?.bytes_out
    });
    // 显示展示全部按钮得时候，数据splice到10长度
    if (more) {
      keys = keys.splice(0, 10);
    }
    return keys.map(key => {
      return (
        <tr className={styles.list_title}>
          <td>{key}</td>
          <td> <Button type="link" target="_blank" href={toLink(key)} className={styles.title}>{bytesToSize(dataSource[key]?.['1h']?.bytes_out)}</Button> </td>
        </tr>
      );
    });
  }

  function getTotalBytesout(): number {
    const sources = Object.keys(dataSource).map(key => {
      return dataSource[key]?.['1h']?.bytes_out;
    });

    if (sources.length) {
      return sources.reduce((prev, next) => {
        return prev + next;
      });
    }

    return 0;
  }

  function getTotalFps(): number {
    const sources = Object.keys(dataSource).map(key => {
      return dataSource[key]?.['1h']?.fps;
    });
    if (sources.length) {
      return sources.reduce((prev, next) => {
        return prev + next;
      });
    }
    return 0;
  }
  return (
    <div className={styles.wrapper} style={{ ...wrapperStyle }}>
      <header className={styles.header}>
        <span className={styles.title}>{`一小时内共${Object.keys(dataSource).length}个IP连接相关资产 ${asset_ip}， `}</span>
        <p className={styles.desc}>
          资产上行数据流量总计<em className={styles.green}>{bytesToSize(getTotalBytesout())}</em>，
          HTTP 会话频次为<em className={styles.green}>{getTotalFps() ?? '0'}</em>/s
        </p>
        {more && (
          <a
            className={styles.link}
            onClick={() => {
              setLoadMore(false);
              setPackUpMore(true);
            }}
          >
            显示全部
          </a>
        )}
        {PackUpMore && (
          <a
            className={styles.link}
            onClick={() => {
              setLoadMore(true);
              setPackUpMore(false);
            }}
          >
            收起
          </a>

        )}
      </header>
      <table className={styles.content}>
        <thead>
          <tr>
            <td>一小时上行流量TOP10</td>
            <td>流量大小</td>
          </tr>
        </thead>
        <tbody>{renderContent()}</tbody>
      </table>
    </div>
  );
};

export default AssetInfo;
