import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { LeftOutlined, SettingTwoTone } from '@ant-design/icons';
import { message, Button, Table, Modal, Pagination, Popover, Spin, Tooltip } from 'antd';
import moment from 'moment';
// import { Link } from 'umi';
import Cookies from 'js-cookie';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import FilterBlock from '@/components/FilterBlock/Filter';
// import _ from 'lodash';
import configSettings from '../../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
import styles from './index.less';
import UploadTemplate from '@/components/UploadTemplate';
import EventUpAptDrawer from '../DrawerDetail/EventAptUpload';

// const format = 'YYYY-MM-DD HH:mm:ss';
const { confirm } = Modal;
@connect(({ global, aptUpload, eventOverview, loading }) => ({
  hasVpc: global.hasVpc,
  aptUpload,
  eventOverview,
  loading: loading.effects['aptUpload/fetchList'],
}))
class AptUploadPage extends Component {
  constructor(props) {
    super(props);
    this.upAuth = getAuth('uploadPageShow');
    this.userId = Cookies.get('username');
    this.isUploadFile = false;
    this.state = {
      query: {
        startTime: moment().subtract(30, 'day').valueOf(),
        endTime: moment().valueOf(),
        search: '',
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        sort: '',
        dir: '',
      },
      timeRange: '近30天',
      currentHoverRow: '', // 当前hover的行
      showOperation: false, // 显示操作
      selectedRowKeys: [],
      ids: [],
      uploadVisible: false,
      drawerVisible: false,
      drawerTitle: '',
      drawerQuery: {},
    };

    this.filterList = [
      {
        type: 'select',
        name: '上传时间',
        key: 'timeRange',
        list: [
          { name: '近24小时', value: '近24小时' },
          { name: '近7天', value: '近7天' },
          { name: '近30天', value: '近30天' },
          { name: '自定义', value: '自定义' },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: '文件名称/MD5/分类',
      },
    ];

    this.columns = [
      {
        title: '上传时间',
        width: '180px',
        dataIndex: 'add_time',
        key: 'add_time',
        sorter: true,
        render: (text) => <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div>,
      },
      {
        title: '文件名',
        // width: "220px",
        dataIndex: 'file_name',
        key: 'file_name',
        render: (text, record) => (
          <Tooltip placement="top" title={text}>
            <a
              title={text}
              className="ellipsis"
              onClick={() => {
                this.detailShowClick(record);
              }}
            >
              {text}
            </a>
          </Tooltip>
        ),
      },
      {
        title: '文件MD5',
        // width: "220px",
        dataIndex: 'md5',
        key: 'md5',
        render: (text) => (
          <Tooltip placement="top" title={text}>
            <span className="ellipsis">{text}</span>
          </Tooltip>
        ),
      },
      {
        title: '病毒名称',
        // width: "220px",
        dataIndex: 'virus_name',
        key: 'virus_name',
        render: (text) => (
          <Tooltip placement="top" title={text}>
            <span className="ellipsis">{text || '-'}</span>
          </Tooltip>
        ),
      },
      {
        title: '分类',
        width: '150px',
        dataIndex: 'virus_type',
        key: 'virus_type',
        render: (text, record) => (record.virus_name ? text : '-'),
      },
      {
        title: '文件评分',
        width: '100px',
        dataIndex: 'score',
        key: 'score',
        sorter: true,
        render: (text, record) => (record.virus_name ? text : '未见异常'),
      },
      {
        title: '上传者',
        width: '100px',
        dataIndex: 'uploader',
        key: 'uploader',
      },
      {
        title: '状态',
        width: '100px',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => this.statusShow(record),
      },
      {
        title: '操作',
        //         width: "100px",
        key: 'lastIocnAction',
        dataIndex: '',
        render: (text, record) => {
          const popContent = (
            <div>
              {this.upAuth === 'rw' && (
                <Fragment>
                  <div>
                    <a
                      onClick={() => {
                        this.delHandleEvent(record.id);
                        this.setState({ showOperation: false });
                      }}
                    >
                      删除
                    </a>
                  </div>
                </Fragment>
              )}
              <div>
                <a
                  onClick={() => {
                    this.detailShowClick(record);
                  }}
                >
                  详情
                </a>
              </div>
            </div>
          );
          return (
            <div>
              <Popover
                getPopupContainer={(triggerNode) => triggerNode}
                content={popContent}
                placement="leftTop"
              >
                <SettingTwoTone />
              </Popover>
            </div>
          );
        },
      },
    ];
  }

  componentWillMount() {}

  componentDidMount = () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({ type: 'aptUpload/fetchList', payload: query });
  };

  componentWillReceiveProps(nextProps) {
    const {
      eventOverview: { drawerList },
    } = nextProps;
    const { drawerQuery, drawerVisible } = this.state;
    const { drawerID = '', drawerFLAG = 'upapt', id: oldDrawerId } = drawerQuery;
    // 左侧抽屉详情
    // console.log(993, 'drawerID==', drawerID, 'drawerList.upapt==', drawerList.upapt);
    const curDrawerList = drawerList.upapt[drawerID];
    if (drawerVisible && drawerID && curDrawerList && curDrawerList.length) {
      const lastDrawerObj = curDrawerList[curDrawerList.length - 1];
      const lastId = lastDrawerObj.id;
      if (oldDrawerId !== lastId) {
        // console.log(993, 'drawerID==', drawerID, 'oldDrawerId==', oldDrawerId, 'lastId==', lastId);
        const newDrawerQuery = {
          drawerID,
          drawerFLAG,
          id: lastId,
          md5: lastDrawerObj.md5,
        };
        this.setState({ drawerTitle: '', drawerQuery: {} }, () => {
          this.setState({
            drawerVisible: true,
            drawerTitle: this.drawerTitleEle(lastDrawerObj),
            drawerQuery: newDrawerQuery,
          });
        });
      }
    }
  }

  componentWillUnmount() {
    // 左侧抽屉详情数据清空
    const {
      dispatch,
      eventOverview: { drawerList },
    } = this.props;
    drawerList.upapt = {};
    dispatch({ type: 'eventOverview/saveFilterCount', payload: { drawerList } });
  }

  setOperation() {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  }

  // 右侧详情
  detailShowClick = (record) => {
    const text = record.status;
    if (text === 0 || text === 2) {
      // e.preventDefault();
      if (text === 0) {
        message.warn('文件分析中，暂无详情');
      }
      if (text === 2) {
        message.warn('文件分析失败，暂无详情');
      }
      return;
    }
    // id=${record.id}&tsOldest=${record.tsOldest}&tsLatest=${record.tsLatest}
    // console.log(1047, 'record==', record);
    const {
      dispatch,
      eventOverview: { drawerList },
    } = this.props;
    drawerList.upapt[record.id] = [record];
    dispatch({ type: 'eventOverview/saveFilterCount', payload: { drawerList } });

    this.setState({
      drawerVisible: true,
      drawerTitle: this.drawerTitleEle(record),
      drawerQuery: {
        drawerID: record.id,
        drawerFLAG: 'upapt',
        id: record.id,
        md5: record.md5,
        ccsName: '', // 多设备切换在全部状态得时候，点击下级设备得数据，node那边需要用到设备名称
      },
    });
  };

  drawerTitleEle = (eventDetail) => {
    // console.log('eventDetail==', eventDetail);
    const { style: style1, label: label1 } = configSettings.aptUpScoreTagMap(
      eventDetail.virus_name,
      eventDetail.score
    );
    const { style: style2, label: label2 } = configSettings.fileStatusTag(eventDetail.status);
    return (
      <div>
        <span className={styles.detailScoreTag} style={style1}>
          {label1}
        </span>
        <span className={styles.detailTopName}>{eventDetail.file_name}</span>
        <span style={style2} className={styles.detailStatusSpan}>
          {label2}
        </span>
      </div>
    );
  };

  drawerClose = () => {
    const { drawerQuery } = this.state;
    const {
      dispatch,
      eventOverview: { drawerList },
    } = this.props;
    const curList = drawerList.upapt[drawerQuery.drawerID];
    const len = curList.length;
    if (len > 1) {
      drawerList.upapt[drawerQuery.drawerID] = curList.slice(0, len - 1);
    } else {
      delete drawerList.upapt[drawerQuery.drawerID];
    }
    dispatch({ type: 'eventOverview/saveFilterCount', payload: { drawerList } });
    this.setState({ drawerVisible: false, drawerTitle: '', drawerQuery: {} });
  };

  clickToDetail = (record, e) => {
    const text = record.status;
    if (text === 0 || text === 2) {
      e.preventDefault();
      if (text === 0) {
        message.warn('文件分析中，暂无详情');
      }
      if (text === 2) {
        message.warn('文件分析失败，暂无详情');
      }
    }
  };

  statusShow = (record) => {
    // console.log('statusShow===record==', record);
    const text = record.status;
    const { style, label } = configSettings.fileStatusTag(text);
    if (text === 2 && record.msg) {
      const popContent = <div>{record.msg}</div>;
      return (
        <Popover
          content={popContent}
          getPopupContainer={(triggerNode) => triggerNode}
          placement="bottomLeft"
          title="失败原因"
        >
          <span style={style} className={styles.statusSpanTag}>
            {label}
          </span>
        </Popover>
      );
    }
    return (
      <span style={style} className={styles.statusSpanTag}>
        {label}
      </span>
    );
  };

  slelectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.id);
    this.setState({
      selectedRowKeys,
      ids,
    });
  };

  // 删除
  delHandleEvent = (singleID) => {
    const { ids, query } = this.state;
    const self = this;
    const {
      aptUpload: {
        upList: { list },
      },
      dispatch,
    } = this.props;
    const { page } = query;
    let newPage = page;

    if (!singleID) {
      if (list.length === ids.length) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      if (ids.length === 0) {
        message.error('未选择数据');
        return;
      }

      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          dispatch({
            type: 'aptUpload/delHandle',
            payload: { ids },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState({ selectedRowKeys: [], ids: [], query: newQuery });
              dispatch({ type: 'aptUpload/fetchList', payload: newQuery });
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() {},
      });
    } else {
      if (list.length === 1) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          dispatch({
            type: 'aptUpload/delHandle',
            payload: { ids: [singleID] },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState({ query: newQuery });
              dispatch({ type: 'aptUpload/fetchList', payload: newQuery });
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() {},
      });
    }
  };

  filterOnChange = (type, value) => {
    const { query } = this.state;
    let changePart;
    if (type === 'timeRange') {
      changePart = {
        startTime: value[0],
        endTime: value[1],
      };
      this.setState({
        timeRange: value[2],
      });
    } else {
      changePart = { [type]: value };
    }
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
      type: 'aptUpload/fetchList',
      payload: newQuery,
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const { current, pageSize } = pagination;
    let newQuery;
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, {
        page: current,
        pageSize,
      });
    } else {
      const { field, order } = sorter;
      if (!field) {
        return;
      }
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
      type: 'aptUpload/fetchList',
      payload: newQuery,
    });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { pageSize: pageSizeBefore } = query;
    const { dispatch } = this.props;
    let newQuery = {};
    let newPage = page;
    if (pageSize !== pageSizeBefore) {
      newPage = 1;
    }
    newQuery = Object.assign({}, query, {
      page: newPage,
      pageSize,
    });
    this.setState({ query: newQuery });
    dispatch({ type: 'aptUpload/fetchList', payload: newQuery });
  };

  // 上传样本
  closeUpload = () => {
    const { query } = this.state;
    const { dispatch } = this.props;

    this.setState({ uploadVisible: false });
    if (this.isUploadFile) {
      // window.location.reload();
      window.location.href = '/event/safeEvent/alarmFile?uploadPageShow=true';
    } else {
      dispatch({ type: 'aptUpload/fetchList', payload: query });
    }
  };

  uploadResultFn = () => {
    // const { dispatch } = this.props;

    // const { query } = this.state;
    this.isUploadFile = true;
    // dispatch({ type: 'aptUpload/fetchList', payload: query });
    // console.log('上传结束回调');
  };

  fileTips = () => (
    <Fragment>
      <span style={{ display: 'block', marginBottom: 10 }}>
        请选择文件上传，单个文件大小不得超过100M。
      </span>
      <span>{`支持文件后缀名：${configSettings.vmFileTypes.join('、')}。`}</span>
    </Fragment>
  );

  render() {
    const {
      backEsTablePage,
      loading,
      aptUpload: { upList },
    } = this.props;
    const {
      drawerVisible,
      drawerTitle,
      drawerQuery,
      query,
      timeRange,
      uploadVisible,
      currentHoverRow,
      selectedRowKeys,
    } = this.state;
    const { page, pageSize } = query;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.slelectRowOnchange,
    };
    const { recordsTotal, list } = upList;
    // console.log('this.isUploadFile===', this.isUploadFile);
    return (
      <div>
        <div className={styles.filterwrap}>
          <div className={styles.backHeader}>
            <a className={styles.back} onClick={backEsTablePage}>
              <LeftOutlined />
              返回
            </a>
            <span className={styles.title}>本地上传文件检测</span>
          </div>
        </div>
        <div className="TableTdPaddingWrap">
          <div style={{ paddingBottom: 4 }}>
            <FilterBlock
              filterList={this.filterList}
              filterOnChange={this.filterOnChange}
              submitFilter={this.submitFilter}
              colNum={2}
              query={query}
              timeRange={timeRange}
            />
          </div>
          <div className={styles.handleBlock}>
            <div className={styles.handleBar} style={{ marginTop: 6 }}>
              {this.upAuth === 'rw' && (
                <Fragment>
                  <Button
                    className="smallWhiteBtn"
                    style={{ marginRight: 8 }}
                    onClick={() => {
                      this.setState({ uploadVisible: true });
                    }}
                  >
                    本地上传
                  </Button>
                  <Button
                    className="smallWhiteBtn"
                    style={{ marginRight: 8 }}
                    onClick={() => {
                      this.delHandleEvent();
                    }}
                  >
                    删除
                  </Button>
                </Fragment>
              )}
            </div>
            <Pagination
              total={recordsTotal}
              showSizeChanger
              defaultPageSize={pageSize}
              pageSizeOptions={configSettings.pageSizeOptions}
              current={page}
              size="small"
              showTotal={(total) => `（${total}项）`}
              onChange={this.paginationChange}
              onShowSizeChange={this.paginationChange}
            />
          </div>
          <Table
            rowClassName={(record, index) => (index === currentHoverRow ? styles.handleAction : '')}
            onRow={(record, index) => ({
              onMouseEnter: () => {
                this.setState({ currentHoverRow: index });
              },
              onMouseLeave: () => {
                this.setState({ currentHoverRow: '', showOperation: false });
              },
            })}
            scroll={{ x: 1150 }}
            rowKey="id"
            loading={loading}
            columns={this.columns}
            dataSource={list}
            rowSelection={rowSelection}
            pagination={{ pageSize, current: page, total: recordsTotal }}
            onChange={this.handleTableChange}
          />
        </div>
        <UploadTemplate
          title="上传本地文件"
          cmd="upload_apt"
          type={this.userId}
          accept={configSettings.vmFileTypes.join(';')}
          fileFormat={this.fileTips()}
          action="/api/scan/upload_apt"
          sizeLimit={100}
          sizeError="文件大小超过100M，禁止上传"
          uploadVisible={uploadVisible}
          cancel={this.closeUpload}
          // beforeUploadFn={this.beforeUploadFn}
          uploadResultFn={this.uploadResultFn}
        />
        <DrawerWidget
          visible={drawerVisible}
          title={drawerTitle}
          width={1000}
          onClose={this.drawerClose}
        >
          <div>
            {drawerQuery.md5 && <EventUpAptDrawer query={drawerQuery} />}
            {!drawerQuery.md5 && (
              <div>
                <Spin />
              </div>
            )}
          </div>
        </DrawerWidget>
      </div>
    );
  }
}
export default AptUploadPage;
