import React, { Component } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Button, Table, Input, Pagination, message, InputNumber } from 'antd';
import styles from './index.less';

const { TextArea } = Input;

// 创建一个 Context 对象。当 React 渲染一个订阅了这个 Context 对象的组件，
// 这个组件会从组件树中离自身最近的那个匹配的 Provider 中读取到当前的 context 值。
const EditableContext = React.createContext();
@connect(({ global, accountSecurity, loading }) => ({
  accountSecurity,
  hasVpc: global.hasVpc,
  weakPasswordTableLoading: loading.effects['accountSecurity/searchWeakPasswordList'],
  deleteWeakPasswordLoading: loading.effects['accountSecurity/deleteWeakPassword'],
  editWeakPasswordLoading: loading.effects['accountSecurity/editWeakPassword'],
  addWeakPasswordLoading: loading.effects['accountSecurity/addWeakPassword'],
}))
class WeakPasswordManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weakPasswordTableSearch: '',
      weakPasswordList: [],
      pagination: {
        page: 1,
        pageSize: 10,
      },
      weakPasswordListTotal: 0,
      editingKey: '',
      addWeakPasswordVisible: false,
      addPasswordStr: '',
    };

    this.weakPasswordListColumns = [
      // {
      //   title: 'id',
      //   dataIndex: 'id',
      //   key: 'id',
      //   render: (text) => <span>{text}</span>,
      // },
      {
        title: '密码',
        dataIndex: 'password',
        key: 'password',
        editable: true,
        render: (text) => <span>{text}</span>,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 240,
        render: (text, record) => {
          const { deleteWeakPasswordLoading, editWeakPasswordLoading } = this.props;
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return (
            <div className={styles.colBtnBox}>
              {editable && (
                <div>
                  <EditableContext.Consumer>
                    {/* value => 基于 context 值进行渲染，因为.Provider那里包裹了from，所以我们这可以直接用 */}
                    {(form) => (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => this.save(form, record.id)}
                        style={{ marginRight: 10 }}
                        loading={editWeakPasswordLoading}
                      >
                        保存
                      </Button>
                    )}
                  </EditableContext.Consumer>

                  <Button
                    onClick={() => this.cancel(record.id)}
                    style={{ marginRight: '10px' }}
                    size="small"
                  >
                    取消
                  </Button>
                </div>
              )}

              {!editable && (
                <Button
                  style={{ marginRight: '10px' }}
                  type="primary"
                  size="small"
                  disabled={editingKey !== ''}
                  onClick={() => this.edit(record.id)}
                >
                  编辑
                </Button>
              )}

              <Button
                type="danger"
                size="small"
                loading={deleteWeakPasswordLoading}
                onClick={() => {
                  this.handelWeakPassword(record.id);
                }}
              >
                删除
              </Button>
            </div>
          );
        },
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    const { weakPasswordTableSearch, pagination } = this.state;
    dispatch({
      type: 'accountSecurity/searchWeakPasswordList',
      payload: {
        search: weakPasswordTableSearch,
        ...pagination,
      },
    }).then((res) => {
      this.setState({
        weakPasswordList: res.list || [],
        weakPasswordListTotal: res.total,
      });
    });
  };

  // 页数页码发生改变
  onWeakTablePaginatiChange(page, pageSize) {
    const { dispatch } = this.props;
    const { weakPasswordTableSearch } = this.state;
    const pagination = {
      page,
      pageSize,
    };
    dispatch({
      type: 'accountSecurity/searchWeakPasswordList',
      payload: {
        search: weakPasswordTableSearch,
        ...pagination,
      },
    }).then((res) => {
      this.setState({
        weakPasswordList: res.list || [],
        weakPasswordListTotal: res.total,
        pagination,
      });
    });
  }

  // 要添加的 新密码字符串
  onPasswordStrChange = (event) => {
    const { value } = event.target;
    this.setState({
      addPasswordStr: value.trim(),
    });
  };

  onClickAddWeakPassword() {
    const { addWeakPasswordVisible } = this.state;
    this.setState({
      addWeakPasswordVisible: !addWeakPasswordVisible,
      addPasswordStr: '',
    });
  }

  // 是否可编辑
  // eslint-disable-next-line react/destructuring-assignment
  isEditing = (record) => record.id === this.state.editingKey;

  // 搜索按钮点击
  searchWeakPasswordList = (search) => {
    const { dispatch } = this.props;
    const pagination = {
      page: 1,
      pageSize: 10,
    };
    dispatch({
      type: 'accountSecurity/searchWeakPasswordList',
      payload: {
        search,
        ...pagination,
      },
    }).then((res) => {
      this.setState({
        weakPasswordList: res.list || [],
        weakPasswordListTotal: res.total,
        pagination,
      });
    });
  };

  // 设置弱密码搜索关键字
  weakPasswordSearchChange = (e) => {
    const { value } = e.target;
    this.setState({
      weakPasswordTableSearch: value.trim(),
    });
  };

  // 根据id删除弱密码的行
  handelWeakPassword = (id) => {
    const { dispatch } = this.props;
    const { weakPasswordTableSearch, editingKey } = this.state;
    dispatch({
      type: 'accountSecurity/deleteWeakPassword',
      payload: { id },
    }).then(() => {
      const pagination = {
        page: 1,
        pageSize: 10,
      };
      dispatch({
        type: 'accountSecurity/searchWeakPasswordList',
        payload: {
          search: weakPasswordTableSearch,
          ...pagination,
        },
      }).then((res) => {
        this.setState({
          weakPasswordList: res.list || [],
          weakPasswordListTotal: res.total,
          pagination,
          editingKey: editingKey === id ? '' : editingKey,
        });
        message.success('删除成功');
      });
    });
  };

  // 取消编辑
  cancel = () => {
    this.setState({ editingKey: '' });
  };

  edit(id) {
    this.setState({ editingKey: id });
  }

  save(form, id) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const { password } = row;
      const { dispatch } = this.props;
      const { weakPasswordTableSearch, pagination } = this.state;
      // 1.发起编辑请求
      dispatch({
        type: 'accountSecurity/editWeakPassword',
        payload: { id, password },
      }).then(() => {
        // 2. 再次查询密码表数据
        dispatch({
          type: 'accountSecurity/searchWeakPasswordList',
          payload: {
            search: weakPasswordTableSearch,
            ...pagination,
          },
        }).then((res) => {
          this.setState({
            weakPasswordList: res.list || [],
            weakPasswordListTotal: res.total,
            editingKey: '',
          });
          message.success('编辑成功！');
        });
      });
    });
  }

  handelAddWeakPassword(addPasswordStr) {
    const { dispatch } = this.props;
    const { weakPasswordTableSearch, pagination } = this.state;
    if (!addPasswordStr) {
      message.info('请至少添加一行弱密码');
      return;
    }
    const passwords = addPasswordStr.split(/[,\n]/g);
    // 先添加
    dispatch({
      type: 'accountSecurity/addWeakPassword',
      payload: { passwords },
    }).then(() => {
      // 在查询
      dispatch({
        type: 'accountSecurity/searchWeakPasswordList',
        payload: {
          search: weakPasswordTableSearch,
          ...pagination,
        },
      }).then((res) => {
        this.setState({
          weakPasswordList: res.list || [],
          weakPasswordListTotal: res.total,
          addWeakPasswordVisible: false,
        });
        message.success('添加成功');
      });
    });
  }

  handleCancel() {
    const { weakPasswordManage } = this.props;
    weakPasswordManage(this);
    this.setState({ weakPasswordTableSearch: '' });
  }

  render() {
    const {
      weakPasswordManageVisible,
      weakPasswordTableLoading,
      addWeakPasswordLoading,
      form,
    } = this.props;
    const {
      weakPasswordTableSearch,
      weakPasswordList,
      pagination,
      weakPasswordListTotal,
      addWeakPasswordVisible,
      addPasswordStr,
    } = this.state;
    const components = {
      body: {
        // eslint-disable-next-line no-use-before-define
        cell: EditableCell,
      },
    };
    const weakPasswordListColumns = this.weakPasswordListColumns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record) => ({
          record,
          inputType: col.dataIndex === 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });
    return (
      <div>
        <Modal
          title="弱密码列表"
          width={650}
          visible={weakPasswordManageVisible}
          footer={null}
          onCancel={() => {
            this.handleCancel();
          }}
          maskClosable={false}
        >
          <div style={{ marginBottom: '10px' }}>
            <span>搜索:</span>
            <Input
              placeholder="密码"
              value={weakPasswordTableSearch}
              onChange={this.weakPasswordSearchChange}
              style={{ width: '150px', margin: '0px 10px 0px 10px' }}
              size="small"
            />
            <Button
              type="primary"
              size="small"
              onClick={() => {
                this.searchWeakPasswordList(weakPasswordTableSearch);
              }}
            >
              搜索
            </Button>
            <Button
              style={{ float: 'right' }}
              type="primary"
              size="small"
              onClick={() => {
                this.onClickAddWeakPassword();
              }}
            >
              添加弱密码
            </Button>
          </div>

          {/* 这里相当于把form绑定给了EditableContext 对象，每个 Context 对象都会返回一个 Provider React 组件，它允许消费组件订阅 context 的变化 */}
          <EditableContext.Provider value={form}>
            <Table
              components={components}
              loading={weakPasswordTableLoading}
              rowKey="id"
              columns={weakPasswordListColumns}
              dataSource={weakPasswordList}
              pagination={false}
            />
          </EditableContext.Provider>
          <div className={styles.weakPasswordPagination}>
            <Pagination
              defaultCurrent={1}
              showSizeChanger
              current={pagination.page}
              pageSize={pagination.pageSize}
              onChange={(page, pageSize) => {
                this.onWeakTablePaginatiChange(page, pageSize);
              }}
              onShowSizeChange={(page, pageSize) => {
                this.onWeakTablePaginatiChange(page, pageSize);
              }}
              total={weakPasswordListTotal}
            />
          </div>

          <Modal
            title="添加弱密码"
            visible={addWeakPasswordVisible}
            confirmLoading={addWeakPasswordLoading}
            onOk={() => {
              this.handelAddWeakPassword(addPasswordStr);
            }}
            onCancel={() => {
              this.onClickAddWeakPassword();
            }}
          >
            <TextArea
              rows={4}
              placeholder="请输入密码,允许输入多个，以为“,”或者换行分隔。"
              value={addPasswordStr}
              onChange={this.onPasswordStrChange}
            />
          </Modal>
        </Modal>
      </div>
    );
  }
}
// 经过 Form.create 包装的组件将会自带 this.props.form 属性
const WeakPasswordManageModal = Form.create()(WeakPasswordManage);
export default WeakPasswordManageModal;

// eslint-disable-next-line react/no-multi-comp
class EditableCell extends Component {
  getInput = () => {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.props.inputType === 'number') {
      return <InputNumber />;
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `请输入${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    // 因为是同一个Context对象，所以他也拿到了from属性，同样的getFieldDecorator等from的api都可以直接用
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}
