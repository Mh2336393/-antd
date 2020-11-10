/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */

import React, { Component } from 'react';
import { connect } from 'umi';
import _ from 'lodash';
import { Button, Modal, Table, Badge } from 'antd';
import FilterBlock from '@/components/FilterBlock/Filter';
// import moment from 'moment';
import configSettings from '../../configSettings';
import styles from './form.less';

@connect(({ block, loading }) => ({
  block,
  loading: loading.effects['block/fetchRuleList'],
  loading1: loading.effects['block/getAllRids'],
}))
class RulesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        selectedRids: [], // 已添加的id
        idType: '', // 状态 默认 为全部
        author: '',
        enable: '',
        credit: [], // 置信度
        search: '', // 搜索
        sort: '', // 排序项
        dir: '', // 正序 倒叙
      },
      selectedRowKeys: [],
    };

    this.filterList = [
      {
        type: 'select',
        name: '来源',
        key: 'author',
        list: [
          { name: '全部', value: '' },
          { name: '自定义', value: 'USER' },
          { name: '系统默认', value: 'YUJIE' },
        ],
      },
      {
        type: 'select',
        name: '启禁',
        key: 'enable',
        list: [
          { name: '全部', value: '' },
          { name: '启用', value: 1 },
          { name: '禁用', value: 0 },
        ],
      },
      {
        type: 'select',
        name: '置信度',
        key: 'credit',
        mode: 'multiple',
        placeholder: '全部',
        list: [
          // { name: '全部', value: '' },
          { name: '5', value: 5 },
          { name: '4', value: 4 },
          { name: '3', value: 3 },
          { name: '2', value: 2 },
          { name: '1', value: 1 },
        ],
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
        placeholder: 'ID/规则名称',
        pressEnter: true,
      },
    ];

    this.columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '规则名称',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <div style={{ wordBreak: 'break-all' }}>{text}</div>,
      },
      {
        title: '置信度',
        dataIndex: 'credit',
        key: 'credit',
        // sorter: true,
      },
      {
        title: '启禁',
        dataIndex: 'enable',
        key: 'enable',
        sorter: true,
        // render: text => <Switch checkedChildren="开" unCheckedChildren="关" checked={text === 1} />,
        render: (text) => (
          <Badge status={text === 1 ? 'success' : 'default'} text={text === 1 ? '启用' : '禁用'} />
        ),
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
    let selectedRids = [];
    let newQuery = query;
    if (selectedIds.length) {
      selectedRids = _.cloneDeep(selectedIds);
      newQuery = Object.assign({}, query, { selectedRids });
      this.setState({ selectedRowKeys: selectedIds, query: newQuery });
    }
    dispatch({ type: 'block/getAllRids', payload: newQuery });
    dispatch({ type: 'block/fetchRuleList', payload: newQuery });
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
    dispatch({ type: 'block/fetchRuleList', payload: newQuery });
    dispatch({ type: 'block/getAllRids', payload: newQuery });
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
    dispatch({ type: 'block/fetchRuleList', payload: newQuery });
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys });
  };

  selectedAllRow = () => {
    const {
      block: { allRids },
    } = this.props;
    this.setState({ selectedRowKeys: allRids });
  };

  selectedAllCancel = () => {
    this.setState({ selectedRowKeys: [] });
  };

  onOKSave = () => {
    const { onSave } = this.props;
    const { selectedRowKeys } = this.state;
    onSave(selectedRowKeys);

    // form.validateFields((err, values) => {
    //   if (!err) {
    //     const params = values;
    //     if (params.field) {
    //       params.field = params.field.split(',');
    //     } else {
    //       params.field = [];
    //     }
    //     params.switch = Number(params.switch);
    //     params.minute = params.mergeTime === 'h' ? Number(params.minute) * 60 : Number(params.minute);
    //     if (onSave) {
    //       delete params.mergeTime;
    //       onSave(params);
    //     }
    //   }
    // });
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
        rulesData: { list, recordsTotal },
      },
      loading,
      // loading1,
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
        title="规则列表"
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
          <Button key="submit" disabled={rwAuth !== 'rw'} type="primary" onClick={this.onOKSave}>
            确定
          </Button>,
        ]}
      >
        <div>
          <div>
            <FilterBlock
              filterList={this.filterList}
              filterOnChange={this.filterOnChange}
              submitFilter={this.submitFilter}
              totalWidth={182}
              query={query}
            />
          </div>
          <div>
            {selectedRowKeys.length > 0 && (
              <div className={styles.alertWrap}>
                {/* <a>
                  <Icon type="info-circle" />
                </a> */}
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
                current: query.page,
                showTotal: (total) => `（${total}项）`,
              }}
              onChange={this.handleTableChange}
              rowSelection={rowSelection}
              // scroll={{ x: 1720 }}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

export default RulesModal;
