/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
import React, { Component, Fragment } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Input, Row, Col, Table, Pagination, message } from 'antd';
import { connect } from 'umi';
import cloneDeep from 'lodash/cloneDeep';
import styles from './AddAsset.less';

const { Search } = Input;

/** 总字段列表 */
const assetFields = [
  { key: 'Fmac', title: 'MAC' },
  { key: 'Fasset_name', title: '名称' },
  { key: 'Fip', title: 'IP', sort: true },
  { key: 'Fgroup', title: '分组', checkedFlag: 'Fgid' },
  { key: 'Fcategory', title: '类型' },
];

class AddAsset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /** 全部的资产组 */
      assetGroup: [],
      /** 资产组的过滤 */
      assetGroupFilters: [],
      query: {
        page: 1,
        pageSize: 10,
        sort: '',
        dir: '',
        search: '',
        filterObj: this.getFilterObj(assetFields),
        dirObj: {},
        mustObj: this.getMustStatus(assetFields),
      },
      /** 右边表格选中的资产 */
      pickedList: [],
      /** 左边表格选中的所有资产id */
      selectedRowKeys: [],
    };

    this.columnsLeft = [
      {
        title: '资产名称/资产ip',
        dataIndex: 'Fasset_name',
        render: (text, record) => (
          <Fragment>
            <p>{record.Fasset_name}</p>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{record.Fip}</span>
          </Fragment>
        ),
        width: '37%',
      },
      {
        title: '资产组',
        dataIndex: 'Fgroup_name',
        filters: [],
        width: '20%',
      },
      {
        title: '资产类型',
        dataIndex: 'Fcategory_name',
        width: '37%',
      },
    ];
    this.columnsRight = [
      {
        title: '资产名称/资产ip',
        dataIndex: 'Fasset_name',
        width: '30%',
        render: (text, record) => (
          <Fragment>
            <p>{record.Fasset_name}</p>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{record.Fip}</span>
          </Fragment>
        ),
      },
      {
        title: '资产组',
        dataIndex: 'Fgroup_name',
        width: '20%',
      },
      {
        title: '资产类型',
        dataIndex: 'Fcategory_name',
        width: '30%',
      },
      {
        title: '删除',
        dataIndex: 'Fasset_id',
        width: '20%',
        render: (text) => (
          <DeleteOutlined
            onClick={() => {
              this.cancelCheck(text);
            }} />
        ),
      },
    ];
  }

  async componentDidMount() {
    // 把实例给到父组件
    this.props.onRef(this);

    const { dispatch } = this.props;
    // 获取资产组
    const assetGroup = await dispatch({
      type: 'advancedAnalysis/fetchGroup',
      payload: { sort: 'Finsert_time', dir: 'desc' },
    });
    // 获取资产列表
    await this.fetchAssetListData();

    const assetGroupFilters = [];
    if (assetGroup.length > 0) {
      assetGroup.forEach((item) => {
        assetGroupFilters.push({
          text: item.Fgroup_name,
          value: item.Fgid,
        });
      });
      this.columnsLeft[1].filters = assetGroupFilters;
    }
    this.setState({
      assetGroup,
      assetGroupFilters,
    });
  }

  /** 获取过滤对象 */
  getFilterObj = (list) => {
    const obj = {};
    list.forEach((item) => {
      obj[item.key] = [];
    });
    return obj;
  };

  /** 过滤对象是否需要筛选 */
  getMustStatus = (list) => {
    const obj = {};
    list.forEach((item) => {
      obj[item.key] = true;
    });

    return obj;
  };

  /** 资产表发生改变的时候 */
  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
    const { current, pageSize } = pagination;
    let { Fgroup_name: Fgroup } = filters;
    let newQuery;
    // 分页逻辑
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, { page: current, pageSize });
    } else {
      // 筛选逻辑
      Fgroup = Fgroup.map((item) => Number(item));
      newQuery = Object.assign({}, query, {
        filterObj: {
          ...query.filterObj,
          Fgroup,
        },
      });
    }
    this.setState(
      {
        query: newQuery,
      },
      () => {
        this.fetchAssetListData();
      }
    );
  };

  /** 搜索框发生改变得时候 */
  searchOnchange = (value) => {
    const { query } = this.state;
    query.search = value;
    this.setState({
      query,
    });
  };

  /** 搜索点击得时候 */
  handleSeatch = () => {
    this.fetchAssetListData();
  };

  /** 获取资产列表 */
  fetchAssetListData = () => {
    const { dispatch } = this.props;
    const { query } = this.state;
    const { dir, filterObj, mustObj, page, pageSize, search, sort, startTime, endTime } = query;
    dispatch({
      type: 'advancedAnalysis/fetchAssetList',
      payload: {
        dir,
        filterObj,
        mustObj,
        page,
        pageSize,
        search,
        sort,
        startTime,
        endTime,
        notExistInSceneConfig: true,
      },
    });
  };

  /** 右边的表取消选中 */
  cancelCheck = (fassetId) => {
    let { pickedList, selectedRowKeys } = this.state;
    pickedList = pickedList.filter((item) => item.Fasset_id !== fassetId);
    selectedRowKeys = selectedRowKeys.filter((id) => id !== fassetId);
    this.setState({
      pickedList,
      selectedRowKeys,
    });
  };

  /** 进行行选择的时候 */
  onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    const {
      advancedAnalysis: {
        assetList: { list },
        assetAnalysisTable: { total },
      },
    } = this.props;
    const { pickedList } = this.state; // 当前右边表格已选中的资产
    const newPickedList = cloneDeep(pickedList);
    const pickedListLeft = list.filter((item) => selectedRowKeys.includes(item.Fasset_id)); // 当前左边表格选中的资产
    pickedListLeft.forEach((item) => {
      // 如果不被pickedList包含，那么push进来
      const index = newPickedList.findIndex((element) => element.Fasset_id === item.Fasset_id);
      if (index === -1) {
        newPickedList.push(item);
      }
    });
    if (newPickedList.length > 50) {
      message.warn('一次性添加资产建议控制在 50 以内！ 否则数据量太大无法传输');
      return;
    }
    if (total + newPickedList.length > 100) {
      message.warn(
        `最多可以添加高级资产分析100个，当前已添加了${total}个，最多只能再新增${100 - total}个`
      );
      return;
    }
    this.setState({
      selectedRowKeys,
      pickedList: newPickedList,
    });
  };

  render() {
    const { pickedList, query, selectedRowKeys } = this.state;

    const {
      advancedAnalysis: { assetList },
      tableLoading,
    } = this.props;

    // rowSelection对象表示需要进行行选择
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <Row className={styles.content}>
        <Col span={12} className={styles.allList}>
          <p style={{ marginBottom: 10 }}>选择资产</p>
          <Search
            className={styles.search}
            placeholder="输入关键字搜索，支持网段搜索，例如网段192.168.1.1/168"
            value={query.search}
            onChange={(e) => {
              this.searchOnchange(e.target.value);
            }}
            onSearch={() => this.handleSeatch()}
          />
          <Table
            columns={this.columnsLeft}
            rowSelection={rowSelection}
            rowKey={(record) => record.Fasset_id}
            dataSource={assetList.list}
            pagination={{
              size: 'small',
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: assetList.total,
            }}
            loading={tableLoading}
            scroll={{ y: 400 }}
            onChange={this.handleTableChange}
          />
        </Col>

        <Col span={12} className={styles.pickedList}>
          <p style={{ marginBottom: 10 }}>已添加（{pickedList.length}）</p>
          <Table
            columns={this.columnsRight}
            rowKey={(record) => record.Fasset_id}
            dataSource={pickedList}
            pagination={false}
            scroll={{ y: 400 }}
          />
        </Col>
      </Row>
    );
  }
}

export default connect(({ global, advancedAnalysis, loading }) => ({
  hasVpc: global.hasVpc,
  advancedAnalysis,
  tableLoading: loading.effects['advancedAnalysis/fetchAssetList'],
}))(AddAsset);
