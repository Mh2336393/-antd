import React, { Component } from 'react';
import { connect } from 'umi';
import { Checkbox, Modal, Table, message, Tree, Spin, Row, Col, Badge } from 'antd';
// import PageHeaderWrapper from '@/components/PageHeaderWrapper/';
// import { Link } from 'umi';
import moment from 'moment';
// import _ from 'lodash';
import FilterBlock from '@/components/FilterBlock/Filter';
import ButtonBlock from '@/components/ButtonBlock';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import configSettings from '../../configSettings';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority;

/* eslint-disable camelcase */

const { confirm } = Modal;
const { TreeNode } = Tree;

@connect(({ messageCenter, login, loading }) => ({
  messageCenter,
  login,
  loading: loading.effects['messageCenter/fetchList'],
  loading1: loading.effects['messageCenter/fetchSubTypName'],
  treeLoading: loading.effects['messageCenter/fetchGroupList'],
  msgLoading: loading.effects['msgNotify/fetchMsgList'],
}))
class MessageCenter extends Component {
  constructor(props) {
    super(props);
    this.msgAuth = getAuth('/systemSetting/msg/messageCenter');
    const {
      login: { currentUser },
    } = this.props;
    this.userID = currentUser;
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        is_read: '', // 只显示未读消息
        search: '',
        message_type: '', // 消息类型 --左侧树--是否多选？？
        dir: 'desc',
        sort: 'create_time', // 时间由近及远显示
      },
      selectedRowKeys: [],
      ids: [],
      expandedKeys: [],
      autoExpandParent: true,
      selectedKeys: [],
      checked: false,
      drawerVisible: false,
      drawerObj: {},
      drawerTitle: '',
    };

    this.filterList = [
      {
        type: 'input',
        name: '搜索',
        key: 'search',
        placeholder: '消息名称',
        pressEnter: true,
      },
    ];

    this.columns = [
      {
        title: '消息名称',
        dataIndex: 'content',
        key: 'content',
        render: (text, record) => <a onClick={() => this.showMsgDetail(record)}>{text || ''}</a>,
      },
      // {
      //   title: '消息内容',
      //   dataIndex: 'content',
      //   key: 'content',
      // },
      {
        title: '消息类型',
        dataIndex: 'message_type',
        key: 'message_type',
        render: (text) => configSettings.msgType(text),
      },
      {
        title: '状态',
        dataIndex: 'is_read',
        key: 'is_read',
        render: (text) => {
          if (text === 1) {
            return (
              <div>
                <Badge status="default" />
                已读
              </div>
            );
          }
          return (
            <div>
              <Badge status="processing" />
              未读
            </div>
          );
        },
      },
      {
        title: '时间',
        width: 150,
        dataIndex: 'create_time',
        key: 'create_time',
        sorter: true,
        render: (text) => (
          <div style={{ width: 150 }}>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div>
        ),
      },
    ];

    this.btnList = [
      {
        label: '删除',
        type: 'primary',
        hide: this.msgAuth !== 'rw',
        func: () => {
          this.statusHandleEvent('del');
        },
      },
      {
        label: '标记已读',
        type: 'primary',
        hide: this.msgAuth !== 'rw',
        func: () => {
          this.statusHandleEvent('MarkedRead');
        },
      },
      {
        label: '全部已读',
        type: 'primary',
        hide: this.msgAuth !== 'rw',
        func: () => {
          this.statusHandleEvent('AllRead');
        },
      },
    ];
  }

  componentDidMount = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    dispatch({ type: 'messageCenter/fetchSubTypName' });
    dispatch({ type: 'messageCenter/fetchList', payload: query });
    this.msgNotifyReq();
    dispatch({
      type: 'messageCenter/fetchGroupList',
      payload: { is_read: query.is_read, search: query.search },
    }).then(() => {
      this.setState({ expandedKeys: ['all'] });
    });
  };

  showMsgDetail = (record) => {
    const { dispatch } = this.props;
    const { message_type, sub_type, detail, content, is_read, msg_id } = record;
    if (message_type === 'sec' || (sub_type === 'new_report' && content === '有新的报表生成')) {
      const info = JSON.parse(detail);
      let secLink = '';
      if (sub_type === 'new_report') {
        const timeStart = moment(info.generate_time)
          .subtract(1, 'seconds')
          .format('YYYY-MM-DD HH:mm:ss');
        const timeStop = moment(info.generate_time).add(1, 'seconds').format('YYYY-MM-DD HH:mm:ss');
        secLink = `/reports/lists?startTime=${timeStart}&endTime=${timeStop}`;
      }
      if (message_type === 'sec') {
        const { eventid } = info;
        const timeStart = moment(info.time).subtract(1, 'seconds').valueOf();
        const timeStop = moment(info.time).add(1, 'seconds').valueOf();
        let scoreParam = `score=${encodeURIComponent('["信息","低危", "中危", "高危"]')}`;
        if (sub_type === 'urgent_sec_event') {
          scoreParam = 'score=严重';
        }
        secLink = `/event/safeEvent/alarm?${scoreParam}&startTime=${timeStart}&endTime=${timeStop}&eventid=${eventid}`; // eventid其实也就是es的文档id
      }
      window.location.href = secLink;
      // 消息变已读
      if (!is_read) {
        dispatch({
          type: 'messageCenter/stausHandleEvent',
          payload: { ids: [msg_id], status: 'MarkedRead' },
        });
      }
    } else {
      const reqObj = { message_type, sub_type, content };
      dispatch({ type: 'messageCenter/fetchMsgDetail', payload: reqObj })
        .then((json) => {
          const { data = {} } = json;
          if (data.sub_type) {
            const { detail_translation, ...other } = data;
            const drawerObj = { ...other };
            drawerObj.detail = JSON.parse(detail);
            drawerObj.translation = JSON.parse(detail_translation);
            this.setState({ drawerVisible: true, drawerObj, drawerTitle: '消息详情' });
            // 消息变已读
            if (!is_read) {
              dispatch({
                type: 'messageCenter/stausHandleEvent',
                payload: { ids: [msg_id], status: 'MarkedRead' },
              });
            }
          } else {
            message.error('消息详情获取失败');
          }
        })
        .catch((error) => {
          console.log('消息详情获取失败error==', error);
          message.error('消息详情获取失败');
        });
    }
  };

  msgLinkClick = (link, data, e) => {
    if (
      data.message_type === 'sec' ||
      (data.message_type === 'sys' && data.sub_type !== 'flow_exception') ||
      data.sub_type === 'new_report'
    ) {
      e.preventDefault();
      const { dispatch } = this.props;
      // msg_num中的id是按时间倒叙排列 第一个id是最新时间的数据
      if (data.msg_num) {
        const numArr = data.msg_num.split('|').slice(1);
        const allIdArr = numArr.map((id) => Number(id));
        let idArr = allIdArr;
        if (
          data.message_type === 'sys' &&
          data.sub_type !== 'flow_exception' &&
          allIdArr.length > 10
        ) {
          idArr = allIdArr.slice(0, 10);
        }

        dispatch({
          type: 'messageCenter/fetchDetailInfo',
          payload: { ids: idArr, type: data.sub_type },
        }).then(() => {
          const {
            messageCenter: { detailInfo },
          } = this.props;
          if (data.message_type === 'sec' || data.sub_type === 'new_report') {
            const secDetail = detailInfo.map((obj) => {
              const item = JSON.parse(obj.detail);
              if (data.message_type === 'sec') {
                return { msg_id: obj.msg_id, time: item.time };
              }
              return { msg_id: obj.msg_id, time: item.generate_time };
            });
            const timeSort = secDetail.sort((a, b) => {
              const t1 = moment(a.time).valueOf();
              const t2 = moment(b.time).valueOf();
              if (t1 > t2) {
                return 1;
              }
              if (t1 < t2) {
                return -1;
              }
              return 0;
            });
            const timeStart = moment(moment(timeSort[0].time).subtract(1, 'seconds')).valueOf();
            const timeStop = moment(
              moment(timeSort[timeSort.length - 1].time).add(1, 'seconds')
            ).valueOf();
            const reportStart = moment(timeStart).format('YYYY-MM-DD HH:mm:ss');
            const reportStop = moment(timeStop).format('YYYY-MM-DD HH:mm:ss');
            // console.log(12345, timeStart, timeStop);
            // console.log(12345, moment(timeStart).format('YYYY-MM-DD HH:mm:ss'), moment(timeStop).format('YYYY-MM-DD HH:mm:ss'));
            let secLink = '';
            if (data.message_type === 'sec') {
              let scoreParam = `?score=${encodeURIComponent('["信息","低危", "中危", "高危"]')}`;
              if (data.sub_type === 'urgent_sec_event') {
                scoreParam = '?score=严重';
              }
              secLink = `${link}${scoreParam}&startTime=${timeStart}&endTime=${timeStop}`; // &sort=score&dir=desc
            }
            if (data.sub_type === 'new_report') {
              secLink = `${link}?startTime=${reportStart}&endTime=${reportStop}`;
            }
            // console.log(9, 'secLink==', secLink);
            window.location.href = secLink;
            // history.push(secLink);
            // 同时设置已读
            this.msgClickSetRead(data);
          }

          if (data.message_type === 'sys' && data.sub_type !== 'flow_exception') {
            // this.setState({ msgModalVisible: true, msgModalCxt: { detail: detailInfo, data } });
          }
        });
      }
    } else {
      this.msgClickSetRead(data);
    }
  };

  msgNotifyReq = () => {
    const { dispatch, msgLoading } = this.props;
    if (msgLoading !== true) {
      dispatch({ type: 'msgNotify/fetchMsgList' });
      dispatch({ type: 'global/fetchAlarmMessages' });
    }
  };

  // 消息类型树相关
  onTreeExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onTreeSelect = (selectedKeys) => {
    this.setState({ selectedKeys });
    const { dispatch } = this.props;
    const { query } = this.state;
    let message_type = '';
    if (selectedKeys.length !== 0) {
      const {
        messageCenter: { groupList: data },
      } = this.props;
      const dataList = this.getGenerateList(data);
      const selectData = dataList.filter((obj) => {
        const result = selectedKeys.filter((key) => key === obj.key);
        return result[0];
      });
      const messageTypeArr = selectData.map((obj) => obj.message_type)[0];
      message_type = messageTypeArr;
      if (message_type === 'all') {
        message_type = '';
      }
    }
    const newQuery = Object.assign({}, query, { message_type, page: 1 });
    this.setState({ query: newQuery });
    dispatch({ type: 'messageCenter/fetchList', payload: newQuery });
    dispatch({
      type: 'messageCenter/fetchGroupList',
      payload: { is_read: newQuery.is_read, search: newQuery.search },
    });
    this.msgNotifyReq();
  };

  getGenerateList = (data) => {
    const dataList = [];
    const generateList = (data1) => {
      for (let i = 0; i < data1.length; i += 1) {
        const node = data1[i];
        dataList.push(node);
        if (node.children) {
          generateList(node.children, node.key);
        }
      }
    };
    generateList(data);
    return dataList;
  };

  // getParentKey = (key, tree) => {
  //   let parentKey;
  //   for (let i = 0; i < tree.length; i += 1) {
  //     const node = tree[i];
  //     if (node.children) {
  //       if (node.children.some(item => item.key === key)) {
  //         parentKey = node.key;
  //       } else if (this.getParentKey(key, node.children)) {
  //         parentKey = this.getParentKey(key, node.children);
  //       }
  //     }
  //   }
  //   return parentKey;
  // };

  loop = (data) =>
    data.map((obj) => {
      const item = obj;
      item.title = `${item.message_name}（${item.count}）`;
      // item.key = `${item.message_name}（${item.count}）`;
      item.key = item.message_type;
      item.children = item.sub_type;
      const title = <span>{item.title}</span>;
      if (item.children) {
        return (
          <TreeNode key={item.key} title={title}>
            {this.loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={title} />;
    });

  // 右侧表单
  onCheckChange = (e) => {
    const { dispatch } = this.props;
    const { checked } = e.target;
    const { query } = this.state;
    let newQuery = Object.assign({}, query, { page: 1, is_read: '' });
    if (checked) {
      // 只显示未读消息
      newQuery = Object.assign({}, query, { page: 1, is_read: 0 });
    }
    this.setState({ checked, query: newQuery });
    dispatch({ type: 'messageCenter/fetchList', payload: newQuery });
    dispatch({
      type: 'messageCenter/fetchGroupList',
      payload: { is_read: newQuery.is_read, search: newQuery.search },
    });
    this.msgNotifyReq();
  };

  filterOnChange = (type, value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { [type]: value });
    this.setState({ query: newQuery });
  };

  submitFilter = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({ query: newQuery });
    dispatch({ type: 'messageCenter/fetchList', payload: newQuery });
    dispatch({
      type: 'messageCenter/fetchGroupList',
      payload: { is_read: newQuery.is_read, search: newQuery.search },
    });
    this.msgNotifyReq();
  };

  // 消息名称由两部分组成：消息二级分类sub_type 消息数量msg_num
  searchTxtHandle = (str) => {
    let searchCxt = [];
    if (str) {
      // 判断是否有括号 括号里面是否是数值？？？
      // const subTyps = [
      //   { name: '有新的急需处理的安全事件（评分81-100）', type: 'urgent_sec_event' },
      //   { name: '有新的普通安全事件（评分1-80）', type: 'normal_sec_event' },
      //   { name: '系统组件运行异常', type: 'components_exception' },
      //   { name: '流量采集运行异常', type: 'flow_exception' },
      //   { name: '系统（CPU、内存）使用率高于80%', type: 'system_exception' },
      //   { name: '磁盘使用率高于80%', type: 'disk_exception' },
      //   { name: '有新的报表生成', type: 'new_report' },
      //   { name: '报表积攒过多，系统将进行清理', type: 'report_exception' },
      // ];
      const {
        messageCenter: { subtypes },
      } = this.props;
      const subKeys = Object.keys(subtypes);
      const searchArr = [];
      subKeys.forEach((sub) => {
        if (subtypes[sub].indexOf(str) > -1) {
          searchArr.push(sub);
        }
      });
      if (searchArr.length) {
        searchCxt = searchArr;
      } else {
        searchCxt = ['str'];
      }
    }
    return searchCxt;
  };

  // 删除 标记已读
  statusHandleEvent = (status) => {
    const { ids, query } = this.state;
    const { dispatch } = this.props;
    if (ids.length === 0 && status !== 'AllRead') {
      message.error('未选择数据');
      return;
    }
    const msgNotifyReq = () => this.msgNotifyReq();

    let reqObj = {};

    // const newIds = ids.join(',');
    if (status === 'del') {
      confirm({
        title: '删除后不可恢复，确定删除吗',
        onOk() {
          dispatch({ type: 'messageCenter/stausHandleEvent', payload: { ids, status } })
            .then(() => {
              message.success('删除成功');
              dispatch({ type: 'messageCenter/fetchList', payload: query });
              dispatch({
                type: 'messageCenter/fetchGroupList',
                payload: { is_read: query.is_read, search: query.search },
              });
              msgNotifyReq();
            })
            .catch((error) => {
              // message.error(error.msg);
              message.error(`删除失败：${error.msg}`);
            });
        },
        onCancel() {},
      });
      this.setState({ selectedRowKeys: [], ids: [] });
    } else {
      if (status === 'MarkedRead') {
        reqObj = { ids, status };
      }
      if (status === 'AllRead') {
        const newQuery = { is_read: 0, message_type: query.message_type, search: query.search };
        reqObj = { status, query: newQuery };
      }
      dispatch({ type: 'messageCenter/stausHandleEvent', payload: reqObj })
        .then(() => {
          message.success('设置成功');
          this.setState({ selectedRowKeys: [], ids: [] });
          dispatch({ type: 'messageCenter/fetchList', payload: query });
          dispatch({
            type: 'messageCenter/fetchGroupList',
            payload: { is_read: query.is_read, search: query.search },
          });
          msgNotifyReq();
        })
        .catch((error) => {
          message.error(error.msg);
        });
    }
  };

  paginationChange = (page, pageSize) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = Object.assign({}, query, { page, pageSize });
    this.setState({ query: newQuery });
    dispatch({ type: 'messageCenter/fetchList', payload: newQuery });
    dispatch({
      type: 'messageCenter/fetchGroupList',
      payload: { is_read: newQuery.is_read, search: newQuery.search },
    });
    this.msgNotifyReq();
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
      if (['create_time'].indexOf(field) < 0 || !field) {
        return;
      }
      const dir = order === 'descend' ? 'desc' : 'asc';
      newQuery = Object.assign({}, query, { sort: field, dir, page: 1 });
    }
    this.setState({ query: newQuery });
    dispatch({ type: 'messageCenter/fetchList', payload: newQuery });
    dispatch({
      type: 'messageCenter/fetchGroupList',
      payload: { is_read: newQuery.is_read, search: newQuery.search },
    });
    this.msgNotifyReq();
  };

  selectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.msg_id);
    this.setState({ selectedRowKeys, ids });
  };

  drawerClose = () => {
    const { query } = this.state;
    const { dispatch } = this.props;
    this.setState({ drawerVisible: false, drawerObj: {}, drawerTitle: '' });
    dispatch({ type: 'messageCenter/fetchList', payload: query });
    dispatch({
      type: 'messageCenter/fetchGroupList',
      payload: { is_read: query.is_read, search: query.search },
    });
    this.msgNotifyReq();
  };

  render() {
    const {
      messageCenter: { messageList, groupList },
      loading,
      treeLoading,
    } = this.props;
    const { recordsTotal, list } = messageList;
    const {
      drawerVisible,
      drawerObj,
      drawerTitle,
      checked,
      query,
      selectedRowKeys,
      expandedKeys,
      autoExpandParent,
      selectedKeys,
    } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectRowOnchange,
    };
    return (
      <div>
        <div className="filterWrap">
          <div style={{ display: 'flex' }}>
            <div>
              <FilterBlock
                filterList={this.filterList}
                query={query}
                colNum={1}
                filterOnChange={this.filterOnChange}
                submitFilter={this.submitFilter}
                // searchColStyle={{ paddingLeft: 0 }}
              />
            </div>
            <div style={{ paddingLeft: 20 }}>
              <Checkbox style={{ marginTop: 3 }} checked={checked} onChange={this.onCheckChange}>
                只展示未读消息
              </Checkbox>
            </div>
          </div>
        </div>
        <div style={{ padding: '20px 24px', margin: 12, backgroundColor: '#fff' }}>
          <div style={{ position: 'relative' }}>
            <div className={styles.treeDivWrap}>
              <div>
                {treeLoading ? (
                  <Spin />
                ) : (
                  <Tree
                    onExpand={this.onTreeExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    showLine
                    onSelect={this.onTreeSelect}
                    selectedKeys={selectedKeys}
                  >
                    {this.loop(groupList)}
                  </Tree>
                )}
              </div>
            </div>
            <div className={styles.propertyRiskRightCol}>
              <div className={styles.propertyRiskRight}>
                <ButtonBlock
                  btnList={this.btnList}
                  bpage={query.page}
                  bsize={query.pageSize}
                  total={recordsTotal}
                  onPageChange={this.paginationChange}
                />
                <Table
                  rowKey="msg_id"
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
          </div>
        </div>
        {drawerVisible && (
          <DrawerWidget
            visible={drawerVisible}
            title={drawerTitle}
            width={800}
            onClose={this.drawerClose}
          >
            <div className={styles.drawerContent}>
              <Row className={styles.rowBlock}>
                <Col span={4}>
                  <h4 className={styles.title4}>基本信息</h4>
                </Col>
                <Col span={20}>
                  <Row>
                    <Col className={styles.labelCol} span={6}>
                      消息名称：
                    </Col>
                    <Col span={16}>
                      <div className={styles.cxtCol}>{drawerObj.content}</div>
                    </Col>
                  </Row>
                  {drawerObj.translation.map((arr) => (
                    <Row key={arr[0]}>
                      <Col className={styles.labelCol} span={6}>
                        {arr[1]}：
                      </Col>
                      <Col span={16}>
                        <div className={styles.cxtCol}>{drawerObj.detail[arr[0]]}</div>
                      </Col>
                    </Row>
                  ))}
                </Col>
              </Row>
              {drawerObj.guide && (
                <Row className={styles.rowBlock}>
                  <Col span={4}>
                    <h4 className={styles.title4}>修复建议</h4>
                  </Col>
                  <Col span={20}>
                    <Row>
                      {/* <Col className={styles.labelCol} span={6}>建议：</Col> */}
                      <Col span={22}>
                        <div className={styles.cxtCol}>{drawerObj.guide}</div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )}
            </div>
          </DrawerWidget>
        )}
      </div>
    );
  }
}

export default MessageCenter;
