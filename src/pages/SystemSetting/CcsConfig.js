/* eslint-disable camelcase */

import React, { Component } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Table, Modal, message, Badge, Tooltip } from 'antd';
import { connect } from 'umi';
// import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
// import moment from 'moment';
// import configSettings from '../../configSettings';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import CcsConfigFormDrawer from './CcsConfigFormDrawer';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

const { confirm } = Modal;
@connect(({ ccsConfig, msgNotify, loading }) => ({
  ccsConfig,
  msgNotify,
  loading: loading.effects['ccsConfig/fetchConfigList'],
  loading1: loading.effects['ccsConfig/destoryConfig'],
  loading2: loading.effects['msgNotify/ccsGlobalData'],
  loading3: loading.effects['global/fetchVpcConfig'],
}))
class CcsConfig extends Component {
  constructor(props) {
    super(props);
    this.ccsAuth = getAuth('/systemSetting/ccsConfig');
    this.state = {
      drawerVisible: false,
      drawerObj: {},
    };
    this.btnList = [
      {
        label: '编辑配置',
        color: 'blue',
        hide: this.ccsAuth !== 'rw',
        func: this.drawerOpen,
      },
      {
        label: '清空配置',
        type: 'danger',
        hide: this.ccsAuth !== 'rw',
        func: this.cleanConfig,
      },
    ];

    this.columns = [
      {
        title: '设备名称',
        dataIndex: 'ipName',
        key: 'ipName',
        width: 200,
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 200 }}>{text}</div>,
      },
      {
        title: '设备角色',
        dataIndex: 'role',
        key: 'role',
        render: (text) => (text === 'leader' ? '上级' : '下级'),
      },
      {
        title: '设备地址',
        dataIndex: 'ipPort',
        key: 'ipPort',
        // width: 200,
      },
      {
        title: '设备状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          const { ipName, ipPort } = record;
          const {
            ccsConfig: { healthObj = {} },
          } = this.props;
          // 分级配置页 状态会返回 alive/dead/exception, 分别对应 在线/离线/配置异常；
          // 配置异常的时候提示： 设备配置异常，请删除该设备后重新添加。
          const val = healthObj[ipName] || healthObj[ipPort] || '';
          if (val === 'alive') {
            return <Badge status="success" text="在线" />;
          }
          if (val === 'dead') {
            return <Badge status="error" text="离线" />;
          }
          if (val === 'exception') {
            return (
              <div className={styles.exceptionTip}>
                <Badge status="default" text="设备配置异常" />
                <Tooltip title="设备配置异常，请 “清空配置” 或 在 “编辑配置”中删除该设备 后重新添加。">
                  <QuestionCircleFilled className="fontBlue" />
                </Tooltip>
              </div>
            );
          }
          return '未知';
        },
      },
      {
        title: '设备位置',
        dataIndex: 'location',
        key: 'location',
        width: 200,
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 200 }}>{text}</div>,
      },
      {
        title: '备注信息',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 230,
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 230 }}>{text}</div>,
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // const { query } = this.state;
    dispatch({ type: 'ccsConfig/fetchConfigList' });
  }

  // 只有上级有此操作
  cleanConfig = () => {
    const { dispatch } = this.props;

    confirm({
      title: '确定清空所有配置吗',
      onOk() {
        dispatch({ type: 'ccsConfig/destoryConfig', payload: {} })
          .then((json) => {
            if (json.error_code === 0) {
              message.success('清空配置成功');
            } else {
              message.error(json.msg || '清空配置失败');
            }
            dispatch({ type: 'ccsConfig/fetchConfigList' });
            dispatch({ type: 'msgNotify/ccsGlobalData' }).then(() => {
              // dispatch({ type: 'global/fetchVpcConfig' });
              window.location.reload();
            });
          })
          .catch((error) => {
            message.error(error.msg);
            // dispatch({ type: 'ccsConfig/fetchConfigList' });
            // dispatch({ type: 'msgNotify/ccsGlobalData' });
          });
      },
      onCancel() {},
    });
  };

  drawerOpen = () => {
    // 子级不显示编辑页 未配置和上级显示
    const {
      ccsConfig: { configList, curCcsRole, ccsSelfObj },
    } = this.props;
    let drawerObj = ccsSelfObj;
    if (curCcsRole === 'leader') {
      const { ipPort, ipName, location, remarks, Fdevid } = configList[0];
      const subArr = configList.slice(1, configList.length);
      drawerObj = {
        devid: Fdevid,
        curCcsRole,
        subArr,
        curIpPort: ipPort,
        ipName,
        location,
        remarks,
      };
    }
    this.setState({ drawerVisible: true, drawerObj });
  };

  drawerClose = () => {
    // const { query } = this.state;
    const { dispatch } = this.props;
    this.setState({ drawerVisible: false, drawerObj: {} });
    dispatch({ type: 'ccsConfig/fetchConfigList' });
    dispatch({ type: 'msgNotify/ccsGlobalData' }).then(() => {
      // dispatch({ type: 'global/fetchVpcConfig' });
      window.location.reload();
    });
  };

  render() {
    const {
      ccsConfig: { configList = [], curCcsRole = '' },
      loading,
      loading1,
      loading2,
      loading3,
    } = this.props;
    const { drawerVisible, drawerObj } = this.state;

    this.btnList[0].disabled = curCcsRole === 'sub';
    this.btnList[1].disabled = curCcsRole !== 'leader';

    return (
      <div className="contentWraper">
        <div className="commonHeader">分级配置</div>
        <div>
          <div className="TableTdPaddingWrap">
            <div style={{ minHeight: 390 }}>
              <ButtonBlock btnList={this.btnList} hidePage />
              <Table
                rowKey="ipName"
                loading={loading || loading1 || loading2 || loading3}
                columns={this.columns}
                dataSource={configList}
              />
            </div>
          </div>
        </div>
        {drawerVisible && (
          <DrawerWidget
            visible={drawerVisible}
            title="分级配置"
            width={800}
            onClose={this.drawerClose}
          >
            <CcsConfigFormDrawer drawerObj={drawerObj} backTablePage={this.drawerClose} />
          </DrawerWidget>
        )}
      </div>
    );
  }
}
export default CcsConfig;
