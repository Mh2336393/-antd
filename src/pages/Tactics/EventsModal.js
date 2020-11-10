/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */

import React, { Component } from 'react';
import { connect } from 'umi';
import _ from 'lodash';
import { Button, Modal, Table, Spin } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
import configSettings from '../../configSettings';
import styles from './form.less';

// const FormItem = Form.Item;
// const { Option } = Select;
// const RadioGroup = Radio.Group;
@connect(({ block, loading }) => ({
  block,
  loading: loading.effects['block/fetchEventList'],
  loading1: loading.effects['block/fetchRulesByEid'],
}))
class EventsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        selectedEids: [], // 已添加的id
        idType: '', // 状态 默认 为全部
        category: [], // 分类
        level: [],
        credit: [], // 置信度
        search: '', // 搜索
        sort: '', // 排序项
        dir: '', // 正序 倒叙
      },
      selectedRowKeys: [],
      // ids: [],
      expandedRowKeys: [],
      expandedRowTables: {},
      selectAll: false,
    };

    this.filterList = [
      {
        type: 'select',
        name: '分类',
        key: 'category',
        mode: 'multiple',
        showSearch: true,
        placeholder: '全部',
        // list: [{ name: '全部', value: '' }, ...configSettings.alertRuleCategory],
        list: [...configSettings.alertRuleCategory],
      },
      {
        type: 'select',
        name: '级别',
        key: 'level',
        mode: 'multiple',
        placeholder: '全部',
        list: [
          // { name: '全部', value: '' },
          { name: '严重（100）', value: 5 },
          { name: '高危（80）', value: 4 },
          { name: '中危（60）', value: 3 },
          { name: '低危（40）', value: 2 },
          { name: '信息（20）', value: 1 },
        ],
      },
      {
        type: 'select',
        name: '置信度',
        key: 'credit',
        mode: 'multiple',
        placeholder: '全部',
        list: configSettings.confidenceOpetion,
      },
      {
        type: 'select',
        name: '状态',
        key: 'idType',
        list: [
          { name: '全部', value: '' },
          { name: '已添加', value: 'yes' },
          { name: '未添加', value: 'no' },
        ],
      },
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: 'ID/事件名称',
        pressEnter: true,
      },
    ];

    this.ruleColumns = [
      {
        title: '规则ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '规则名称',
        dataIndex: 'name',
        key: 'name',
      },
    ];

    this.columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        key: 'name',
        render: (text) => {
          return <div>{text}</div>;
        },
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        // sorter: true,
      },
      {
        title: '来源',
        dataIndex: 'author',
        key: 'author',
        // sorter: true,
        render: (text) => (text === 'USER' ? '自定义' : '系统默认'),
      },
    ];
  }

  componentDidMount() {
    const { query } = this.state;
    const { dispatch, selectedIds = [] } = this.props;
    let selectedEids = [];
    let newQuery = query;
    if (selectedIds.length) {
      selectedEids = _.cloneDeep(selectedIds);
      newQuery = Object.assign({}, query, { selectedEids });
      // 因为状态默认是未添加。显示已勾选数就会很别扭
      this.setState({ selectedRowKeys: selectedIds, query: newQuery });
      // this.setState({ query: newQuery });
    }
    dispatch({ type: 'block/getAllEids', payload: newQuery });
    dispatch({ type: 'block/fetchEventList', payload: newQuery });
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
    const { query, selectAll } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({ query: newQuery });
    dispatch({
      type: 'block/fetchEventList',
      payload: newQuery,
    });
    dispatch({
      type: 'block/getAllEids',
      payload: newQuery,
    }).then((json) => {
      if (selectAll) {
        this.setState({ selectedRowKeys: json.data || [] });
      }
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
      if (!field) {
        return;
      }
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, { sort: field, dir, page: 1 });
    }
    this.setState({ query: newQuery });
    dispatch({
      type: 'block/fetchEventList',
      payload: newQuery,
    });
  };

  selectRowOnchange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  // 表格 展开收缩相关
  expandedRowRenderFn = (record) => {
    // console.log(12344, '12344record==', record);
    // const { loading1 } = this.props;
    const { expandedRowTables } = this.state;
    const { id } = record;

    console.log(218, 'expandedRowTables[id]==', expandedRowTables[id]);
    const { loading6 } = this.props;
    // console.log('url==', url, 'expandedRowTables[url]==', expandedRowTables[url]);

    let tableObj = { total: 0, list: [], page: 1 };
    if (expandedRowTables[id]) {
      tableObj = expandedRowTables[id];
    }
    // total <= 30 直接显示全部
    // total > 30 and  page*30 <total  查看全部按钮

    return (
      <div>
        {loading6 && !expandedRowTables[id] ? (
          <div>
            <Spin />
          </div>
        ) : (
          <div>
            <Table
              rowKey={(row) => `${row.eid}_${row.id}`}
              // loading={loading4}
              pagination={false}
              size="middle"
              // scroll={{ y: 240 }}
              columns={this.ruleColumns}
              dataSource={tableObj.list}
            />
          </div>
        )}
      </div>
    );
  };

  onExpandedRowsChangeFn = (expandedRows) => {
    const { expandedRowKeys, expandedRowTables } = this.state;
    let newExpandedRowTables = expandedRowTables;
    const curKeys = Object.keys(expandedRowTables);
    // console.log('旧 expandedRowKeys==', expandedRowKeys, '新 expandedRows==', expandedRows);

    if (expandedRows.length > expandedRowKeys.length) {
      let newTbObj = {};

      const newKeys = expandedRows.filter((tmpKey) => curKeys.indexOf(tmpKey) < 0);
      const newKey = newKeys[0] || '';

      const { dispatch } = this.props;
      if (newKey) {
        const newPay = { eids: [newKey] };
        console.log('要新增根据事件id查询 规则数据的接口，根据事件id 查询规则id，获取所有的事件id');
        dispatch({
          type: 'block/fetchRulesByEid',
          payload: newPay,
        })
          .then((json) => {
            // const {
            //   dataLeakage: { interfaceDetail },
            // } = this.props;
            console.log(11, newPay, 'json==', json);
            newTbObj = { [newKey]: { list: json.data || [] } };
            newExpandedRowTables = Object.assign({}, expandedRowTables, newTbObj);
            this.setState({ expandedRowTables: newExpandedRowTables });
          })
          .catch((error) => {
            console.log('397 error==', error);
            newTbObj = { [newKey]: {} };
            newExpandedRowTables = Object.assign({}, expandedRowTables, newTbObj);
            this.setState({ expandedRowTables: newExpandedRowTables });
          });
      }
    }
    this.setState({ expandedRowKeys: expandedRows });
  };

  selectedAllRow = () => {
    const {
      block: { allEids },
    } = this.props;
    // this.setState({ selectedRowKeys: allEids, selectAll: true });
    this.setState({ selectedRowKeys: allEids, selectAll: false });
  };

  selectedAllCancel = () => {
    this.setState({ selectedRowKeys: [], selectAll: false });
  };

  onOKSave = () => {
    const { dispatch, onSave } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'block/fetchRulesByEid',
      payload: { eids: selectedRowKeys },
    }).then((json) => {
      console.log('guize baocun Json==', json);
      const { ruleRes } = json;
      onSave(ruleRes.ruleIds, selectedRowKeys);
    });
  };

  getTableCheckboxProps = (record) => {
    // 列表复现框默认选中状态
    const { selectedRowKeys } = this.state;
    // console.log(343, 'record.id==', record.id, selectedRowKeys);
    return {
      // disabled: record.author !== 'USER',
      // defaultChecked: selectedRowKeys.includes(record.id),
      checked: selectedRowKeys.includes(record.id),
      // name: record.name,
    };
  };

  render() {
    const { query, selectedRowKeys } = this.state;
    const {
      rwAuth = '',
      block: {
        eventRuleData: { list, recordsTotal },
      },
      loading,
      loading1,
      visible,
      onCancel,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
      getCheckboxProps: this.getTableCheckboxProps,
    };
    console.log(324, selectedRowKeys.length, 'selectedRowKeys==', selectedRowKeys);
    return (
      <Modal
        title="事件列表"
        width={1164}
        visible={visible}
        destroyOnClose
        maskClosable={false}
        onCancel={onCancel}
        // onOk={this.onOKSave}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            disabled={rwAuth !== 'rw'}
            loading={loading1}
            type="primary"
            onClick={this.onOKSave}
          >
            确定
          </Button>,
        ]}
        // footer={
        //   <div className={styles.modalFooter}>
        //     <a onClick={this.showConfirm}>
        //       添加全部
        //       {otherRuleList.recordsTotal}项
        //     </a>
        //     <Button onClick={this.oncancel}>取消</Button>
        //     <Button type="primary" onClick={this.handleOk}>
        //       添加
        //     </Button>
        //   </div>
        // }
      >
        <div>
          {/* <div className="filterWrap"> */}
          <div>
            <FilterBlock
              filterList={this.filterList}
              filterOnChange={this.filterOnChange}
              submitFilter={this.submitFilter}
              totalWidth={182}
              query={query}
            />
          </div>
          {/* <div className="TableTdPaddingWrap"> */}
          <div>
            {selectedRowKeys.length > 0 && (
              <div className={styles.alertWrap}>
                <div className={styles.lenDiv}>
                  已勾选&nbsp;<a>{selectedRowKeys.length}</a>&nbsp;项
                </div>
                <a onClick={this.selectedAllRow}>选中全部</a>
                <span className={styles.gapLine}>|</span>
                <a onClick={this.selectedAllCancel}>取消勾选</a>
              </div>
            )}
            <Table
              rowKey="id"
              size="middle"
              loading={loading}
              columns={this.columns}
              dataSource={list}
              pagination={{
                total: recordsTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSize: query.pageSize,
                pageSizeOptions: configSettings.pageSizeOptions,
                // pageSizeOptions: ['10'],
                current: query.page,
                showTotal: (total) => `（${total}项）`,
              }}
              onChange={this.handleTableChange}
              rowSelection={rowSelection}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

export default EventsModal;
