import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { Table, message, Switch } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import UploadTemplate from '@/components/UploadTemplate';
import moment from 'moment';
import configSettings from '../../../configSettings';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import BlockWhiteFormDrawer from './BlockWhiteFormDrawer';

import authority from '@/utils/authority';
const { getAuth } = authority;
// import styles from './index.less';

@connect(({ block, loading }) => ({
  block,
  loading: loading.effects['block/fetchWhiteList'],
}))
class BlockWhite extends Component {
  constructor(props) {
    super(props);
    this.blockAuth = getAuth('/tactics/whites/blockWhite');
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        Factivated: '', // 启停状态
        search: '', // 搜索
        sort: '', // 排序项
        dir: '', // 正序 倒叙
      },
      uploadVisible: false,
      selectedRowKeys: [],
      ids: [],
      statusLoading: {},
      formVisible: false,
      drawerTitle: '',
      drawerObj: {},
    };

    this.filterList = [
      {
        type: 'select',
        name: '启停状态',
        key: 'Factivated',
        list: [
          { name: '全部', value: '' },
          { name: '启动', value: 1 },
          { name: '未启动', value: 0 },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'IP/备注/创建人',
        pressEnter: true,
      },
    ];

    this.btnList = [
      {
        label: '新建',
        color: 'blue',
        hide: this.blockAuth !== 'rw',
        func: () => {
          this.setState({ formVisible: true, drawerTitle: '新建', drawerObj: {} });
        },
      },
      {
        label: '删除',
        type: 'danger',
        hide: this.blockAuth !== 'rw',
        func: () => {
          this.delHandleList();
        },
      },
      {
        label: '导入',
        hide: this.blockAuth !== 'rw',
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

    this.columns = [
      {
        title: 'IP地址',
        dataIndex: 'Fip',
        key: 'Fip',
        render: (text) => <div style={{ wordBreak: 'break-all', maxWidth: 400 }}>{text}</div>,
      },
      {
        title: '备注',
        dataIndex: 'Fcomment',
        key: 'Fcomment',
        width: 440,
        render: (text) => <div style={{ wordBreak: 'break-all', width: 440 }}>{text}</div>,
      },
      {
        title: '创建人',
        dataIndex: 'Fcreator',
        key: 'Fcreator',
        render: (text) => <div style={{ whiteSpace: 'nowrap' }}>{text}</div>,
      },
      {
        title: '更新时间',
        dataIndex: 'Fupdate_time',
        key: 'Fupdate_time',
        sorter: true,
        render: (text) => (
          <div style={{ whiteSpace: 'nowrap' }}>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div>
        ),
      },
      {
        title: '启停状态',
        dataIndex: 'Factivated',
        key: 'Factivated',
        sorter: true,
        render: (text, record) => {
          const { statusLoading } = this.state;
          return (
            <Switch
              loading={statusLoading[record.Fid] || false}
              checkedChildren="开"
              unCheckedChildren="关"
              checked={text === 1}
              onChange={() => {
                if (this.blockAuth !== 'rw') {
                  return;
                }
                this.changeStatus(record);
              }}
            />
          );
        },
      },
      {
        title: '操作',
        dataIndex: '',
        key: 'action',
        render: (text, record) => {
          if (this.blockAuth !== 'rw') {
            return null;
          }
          return (
            <div style={{ whiteSpace: 'nowrap' }}>
              <a
                onClick={() => {
                  this.setState({
                    formVisible: true,
                    drawerTitle: '编辑',
                    drawerObj: { ...record },
                  });
                }}
              >
                编辑
              </a>
              <span
                style={{ color: '#2662EE', padding: '0 5px', cursor: 'pointer' }}
                onClick={() => {
                  this.delHandleList(record.Fid);
                }}
              >
                删除
              </span>
            </div>
          );
        },
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'block/fetchWhiteList',
      payload: query,
    });
  }

  // 删除
  delHandleList = (singleID) => {
    const { ids, query } = this.state;
    const {
      block: {
        whiteData: { list },
      },
      dispatch,
    } = this.props;
    const { page } = query;
    let newPage = page;
    let reqObj;
    if (!singleID) {
      // 批量删除
      if (list.length === ids.length) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      if (ids.length === 0) {
        message.error('未选择数据');
        return;
      }
      reqObj = { ids };
    } else {
      if (list.length === 1) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      reqObj = { ids: [singleID] };
    }

    dispatch({
      type: 'block/delWhiteList',
      payload: reqObj,
    })
      .then(() => {
        const newQuery = Object.assign({}, query, { page: newPage });
        message.success('删除成功');
        if (!singleID) {
          this.setState({ selectedRowKeys: [], ids: [], query: newQuery });
        } else {
          this.setState({ query: newQuery });
        }

        dispatch({ type: 'block/fetchWhiteList', payload: newQuery });
      })
      .catch((error) => {
        message.error(error.msg);
      });
  };

  changeStatus = (record) => {
    const { Fid, Factivated } = record;
    const { query, statusLoading } = this.state;
    const { dispatch } = this.props;
    statusLoading[record.Fid] = true;
    this.setState({ statusLoading });
    dispatch({
      type: 'block/updateWhiteList',
      payload: { Fid, Factivated: Factivated === 0 ? 1 : 0 },
    })
      .then((res) => {
        if (res.error_code === 0) {
          message.success('修改状态成功');
        } else {
          message.error('修改状态失败');
        }
        statusLoading[record.Fid] = false;
        this.setState({ statusLoading });
        dispatch({ type: 'block/fetchWhiteList', payload: query });
      })
      .catch((error) => {
        console.log(274, 'error', error);
        message.error(error.msg);
        statusLoading[record.Fid] = false;
        this.setState({ statusLoading });
      });
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.Fid);
    this.setState({ selectedRowKeys, ids });
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
      if (!field) {
        return;
      }
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, { sort: field, dir, page: 1 });
    }
    this.setState({ query: newQuery });
    dispatch({
      type: 'block/fetchWhiteList',
      payload: newQuery,
    });
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({
      type: 'block/fetchWhiteList',
      payload: newQuery,
    });
  };

  drawerClose = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    this.setState({ formVisible: false, drawerObj: {}, drawerTitle: '' });
    dispatch({ type: 'block/fetchWhiteList', payload: query });
  };

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
    dispatch({ type: 'block/fetchWhiteList', payload: newQuery });
  };

  onCancel = () => {
    this.setState({ uploadVisible: false });
    const { dispatch } = this.props;
    const { query } = this.state;
    dispatch({
      type: 'block/fetchWhiteList',
      payload: query,
    });
  };

  render() {
    const {
      block: {
        whiteData: { recordsTotal, list },
      },
      loading,
    } = this.props;
    const {
      query,
      uploadVisible,
      selectedRowKeys,
      formVisible,
      drawerTitle,
      drawerObj,
      ids,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
      // getCheckboxProps: this.getTableCheckboxProps,
    };
    const { page, pageSize, ...other } = query;

    const exportParams = { type: ids.length ? 1 : 0, ids, ...other };

    return (
      <div>
        <div>
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
              hrefStr={`/api/block/exportBlockWhiteList?params=${JSON.stringify(exportParams)}`}
              onPageChange={this.paginationChange}
            />
            <Table
              rowKey="Fid"
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
            />
          </div>
        </div>
        {uploadVisible && (
          <UploadTemplate
            title="导入阻断白名单"
            action="/api/upload/blockWhiteList"
            mouldDown="/api/block/mouldBlockWhiteList"
            TipEle={
              <Fragment>
                <div>阻断白名单导入列表填写帮助：</div>
                <div>1、请务必填写“*IP地址”字段。IP地址填写多个时，请用英文逗号“,”分隔。</div>
                <div>2、IP地址格式：支持 192.168.0.1 或 192.168.0.0/24。</div>
                <div>3、标#的字段为系统生成，请不要填写。</div>
              </Fragment>
            }
            // cmd="import_whitelist"
            // type="whitelist"
            fileFormat="请选择 *.xls，*.xlsx 格式的文件。"
            accept="*.xls;*.xlsx"
            uploadVisible={uploadVisible}
            cancel={this.onCancel}
          />
        )}
        {formVisible && (
          <DrawerWidget
            visible={formVisible}
            title={drawerTitle}
            width={960}
            onClose={this.drawerClose}
          >
            <BlockWhiteFormDrawer
              drawerObj={drawerObj}
              drawerTitle={drawerTitle}
              backTablePage={this.drawerClose}
            />
          </DrawerWidget>
        )}
      </div>
    );
  }
}
export default BlockWhite;
