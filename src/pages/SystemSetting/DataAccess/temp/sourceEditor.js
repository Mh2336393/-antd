import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import Cookies from 'js-cookie';
import { connect} from 'umi';
import { Spin, Form, Input, Select, Checkbox, Button, Icon, message, Row, Col, Tooltip, InputNumber, Radio, Divider } from 'antd';
// import handleConfirmIp from '@/tools/ipValidCheck';
import { history } from 'umi';
import styles from './sourceEditor.less';
import authority from '@/utils/authority';
const { getAuth } = authority
import configSettings from '../../../configSettings';
import XFFIPPolicy from './components/XFFIPPolicy';


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
    { label: 'ldap', value: 'ldap', checked: false },
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

@connect(({ sourceAccess, global, loading }) => ({
  sourceAccess,
  hasVpc: global.hasVpc,
  loading: loading.effects['sourceAccess/getSourceInfo'],
  pcapLoading: loading.effects['sourceAccess/fetchPcapConfig'],
  logLoading: loading.effects['sourceAccess/fetchLogsConfig'],
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
      isReqing: false,
    };
    this.XffIPPolicy = null
  }

  componentDidMount = () => {
    const { dispatch, location } = this.props;
    dispatch({
      type: 'sourceAccess/getSuricataConfigAll',
      payload: { ip: location.query.ip },
    })

    const {
      sourceAccess: {
        suricataConfigAll: { xff },
      }
    } = this.props;

    let xffSetShow = false
    if (!xff) {
      message.error("XFF配置获取失败");
    } else {
      xffSetShow = xffConfig.enable === 'yes' ? true
    }






    dispatch({
      type: 'sourceAccess/fetchXffConfig',
      payload: { ip: location.query.ip },
    }).then(() => {
      const {
        sourceAccess: { xffConfig },
      } = this.props;
      this.propsData = { ...this.propsData, ...xffConfig };


      let xffSetShow = false;
      if (xffConfig.enable === 'yes') {
        xffSetShow = true;
      }
      this.setState({ xffSetShow });
    });

    dispatch({
      type: 'sourceAccess/fetchPcapConfig',
      payload: { ip: location.query.ip },
    }).then(() => {
      const {
        sourceAccess: { pcapConfig, httpBodyConfig, httpHeadConfig },
      } = this.props;

      this.propsData = { ...this.propsData, ...pcapConfig, ...httpBodyConfig, ...httpHeadConfig };

      let pcapSizeShowVal = 'block';
      let httpBodyShowVal = 'block';
      if (pcapConfig['force-pcapstore']) {
        pcapSizeShowVal = 'block';
      } else {
        pcapSizeShowVal = 'none';
      }
      if (httpBodyConfig.type !== 'disable') {
        httpBodyShowVal = 'block';
      } else {
        httpBodyShowVal = 'none';
      }
      this.setState({ pcapSizeShow: pcapSizeShowVal, httpBodyShow: httpBodyShowVal });
    });

    dispatch({
      type: 'sourceAccess/fetchLogsConfig',
      payload: { ip: location.query.ip },
    }).then(() => {
      const {
        sourceAccess: { logsConfig },
      } = this.props;
      const allState = logsConfig.length === logAllArr.length;
      this.propsData.trueLogs = Object.assign([], logsConfig);
      this.setState({ logCbxState: logsConfig, allState });
    });

    dispatch({
      type: 'sourceAccess/getSourceInfo',
      payload: { id: location.query.id },
    })
      .then(infoRes => {
        const { msg } = infoRes;
        this.setState({ queryIp: msg.ip, sourceName: msg.name, descript: msg.desc });

        this.propsData.ip = msg.ip;
        this.propsData.name = msg.name;
        this.propsData.desc = msg.desc;
        // form.setFieldsValue({ sourceName: msg.name, descript: msg.desc });
        dispatch({
          type: 'sourceAccess/getEngineCard',
          payload: { ip: msg.ip },
        })
          .then(netCard => {
            const { msg: msgCard, tceRes } = netCard;
            const netWorkArr = msgCard.interfaces.split(',');
            let tceConfig = false;
            if (tceRes && tceRes.msg) {
              tceConfig = tceRes.msg['tce-config'] || false;
            }
            this.propsData.interfaces = msgCard.interfaces;
            // this.propsData.netWork2 = msgCard.eth2;
            this.propsData.tceConfig = `${tceConfig}`;
            this.setState({ selectedCard: netWorkArr, tceConfig });
          })
          .catch(error => {
            message.error(error.msg);
          });
        dispatch({
          type: 'sourceAccess/getGroupAddress',
          payload: { ip: msg.ip },
        })
          .then(group => {
            this.propsData.homeNet = group.msg.HOME_NET;
            this.propsData.nginxNet = group.msg.NGINX_NET;
            this.setState({
              HOME_NET: group.msg.HOME_NET || '',
              NGINX_NET: group.msg.NGINX_NET || '',
            });
          })
          .catch(error => {
            message.error(error.msg);
          });
        dispatch({
          type: 'sourceAccess/fetchNetworkCard',
          payload: { ip: msg.ip },
        })
          .then(cards => {
            const {
              sourceAccess: { vxlanPort },
            } = this.props;
            this.propsData.vxlanPort = vxlanPort;
            this.setState({ cardsList: cards });
          })
          .catch(error => {
            message.error(error.msg);
          });
      })
      .catch(error => {
        message.error(error.msg);
      });
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
      arr.forEach(type => {
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
    if (flag === false) {
      // callback(
      //     '支持格式：any，1.2.3.4，!2.3.4.5，1.2.3.4/24，!2.3.4.5/24，1.2.3.4-2.3.4.5，!1.2.3.4-2.3.4.5，允许输入多个，以“,”或者换行分隔'
      // );
      callback('输入格式有误');
    }
    if (flag === 'repeat') {
      callback('请移除重复网段');
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
      logTypesArr.forEach(name => {
        logTypes[name].forEach(obj => {
          if (logCbxState.indexOf(obj.value) > -1) {
            selectedLabels.push(obj.label);
          }
        });
      });
      selectName = `${selectedLabels.join(', ')}`;
    }
    return selectName;
  };

  logTypesEles = cbxDisable => {
    const { logCbxState, allState } = this.state;
    return (
      <div className={styles.cbxWrap}>
        <div className={styles.cbxTop}>
          {logTypesArr.map(name => (
            <div key={name} className={styles.cbxDiv}>
              <div className={styles.cbxTheme}>
                <div className={styles.colLabelStyle}>
                  <span>{logTypes[`${name}_name`]}</span>
                  {name === 'net' && (
                    <span>
                      {` `}
                      <Tooltip title="禁用DNS日志会影响威胁情报产出">
                        <Icon className="fontBlue" type="question-circle" theme="filled" />
                      </Tooltip>
                    </span>
                  )}
                  {/* {name === 'sys' && (
                    <span>
                      {` `}
                      <Tooltip title="禁用TCP/UDP/ICMP日志会影响威胁情报产出">
                        <Icon className="fontBlue" type="question-circle" theme="filled" />
                      </Tooltip>
                    </span>
                  )} */}
                </div>
              </div>
              <div className={styles.cbxCxt}>
                {logTypes[name].map(obj => {
                  const curIndex = logCbxState.indexOf(obj.value);
                  return (
                    <Checkbox
                      disabled={cbxDisable}
                      className={styles.cbxStyle}
                      onChange={e => {
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
            onChange={e => {
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
      logCbxState = logCbxState.filter(typeName => !!typeName);
      const allState = logCbxState.length === logAllArr.length;
      this.setState({ allState, logCbxState });
    }
  };

  allCbxStateChange = e => {
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
      const noExist = value.filter(name => cardsList.indexOf(name) < 0);
      if (noExist.length) {
        callback('流量采集网口值有误，请重新选择');
      } else {
        const newArr = [];
        value.forEach(key => {
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
    const notExist = httpHeadMust.filter(type => value.indexOf(type) < 0);
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

  forcePcapStoreOnChange = e => {
    const { value } = e.target;
    if (value === 'true') {
      this.setState({ pcapSizeShow: 'block' });
    } else {
      this.setState({ pcapSizeShow: 'none' });
    }
  };

  httpBodyOnChange = e => {
    const { value } = e.target;
    if (value === 'enable') {
      this.setState({ httpBodyShow: 'block' });
    } else {
      this.setState({ httpBodyShow: 'none' });
    }
  };


  xffEnableOnChange = e => {
    const { value } = e.target;
    if (value === 'yes') {
      this.setState({
        xffSetShow: true
      });
    } else {
      this.setState({
        xffSetShow: false
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
      sourceAccess: { pcapConfig, xffConfig, httpBodyConfig, httpHeadConfig },
    } = this.props;
    const { queryIp, logCbxState, isReqing } = this.state;
    form.validateFields((err, values) => {
      console.log(646, 'err=', err, 'values=', values);
      const netWorkArr = values.selectedCard;
      const interfaces = netWorkArr.join(',');
      if (!err) {
        const query = {
          ip: queryIp,
          name: values.sourceName,
          desc: values.descript,
          tceConfig: values.tceConfig || 'false',
          homeNet: values.HOME_NET.replace(/\n/g, ','),
          nginxNet: values.NGINX_NET.replace(/\n/g, ','),
        };

        const networks = { interfaces };

        // xff配置
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
        } = values;
        const xffReq = {
          enable: xffEnable
        }
        if (xffEnable === 'yes') {
          let {
            xff_deployment: xffDeployment,
          } = values;
          if (!xffDeployment) xffDeployment = xffConfig.deployment


          xffReq.header = xffHeader;
          xffReq.mode = xffMode;
          xffReq.deployment = xffDeployment;

          if (xffDeployment === 'forward') {
            xffReq.item = this.XffIPPolicy.forwordModeReturnsAnOrdinalNumber()
            xffReq.host = xffConfig.host;
          } else if (xffDeployment === 'host') {
            xffReq.item = xffConfig.item
            const str = this.XffIPPolicy.hostModeReturnsString()
            if (str) {
              xffReq.host = str;
            } else {
              return
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
        console.log("xffReq==", xffReq)

        let customVal = '';
        if (httpHeadCustom && Array.isArray(httpHeadCustom)) {
          const customArr = httpHeadCustom.filter(typeTmp => httpHeadMust.indexOf(typeTmp) < 0);
          customVal = customArr.join(',');
        }

        let httpBodyTypeVal = 'disable';
        if (httpBodyFlag === 'enable') {
          if (httpBodyType.length === 2) {
            httpBodyTypeVal = 'all';
          } else {
            httpBodyTypeVal = httpBodyType[0] || '';
          }
        }

        // 默认 勾选http 日志，且 body 为启用状态
        let httpBodyReq = {
          type: httpBodyTypeVal,
          limit: httpBodyLimit,
          content_type_condition: httpBodyContentType,
          custom: customVal,
        };
        // 如果 body 是 未启用 状态
        if (httpBodyTypeVal === 'disable') {
          httpBodyReq.limit = httpBodyConfig.limit;
          httpBodyReq.content_type_condition = httpBodyConfig.content_type_condition;
        }
        if (logCbxState.indexOf('http') < 0) {
          httpBodyReq = httpBodyConfig;
          httpBodyReq.custom = httpHeadConfig.custom;
        }
        // console.log('httpBodyReq==', httpBodyReq, 'httpBodyConfig==', httpBodyConfig);

        // 全流量日志编辑
        const logReq = { ip: queryIp, trueLogs: logCbxState };

        let pcap = { ip: queryIp };
        if (logCbxState.indexOf('flow') < 0) {
          pcap = {
            ip: queryIp,
            // 'alert-flowstore': pcapConfig['alert-flowstore'],
            'force-pcapstore': false,
            'packet-store-limit': pcapConfig['packet-store-limit'],
            'flow-store-limit': pcapConfig['flow-store-limit'],
          };
        } else {
          pcap = {
            ip: queryIp,
            // 'alert-flowstore': values['alert-flowstore'] === 'true',
            'force-pcapstore': values['force-pcapstore'] === 'true',
            'packet-store-limit': values['packet-store-limit'],
            'flow-store-limit': values['flow-store-limit'],
          };
        }

        if (isReqing) {
          return
        }
        this.setState({ isReqing: true });

        const curEditData = { ...query, ...logReq, ...pcap, ...xffReq, ...httpBodyReq, ...networks, vxlanPort, 'alert-flowstore': true };
        const sourceEditChange = !_.isEqual(this.propsData, curEditData);
        dispatch({
          type: 'sourceAccess/updateSourceDate',
          payload: { ...query },
        })
          .then(() => {
            message.info('新配置已保存，请重启流量引擎以生效。');

            dispatch({
              type: 'sourceAccess/updateLogsConfig',
              payload: logReq,
            })
              .then(() => {
                message.success('流量日志配置编辑成功');

                dispatch({
                  type: 'sourceAccess/updatePcapConfig',
                  payload: { ...pcap, ...xffReq, ...httpBodyReq, ...networks, vxlanPort },
                })
                  .then(json => {
                    let hasError = false;
                    if (json.error_code === 0) {
                      // message.success(json.msg);
                    } else {
                      hasError = true;
                      message.error(json.msg);
                    }

                    if (json.vxlanRes && json.vxlanRes.msg) {
                      if (json.vxlanRes.error_code !== 0) {
                        hasError = true;
                        message.error(json.vxlanRes.msg);
                      }
                    }

                    if (json.setNetwork && json.setNetwork.msg) {
                      if (json.setNetwork.error_code === 0) {
                        // message.success(json.setNetwork.msg);
                      } else {
                        hasError = true;
                        message.error(json.setNetwork.msg);
                      }
                    }

                    if (json.xffResJson && json.xffResJson.msg) {
                      if (json.xffResJson.error_code === 0) {
                        // message.success(json.xffResJson.msg);
                      } else {
                        hasError = true;
                        message.error(json.xffResJson.msg);
                      }
                    }
                    if (json.httpBodyRes && json.httpBodyRes.msg) {
                      if (json.httpBodyRes.error_code === 0) {
                        // message.success(json.httpBodyRes.msg);
                      } else {
                        hasError = true;
                        message.error(json.httpBodyRes.msg);
                      }
                    }
                    if (json.httpHeadRes && json.httpHeadRes.msg) {
                      if (json.httpHeadRes.error_code === 0) {
                        // message.success(json.httpHeadRes.msg);
                      } else {
                        hasError = true;
                        message.error(json.httpHeadRes.msg);
                      }
                    }
                    if (hasError) {
                      this.setState({ isReqing: false });
                    } else {
                      Cookies.set('sourceEditChange', `${queryIp}_${sourceEditChange}`);
                      // setTimeout(() => {
                      this.setState({ isReqing: false }, () => {
                        history.push('/systemSetting/dataAccess/source');
                      });
                      // }, 300);
                    }
                  })
                  .catch(error => {
                    this.setState({ isReqing: false });
                    message.error(error.msg);
                  });
              })
              .catch(error => {
                this.setState({ isReqing: false });
                message.error(error.msg);
              });
          })
          .catch(erro => {
            this.setState({ isReqing: false });
            message.error(erro.msg);
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

  changeSelect = value => {
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
      pcapLoading,
      logLoading,
      hasVpc,
      sourceAccess: { vxlanPort, pcapConfig, xffConfig, httpBodyConfig, httpHeadConfig },
    } = this.props;
    const vxlanPortIniVal = typeof vxlanPort === 'number' ? `${vxlanPort}` : vxlanPort;

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
      isReqing,
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

    // const selectName = logCbxState.length > 0 ? `${logCbxState.join(', ')}` : '选择流量协议类型';
    const selectName = this.logSelectedLabel();

    const pcapTooltip = (
      <div>
        将TCP或UDP协议流量的报文载荷数据（payload）存储到数据平台的Flow日志中，在检索页面进行在线PCAP查看与下载，可以用于后续调查取证等工作。
        <br /> 注意：每条流存储总量 = 流存储报文数 * 报文存储字节数，开启报文存储会占用超大的磁盘存储空间，请谨慎评估后开启。
      </div>
    );
    // const alertTooltip = <div>开启该开关时，御界将对告警后的流量报文也进行存储，某些告警后的流量可协助判断攻击事件是否成功。</div>;

    const forceInitialValue = pcapConfig['force-pcapstore'] === true ? 'true' : 'false';
    // const alertInitialValue = pcapConfig['alert-flowstore'] === false ? 'false' : 'true';
    const flowLimitVal = pcapConfig['flow-store-limit'] === undefined ? 1 : pcapConfig['flow-store-limit'];
    const packetLimitVal = pcapConfig['packet-store-limit'] === undefined ? 100 : pcapConfig['packet-store-limit'];

    const xffEnableIni = xffConfig.enable === 'yes' ? 'yes' : 'no';
    const xffHeaderIni = xffConfig.header || '';
    const xffModeIni = xffConfig.mode === 'extra-data' ? 'extra-data' : 'overwrite';
    const xffDeploymentIni = xffConfig.deployment ? xffConfig.deployment : 'forward';

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
          <Icon type="left" style={{ color: '#2662EE' }} />
          <span style={{ cursor: 'pointer', color: '#2662EE' }} onClick={this.goBack}>
            返回
          </span>
          <span className="divider" />
          <span>流量接入编辑</span>
        </div>
        <div style={{ marginBottom: btmMargin }}>
          {loading || pcapLoading || logLoading ? (
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
                          rules: [{ required: true, message: '必选' }, { validator: this.selectCardValidate }],
                        })(
                          // <Select onChange={this.changeSelect}>
                          <Select mode="multiple">
                            {cardsList.map(card => (
                              <Option key={card} value={card}>
                                {card}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                      <FormItem {...formItemLayout} label="监控网段" extra={networkSegTips}>
                        {getFieldDecorator('HOME_NET', {
                          initialValue: HOME_NET || '',
                          rules: [{ required: true, message: '请输入监控网段' }, { validator: this.validateNetworkSeg }],
                        })(<TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
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
                                <Icon className="fontBlue" type="question-circle" theme="filled" />
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
                            })(<TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                          </FormItem>
                        </Col>
                      </Row>
                      <FormItem {...formItemLayout} label="备注">
                        {getFieldDecorator('descript', {
                          initialValue: descript || '',
                          rules: [{ max: 128, message: '长度不能超过128个字符' }],
                        })(<TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row className={styles.rowBlock}>
                    <Col span={4}>
                      <h4 className={styles.title4}>流量解析配置</h4>
                    </Col>
                    <Col span={20}>
                      <FormItem {...formItemLayout} label="VXLAN端口" extra="允许输入多个，以“,”分隔。总数不得超过四个">
                        {getFieldDecorator('vxlanPort', {
                          initialValue: vxlanPortIniVal || '4789',
                          validateTrigger: 'onBlur',
                          rules: [{ required: true, message: '必填' }, { validator: this.vxlanPortCheck }],
                        })(<Input />)}
                      </FormItem>

                      <Row>
                        <Col xs={5} sm={5}>
                          <div className={styles.colLabel}>
                            <span>解析流量日志{` :`}</span>
                          </div>
                        </Col>
                        <Col xs={14} sm={14} style={{ padding: '3px 0 4px 0', marginBottom: 24 }}>
                          <div className={styles.selectHeader} onClick={this.onSelectClick}>
                            <div className={styles.selectTxt} title={selectName}>
                              <span>{selectName}</span>
                              {selectDisplay === 'block' ? (
                                <Icon type="up" theme="outlined" className={styles.downIcon} />
                              ) : (
                                  <Icon type="down" theme="outlined" className={styles.downIcon} />
                                )}
                            </div>
                          </div>
                          <div className={styles.showCbxDiv}>
                            {selectDisplay === 'block' && <Fragment>{this.logTypesEles(sourceDisable)}</Fragment>}
                          </div>
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
                                  <RadioGroup disabled={sourceDisable} onChange={this.httpBodyOnChange}>
                                    <Radio value="enable">启用</Radio>
                                    <Radio value="disable">不启用</Radio>
                                  </RadioGroup>
                                )}
                              </FormItem>
                            </Col>
                          </Row>
                          {httpBodyShow === 'block' && (
                            <div>
                              <FormItem {...formItemLayout} label="存储方案" extra="">
                                {getFieldDecorator('httpBodyType', {
                                  initialValue: httpBodyTypeIni,
                                  rules: [{ validator: this.handleHttpBodyType }],
                                })(
                                  <CheckboxGroup
                                    disabled={sourceDisable}
                                    options={[{ label: 'Request body', value: 'request' }, { label: 'Response body', value: 'response' }]}
                                  />
                                )}
                              </FormItem>

                              <Row>
                                <Col xs={5} sm={5}>
                                  <div className={styles.colLabel}>
                                    <span>最大存储长度 :</span>
                                  </div>
                                </Col>
                                <Col xs={14} sm={14}>
                                  <FormItem extra="请输入0~1000的数值">
                                    {getFieldDecorator('httpBodyLimit', {
                                      initialValue: httpBodyConfig.limit || 1000,
                                      rules: [{ validator: this.inputNumberValidate }],
                                    })(
                                      <InputNumber
                                        disabled={sourceDisable}
                                        min={0}
                                        max={1000}
                                        formatter={value => value}
                                        parser={value => value.replace(/[,.$@]/g, '')}
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
                              <FormItem
                                {...formItemLayout}
                                label="CONTENT-TYPE类型"
                                extra="格式示例：“application/json, text/xml”，多个content-type时以逗号分隔，只有命中其中一种类型时会保存body信息，如果为空表示存储所有类型的body。"
                              >
                                {getFieldDecorator('httpBodyContentType', {
                                  initialValue: httpBodyConfig.content_type_condition || '',
                                  rules: [{ validator: this.handleContentType }],
                                })(<TextArea disabled={sourceDisable} autosize={{ minRows: 2, maxRows: 6 }} />)}
                              </FormItem>
                            </div>
                          )}
                          <Divider />
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
                                  rules: [{ required: true, message: '必选' }, { validator: this.selectCustom }],
                                })(
                                  <Select mode="multiple" disabled={sourceDisable}>
                                    {httpHeadList.map(headKey => (
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
                        </Fragment>
                      )}
                      {logCbxState.indexOf('flow') > -1 && (
                        <Fragment>
                          <div>
                            <Row>
                              <Col xs={5} sm={5}>
                                <div className={styles.colLabel}>
                                  <span>
                                    报文载荷存储{` `}
                                    <Tooltip title={pcapTooltip}>
                                      <Icon className="fontBlue" type="question-circle" theme="filled" />
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
                                    <RadioGroup disabled={sourceDisable} onChange={this.forcePcapStoreOnChange}>
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
                                          formatter={value => value}
                                          parser={value => value.replace(/[,.$@]/g, '')}
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
                                          formatter={value => value}
                                          parser={value => value.replace(/[,.$@]/g, '')}
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
                          <Divider />
                        </Fragment>
                      )}


                      <Row>
                        <Col xs={5} sm={5}>
                          <div className={styles.colLabel}>
                            <span>
                              XFF解析
                              {` :`}
                            </span>
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
                            <Col xs={5} sm={5}>
                              <div className={styles.colLabel}>
                                <span>
                                  XFF字段
                                  {` :`}
                                </span>
                              </div>
                            </Col>
                            <Col xs={14} sm={14}>
                              <FormItem>
                                {getFieldDecorator('xff_header', {
                                  initialValue: xffHeaderIni,
                                  rules: [
                                    { max: 128, message: '长度不能超过128个字符' },
                                  ],
                                })(<Input />)}
                              </FormItem>
                            </Col>
                            <Col xs={4} sm={4}>
                              <div className={styles.colLabel} style={{ textAlign: 'left', padding: '0 10px' }}>
                                <a onClick={this.xffHeaderBack}>还原</a>
                              </div>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={5} sm={5}>
                              <div className={styles.colLabel}>
                                <span>
                                  XFF使用模式
                                  {` :`}
                                </span>
                              </div>
                            </Col>
                            <Col xs={14} sm={14}>
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
                            <Col xs={5} sm={5}>
                              <div className={styles.colLabel}>
                                <span>XFF多IP策略&nbsp;
                                        <Tooltip
                                    title={(
                                      <Fragment>
                                        <p>当XFF字段中具有多个IP时，可通过配置策略选择使用XFF中的哪个IP作为告警源IP</p>
                                        <p style={{ width: "100%", height: "10px" }}></p>
                                        <p>按序选择：<br /><span >根据排列顺序选择使用哪个一个IP作为告警源IP</span></p>
                                        <p style={{ width: "100%", height: "10px" }}></p>
                                        <p>根据域名配置选择策略：<br /> <span >可针对不同域名(HTTP头部HOST字段)配置不同的IP选择策略。</span></p>
                                        <p style={{ width: "100%", height: "10px" }}></p>
                                        <p>自动选择外网IP：<br /> <span > 当XFF具备多个IP时，从第一个IP开始判断，自动选择非监控网段并且非代理网段的IP替换为告警源IP，如果没有找到则不进行替换。</span></p>
                                      </Fragment>
                                    )}
                                    placement="rightTop">
                                    <Icon className="fontBlue" type="question-circle" theme="filled" />
                                  </Tooltip>：
                                </span>
                              </div>
                            </Col>
                            <Col xs={14} sm={14}>
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
                            <Col xs={5} sm={5}></Col>
                            <Col xs={14} sm={14}>
                              < XFFIPPolicy
                                onRef={(ref) => { this.XffIPPolicy = ref; }}
                                deployment={getFieldValue('xff_deployment')}
                                xffConfig={xffConfig}
                              />
                            </Col>
                          </Row>





                        </div>
                      )}

                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} />
                    <Col span={20}>
                      <Row>
                        <Col xs={5} sm={5} />
                        <Col xs={14} sm={14}>
                          {this.dataAuth === 'rw' && (
                            <Button className="smallBlueBtn" style={{ height: 34 }} loading={isReqing} onClick={() => this.saveChange()}>
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
          {selectDisplay === 'block' && <div className={styles.fixedWrap} onClick={this.fixedWrapClick} />}
        </div>
      </div>
    );
  }
}
const SourceEditorForm = Form.create()(SourceEditor);
export default SourceEditorForm;
