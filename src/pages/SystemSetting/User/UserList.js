/* eslint-disable camelcase */
import React, { Component } from 'react';
import { connect } from 'umi';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Switch, Table, Button, Modal, Input, Select, Popconfirm, Radio, message } from 'antd';
import styles from './UserList.less';

const { confirm } = Modal;

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { Option } = Select;
class UserManger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        dir: '', // desc or arc
        sort: '', // field
        page: 1,
        pageSize: 20,
      },
      userModalVisibe: false,
      editItem: {},
      // roleList: [],
      modalType: -1, // 0 表示新增用户 1表示编辑用户
      // levelSelect: false, // 是否为租户，选择是 为true
      // group: {},
      // renterCmdb: [],
    };
    // this.onCancel = this.onCancel.bind(this);
    // this.checkPhone = this.checkPhone.bind(this);
    // this.allRole = [];
    this.columns = [
      {
        title: '用户名',
        dataIndex: 'user_id',
        key: 'user_id',
        width: 200,
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 200 }}>{text}</div>,
      },
      {
        title: '用户角色',
        dataIndex: 'Frole_name',
        key: 'Frole_name',
        width: 200,
        render: (text) => <div style={{ whiteSpace: 'pre' }}>{text}</div>,
      },
      {
        title: '邮箱',
        dataIndex: 'user_mail',
        key: 'user_mail',
        width: 200,
      },
      {
        title: '手机',
        dataIndex: 'user_phone',
        key: 'user_phone',
        width: 200,
      },
      {
        title: '创建人',
        dataIndex: 'create_user',
        key: 'create_user',
        width: 200,
      },
      // {
      //   title: '租户名称',
      //   dataIndex: 'tenant',
      //   key: 'tenant',
      //   width: 200,
      //   render: text => (text ? text.label : ''),
      // },
      // {
      //   title: '策略组',
      //   dataIndex: 'ruleGroup',
      //   key: 'ruleGroup',
      //   width: 200,
      //   render: text => (text ? text.Fname : ''),
      // },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        key: 'create_time',
        width: 200,
        sorter: true,
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '状态',
        dataIndex: 'is_valid',
        key: 'is_valid',
        sorter: true,
        render: (text, record) => (
          <Switch
            checkedChildren="开"
            disabled={record.role === 1}
            unCheckedChildren="关"
            defaultChecked={text !== 0}
            checked={text !== 0}
            onChange={(checked) => {
              const param = checked ? 1 : 0;
              this.handleUser(param, record.id);
            }}
          />
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          // console.log("role", record.role);
          <div style={{ whiteSpace: 'pre' }} className={styles.action}>
            <span
              style={{ padding: '0px 12px', borderRight: '1px solid #D9DEEB' }}
              onClick={() => {
                this.editUser(record);
              }}
            >
              <a>编辑</a>
            </span>
            <Popconfirm
              title="确定将用户密码重置为admin?"
              onConfirm={() => {
                this.resetPwd(record.id);
              }}
            >
              {/* {record.role !== 4 && ( */}
              <a style={{ padding: '0px 12px' }} href="#">
                重置密码
              </a>
              {/* )} */}
            </Popconfirm>
            {record.create_user !== '系统默认' && (
              <a
                style={{ padding: '0px 12px', borderLeft: '1px solid #D9DEEB' }}
                onClick={() => {
                  this.deleteUser(record.id);
                }}
              >
                删除
              </a>
            )}
          </div>
        ),
      },
    ];
  }

  componentWillMount = () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'userManger/fetchUserList',
      payload: query,
    });
    dispatch({ type: 'userManger/fetchRoleList' });
    // .then(() => {
    //   const {
    //     userManger: { roleList },
    //   } = this.props;
    //   this.allRole = roleList;
    //   this.setState({ roleList });
    // });
    // dispatch({ type: 'userManger/fetchTenantList' });
    // dispatch({ type: 'userManger/fetchRuleGroup' });
  };

  onOk = () => {
    const {
      form,
      dispatch,
      // userManger: { ruleList },
    } = this.props;
    const { query, editItem } = this.state;

    const self = this;
    form.validateFields((err, values) => {
      // console.log('values', values, err);
      if (err) {
        return;
      }
      const params = values;
      if (!params.user_phone) {
        delete params.user_phone;
      }
      // 编辑用户
      if (editItem.id) {
        const { create_user } = editItem;
        const { role, ...other } = values;
        const Fparams = Object.assign({}, other);
        dispatch({
          type: 'userManger/editUser',
          payload: { user: create_user !== '系统默认' ? { role, ...Fparams } : Fparams, query },
        })
          .then(() => {
            message.success('修改成功！');
            self.setState({
              userModalVisibe: false,
              editItem: {},
              modalType: -1,
              // levelSelect: false,
              // roleList: self.allRole,
              // group: {},
            });
            form.resetFields();
          })
          .catch((error) => {
            console.log('error', error);
            message.error(error.msg);
          });
      } else {
        // 新增用户
        const Fparams = { ...values };
        dispatch({
          type: 'userManger/editUser',
          payload: { user: Fparams, query },
        })
          .then(() => {
            message.success('账号已创建成功，请记住初始密码为“admin”，首次登录需要修改密码');

            this.setState({
              userModalVisibe: false,
              editItem: {},
              modalType: -1,
              // levelSelect: false,
              // roleList: this.allRole,
              // group: {},
            });
            form.resetFields();
          })
          .catch((error) => {
            console.log('error', error);
            message.error(error.msg);
          });
      }
    });
  };

  onCancel = () => {
    this.setState({
      userModalVisibe: false,
      editItem: {},
      // levelSelect: false,
      // group: {},
      // roleList: this.allRole,
    });
  };

  deleteUser = (id) => {
    const { dispatch } = this.props;
    const { query } = this.state;
    confirm({
      title: `确认删除该用户吗？`,
      onOk() {
        dispatch({ type: 'userManger/delUser', payload: { id } })
          .then(() => {
            message.success('该账号删除成功');
            dispatch({ type: 'userManger/fetchUserList', payload: query });
          })
          .catch((err) => {
            message.error(`删除账号失败：${err.msg}`);
          });
      },
      onCancel() {},
    });
  };

  handleUser = (is_valid, id) => {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'userManger/handleUser',
      payload: { info: { is_valid, id }, query },
    });
  };

  editUser = (user) => {
    if (!user) {
      this.setState({ userModalVisibe: true, modalType: 0 });
      return;
    }
    this.setState({
      userModalVisibe: true,
      editItem: user,
      modalType: 1,
    });
  };

  resetPwd = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userManger/resetPwd',
      payload: { id },
    });
  };

  checkPhone = (rule, value, callback) => {
    if (!/^((1[3|3|4|5|7|8][0-9])+\d{8})$/.test(value) && value) {
      callback('请填写有效的电话号码');
    } else {
      callback();
    }
  };

  checkName = (rule, value, callback) => {
    if (value && (value.length > 32 || value.length < 4)) {
      callback('名称不能小于4个字符或者超过32个字符');
    } else if (!/^[A-Za-z0-9_]{4,32}$/.test(value)) {
      callback('用户名只允许输入大小写字母，数字，以及下划线');
    } else {
      callback();
    }
  };

  // checkSamePhone = (rule, value, callback) => {
  //   const user = this.props.form.getFieldValue('user');
  //   // console.log('user', user);
  //   if (value && value !== user) {
  //     callback('手机号与用户名要一致');
  //   } else {
  //     callback();
  //   }
  // };

  // changeIsRenter = e => {
  //   let newRoleList = [];
  //   const { form } = this.props;
  //   if (e.target.value === 1) {
  //     newRoleList = this.allRole.filter(item => item.Frole_id > 3);
  //     this.setState({ roleList: newRoleList, levelSelect: true });
  //   } else {
  //     newRoleList = this.allRole;
  //     this.setState({ roleList: newRoleList, levelSelect: false });
  //   }
  //   form.setFieldsValue({ Frole: '' });
  // };

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
    let newQuery;
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, {
        page: current,
        pageSize,
      });
    } else {
      const { field, order } = sorter;
      if (!field) return;
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, {
        dir,
        sort: field,
        page: 1,
      });
    }
    this.setState({
      query: newQuery,
    });
    dispatch({
      type: 'userManger/fetchUserList',
      payload: newQuery,
    });
  };

  roleChange = (value) => {
    console.log('role_value==', value);
    // const { roleList } = this.state;
    // const { form } = this.props;
    // const { Fis_renter } = roleList.filter(item => item.Frole_id === value)[0];
    // if (Fis_renter === 1) {
    //   this.setState({ levelSelect: true });
    //   form.setFieldsValue({ Fis_renter: 1 });
    // }
  };

  // tenantChange = value => {
  //   this.fetchGroup(value.key);
  // };

  // fetchGroup = tenant_id => {
  //   const { form, dispatch } = this.props;
  //   dispatch({
  //     type: 'userManger/fetchGroupWithTenant',
  //     payload: { tenant_id },
  //   })
  //     .then(res => {
  //       // console.log('group', res)
  //       form.setFieldsValue({ rule_group: res.Fid });
  //       this.setState({ group: res });
  //     })
  //     .catch(err => {
  //       console.log('err', err);
  //     });
  // };

  render() {
    // renterCmdb,
    const {
      userModalVisibe,
      editItem,
      modalType,
      query: { page, pageSize },
      // levelSelect,
      // roleList,
      // group,
    } = this.state;
    const {
      userManger: { userList, roleList },
      form,
      tableLoading,
    } = this.props;
    const { recordsTotal, list } = userList;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 8 },
        sm: { span: 16 },
      },
    };
    // console.log('group', group);
    // const finalRoleList = levelSelect ? roleList.filter(item => item.Fis_renter === 1) : roleList.filter(item => item.Fis_renter !== 1);
    // console.log('xx', finalRoleList);
    return (
      <div className="TableTdPaddingWrap">
        <div>
          <div className={styles.add}>
            <Button // type="primary"
              className="smallBlueBtn"
              onClick={() => {
                this.editUser();
              }}
            >
              新增用户
            </Button>
          </div>
          <Table
            rowKey="id"
            pagination={{
              defaultPageSize: pageSize,
              current: page,
              total: recordsTotal,
              pageSizeOptions: ['20', '30', '50'],
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `（${total}项）`,
            }}
            loading={tableLoading}
            columns={this.columns}
            dataSource={list}
            size="middle"
            onChange={this.handleTableChange}
          />
        </div>
        <Modal
          title={modalType === 1 ? '用户编辑' : '新增用户'}
          visible={userModalVisibe}
          cancelText="取消"
          destroyOnClose
          onCancel={this.onCancel}
          onOk={this.onOk}
          maskClosable={false}
          keyboard={false}
        >
          <div id="formCon">
            <Form>
              <FormItem {...formItemLayout} label="账号启停">
                {getFieldDecorator('is_valid', {
                  initialValue: editItem.is_valid === 0 ? 0 : 1,
                })(
                  <RadioGroup disabled={editItem.role === 1}>
                    <Radio value={1}>开启</Radio>
                    <Radio value={0}>关闭</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              {/* <FormItem {...formItemLayout} label="是否为租户">
                {getFieldDecorator('Fis_renter', {
                  initialValue: editItem.Fis_renter === 1 || editItem.Fis_renter === 2 ? 1 : 0,
                })(
                  <RadioGroup onChange={this.changeIsRenter} disabled={editItem.Fcreater === '系统默认'}>
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                )}
              </FormItem> */}
              {/* {levelSelect && (
                <FormItem {...formItemLayout} label="是否sso登录">
                  {getFieldDecorator('Fis_sso', {
                    initialValue: editItem.Fis_renter === 2 ? 0 : 1,
                  })(
                    <RadioGroup
                      // onChange={this.changeIsSso}
                      disabled={editItem.Fcreater === '系统默认'}
                    >
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              )} */}
              <FormItem {...formItemLayout} label="用户名">
                {getFieldDecorator('user_id', {
                  initialValue: editItem.user_id || '',
                  rules: [
                    { required: true, message: '请填写用户名' },
                    { validator: this.checkName },
                  ],
                })(<Input disabled={modalType === 1} />)}
              </FormItem>
              <FormItem {...formItemLayout} label="权限">
                {getFieldDecorator('role', {
                  initialValue: editItem.role || (roleList[0] ? roleList[0].Frole_id : 1),
                  rules: [{ required: true, message: '请选择用户角色' }],
                })(
                  <Select disabled={editItem.create_user === '系统默认'} onChange={this.roleChange}>
                    {roleList.map((item) => (
                      <Option key={item.Frole_id} value={item.Frole_id}>
                        {item.Frole_name}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="手机">
                {getFieldDecorator('user_phone', {
                  initialValue: editItem.user_phone || '',
                  rules: [{ validator: this.checkPhone }],
                })(<Input />)}
              </FormItem>
              <FormItem {...formItemLayout} label="邮箱">
                {getFieldDecorator('user_mail', {
                  initialValue: editItem.user_mail || '',
                  rules: [{ type: 'email', message: '请填写正确邮箱' }],
                })(<Input />)}
              </FormItem>
              <FormItem {...formItemLayout} style={{ display: 'none' }}>
                {getFieldDecorator('id', { initialValue: editItem.id || '' })(<Input />)}
              </FormItem>
              {/* {levelSelect && (
                <Fragment>
                  <FormItem {...formItemLayout} label="租户id选择">
                    {getFieldDecorator('tenant', {
                      initialValue: editItem
                        ? editItem.tenant
                        : {
                          key: tenantList[0].Ftenant_id,
                          label: tenantList[0].Ftenant_name,
                        },
                      rules: [{ required: true, message: '请选择租户id选择' }],
                    })(
                      <Select labelInValue onChange={this.tenantChange} getPopupContainer={() => document.getElementById('formCon')}>
                        {tenantList.map((item, index) => (
                          <Option key={item.Ftenant_id} value={item.Ftenant_id}>
                            {item.Ftenant_name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="策略组选择">
                    {getFieldDecorator('rule_group', {
                      initialValue: editItem.ruleGroup ? editItem.ruleGroup.Fid : group.Fid ? group.Fid : null,
                      rules: [{ required: true, message: '请选择策略组' }],
                    })(
                      <Select>
                        {ruleList.map(item => (
                          <Option key={item.Fid} value={item.Fid}>
                            {item.Fname}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Fragment>
              )} */}
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
const UserMangerWrapper = Form.create()(UserManger);
export default connect(({ userManger, loading }) => ({
  userManger,
  tableLoading: loading.effects['userManger/fetchUserList'],
}))(UserMangerWrapper);
