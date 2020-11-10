/* eslint-disable no-plusplus */
/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import {
  Card,
  Avatar,
  Skeleton,
  Switch,
  Checkbox,
  Row,
  Col,
  Tooltip,
  Select,
  InputNumber,
  Popover,
  Input,
  Modal,
  Button,
  message,
} from 'antd';
import HourRangeSelector from '@/components/HourRangeSelector/HourRangeSelector';
import { connect } from 'umi';
import cloneDeep from 'lodash/cloneDeep';
import ThresholdCalculated from './ThresholdCalculated';
import styles from './SceneCalculated.less';

const { Meta } = Card;
const { Option } = Select;
const InputGroup = Input.Group;
const { confirm } = Modal;
const moment = require('moment');

const format = 'YYYY-MM-DD HH:mm:ss';
@connect(({ loading }) => ({
  loading: loading.effects['advancedAnalysis/whetherThresholdExists'],
}))
/**
 * 场景数据组件
 */
class SceneCalculated extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /** 阈值测算数据记录（编辑模式的时候记录一下场景数据，用于比对） */
      thresholdMeasurementRecordData: {},
      /** 阈值测算数据（最后的保存结果） */
      thresholdMeasurementData: {
        Falert_mode: 'ai_baseline',
        http_abnormal_transport: {
          是否勾选: true,
          Fstart_time: '0',
          Fend_time: '24',
          检测时间描述: '每日0点-24点',
          时间选择器显示状态: false,
          阈值获取卡片显示状态: false,
          阈值获取卡片的引用: null,
          Fthreshold: 0,
          阈值单位: 'bps',
          Finsert_time: 0,
          Fupdate_time: 0,
        },
        icmp_hidden_tunnel: {
          是否勾选: true,
          Fstart_time: '0',
          Fend_time: '24',
          检测时间描述: '每日0点-24点',
          时间选择器显示状态: false,
          阈值获取卡片显示状态: false,
          阈值获取卡片的引用: null,
          Fthreshold: 0,
          阈值单位: 'bps',
          Finsert_time: 0,
          Fupdate_time: 0,
        },
        dns_hidden_tunnel: {
          是否勾选: true,
          Fstart_time: '0',
          Fend_time: '24',
          检测时间描述: '每日0点-24点',
          时间选择器显示状态: false,
          阈值获取卡片显示状态: false,
          阈值获取卡片的引用: null,
          Fthreshold: 0,
          阈值单位: 'bps',
          Finsert_time: 0,
          Fupdate_time: 0,
        },
        ssh_abnormal_transport: {
          是否勾选: true,
          Fstart_time: '0',
          Fend_time: '24',
          检测时间描述: '每日0点-24点',
          时间选择器显示状态: false,
          阈值获取卡片显示状态: false,
          阈值获取卡片的引用: null,
          Fthreshold: 0,
          阈值单位: 'bps',
          Finsert_time: 0,
          Fupdate_time: 0,
        },
        rdp_abnormal_transport: {
          是否勾选: true,
          Fstart_time: '0',
          Fend_time: '24',
          检测时间描述: '每日0点-24点',
          时间选择器显示状态: false,
          阈值获取卡片显示状态: false,
          阈值获取卡片的引用: null,
          Fthreshold: 0,
          阈值单位: 'bps',
          Finsert_time: 0,
          Fupdate_time: 0,
        },
      },
      /** 当前开启的场景集合，如果是多个资产那么取并集 */
      sceneNameArr: [],
    };
    /** 检测时间选项 */
    this.timeOptions = ['每日0点-24点', '自定义'];
    /** 测算选项 */
    this.measurementOptions = [
      {
        label: 'HTTP异常数据传输',
        des: 'xxxxxxxxxx',
        value: 'http_abnormal_transport',
      },
      {
        label: 'ICMP隐蔽隧道通信',
        des: 'xxxxxxxxxx',
        value: 'icmp_hidden_tunnel',
      },
      {
        label: 'DNS隐蔽隧道通信',
        des: 'xxxxxxxxxx',
        value: 'dns_hidden_tunnel',
      },
      {
        label: 'SSH数据泄密',
        des: 'xxxxxxxxxx',
        value: 'ssh_abnormal_transport',
      },
      {
        label: 'RDP异常数据下载',
        des: 'xxxxxxxxxx',
        value: 'rdp_abnormal_transport',
      },
    ];
    this.symbols = ['bps', 'Kbps', 'Mbps'];
    this.ontimePiker = this.ontimePiker.bind(this);
    this.onThresholdSelection = this.onThresholdSelection.bind(this);
  }

  async componentDidMount() {
    // 把实例给到父组件
    this.props.onRef(this);
    // 获取测算选项的描述
    const { dispatch } = this.props;
    const res = await dispatch({
      type: 'advancedAnalysis/fetchDescriptionOfMeasurementOptions',
      payload: {},
    });
    if (Array.isArray(res) && res.length > 0) {
      for (let i = 0; i < res.length; i++) {
        const element = res[i];
        const index = this.measurementOptions.findIndex(
          (item) => item.value === element.Fscene_name
        );
        if (index !== -1) {
          this.measurementOptions[index].des = element.Fstatement;
        }
      }
    }

    const { assetsSelected, mode } = this.props;
    if (mode === 'edit') {
      // 如果是编辑模式并且只编辑一个资产分析得数据，那么要使用传递过来得数据做初始化
      if (Array.isArray(assetsSelected) && assetsSelected.length === 1) {
        const {
          'GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)': groupConcatFsceneName,
          'GROUP_CONCAT(t_ai_ip_scene_config.Fthreshold/300)': groupConcatFthreshold,
          'GROUP_CONCAT(t_ai_ip_scene_config.Fstart_time)': groupConcatFstartTime,
          'GROUP_CONCAT(t_ai_ip_scene_config.Fend_time)': groupConcatFendTime,

          Falert_mode: alertMode, // threshold自定义测算，ai_baseline ai测算
        } = assetsSelected[0];
        const { thresholdMeasurementData } = this.state;
        const sceneNameArr = groupConcatFsceneName.split(','); // 场景值数组
        const thresholdArr = groupConcatFthreshold.split(','); // 阈值数组
        const startTimeArr = groupConcatFstartTime.split(','); // 检测开始时间数组
        const endTimeArr = groupConcatFendTime.split(','); // 检测结束时间数组

        thresholdMeasurementData['Falert_mode'] = alertMode;
        Object.keys(thresholdMeasurementData).forEach((key) => {
          if (key !== 'Falert_mode') {
            const index = sceneNameArr.findIndex((item) => {
              return item === key;
            });
            if (index !== -1) {
              thresholdMeasurementData[key].是否勾选 = true;
              thresholdMeasurementData[key].Fthreshold = Number(thresholdArr[index]);
              thresholdMeasurementData[key].Fstart_time = startTimeArr[index];
              thresholdMeasurementData[key].Fend_time = endTimeArr[index];
              thresholdMeasurementData[
                key
              ].检测时间描述 = `每日${startTimeArr[index]}点-${endTimeArr[index]}点`;
            } else {
              thresholdMeasurementData[key].是否勾选 = false;
            }
          }
        });
        this.setState({
          thresholdMeasurementData,
          thresholdMeasurementRecordData: cloneDeep(thresholdMeasurementData),
          sceneNameArr,
        });
      } else {
        const sceneNameArr = [];
        assetsSelected.forEach((element) => {
          const { 'GROUP_CONCAT(t_ai_ip_scene_config.Fscene_name)': Fscene_names } = element;
          const scene_name_arr = Fscene_names.split(',');
          scene_name_arr.forEach((item) => {
            if (!sceneNameArr.includes(item)) sceneNameArr.push(item);
          });
        });
        this.setState({
          sceneNameArr,
        });
      }
    }
  }

  /** 处理switch改变 */
  handleSwitchChange = (mode) => {
    const { thresholdMeasurementData } = this.state;
    if (thresholdMeasurementData['Falert_mode'] === 'ai_baseline') {
      thresholdMeasurementData['Falert_mode'] = 'threshold';
    } else if (thresholdMeasurementData['Falert_mode'] === 'threshold') {
      // 代表开始AI测算,ai测算 计算阈值方式全部改为无，阈值全部改为0
      thresholdMeasurementData['Falert_mode'] = 'ai_baseline';
    } else if (thresholdMeasurementData['Falert_mode'] === 'observe') {
      thresholdMeasurementData['Falert_mode'] = mode;
    }
    Object.keys(thresholdMeasurementData).forEach((key) => {
      if (key !== 'Falert_mode') {
        thresholdMeasurementData[key].Fthreshold = 0;
        thresholdMeasurementData[key].阈值单位 = 'bps';
      }
    });
    this.setState({
      thresholdMeasurementData,
    });
  };

  /** 自定义测算Render */
  customMeasurementRender = () => {
    const { thresholdMeasurementData } = this.state;
    const { assetsSelected, loading } = this.props;
    const Fips = assetsSelected.map((item) => {
      return item.Fip;
    });
    function optionRender(that, options) {
      return options.map((item) => (
        <Option key={item} value={item}>
          {item}
        </Option>
      ));
    }

    return this.measurementOptions.map((measurementItem) => (
      <div className={styles.measurementRow} key={measurementItem.value}>
        <Checkbox
          style={{ width: 180 }}
          checked={thresholdMeasurementData[measurementItem.value].是否勾选}
          onChange={(e) => {
            this.handleChange(measurementItem.value, '勾选', e.target.checked);
          }}
        >
          <span style={{ marginRight: 5 }}>{measurementItem.label}</span>
          <Tooltip title={measurementItem.des} placement="rightTop">
            <QuestionCircleFilled className="fontBlue" />
          </Tooltip>
        </Checkbox>

        <div className={styles.measurementColA}>
          <span>检测时间：</span>
          <Select
            disabled={!thresholdMeasurementData[measurementItem.value].是否勾选}
            style={{ width: 180 }}
            value={thresholdMeasurementData[measurementItem.value]['检测时间描述']}
            onChange={(value) => {
              this.handleChange(measurementItem.value, '检测时间', value);
            }}
          >
            {optionRender(this, this.timeOptions)}
          </Select>
          {thresholdMeasurementData[measurementItem.value]['时间选择器显示状态'] && (
            <div className={styles['timeRange-picker']}>
              <HourRangeSelector
                measurementItemKey={measurementItem.value}
                onClose={this.ontimePiker}
              />
            </div>
          )}
        </div>

        <div className={styles.measurementColA}>
          <span style={{ whiteSpace: 'nowrap' }}>阈值：</span>
          <InputGroup compact>
            <InputNumber
              disabled={!thresholdMeasurementData[measurementItem.value].是否勾选}
              style={{ width: 120 }}
              placeholder="请输入阈值"
              min={0}
              value={thresholdMeasurementData[measurementItem.value].Fthreshold}
              onChange={(value) => {
                this.handleChange(measurementItem.value, 'Fthreshold', value);
              }}
            />
            <Select
              style={{ width: '75px' }}
              value={thresholdMeasurementData[measurementItem.value].阈值单位}
              onChange={(value) => {
                this.handleChange(measurementItem.value, '阈值单位', value);
              }}
            >
              {this.symbols.map((item) => {
                return (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </InputGroup>

          {/* 阈值获取气泡卡片 */}
          <Popover
            content={
              <ThresholdCalculated
                sceneName={measurementItem.value}
                assetsSelected={assetsSelected}
                onRef={(ref) => {
                  this.popoverInstanceRecord(measurementItem.value, ref);
                }}
                onThresholdSelection={this.onThresholdSelection}
              />
            }
            title={`${Fips.toString()}/历史数据参考`}
            trigger="click"
            visible={thresholdMeasurementData[measurementItem.value]['阈值获取卡片显示状态']}
            onVisibleChange={(value) => {
              this.handleChange(measurementItem.value, '阈值获取卡片显示状态', value);
            }}
          >
            <Button type="link" loading={loading} size="small">
              阈值参考
            </Button>
          </Popover>
        </div>
      </div>
    ));
  };

  /** AI测算Render */
  aIMeasurementRender = () => {
    const { thresholdMeasurementData } = this.state;
    function optionRender(that, options) {
      return options.map((item) => (
        <Option key={item} value={item}>
          {item}
        </Option>
      ));
    }

    return this.measurementOptions.map((measurementItem) => (
      <div className={styles.measurementRow} key={measurementItem.value}>
        <Checkbox
          style={{ width: 180 }}
          checked={thresholdMeasurementData[measurementItem.value].是否勾选}
          onChange={(e) => {
            this.handleChange(measurementItem.value, '勾选', e.target.checked);
          }}
        >
          <span style={{ marginRight: 5 }}>{measurementItem.label}</span>
          <Tooltip title={measurementItem.des} placement="rightTop">
            <QuestionCircleFilled className="fontBlue" />
          </Tooltip>
        </Checkbox>

        <div className={styles.measurementColA}>
          <span>检测时间：</span>
          <Select
            disabled={!thresholdMeasurementData[measurementItem.value].是否勾选}
            style={{ width: 180 }}
            value={thresholdMeasurementData[measurementItem.value]['检测时间描述']}
            onChange={(value) => {
              this.handleChange(measurementItem.value, '检测时间', value);
            }}
          >
            {optionRender(this, this.timeOptions)}
          </Select>
          {thresholdMeasurementData[measurementItem.value]['时间选择器显示状态'] && (
            <div className={styles['timeRange-picker']}>
              <HourRangeSelector
                measurementItemKey={measurementItem.value}
                onClose={this.ontimePiker}
              />
            </div>
          )}
        </div>

        <div style={{ width: 120 }} />
        <div style={{ width: 120 }} />
      </div>
    ));
  };

  /**
   * 场景数据修改
   * @param {string}  key 阈值测算数据对应的key
   * @param {string} mode change的模式
   * @param {any} value  阈值测算数据对应的值
   */
  handleChange = async (key, mode, value) => {
    const that = this;
    const { thresholdMeasurementData } = this.state;
    if (mode === '勾选') {
      thresholdMeasurementData[key].是否勾选 = value;
    } else if (mode === '检测时间') {
      if (value === '自定义') {
        thresholdMeasurementData[key]['时间选择器显示状态'] = true;
      } else {
        thresholdMeasurementData[key]['检测时间描述'] = value;
        switch (value) {
          case '每日0点-24点':
            thresholdMeasurementData[key].Fstart_time = '每日0点-24点'
              .split('-')[0]
              .replace(/[\u4e00-\u9fa5]+/g, '');
            thresholdMeasurementData[key].Fend_time = '每日0点-24点'
              .split('-')[1]
              .replace(/[\u4e00-\u9fa5]+/g, '');
            break;
          default:
            break;
        }
      }
    } else if (mode === 'Fthreshold') {
      thresholdMeasurementData[key].Fthreshold = value;
    } else if (mode === '阈值获取卡片显示状态') {
      // 如果要打开卡片,发请求判断是否可以获取阈值
      if (value) {
        const { dispatch } = this.props;
        const { assetsSelected } = this.props;
        const assetIPs = assetsSelected.map((item) => {
          return item.Fip;
        });
        const res = await dispatch({
          type: 'advancedAnalysis/whetherThresholdExists',
          payload: { assetIPs },
        });
        if (res) {
          thresholdMeasurementData[key]['阈值获取卡片显示状态'] = value;
        } else {
          confirm({
            title: '是否加入观察模式?',
            content:
              '资产首次添加，无法获取足够历史数据作为参考阈值，可点击确定将资产加入观察模式，进行资产流量数据统计。',
            okText: '确定',
            cancelText: '取消并继续设置阈值',
            centered: true,
            onOk() {
              thresholdMeasurementData[key].是否勾选 = true;
              thresholdMeasurementData['Falert_mode'] = 'observe';
              that.setState(
                {
                  thresholdMeasurementData,
                },
                () => {
                  that.handleAddedToTheObserverMode();
                }
              );
            },
          });
          return;
        }
      } else {
        thresholdMeasurementData[key]['阈值获取卡片显示状态'] = value;
      }
    } else if (mode === '阈值单位') {
      // 找出新单位和旧单位的索引
      const oldUnit = thresholdMeasurementData[key]['阈值单位'];
      const newUnit = value;
      const oldUnitIndex = this.symbols.findIndex((item) => {
        return item === oldUnit;
      }); // 2
      const newUnitIndex = this.symbols.findIndex((item) => {
        return item === newUnit;
      }); // 0
      let Fthreshold = 0;
      if (newUnitIndex > oldUnitIndex) {
        Fthreshold =
          thresholdMeasurementData[key].Fthreshold / 1024 ** (newUnitIndex - oldUnitIndex);
        thresholdMeasurementData[key].Fthreshold = Fthreshold;
      } else if (newUnitIndex < oldUnitIndex) {
        Fthreshold =
          thresholdMeasurementData[key].Fthreshold * 1024 ** (oldUnitIndex - newUnitIndex);
        thresholdMeasurementData[key].Fthreshold = Fthreshold;
      }
      thresholdMeasurementData[key]['阈值单位'] = value;
    }
    this.setState({
      thresholdMeasurementData,
    });
  };

  /** 当阈值选择卡片关闭的时候触发 */
  onThresholdSelection = (sceneName, mode, unit) => {
    const { thresholdMeasurementData } = this.state;
    if (thresholdMeasurementData[sceneName]['阈值获取卡片的引用'] && sceneName && mode && unit) {
      thresholdMeasurementData[sceneName]['阈值单位'] = unit;
      let Fthreshold = 0;
      const oldUnitIndex = 0;
      const newUnitIndex = this.symbols.findIndex((item) => {
        return item === unit;
      });
      if (mode === '峰值') {
        if (newUnitIndex > oldUnitIndex) {
          Fthreshold =
            thresholdMeasurementData[sceneName]['阈值获取卡片的引用'].state.maxThresholdValue /
            1024 ** (newUnitIndex - oldUnitIndex);
        } else if (newUnitIndex < oldUnitIndex) {
          Fthreshold =
            thresholdMeasurementData[sceneName]['阈值获取卡片的引用'].state.maxThresholdValue *
            1024 ** (oldUnitIndex - newUnitIndex);
        } else {
          Fthreshold =
            thresholdMeasurementData[sceneName]['阈值获取卡片的引用'].state.maxThresholdValue;
        }
        thresholdMeasurementData[sceneName].Fthreshold = Fthreshold;
      }
      if (mode === '均值') {
        if (newUnitIndex > oldUnitIndex) {
          Fthreshold =
            thresholdMeasurementData[sceneName]['阈值获取卡片的引用'].state.meanThresholdValue /
            1024 ** (newUnitIndex - oldUnitIndex);
        } else if (newUnitIndex < oldUnitIndex) {
          Fthreshold =
            thresholdMeasurementData[sceneName]['阈值获取卡片的引用'].state.meanThresholdValue *
            1024 ** (oldUnitIndex - newUnitIndex);
        } else {
          Fthreshold =
            thresholdMeasurementData[sceneName]['阈值获取卡片的引用'].state.meanThresholdValue;
        }
        thresholdMeasurementData[sceneName].Fthreshold = Fthreshold;
      }
      thresholdMeasurementData[sceneName]['阈值获取卡片显示状态'] = false;
      this.setState({
        thresholdMeasurementData,
      });
    }
  };

  /**
   * 当检测时间卡片选择一个时间点关闭的时候触发
   * @param {string} key 阈值测算数据对应的key
   * @param {string} timeStart 开始时间
   * @param {string} timeEnd 结束时间
   */
  ontimePiker = (key, timeStart, timeEnd) => {
    const { thresholdMeasurementData } = this.state;
    thresholdMeasurementData[key].Fstart_time = timeStart.toString();
    thresholdMeasurementData[key].Fend_time = timeEnd.toString();
    thresholdMeasurementData[key]['检测时间描述'] = `每日${timeStart}点-${timeEnd}点`;
    thresholdMeasurementData[key]['时间选择器显示状态'] = false;
    this.setState({
      thresholdMeasurementData,
    });
  };

  /**
   * 记录气泡卡片的实例
   */
  popoverInstanceRecord = (sceneName, ref) => {
    const { thresholdMeasurementData } = this.state;
    thresholdMeasurementData[sceneName]['阈值获取卡片的引用'] = ref;
  };

  /** 输出阈值测算数据（给父组件调用） */
  outputThresholdMeasurementData = () => {
    const { thresholdMeasurementData } = this.state;

    const cloneThresholdMeasurementData = cloneDeep(thresholdMeasurementData);
    if (cloneThresholdMeasurementData.Falert_mode === 'ai_baseline')
      return cloneThresholdMeasurementData;
    Object.keys(cloneThresholdMeasurementData).forEach((key) => {
      if (key !== 'Falert_mode') {
        // 找出当前单位
        const curUnit = cloneThresholdMeasurementData[key].阈值单位;
        const index = this.symbols.findIndex((item) => {
          return item === curUnit;
        });
        let Fthreshold = cloneThresholdMeasurementData[key].Fthreshold;
        // 单位换算
        if (index !== -1 && index !== 0) {
          Fthreshold *= 1024 ** index;
        }
        // 乘以300 bps 要转回bytes
        Fthreshold *= 300;
        cloneThresholdMeasurementData[key].Fthreshold = Fthreshold;
        cloneThresholdMeasurementData[key].阈值单位 = 'bytes';
      }
    });
    return cloneThresholdMeasurementData;
  };

  /** 计算测算项（给父组件调用） */
  calculationItem = () => {
    const { thresholdMeasurementData } = this.state;
    let isCheck = false; // 是否至少勾选了一个测算项
    let whetherItExceedsRange = true; // 是否场景阈值都没有超过1GB
    let measurementItemsNum = 0;
    Object.keys(thresholdMeasurementData).forEach((key) => {
      if (key !== 'Falert_mode') {
        if (thresholdMeasurementData[key].是否勾选) {
          isCheck = true;
          measurementItemsNum += 1;
        }

        // 找出当前单位
        const curUnit = thresholdMeasurementData[key].阈值单位;
        const index = this.symbols.findIndex((item) => {
          return item === curUnit;
        });
        let Fthreshold = thresholdMeasurementData[key].Fthreshold;
        // 阈值换算为bps
        if (index !== -1 && index !== 0) {
          Fthreshold *= 1024 ** index;
        }
        if (Fthreshold >= 1 * 1024 ** 3) {
          whetherItExceedsRange = false;
        }
      }
    });
    if (!isCheck) {
      message.warn('请至少勾选一个测算项');
    }
    if (!whetherItExceedsRange) {
      message.warn('设置阈值超过1GB/s(1073741824bps)上限，保存失败');
    }
    return { whetherTheConditionsAreMet: isCheck && whetherItExceedsRange, measurementItemsNum };
  };

  /** 返回一个结果判断某个场景值有没有发生过改变（给父组件调用） */
  sceneValueComparison = (sceneKey, sceneValue) => {
    const { assetsSelected } = this.props;
    const { thresholdMeasurementRecordData, thresholdMeasurementData } = this.state;
    if (Array.isArray(assetsSelected) && assetsSelected.length > 1) {
      return true;
    }
    if (thresholdMeasurementRecordData['Falert_mode'] !== thresholdMeasurementData['Falert_mode']) {
      return true;
    }
    if (
      thresholdMeasurementRecordData[sceneKey].Fstart_time !== sceneValue.Fstart_time ||
      thresholdMeasurementRecordData[sceneKey].Fend_time !== sceneValue.Fend_time ||
      thresholdMeasurementRecordData[sceneKey].Fthreshold * 300 !== sceneValue.Fthreshold
    ) {
      return true;
    }
    return false;
  };

  /** 添加到观察者模式
   * 添加到观察者模式的意思是把资产ip添加到观察者列表
   * alert_mode字段为设置为"observe"
   * scene_name字段设置为"observation"
   */
  handleAddedToTheObserverMode = async () => {
    const { dispatch, assetsSelected, handleAddedToTheObserverModeCallback } = this.props;
    const assetAdvancedAnalysis = [];
    const date = new Date();
    const curTime = moment(date).format(format);
    for (let i = 0; i < assetsSelected.length; i++) {
      const assetInfo = assetsSelected[i];
      const assetAdvancedAnalysisItem = {
        Fip: assetInfo.Fip,
        Falert_mode: 'observe',
        Fscene_name: 'observation',
        Fthreshold: 0,
        Fstart_time: '0',
        Fend_time: '24',
        Finsert_time: curTime,
        Fupdate_time: curTime,
        Fstatus: '200',
        Fstatus_reason: '准备进行资产流量数据统计',
      };
      assetAdvancedAnalysis.push(assetAdvancedAnalysisItem);
    }
    console.log('要加入的观察模式的资产分析数据===', assetAdvancedAnalysis);
    await dispatch({
      type: 'advancedAnalysis/editAssetAnalysisSheet',
      payload: {
        assetAdvancedAnalysis,
      },
    });
    handleAddedToTheObserverModeCallback();
  };

  render() {
    const { thresholdMeasurementData, sceneNameArr } = this.state;
    return (
      <div className="container">
        <div className={styles.content}>
          {/* AI测算卡片 */}
          <Card
            className={styles.cardBox}
            title={
              <Skeleton loading={false}>
                <Meta
                  avatar={<Avatar className="avatarB" />}
                  title={
                    <h4 style={{ fontSize: '20px', fontWeight: 700 }}>
                      AI测算&nbsp;
                      <span style={{ fontSize: '16px', fontWeight: 400 }}>
                        通过深度学习算法学习资产在七天时间内的流量基线，并预测资产未来一段时间的流量大小。
                      </span>
                    </h4>
                  }
                  description={
                    sceneNameArr.length > 0 &&
                    thresholdMeasurementData['Falert_mode'] === 'ai_baseline'
                      ? `当前已开启 ${sceneNameArr.length} 项场景进行测算`
                      : '未开始场景测算'
                  }
                />
              </Skeleton>
            }
            extra={
              <Switch
                checked={thresholdMeasurementData['Falert_mode'] === 'ai_baseline'}
                onChange={() => {
                  this.handleSwitchChange('ai_baseline');
                }}
              />
            }
          >
            {thresholdMeasurementData['Falert_mode'] === 'ai_baseline' && (
              <Row>
                <Col span={2}>
                  <p>AI测算</p>
                </Col>
                <Col span={22}>{this.aIMeasurementRender()}</Col>
              </Row>
            )}
          </Card>

          {/* 阈值测算卡片 */}
          <Card
            className={styles.cardBox}
            title={
              <Skeleton loading={false}>
                <Meta
                  avatar={<Avatar className="avatarA" />}
                  title={
                    <h4 style={{ fontSize: '20px', fontWeight: 700 }}>
                      阈值测算&nbsp;
                      <span style={{ fontSize: '16px', fontWeight: 400 }}>
                        通过设定各个场景流量的阈值（可参考历史流量曲线），当流量大小超过设定阈值则产生告警。
                      </span>
                    </h4>
                  }
                  description={
                    sceneNameArr.length > 0 &&
                    thresholdMeasurementData['Falert_mode'] === 'threshold'
                      ? `当前已开启 ${sceneNameArr.length} 项场景进行测算`
                      : '未开始场景测算'
                  }
                />
              </Skeleton>
            }
            extra={
              <Switch
                checked={thresholdMeasurementData['Falert_mode'] === 'threshold'}
                onChange={() => {
                  this.handleSwitchChange('threshold');
                }}
              />
            }
          >
            {thresholdMeasurementData['Falert_mode'] === 'threshold' && (
              <Row>
                <Col span={2}>
                  <p>自定义测算</p>
                </Col>
                <Col span={22}>{this.customMeasurementRender()}</Col>
              </Row>
            )}
          </Card>
        </div>
      </div>
    );
  }
}

export default SceneCalculated;
