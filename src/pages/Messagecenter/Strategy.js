import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
// import { Link } from 'umi';
import classNames from 'classnames';
import { CaretDownOutlined, CheckCircleOutlined, EditOutlined, FormOutlined } from '@ant-design/icons';
import { Table, message, Switch, Checkbox, Button, Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import ButtonBlock from '@/components/ButtonBlock';
import NoticeStrategyForm from './NoticeStrategyForm';
import configSettings from '../../configSettings';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

const { Option } = Select;
const CheckboxGroup = Checkbox.Group;
@connect(({ noticeStrategy, login, loading }) => ({
  noticeStrategy,
  login,
  loading: loading.effects['noticeStrategy/fetchList'],
}))
class NoticeStrategy extends Component {
  constructor(props) {
    super(props);
    this.noticeAuth = getAuth('/systemSetting/msg/strategy');
    const {
      login: { currentUser },
    } = this.props;
    this.userID = currentUser;
    this.lastFetchId = 0; // 消息接收人编辑
    this.fetchUser = debounce(this.fetchUser, 800); // 消息接收人编辑
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
      },
      selectedRowKeys: [],
      ids: [],
      formVisible: false, // 新建编辑表单
      editItem: {}, // 新建编辑表单
      currentHoverRow: '', // 当前hover的行
      intervalOperation: false, // 显示操作
      userOperation: false, // 显示操作
      methodOperation: false, // 显示操作
      checkedList: [],
      userIdData: [], // 消息接收人编辑
      userIdValue: [], // 消息接收人编辑
      userIdFetching: false, // 消息接收人编辑
      isProcessing: false, // 点击标志
      loading: {},
    };

    this.columns = [
      {
        title: '消息名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '消息类型',
        dataIndex: 'message_type',
        key: 'message_type',
        render: (text) => configSettings.msgType(text),
      },
      {
        title: '通知方式',
        dataIndex: 'message_enable',
        key: 'message_enable',
        render: (text, record, index) => {
          const cxt = this.msgMethodText(record);
          let actionStyle;
          const {
            noticeStrategy: {
              noticeList: { list },
            },
          } = this.props;
          const { methodOperation } = this.state;
          if (index < list.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }
          const methodOptions = [
            { label: '消息通知', value: 'message_enable' },
            { label: '邮件通知', value: 'mail_enable' },
            { label: '短信通知', value: 'sms_enable' },
          ];
          const method = ['message_enable', 'mail_enable', 'sms_enable'];
          // const method = ['message_enable', 'mail_enable'];
          const defaultVal = method.filter((key) => record[key]);
          return (
            <div className={styles.tableAction}>
              <div className={styles.showAction}>
                <div className={styles.showText}>{cxt}</div>
                {this.noticeAuth === 'rw' && (
                  <div className={styles.showIcon}>
                    <FormOutlined
                      onClick={() => {
                        this.setState({ checkedList: defaultVal });
                        this.setOperation('methodOperation');
                      }}
                      style={{ color: '#5cbaea' }} />
                  </div>
                )}
              </div>
              {methodOperation && (
                <div className={styles.actionContent} style={actionStyle}>
                  <div className={styles.labels}>
                    <CheckboxGroup
                      options={methodOptions}
                      defaultValue={defaultVal}
                      onChange={(checkedList) => {
                        // console.log('checkedList--', checkedList);
                        this.setState({ checkedList });
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      style={{ margin: '5px 5px 10px 0' }}
                      size="small"
                      onClick={() => {
                        this.setState({ methodOperation: false });
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        const { checkedList } = this.state;
                        const obj = {};
                        for (let i = 0; i < method.length; i += 1) {
                          if (checkedList.indexOf(method[i]) < 0) {
                            obj[method[i]] = 0;
                          } else {
                            obj[method[i]] = 1;
                          }
                        }
                        this.updateHandleEvent(record.id, obj);
                        this.setState({ methodOperation: false });
                      }}
                    >
                      确定
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '通知频率',
        dataIndex: 'check_interval',
        key: 'check_interval',
        render: (text, record, index) => {
          const cxt = configSettings.msgInterval(text);
          let actionStyle;
          const {
            noticeStrategy: {
              noticeList: { list },
            },
          } = this.props;
          const { intervalOperation } = this.state;
          if (index < list.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }
          return (
            <div className={styles.tableAction}>
              <div className={styles.showAction}>
                <div className={styles.showText}>{cxt}</div>
                {this.noticeAuth === 'rw' && (
                  <div className={styles.showIcon}>
                    <CaretDownOutlined
                      onClick={() => {
                        this.setOperation('intervalOperation');
                      }}
                      style={{ color: '#5cbaea' }} />
                  </div>
                )}
              </div>
              {intervalOperation && (
                <div className={styles.actionContent} style={actionStyle}>
                  <Fragment>
                    <p
                      onClick={() => {
                        this.updateHandleEvent(record.id, { check_interval: 0 });
                        this.setState({ intervalOperation: false });
                      }}
                    >
                      不通知
                    </p>
                    <p
                      onClick={() => {
                        this.updateHandleEvent(record.id, { check_interval: 60 });
                        this.setState({ intervalOperation: false });
                      }}
                    >
                      每分钟一次
                    </p>
                    <p
                      onClick={() => {
                        this.updateHandleEvent(record.id, { check_interval: 300 });
                        this.setState({ intervalOperation: false });
                      }}
                    >
                      每5分钟一次
                    </p>

                    <p
                      onClick={() => {
                        this.updateHandleEvent(record.id, { check_interval: 3600 });
                        this.setState({ intervalOperation: false });
                      }}
                    >
                      每小时一次
                    </p>
                    <p
                      onClick={() => {
                        this.updateHandleEvent(record.id, { check_interval: 86400 });
                        this.setState({ intervalOperation: false });
                      }}
                    >
                      每天一次
                    </p>
                  </Fragment>
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '消息接收人',
        dataIndex: 'user_list',
        key: 'user_list',
        render: (text, record) => {
          const { userOperation } = this.state;
          const cxt = text.replace(/\|/g, ';');
          const uerCls = classNames(styles.userText, {
            [styles.noUserText]: userOperation,
          });

          // 消息接收人编辑
          const { userIdFetching, userIdData, userIdValue } = this.state;

          return (
            <div style={{ minWidth: 200 }} className={styles.tableAction}>
              <div className={uerCls}>
                <div className={styles.showText}>{cxt}</div>
                {this.noticeAuth === 'rw' && (
                  <div className={styles.showIcon}>
                    <EditOutlined
                      onClick={() => {
                        this.setOperation('userOperation', record);
                      }}
                      style={{ color: '#5cbaea' }} />
                  </div>
                )}
              </div>
              {userOperation && (
                <div className={styles.userInput}>
                  <div>
                    <Select
                      mode="multiple"
                      labelInValue
                      autoFocus
                      value={userIdValue}
                      placeholder="请输入后搜索选择用户"
                      notFoundContent={userIdFetching ? <Spin size="small" /> : null}
                      filterOption={false}
                      onSearch={this.fetchUser}
                      onChange={this.handleChange}
                      style={{ width: '200px' }}
                    >
                      {userIdData.map((d) => (
                        <Option key={d.value}>{d.text}</Option>
                      ))}
                    </Select>
                  </div>
                  <div className={styles.checkBtn}>
                    <CheckCircleOutlined
                      style={{ color: '#5cbaea' }}
                      onClick={() => {
                        this.userSelectLeave(record);
                      }} />
                  </div>
                </div>
              )}

              {/* {userOperation && (
                <div className={styles.userInput}>
                  <Input
                    size="small"
                    placeholder="多个以&quot;;&quot;分割"
                    onPressEnter={e => {
                      const value = e.target.value.replace(/;/g, '|');
                      this.updateHandleEvent(record.id, { user_list: value });
                      this.setState({ userOperation: false });
                    }}
                  />
                </div>
              )} */}
            </div>
          );
        },
      },
      {
        title: 'Syslog',
        dataIndex: 'syslog_enable',
        key: 'syslog_enable',
        render: (text, record) => {
          const { loading } = this.state;
          return (
            <Switch
              loading={loading[record.id] || false}
              checkedChildren="开"
              unCheckedChildren="关"
              checked={text === 1}
              onChange={(checked) => {
                if (this.noticeAuth !== 'rw') {
                  return;
                }
                const status = checked ? 1 : 0;
                this.updateHandleEvent(record.id, { syslog_enable: status });
              }}
            />
          );
        },
      },
    ];

    this.btnList = [
      {
        label: '通知设置',
        type: 'primary',
        hide: this.noticeAuth !== 'rw',
        func: () => {
          this.setStrategyEvent();
        },
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'noticeStrategy/fetchList',
      payload: query,
    });
  }

  msgNotifyReq = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'msgNotify/fetchMsgList',
      payload: { user_id: this.userID },
    });
  };

  // 消息接收人编辑
  fetchUser = (value) => {
    if (value) {
      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.setState({ userIdData: [], userIdFetching: true });
      const { dispatch } = this.props;
      dispatch({
        type: 'noticeStrategy/fetchUserData',
        payload: { value },
      })
        .then(() => {
          if (fetchId !== this.lastFetchId) {
            return;
          }
          const {
            noticeStrategy: { userData },
          } = this.props;
          const userIdData = userData.map((obj) => ({
            text: obj.user_id,
            value: obj.user_id,
          }));
          this.setState({ userIdData, userIdFetching: false });
        })
        .catch((error) => {
          message.error(error.msg);
          this.setState({ userIdData: [], userIdFetching: false });
        });
    } else {
      this.setState({ userIdData: [], userIdFetching: false });
    }
  };

  // 消息接收人编辑
  handleChange = (value) => {
    this.setState({
      userIdValue: value,
      // userIdData: [],
      userIdFetching: false,
    });
  };

  userSelectLeave = (record) => {
    this.setState({ userOperation: false });
    const { userIdValue } = this.state;
    let users = '';
    if (userIdValue.length) {
      const userArr = userIdValue.map((obj) => obj.key);
      users = userArr.join('|');
    }
    if (users !== record.user_list) {
      this.updateHandleEvent(record.id, { user_list: users });
    }
  };

  msgMethodText = (record) => {
    const arr = [];
    if (record.message_enable === 1) {
      arr.push('消息');
    }
    if (record.mail_enable === 1) {
      arr.push('邮件');
    }
    if (record.sms_enable === 1) {
      arr.push('短信');
    }
    return arr.join('; ');
  };

  setOperation = (key, record) => {
    const { [key]: newKey } = this.state;
    if (key === 'userOperation') {
      let userArr = [];
      if (record.user_list) {
        const users = record.user_list.split('|');
        userArr = users.map((name) => ({ key: name, label: name }));
      }
      // console.log("userArr===", userArr);
      this.setState({ [key]: !newKey, userIdValue: userArr, userIdData: [] });
    } else {
      this.setState({ [key]: !newKey });
    }
  };

  handleTableChange = (pagination) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, { page: current, pageSize });
      this.setState({ query: newQuery });
      dispatch({
        type: 'noticeStrategy/fetchList',
        payload: newQuery,
      });
    }
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.id);
    this.setState({ selectedRowKeys, ids });
  };

  // 策略设置
  setStrategyEvent = () => {
    const { ids } = this.state;
    // const { dispatch } = this.props;
    if (ids.length === 0) {
      message.error('未选择事件');
      return;
    }
    this.setState({
      selectedRowKeys: [],
      ids: [],
      formVisible: true,
      editItem: { setCount: ids.length, ids },
    });
  };

  updateHandleEvent = (id, obj) => {
    const { query, isProcessing, loading } = this.state;
    const { dispatch } = this.props;
    if (typeof obj.syslog_enable === 'number') {
      loading[id] = true;
    }
    if (isProcessing) return;
    this.setState({ isProcessing: true, loading });
    dispatch({ type: 'noticeStrategy/updateList', payload: { ids: [id], ...obj } })
      .then(() => {
        message.success('设置成功');
        if (typeof obj.syslog_enable === 'number') {
          loading[id] = false;
        }
        dispatch({
          type: 'noticeStrategy/fetchList',
          payload: query,
        });
        this.setState({ isProcessing: false, loading });
        if (obj.check_interval !== undefined || obj.message_enable !== undefined) {
          this.msgNotifyReq();
        }
      })
      .catch((error) => {
        if (typeof obj.syslog_enable === 'number') {
          loading[id] = false;
        }
        this.setState({ isProcessing: false, loading });
        message.error(error.msg);
      });
  };

  onFormCancel = () => {
    this.setState({ formVisible: false, editItem: {} });
  };

  onFormSave = (values) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const obj = values;
    // console.log('表单发送obj：', obj);
    const { isProcessing } = this.state;

    if (isProcessing) return;
    this.setState({ isProcessing: true });
    dispatch({ type: 'noticeStrategy/setStrategy', payload: { obj } })
      .then(() => {
        message.success('设置成功');
        this.setState({ formVisible: false, editItem: {} });
        dispatch({
          type: 'noticeStrategy/fetchList',
          payload: query,
        });
        this.setState({ isProcessing: false });
        this.msgNotifyReq();
      })
      .catch((error) => {
        message.error(error.msg);
      });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({ type: 'noticeStrategy/fetchList', payload: newQuery });
  };

  render() {
    const {
      noticeStrategy: {
        noticeList: { recordsTotal, list },
      },
      loading,
    } = this.props;
    const { query, selectedRowKeys, formVisible, editItem, currentHoverRow } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
    };
    return (
      <div className="TableTdPaddingWrap">
        <ButtonBlock
          btnList={this.btnList}
          bpage={query.page}
          bsize={query.pageSize}
          total={recordsTotal}
          onPageChange={this.paginationChange}
        />
        <Table
          rowKey="id"
          loading={loading}
          columns={this.columns}
          dataSource={list}
          pagination={{
            pageSize: query.pageSize,
            current: query.page,
            total: recordsTotal,
          }}
          onChange={this.handleTableChange}
          rowSelection={rowSelection}
          rowClassName={(record, index) => (index === currentHoverRow ? styles.handleAction : '')}
          onRow={(record, index) => ({
            onMouseEnter: () => {
              this.setState({ currentHoverRow: index });
            },
            onMouseLeave: () => {
              this.setState({
                currentHoverRow: '',
                intervalOperation: false,
                userOperation: false,
                methodOperation: false,
              });
            },
          })}
        />
        <NoticeStrategyForm
          key={formVisible}
          editItem={editItem}
          visible={formVisible}
          onCancel={this.onFormCancel}
          onSave={this.onFormSave}
        />
      </div>
    );
  }
}

export default NoticeStrategy;
