/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import { connect} from 'umi';
import { Row, Col, Button, Popover } from 'antd';
import authority from '@/utils/authority';
const { getAuth } = authority
import styles from './index.less';
import AdvancedAnalysisAssetsModal from '@/pages/Tactics/components/AdvancedAnalysisAssetsModal';
import SceneDetailsModal from '@/pages/Tactics/components/SceneDetailsModal';
import LineChart, { IColor } from '../../LineChart';
import CardPanel from '../../CardPanel';

interface IAnalysisBlockProp {
  asset?: any;
  dispatch?: any;
  auth: string;
  startTime: number;
  endTime: number;
  time: string;
}

const AnalysisBlock: React.FC<IAnalysisBlockProp> = ({ asset, dispatch, auth, startTime, endTime, time }) => {
  const data = asset.safe.analysisList.list.length && asset.safe.analysisList.list[0];
  const [visible, setVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加高级分析资产');
  const [mode, setMode] = useState('add');


  const panels = [
    {
      title: `HTTP数据传输异常${data?.Falert_mode === 'threshold' ? '阈值分析' : '基线分析'}`,
      type: 'http',
      component: renderChart(asset.statics?.http?.rows, true, 'http')
    },
    {
      title: `ICMP隐蔽隧道通信${data?.Falert_mode === 'threshold' ? '阈值分析' : '基线分析'}`,
      type: 'icmp',
      component: renderChart(asset.statics?.icmp?.rows, true, 'icmp'),
    },
    {
      title: `DNS隐蔽隧道通信${data?.Falert_mode === 'threshold' ? '阈值分析' : '基线分析'}`,
      type: 'dns',
      component: renderChart(asset.statics?.dns?.rows, true, 'dns')
    },
    {
      title: `SSH数据泄密${data?.Falert_mode === 'threshold' ? '阈值分析' : '基线分析'}`,
      type: 'ssh',
      component: renderChart(asset.statics?.ssh?.rows, true, 'ssh')
    },
    {
      title: `RDP异常文件下载${data?.Falert_mode === 'threshold' ? '阈值分析' : '基线分析'}`,
      type: 'rdp',
      component: renderChart(asset.statics?.rdp?.rows, true, 'rdp')
    },
  ];
  const advancedAnalysisAuth = getAuth('/event/analysis');


  function renderChart(dataSource, legend: boolean, color?: IColor) {
    // 找到对应的场景值索引
    const sceneNameArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)']?.split(',') || []; // 场景值数组
    if (!sceneNameArr.length) return null
    const idx = sceneNameArr.findIndex(sceneName => {
      return sceneName.includes(color);
    });
    const thresholdArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fthreshold/300)']?.split(','); // 阈值数组
    return (
      <LineChart
        moduleName="基线分析"
        color={color}
        tickCount={5}
        format="MM/DD HH:mm"
        height={200}
        thresholdValue={Number(thresholdArr[idx])}
        Falert_mode={data?.Falert_mode}
        dataSource={
          dataSource?.map(item => {
            if (legend) {
              return {
                time: item.time,
                count: item.sum,
                type: item.type,
                formatTime: item.formatTime
              };
            }
            return {
              time: item.time,
              count: item.sum,
            };
          }) ?? []
        }

      />
    );
  }

  const handleAssetsAnalysisModeVisiable = (modeType = 'add') => {
    if (modeType === 'edit') {
      setModalTitle('编辑测算模式');
    }
    setMode(modeType);
    setVisible(true);
  };

  const handleViewTheResults = record => {
    const path = `/event/analysis?asset_ip=${record.Fip}`;
    window.open(path);
  };

  const renderAnalysis = () => {
    const sceneNameArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)']?.split(',') || []; // 场景值数组
    const statusArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fstatus)']?.split(',') || []; // 状态值数组
    const thresholdArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fthreshold/300)']?.split(','); // 阈值数组
    const statusReasonArr = data['GROUP_CONCAT(t_ai_ip_scene_config.Fstatus_reason)']?.split(',') || [];
    const groupConcatFstartTime = data['GROUP_CONCAT(t_ai_ip_scene_config.Fstart_time)']?.split(',') || []; // 开始时间数组
    const groupConcatFendTime = data['GROUP_CONCAT(t_ai_ip_scene_config.Fend_time)']?.split(',') || []; // 结束时间数组
    const startTimeArr = groupConcatFstartTime
    const endTimeArr = groupConcatFendTime
    const alertMode = data?.Falert_mode;
    return (
      <div className={styles.analysis_content}>
        {asset.safe.analysisList.total ? (
          <div className={styles.status_block}>
            <div>
              <div className={styles.header_left}>
                {data.Falert_mode === 'threshold' && (
                  <React.Fragment>
                    <div className={styles.custom} />
                    <span style={{ marginLeft: '5px' }}>阈值测算</span>
                  </React.Fragment>
                )}
                {data.Falert_mode === 'ai_baseline' && (
                  <React.Fragment>
                    <div className={styles.ai} />
                    <span style={{ marginLeft: '5px' }}>AI测算</span>
                  </React.Fragment>
                )}
                {data.Falert_mode === 'observe' && (
                  <React.Fragment>
                    <div className={styles.observe} />
                    <span style={{ marginLeft: '5px' }}>观察模式</span>
                  </React.Fragment>
                )}
              </div>

              <div className={styles.header_right}>
                已开启
                <span style={{ color: '#219C77', margin: '0px 2px' }}>{sceneNameArr.filter(item => { return item !== 'observation' }).length}</span>项
              </div>

              <div className={styles.scene_block}>
                {panels.map((item, index) => {
                  // 找到对应的场景值索引
                  const idx = sceneNameArr.findIndex(sceneName => {
                    return sceneName.includes(item.type);
                  });
                  // debugger
                  // 如果没找到代表没有开启该场景 
                  if (idx === -1) return null

                  // 1.拿到状态值
                  const curStatus = statusArr[idx];
                  let color = '';
                  switch (curStatus) {
                    case '1':
                    case '2':
                    case '3':
                      color = 'Green';
                      break;
                    case '0':
                      color = 'Blue';
                      break;
                    case '100':
                      color = 'Blue';
                      break;
                    default:
                      color = 'Red';
                      break;
                  }
                  return (
                    <div className={styles.scene_item} key={index}>
                      <Popover
                        placement="bottom"
                        trigger="click"
                        className="parent"
                        content={
                          sceneNameArr[idx] && data.Fip && statusArr[idx] && (
                            <div className="cardDetails">
                              <SceneDetailsModal
                                alertMode={alertMode}
                                sceneName={sceneNameArr[idx]}
                                status={statusArr[idx]}
                                threshold={Number(thresholdArr[idx])}
                                statusReason={statusReasonArr[idx] || ''}
                                Fip={data.Fip}
                                startTime={startTimeArr[idx]}
                                endTime={endTimeArr[idx]}
                                AiLineChart={alertMode === 'ai_baseline' ? item.component : null}
                              />
                            </div>
                          )
                        }
                      >
                        <Button
                          type="primary"
                          className="analysis-state-icon-item"
                          style={{ marginRight: "14px" }}
                        >
                          <span className={`${item.type}${color}`} />
                        </Button  >
                      </Popover>

                      <CardPanel
                        key={item.type}
                        title={item.title}
                        width="100%"
                        height={240}
                        extra={false}>
                        {item.component}
                      </CardPanel>
                    </div>
                  );
                })}
              </div>
              <div className={styles.bottom_block}>
                {auth === "rw" && (
                  <span
                    onClick={() => handleAssetsAnalysisModeVisiable('edit')}
                    style={{ cursor: "pointer" }}
                  >
                    编辑测算模式 |{' '}
                  </span>
                )}

                {advancedAnalysisAuth.includes('r') && (
                  <span
                    onClick={() => handleViewTheResults(data)}
                    style={{ cursor: "pointer" }}
                  >查看分析结果</span>
                )}
              </div>
            </div>
          </div>
        ) : (
            <Row className={styles.open_block}>
              <Col span={7}>
                <div className={styles.open_logo} />
              </Col>
              <Col span={17}>
                <div>
                  <div className={styles.title}>当前未开启高级分析模式</div>
                  <div className={styles.subTitle}>
                    开启高级分析模式，多种场景实时智能监测资产威胁情况及态势
                </div>
                  {auth === "rw" && (
                    <Button type="primary" className={styles.button} onClick={() => {
                      setMode('open');
                      setVisible(true)
                      setModalTitle('开启高级分析模式')
                    }}>
                      立即开启
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          )}
      </div>
    );
  };


  const onCancel = isRefresh => {
    setVisible(false);
    if (isRefresh) {
      dispatch({
        type: 'asset/fetchSafetyStatus',
        payload: {
          Fip: asset.asset?.Fip,
          Ftime: time,
          Fstart_time: startTime,
          Fend_time: endTime,
        },
      });
    }
  };

  return (
    <div>
      {renderAnalysis()}

      <AdvancedAnalysisAssetsModal
        title={modalTitle}
        mode={mode}
        selectedRows={[data]}
        visible={visible}
        onCancel={onCancel}
        openAssetInfo={asset.asset}
      />
    </div>
  );
};

export default connect(({ asset }) => ({
  asset,
}))(AnalysisBlock);
