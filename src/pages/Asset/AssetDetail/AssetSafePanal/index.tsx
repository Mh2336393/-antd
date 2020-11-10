import React, { useState, useEffect } from 'react';
import { connect} from 'umi';
import { Link } from 'umi';
import _ from 'lodash';
import { Row, Col, Timeline, Progress, Spin, Select } from 'antd';
import styles from './index.less';
import AnalysisBlock from './AnalysisBlock'

const moment = require('moment');

interface IAssetSafePanalProp {
  asset?: any;
  advancedAnalysis?: any;
  dispatch?: any;
  loading: boolean;
  loadingAnalysisOfState: boolean;
  auth: string;
}

const AssetSafePanal: React.FC<IAssetSafePanalProp> = ({ asset, dispatch, loading, loadingAnalysisOfState, auth }) => {
  const [time, setTime] = useState<string>('');
  const [startTime, setFstartTime] = useState<number>(0);
  const [endTime, setFendTime] = useState<number>(0);
  // 你可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合。

  // 虽然 React 在 DOM 渲染时会 diff 内容，只对改变部分进行修改，而不是整体替换，
  // 但却做不到对 Effect 的增量修改识别。因此需要开发者通过 useEffect 的第二个参数告诉 React 用到了哪些外部变量：
  // 直到 asset.asset?.Fip或 time 改变时的 Rerender，useEffect 才会再次执行。

  // a?.x  相当于 a&&a.x
  useEffect(() => {
    setTime(asset.config?.safet?.[0]?.key);
  }, [asset.config?.safet]);
  useEffect(() => {
    if (time && asset.asset?.Fip) {
      const num = Number(`-${time.substr(0, time.length - 1)}`)
      const unit = time.charAt(time.length - 1)
      const Fstart_time = moment().add(num, unit).valueOf();
      const Fend_time = moment().valueOf();
      dispatch({
        type: 'asset/fetchSafetyStatus',
        payload: {
          Fip: asset.asset?.Fip,
          Ftime: time,
          Fstart_time,
          Fend_time,
        },
      });
      setFstartTime(Fstart_time)
      setFendTime(Fend_time)
    }

  }, [asset.asset?.Fip, time]);

  useEffect(() => {
    if (time && asset.asset?.Fip && asset.safe.analysisList.list.length > 0 && asset.safe.analysisList.list[0].Falert_mode !== 'observe') {
      let sceneNameArr = asset.safe.analysisList.list[0]['GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)']?.split(','); // 场景值数组
      sceneNameArr = sceneNameArr.map(item => { return item.split("_")[0] })
      sceneNameArr.forEach(item => {
        dispatch({
          type: 'asset/fetchAssetFlowStatic',
          payload: {
            Ftype: item,
            Fip: asset.asset?.Fip,
            Ftime: time,
            Falert_mode: asset.safe.analysisList.list[0].Falert_mode
          },
        });
      });
    }
  }, [JSON.stringify(asset.safe.analysisList.list), time]);

  const failureColorMap = {
    外部侦查: '#FDE2A2',
    网络入侵: '#EDC039',
    内部侦查: '#E8944A',
    横向渗透: '#C93439',
    恶意文件投递: '#8F1F19',
    攻陷系统: '#631210',
  };

  const renderItem = item => {
    return (
      <Timeline.Item key={item.key} color={failureColorMap[item.key] || '#FDE2A2'}>
        <span>{item.key}</span>
        <span className={styles.text} style={{ color: item.doc_count ? '#2A62D1' : '#8E8E8E' }}>
          {item.doc_count}
        </span>
      </Timeline.Item>
    );
  };

  const renderFailureStatus = () => {
    const status = _.result(_.find(asset.safe.failureList, { key: '攻陷系统' }), 'doc_count');
    if (!time) return null
    const num = Number(`-${time.substr(0, time.length - 1)}`)
    const unit = time.charAt(time.length - 1)
    return (
      <div className={styles.failure_content}>
        <Row style={{ height: '100%' }}>
          <Col span={8} style={{ height: '100%' }}>
            <div className={status ? styles.dangerous_logo : styles.safe_logo} />
          </Col>
          <Col span={16}>
            <div className={styles.title_header}>{`资产${status ? '已' : '未'}失陷`}</div>
            <div className={styles.subtitle_header}>{`检测到${status ? '' : '未'
              }发生攻陷系统安全事件`}</div>
            <Timeline className={styles.timeLine}>
              {asset.safe.failureList.map(item =>
                item.doc_count > 0 ? (
                  <Link
                    key={item.key}
                    to={`/event/safeEvent/alarm?affectedAssets.ip=${asset.asset?.Fip}&attackStage=${item.key}&startTime=${moment().add(num, unit).valueOf()}&endTime=${moment().valueOf()}`}
                    target="blank"
                  >
                    {renderItem(item)}
                  </Link>
                ) : (
                    renderItem(item)
                  ),
              )}
            </Timeline>
          </Col>
        </Row>
      </div>
    );
  };

  const renderAlarmEvent = () => {
    if (!time) return null
    let total = 0;
    asset.safe.eventList.map(item => {
      total += item.doc_count;
      return total;
    });

    const colorMap = {
      信息: '#2A62D1',
      低危: '#EDC039',
      中危: '#E8944A',
      高危: '#C93439',
      严重: '#8F1F19',
    };

    const num = Number(`-${time.substr(0, time.length - 1)}`)
    const unit = time.charAt(time.length - 1)
    let nowTime
    if(unit==="m"){
      nowTime=moment().startOf('day').valueOf()
    }else{
      nowTime=moment().add(num, unit).valueOf()
    }
    return (
      <div className={styles.event_content}>
        {asset.safe.eventList.map(item => (
          <div style={{ marginTop: '10px' }} key={item.key}>
            <Link
              to={`/event/safeEvent/alarm?affectedAssets.ip=${asset.asset?.Fip}&score=${item.key}&startTime=${nowTime}&endTime=${moment().valueOf()}`}
              target="blank"
            >
              <Row>
                <Col span={4}>
                  <div className={styles.event_header}>{item.key}</div>
                </Col>
                <Col span={20}>
                  <Progress
                    percent={(item.doc_count / total) * 100}
                    size="small"
                    strokeColor={colorMap[item.key] || '#2A62D1'}
                    format={() => {
                      return (
                        <span style={{ color: item.doc_count ? '#2A62D1' : '#8E8E8E' }}>
                          {item.doc_count}
                        </span>
                      );
                    }}
                  />
                </Col>
              </Row>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.safe_wrapper}>
      <header className={styles.header}>
        <h4 className={styles.title}>资产安全状态</h4>
        <Select
          value={time}
          className={styles.time_panel}
          onChange={value => {
            setTime(value);
          }}
        >
          {asset.config?.safet?.map(item => {
            return (
              <Select.Option value={item.key} key={item.key}>
                {item.value}
              </Select.Option>
            );
          })}
        </Select>
      </header>


      <Spin spinning={loading}>
        <div className={styles.content_wrapper}>
          <div className={styles.content_block}>
            <span className={styles.title}>失陷状态：</span>
            {renderFailureStatus()}
          </div>
          <div className={styles.content_block}>
            <span className={styles.title}>安全事件：</span>
            {renderAlarmEvent()}
          </div>
        </div>
      </Spin>

      <Spin spinning={loadingAnalysisOfState || loading}>
        <div className={styles.content_wrapper}>
          <div className={`${styles.AnalysisOfState}`}>
            <span className={styles.title}>高级分析状态：</span>
            <AnalysisBlock
              auth={auth}
              startTime={startTime}
              endTime={endTime}
              time={time}
            />
          </div>
        </div>
      </Spin>

    </div>
  );
};

export default connect(({ asset, advancedAnalysis, loading }) => ({
  asset,
  advancedAnalysis,
  loading: loading.effects['asset/fetchSafetyStatus'] || false,
  loadingAnalysisOfState: loading.effects['asset/fetchAssetFlowStatic'] || false,
}))(AssetSafePanal);
