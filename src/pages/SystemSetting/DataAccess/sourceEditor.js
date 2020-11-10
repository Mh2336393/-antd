import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import Cookies from 'js-cookie';
import { connect } from 'umi';
import { DownOutlined, LeftOutlined, QuestionCircleFilled, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Spin,
  Input,
  Select,
  Checkbox,
  Button,
  message,
  Row,
  Col,
  Tooltip,
  InputNumber,
  Radio,
  Divider,
  Tabs,
} from 'antd';
import { history } from 'umi';
import styles from './sourceEditor.less';
import authority from '@/utils/authority';
const { getAuth } = authority;
import configSettings from '../../../configSettings';
import XFFIPPolicy from './components/XFFIPPolicy';

const { TabPane } = Tabs;

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

const logTypesArr = ['sys', 'mail', 'db', 'net', 'file', 'enge', 'login', 'mage'];
const logAllArr = [
  'smtp',
  'imap',
  'pop',
  'sqlserver',
  'oracle',
  'mysql',
  'http',
  'dns',
  'nfs',
  'tftp',
  'ftp',
  'smb',
  'ldap',
  'dnp3',
  'tls',
  'ikev2',
  'krb5',
  'dhcp',
  'ssh',
  'rdp',
  'telnet',
  'flow',
  'icmp',
  'pcinfo',
];
const logTypes = {
  mail_name: '邮件类',
  db_name: '数据库类',
  net_name: '互联网类',
  file_name: '文件传输类',
  enge_name: '工控类',
  login_name: '登录认证类',
  mage_name: '远程管理类',
  sys_name: '系统类',
  mail: [
    // 邮件类
    { label: 'smtp', value: 'smtp', checked: false },
    { label: 'imap', value: 'imap', checked: false },
    { label: 'pop', value: 'pop', checked: false },
  ],
  db: [
    // 数据库类
    { label: 'sqlserver', value: 'sqlserver', checked: false },
    { label: 'oracle', value: 'oracle', checked: false },
    { label: 'mysql', value: 'mysql', checked: false },
  ],
  net: [
    // 互联网类
    { label: 'http', value: 'http', checked: false },
    { label: 'dns', value: 'dns', checked: false },
  ],
  file: [
    // 文件传输类
    { label: 'nfs', value: 'nfs', checked: false },
    { label: 'tftp', value: 'tftp', checked: false },
    { label: 'ftp', value: 'ftp', checked: false },
    { label: 'smb', value: 'smb', checked: false },
  ],
  enge: [
    // 工控类
    { label: 'dnp3', value: 'dnp3', checked: false },
  ],
  login: [
    // 登录认证类
    { label: 'tls', value: 'tls', checked: false },
    { label: 'ikev2', value: 'ikev2', checked: false },
    { label: 'krb5', value: 'krb5', checked: false },
    { label: 'dhcp', value: 'dhcp', checked: false },
    { label: 'ldap', value: 'ldap', checked: false },
  ],
  mage: [
    // 远程管理类
    { label: 'ssh', value: 'ssh', checked: false },
    { label: 'rdp', value: 'rdp', checked: false },
    { label: 'telnet', value: 'telnet', checked: false },
  ],
  sys: [
    // 系统类
    { label: 'flow', value: 'flow', checked: false },
    { label: 'icmp', value: 'icmp', checked: false },
    { label: 'pcinfo', value: 'pcinfo', checked: false },
  ],
};
const httpHeadMust = ['host', 'http_port', 'url', 'user-agent', 'x-forwarded-for', 'content-type'];
const grabPacketDrivenConfigOpetion = [
  {
    label: 'pcap',
    value: '虚拟机（基础驱动，网卡兼容度高，速率<500Mbps，推荐虚拟机场景使用',
    checked: false,
  },
  {
    label: 'af-packet',
    value: '普通（Linux高速驱动，网卡兼容度高，速率<3Gbps，推荐虚拟机/国产化硬件场景使用）',
    checked: false,
  },
  {
    label: 'pfring',
    value: '高速（开源高速驱动，网卡兼容度中，速率<5Gbps，推荐首选驱动方式',
    checked: false,
  },
  {
    label: 'pfring-zc',
    value:
      '极速（开源高速驱动，网卡兼容度低，速率<10Gbps，推荐intel 82575/82576/82580/1210/1350/82599/X520/X540/X55x系列网卡使用）',
    checked: false,
  },
];

@connect(({ sourceAccess, global, loading }) => ({
  sourceAccess,
  hasVpc: global.hasVpc,
  loading: loading.effects['sourceAccess/getSuricataConfigAll'],
  fetchNetworkCardLoading: loading.effects['sourceAccess/fetchNetworkCard'],
  updateSourceLoading: loading.effects['sourceAccess/updateSourceDate'],
  updateLogsLoading: loading.effects['sourceAccess/updateLogsConfig'],
  updatePcapLoading: loading.effects['sourceAccess/updatePcapConfig'],
}))
class SourceEditor extends Component {
  constructor(props) {
    super(props);
    this.dataAuth = getAuth('/systemSetting/dataAccess/source');
    this.editSource = getAuth('_systemSetting_dataAccess_source_edit');
    this.propsData = {
      // "ip": "",
      // "name": "",
      // "desc": "",
      // "netWork": "",// 这里改为interfaces
      // "netWork2": "",
      // "homeNet": "",
      // "nginxNet": "",
      // "trueLogs": [],// lOGS
      // "alert-flowstore": true,// PCAP
      // "force-pcapstore": true,// PCAP
      // "packet-store-limit": 100,// PCAP
      // "flow-store-limit": 1,
      // "enable": "yes",// XFF
      // "header": "X-Forwarded-For",// XFF
      // "mode": "extra-data",// XFF
      // "deployment": "reverse2",// XFF
      // "type": "request",// httpBodyRes
      // "limit": 444,// httpBodyRes
      // "content_type_condition": "text/xml",// httpBodyRes
      // "custom": "server,cache-control",// httpHeadRes
    };
    this.state = {
      queryIp: '',
      cardsList: [],
      selectedCard: [],
      sourceName: '',
      descript: '',
      HOME_NET: '',
      NGINX_NET: '',
      tceConfig: false,
      pcapSizeShow: 'none',
      xffSetShow: false,
      logCbxState: [],
      allState: false,
      selectDisplay: 'none',
      httpBodyShow: 'none',
      shoFlag: 'none',
    };
    this.XffIPPolicy = null;
  }

  componentDidMount = async () => {
    const { dispatch, location } = this.props;

    dispatch({
      type: 'sourceAccess/fetchNetworkCard',
      payload: { ip: location.query.ip },
    })
      .then((cards) => {
        this.setState({ cardsList: cards });
      })
      .catch((error) => {
        message.error(error.msg);
      });

    // 一次性获取所有探针配置
    await dispatch({
      type: 'sourceAccess/getSuricataConfigAll',
      payload: { ip: location.query.ip },
    });
    const {
      sourceAccess: {
        xffConfig,
        pcapConfig,
        httpBodyConfig,
        httpHeadConfig,
        logsConfig,
        interfaces,
        tce,
        group,
        vxlan_port,
      },
    } = this.props;

    let xffSetShow = false;
    if (!_.isEmpty(xffConfig)) {
      this.propsData = { ...this.propsData, ...xffConfig };
      if (xffConfig.enable === 'yes') {
        xffSetShow = true;
      }
    } else {
      message.error('xff获取失败');
    }

    let pcapSizeShowVal = 'block';
    if (!_.isEmpty(pcapConfig)) {
      this.propsData = { ...this.propsData, ...pcapConfig };
      if (pcapConfig['force-pcapstore']) {
        pcapSizeShowVal = 'block';
      } else {
        pcapSizeShowVal = 'none';
      }
    } else {
      message.error('pcap获取失败');
    }

    let httpBodyShowVal = 'block';
    if (!_.isEmpty(httpBodyConfig)) {
      this.propsData = { ...this.propsData, ...httpBodyConfig };
      if (httpBodyConfig.type !== 'disable') {
        httpBodyShowVal = 'block';
      } else {
        httpBodyShowVal = 'none';
      }
    } else {
      message.error('http_body获取失败');
    }

    if (!_.isEmpty(httpHeadConfig)) {
      this.propsData = { ...this.propsData, ...httpHeadConfig };
    } else {
      message.error('http_header获取失败');
    }
    if (Array.isArray(logsConfig)) {
      const allState = logsConfig.length === logAllArr.length;
      this.propsData.trueLogs = Object.assign([], logsConfig);

      this.setState({ logCbxState: _.cloneDeep(logsConfig), allState });
    } else {
      message.error('log获取失败');
    }

    this.propsData.ip = location.query.ip;
    this.propsData.name = location.query.name;
    this.propsData.desc = location.query.desc;

    let netWorkArr = [];
    if (!_.isEmpty(interfaces)) {
      netWorkArr = interfaces.interfaces.split(',');
      this.propsData.interfaces = interfaces.interfaces;
    } else {
      message.error('linterfaces获取失败');
    }

    let tceConfig = false;
    if (!_.isEmpty(tce)) {
      tceConfig = tce['tce-config'];
      this.propsData.tceConfig = `${tceConfig}`;
    } else {
      message.error('tce获取失败');
    }

    let homeNet = '';
    let nginxNet = '';
    if (!_.isEmpty(group)) {
      homeNet = group.HOME_NET;
      nginxNet = group.NGINX_NET;
      this.propsData.homeNet = homeNet;
      this.propsData.nginxNet = nginxNet;
    } else {
      message.error('group获取失败');
    }
    console.log('vxlan_port===', vxlan_port);
    console.log(_.isEmpty(vxlan_port));
    if (vxlan_port) {
      this.propsData.vxlanPort = vxlan_port;
    } else {
      message.error('vxlan_port获取失败');
    }

    this.setState(
      {
        xffSetShow,
        pcapSizeShow: pcapSizeShowVal,
        httpBodyShow: httpBodyShowVal,
        queryIp: location.query.ip,
        sourceName: location.query.name,
        descript: location.query.desc,
        selectedCard: netWorkArr,
        tceConfig,
        HOME_NET: homeNet,
        NGINX_NET: nginxNet,
      },
      () => {
        if (this.state.HOME_NET === 'any') {
          this.setState({
            shoFlag: 'block',
          });
        }
      }
    );
  };

  goBack = () => {
    history.go(-1);
  };

  handleBlank = (rule, value, callback) => {
    if (/\s+/g.test(value)) {
      callback('名称不能有空格');
    } else {
      callback();
    }
  };

  vxlanPortCheck = (rule, value, callback) => {
    console.log(327, 'value==', value);
    if (value) {
      let flag = true;
      const arr = value.split(/,/g);
      const temp = [];
      for (let i = 0; i < arr.length; i += 1) {
        if (configSettings.isPort(arr[i]) === false) {
          flag = false;
          break;
        }
        if (temp.indexOf(arr[i]) < 0) {
          temp.push(arr[i]);
        }
      }

      if (flag) {
        if (arr.length > 4) {
          callback('端口个数超出4个限制，请删除');
        } else if (temp.length !== arr.length) {
          callback('存在重复内容，请删除');
        } else {
          callback();
        }
      } else {
        callback('端口格式有误，请重新输入');
      }
    } else {
      callback();
    }
  };

  handleHttpBodyType = (rule, value, callback) => {
    const { form } = this.props;
    const flag = form.getFieldValue('httpBodyFlag');
    if (flag === 'enable' && value.length === 0) {
      callback('必选');
    } else {
      callback();
    }
  };

  handleContentType = (rule, value, callback) => {
    if (value) {
      const reg = /^([a-z]+)\/([a-z0-9_.\-*\s]+)$/;
      const arr = value.split(',');
      const flagArr = [];
      arr.forEach((type) => {
        flagArr.push(reg.test(type));
      });

      if (flagArr.indexOf(false) < 0) {
        callback();
      } else {
        callback('请输入合法的content-type类型');
      }
    } else {
      callback();
    }
  };

  validateNetworkSeg = (rule, value, callback) => {
    const flag = configSettings.validateNetworkSegment(value);
    if (value === 'any') {
      this.setState({
        shoFlag: 'block',
      });
    } else {
      this.setState({
        shoFlag: 'none',
      });
    }
    if (value.includes('any') && value !== 'any') {
      callback('any和IP网段不能同时存在');
    }
    if (flag === false) {
      callback('输入格式有误');
    }
    if (flag === 'repeat') {
      callback('请移除重复网段');
    }
    // 额外要求 代理服务器网段 和 代理服务器网段 不能完全相同
    const { form } = this.props;
    const NGINX_NET = form.getFieldValue(`NGINX_NET`);
    const HOME_NET = form.getFieldValue(`HOME_NET`);
    if (NGINX_NET && HOME_NET && NGINX_NET === HOME_NET) {
      callback('监控网段和代理服务器网段不能完全相同');
    }
    if (flag === true) {
      callback();
    }
  };

  // 代理服务器网段
  validateNginxSeg = (rule, value, callback) => {
    if (value) {
      const flag = configSettings.validateNginxNet(value);
      if (flag === false) {
        // callback('支持格式：1.2.3.4，1.2.3.4/24，1.2.3.4-2.3.4.5，允许输入多个，以“,”或者换行分隔');
        callback('输入格式有误');
      }
      if (flag === 'repeat') {
        callback('请移除重复网段');
      }
      // 额外要求 代理服务器网段 和 代理服务器网段 不能完全相同
      const { form } = this.props;
      const NGINX_NET = form.getFieldValue(`NGINX_NET`);
      const HOME_NET = form.getFieldValue(`HOME_NET`);
      if (NGINX_NET && HOME_NET && NGINX_NET === HOME_NET) {
        callback('监控网段和代理服务器网段不能完全相同');
      }
      if (flag === true) {
        callback();
      }
    } else {
      callback();
    }
  };

  logSelectedLabel = () => {
    const { logCbxState } = this.state;
    let selectName = '选择流量协议类型';
    // const selectName = logCbxState.length > 0 ? `${logCbxState.join(', ')}` : '选择流量协议类型';
    const selectedLabels = [];
    if (logCbxState.length > 0) {
      logTypesArr.forEach((name) => {
        logTypes[name].forEach((obj) => {
          if (logCbxState.indexOf(obj.value) > -1) {
            selectedLabels.push(obj.label);
          }
        });
      });
      selectName = `${selectedLabels.join(', ')}`;
    }
    return selectName;
  };

  logTypesEles = (cbxDisable) => {
    const { logCbxState, allState } = this.state;
    return (
      <div className={styles.cbxWrap}>
        <div className={styles.cbxTop}>
          {logTypesArr.map((name) => (
            <div key={name} className={styles.cbxDiv}>
              <div className={styles.cbxTheme}>
                <div className={styles.colLabelStyle}>
                  <span>{logTypes[`${name}_name`]}</span>
                  {name === 'net' && (
                    <span>
                      {` `}
                      <Tooltip title="禁用DNS日志会影响威胁情报产出">
                        <QuestionCircleFilled className="fontBlue" />
                      </Tooltip>
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.cbxCxt}>
                {logTypes[name].map((obj) => {
                  const curIndex = logCbxState.indexOf(obj.value);
                  return (
                    <Checkbox
                      disabled={cbxDisable}
                      className={styles.cbxStyle}
                      onChange={(e) => {
                        this.cbxStateChange(e, obj.value, curIndex);
                      }}
                      checked={curIndex > -1}
                      key={obj.value}
                      value={obj.value}
                    >
                      {obj.label}
                    </Checkbox>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cbxBtm}>
          <Checkbox
            disabled={cbxDisable}
            checked={allState}
            onChange={(e) => {
              this.allCbxStateChange(e);
            }}
          >
            全选
          </Checkbox>
        </div>
      </div>
    );
  };

  onSelectClick = () => {
    const { selectDisplay } = this.state;
    const disVal = selectDisplay === 'none' ? 'block' : 'none';
    this.setState({ selectDisplay: disVal });
  };

  fixedWrapClick = () => {
    this.setState({ selectDisplay: 'none' });
  };

  cbxStateChange = (e, name, curIndex) => {
    let { logCbxState } = this.state;

    if (e.target) {
      const { checked } = e.target;

      if (checked) {
        logCbxState.push(name);
      } else {
        delete logCbxState[curIndex];
      }
      logCbxState = logCbxState.filter((typeName) => !!typeName);
      const allState = logCbxState.length === logAllArr.length;
      this.setState({ allState, logCbxState });
    }
  };

  allCbxStateChange = (e) => {
    if (e.target) {
      const { checked } = e.target;
      if (checked) {
        this.setState({ logCbxState: logAllArr, allState: true });
      } else {
        this.setState({ logCbxState: [], allState: false });
      }
    }
  };

  selectCardValidate = (rule, value, callback) => {
    const {
      form,
      sourceAccess: { netCardIp },
    } = this.props;
    const { cardsList } = this.state;
    if (value.length > 4) {
      message.error('目前最多支持四块网卡');
      const arr = [value[0], value[1], value[2], value[3]];
      // const { form } = this.props;
      form.setFieldsValue({
        selectedCard: arr,
      });
      callback();
    } else {
      const noExist = value.filter((name) => cardsList.indexOf(name) < 0);
      if (noExist.length) {
        callback('流量采集网口值有误，请重新选择');
      } else {
        const newArr = [];
        value.forEach((key) => {
          if (!netCardIp[key]) {
            newArr.push(key);
          }
        });
        if (newArr.length !== value.length) {
          message.error('该接口有ip，暂不允许配置为流量采集网口');
          form.setFieldsValue({
            selectedCard: newArr,
          });
        }
        callback();
      }
    }
  };

  selectCustom = (rule, value, callback) => {
    const notExist = httpHeadMust.filter((type) => value.indexOf(type) < 0);
    const { form } = this.props;
    if (notExist.length) {
      message.warn(`${httpHeadMust.join(',')}是必选项，不能移除`);
      const newVal = notExist.concat(value);
      form.setFieldsValue({
        httpHeadCustom: newVal,
      });
      callback();
    } else {
      callback();
    }
  };

  forcePcapStoreOnChange = (e) => {
    const { value } = e.target;
    if (value === 'true') {
      this.setState({ pcapSizeShow: 'block' });
    } else {
      this.setState({ pcapSizeShow: 'none' });
    }
  };

  httpBodyOnChange = (e) => {
    const { value } = e.target;
    if (value === 'enable') {
      this.setState({ httpBodyShow: 'block' });
    } else {
      this.setState({ httpBodyShow: 'none' });
    }
  };

  xffEnableOnChange = (e) => {
    const { value } = e.target;
    if (value === 'yes') {
      this.setState({
        xffSetShow: true,
      });
    } else {
      this.setState({
        xffSetShow: false,
      });
    }
  };

  xffHeaderBack = () => {
    const { form } = this.props;
    form.setFieldsValue({
      xff_header: 'X-Forwarded-For',
    });
  };

  saveChange = () => {
    const {
      dispatch,
      form,
      sourceAccess: {
        pcapConfig,
        xffConfig,
        httpBodyConfig,
        httpHeadConfig,
        logsConfig,
        interfaces,
        vxlan_port,
        driver,
      },
    } = this.props;
    const {
      queryIp,
      sourceName,
      HOME_NET,
      tceConfig,
      NGINX_NET,
      descript,
      logCbxState,
    } = this.state;
    form.validateFields(async (err, values) => {
      console.log('values=', values);
      if (!err) {
        const {
          xff_header: xffHeader,
          xff_enable: xffEnable,
          xff_mode: xffMode,
          httpBodyType,
          httpBodyFlag,
          httpBodyLimit,
          httpBodyContentType,
          httpHeadCustom,
          vxlanPort,
          selectedCard,
          grabPacket_driven_config,
        } = values;

        // 流量源基础配置
        let isSourceEdit = false;
        const sourceDate = {
          ip: queryIp,
          name: values.sourceName,
          homeNet: values.HOME_NET.replace(/\n/g, ','),
          tceConfig: values.tceConfig || 'false',
          nginxNet: values.NGINX_NET.replace(/\n/g, ','),
          desc: values.descript,
        };
        if (
          !_.isEqual(sourceName, sourceDate.name) ||
          !_.isEqual(HOME_NET, sourceDate.homeNet) ||
          !_.isEqual(tceConfig.toString(), sourceDate.tceConfig) ||
          !_.isEqual(NGINX_NET, sourceDate.nginxNet) ||
          !_.isEqual(descript, sourceDate.desc)
        ) {
          await dispatch({
            type: 'sourceAccess/updateSourceDate',
            payload: { ...sourceDate },
          });
          isSourceEdit = true;
          message.info('新配置已保存，请重启流量引擎以生效。');
        }

        // 全流量日志编辑
        const logReq = { ip: queryIp, trueLogs: logCbxState };
        if (!_.isEqual(logReq.trueLogs, logsConfig)) {
          await dispatch({
            type: 'sourceAccess/updateLogsConfig',
            payload: logReq,
          });
          isSourceEdit = true;
          message.success('流量日志配置编辑成功');
        }

        // pcapConfig编辑
        let pcap = {};
        if (logCbxState.indexOf('flow') < 0) {
          pcap = {
            'force-pcapstore': false,
            'packet-store-limit': pcapConfig['packet-store-limit'],
            'flow-store-limit': pcapConfig['flow-store-limit'],
          };
        } else {
          pcap = {
            'force-pcapstore': values['force-pcapstore'] === 'true',
            'packet-store-limit': values['packet-store-limit'],
            'flow-store-limit': values['flow-store-limit'],
          };
        }
        if (
          !_.isEqual(pcap['force-pcapstore'], pcapConfig['force-pcapstore']) ||
          !_.isEqual(pcap['packet-store-limit'], pcapConfig['packet-store-limit']) ||
          !_.isEqual(pcap['flow-store-limit'], pcapConfig['flow-store-limit'])
        ) {
          pcap.pcapEditChange = true;
        } else {
          pcap.pcapEditChange = false;
        }

        // xff配置
        const xffReq = {
          enable: xffEnable,
        };
        if (xffEnable === 'yes') {
          let { xff_deployment: xffDeployment } = values;
          if (!xffDeployment) xffDeployment = xffConfig.deployment;
          xffReq.header = xffHeader;
          xffReq.mode = xffMode;
          xffReq.deployment = xffDeployment;

          if (xffDeployment === 'forward') {
            xffReq.item = this.XffIPPolicy.forwordModeReturnsAnOrdinalNumber();
            xffReq.host = xffConfig.host;
          } else if (xffDeployment === 'host') {
            xffReq.item = xffConfig.item;
            const str = this.XffIPPolicy.hostModeReturnsString();
            if (str) {
              xffReq.host = str;
            } else {
              return;
            }
          } else if (xffDeployment === 'except') {
            xffReq.host = xffConfig.host;
            xffReq.item = xffConfig.item;
          }
        } else {
          xffReq.header = xffConfig.header;
          xffReq.mode = xffConfig.mode;
          xffReq.deployment = xffConfig.deployment;
          xffReq.host = xffConfig.host;
          xffReq.item = xffConfig.item;
        }
        if (
          !_.isEqual(xffReq.header, xffConfig.header) ||
          !_.isEqual(xffReq.mode, xffConfig.mode) ||
          !_.isEqual(xffReq.deployment, xffConfig.deployment) ||
          !_.isEqual(xffReq.host, xffConfig.host) ||
          !_.isEqual(xffReq.item.toString(), xffConfig.item) ||
          !_.isEqual(xffReq.enable, xffConfig.enable)
        ) {
          xffReq.xffEditChange = true;
        } else {
          xffReq.xffEditChange = false;
        }

        // httpBody 编辑
        let httpBodyTypeVal = 'disable';
        if (httpBodyFlag === 'enable') {
          if (httpBodyType.length === 2) {
            httpBodyTypeVal = 'all';
          } else {
            httpBodyTypeVal = httpBodyType[0] || '';
          }
        }
        let httpBody = {
          type: httpBodyTypeVal,
          limit: httpBodyLimit,
          content_type_condition: httpBodyContentType,
        };
        if (httpBodyTypeVal === 'disable') {
          httpBody.limit = httpBodyConfig.limit;
          httpBody.content_type_condition = httpBodyConfig.content_type_condition;
        }
        if (logCbxState.indexOf('http') < 0) {
          httpBody = httpBodyConfig;
        }
        if (
          !_.isEqual(httpBody.type, httpBodyConfig.type) ||
          !_.isEqual(httpBody.limit, httpBodyConfig.limit) ||
          !_.isEqual(httpBody.content_type_condition, httpBodyConfig.content_type_condition)
        ) {
          httpBody.httpBodyEditChange = true;
        } else {
          httpBody.httpBodyEditChange = false;
        }

        // httpHeader 编辑
        let customVal = '';
        if (httpHeadCustom && Array.isArray(httpHeadCustom)) {
          const customArr = httpHeadCustom.filter((typeTmp) => httpHeadMust.indexOf(typeTmp) < 0);
          customVal = customArr.join(',');
        }
        const httpHead = {
          custom: customVal,
        };
        if (logCbxState.indexOf('http') < 0) {
          httpHead.custom = httpHeadConfig.custom;
        }
        if (!_.isEqual(httpHead.custom, httpHeadConfig.custom)) {
          httpHead.httpHeadEditChange = true;
        } else {
          httpHead.httpHeadEditChange = false;
        }

        // networksCard 编辑
        const networks = {
          interfaces: selectedCard.join(','),
        };
        if (!_.isEqual(networks.interfaces, interfaces.interfaces)) {
          networks.networkCardEditChange = true;
        } else {
          networks.networkCardEditChange = false;
        }

        // vxlan 编辑
        const vxlan = {
          vxlanPort,
        };
        if (!_.isEqual(vxlan.vxlanPort, vxlan_port)) {
          vxlan.vxlanEditChange = true;
        } else {
          vxlan.vxlanEditChange = false;
        }

        // 抓包驱动配置
        const driverConfig = {
          driver: grabPacket_driven_config,
        };
        if (!_.isEqual(driverConfig.driver, driver)) {
          driverConfig.driverEditChange = true;
        } else {
          driverConfig.driverEditChange = false;
        }

        dispatch({
          type: 'sourceAccess/updatePcapConfig',
          payload: {
            ip: queryIp,
            pcap: {
              ...pcap,
            },
            xff: {
              ...xffReq,
            },
            httpBody: {
              ...httpBody,
            },
            httpHead: {
              ...httpHead,
            },
            networkCard: {
              ...networks,
            },
            vxlan: {
              ...vxlan,
            },
            driverConfig: {
              ...driverConfig,
            },
          },
        }).then((json) => {
          if (!_.isEmpty(json.pcapConfigRes) && json.pcapConfigRes.error_code !== 0) {
            message.error(json.pcapConfigRes.msg);
            return;
          }
          if (!_.isEmpty(json.xffResJson) && json.xffResJson.error_code !== 0) {
            message.error(json.xffResJson.msg);
            return;
          }
          if (!_.isEmpty(json.httpBodyRes) && json.httpBodyRes.error_code !== 0) {
            message.error(json.httpBodyRes.msg);
            return;
          }
          if (!_.isEmpty(json.httpHeadRes) && json.httpHeadRes.error_code !== 0) {
            message.error(json.httpHeadRes.msg);
            return;
          }
          if (!_.isEmpty(json.setNetwork) && json.setNetwork.error_code !== 0) {
            message.error(json.setNetwork.msg);
            return;
          }
          if (!_.isEmpty(json.vxlanRes) && json.vxlanRes.error_code !== 0) {
            message.error(json.vxlanRes.msg);
            return;
          }
          if (!_.isEmpty(json.driverRes) && json.driverRes.error_code !== 0) {
            message.error(json.driverRes.msg);
            return;
          }
          if (json.isSourceEdit) {
            isSourceEdit = true;
          }
          Cookies.set('sourceEditChange', `${queryIp}_${isSourceEdit}`);
          history.push('/systemSetting/dataAccess/source');
        });
      }
    });
  };

  inputNumberValidate = (rule, value, callback) => {
    if (typeof value !== 'number') {
      callback('请输入合法数值');
    } else {
      callback();
    }
  };

  changeSelect = (value) => {
    // const { form } = this.props;
    // form.setFieldsValue({
    //   selectedCard: value,
    //   // console.log('val',value)
    // });
    this.setState({
      selectedCard: value,
    });
  };

  render() {
    const {
      form,
      loading,
      fetchNetworkCardLoading,
      hasVpc,
      sourceAccess: { vxlan_port, pcapConfig, xffConfig, httpBodyConfig, httpHeadConfig, driver },
      updateSourceLoading,
      updateLogsLoading,
      updatePcapLoading,
    } = this.props;
    const vxlanPortIniVal = typeof vxlan_port === 'number' ? `${vxlan_port}` : vxlan_port;
    const {
      cardsList,
      selectedCard,
      sourceName,
      descript,
      HOME_NET,
      NGINX_NET,
      tceConfig,
      pcapSizeShow,
      httpBodyShow,
      xffSetShow,
      logCbxState,
      selectDisplay,
    } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 14 },
      },
    };

    const httpHeadList = httpHeadMust.concat(configSettings.httpHeadList);

    const selectName = this.logSelectedLabel();

    const pcapTooltip = (
      <div>
        将TCP或UDP协议流量的报文载荷数据（payload）存储到数据平台的Flow日志中，在检索页面进行在线PCAP查看与下载，可以用于后续调查取证等工作。
        <br /> 注意：每条流存储总量 = 流存储报文数 *
        报文存储字节数，开启报文存储会占用超大的磁盘存储空间，请谨慎评估后开启。
      </div>
    );
    const forceInitialValue = pcapConfig['force-pcapstore'] === true ? 'true' : 'false';
    const flowLimitVal =
      pcapConfig['flow-store-limit'] === undefined ? 1 : pcapConfig['flow-store-limit'];
    const packetLimitVal =
      pcapConfig['packet-store-limit'] === undefined ? 100 : pcapConfig['packet-store-limit'];

    const xffEnableIni = xffConfig.enable === 'yes' ? 'yes' : 'no';
    const xffHeaderIni = xffConfig.header || '';
    const xffModeIni = xffConfig.mode === 'extra-data' ? 'extra-data' : 'overwrite';
    const xffDeploymentIni = xffConfig.deployment ? xffConfig.deployment : 'forward';
    const grabPacketDrivenConfig = driver || 'pfring';

    const httpHeadSelect = httpHeadConfig.custom ? httpHeadConfig.custom.split(',') : [];
    const httpHeadCustomIni = httpHeadMust.concat(httpHeadSelect);

    let httpBodyFlagIni = 'disable';
    let httpBodyTypeIni = [];
    if (httpBodyConfig.type && httpBodyConfig.type !== 'disable') {
      // 启用
      httpBodyFlagIni = 'enable';
      if (httpBodyConfig.type === 'all') {
        httpBodyTypeIni = ['request', 'response'];
      } else {
        httpBodyTypeIni = [httpBodyConfig.type];
      }
    }

    // 流量日志面板的完全显示
    let btmMargin = 0;
    if (logCbxState.indexOf('http') < 0 && logCbxState.indexOf('flow') < 0) {
      btmMargin = 360;
    } else if (logCbxState.indexOf('http') > -1) {
      btmMargin = httpBodyShow === 'none' ? 200 : 0;
    } else {
      btmMargin = 300;
    }
    const sourceDisable = this.editSource === 'no';

    const networkSegTips =
      '支持格式：any，1.2.3.4，!2.3.4.5，1.2.3.4/24，!2.3.4.5/24，1.2.3.4-2.3.4.5，!1.2.3.4-2.3.4.5，允许输入多个，以“,”或者换行分隔。支持ipv6格式';
    return (
      <div>
        <div className="commonDetailHeader">
          <LeftOutlined style={{ color: '#2662EE' }} />
          <span style={{ cursor: 'pointer', color: '#2662EE' }} onClick={this.goBack}>
            返回
          </span>
          <span className="divider" />
          <span>流量接入编辑</span>
        </div>
        <div style={{ marginBottom: btmMargin }}>
          {loading || fetchNetworkCardLoading ? (
            <div className={styles.content}>
              <Spin />
            </div>
          ) : (
            <div className={styles.content}>
              <Form>
                <Row className={styles.rowBlock}>
                  <Col span={4}>
                    <h4 className={styles.title4}>基础配置</h4>
                  </Col>
                  <Col span={20}>
                    <FormItem {...formItemLayout} label="流量源名称">
                      {getFieldDecorator('sourceName', {
                        initialValue: sourceName || '',
                        rules: [
                          { required: true, message: '请填写流量源名称' },
                          { validator: this.handleBlank },
                          { max: 128, message: '长度不能超过128个字符' },
                        ],
                      })(<Input />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="流量采集网口">
                      {getFieldDecorator('selectedCard', {
                        initialValue: selectedCard || [],
                        validateTrigger: 'onChange',
                        rules: [
                          { required: true, message: '必选' },
                          { validator: this.selectCardValidate },
                        ],
                      })(
                        // <Select onChange={this.changeSelect}>
                        <Select mode="multiple">
                          {cardsList.map((card) => (
                            <Option key={card} value={card}>
                              {card}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>

                    <Row>
                      <Col xs={5} sm={5}>
                        <div className={styles.colLabel}>
                          <span>抓包驱动配置:</span>
                        </div>
                      </Col>
                      <Col xs={14} sm={14}>
                        <FormItem>
                          {getFieldDecorator('grabPacket_driven_config', {
                            initialValue: grabPacketDrivenConfig,
                            rules: [{ required: true, message: '必选' }],
                          })(
                            <Select style={{ width: '100%' }}>
                              {grabPacketDrivenConfigOpetion.map((item) => {
                                return (
                                  <Option key={item.label} value={item.label}>
                                    <Tooltip placement="topLeft" title={item.value}>
                                      {item.value}
                                    </Tooltip>
                                  </Option>
                                );
                              })}
                            </Select>
                          )}
                        </FormItem>
                      </Col>
                    </Row>

                    <FormItem {...formItemLayout} label="监控网段" extra={networkSegTips}>
                      {getFieldDecorator('HOME_NET', {
                        initialValue: HOME_NET || '',
                        rules: [
                          { required: true, message: '请输入监控网段' },
                          { validator: this.validateNetworkSeg },
                        ],
                      })(<TextArea autoSize={{ minRows: 2, maxRows: 6 }} />)}

                      <div style={{ color: 'red', display: this.state.shoFlag }}>
                        配置为any将无法区分流量方向，可能会导致告警误报以及攻击链判断错误
                      </div>
                    </FormItem>

                    {hasVpc === 1 ? (
                      <FormItem {...formItemLayout} label="TCE解析开关">
                        {getFieldDecorator('tceConfig', {
                          initialValue: `${tceConfig}`,
                        })(
                          <RadioGroup>
                            <Radio value="true">启用</Radio>
                            <Radio value="false">不启用</Radio>
                          </RadioGroup>
                        )}
                      </FormItem>
                    ) : null}

                    <Row>
                      <Col xs={5} sm={5}>
                        <div className={styles.colLabel}>
                          <span>
                            代理服务器网段{` `}
                            <Tooltip title="如果镜像流量中有Nginx服务器将外网地址转为内网服务器地址的流量，请将Nginx代理服务器地址填入用于检测外网攻击。">
                              <QuestionCircleFilled className="fontBlue" />
                            </Tooltip>
                            {` :`}
                          </span>
                        </div>
                      </Col>
                      <Col xs={14} sm={14}>
                        <FormItem extra="支持格式：1.2.3.4，1.2.3.4/24，1.2.3.4-2.3.4.5，允许输入多个，以“,”或者换行分隔。支持ipv6格式">
                          {getFieldDecorator('NGINX_NET', {
                            initialValue: NGINX_NET,
                            rules: [{ validator: this.validateNginxSeg }],
                          })(<TextArea autoSize={{ minRows: 2, maxRows: 6 }} />)}
                        </FormItem>
                      </Col>
                    </Row>

                    <FormItem {...formItemLayout} label="备注">
                      {getFieldDecorator('descript', {
                        initialValue: descript || '',
                        rules: [{ max: 128, message: '长度不能超过128个字符' }],
                      })(<TextArea autoSize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>
                  </Col>
                </Row>

                <Tabs defaultActiveKey="1">
                  <TabPane tab="流量解析配置" key="1">
                    <Row className={styles.rowBlock}>
                      <Col span={4} />
                      <Col span={20}>
                        <Row>
                          <Col xs={5} sm={5}>
                            <div className={styles.colLabel}>
                              <span>流量日志输出{` :`}</span>
                            </div>
                          </Col>
                          <Col xs={14} sm={14} style={{ padding: '3px 0 4px 0', marginBottom: 24 }}>
                            <div className={styles.selectHeader} onClick={this.onSelectClick}>
                              <div className={styles.selectTxt} title={selectName}>
                                <span>{selectName}</span>
                                {selectDisplay === 'block' ? (
                                  <UpOutlined className={styles.downIcon} />
                                ) : (
                                  <DownOutlined className={styles.downIcon} />
                                )}
                              </div>
                            </div>
                            <div className={styles.showCbxDiv}>
                              {selectDisplay === 'block' && (
                                <Fragment>{this.logTypesEles(sourceDisable)}</Fragment>
                              )}
                            </div>
                          </Col>
                        </Row>

                        <FormItem
                          {...formItemLayout}
                          label="VXLAN端口"
                          extra="允许输入多个，以“,”分隔。总数不得超过四个"
                        >
                          {getFieldDecorator('vxlanPort', {
                            initialValue: vxlanPortIniVal || '4789',
                            validateTrigger: 'onBlur',
                            rules: [
                              { required: true, message: '必填' },
                              { validator: this.vxlanPortCheck },
                            ],
                          })(<Input />)}
                        </FormItem>

                        <Divider />

                        <Row>
                          <Col xs={5} sm={5}>
                            <div className={styles.colLabel}>
                              <span>XFF解析{` :`}</span>
                            </div>
                          </Col>
                          <Col xs={14} sm={14}>
                            <FormItem>
                              {getFieldDecorator('xff_enable', {
                                initialValue: xffEnableIni,
                              })(
                                <RadioGroup onChange={this.xffEnableOnChange}>
                                  <Radio value="yes">启用</Radio>
                                  <Radio value="no">不启用</Radio>
                                </RadioGroup>
                              )}
                            </FormItem>
                          </Col>
                        </Row>

                        {xffSetShow && (
                          <div>
                            <Row>
                              <Col xs={5} sm={5} />
                              <Col xs={4} sm={4}>
                                <div className={styles.colLabel}>
                                  <span>XFF字段{` :`}</span>
                                </div>
                              </Col>
                              <Col xs={10} sm={10}>
                                <FormItem>
                                  {getFieldDecorator('xff_header', {
                                    initialValue: xffHeaderIni,
                                    rules: [{ max: 128, message: '长度不能超过128个字符' }],
                                  })(<Input />)}
                                </FormItem>
                              </Col>
                              <Col xs={4} sm={4}>
                                <div
                                  className={styles.colLabel}
                                  style={{ textAlign: 'left', padding: '0 10px' }}
                                >
                                  <a onClick={this.xffHeaderBack}>还原</a>
                                </div>
                              </Col>
                            </Row>

                            <Row>
                              <Col xs={5} sm={5} />
                              <Col xs={4} sm={4}>
                                <div className={styles.colLabel}>
                                  <span>XFF使用模式{` :`}</span>
                                </div>
                              </Col>
                              <Col xs={10} sm={10}>
                                <FormItem>
                                  {getFieldDecorator('xff_mode', {
                                    initialValue: xffModeIni,
                                  })(
                                    <RadioGroup>
                                      <Radio value="extra-data">单独字段展示</Radio>
                                      <Radio value="overwrite">自动替换告警IP</Radio>
                                    </RadioGroup>
                                  )}
                                </FormItem>
                              </Col>
                            </Row>

                            <Row>
                              <Col xs={5} sm={5} />
                              <Col xs={4} sm={4}>
                                <div className={styles.colLabel}>
                                  <span>
                                    XFF多IP策略&nbsp;
                                    <Tooltip
                                      title={
                                        <Fragment>
                                          <p>
                                            当XFF字段中具有多个IP时，可通过配置策略选择使用XFF中的哪个IP作为告警源IP
                                          </p>
                                          <p style={{ width: '100%', height: '10px' }}></p>
                                          <p>
                                            按序选择：
                                            <br />
                                            <span>根据排列顺序选择使用哪个一个IP作为告警源IP</span>
                                          </p>
                                          <p style={{ width: '100%', height: '10px' }}></p>
                                          <p>
                                            根据域名配置选择策略：
                                            <br />{' '}
                                            <span>
                                              可针对不同域名(HTTP头部HOST字段)配置不同的IP选择策略。
                                            </span>
                                          </p>
                                          <p style={{ width: '100%', height: '10px' }}></p>
                                          <p>
                                            自动选择外网IP：
                                            <br />{' '}
                                            <span>
                                              {' '}
                                              当XFF具备多个IP时，从第一个IP开始判断，自动选择非监控网段并且非代理网段的IP替换为告警源IP，如果没有找到则不进行替换。
                                            </span>
                                          </p>
                                        </Fragment>
                                      }
                                      placement="rightTop"
                                    >
                                      <QuestionCircleFilled className="fontBlue" />
                                    </Tooltip>
                                    ：
                                  </span>
                                </div>
                              </Col>
                              <Col xs={10} sm={10}>
                                <FormItem>
                                  {getFieldDecorator('xff_deployment', {
                                    initialValue: xffDeploymentIni,
                                    rules: [{ required: true, message: '必选' }],
                                  })(
                                    <Select>
                                      <Option value="forward">按序选择</Option>
                                      <Option value="host">根据域名配置选择策略</Option>
                                      <Option value="except">自动选择外网IP</Option>
                                    </Select>
                                  )}
                                </FormItem>
                              </Col>
                            </Row>

                            <Row>
                              <Col xs={5} sm={5} />
                              <Col xs={4} sm={4}></Col>
                              <Col xs={10} sm={10}>
                                <XFFIPPolicy
                                  onRef={(ref) => {
                                    this.XffIPPolicy = ref;
                                  }}
                                  deployment={getFieldValue('xff_deployment')}
                                  xffConfig={xffConfig}
                                />
                              </Col>
                            </Row>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="报文存储配置" key="2">
                    <Row className={styles.rowBlock}>
                      <Col span={4} />
                      <Col span={20}>
                        <Row>
                          <Col xs={5} sm={5}>
                            <div className={styles.colLabel}>
                              <span>HTTP HEADER存储 :</span>
                            </div>
                          </Col>
                          <Col xs={14} sm={14}>
                            <FormItem>
                              {getFieldDecorator('httpHeadCustom', {
                                initialValue: httpHeadCustomIni,
                                validateTrigger: 'onChange',
                                rules: [
                                  { required: true, message: '必选' },
                                  { validator: this.selectCustom },
                                ],
                              })(
                                <Select mode="multiple" disabled={sourceDisable}>
                                  {httpHeadList.map((headKey) => (
                                    <Option key={headKey} value={headKey}>
                                      {headKey}
                                    </Option>
                                  ))}
                                </Select>
                              )}
                            </FormItem>
                          </Col>
                        </Row>

                        <Divider />

                        {logCbxState.indexOf('http') > -1 && (
                          <Fragment>
                            <Row>
                              <Col xs={5} sm={5}>
                                <div className={styles.colLabel}>
                                  <span>HTTP BODY存储 :</span>
                                </div>
                              </Col>
                              <Col xs={14} sm={14}>
                                <FormItem>
                                  {getFieldDecorator('httpBodyFlag', {
                                    initialValue: httpBodyFlagIni,
                                  })(
                                    <RadioGroup
                                      disabled={sourceDisable}
                                      onChange={this.httpBodyOnChange}
                                    >
                                      <Radio value="enable">启用</Radio>
                                      <Radio value="disable">不启用</Radio>
                                    </RadioGroup>
                                  )}
                                </FormItem>
                              </Col>
                            </Row>
                            {httpBodyShow === 'block' && (
                              <div>
                                <Row>
                                  <Col xs={5} sm={5} />
                                  <Col xs={4} sm={4}>
                                    <div className={styles.colLabel}>
                                      <span>存储方案 :</span>
                                    </div>
                                  </Col>
                                  <Col xs={10} sm={10}>
                                    <FormItem extra="">
                                      {getFieldDecorator('httpBodyType', {
                                        initialValue: httpBodyTypeIni,
                                        rules: [{ validator: this.handleHttpBodyType }],
                                      })(
                                        <CheckboxGroup
                                          disabled={sourceDisable}
                                          options={[
                                            { label: 'Request body', value: 'request' },
                                            { label: 'Response body', value: 'response' },
                                          ]}
                                        />
                                      )}
                                    </FormItem>
                                  </Col>
                                </Row>

                                <Row>
                                  <Col xs={5} sm={5} />
                                  <Col xs={4} sm={4}>
                                    <div className={styles.colLabel}>
                                      <span>最大存储长度 :</span>
                                    </div>
                                  </Col>
                                  <Col xs={10} sm={10}>
                                    <FormItem extra="请输入0~1000的数值">
                                      {getFieldDecorator('httpBodyLimit', {
                                        initialValue: httpBodyConfig.limit || 1000,
                                        rules: [{ validator: this.inputNumberValidate }],
                                      })(
                                        <InputNumber
                                          disabled={sourceDisable}
                                          min={0}
                                          max={1000}
                                          formatter={(value) => value}
                                          parser={(value) => value.replace(/[,.$@]/g, '')}
                                          style={{ width: '100%' }}
                                        />
                                      )}
                                    </FormItem>
                                  </Col>
                                  <Col xs={4} sm={4}>
                                    <div className={styles.colPcapSize}>
                                      <div className={styles.textDiv}>&nbsp;字节</div>
                                    </div>
                                  </Col>
                                </Row>

                                <Row>
                                  <Col xs={5} sm={5} />
                                  <Col xs={4} sm={4}>
                                    <div className={styles.colLabel}>
                                      <span>CONTENT-TYPE类型:</span>
                                    </div>
                                  </Col>
                                  <Col xs={10} sm={10}>
                                    <FormItem extra="格式示例：“application/json, text/xml”，多个content-type时以逗号分隔，只有命中其中一种类型时会保存body信息，如果为空表示存储所有类型的body。">
                                      {getFieldDecorator('httpBodyContentType', {
                                        initialValue: httpBodyConfig.content_type_condition || '',
                                        rules: [{ validator: this.handleContentType }],
                                      })(
                                        <TextArea
                                          disabled={sourceDisable}
                                          autoSize={{ minRows: 2, maxRows: 6 }}
                                        />
                                      )}
                                    </FormItem>
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </Fragment>
                        )}

                        {logCbxState.indexOf('flow') > -1 && (
                          <Fragment>
                            <div>
                              <Row>
                                <Col xs={5} sm={5}>
                                  <div className={styles.colLabel}>
                                    <span>
                                      报文载荷存储配置{` `}
                                      <Tooltip title={pcapTooltip}>
                                        <QuestionCircleFilled className="fontBlue" />
                                      </Tooltip>
                                      {` :`}
                                    </span>
                                  </div>
                                </Col>
                                <Col xs={14} sm={14}>
                                  <FormItem>
                                    {getFieldDecorator('force-pcapstore', {
                                      initialValue: forceInitialValue,
                                    })(
                                      <RadioGroup
                                        disabled={sourceDisable}
                                        onChange={this.forcePcapStoreOnChange}
                                      >
                                        <Radio value="true">启用</Radio>
                                        <Radio value="false">不启用</Radio>
                                      </RadioGroup>
                                    )}
                                  </FormItem>
                                </Col>
                              </Row>

                              <Row style={{ display: pcapSizeShow }}>
                                <Col xs={5} sm={5}>
                                  <div className={styles.colLabel} />
                                </Col>
                                <Col xs={19} sm={19}>
                                  <div className={styles.colPcapSize}>
                                    <div className={styles.textDiv}>每条TCP/UDP流存储前</div>
                                    <div style={{ margin: '0 4px' }}>
                                      <FormItem extra="该参数目前最高支持50">
                                        {getFieldDecorator('flow-store-limit', {
                                          initialValue: flowLimitVal,
                                          rules: [{ validator: this.inputNumberValidate }],
                                        })(
                                          <InputNumber
                                            disabled={sourceDisable}
                                            min={0}
                                            max={50}
                                            formatter={(value) => value}
                                            parser={(value) => value.replace(/[,.$@]/g, '')}
                                            style={{ width: 141 }}
                                          />
                                        )}
                                      </FormItem>
                                    </div>
                                    <div className={styles.textDiv}>个包，每个包存储前</div>
                                    <div style={{ margin: '0 4px' }}>
                                      <FormItem extra="该参数目前最高支持500">
                                        {getFieldDecorator('packet-store-limit', {
                                          initialValue: packetLimitVal,
                                          rules: [{ validator: this.inputNumberValidate }],
                                        })(
                                          <InputNumber
                                            disabled={sourceDisable}
                                            min={0}
                                            max={500}
                                            formatter={(value) => value}
                                            parser={(value) => value.replace(/[,.$@]/g, '')}
                                            style={{ width: 141 }}
                                          />
                                        )}
                                      </FormItem>
                                    </div>
                                    <div className={styles.textDiv}>个字节。</div>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </Fragment>
                        )}
                      </Col>
                    </Row>
                  </TabPane>
                </Tabs>

                <Row>
                  <Col span={4} />
                  <Col span={20}>
                    <Row>
                      <Col xs={5} sm={5} />
                      <Col xs={14} sm={14}>
                        {this.dataAuth === 'rw' && (
                          <Button
                            className="smallBlueBtn"
                            style={{ height: 34 }}
                            loading={updateSourceLoading || updateLogsLoading || updatePcapLoading}
                            onClick={() => this.saveChange()}
                          >
                            保存
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
          {selectDisplay === 'block' && (
            <div className={styles.fixedWrap} onClick={this.fixedWrapClick} />
          )}
        </div>
      </div>
    );
  }
}
const SourceEditorForm = Form.create()(SourceEditor);
export default SourceEditorForm;
