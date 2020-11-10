/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { Steps, Card, Skeleton } from 'antd';
import { ThresholdCurve } from '@/components/Charts';
import moment from 'moment';
import styles from './index.less';

const { Step } = Steps;
const { Meta } = Card;

/**
 * 场景详情展示卡片组件
 */
class SceneDetailsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      thresholdValueAggs: [],
    };
  }

  async componentDidMount() {
    const { dispatch, sceneName, Fip, status, ccsName, alertMode } = this.props;
    if (status === '1' && alertMode === 'threshold') {
      const data = await dispatch({
        type: 'advancedAnalysis/fetchThresholdValueAggs',
        payload: {
          sceneName,
          Fip,
          startTime: moment().subtract(1, 'days').valueOf(),
          endTime: moment().valueOf(),
          ccsName,
        },
      });
      this.setState({
        thresholdValueAggs: data,
      });
    }
  }

  /**
   * 1.当`t_ai_ip_scene_config`.`alert_mode` = `threshold` 自定义测算模式时：
   *   Fstatus` = -1（历史数据获取异常） -2（阈值获取异常），-3（数据监测异常）， 0代表不在检测时间内，1代表正常，100策略部署中，预计5分钟内开始阈值监测
   *
   * 2.当`t_ai_ip_scene_config`.`alert_mode` = `ai_baseline` ai测算模式时：
   *   Fstatus` = -1（历史数据获取异常） -2（模型训练异常），-3（模型预测异常），-4（数据监测异常）， 0代表不在检测时间内，1代表正常，100策略部署中，预计5分钟内开始阈值监测，2模型训练完成，等待模型进行预测分析,3模型预测完成，等待检测
   */
  render() {
    const {
      alertMode,
      sceneName,
      status,
      threshold,
      statusReason,
      startTime,
      endTime,
      cardStyle,
      headStyle,
      chartWidth,
      AiLineChart,
    } = this.props;
    console.log(this.props);
    const { thresholdValueAggs } = this.state;

    // 计算颜色主题
    const colors = ['#219C77', '#2A62D1', '#C93439']; // 绿 蓝 红
    const color =
      status === '1' || status === '2' || status === '3'
        ? colors[0]
        : status === '0' || status === '100'
        ? colors[1]
        : colors[2];

    // 计算标题显示
    function calculateTheTitle() {
      let title = '';
      if (sceneName === 'http_abnormal_transport') {
        title = 'HTTP异常数据传输';
      } else if (sceneName === 'dns_hidden_tunnel') {
        title = 'DNS隐蔽隧道通信';
      } else if (sceneName === 'icmp_hidden_tunnel') {
        title = 'ICMP隐蔽隧道通信';
      } else if (sceneName === 'rdp_abnormal_transport') {
        title = 'RDP异常数据下载';
      } else if (sceneName === 'ssh_abnormal_transport') {
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

    // 计算当前步数,步数状态,步骤描述
    let currentStep = -1;
    let stepStatus = '';
    let historicalDes = ' ';
    let thresholdCalculationDes = ' ';
    let dataMonitoringDes = ' ';
    let modelTraining = ' ';
    let modelPredictDes = ' ';
    if (alertMode === 'threshold') {
      if (status === '-1') {
        currentStep = 0;
        stepStatus = 'error';
        historicalDes = statusReason;
      } else if (status === '-2') {
        currentStep = 1;
        stepStatus = 'error';
        thresholdCalculationDes = statusReason;
      } else if (status === '-3') {
        currentStep = 2;
        stepStatus = 'error';
        dataMonitoringDes = statusReason;
      } else if (status === '1') {
        currentStep = 2;
        stepStatus = 'finish';
      }
    } else if (alertMode === 'ai_baseline') {
      if (status === '-1') {
        currentStep = 0;
        stepStatus = 'error';
        historicalDes = statusReason;
      } else if (status === '-2') {
        currentStep = 1;
        stepStatus = 'error';
        modelTraining = statusReason;
      } else if (status === '-3') {
        currentStep = 2;
        stepStatus = 'error';
        modelPredictDes = statusReason;
      } else if (status === '-4') {
        currentStep = 3;
        stepStatus = 'error';
        dataMonitoringDes = statusReason;
      } else if (status === '1') {
        currentStep = 3;
        stepStatus = 'finish';
      } else if (status === '2') {
        currentStep = 1;
        stepStatus = 'finish';
      } else if (status === '3') {
        currentStep = 3;
        stepStatus = 'finish';
      }
    }
    return (
      <Card
        className="sceneDetailsCardBox"
        style={cardStyle ? { ...cardStyle } : { width: 450 }}
        title={
          <Skeleton loading={false}>
            <Meta
              style={{ textAlign: 'left' }}
              title={calculateTheTitle()}
              description={`当前状态：${statusReason}`}
            />
          </Skeleton>
        }
        headStyle={
          headStyle
            ? Object.assign({}, { ...headStyle }, { backgroundColor: color })
            : { backgroundColor: color }
        }
        extra={
          <div className="bg">
            <span className="des" style={{ color }}>
              已开启
            </span>
          </div>
        }
      >
        {status !== '0' && status !== '100' && alertMode === 'threshold' && (
          <Fragment>
            <Steps direction="vertical" progressDot current={currentStep} status={stepStatus}>
              <Step title="历史数据获取" description={historicalDes} />
              <Step title="阈值计算" description={thresholdCalculationDes} />
              <Step className="lastStep" title="数据监测" description={dataMonitoringDes} />
            </Steps>
            {status === '1' && (
              <Fragment>
                <h2 className="testingCurveTitle">最近24h检测曲线</h2>
                <ThresholdCurve
                  data={thresholdValueAggs}
                  thresholdValueArr={[{ text: '阈值', thresholdValue: parseFloat(threshold) }]}
                  offsetX={-110}
                  padding={[10, 70, 40, 70]}
                  dateRange={[0, 0.95]}
                  width={chartWidth || 450}
                  dateTickCount={thresholdValueAggs.length > 3 ? 5 : 3}
                />
              </Fragment>
            )}
          </Fragment>
        )}

        {status !== '0' && status !== '100' && alertMode === 'ai_baseline' && (
          <Fragment>
            <Steps direction="vertical" progressDot current={currentStep} status={stepStatus}>
              <Step title="历史数据获取" description={historicalDes} />
              <Step title="模型训练" description={modelTraining} />
              <Step title="模型预测" description={modelPredictDes} />
              <Step className="lastStep" title="数据监测" description={dataMonitoringDes} />
            </Steps>
            {status === '1' && (
              <Fragment>
                <h2 className="testingCurveTitle">检测曲线</h2>
                {AiLineChart}
              </Fragment>
            )}
          </Fragment>
        )}

        {status === '0' && <h2>{`检测时间：${startTime}点-${endTime}点`}</h2>}
      </Card>
    );
  }
}

export default connect(({ loading }) => ({
  loading: loading.effects['advancedAnalysis/fetchThresholdValueAggs'],
}))(SceneDetailsModal);
