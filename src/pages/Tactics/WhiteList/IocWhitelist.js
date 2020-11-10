import React, { Component } from 'react';
import { connect } from 'umi';
import { DownSquareOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, message, Modal, Select, Input } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import UploadTemplate from '@/components/UploadTemplate';
import configSettings from '../../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const iocType = ['IP', 'Domain', 'MD5'];
const { Option } = Select;
const { confirm } = Modal;
@connect(({ whiteListIpAndIoc, loading }) => ({
  whiteListIpAndIoc,
  loading: loading.effects['whiteListIpAndIoc/fetchEventList'],
}))
class IpWhitelist extends Component {
  constructor(props) {
    super(props);
    this.iocAuth = getAuth('/tactics/whites/iocWhitelist');
    this.state = {
      query: {
        page: 1,
        limit: parseInt(configSettings.pageSizeOptions[0], 10),
        search: '',
      },
      selectedRowKeys: [],
      ids: [],
      createVisible: false, // 显示操作
      modalTitle: '新建',
      editItem: {},
      uploadVisible: false,
      isProcessing: false, // 点击标志
    };

    this.filterList = [
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: '可搜索所有字段',
        pressEnter: true,
      },
    ];

    this.columns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          if (this.iocAuth !== 'rw') {
            return null;
          }
          let actionStyle;
          const {
            whiteListIpAndIoc: { eventList },
          } = this.props;
          const { showOperation } = this.state;

          if (index < eventList.list.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }
          return (
            <div style={{ width: 20 }}>
              <div className={styles.tableAction}>
                <DownSquareOutlined
                  onClick={() => {
                    this.setOperation();
                  }}
                  style={{ color: '#5cbaea' }} />
                {showOperation && (
                  <div className={styles.actionContent} style={actionStyle}>
                    <p
                      onClick={() => {
                        this.setState({
                          showOperation: false,
                          createVisible: true,
                          modalTitle: '编辑',
                        });
                      }}
                    >
                      编辑
                    </p>
                    <p
                      onClick={() => {
                        this.eventOperation('del', record.id, null, () => {
                          message.success('ioc白名单删除成功');
                          this.setState({ showOperation: false });
                        });
                      }}
                    >
                      删除
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: 'IOC类型',
        dataIndex: 'ioc_type',
        key: 'ioc_type',
        width: 200,
        render: (text) => iocType[text - 1],
      },
      {
        title: 'IOC内容',
        dataIndex: 'ioc',
        key: 'ioc',
        width: 400,
      },
    ];

    this.btnList = [
      {
        label: '新建',
        hide: this.iocAuth !== 'rw',
        func: () => {
          this.setState({ createVisible: true, modalTitle: '新建' });
        },
        color: 'blue',
      },
      {
        label: '删除',
        hide: this.iocAuth !== 'rw',
        func: () => {
          this.eventOperation('multiDel', null, null, () => {
            message.success('ioc白名单删除成功');
            this.setState({ ids: [] });
          });
        },
        type: 'danger',
      },
      {
        label: '导入',
        hide: this.iocAuth !== 'rw',
        func: () => {
          this.setState({ uploadVisible: true });
        },
        type: 'primary',
      },
      {
        label: '导出',
        type: 'primary',
        func: () => {},
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'whiteListIpAndIoc/fetchEventList',
      payload: { uri: 'eventManage/getIocWhitelist', body: { ...query } },
    });
  };

  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }

  filterOnChange = (type, value) => {
    const { query } = this.state;
    let val = value;
    if (type === 'search') {
      val = configSettings.trimStr(value);
    }
    const changePart = { [type]: val };
    const newQuery = Object.assign({}, query, changePart);
    this.setState({
      query: newQuery,
    });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({ query: newQuery });
    dispatch({
      type: 'whiteListIpAndIoc/fetchEventList',
      payload: { uri: 'eventManage/getIocWhitelist', body: { ...newQuery } },
    });
  };

  handleTableChange = (pagination) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== query.page || pageSize !== query.limit) {
      newQuery = Object.assign({}, query, { page: current, limit: pageSize });
      this.setState({ query: newQuery });
      dispatch({
        type: 'whiteListIpAndIoc/fetchEventList',
        payload: { uri: 'eventManage/getIocWhitelist', body: { ...newQuery } },
      });
    }
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.id);
    this.setState({ selectedRowKeys, ids });
  };

  // 新建，单个/批量删除，更新,
  eventOperation = (op, id, updateObj, callback) => {
    const { dispatch } = this.props;
    const { query, isProcessing } = this.state;
    const self = this;
    let uri = '';
    let cmd = '';
    let body = {};
    if (op === 'add') {
      body = updateObj;
      uri = 'eventManage/putIocInfo';
      cmd = 'add_threat_event_whitelist_ioc';
    } else if (op === 'del' || op === 'multiDel') {
      if (op === 'del') {
        body = { ids: [id] };
      } else {
        const { ids } = this.state;
        if (ids.length === 0) {
          message.warn('请选择要删除的IOC白名单');
          return;
        }
        body = { ids };
      }
      uri = 'eventManage/deleteIds';
      cmd = 'del_threat_event_whitelist_ioc';
    } else if (op === 'update') {
      body = { id, ...updateObj };
      uri = 'eventManage/updateIocInfo';
      cmd = 'edit_threat_event_whitelist_ioc';
    }

    if (isProcessing) return;
    this.setState({ isProcessing: true });
    if (op === 'del' || op === 'multiDel') {
      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          dispatch({
            type: 'whiteListIpAndIoc/putAndDelete',
            payload: { uri, body: { cmd, ...body } },
          })
            .then(() => {
              if (callback) {
                callback();
              }
              dispatch({
                type: 'whiteListIpAndIoc/fetchEventList',
                payload: { uri: 'eventManage/getIocWhitelist', body: { ...query } },
              });
              self.setState({ isProcessing: false });
            })
            .catch(() => {
              self.setState({ isProcessing: false });
            });
        },
        onCancel() {
          self.setState({ isProcessing: false });
        },
      });
    } else {
      dispatch({
        type: 'whiteListIpAndIoc/putAndDelete',
        payload: { uri, body: { cmd, ...body } },
      })
        .then(() => {
          if (callback) {
            callback();
          }
          dispatch({
            type: 'whiteListIpAndIoc/fetchEventList',
            payload: { uri: 'eventManage/getIocWhitelist', body: { ...query } },
          });
          this.setState({ isProcessing: false });
        })
        .catch(() => {
          this.setState({ isProcessing: false });
        });
    }
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, limit: pageSize });
    this.setState({ query: newQuery });
    dispatch({
      type: 'whiteListIpAndIoc/fetchEventList',
      payload: { uri: 'eventManage/getIocWhitelist', body: { ...newQuery } },
    });
  };

  handleOk = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        const { modalTitle, editItem } = this.state;
        if (modalTitle === '新建') {
          this.eventOperation('add', null, { ...values }, () => {
            message.success('ioc白名单新建成功，1分钟内生效');
            this.setState({ createVisible: false });
          });
        } else {
          this.eventOperation('update', editItem.id, { ...values }, () => {
            message.success('ioc白名单修改成功');
            this.setState({ createVisible: false });
          });
        }
      }
    });
  };

  onCancel = () => {
    this.setState({ uploadVisible: false });
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'whiteListIpAndIoc/fetchEventList',
      payload: { uri: 'eventManage/getIocWhitelist', body: { ...query } },
    });
  };

  validateTiList = (rule, value, callback) => {
    const { form } = this.props;
    const type = form.getFieldValue('ioc_type');
    if (value) {
      const arr = value.split(/[,\n]/g);
      let flag = true;
      for (let m = 0; m < arr.length; m += 1) {
        let stats = true;
        if (type === 'IP') {
          stats = configSettings.validateThreeIpCate(arr[m], false, false);
        }
        if (type === 'Domain') {
          stats = configSettings.validateIocServer(arr[m]);
        }
        if (type === 'MD5') {
          stats = configSettings.validateMd5(arr[m]);
        }
        if (!stats) {
          flag = false;
          break;
        }
      }
      if (flag) {
        const temp = [];
        for (let i = 0; i < arr.length; i += 1) {
          if (temp.indexOf(arr[i]) < 0) {
            temp.push(arr[i]);
          }
        }
        if (temp.length !== arr.length) {
          callback('存在重复内容，请删除');
        } else {
          callback();
        }
      } else {
        callback(`${type}格式有误，请重新输入`);
      }
    } else {
      callback();
    }
  };

  handeUploadResut = (res) => {
    let uploadResult;
    if (res.error_code === 0) {
      uploadResult = {
        uploadMsg: `文件上传成功，成功导入${res.data.success}条，${res.data.failure}条失败`,
      };
    } else {
      uploadResult = {
        uploadMsg: `文件上传失败`,
      };
    }
    return uploadResult;
  };

  render() {
    const {
      query,
      ids,
      selectedRowKeys,
      currentHoverRow,
      modalTitle,
      createVisible,
      editItem,
      uploadVisible,
    } = this.state;
    const { form } = this.props;
    const {
      whiteListIpAndIoc: {
        eventList: { recordsTotal, list },
      },
      loading,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
    };
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    const params = {
      cmd: 'export_whitelist_ioc',
      type: ids.length ? 1 : 0,
      ids,
      search: query.search,
    };
    const paramsObjStr = JSON.stringify(params);

    return (
      <div>
        <div className="filterWrap">
          <FilterBlock
            filterList={this.filterList}
            filterOnChange={this.filterOnChange}
            submitFilter={this.submitFilter}
            colNum={4}
            query={query}
          />
        </div>
        <div className="TableTdPaddingWrap">
          <ButtonBlock
            btnList={this.btnList}
            total={recordsTotal}
            onPageChange={this.paginationChange}
            hrefStr={`/api/eventManage/exportWhitelistIoc?params=${paramsObjStr}`}
            bpage={query.page}
          />
          <Table
            rowKey="id"
            loading={loading}
            columns={this.columns}
            dataSource={list}
            pagination={{
              pageSize: query.limit,
              current: query.page,
              total: recordsTotal,
            }}
            onChange={this.handleTableChange}
            rowSelection={rowSelection}
            rowClassName={(record, index) => (index === currentHoverRow ? styles.handleAction : '')}
            onRow={(record, index) => ({
              onMouseEnter: () => {
                this.setState({ currentHoverRow: index, editItem: record });
              },
              onMouseLeave: () => {
                this.setState({ currentHoverRow: '', showOperation: false, editItem: {} });
              },
            })}
          />
          <Modal
            title={modalTitle}
            visible={createVisible}
            onOk={this.handleOk}
            onCancel={() => {
              this.setState({ createVisible: false });
            }}
            okText={modalTitle === '新建' ? '新建' : '保存'}
            destroyOnClose
          >
            <Form className={styles.ipForm}>
              <FormItem {...formItemLayout} label="IOC类型">
                {getFieldDecorator('ioc_type', {
                  initialValue: editItem.ioc_type ? iocType[editItem.ioc_type - 1] : iocType[0],
                })(
                  <Select>
                    {iocType.map((key) => (
                      <Option value={key}>{key}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="IOC内容">
                {getFieldDecorator('ioc', {
                  initialValue: editItem.ioc || '',
                  validateTrigger: 'onBlur',
                  rules: [
                    // { required: true, message: '必填' },
                    // {
                    //   validator: this.validateTiList,
                    // },
                  ],
                })(
                  <TextArea
                    rows={4}
                    placeholder="允许输入多个，以“,”或者换行分隔。IP支持ipv6格式"
                  />
                )}
              </FormItem>
            </Form>
          </Modal>
          <UploadTemplate
            title="导入IOC白名单"
            handeUploadResut={this.handeUploadResut}
            fileFormat="请选择 *.xls，*.xlsx 格式的文件。"
            accept="*.xls;*.xlsx"
            cmd="import_whitelist_ioc"
            type="whitelist_ioc"
            uploadVisible={uploadVisible}
            cancel={this.onCancel}
          />
        </div>
      </div>
    );
  }
}
const WrappedIpWhitelist = Form.create()(IpWhitelist);
export default WrappedIpWhitelist;
