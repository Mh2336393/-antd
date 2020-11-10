import React, { useEffect } from 'react';
import { Card, Skeleton, Spin } from 'antd';
import { connect} from 'umi';
import SceneDetailsModal from '@/pages/Tactics/components/SceneDetailsModal';
import styles from './index.less';

const { Meta } = Card;

export interface IAssetStatusProp {
  dispatch: any;
  wrapperStyle?: React.CSSProperties;
  asset_ip?: string;
  scene?: string;
  alertMode?: string;
  ccsName?: string;
  eventAnalysis: any;
  loading: boolean;
}

const AssetStatus: React.FC<IAssetStatusProp> = ({
  dispatch,
  wrapperStyle,
  asset_ip,
  scene,
  alertMode,
  ccsName,
  eventAnalysis,
  loading,
}) => {
  useEffect(() => {
    dispatch({
      type: 'eventAnalysis/getAssetStatus',
      payload: {
        ip: asset_ip,
        ai_scene: scene || 'http_transport_abnormal',
        ccsName
      },
    });
  }, []);

  const { assetStatus: data } = eventAnalysis;
  const sceneNameArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)']?.split(','); // 场景值数组
  const statusArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fstatus)']?.split(','); // 状态值数组
  const thresholdArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fthreshold/300)']?.split(','); // 阈值数组
  const statusReasonArr =
    data['GROUP_CONCAT(t_ai_ip_scene_config.Fstatus_reason)']?.split(',') || [];
  const groupConcatFstartTime =
    data['GROUP_CONCAT(t_ai_ip_scene_config.Fstart_time)']?.split(',') || []; // 开始时间数组
  const groupConcatFendTime =
    data['GROUP_CONCAT(t_ai_ip_scene_config.Fend_time)']?.split(',') || []; // 结束时间数组
  const startTimeArr = groupConcatFstartTime;
  const endTimeArr = groupConcatFendTime;

  const idx =
    sceneNameArr &&
    sceneNameArr.findIndex(sceneName => {
      return sceneName.includes(scene);
    });

  function calculateTheTitle() {
    let title = '';
    if (scene === 'http_abnormal_transport') {
      title = 'HTTP异常数据传输';
    } else if (scene === 'dns_hidden_tunnel') {
      title = 'DNS隐蔽隧道通信';
    } else if (scene === 'icmp_hidden_tunnel') {
      title = 'ICMP隐蔽隧道通信';
    } else if (scene === 'rdp_abnormal_transport') {
      title = 'RDP异常数据下载';
    } else if (scene === 'ssh_abnormal_transport') {
      title = 'SSH数据泄密';
    }
    // 自定义测算
    if (alertMode === 'threshold') {
      title += ' - 自定义阈值测算';
    }
    // ai 测算
    else if (alertMode === 'ai_baseline') {
      title += ' - AI阈值测算';
    }
    return title;
  }

  if (loading) {
    return (
      <div className={styles.wrapper} style={{ ...wrapperStyle }}>
        <header className={styles.header}>告警资产当前分析状态</header>
        <Spin />
      </div>
    );
  }
  // SceneDetailsModal 组件只会在componentDidMount发一次请求,null undefined 这些参数不要传过去!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  return (
    <div className={styles.wrapper} style={{ ...wrapperStyle }}>
      <header className={styles.header}>告警资产当前分析状态</header>
      <div className={styles.content}>
        {JSON.stringify(data) !== '{}' ? (
          <div>
            {
              data.Fip && sceneNameArr[idx] && statusArr[idx] && (
                <SceneDetailsModal
                  alertMode={alertMode}
                  sceneName={sceneNameArr?.[idx]}
                  status={statusArr?.[idx]}
                  threshold={Number(thresholdArr?.[idx])}
                  statusReason={statusReasonArr?.[idx] || ''}
                  Fip={data.Fip}
                  startTime={startTimeArr?.[idx]}
                  endTime={endTimeArr?.[idx]}
                  cardStyle={{ width: '100%' }}
                  headStyle={{ borderRadius: 0 }}
                  chartWidth={900}
                  ccsName={ccsName}
                />
              )
            }
          </div>
        ) : (
            <Card
              className="sceneDetailsCardBox"
              title={
                <Skeleton loading={false}>
                  <Meta
                    style={{ textAlign: 'left' }}
                    title={calculateTheTitle()}
                    description="当前状态：未开启"
                  />
                </Skeleton>
              }
              headStyle={{ backgroundColor: '#DCDEE3', borderRadius: 0 }}
              extra={
                <div className="bg">
                  <span className="des" style={{ color: '#999999' }}>
                    未开启
                </span>
                </div>
              }
            ></Card>
          )}
      </div>
    </div>
  );
};

export default connect(({ eventAnalysis, loading }) => ({
  eventAnalysis,
  loading: loading.effects['eventAnalysis/fetchFilterCount'],
}))(AssetStatus);
