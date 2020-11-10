import React, { Component } from 'react';
import { connect } from 'umi';
import classNames from 'classnames';
import { FormOutlined } from '@ant-design/icons';
import { Table, message, Button, Modal, Input } from 'antd';
import SlaverAddEditForm from './SlaverAddEditForm';
import configSettings from '../../../configSettings';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

/* eslint-disable camelcase */

const { confirm } = Modal;

@connect(({ sandboxData, version, global, loading }) => ({
  sandboxData,
  version,
  global,
  loading: loading.effects['sandboxData/fetchSandboxList'],
}))
class SandboxData extends Component {
  constructor(props) {
    super(props);
    this.vmAuth = getAuth('/systemSetting/dataAccess/sandbox');
    this.vmTotal = getAuth('_systemSetting_dataAccess_sandbox_add');
    this.state = {
      reqing: false,
      currentHoverRow: '', // 当前hover的行
      ipOperation: false, // 显示操作
      formVisible: false,
      editItem: {},
    };
    this.columns = [
      // {
      //   title: '分析机名称',
      //   dataIndex: 'alias_name',
      //   key: 'alias_name',
      // },
      {
        title: '分析机名称',
        dataIndex: 'alias_name',
        key: 'alias_name',
        render: (text, record) => {
          // if (record.ip === '127.0.0.1') {
          //   return text;
          // }
          const { ipOperation } = this.state;

          const uerCls = classNames(styles.userText, {
            [styles.noUserText]: ipOperation,
          });
          return (
            <div className={styles.tableAction}>
              <div className={uerCls}>
                <div className={styles.showText}>{text}</div>
                <div className={styles.showIcon}>
                  {this.vmAuth === 'rw' && (
                    <FormOutlined
                      onClick={() => {
                        this.setState({ ipOperation: !ipOperation });
                      }}
                      style={{ color: '#5cbaea' }} />
                  )}
                </div>
              </div>
              {ipOperation && (
                <div className={styles.userInput}>
                  <Input
                    size="small"
                    onPressEnter={(e) => {
                      const { value } = e.target;
                      this.validateAliasName(value, record);
                    }}
                  />
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '分析机地址',
        dataIndex: 'ip',
        key: 'ip',
      },
      {
        title: 'Windows XP (台)',
        dataIndex: '',
        key: 'winxp',
        render: (item) => <span>{item.image_info[0].image_num}</span>,
      },
      {
        title: 'Windows 10 (台)',
        dataIndex: '',
        key: 'win10',
        render: (item) => <span>{item.image_info[2].image_num}</span>,
      },
      {
        title: 'Windows 7 (台)',
        dataIndex: '',
        key: 'win7',
        render: (item) => <span>{item.image_info[1].image_num}</span>,
      },
      {
        title: 'Linux (台)',
        dataIndex: '',
        key: 'linux',
        render: (item) => <span>{item.image_info[4].image_num}</span>,
      },
      {
        title: '备注',
        dataIndex: 'extra_info',
        key: 'extra_info',
      },
      {
        title: this.vmAuth !== 'rw' ? '' : '操作',
        dataIndex: '',
        key: '',
        // width: 130,
        render: (text, record) => {
          if (this.vmAuth !== 'rw') {
            return '';
          }
          return (
            <div style={{ whiteSpace: 'nowrap' }}>
              <a
                style={{ marginRight: 4 }}
                onClick={() => {
                  this.showModalHandle('编辑', record);
                }}
              >
                编辑
              </a>
              <a
                onClick={() => {
                  this.delSlaverHandle(record);
                }}
              >
                删除
              </a>
            </div>
          );
        },
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'sandboxData/fetchSandboxList' });
    dispatch({ type: 'sandboxData/fetchSandboxIps' });
  };

  validateAliasName = (value, record) => {
    const { dispatch } = this.props;
    const val = configSettings.trimStr(value);
    console.log('val', val);
    if (val) {
      if (val.length > 32) {
        message.error('最多填写32字符，请重新填写');
      } else {
        const pattern = new RegExp(
          "[`~!@#$^&*()=|☆◎ΠΟ╦{}';',\\[\\]<>?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"
        );
        if (pattern.test(val)) {
          message.error('不能包含"[`~!@#$^&*()=|]{}?~￥……&*"等非法字符和特殊符号');
        } else {
          const reqObj = {
            modalTitle: '编辑',
            alias_name: val,
            extra_info: record.extra_info,
            ip: record.ip,
            slaver_name: record.slaver_name,
            linux: record.image_info[4].image_num,
            win7: record.image_info[1].image_num,
            win10: record.image_info[2].image_num,
            winxp: record.image_info[0].image_num,
          };
          dispatch({ type: 'sandboxData/addEditSlaverHandle', payload: reqObj })
            .then(() => {
              message.success(`编辑成功`);
              dispatch({ type: 'sandboxData/fetchSandboxList' });
            })
            .catch((error) => {
              message.error(error.msg);
            });
        }
      }
    } else {
      message.error('必填');
    }
    this.setState({ ipOperation: false });
  };

  showModalHandle = (modalTitle, modalData) => {
    const {
      // dispatch,
      sandboxData: {
        sandboxList: { sandbox, recordTotal },
      },
    } = this.props;
    let listNum = 0;
    if (recordTotal) {
      sandbox.forEach((obj) => {
        const item = obj.image_info;
        let itemNum = 0;
        item.forEach((image) => {
          itemNum += image.image_num;
        });
        listNum += itemNum;
      });
    }
    let editCurNum = 0;
    if (modalTitle === '编辑') {
      editCurNum = modalData.image_info.reduce((pre, now) => pre + now.image_num, 0);
      listNum -= editCurNum;
    }
    const allNumTotal = Number(this.vmTotal);
    console.log('沙箱最大虚拟机数 this.vmTotal==', this.vmTotal, 'allNumTotal=', allNumTotal);
    // dispatch({
    //   type: 'version/fetchAuthorizationInfo',
    // })
    //   .then(() => {
    //     const {
    //       version: { authorizationInfo },
    //     } = this.props;
    //     const allNumTotal = authorizationInfo.info.BoxFileCnt;
    let modalMaxNum = allNumTotal - listNum;
    if (!modalMaxNum) {
      // NaN
      modalMaxNum = editCurNum;
      if (editCurNum < 0) {
        modalMaxNum = 0;
      }
    }
    const modalItem = Object.assign({}, modalData, { modalTitle, modalMaxNum });
    // console.log('modalItem', modalItem);
    this.setState({ formVisible: true, editItem: modalItem });
    // })
    // .catch(error => {
    //   message.error(error.msg);
    // });
  };

  delSlaverHandle = (record) => {
    const { reqing } = this.state;
    const { dispatch } = this.props;
    const self = this;
    if (reqing) {
      return;
    }
    this.setState({ reqing: true });
    confirm({
      title: '删除后不可恢复，确定删除吗',
      onOk() {
        dispatch({
          type: 'sandboxData/deleteSlaverHandle',
          payload: { slaver_name: record.slaver_name },
        })
          .then(() => {
            message.success('删除成功');
            dispatch({ type: 'sandboxData/fetchSandboxList' });
            self.setState({ reqing: false });
          })
          .catch((error) => {
            message.error(error.msg);
            self.setState({ reqing: false });
          });
      },
      onCancel() {
        self.setState({ reqing: false });
      },
    });
  };

  onFormCancel = () => {
    this.setState({ formVisible: false, editItem: {} });
  };

  onFormSave = (values) => {
    const { reqing } = this.state;
    const { dispatch } = this.props;
    const { ip, slaver_name, alias_name, extra_info, winxp, win7, win10, linux, modalTitle } = values;
    if(winxp===0&&win7===0&&win10===0&&linux===0){
      message.error('至少配置一个虚拟机')
      return
    }
    let reqObj = { ip, winxp, win7, win10, linux, alias_name, extra_info, modalTitle };
    if (modalTitle === '编辑') {
      reqObj = { slaver_name, alias_name, winxp, win7, win10, linux, ip, extra_info, modalTitle };
    }
    if (reqing) {
      return;
    }
    this.setState({ reqing: true });
    dispatch({ type: 'sandboxData/addEditSlaverHandle', payload: reqObj })
      .then(() => {
        message.success(`${modalTitle}成功`);
        dispatch({ type: 'sandboxData/fetchSandboxList' });
        this.setState({ formVisible: false, editItem: {}, reqing: false });
      })
      .catch((error) => {
        message.error(error.msg);
        this.setState({ reqing: false });
      });
  };

  render() {
    const {
      sandboxData: { sandboxList, sandIps },
      global: { show_win10_vm: showVmWin10 },
      loading,
    } = this.props;
    const { formVisible, currentHoverRow, editItem } = this.state;

    if (showVmWin10 === 'no') {
      this.columns = this.columns.filter((cobj) => cobj.key !== 'win10');
    }

    return (
      <div className="TableTdPaddingWrap">
        {this.vmAuth === 'rw' && (
          <Button
            className="smallBlueBtn"
            style={{ marginBottom: 14 }}
            onClick={() => {
              this.showModalHandle('新建', {});
            }}
          >
            新建
          </Button>
        )}
        <Table
          rowKey="ip"
          loading={loading}
          columns={this.columns}
          dataSource={sandboxList.sandbox}
          rowClassName={(record, index) => (index === currentHoverRow ? styles.handleAction : '')}
          onRow={(record, index) => ({
            onMouseEnter: () => {
              this.setState({ currentHoverRow: index });
            },
            onMouseLeave: () => {
              this.setState({
                currentHoverRow: '',
                ipOperation: false,
              });
            },
          })}
        />
        {formVisible && (
          <SlaverAddEditForm
            key={formVisible}
            sandIps={sandIps}
            editItem={editItem}
            showVmWin10={showVmWin10}
            listData={sandboxList.sandbox}
            visible={formVisible}
            onCancel={this.onFormCancel}
            onSave={this.onFormSave}
          />
        )}
      </div>
    );
  }
}

export default SandboxData;
