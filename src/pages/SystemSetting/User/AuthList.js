/* eslint-disable camelcase */
import React, { Component } from 'react';
import { connect } from 'umi';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table, Modal, Input, Radio, message } from 'antd';
import configSettings from '../../../configSettings';
import styles from './AuthList.less';

const { confirm } = Modal;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const radioOptions = [{ value: '' }, { value: 'r' }, { value: 'rw' }];
// 有关联的功能页面，
const relevanceArr = [['/event/safeEvent/alarmFile', 'uploadPageShow']];
const defaultDisableList = ['/systemSetting/user/userList', '/systemSetting/user/authList'];
const renderContent = (value) => {
  const obj = {
    children: value,
    props: { colSpan: 0 },
  };
  return obj;
};

class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        dir: '', // desc or arc
        sort: '', // field
        page: 1,
        pageSize: 20,
      },
      modalVisible: false,
      editItem: {},
      checkedAuth: {}, // 选中的功能页权限
      // originCheckedAuth: {}, // 最初的选中页
      // checkedFeatureList: [], // 选中的其他权限
      authList: [], // 原始功能页权限列表信息
      allAuthList: [], // 保存全部功能页权限列表信息
      // featureList: [], // 原始其他功能点列表
      // isRenter: false,
    };
    // this.authority = getAuth('/systemSetting/user/authList');
    this.authority = true;
    this.authColumns = [
      {
        title: '功能页',
        dataIndex: 'Fpath_name',
        key: 'Fpath_name',
      },
      {
        title: '无权限',
        dataIndex: '',
        key: 'no',
        render: (record) => {
          const { checkedAuth } = this.state; // , isRenter
          let options = radioOptions;
          let value;
          // 对禁止查看路由置灰
          if (defaultDisableList.indexOf(record.Fpath) > -1) {
            options = radioOptions.map((item) => ({
              ...item,
              disabled: true,
            }));
            value = '';
          } else {
            // 租户：0表示不可见，即置灰不能选中
            // if (isRenter) {
            //   options = radioOptions.map((item, idx) => {
            //     const {
            //       auth: { r, rw },
            //     } = record;
            //     if (idx === 1) {
            //       return {
            //         ...item,
            //         disabled: !r,
            //       };
            //     }
            //     if (idx === 2) {
            //       return {
            //         ...item,
            //         disabled: !rw,
            //       };
            //     }
            //     return item;
            //   });
            // }
            value = checkedAuth[record.Fpath] || '';
          }
          // 漏洞任务的读功能直接置灰
          if (record.Fpath === '/vul/vulTask') {
            options = options.map((item) => ({ ...item, disabled: item.value === 'r' }));
          }
          return {
            children: (
              <div>
                <RadioGroup
                  className={styles.radioStyle}
                  options={options}
                  value={value}
                  onChange={(e) => {
                    this.onRadioChange(e, record.Fpath);
                  }}
                  // defaultValue={checkedAuth[record.Fpath]}
                />
              </div>
            ),
            props: {
              colSpan: 3,
            },
          };
        },
      },
      {
        title: '只读',
        dataIndex: 'r',
        key: 'r',
        render: renderContent,
      },
      {
        title: '读写',
        dataIndex: 'rw',
        key: 'rw',
        render: renderContent,
      },
    ];
    this.columns = [
      {
        title: '权限模板',
        dataIndex: 'Frole_name',
        key: 'Frole_name',
        width: 200,
      },
      {
        title: '创建人',
        dataIndex: 'Fcreater',
        key: 'Fcreater',
        width: 200,
      },
      {
        title: '创建时间',
        dataIndex: 'Finsert_time',
        key: 'Finsert_time',
        width: 200,
        render: (text) => moment(text).format(DATE_FORMAT),
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        render: (text, record) => (
          <div>
            <a
              disabled={record.Fcreater === '系统默认'}
              style={{ padding: '0 12px' }}
              onClick={() => {
                this.editRole(record);
              }}
            >
              编辑
            </a>
            <a
              disabled={record.Fcreater === '系统默认'}
              style={{ padding: '0 12px', borderLeft: '1px solid #D9DEEB' }}
              onClick={() => {
                this.deleteRole(record.Frole_id);
              }}
            >
              {' '}
              删除
            </a>
            {/* </div>} */}
          </div>
        ),
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({ type: 'auth/fetchRoleList', payload: query });
    dispatch({ type: 'auth/fetchRouteAuthList' })
      .then((res) => {
        const { routeList } = res;
        const checkedAuth = this.initAuth(routeList);
        // const checkedFeatureList = featureList.map(item => `${item.Fpath.replace(/\//g, '_')}_${item.auth}`);
        this.setState({
          authList: routeList,
          allAuthList: routeList,
          checkedAuth,
          // originCheckedAuth: checkedAuth,
        });
      })
      .catch((err) => {
        message.error(err.msg || err.message);
      });
  }

  // 初始化权限选择值--即权限模板中的选中值
  initAuth = (routeList) => {
    const obj = {};
    routeList.forEach((item) => {
      const { Fpath, auth } = item;
      if (!defaultDisableList.includes(Fpath)) {
        const { rw } = auth;
        // if (isRenter) {
        //   // console.log('rw',rw);
        //   obj[Fpath] = rw ? 'rw' : 'r';
        // } else {
        obj[Fpath] = rw !== undefined ? 'rw' : 'r';
        // }
      }
    });
    return obj;
  };

  onRadioChange = (e, Fpath) => {
    const { checkedAuth } = this.state;
    const auth = e.target.value;
    const newObj = Object.assign({}, checkedAuth);
    // const checkedList = [].concat(checkedFeatureList);
    const pair = relevanceArr.find((arr) => arr.includes(Fpath)); // 在 relevanceArr 中找到当前路径Fpath所在数组
    let theOne;
    // parent表示 当前触发的radio 是否是 relevanceArr 数组中索引为0 的 路径
    let parent = false;
    if (pair) {
      theOne = pair.filter((item) => item !== Fpath); // pair 中排除 触发的radio的路径
      const idx = pair.findIndex((item) => item === Fpath); // 触发的radio的路径 在pair的索引 看是否为0
      parent = !idx;
    }
    if (auth) {
      // "", "r", "rw"
      newObj[Fpath] = auth;
      // 有权限时 父子不影响
      // if (theOne) {
      //   console.log('theOne', theOne);
      //   theOne.forEach((item, index) => {
      //     if (index === 0) {
      //       newObj[item] = parent ? 'r' : 'rw';
      //     }
      //   });
      // }
      // 子有权限时 查看父有无权限 父无权限 子只能无权限
      if (parent === false && theOne) {
        const fatherPath = theOne[0];
        const fatherAuth = newObj[fatherPath];
        // console.log('fatherPath==', fatherPath, 'fatherAuth==', fatherAuth);
        if (!fatherAuth) {
          delete newObj[Fpath];
        }
      }
    } else {
      // 父路径无权限，子路径也无权限
      delete newObj[Fpath];
      // 是父节点，才同时删除两个
      console.log('theOne', theOne);
      if (theOne && parent) {
        theOne.forEach((item) => {
          delete newObj[item];
        });
        // delete newObj[theOne]
      }
    }
    this.setState({ checkedAuth: newObj });
  };

  editRole = (info) => {
    const { dispatch } = this.props;
    const { authList } = this.state;
    let editItem = {};
    if (info) {
      editItem = info;
      dispatch({
        type: 'auth/fetchRoleWithAuth',
        payload: { Frole_id: info.Frole_id },
      })
        .then((res) => {
          const { routeList } = res;
          const list = [].concat(authList);
          // if (info.Fis_renter) {
          //   const renterAutherList = authList.filter(item => item.Fis_renter === 1);
          //   list = [].concat(renterAutherList);
          // }
          const checkedAuth = this.initAuth(routeList); // , info.Fis_renter
          this.setState({
            modalVisible: true,
            authList: list,
            editItem,
            checkedAuth,
            // isRenter: info.Fis_renter,
          });
        })
        .catch(() => {
          message.error('获取该权限模板拥有权限失败');
        });
    } else {
      const checkedAuth = this.initAuth(authList);
      this.setState({ modalVisible: true, checkedAuth, editItem });
    }
  };

  deleteRole = (Frole_id) => {
    const { dispatch } = this.props;
    const { query } = this.state;
    confirm({
      title: `删除该权限模板，绑定该权限模板的用户也会被一并删除，确认删除该权限模板吗？`,
      onOk() {
        dispatch({ type: 'auth/deleteRole', payload: { Frole_id, query } });
      },
      onCancel() {},
    });
  };

  onCancel = () => {
    const { allAuthList } = this.state;
    this.setState({
      modalVisible: false,
      checkedAuth: {},
      // isRenter: false,
      authList: allAuthList,
    });
  };

  onOk = () => {
    const { form, dispatch } = this.props;
    const { checkedAuth, query } = this.state;
    if (isEmpty(checkedAuth)) {
      message.error('权限模板至少需要一个功能页的可读权限或读写权限');
      return;
    }
    // 功能页部分选中的权限
    const authList = Object.keys(checkedAuth).map(
      (key) => `${key.replace(/\//g, '_')}_${checkedAuth[key]}`
    );
    // console.log('authList', authList);
    form.validateFields((err, values) => {
      // console.log('values', values, authList);
      if (!err) {
        const { Frole_name, Frole_id } = values;
        const wording = Frole_id ? '更新' : '添加';
        dispatch({
          type: 'auth/editRole',
          payload: { Frole_id, Frole_name, FauthList: authList },
        })
          .then(() => {
            message.success(`${wording}成功`);
            dispatch({ type: 'auth/fetchRoleList', payload: query });
            this.setState({ modalVisible: false, checkedAuth: {} });
          })
          .catch((error) => {
            console.log('onOk err', error);
            message.error(error.msg);
          });
      }
    });
  };

  checkName = (rule, value, callback) => {
    const { editItem } = this.state;
    const { dispatch } = this.props;
    if (value && value.length > 32) {
      callback('名称不能超过32个字符');
    } else {
      if (value) {
        const newValue = configSettings.trimStr(value);
        dispatch({ type: 'auth/checkName', payload: { Frole_name: newValue } })
          .then((data) => {
            if (data && data.exist && editItem.Frole_name !== newValue) {
              message.error(data.msg || '校验名称失败');
            }
          })
          .catch(() => {
            message.error('校验名称失败');
          });
      }
      callback();
    }
  };

  batchOperation = (type) => {
    const { authList } = this.state;
    let newCheckedAuth = {};
    if (type) {
      authList.forEach((item) => {
        const { Fpath } = item;
        if (!defaultDisableList.includes(Fpath)) {
          // if (isRenter && type === 'rw') {
          //   newCheckedAuth[Fpath] = auth[type] === 1 ? type : 'r';
          // } else {
          newCheckedAuth[Fpath] = type;
          // }
        }
      });
    } else {
      newCheckedAuth = {}; // 全部无权限时，type为undefined，全部不选中，为{}
    }
    // console.log('new', newCheckedAuth);
    this.setState({ checkedAuth: newCheckedAuth });
  };

  // filterRrenterRouter = e => {
  //   // console.log('e', e.target.value);
  //   const isRenter = e.target.value;
  //   const { allAuthList } = this.state;
  //   let list;
  //   let checkedAuth;
  //   if (isRenter === 1) {
  //     const { authList } = this.state;
  //     const renterAutherList = authList.filter(item => item.Fis_renter === 1);
  //     list = [].concat(renterAutherList);
  //     checkedAuth = this.initAuth(list, true);
  //   } else {
  //     list = [].concat(allAuthList);
  //     checkedAuth = this.initAuth(list, false);
  //   }
  //   this.setState({ authList: list, checkedAuth, isRenter: !!isRenter });
  // };

  // 角色列表page控制函数
  pageOnChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({ type: 'auth/fetchRoleList', payload: newQuery });
  };

  render() {
    const {
      auth: { roleList },
      tableLoading,
      form,
    } = this.props;
    const {
      query: { pageSize, page },
      modalVisible,
      editItem,
      authList,
    } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 8 },
        sm: { span: 16 },
      },
    };
    return (
      <div className="TableTdPaddingWrap">
        <div className={styles.add}>
          <Button
            className="smallBlueBtn"
            onClick={() => {
              this.editRole();
            }}
          >
            新增权限模板
          </Button>
        </div>
        <Table
          rowKey="Fid"
          pagination={{
            defaultPageSize: pageSize,
            current: page,
            total: roleList.total,
            pageSizeOptions: ['20', '30', '50'],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `（${total}项）`,
            onChange: this.pageOnChange,
            size: 'small',
          }}
          loading={tableLoading}
          columns={this.columns}
          dataSource={roleList.list}
          size="middle"
        />
        <Modal
          width={800}
          title={isEmpty(editItem) ? '新增权限模板' : '编辑用户权限模板'}
          visible={modalVisible}
          cancelText="取消"
          destroyOnClose
          keyboard={false}
          maskClosable={false}
          onCancel={this.onCancel}
          onOk={this.onOk}
        >
          <Form>
            <FormItem {...formItemLayout} label="权限模板名">
              {getFieldDecorator('Frole_name', {
                initialValue: editItem.Frole_name || '',
                validateTrigger: 'onBlur',
                rules: [
                  { required: true, message: '请填写权限模板名' },
                  { validator: this.checkName },
                ],
              })(<Input style={{ width: 300 }} />)}
            </FormItem>
            {/* <FormItem {...formItemLayout} label="是否是租户">
              {getFieldDecorator('Fis_renter', {
                initialValue: editItem.Fis_renter === undefined ? 0 : editItem.Fis_renter,
              })(
                <RadioGroup
                  disabled={editItem.Fis_renter !== undefined}
                  onChange={e => {
                    this.filterRrenterRouter(e);
                  }}
                >
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </RadioGroup>
              )}
            </FormItem> */}
            <FormItem {...formItemLayout} style={{ display: 'none' }} label="权限模板名">
              {getFieldDecorator('Frole_id', {
                initialValue: editItem.Frole_id || '',
              })(<Input style={{ width: 300 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="功能权限" style={{ height: 620 }}>
              <div>
                <div className={styles.btnBlock}>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.batchOperation();
                    }}
                  >
                    全部无权限
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.batchOperation('r');
                    }}
                  >
                    全部读权限
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.batchOperation('rw');
                    }}
                  >
                    全部全权限
                  </Button>
                </div>
                <Table
                  rowKey="Fid"
                  loading={tableLoading}
                  columns={this.authColumns}
                  dataSource={authList}
                  size="middle"
                />
              </div>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

const AuthForm = Form.create()(Auth);
export default connect(({ auth, loading }) => ({
  auth,
  tableLoading: loading.effects['auth/fetchRoleList'],
}))(AuthForm);
