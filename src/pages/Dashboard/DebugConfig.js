import React, { Component, Fragment } from 'react';
import { connect } from 'umi';

import {
  InfoCircleOutlined,
  LockOutlined,
  QuestionCircleFilled,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';

import {
  Table,
  Switch,
  Spin,
  message,
  Input,
  Tooltip,
  Button,
  List,
  Radio,
  Row,
  Col,
  InputNumber,
  Select,
  Modal,
} from 'antd';
// import FlexForm from '@/components/FlexForm';
import Cookies from 'js-cookie';
import _ from 'lodash';
// import moment from 'moment';
import FlexCardForm from '@/components/FlexCardForm';
import { LineChartMul } from '@/components/Charts';
import authority from '@/utils/authority';
const { getAuth } = authority;
import CommonDetailHeader from '@/components/CommonDetailHeader';
import styles from './SystemMonitor.less';
// import SystemLogModal from './Modal/SystemLogModal';
import QuotaTips from '@/components/QuotaTips';

const { confirm } = Modal;

/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */

const crypto = require('crypto');

const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const statusMap = {
  unknown: '未知',
  enabled: '是',
  disabled: '否',
};
const runStatusMap = {
  unknown: { dotStyle: 'dotGray', textColor: 'fontBase', txt: '未知' },
  active: { dotStyle: 'dotGreen', textColor: 'fontGreen', txt: '已启动' },
  inactive: { dotStyle: 'dotRed', textColor: 'fontRed', txt: '已停用' },
  activing: {
    dotStyle: 'dotYellow',
    textColor: 'fontYellow',
    txt: '正在启动',
  },
  deactivating: { dotStyle: 'dotRed', textColor: 'fontRed', txt: '正在停用' },
  failed: { dotStyle: 'dotGray', textColor: 'fontBase', txt: '启动失败' },
};
const consumeStatusMap = {
  green: {
    dotStyle: 'dotGreen',
    textColor: 'fontGreen',
    txt: '正常',
    tips: '完成消费时间小于30秒',
  },
  yellow: {
    dotStyle: 'dotYellow',
    textColor: 'fontYellow',
    txt: '延迟',
    tips: '完成消费时间介于30到300秒之间',
  },
  red: { dotStyle: 'dotRed', textColor: 'fontRed', txt: '滞缓', tips: '完成消费时间大于300秒 ' },
};
const pageSizeOptions = ['6', '10', '20'];
class DebugConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curServer: -1,
      processing: false,
      hasAuth: Cookies.get('__has_logined__') === '1' || false,
      timeRange: [],
      flinkObj: {},
      webshellAiInfo: {},
      aiReqing: false,
      flinking: false,
      statsMap: {},
      initStats: [],
      // 关机按钮状态 1， 2，3
      shutdownBtnStatus: 1,
      // 重启按钮状态 1， 2，3
      restartBtnStatus: 1,
      // 清除历史数据按钮状态 1， 2，3
      restoreFactorySettingsBtnStates: 1,
      // logModal: false,
      // ip: '',
      // service: '',
      sandbox_key: '',
    };
    this.debugWritable = getAuth('/dashboard/systemMonitor/debugConfig') === 'rw';
    // this.monitorReadable = getAuth('/overview/systemMonitor');
    this.runningCol = [
      {
        title: '服务名称',
        dataIndex: 'ps_name',
        key: 'ps_name',
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
          const reg = new RegExp(value, 'gi');
          return reg.test(record.ps_name);
        },
        // eslint-disable-next-line no-shadow
        filterDropdown: ({ setSelectedKeys, selectedKeys, clearFilters, confirm }) => (
          <div style={{ padding: 8 }}>
            <Input
              ref={(node) => {
                this.searchInput = node;
              }}
              value={selectedKeys[0]}
              placeholder="请输入服务名称搜索"
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Button
                onClick={() => clearFilters()}
                size="small"
                style={{ width: 80, marginRight: 12 }}
              >
                重置
              </Button>
              <Button onClick={() => confirm()} size="small" style={{ width: 80 }}>
                搜索
              </Button>
            </div>
          </div>
        ),
        render: (text) => text,
      },
      { title: 'IP_TAG', dataIndex: 'ip_tag', key: 'ip_tag' },
      { title: 'IP', dataIndex: 'ip', key: 'ip' },
      {
        title: '自启动状态',
        dataIndex: 'auto_start_status',
        key: 'auto_start_status',
        render: (text) => statusMap[text],
      },
      {
        title: '运行状态',
        dataIndex: 'run_status',
        key: 'run_status',
        render: (
          text // if (moment().valueOf() - moment(record.Fupdate_time).valueOf() >= 3 * 60 * 1000) { // let status = text;
        ) => (
          //   status = 'inactive';
          // }
          <div className={runStatusMap[text] && runStatusMap[text].textColor}>
            <span className={runStatusMap[text] && runStatusMap[text].dotStyle} />
            {runStatusMap[text] && runStatusMap[text].txt}
          </div>
        ),
      },
      { title: 'PID', dataIndex: 'pid', key: 'pid' },
      { title: '运行时长', dataIndex: 'running_time', key: 'running_time' },
      {
        title: '操作',
        dataIndex: '',
        key: '',
        render: (item) => {
          const { curServer } = this.state;
          // let disable = false;
          // if (moment().valueOf() - moment(item.Fupdate_time).valueOf() >= 3 * 60 * 1000) {
          //   disable = true;
          // }
          return (
            <div>
              {curServer === item.id ? (
                <Spin />
              ) : (
                <Switch
                  checkedChildren="启动"
                  unCheckedChildren="停止"
                  checked={item.run_status === 'active'}
                  disabled={
                    item.run_status === 'activing' ||
                    item.run_status === 'deactivating' ||
                    item.ps_name === 'web_console' ||
                    !this.debugWritable
                  }
                  onChange={() => this.changeStatus(item)}
                />
              )}
            </div>
          );
        },
      },
    ];

    const byteFormat = (number) => {
      number = +number || 0;

      if (number >= 1024 * 1024 * 1024) {
        return `${parseFloat(number / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      }
      if (number >= 1024 * 1024) {
        return `${parseFloat(number / (1024 * 1024)).toFixed(2)} MB`;
      }
      if (number >= 1024) {
        return `${parseFloat(number / 1024).toFixed(2)} KB`;
      }
      return `${number} KB`;
    };

    const timeFormat = (number) => {
      number = +number || 0;

      const result = [];
      if (number >= 1000 * 60 * 60 * 24 * 365) {
        result.push(`${parseInt(number / (1000 * 60 * 60 * 24 * 365), 10)}年`);
        number %= 1000 * 60 * 60 * 24 * 365;
      }

      if (number >= 1000 * 60 * 60 * 24) {
        result.push(`${parseInt(number / (1000 * 60 * 60 * 24), 10)}天`);
        number %= 1000 * 60 * 60 * 24;
      }

      if (number >= 1000 * 60 * 60) {
        result.push(`${parseInt(number / (1000 * 60 * 60), 10)}时`);
        number %= 1000 * 60 * 60;
      }

      if (number >= 1000 * 60) {
        result.push(`${parseInt(number / (1000 * 60), 10)}分`);
        number %= 1000 * 60;
      }

      if (number >= 1000) {
        result.push(`${parseInt(number / 1000, 10)}秒`);
        number %= 1000;
      }

      return result.join('');
    };

    this.serverMemCol = [
      {
        title: '服务名称',
        dataIndex: 'ps_name',
        key: 'ps_name',
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
          const reg = new RegExp(value, 'gi');
          return reg.test(record.ps_name);
        },
        filterDropdown: ({ setSelectedKeys, selectedKeys, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              ref={(node) => {
                this.searchInput = node;
              }}
              value={selectedKeys[0]}
              placeholder="请输入服务名称搜索"
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Button
                onClick={() => clearFilters()}
                size="small"
                style={{ width: 80, marginRight: 12 }}
              >
                重置
              </Button>
              <Button onClick={() => confirm()} size="small" style={{ width: 80 }}>
                搜索
              </Button>
            </div>
          </div>
        ),
        width: 200,
        render: (text) => text,
      },
      { title: 'IP_TAG', dataIndex: 'ip_tag', key: 'ip_tag', width: 120 },
      { title: 'IP', dataIndex: 'ip', key: 'ip', width: 120 },
      {
        title: 'heap使用率',
        dataIndex: 'heap_used_percent',
        key: 'heap_used_percent',
        width: 120,
      },
      {
        title: '当前提交',
        dataIndex: 'heap_committed_in_bytes',
        key: 'heap_committed_in_bytes',
        width: 120,
        render: (text) => byteFormat(text),
      },
      {
        title: '最大可提交',
        dataIndex: 'heap_max_in_bytes',
        key: 'heap_max_in_bytes',
        width: 120,
        render: (text) => byteFormat(text),
      },
      {
        title: '年轻代gc耗时',
        dataIndex: 'young_collection_time_in_millis',
        key: 'young_collection_time_in_millis',
        width: 120,
        render: (text) => `${text} ms`,
      },
      {
        title: '老年代gc耗时',
        dataIndex: 'old_collection_time_in_millis',
        key: 'old_collection_time_in_millis',
        width: 120,
        render: (text) => `${text} ms`,
      },
      {
        title: '运行时长',
        dataIndex: 'uptime_in_millis',
        key: 'uptime_in_millis',
        width: 120,
        render: (text) => timeFormat(text),
      },
    ];
    this.engineCol = [
      {
        title: '引擎名称',
        dataIndex: 'Fconsumer_group',
        key: 'Fconsumer_group',
      },
      {
        title: '数据源生产速度',
        dataIndex: 'Fproducer_speed',
        key: 'Fproducer_speed',
        render: (text) => `${text}条/s`,
      },
      {
        title: '消费速度',
        dataIndex: 'Fconsumer_speed',
        key: 'Fconsumer_speed',
        render: (text) => `${text}条/s`,
      },
      {
        title: '消费延迟',
        dataIndex: 'Flatency',
        key: 'Flatency',
        render: (text) => `${text}条`,
      },
      {
        title: '总数据量',
        dataIndex: 'Ftotal_msg',
        key: 'Ftotal_msg',
        render: (text) => `${text}条`,
      },
      {
        title: '状态',
        dataIndex: 'Fstatus',
        key: 'Fstatus',
        render: (text) => (
          <div className={consumeStatusMap[text] && consumeStatusMap[text].textColor}>
            <span className={consumeStatusMap[text] && consumeStatusMap[text].dotStyle} />
            <QuotaTips
              title={consumeStatusMap[text] && consumeStatusMap[text].txt}
              subtitle={consumeStatusMap[text] && consumeStatusMap[text].tips}
            />
          </div>
        ),
      },
    ];
    const revertToInt = (value, max = 100) => {
      const val = parseInt(value, 10) || 0;
      return val > max ? max : val;
    };
    this.formList = [
      {
        label: 'cpu利用率告警阈值',
        key: 'Fcpu_used_threld',
        type: 'inputNumber',
        min: 50,
        max: 100,
        unit: '%',
        formatter: revertToInt,
      },
      {
        label: 'cpu负载告警阈值',
        key: 'Fcpu_load_threld',
        type: 'inputNumber',
        min: 50,
        max: 1000,
        unit: '%',
        // formatter: revertToInt,
      },
      {
        label: '内存利用率告警阈值',
        key: 'Fmem_used_threld',
        type: 'inputNumber',
        min: 50,
        max: 100,
        unit: '%',
        formatter: revertToInt,
      },
      {
        label: '磁盘利用率告警阈值',
        key: 'Fdisk_used_threld',
        type: 'inputNumber',
        min: 50,
        max: 100,
        unit: '%',
        formatter: revertToInt,
      },
      {
        label: '磁盘负载告警阈值',
        key: 'Fdisk_load_threld',
        type: 'inputNumber',
        min: 50,
        max: 100,
        unit: '%',
        formatter: revertToInt,
      },
      {
        label: 'heap利用率告警阈值',
        key: 'Fheap_used_percent_threld',
        type: 'inputNumber',
        min: 50,
        max: 100,
        unit: '%',
        formatter: revertToInt,
      },
      {
        label: 'gc回收告警阈值',
        key: 'Frubbish_recycle_rate',
        type: 'inputNumber',
        min: 1,
        max: 100,
        unit: '%',
        formatter: revertToInt,
      },
      {
        label: '服务重启告警阈值',
        key: 'Frestart_times_threld',
        type: 'inputNumber',
        min: 1,
        max: 100,
        unit: '次',
        formatter: revertToInt,
        footerType: null,
      },
      {
        label: 'ES热数据最大保留比率',
        key: 'Fes_heap_close_rate',
        type: 'inputNumber',
        min: 10,
        max: 100,
        formatter: revertToInt,
        footerType: null,
      },
      {
        label: 'ES冷数据天数',
        toolTip: '最长保留365天',
        key: 'Fes_colddata_days',
        type: 'inputNumber',
        min: 0,
        max: 365,
        unit: '天',
        formatter: (value) => revertToInt(value, 365),
        footerType: null,
        disabled: true,
      },
      {
        label: 'ES热数据天数',
        toolTip: '最长保留365天',
        key: 'Fes_hotdata_days',
        type: 'inputNumber',
        min: 0,
        max: 365,
        unit: '天',
        formatter: (value) => revertToInt(value, 365),
        footerType: null,
        disabled: true,
      },
      // {
      //   label: 'ES热数据最大保留条数',
      //   toolTip: '单位：亿条，最大保留1000亿条',
      //   key: 'Fes_doc_cnt_max_reserve',
      //   type: 'inputNumber',
      //   min: 0,
      //   max: 1000,
      //   unit: '亿条',
      //   formatter: value => revertToInt(value, 1000),
      //   footerType: null,
      // },
      // {
      //   label: 'ES已存储数据天数',
      //   key: 'Fes_now_reserve_days',
      //   type: 'inputNumber',
      //   unit: '天',
      //   footerType: null,
      //   disabled: true,
      // },
    ];

    if (this.state.hasAuth) {
      const { dispatch } = this.props;
      dispatch({ type: 'debugConfig/fetchRunningList' });
      dispatch({ type: 'debugConfig/fetchServerMemList' });
      dispatch({ type: 'debugConfig/fetchEngineList' });
      dispatch({ type: 'debugConfig/fetchMonitorThrehold' });
      dispatch({ type: 'debugConfig/fetchProbesData' }).then(() => {
        const {
          debugConfig: { probes },
        } = this.props;
        const len = probes.length;
        const timeRange = Array(len).fill('24h');
        const initStats = Array(len).fill('stats.decoder.bytes_delta');
        this.setState({ timeRange, initStats });
      });
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'debugConfig/fetchFlinkCtrl' }).then(() => {
      const {
        debugConfig: { flinkObj },
      } = this.props;
      this.setState({ flinkObj });
    });
    dispatch({ type: 'debugConfig/fetchWebsellAi' }).then(() => {
      const {
        debugConfig: { webshellAiInfo },
      } = this.props;
      this.setState({ webshellAiInfo });
    });
    dispatch({ type: 'debugConfig/fetchStats' }).then(() => {
      const {
        debugConfig: { stats },
      } = this.props;
      this.setState({ statsMap: stats });
    });
    dispatch({ type: 'debugConfig/queryHaboQueueSampleTypeCount' });
    await dispatch({ type: 'debugConfig/queryHaboMasterStatus' });
    const {
      debugConfig: { masterStatus },
    } = this.props;
    if (masterStatus.length > 0) {
      this.setState({
        sandbox_key: masterStatus[0].name,
      });
    }
  }

  handleOnOpenModal = (key, isOpen) => {
    this.setState({ [key]: isOpen });
  };

  changeStatus = (item) => {
    const { dispatch } = this.props;
    const { id, ip, ps_name, run_status } = item;
    this.setState({ curServer: id });
    let operation = 'started';
    let msg = '服务运行状态启动成功';
    if (run_status === 'active') {
      operation = 'stopped';
      msg = '服务运行状态停止成功';
    }
    dispatch({
      type: 'debugConfig/updateRunningState',
      payload: { ip, service: ps_name, operation },
    })
      .then(() => {
        if (ip === '0.0.0.0') {
          message.success(`指令下发成功,请稍后查看指令执行结果`);
        } else {
          message.success(msg);
        }
        this.setState({ curServer: -1 });
        dispatch({ type: 'debugConfig/fetchRunningList' });
      })
      .catch(() => {
        this.setState({ curServer: -1 });
      });
  };

  onSave = (values, callback) => {
    const { dispatch } = this.props;
    const { processing } = this.state;
    if (processing) {
      return;
    }
    this.setState({ processing: true });
    dispatch({ type: 'debugConfig/updateMonitorThrehold', payload: values })
      .then(() => {
        message.success('监控阈值保存成功');
        this.setState({ processing: false });
        dispatch({ type: 'debugConfig/fetchMonitorThrehold' })
          .then(() => {
            if (callback) {
              callback();
            }
          })
          .catch(() => {});
      })
      .catch(() => {
        this.setState({ processing: false });
      });
  };

  // 授权登录验证
  handleSubmit = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log('values::', values);
        const { pass, user } = values;
        const hexPass = crypto.createHash('md5').update(pass).digest('hex');
        dispatch({
          type: 'debugConfig/authCheck',
          payload: { user, pass: hexPass },
        })
          .then(() => {
            this.setState({ hasAuth: true }, () => {
              // 2h expire
              Cookies.set('__has_logined__', 1, {
                expires: new Date(new Date() * 1 + 1000 * 60 * 60 * 2),
              });
            });
            dispatch({ type: 'debugConfig/fetchRunningList' });
            dispatch({ type: 'debugConfig/fetchServerMemList' });
            dispatch({ type: 'debugConfig/fetchEngineList' });
            dispatch({ type: 'debugConfig/fetchMonitorThrehold' });
            dispatch({ type: 'debugConfig/fetchProbesData' }).then(() => {
              const {
                debugConfig: { probes },
              } = this.props;
              const len = probes.length;
              const timeRange = Array(len).fill('24h');
              const initStats = Array(len).fill('stats.decoder.bytes_delta');
              this.setState({ timeRange, initStats });
            });
          })
          .catch(() => {});
      }
    });
  };

  handleChangeChartData = (e, item, index) => {
    const { value } = e.target;
    const {
      dispatch,
      debugConfig: { probes },
    } = this.props;
    const { timeRange, initStats } = this.state;
    const newTimeRange = _.clone(timeRange);
    newTimeRange[index] = value;
    this.setState({ timeRange: newTimeRange });
    // 发请求
    dispatch({
      type: 'debugConfig/fetchChartListData',
      payload: { value: e.target.value, id: probes[index].id, num: index, stats: initStats[index] },
    });
  };

  flinkSelectChange = (value) => {
    const {
      debugConfig: { eventTypeList },
    } = this.props;
    const isAllSelect = eventTypeList.every((key) => value.indexOf(key) > -1);

    let flinkObj = { Fdeny_all: 0, Fdeny_list: value };
    if (isAllSelect) {
      flinkObj = { Fdeny_all: 1, Fdeny_list: value };
    }
    this.setState({ flinkObj });
  };

  flinkYesClick = () => {
    const { dispatch } = this.props;
    const { flinkObj, flinking } = this.state;
    if (flinking) return;
    this.setState({ flinking: true });
    // console.log('确定flinkObj==', flinkObj);
    flinkObj.Fdeny_list = flinkObj.Fdeny_list.join(',');
    dispatch({
      type: 'debugConfig/updateFlinkCtrl',
      payload: flinkObj,
    })
      .then((json) => {
        if (json.error_code === 0) {
          message.success('FLINK ETL配置设置成功');
        } else {
          message.error('FLINK ETL配置设置失败');
        }
        this.setState({ flinking: false });
        this.flinkNoClick();
      })
      .catch(() => {
        // console.log(653, 'err==', err);
        this.setState({ flinking: false });
        this.flinkNoClick();
        message.error('FLINK ETL配置设置失败');
      });
  };

  flinkNoClick = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'debugConfig/fetchFlinkCtrl' }).then(() => {
      const {
        debugConfig: { flinkObj },
      } = this.props;
      this.setState({ flinkObj });
    });
  };

  statsChange = (value, item, index) => {
    const {
      dispatch,
      debugConfig: { probes },
    } = this.props;
    const { timeRange, initStats } = this.state;
    const newInitStats = _.clone(initStats);
    newInitStats[index] = value;
    this.setState({ initStats: newInitStats });
    // 发送请求
    dispatch({
      type: 'debugConfig/fetchChartListData',
      payload: { value: timeRange[index], id: probes[index].id, num: index, stats: value },
    });
  };

  handleInputChange = (type, key, e) => {
    const { [type]: curType } = this.state;
    // const curVal = typeof e === 'number' ? e : '';
    const curVal = e || 0;
    // console.log('e==', e, 'curVal=', curVal);
    const newType = Object.assign({}, curType, { [key]: curVal });
    this.setState({ [type]: newType });
  };

  WebshellAiNoClick = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'debugConfig/fetchWebsellAi' }).then(() => {
      const {
        debugConfig: { webshellAiInfo },
      } = this.props;
      this.setState({ webshellAiInfo });
    });
  };

  WebshellYesClick = () => {
    const { dispatch } = this.props;
    const { webshellAiInfo, aiReqing } = this.state;
    // console.log('webshellAiInfo==', webshellAiInfo);
    if (aiReqing) return;
    this.setState({ aiReqing: true });
    dispatch({
      type: 'debugConfig/updateWebsellAi',
      payload: webshellAiInfo,
    })
      .then((json) => {
        if (json.error_code === 0) {
          message.success('Webshell AI模型分析配置 设置成功');
        } else {
          message.error(json.msg);
        }
        this.setState({ aiReqing: false });
        this.WebshellAiNoClick();
      })
      .catch((err) => {
        // console.log(766, err);
        this.setState({ aiReqing: false });
        this.WebshellAiNoClick();
        message.error(err.msg);
      });
  };

  // 处理关机按钮逻辑
  handelShutdownConfirm = (shutdownBtnStatus) => {
    const that = this;
    if (shutdownBtnStatus === 1) {
      confirm({
        content: <p>确定要进行关机操作吗？</p>,
        onOk() {
          that.setState({ shutdownBtnStatus: 2 });
          that.handelShutdownConfirm(2);
        },
        onCancel() {
          that.setState({ shutdownBtnStatus: 1 });
        },
      });
    } else if (shutdownBtnStatus === 2) {
      confirm({
        content: <p>请再次确认是否要进行关机操作？</p>,
        onOk() {
          that.setState({ shutdownBtnStatus: 3 });
          that.handelShutdownConfirm(3);
        },
        onCancel() {
          that.setState({ shutdownBtnStatus: 1 });
        },
      });
    } else if (shutdownBtnStatus === 3) {
      console.log('执行关机按钮逻辑！！');
      const { dispatch } = this.props;
      dispatch({ type: 'debugConfig/handelShutdownLogic' }).then(() => {
        message.success(`关机操作执行成功！`);
      });
      that.setState({ shutdownBtnStatus: 1 });
    }
  };

  // 重启按钮逻辑
  handelRestartConfirm = (restartBtnStatus) => {
    const that = this;
    if (restartBtnStatus === 1) {
      confirm({
        content: <p>确定要进行重启操作吗？</p>,
        onOk() {
          that.setState({ restartBtnStatus: 2 });
          that.handelRestartConfirm(2);
        },
        onCancel() {
          that.setState({ restartBtnStatus: 1 });
        },
      });
    } else if (restartBtnStatus === 2) {
      confirm({
        content: <p>请再次确认是否要进行重启操作？</p>,
        onOk() {
          that.setState({ restartBtnStatus: 3 });
          that.handelRestartConfirm(3);
        },
        onCancel() {
          that.setState({ restartBtnStatus: 1 });
        },
      });
    } else if (restartBtnStatus === 3) {
      console.log('执行重启按钮逻辑！！');
      const { dispatch } = this.props;
      dispatch({ type: 'debugConfig/handelRestartLogic' }).then(() => {
        message.success(`重启操作执行成功！`);
      });
      this.setState({ restartBtnStatus: 1 });
    }
  };

  // 清除历史数据按钮逻辑
  handelRestoreFactorySettingsConfirm = (restoreFactorySettingsBtnStates) => {
    const that = this;
    if (restoreFactorySettingsBtnStates === 1) {
      confirm({
        content: <p>确定要进行清除历史数据吗？</p>,
        onOk() {
          that.setState({ restoreFactorySettingsBtnStates: 2 });
          that.handelRestoreFactorySettingsConfirm(2);
        },
        onCancel() {
          that.setState({ restoreFactorySettingsBtnStates: 1 });
        },
      });
    } else if (restoreFactorySettingsBtnStates === 2) {
      confirm({
        content: <p>请再次确认是否要清除历史数据？</p>,
        onOk() {
          that.setState({ restoreFactorySettingsBtnStates: 3 });
          that.handelRestoreFactorySettingsConfirm(3);
        },
        onCancel() {
          that.setState({ restoreFactorySettingsBtnStates: 1 });
        },
      });
    } else if (restoreFactorySettingsBtnStates === 3) {
      console.log('清除历史数据按钮逻辑！！');
      const { dispatch } = this.props;
      dispatch({ type: 'debugConfig/handelRestoreFactorySettingsLogic' }).then(() => {
        message.success(`清除历史数据操作执行成功！`);
      });
      this.setState({ restoreFactorySettingsBtnStates: 1 });
    }
  };

  render() {
    const {
      debugConfig: {
        runningList,
        serverMemList,
        engineList,
        monitorThrehold,
        probes,
        sandboxTypeDistribution,
        masterStatus,
      },
      aiLoading,
      runLoading,
      memLoading,
      engLoading,
      probesLoading,
      shutdownLoading,
      restartLoading,
      restoreFactorySettingsLoading,
      typeCountLoading,
      queryHaboMasterStatusLoading,
      form,
    } = this.props;
    const {
      hasAuth,
      timeRange,
      webshellAiInfo,
      aiReqing,
      statsMap,
      initStats,
      shutdownBtnStatus,
      restartBtnStatus,
      restoreFactorySettingsBtnStates,
      sandbox_key,
    } = this.state;

    const { getFieldDecorator } = form;
    return (
      <div className="container">
        <div>
          {!hasAuth ? (
            <div className={styles.authBlock} style={{ backgroundColor: '#fff' }}>
              <div className={styles.authHeader}>
                <InfoCircleOutlined className={styles.msgIcon} />
                <span>&nbsp;请输入该系统的超级管理员账号密码进行验证。</span>
              </div>
              <Form className={styles.loginForm} onSubmit={this.handleSubmit}>
                {/* chrome防止代码自动填充 */}
                <Input style={{ display: 'none' }} />
                <FormItem {...formItemLayout} label="用户标识">
                  {getFieldDecorator('user', {
                    initialValue: '',
                    rules: [
                      {
                        required: true,
                        message: '请输入用户标识!',
                      },
                    ],
                  })(
                    <Input
                      prefix={
                        <UserOutlined
                          style={{
                            color: 'rgba(0,0,0,.25)',
                          }} />
                      }
                      placeholder="用户名"
                      autoComplete="off"
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="密码">
                  {getFieldDecorator('pass', {
                    initialValue: '',
                    rules: [
                      {
                        required: true,
                        message: '请输入密码!',
                      },
                    ],
                  })(
                    <Input
                      prefix={
                        <LockOutlined
                          style={{
                            color: 'rgba(0,0,0,.25)',
                          }} />
                      }
                      type="password"
                      placeholder="密码"
                      autoComplete="new-password"
                    />
                  )}
                </FormItem>
                <Button type="primary" className={styles.loginFormBtn} htmlType="submit">
                  登录
                </Button>
              </Form>
            </div>
          ) : (
            <div className={styles.topWrap}>
              <CommonDetailHeader title="高级运维模式" url="/dashboard/systemMonitor/platform" />
              <div style={{ padding: '0 12px 12px' }}>
                <Row gutter={24}>
                  <Col span={6}>
                    <div className={styles.childWrap}>
                      <div className={styles.pjSecHeader}>Webshell AI模型分析配置</div>
                      <div style={{ margin: '20px 24px 12px', height: 232 }}>
                        {aiLoading ? (
                          <Spin />
                        ) : (
                          <Fragment>
                            <div style={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                              <div style={{ width: 180 }}>
                                <span>模型融合权重 </span>
                                <Tooltip title="float类型值，范围：0.0-1.0" placement="rightTop">
                                  <QuestionCircleFilled className="fontBlue" />
                                </Tooltip>
                                <span> ：</span>
                              </div>
                              <div style={{ width: '35%' }}>
                                <InputNumber
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  formatter={(value) => value}
                                  parser={(value) => value.replace(/[,$@]/g, '')}
                                  style={{ width: '100%' }}
                                  value={webshellAiInfo.fnn_weight}
                                  onChange={(e) => {
                                    this.handleInputChange('webshellAiInfo', 'fnn_weight', e);
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                              <div style={{ width: 180 }}>
                                <span>模型置信度阈值 </span>
                                <Tooltip title="float类型值，范围：0.0-1.0" placement="rightTop">
                                  <QuestionCircleFilled className="fontBlue" />
                                </Tooltip>
                                <span> ：</span>
                              </div>
                              <div style={{ width: '35%' }}>
                                <InputNumber
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  formatter={(value) => value}
                                  parser={(value) => value.replace(/[,$@]/g, '')}
                                  style={{ width: '100%' }}
                                  value={webshellAiInfo.threshold}
                                  onChange={(e) => {
                                    this.handleInputChange('webshellAiInfo', 'threshold', e);
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                              <div style={{ width: 180 }}>
                                <span>OPCODE序列解析长度 </span>
                                <Tooltip title="int类型值，范围：100-2000" placement="rightTop">
                                  <QuestionCircleFilled className="fontBlue" />
                                </Tooltip>
                                <span> ：</span>
                              </div>
                              <div style={{ width: '35%' }}>
                                <InputNumber
                                  min={100}
                                  max={2000}
                                  formatter={(value) => value}
                                  parser={(value) => value.replace(/[,.$@]/g, '')}
                                  style={{ width: '100%' }}
                                  value={webshellAiInfo.vocabulary_size_max}
                                  onChange={(e) => {
                                    this.handleInputChange(
                                      'webshellAiInfo',
                                      'vocabulary_size_max',
                                      e
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                              <div style={{ width: 180 }}>
                                <span>预测时CPU核数限制 </span>
                                <Tooltip title="int类型值，范围：0-16" placement="rightTop">
                                  <QuestionCircleFilled className="fontBlue" />
                                </Tooltip>
                                <span> ：</span>
                              </div>
                              <div style={{ width: '35%' }}>
                                <InputNumber
                                  min={0}
                                  max={16}
                                  formatter={(value) => value}
                                  parser={(value) => value.replace(/[,.$@]/g, '')}
                                  style={{ width: '100%' }}
                                  value={webshellAiInfo.cpu_num}
                                  onChange={(e) => {
                                    this.handleInputChange('webshellAiInfo', 'cpu_num', e);
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ padding: '20px 0 20px 32%' }}>
                              <Button
                                type="primary"
                                loading={aiReqing}
                                onClick={this.WebshellYesClick}
                              >
                                确定
                              </Button>
                              <Button style={{ marginLeft: 20 }} onClick={this.WebshellAiNoClick}>
                                取消
                              </Button>
                            </div>
                          </Fragment>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.childWrap}>
                      <div className={styles.pjSecHeader}>设备控制</div>

                      <div style={{ margin: '0px 24px 12px', height: 253 }}>
                        <div>
                          <Button
                            style={{
                              backgroundColor: '#e6a23c',
                              borderColor: '#e6a23c',
                              color: '#fff',
                              margin: '20px 20px 0px 0px',
                            }}
                            loading={shutdownLoading}
                            onClick={() => {
                              this.handelShutdownConfirm(shutdownBtnStatus);
                            }}
                          >
                            关机
                          </Button>
                          <Button
                            style={{
                              backgroundColor: '#e6a23c',
                              borderColor: '#e6a23c',
                              color: '#fff',
                              margin: '20px 20px 0px 0px',
                            }}
                            loading={restartLoading}
                            onClick={() => {
                              this.handelRestartConfirm(restartBtnStatus);
                            }}
                          >
                            重启
                          </Button>
                          <Button
                            style={{
                              backgroundColor: '#f56c6c',
                              borderColor: '#f56c6c',
                              color: '#fff',
                              margin: '20px 20px 0px 0px',
                            }}
                            loading={restoreFactorySettingsLoading}
                            onClick={() => {
                              this.handelRestoreFactorySettingsConfirm(
                                restoreFactorySettingsBtnStates
                              );
                            }}
                          >
                            清除历史数据
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.childWrap}>
                      <div className={styles.pjSecHeader}>沙箱检测队列样本类型分布</div>
                      <div style={{ margin: '20px 24px 12px', height: 232 }}>
                        <Spin spinning={typeCountLoading}>
                          {Object.keys(sandboxTypeDistribution).length === 0 ? (
                            <p style={{ fontSize: 24 }}>当前沙箱没有待检测的样本！</p>
                          ) : (
                            <div>
                              {Object.keys(sandboxTypeDistribution).map((key, index) => {
                                return (
                                  <p key={index} style={{ paddingBottom: 5, overflow: 'hidden' }}>
                                    <span
                                      style={{
                                        color: 'rgba(0,0,0,.85)',
                                        fontWeight: 400,
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                        marginRight: 4,
                                      }}
                                    >
                                      {key}
                                    </span>
                                    <Tooltip
                                      title={`${key}文件还原较多可能会使沙箱积压，影响到其他类型的样本检测，建议修改文件还原规则`}
                                      placement="rightTop"
                                    >
                                      <QuestionCircleFilled className="fontBlue" />
                                    </Tooltip>
                                    <span style={{ marginLeft: 4 }}>：</span>
                                    <span
                                      style={{
                                        color: 'rgba(0,0,0,.65)',
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {sandboxTypeDistribution[key]}
                                    </span>
                                  </p>
                                );
                              })}
                            </div>
                          )}
                        </Spin>
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.childWrap}>
                      <div className={styles.pjSecHeader}>沙箱日志下载</div>
                      <div style={{ margin: '20px 24px 12px', height: 232 }}>
                        <Spin spinning={queryHaboMasterStatusLoading}>
                          {masterStatus.length === 0 ? (
                            <h3>暂无沙箱列表</h3>
                          ) : (
                            <Fragment>
                              <span style={{ marginRight: 20 }}>设备列表</span>
                              <Select
                                style={{ minWidth: '300px', maxWidth: '600px' }}
                                onChange={(value) => {
                                  this.setState({ sandbox_key: value });
                                }}
                                value={sandbox_key}
                              >
                                {masterStatus.map((stats) => (
                                  <Option key={stats.name}>{stats.name}</Option>
                                ))}
                              </Select>
                              <Button
                                type="link"
                                size="size"
                                disabled={sandbox_key === ''}
                                onClick={() => {
                                  if (sandbox_key === 'master') {
                                    window.open(
                                      `/api/dashboard/sanboxLog?params={"slaver_name":""}&timestamp=${new Date().getTime()}`
                                    );
                                  } else {
                                    const index = masterStatus.findIndex((item) => {
                                      return sandbox_key === item.name;
                                    });
                                    window.open(
                                      `/api/dashboard/sanboxLog?params={"slaver_name":"slaver_${
                                        masterStatus[index].value
                                      }"}&timestamp=${new Date().getTime()}`
                                    );
                                  }
                                }}
                              >
                                下载诊断日志
                              </Button>
                            </Fragment>
                          )}
                        </Spin>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className={styles.childWrap}>
                  <div className={styles.pjSecHeader}>服务运行状态</div>
                  <div style={{ margin: '20px 24px' }}>
                    <Table
                      rowKey="Fid"
                      loading={runLoading}
                      columns={this.runningCol}
                      dataSource={runningList.list}
                      pagination={{
                        showQuickJumper: true,
                        hideOnSinglePage: true,
                        showTotal: (range) => `（${range}项）`,
                        size: 'small',
                        pageSizeOptions,
                        showSizeChanger: true,
                        defaultPageSize: 6,
                      }}
                    />
                  </div>
                </div>
                <div className={styles.childWrap}>
                  <div className={styles.pjSecHeader}>服务内存使用（JVM类服务）</div>
                  <div style={{ margin: '20px 24px' }}>
                    <Table
                      rowKey="Fid"
                      loading={memLoading}
                      columns={this.serverMemCol}
                      dataSource={serverMemList.list}
                      pagination={{
                        showQuickJumper: true,
                        hideOnSinglePage: true,
                        showTotal: (range) => `（${range}项）`,
                        size: 'small',
                        pageSizeOptions,
                        showSizeChanger: true,
                        defaultPageSize: 6,
                      }}
                    />
                  </div>
                </div>
                <div className={styles.childWrap}>
                  <div className={styles.pjSecHeader}>实时流引擎生产消费状态</div>
                  <div style={{ margin: '20px 24px' }}>
                    <Table
                      rowKey="Fconsumer_group"
                      loading={engLoading}
                      columns={this.engineCol}
                      dataSource={engineList.list}
                      pagination={{
                        showQuickJumper: true,
                        hideOnSinglePage: true,
                        showTotal: (range) => `（${range}项）`,
                        size: 'small',
                        pageSizeOptions,
                        showSizeChanger: true,
                        defaultPageSize: 6,
                      }}
                    />
                  </div>
                </div>
                <div className={styles.childWrap}>
                  <div className={styles.pjSecHeader}>监控阈值配置</div>
                  <FlexCardForm
                    formList={this.formList}
                    data={monitorThrehold}
                    onSave={this.onSave}
                    disabled={!this.debugWritable}
                    wrapstyle={{
                      border: 'none',
                      borderRight: '1px solid #EAEDF3',
                      borderBottom: '1px solid #EAEDF3',
                    }}
                  />
                </div>
                <div className={styles.childWrap}>
                  <div className={styles.pjSecHeader}>流量引擎监控信息</div>
                  <div style={{ margin: '20px 24px' }}>
                    <List
                      loading={probesLoading}
                      dataSource={probes}
                      renderItem={(item, index) => (
                        <List.Item>
                          <div style={{ width: '100%' }}>
                            <Row gutter={24}>
                              <Col span={8}>探针IP: {item.ip}</Col>
                              <Col span={8}>
                                <Select
                                  // mode="multiple"
                                  style={{ minWidth: '300px', maxWidth: '600px' }}
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.props.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  onChange={(value) => {
                                    this.statsChange(value, item, index);
                                  }}
                                  value={initStats[index]}
                                >
                                  {statsMap[item.id] &&
                                    statsMap[item.id].map((stats) => (
                                      <Option key={stats}>{stats}</Option>
                                    ))}
                                </Select>
                              </Col>
                              <Col span={8}>
                                <Radio.Group
                                  value={timeRange[index]}
                                  onChange={(e) => {
                                    this.handleChangeChartData(e, item, index);
                                  }}
                                >
                                  <Radio.Button value="1m">一个月</Radio.Button>
                                  <Radio.Button value="7d">7天</Radio.Button>
                                  <Radio.Button value="24h">24h</Radio.Button>
                                  <Radio.Button value="1h">1h</Radio.Button>
                                </Radio.Group>
                              </Col>
                            </Row>
                            <Row gutter={24}>
                              <Col>
                                {item.chartData.length ? (
                                  <LineChartMul
                                    data={item.chartData}
                                    height={230}
                                    hasLegend
                                    xAxisName="timestamp"
                                    color={['key', ['#0A4BCC', '#3CAB98']]}
                                    transform={(dv) => {
                                      dv.transform({
                                        type: 'fold',
                                        fields: [initStats[index]],
                                        key: 'key',
                                        value: 'value',
                                        retains: ['timestamp'],
                                      });
                                    }}
                                    showToolTip
                                    legendPosition="bottom"
                                    padding={[22, 40, 75, 50]}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      height: '230px',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    暂无数据
                                  </div>
                                )}
                              </Col>
                            </Row>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
export default connect(({ debugConfig, loading }) => ({
  debugConfig,
  flinkLoading: loading.effects['debugConfig/fetchFlinkCtrl'],
  aiLoading: loading.effects['debugConfig/fetchWebsellAi'],
  runLoading: loading.effects['debugConfig/fetchRunningList'],
  memLoading: loading.effects['debugConfig/fetchServerMemList'],
  engLoading: loading.effects['debugConfig/fetchEngineList'],
  probesLoading: loading.effects['debugConfig/fetchProbesData'],
  shutdownLoading: loading.effects['debugConfig/handelShutdownLogic'],
  restartLoading: loading.effects['debugConfig/handelRestartLogic'],
  restoreFactorySettingsLoading: loading.effects['debugConfig/handelRestoreFactorySettingsLogic'],
  typeCountLoading: loading.effects['debugConfig/queryHaboQueueSampleTypeCount'],
  queryHaboMasterStatusLoading: loading.effects['debugConfig/queryHaboMasterStatus'],
}))(Form.create()(DebugConfig));
