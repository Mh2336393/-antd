import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { DownOutlined } from '@ant-design/icons';
import { Descriptions, Popover, Tag } from 'antd';
import styles from './index.less';

const IconMap = require('./assets/apps.json');

interface IAssetDiscoverPanel {
  Fhost_name: string,
  Fdomain_name: string,
  Fport: Iport[],
  Fos_type: string,
  Finsert_time: string,
  Fupdate_time: string,
  Fcomponent_info: ComponentInfo[]
}

export interface Iport {
  Fport: number;
  Frisk_level: number;
  Fservice: string;
  Fstatement: string;
  color: string;
  level: string;
}

export interface ComponentInfo {
  [x: string]: any;
  name: string;
  version: string;
}

export type IPortPanelProperty = {
  height: string | number;
  overflow: string;
  marginTop: string | number;
};

const AssetDiscoverPanel: React.FC<IAssetDiscoverPanel> = ({
  Fhost_name,
  Fdomain_name,
  Fport,
  Fos_type,
  Finsert_time,
  Fupdate_time = "",
  Fcomponent_info = [] }) => {
  const [portPanelProperty, setPortPanelProperty] = useState<IPortPanelProperty>({
    height: 24,
    overflow: 'hidden',
    marginTop: 0
  });
  const [showMore, setShowMore] = useState<boolean>(false);

  function renderPopContent(port: Iport) {
    return (
      <Descriptions size="small" className={styles.popover_wrapper} column={1}>
        <Descriptions.Item label="端口号">{port?.Fport}</Descriptions.Item>
        <Descriptions.Item label="安全等级">
          <p style={{ color: port?.color, fontSize: 12 }}>{port?.level}</p>
        </Descriptions.Item>
        <Descriptions.Item label="服务信息">{port?.Fservice}</Descriptions.Item>
      </Descriptions>
    );
  }

  useEffect(() => {
    if (showMore) {
      setPortPanelProperty({
        height: "auto",
        overflow: '',
        marginTop: 8
      });
    }
  }, [showMore]);

  function renderPort(ports: Iport[]) {
    return (
      <div className={styles.port_panel} style={{ ...portPanelProperty }}>
        {ports?.map(item => {
          return (
            <Popover
              key={item.Fport}
              content={renderPopContent(item)}
              trigger="hover"
              placement="bottom"
            >
              <div className={styles.port_wrapper} style={{ border: `1px solid ${item.color}` }}>
                <p className={styles.port}>{item.Fport}</p>
                <div className={styles.port_message} style={{ background: item.color }}>
                  {item.level}
                </div>
              </div>
            </Popover>
          );
        })}
        {ports?.length > 6 && !showMore ? (
          <DownOutlined
            className={styles.port_arrow_down}
            onClick={() => {
              setShowMore(true);
            }} />
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Descriptions title="资产识别信息" size="middle" column={3} bordered>
        <Descriptions.Item label="主机名" span={1}>
          {Fhost_name}
        </Descriptions.Item>
        <Descriptions.Item label="资产域名" span={2}>
          {Fdomain_name}
        </Descriptions.Item>
        <Descriptions.Item label="开放端口号" span={3}>
          {renderPort(Fport)}
        </Descriptions.Item>
        <Descriptions.Item label="操作系统" span={3}>
          <p style={{width:750}}>
            {Fos_type
              ? Fos_type?.split(',')
                .filter(item => item)
                .join(',')
              : ''}
          </p>
        </Descriptions.Item>
        <Descriptions.Item label="发现时间" span={1.5}>
          {moment(Finsert_time).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间" span={1.5}>
          {moment(Fupdate_time).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="组件信息" span={3}>
          <div className={styles.component_wrapper}>
            {Fcomponent_info.map(item => {
              return (
                (item !== "") ? (<div className={styles.component}>
                  {IconMap.apps[(item.split(":")[0])] ? (
                    <img
                      alt=""
                      src={require(`./assets/icons/${IconMap.apps[(item.split(":")[0])].icon}`)}
                      width="18"
                      height="18"
                      style={{ marginRight: 8 }}
                    />
                  ) : null}
                  <p className={styles.component_title}>{(item.split(":")[0])}</p>
                  {(item.split(":")[1]) ? (
                    <Tag className={styles.component_version}>{(item.split(":")[1])}</Tag>
                  ) : null}
                </div>) : ("")
              );
            })}
          </div>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default AssetDiscoverPanel
