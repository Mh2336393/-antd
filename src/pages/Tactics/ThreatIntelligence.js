import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { DownSquareOutlined } from '@ant-design/icons';
// import { Link } from 'umi';
import { Table, message, Modal, Popover, Switch } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import moment from 'moment';
import UploadTemplate from '@/components/UploadTemplate';
import configSettings from '../../configSettings';
import CustomThreatForm from './CustomThreatForm';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

/* eslint-disable react/no-array-index-key */

const { confirm } = Modal;
@connect(({ selfIoc, loading }) => ({
  selfIoc,
  loading: loading.effects['selfIoc/fetchEventList'],
}))
class ThreatIntelligence extends Component {
  constructor(props) {
    super(props);
    this.threatAuth = getAuth('/tactics/threatIntelligence');
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        ti_type: '',
        category: '',
        confidence: '',
        severity: '',
        // attackStage: '',
        status: '',
        search: '',
        sort: '',
        dir: '',
      },
      selectedRowKeys: [],
      ids: [],
      currentHoverRow: '', // 当前hover的行
      showOperation: false, // 显示操作
      formVisible: false, // 新建编辑表单
      editItem: {}, // 新建编辑表单
      uploadVisible: false,
      isProcessing: false, // 点击标志
    };

    this.filterList = [
      {
        type: 'select',
        name: 'IOC类型',
        key: 'ti_type',
        list: [
          { name: '全部', value: '' },
          // { name: 'URL', value: 'URL' },
          { name: 'IP', value: 'IP' },
          { name: 'DOMAIN', value: 'DOMAIN' },
          { name: 'MD5', value: 'MD5' },
        ],
      },
      {
        type: 'select',
        name: '分类',
        key: 'category',
        showSearch: true,
        list: configSettings.tagsListData(),
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'ID/IOC内容/标签',
        pressEnter: true,
      },
      {
        type: 'select',
        name: '级别',
        key: 'severity',
        list: [
          { name: '全部', value: '' },
          { name: '1（信息）', value: '1' },
          { name: '2（低）', value: '2' },
          { name: '3（中）', value: '3' },
          { name: '4（高）', value: '4' },
          { name: '5（极高）', value: '5' },
        ],
      },
      {
        type: 'select',
        name: '置信度',
        key: 'confidence',
        list: [
          { name: '全部', value: '' },
          ...configSettings.confidenceOpetion.map((item) => {
            return { name: item.name, value: item.valueStr };
          }),
        ],
      },
      {
        type: 'select',
        name: '启停状态',
        key: 'status',
        list: [
          { name: '全部', value: '' },
          { name: '启动', value: 'ON' },
          { name: '停止', value: 'OFF' },
        ],
      },
    ];

    this.columns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          if (this.threatAuth !== 'rw') {
            return null;
          }
          let actionStyle;
          const {
            selfIoc: { eventList },
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
                    <Fragment>
                      {record.status === 'ON' ? (
                        <p
                          onClick={() => {
                            this.statusHandleEvent('OFF', record.id);
                            this.setState({ showOperation: false });
                          }}
                        >
                          停止
                        </p>
                      ) : (
                        <p
                          onClick={() => {
                            this.statusHandleEvent('ON', record.id);
                            this.setState({ showOperation: false });
                          }}
                        >
                          启动
                        </p>
                      )}
                      <p
                        onClick={() => {
                          // this.editHandle(record.id, record);
                          this.setState({
                            showOperation: false,
                            formVisible: true,
                            editItem: record,
                          });
                        }}
                      >
                        编辑
                      </p>
                      <p
                        onClick={() => {
                          this.statusHandleEvent('del', record.id);
                          this.setState({ showOperation: false });
                        }}
                      >
                        删除
                      </p>
                    </Fragment>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'IOC类型',
        dataIndex: 'ti_type',
        key: 'ti_type',
      },
      {
        title: 'IOC内容',
        dataIndex: 'ti_list',
        key: 'ti_list',
        render: (text) => {
          const data = text.split('\n');
          const list = data.length > 10 ? data.slice(0, 10) : data;
          const popContent = (
            <div>
              {list.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          );
          return (
            <div>
              {list.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft" title="IOC内容">
                  <div>
                    多个（
                    <span className="fontBlue">{data.length}</span>）
                  </div>
                </Popover>
              ) : (
                <div>{text}</div>
              )}
            </div>
          );
        },
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        width: 416,
        render: (text) => {
          let cxtEle = '';
          if (text) {
            const arr = text.split(/[,\n]/g);
            if (arr.length > 1) {
              const popContent = (
                <div>
                  {arr.map((cxt, idx) => (
                    <p key={idx} style={{ marginBottom: 8 }}>
                      <span className={styles.selfTags}>{cxt}</span>
                    </p>
                  ))}
                </div>
              );
              cxtEle = (
                <Popover content={popContent} placement="bottomLeft" title="标签">
                  <div>
                    多个( <span className="fontBlue"> {arr.length} </span>)
                  </div>
                </Popover>
              );
            } else {
              cxtEle = <span className={styles.selfTags}>{arr[0]}</span>;
            }
          }
          return <div style={{ width: 408 }}>{cxtEle}</div>;
        },
      },
      {
        title: '级别',
        dataIndex: 'severity',
        key: 'severity',
        sorter: true,
        render: (text) => `${text} (${configSettings.severityLabel(text)})`,
      },
      {
        title: '置信度',
        dataIndex: 'confidence',
        key: 'confidence',
        sorter: true,
        render: (text) => `${text} (${configSettings.confidenceLabel(text)})`,
      },
      {
        title: '更新时间',
        dataIndex: 'itime',
        key: 'itime',
        sorter: true,
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '启停状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => (
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            checked={text === 'ON'}
            onChange={(checked) => {
              if (this.threatAuth !== 'rw') {
                return;
              }
              const status = checked ? 'ON' : 'OFF';
              this.statusHandleEvent(status, record.id);
            }}
          />
        ),
      },
    ];

    this.btnList = [
      {
        label: '新建',
        color: 'blue',
        hide: this.threatAuth !== 'rw',
        func: () => {
          // this.createHandle()
          this.setState({ formVisible: true, editItem: {} });
        },
      },
      {
        label: '删除',
        type: 'danger',
        hide: this.threatAuth !== 'rw',
        func: () => {
          this.statusHandleEvent('del');
        },
      },
      {
        label: '启用',
        type: 'primary',
        hide: this.threatAuth !== 'rw',
        func: () => {
          this.statusHandleEvent('ON');
        },
      },
      {
        label: '停用',
        type: 'primary',
        hide: this.threatAuth !== 'rw',
        func: () => {
          this.statusHandleEvent('OFF');
        },
      },
      {
        label: '导入',
        type: 'primary',
        hide: this.threatAuth !== 'rw',
        func: () => {
          this.setState({ uploadVisible: true });
        },
      },
      {
        label: '导出',
        type: 'primary',
        func: '',
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'selfIoc/fetchEventList',
      payload: configSettings.validateQuery(query),
    });
  }

  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }

  filterOnChange = (type, value) => {
    const { query } = this.state;
    const changePart = { [type]: value };
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
      type: 'selfIoc/fetchEventList',
      payload: configSettings.validateQuery(newQuery),
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, { page: current, pageSize });
    } else {
      const { field, order } = sorter;
      let dir = 'asc';
      if (['severity', 'confidence', 'itime'].indexOf(field) < 0 || !field) {
        return;
      }
      if (field === 'itime') {
        dir = order === 'descend' ? 'desc' : 'asc';
      } else {
        dir = order === 'descend' ? 'asc' : 'desc';
      }
      // const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, { sort: field, dir, page: 1 });
    }

    this.setState({ query: newQuery });
    dispatch({
      type: 'selfIoc/fetchEventList',
      payload: configSettings.validateQuery(newQuery),
    });
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.id);
    this.setState({ selectedRowKeys, ids });
  };

  // 启用 停用 删除
  statusHandleEvent = (status, singleID) => {
    const { ids, query } = this.state;
    // const { dispatch } = this.props;
    const self = this;
    const {
      selfIoc: {
        eventList: { list },
      },
      dispatch,
    } = this.props;
    const { page } = query;
    let newPage = page;
    let successTip = '设置成功';
    if (status === 'del') {
      successTip = '删除成功';
    }
    if (!singleID) {
      if (status === 'del' && list.length === ids.length) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      if (ids.length === 0) {
        message.error('未选择事件');
        return;
      }
      const newIds = ids.join(',');

      if (status === 'del') {
        confirm({
          title: '删除后不可恢复，确定删除吗',
          onOk() {
            dispatch({
              type: 'selfIoc/stausHandleEvent',
              payload: { ids: newIds, status },
            })
              .then(() => {
                const newQuery = Object.assign({}, query, { page: newPage });
                message.success(successTip);
                self.setState({ selectedRowKeys: [], ids: [], query: newQuery });
                dispatch({
                  type: 'selfIoc/fetchEventList',
                  payload: configSettings.validateQuery(newQuery),
                });
              })
              .catch((error) => {
                message.error(error.msg);
              });
          },
          onCancel() {},
        });
      } else {
        dispatch({
          type: 'selfIoc/stausHandleEvent',
          payload: { ids: newIds, status },
        })
          .then(() => {
            const newQuery = Object.assign({}, query, { page: newPage });
            message.success(successTip);
            this.setState({ selectedRowKeys: [], ids: [], query: newQuery });
            dispatch({
              type: 'selfIoc/fetchEventList',
              payload: configSettings.validateQuery(newQuery),
            });
          })
          .catch((error) => {
            message.error(error.msg);
          });
      }
    } else {
      if (status === 'del' && list.length === 1) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      if (status === 'del') {
        confirm({
          title: '删除后不可恢复，确定删除吗',
          onOk() {
            dispatch({
              type: 'selfIoc/stausHandleEvent',
              payload: { ids: `${singleID}`, status },
            })
              .then(() => {
                const newQuery = Object.assign({}, query, { page: newPage });
                message.success(successTip);
                self.setState({ query: newQuery });
                dispatch({
                  type: 'selfIoc/fetchEventList',
                  payload: configSettings.validateQuery(newQuery),
                });
              })
              .catch((error) => {
                message.error(error.msg);
              });
          },
          onCancel() {},
        });
      } else {
        dispatch({
          type: 'selfIoc/stausHandleEvent',
          payload: { ids: `${singleID}`, status },
        })
          .then(() => {
            const newQuery = Object.assign({}, query, { page: newPage });
            message.success(successTip);
            this.setState({ query: newQuery });
            dispatch({
              type: 'selfIoc/fetchEventList',
              payload: configSettings.validateQuery(newQuery),
            });
          })
          .catch((error) => {
            message.error(error.msg);
          });
      }
    }
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({ type: 'selfIoc/fetchEventList', payload: configSettings.validateQuery(newQuery) });
  };

  // 新建 编辑 表单
  onFormCancel = () => {
    this.setState({ formVisible: false, editItem: {} });
  };

  onFormSave = (values) => {
    const { query, isProcessing } = this.state;
    const { dispatch } = this.props;
    let obj = values;
    let successTip = '编辑成功';
    const curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    if (!values.id) {
      successTip = '新建成功，1分钟内生效';
    } else {
      obj = Object.assign({}, values, { itime: curTime });
    }
    if (isProcessing) return;
    this.setState({ isProcessing: true });
    dispatch({ type: 'selfIoc/addEditHandleEvent', payload: { obj } })
      .then(() => {
        message.success(successTip);
        this.setState({ formVisible: false, editItem: {} });
        dispatch({ type: 'selfIoc/fetchEventList', payload: configSettings.validateQuery(query) });
        this.setState({ isProcessing: false });
      })
      .catch((error) => {
        message.error(error.msg);
      });
  };

  // 导入相关
  onCancel = () => {
    this.setState({ uploadVisible: false });
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'selfIoc/fetchEventList',
      payload: configSettings.validateQuery(query),
    });
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
      formVisible,
      editItem,
      uploadVisible,
    } = this.state;
    const {
      selfIoc: { eventList },
      loading,
    } = this.props;
    const { recordsTotal, list } = eventList;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
    };
    // this.filterList[1].list = category2List;
    const tagsList = configSettings.tagsListData();
    tagsList[0].name = '';
    const tiTags = tagsList;

    const params = {
      cmd: 'export_custom_ioc',
      type: ids.length !== 0 ? 1 : 0,
      ids,
      ti_type: query.ti_type,
      category: query.category,
      confidence: query.confidence,
      severity: query.severity,
      status: query.status,
      search: query.search,
      sort: query.sort,
      dir: query.dir,
    };
    const paramsObj = JSON.stringify(params);
    return (
      <div className="contentWraper">
        <div className="commonHeader">自定义IOC管理</div>
        <div className="filterWrap">
          <FilterBlock
            filterList={this.filterList}
            filterOnChange={this.filterOnChange}
            submitFilter={this.submitFilter}
            colNum={3}
            query={query}
          />
        </div>
        <div className="TableTdPaddingWrap">
          <ButtonBlock
            btnList={this.btnList}
            bpage={query.page}
            bsize={query.pageSize}
            total={recordsTotal}
            onPageChange={this.paginationChange}
            hrefStr={`/api/event/IpexportFile?params=${paramsObj}`}
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
                this.setState({ currentHoverRow: '', showOperation: false });
              },
            })}
          />
          <CustomThreatForm
            key={formVisible}
            editItem={editItem}
            visible={formVisible}
            cateTags={tiTags}
            onCancel={this.onFormCancel}
            onSave={this.onFormSave}
          />
          <UploadTemplate
            title="导入自定义IOC"
            handeUploadResut={this.handeUploadResut}
            fileFormat="请选择 *.xls 格式的文件。"
            accept="*.xls"
            // fileFormat="请选择*.xls，*.xlsx 格式的文件。"
            // accept="*.xls，*.xlsx"
            cmd="import_custom_ioc"
            type="custom_ioc"
            uploadVisible={uploadVisible}
            cancel={this.onCancel}
          />
        </div>
      </div>
    );
  }
}

export default ThreatIntelligence;
