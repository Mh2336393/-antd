/* eslint-disable no-unreachable */
import React, { Component } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, message, Modal, Input, Divider } from 'antd';
import moment from 'moment';
import { Link } from 'umi';
import SearchBlock from '@/components/SearchBlock';
import authority from '@/utils/authority';
const { getAuth } = authority;

const FormItem = Form.Item;

@connect(({ assetGroup, loading }) => ({
  assetGroup,
  loading: loading.effects['assetGroup/fetchList'],
}))
class AssetGroup extends Component {
  constructor(props) {
    super(props);
    this.auth = getAuth('/asset/assetgroup');
    this.state = {
      query: {
        keyword: '',
        sort: 'Finsert_time',
        dir: 'desc',
        page: 1,
        pageSize: 20,
      },
      selectedRowKeys: [],
      editItem: {},
      formVisible: false,
    };

    this.columns = [
      {
        title: '资产组名称',
        dataIndex: 'Fgroup_name',
        key: 'Fgroup_name',
        render: (text) => <span>{text}</span>,
      },
      {
        title: '资产数',
        dataIndex: 'assetCount',
        key: 'assetCount',
        render: (text, record) => (
          <Link to={`/asset/assetList?Fgid=${record.Fgid}&Fgroup_name=${record.Fgroup_name}`}>
            {text}
          </Link>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'Finsert_time',
        key: 'Finsert_time',
        render: (text) => (
          <span>
            {text && text !== '0000-00-00 00:00:00'
              ? moment(text).format('YYYY-MM-DD HH:mm:ss')
              : '暂无'}
          </span>
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <div>
            {this.auth === 'r' ? null : (
              <div>
                <a
                  onClick={() => {
                    this.editGroup(record);
                  }}
                >
                  编辑
                </a>
                <Divider type="vertical" />
                <a
                  onClick={() => {
                    this.delGroup(record);
                  }}
                >
                  删除
                </a>
              </div>
            )}
          </div>
        ),
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    const newQuery = Object.assign({}, { ...query });
    dispatch({
      type: 'assetGroup/fetchList',
      payload: newQuery,
    });
  };

  // 资产组搜索
  onSearchFn = (value) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { keyword: value });
    this.setState({ query: newQuery });
    dispatch({
      type: 'assetGroup/fetchList',
      payload: newQuery,
    });
  };

  searchChange = (value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { keyword: value });
    this.setState({ query: newQuery });
  };

  // 资产组分页
  handleTableChange = (pagination) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    const newQuery = Object.assign({}, query, { page: current, pageSize });
    dispatch({
      type: 'assetGroup/fetchList',
      payload: newQuery,
    });
    this.setState({ query: newQuery });
  };

  // 资产组列表选择操作
  onSelect = (record, selected) => {
    // const childrenids = [record].reduce((accumulator, currentValue) => accumulator.concat(currentValue.childrenids || []), []);
    const { selectedRowKeys } = this.state;
    const ids = [record].map((item) => item.Fgid);
    let newids = [];
    if (selected) {
      newids = selectedRowKeys.concat(ids);
    } else {
      newids = selectedRowKeys.filter((id) => ids.indexOf(id) === -1);
    }
    this.setState({
      selectedRowKeys: newids,
    });
  };

  onSelectAll = (selected, selectedRows) => {
    const newids = selectedRows.map((item) => item.Fgid);
    this.setState({
      selectedRowKeys: newids,
    });
  };

  selectRowOnchange = () => {};

  // 从当前分组下新增子分组
  addGroup = () => {
    this.setState({
      formVisible: true,
    });
  };

  editGroup = (record) => {
    this.setState({ formVisible: true, editItem: record });
  };

  delGroup = (record) => {
    const { dispatch } = this.props;
    const { query } = this.state;

    const Fgids = [record.Fgid];

    Modal.confirm({
      title: '确认删除吗?',
      onOk: () => {
        dispatch({
          type: 'assetGroup/delGroup',
          payload: {
            data: {
              Fgids,
            },
            query,
          },
        });
      },
      onCancel: () => {},
    });
  };

  delGroupBatch = () => {
    const { dispatch } = this.props;
    const { selectedRowKeys, query } = this.state;
    if (selectedRowKeys.length === 0) {
      message.error('未选择分组');
      return;
    }

    Modal.confirm({
      title: '确认删除吗?',
      onOk: () => {
        dispatch({
          type: 'assetGroup/delGroup',
          payload: {
            data: {
              Fgids: selectedRowKeys,
            },
            query,
          },
        }).then(() => {
          message.success('删除成功');
          this.setState({
            selectedRowKeys: [],
          });
        });
      },
      onCancel: () => {},
    });
  };

  // 资产组表单提交操作
  groupFormSubmit = () => {
    const { query, editItem } = this.state;
    const { dispatch, form } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        const params = { Fgid: editItem.Fgid, Fgroup_name: values.Fgroup_name };
        if (params.Fgid) {
          dispatch({
            type: 'assetGroup/updateGroup',
            payload: {
              data: params,
              query,
            },
          })
            .then(() => {
              message.success('编辑成功');
            })
            .catch(() => {
              message.error('编辑失败');
            });
        } else {
          delete params.Fgid;
          dispatch({
            type: 'assetGroup/addGroup',
            payload: {
              data: params,
              query,
            },
          })
            .then(() => {
              message.success('新增成功');
            })
            .catch((error) => {
              message.error(`新增失败: ${error.msg}`);
            });
        }
        this.setState({ formVisible: false, editItem: {} });
      }
    });
  };

  validatName = (rule, value, callback) => {
    if (value) {
      if (value.trim()) {
        callback();
      } else {
        callback('字符串不能只为空字符串');
      }
    } else {
      callback();
    }
  };

  render() {
    const {
      assetGroup: {
        // filterAssetList,
        assetGroupList: { recordsTotal, list },
        // userList,
      },
      loading,
      form,
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 18 },
      },
    };
    const { query, selectedRowKeys, editItem, formVisible } = this.state;

    // 1. 资产组列表操作
    const groupRowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    if (this.auth === 'r') {
      this.btnList = [];
    } else {
      this.btnList = [
        {
          label: '新建',
          type: 'primary',
          func: () => {
            this.addGroup();
          },
        },
        {
          label: '删除',
          type: 'danger',
          disabled: true,
          func: () => {
            this.delGroupBatch();
          },
        },
      ];
      this.btnList[1].disabled = selectedRowKeys.length === 0;
    }
    // const readonly = this.auth === 'r' || (groupInfo && groupInfo.Fgid > 0);
    const readonly = this.auth === 'r';

    return (
      <div className="container">
        <div className="commonHeader">资产组管理</div>
        <div className="TableTdPaddingWrap">
          <SearchBlock
            btnList={this.btnList}
            placeholder="资产组名称"
            searchChange={this.searchChange}
            onSearchFn={(value) => {
              this.onSearchFn(value);
            }}
          />
          <Table
            rowKey="Fgid"
            // expandIcon={CustomExpandIcon}
            loading={loading}
            columns={this.columns}
            dataSource={list}
            pagination={{
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              pageSizeOptions: ['20', '30', '50'],
              total: recordsTotal,
              showQuickJumper: true,
              size: 'small',
              showTotal: (total) => `（${total}项）`,
            }}
            rowSelection={this.auth === 'rw' ? groupRowSelection : null}
            onChange={this.handleTableChange}
          />
          <Modal
            title="新建/编辑资产组"
            visible={formVisible}
            destroyOnClose
            onCancel={() => {
              this.setState({
                formVisible: false,
              });
            }}
            onOk={this.groupFormSubmit}
          >
            <div>
              <Form>
                <FormItem {...formItemLayout} label="资产组名称">
                  {getFieldDecorator('Fgroup_name', {
                    required: true,
                    initialValue: editItem.Fgroup_name || '',
                    rules: [
                      {
                        required: true,
                        message: '请填写资产组名称',
                      },
                      { max: 64, message: '名称长度不能超过64' },
                      { validator: this.validatName },
                    ],
                  })(<Input placeholder="不超过64字符" disabled={readonly} />)}
                </FormItem>
              </Form>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

const AssetGroupForm = Form.create({ name: 'assetGroup' })(AssetGroup);
export default AssetGroupForm;
