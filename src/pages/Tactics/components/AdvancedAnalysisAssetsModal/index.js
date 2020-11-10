/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/**
 * 资产高级分析组件，用于添加和编辑
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { Modal, Steps, Button, message } from 'antd';
import AddAsset from './AddAsset'; // 添加资产子组件
import SceneCalculated from './SceneCalculated'; // 场景测算
import AssetListShow from './AssetListShow'; // 场景测算
import styles from './index.less';

const moment = require('moment');

const format = 'YYYY-MM-DD HH:mm:ss';
const { Step } = Steps;
class AdvancedAnalysisAssetsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /** 当前步数 */
      currentStep: 0,
      steps: [
        {
          title: '添加资产',
        },
        {
          title: '选择场景测试模式',
        },
        {
          title: '完成',
        },
      ],
      /** 当前选中的资产数据，从子组件里面拿 */
      assetsSelected: [],
      /** 测算项个数 */
      measurementItemsNum: 0,
      /** 子组件是否进行了观察者模式回调 */
      observe: false,
    };
    /** 添加资产子组件 */
    this.addAssetComponent = undefined;
    // this.addAssetComponent.state.pickedList
    /** 场景测算子组件 */
    this.sceneCalculatedComponent = undefined;
    this.handleAddedToTheObserverModeCallback = this.handleAddedToTheObserverModeCallback.bind(
      this
    );
    this.initState();
  }

  /** 初始化state默认值 */
  initState = () => {
    this.state.isRefresh = false;
    this.state.okText = '下一步';
    this.state.cancelText = '取消';
    this.state.currentStep = 0;
    this.state.observe = false;
  };

  /** 取消按钮点击事件 */
  handleCancel = () => {
    const { onCancel } = this.props;
    this.initState();
    // 告诉父组件不需要刷新数据
    onCancel(false);
  };

  /** 确认添加 */
  handleOk = () => {
    const { onCancel } = this.props;
    this.initState();
    // 告诉父组件需要刷新数据
    onCancel(true);
  };

  next = async () => {
    const { currentStep, steps } = this.state;
    const current = currentStep + 1;
    // 如果是第一步，要判断是否至少选择了一个资产
    if (current === 1) {
      const pickedList = this.addAssetComponent.state.pickedList;
      if (pickedList.length === 0) {
        message.warn('请至少选择一个资产!');
        return;
      }
      this.setState({ currentStep: current, assetsSelected: pickedList });
    }
    // 如果是最后一步那么要发请求添加资产分析了
    else if (current === steps.length - 1) {
      const { dispatch } = this.props;
      const { assetsSelected } = this.state;

      if (!Array.isArray(assetsSelected) || assetsSelected.length === 0) {
        message.warn('请选择要添加高级分析的资产信息');
        return;
      }
      console.log('已经选择的资产信息===', assetsSelected);

      const {
        whetherTheConditionsAreMet,
        measurementItemsNum,
      } = this.sceneCalculatedComponent.calculationItem();
      if (!whetherTheConditionsAreMet) {
        return;
      }

      const thresholdMeasurementData = this.sceneCalculatedComponent.outputThresholdMeasurementData();
      console.log('阈值测算的数据===', thresholdMeasurementData);
      const assetAdvancedAnalysis = this.generateAssetAnalysisData(
        assetsSelected,
        thresholdMeasurementData,
        'add'
      );
      await dispatch({
        type: 'advancedAnalysis/addAssetAnalysisSheet',
        payload: {
          assetAdvancedAnalysis,
        },
      });
      this.setState({ currentStep: current, measurementItemsNum });
    } else {
      this.setState({ currentStep: current });
    }
  };

  prev = () => {
    const { currentStep } = this.state;
    const current = currentStep - 1;
    this.setState({ currentStep: current });
  };

  /** 确认编辑 */
  handleConfirmTheEditor = async () => {
    const { dispatch, selectedRows } = this.props;
    if (!Array.isArray(selectedRows) || selectedRows.length === 0) return;
    console.log('已经选择的资产信息===', selectedRows);

    const { whetherTheConditionsAreMet } = this.sceneCalculatedComponent.calculationItem();
    if (!whetherTheConditionsAreMet) {
      return;
    }

    const thresholdMeasurementData = this.sceneCalculatedComponent.outputThresholdMeasurementData();
    console.log('阈值测算的数据===', thresholdMeasurementData);

    const assetAdvancedAnalysis = this.generateAssetAnalysisData(
      selectedRows,
      thresholdMeasurementData,
      'edit'
    );
    const res = await dispatch({
      type: 'advancedAnalysis/editAssetAnalysisSheet',
      payload: {
        assetAdvancedAnalysis,
      },
    });
    console.log('res===', res);
    message.success(res.msg);
    this.handleOk();
  };

  /** 生成资产分析数据 */
  generateAssetAnalysisData = (assetsSelected, thresholdMeasurementData, mode) => {
    const assetAdvancedAnalysis = [];
    const date = new Date();
    const curTime = moment(date).format(format);
    for (let i = 0; i < assetsSelected.length; i++) {
      const assetInfo = assetsSelected[i];
      Object.keys(thresholdMeasurementData).forEach((key) => {
        // 勾选了才会push
        if (key !== 'Falert_mode' && thresholdMeasurementData[key].是否勾选) {
          const assetAdvancedAnalysisItem = {
            Fip: assetInfo.Fip,
            Falert_mode: thresholdMeasurementData.Falert_mode,
          };
          assetAdvancedAnalysisItem.Fscene_name = key;
          assetAdvancedAnalysisItem.Fthreshold = thresholdMeasurementData[key].Fthreshold;
          assetAdvancedAnalysisItem.Fstart_time = thresholdMeasurementData[key].Fstart_time;
          assetAdvancedAnalysisItem.Fend_time = thresholdMeasurementData[key].Fend_time;
          if (mode === 'add' || mode === 'open') {
            // 如果是添加模式，不管这个场景以前是否存在，不管这个场景目前是什么状态，一律认为是刚部署，让后端去慢慢更新状态
            assetAdvancedAnalysisItem.Finsert_time = curTime;
            assetAdvancedAnalysisItem.Fupdate_time = curTime;
            assetAdvancedAnalysisItem.Fstatus = '100';
            if (assetAdvancedAnalysisItem.Falert_mode === 'ai_baseline') {
              assetAdvancedAnalysisItem.Fstatus_reason = '策略部署中，预计24小时内开始基线模型训练';
            } else {
              assetAdvancedAnalysisItem.Fstatus_reason = '策略部署中，预计5分钟内开始阈值监测';
            }
          } else if (mode === 'edit') {
            // 如果是编辑模式就要判断当前场景值是否存在了
            const {
              'GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)': groupConcatFsceneName,
            } = assetInfo;
            const sceneNameArr = groupConcatFsceneName.split(',');
            const index = sceneNameArr.findIndex((item) => {
              return item === key;
            });
            if (index !== -1) {
              // 如果当前场景值存在,那么需要判断当前场景值数据是否发生了改变
              const whetherToChange = this.sceneCalculatedComponent.sceneValueComparison(
                key,
                thresholdMeasurementData[key]
              );

              if (whetherToChange) {
                assetAdvancedAnalysisItem.Fupdate_time = curTime;
                assetAdvancedAnalysisItem.Fstatus = '100';
                if (assetAdvancedAnalysisItem.Falert_mode === 'ai_baseline') {
                  assetAdvancedAnalysisItem.Fstatus_reason =
                    '策略部署中，预计24小时内开始基线模型训练';
                } else {
                  assetAdvancedAnalysisItem.Fstatus_reason = '策略部署中，预计5分钟内开始阈值监测';
                }
              } else {
                assetAdvancedAnalysisItem.Fupdate_time = curTime;
              }
            } else {
              // 如果不存在，那么要写入默认状态
              assetAdvancedAnalysisItem.Finsert_time = curTime;
              assetAdvancedAnalysisItem.Fupdate_time = curTime;
              assetAdvancedAnalysisItem.Fstatus = '100';
              if (assetAdvancedAnalysisItem.Falert_mode === 'ai_baseline') {
                assetAdvancedAnalysisItem.Fstatus_reason =
                  '策略部署中，预计24小时内开始基线模型训练';
              } else {
                assetAdvancedAnalysisItem.Fstatus_reason = '策略部署中，预计5分钟内开始阈值监测';
              }
            }
          }
          assetAdvancedAnalysis.push(assetAdvancedAnalysisItem);
        }
      });
    }
    console.log('最后组合出来的要添加或者编辑的资产分析的数据===', assetAdvancedAnalysis);
    return assetAdvancedAnalysis;
  };

  /** 子组件进行添加了观察者模式后的回调处理 */
  handleAddedToTheObserverModeCallback = () => {
    const { mode } = this.props;
    if (mode === 'add' || mode === 'open') {
      const { steps } = this.state;
      this.setState({
        currentStep: steps.length - 1,
        observe: true,
      });
    }
    if (mode === 'edit') {
      this.setState({
        observe: true,
      });
    }
  };

  render() {
    const { title, visible, mode, loading, selectedRows, editLoading, openAssetInfo } = this.props;

    const { steps, currentStep, assetsSelected, measurementItemsNum, observe } = this.state;

    // 添加模式
    if (mode === 'add') {
      return (
        <Modal
          title={title}
          width={1200}
          visible={visible}
          maskClosable={false}
          footer={false}
          destroyOnClose
          onCancel={this.handleCancel}
        >
          {/* 步骤条模块 */}
          <Steps current={currentStep}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          {/* 添加资产 */}
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <AddAsset
              onRef={(ref) => {
                this.addAssetComponent = ref;
              }}
            />
          </div>

          {/* 选择场景测算模式 */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <SceneCalculated
              onRef={(ref) => {
                this.sceneCalculatedComponent = ref;
              }}
              assetsSelected={assetsSelected}
              handleAddedToTheObserverModeCallback={this.handleAddedToTheObserverModeCallback}
            />
          </div>

          {/* 完成结果模块 */}
          <div style={{ display: currentStep === steps.length - 1 ? 'block' : 'none' }}>
            <div className={styles.completeBox}>
              <span className={styles.circle} />
              <p className={styles.title}>已完成!</p>

              {observe ? (
                <p className={styles.des}>
                  已成功为<span className={styles.num}> {assetsSelected.length} </span>
                  个资产开启观察模式
                </p>
              ) : (
                <p className={styles.des}>
                  已成功为<span className={styles.num}> {assetsSelected.length} </span>个资产开启
                  <span className={styles.num}> {measurementItemsNum} </span>项场景测算模式
                </p>
              )}

              <Button type="primary" onClick={this.handleOk}>
                好的
              </Button>
            </div>
          </div>

          {/* Footer按钮组 */}
          <div className={styles.stepsAction}>
            {currentStep === 0 && (
              <Fragment>
                <Button style={{ marginRight: 8 }} onClick={() => this.handleCancel()}>
                  取消
                </Button>
                <Button type="primary" onClick={() => this.next()}>
                  下一步
                </Button>
              </Fragment>
            )}

            {currentStep === steps.length - 1 && (
              // 最后一步不在提供任何按钮
              <div />
            )}

            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Fragment>
                <Button style={{ marginRight: 8 }} onClick={() => this.prev()}>
                  上一步
                </Button>
                <Button type="primary" loading={loading} onClick={() => this.next()}>
                  下一步
                </Button>
              </Fragment>
            )}
          </div>
        </Modal>
      );
    }
    // 编辑模式
    if (mode === 'edit') {
      return (
        <Modal
          title={title}
          width={1200}
          visible={visible}
          maskClosable={false}
          destroyOnClose
          footer={false}
          onCancel={this.handleCancel}
        >
          {!observe && (
            <Fragment>
              <AssetListShow selectedRows={selectedRows} />
              {/* 选择场景测算模式 */}
              <SceneCalculated
                onRef={(ref) => {
                  this.sceneCalculatedComponent = ref;
                }}
                assetsSelected={selectedRows}
                mode="edit"
                handleAddedToTheObserverModeCallback={this.handleAddedToTheObserverModeCallback}
              />
              {/* Footer按钮组 */}
              <div className={styles.stepsAction}>
                <Button style={{ marginRight: 8 }} onClick={() => this.handleCancel()}>
                  取消
                </Button>
                <Button
                  type="primary"
                  loading={editLoading}
                  onClick={() => this.handleConfirmTheEditor()}
                >
                  确定
                </Button>
              </div>
            </Fragment>
          )}
          {observe && (
            <div>
              <div className={styles.completeBox}>
                <span className={styles.circle} />
                <p className={styles.title}>已完成!</p>
                <p className={styles.des}>
                  已成功为<span className={styles.num}> {selectedRows.length} </span>
                  个资产开启观察模式
                </p>
                <Button type="primary" onClick={this.handleOk}>
                  好的
                </Button>
              </div>
            </div>
          )}
        </Modal>
      );
    }
    // 开启高级分析模式
    if (mode === 'open') {
      return (
        <Modal
          title={title}
          width={1200}
          visible={visible}
          maskClosable={false}
          footer={false}
          destroyOnClose
          onCancel={this.handleCancel}
        >
          {/* 选择场景测算模式 */}
          <div style={{ display: currentStep !== steps.length - 1 ? 'block' : 'none' }}>
            <SceneCalculated
              onRef={(ref) => {
                this.sceneCalculatedComponent = ref;
              }}
              assetsSelected={[openAssetInfo]}
              handleAddedToTheObserverModeCallback={this.handleAddedToTheObserverModeCallback}
            />
          </div>

          {/* 完成结果模块 */}
          <div style={{ display: currentStep === steps.length - 1 ? 'block' : 'none' }}>
            <div className={styles.completeBox}>
              <span className={styles.circle} />
              <p className={styles.title}>已完成!</p>

              {observe ? (
                <p className={styles.des}>
                  已成功为<span className={styles.num}> 1 </span>个资产开启观察模式
                </p>
              ) : (
                <p className={styles.des}>
                  已成功为<span className={styles.num}> 1 </span>个资产开启
                  <span className={styles.num}> {measurementItemsNum} </span>项场景测算模式
                </p>
              )}

              <Button type="primary" onClick={this.handleOk}>
                好的
              </Button>
            </div>
          </div>

          {/* Footer按钮组 */}
          <div className={styles.stepsAction}>
            {currentStep !== steps.length - 1 && (
              <Fragment>
                <Button style={{ marginRight: 8 }} onClick={() => this.handleCancel()}>
                  取消
                </Button>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    this.setState({ currentStep: 1, assetsSelected: [openAssetInfo] }, () => {
                      this.next();
                    });
                  }}
                >
                  确定
                </Button>
              </Fragment>
            )}
          </div>
        </Modal>
      );
    }
    return <div />;
  }
}

export default connect(({ global, advancedAnalysis, loading }) => ({
  hasVpc: global.hasVpc,
  advancedAnalysis,
  editLoading: loading.effects['advancedAnalysis/editAssetAnalysisSheet'],
  loading: loading.effects['advancedAnalysis/addAssetAnalysisSheet'],
}))(AdvancedAnalysisAssetsModal);
