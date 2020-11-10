/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable radix */
import React, { Component } from 'react';
import { connect } from 'umi';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Table,
  Popover,
  Modal,
  Input,
  Select,
  Radio,
  Tooltip,
  message,
  Checkbox,
  Switch,
  Tag,
} from 'antd';
import SearchBlock from '@/components/SearchBlock';
import cloneDeep from 'lodash/cloneDeep';
import configSettings from '../../../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
import styles from './Segment.less';

const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const { confirm } = Modal;

// 网段结构
const networkSegmentDataStructure = {
  Fnet_segment_name: '', // 网段名称
  Fip_mask: '', // IP掩码
  Fnet_type: 'PC', // 网段类型
  Fnet_level: 3, // 网段权重
  Fvpcid: 0, // vpcid
  Fis_dhcp: 'DHCP', // 网段属性
  Fskip_recover_asset: 1, //  资产发现, 只有选择非DHCP才允许选择资产发现，是否资产发现: 0-进行资产发现 1-跳过资产发现
  Fauto_register_asset: 0, // 自动注册资产， 只有选择资产发现才允许选择是否自动注册， 0-不注册, 1-自动注册
  Fgroup: 0, // 自动注册时的GroupID
  Fdesc: '', // 描述
};
const networkSegmentType = [
  {
    key: 'PC',
    label: '生产网',
  },
  {
    key: 'SERVER',
    label: '办公网',
  },
  {
    key: 'OTHER',
    label: '其他',
  },
];
const theNetworkSegmentWeight = [
  {
    key: 1,
    label: '最低',
  },
  {
    key: 2,
    label: '低',
  },
  {
    key: 3,
    label: '中',
  },
  {
    key: 4,
    label: '高',
  },
  {
    key: 5,
    label: '最高',
  },
];
function returnsTheLabelBasedOnTheKey(key, array) {
  let label = '';
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (element.key === key) label = element.label;
  }
  return label;
}

class Segment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editItem: {},
      visible: false, // 是否显示弹窗
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        sort: 'Fupdate_time',
        dir: 'desc',
        keyword: '',
      },
      selectedRowKeys: [], // 选中的表格行
      segmensInfoList: [],
      screenSegmentPopoverTitle: '', // 网段弹窗标题
    };

    this.auth = getAuth('/asset/assetfind');
    if (this.auth === 'r') {
      this.btnList = [];
    } else {
      const editItem = cloneDeep(networkSegmentDataStructure);
      this.btnList = [
        {
          label: '新建',
          type: 'primary',
          func: () => {
            // 如果资产组不存在不允许新建网段
            const {
              segment: { groups },
            } = this.props;
            if (groups.length === 0) {
              message.warn('请先添加资产组');
              return;
            }

            this.setState({
              visible: true,
              screenSegmentPopoverTitle: '新建网段',
              editItem,
            });
          },
        },
        {
          label: '删除',
          type: 'primary',
          func: () => {
            this.delBatch();
          },
        },
      ];
    }

    this.columns = [
      {
        title: '网段名称',
        dataIndex: 'Fnet_segment_name',
        key: 'Fnet_segment_name',
        // width: 60,
        render: (text) => (
          <div className="ellipsis" style={{ width: 60 }} title={text}>
            {text}
          </div>
        ),
      },
      {
        title: 'IP/掩码',
        dataIndex: 'Fip_mask',
        key: 'Fip_mask',
        // width: 200,
        render: (text) => {
          const ipList = text ? text.split(',') : [];
          const popContent = (
            <div>
              {ipList.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          );
          return (
            <div>
              {ipList.length > 1 ? (
                <Popover content={popContent} placement="bottomLeft" title="IP/掩码">
                  <p>
                    多个(<span className="fontBlue">{ipList.length}</span>)
                  </p>
                </Popover>
              ) : (
                <p>{ipList[0] || ''}</p>
              )}
            </div>
          );
        },
      },
      {
        title: '网段类型',
        dataIndex: 'Fnet_type',
        key: 'Fnet_type',
        render: (text) => <span>{returnsTheLabelBasedOnTheKey(text, networkSegmentType)}</span>,
      },
      {
        title: '网段权重',
        dataIndex: 'Fnet_level',
        key: 'Fnet_level',
        render: (text) => (
          <span>{returnsTheLabelBasedOnTheKey(text, theNetworkSegmentWeight)}</span>
        ),
      },
      {
        title: 'VPCID',
        dataIndex: 'Fvpcid',
        key: 'Fvpcid',
        // width: 100,
      },
      {
        title: '标签',
        dataIndex: 'Ftags',
        key: 'Ftags',
        render: (text, record) => {
          const { Fauto_register_asset, Fskip_recover_asset, Fis_dhcp } = record;
          if (Fis_dhcp === 'DHCP') {
            return <Tag>{Fis_dhcp}</Tag>;
          }
          if (Fskip_recover_asset === 0 && Fauto_register_asset === 1) {
            return (
              <div>
                <Tag>资产发现</Tag> <Tag>自动注册</Tag>
              </div>
            );
          }
          if (Fskip_recover_asset === 0) {
            return <Tag>资产发现</Tag>;
          }
          return null;
        },
      },
      // {
      //   title: '网段类型',
      //   dataIndex: 'Fis_dhcp',
      //   key: 'Fis_dhcp',
      //   // width: 100,
      // },
      // {
      //   title: '策略',
      //   dataIndex: 'Fauto_register_asset',
      //   key: 'Fauto_register_asset',
      //   // width: 100,
      //   render: (text, record) => {
      //     const { Fauto_register_asset, Fskip_recover_asset } = record;
      //     if (Fauto_register_asset === 1) {
      //       return <span>自动注册</span>;
      //     }
      //     if (Fskip_recover_asset === 1) {
      //       return <span>忽略自动发现</span>;
      //     }
      //     return null;
      //   },
      // },
      {
        title: '描述',
        dataIndex: 'Fdesc',
        key: 'Fdesc',
        // width: 100,
        render: (text) => (
          <div style={{ width: '100px', cursor: 'pointer' }} className="ellipsis" title={text}>
            {text}
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: '',
        key: 'action',
        render: (text, record) =>
          this.auth === 'r' ? (
            ''
          ) : (
            <div className="action" style={{ minWidth: '100px' }}>
              <a
                style={{ paddingRight: 12 }}
                onClick={() => {
                  this.edit(record);
                }}
              >
                编辑
              </a>
              <a
                style={{
                  padding: '0px 12px',
                  borderLeft: '1px solid #D9DEEB',
                }}
                onClick={() => {
                  this.deleteItem(record.Fid, record.Fip_mask, record.Fskip_recover_asset);
                }}
              >
                删除
              </a>
            </div>
          ),
      },
    ];
  }

  async componentDidMount() {
    const { query } = this.state;
    const { dispatch } = this.props;
    dispatch({ type: 'segment/fetchNetSegement', payload: query });
    dispatch({ type: 'segment/fetchGroups' });
  }

  // 取消
  onCancel = () => {
    this.setState({
      visible: false,
    });
  };

  // 删除网段（选中的表格行）
  delBatch = () => {
    const { dispatch, segment } = this.props;
    const { selectedRowKeys, segmensInfoList, query } = this.state;
    const self = this;
    let Fip_masks;
    let Fskip_recover_assets;

    let SegmensInfos = [];
    for (let index = 0; index < segmensInfoList.length; index++) {
      Fip_masks = segmensInfoList[index].Fip_mask;
      Fskip_recover_assets = segmensInfoList[index].Fskip_recover_asset;
      const SegmensInfoObj = { Fip_mask: Fip_masks, Fskip_recover_asset: Fskip_recover_assets };

      console.log(SegmensInfoObj);
      SegmensInfos.push(SegmensInfoObj);
    }

    confirm({
      title: '确认删除网段吗?',
      onOk() {
        dispatch({
          type: 'segment/deleteNetsegement',
          payload: {
            data: {
              Fids: selectedRowKeys,
              SegmensInfo: SegmensInfos,
            },
          },
        })
          .then(() => {
            message.success('删除成功');
            const { page, pageSize } = query;
            const {
              segementList: { recordsTotal, list },
            } = segment;
            let newPage = page;
            const maxPage = Math.ceil(recordsTotal / pageSize);
            // const lastSize = recordsTotal % pageSize;
            if (page === maxPage && selectedRowKeys.length === list.length) {
              newPage = maxPage - 1 > 0 ? maxPage - 1 : 1;
            }
            if (selectedRowKeys.length && selectedRowKeys.length > list.length) {
              const delPage = Math.ceil(selectedRowKeys.length / pageSize);
              newPage = maxPage - delPage > 0 ? maxPage - delPage : 1;
            }
            const newQuery = Object.assign({}, query, { page: newPage });
            self.setState({ query: newQuery });
            dispatch({ type: 'segment/fetchNetSegement', payload: newQuery });
          })
          .catch(() => {
            message.error('删除失败');
          });
      },
      onCancel() {},
    });
  };

  // 新建/编辑 网段确认按钮点击
  onSave = () => {
    const that = this;
    const { dispatch, form } = this.props;
    const { screenSegmentPopoverTitle, query, editItem } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        const param = cloneDeep(values);
        param.Fskip_recover_asset = param.Fskip_recover_asset ? 0 : 1;
        param.Fauto_register_asset = param.Fauto_register_asset ? 1 : 0;
        let actionType = '';
        if (screenSegmentPopoverTitle === '编辑网段') {
          actionType = 'updateNetsegement';
          param.Fid = editItem.Fid;
        } else {
          actionType = 'insertNetsegement';
        }
        dispatch({
          type: `segment/${actionType}`,
          payload: { data: param, query },
        })
          .then((msg) => {
            if (msg) message.success(msg);
            that.setState({ visible: false });
          })
          .catch((errorMsg) => {
            if (errorMsg) message.error(`${errorMsg}`);
          });
      }
    });
  };

  // 选择表格行触发
  slelectRowOnchange = (selectedRowKeys, segmensInfoList) => {
    this.setState({ selectedRowKeys, segmensInfoList });
  };

  // 搜索触发
  onSearch = (value) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = {
      ...query,
      keyword: value,
      page: 1,
    };
    this.setState({ query: newQuery });
    dispatch({ type: 'segment/fetchNetSegement', payload: newQuery });
  };

  // 删除指定的网段元素
  deleteItem = (Fid, Fip_mask, Fskip_recover_asset) => {
    const { query } = this.state;
    const { dispatch, segment } = this.props;
    const self = this;

    confirm({
      title: '确认删除吗?',
      onOk() {
        dispatch({
          type: 'segment/deleteNetsegement',
          payload: {
            data: {
              Fids: [Fid],
              SegmensInfo: [
                {
                  Fip_mask,
                  Fskip_recover_asset,
                },
              ],
            },
            query,
          },
        })
          .then(() => {
            message.success('删除成功');
            const { page, pageSize } = query;
            const {
              segementList: { recordsTotal },
            } = segment;
            let newPage = page;
            const maxPage = Math.ceil(recordsTotal / pageSize);
            const lastSize = recordsTotal % pageSize;
            if (page === maxPage && lastSize === 1) {
              newPage = maxPage - 1 > 0 ? maxPage - 1 : 1;
            }
            const newQuery = Object.assign({}, query, { page: newPage });
            self.setState({ query: newQuery });
            dispatch({ type: 'segment/fetchNetSegement', payload: newQuery });
          })
          .catch(() => {
            message.error('删除失败');
          });
      },
      onCancel() {},
    });
  };

  // 编辑触发
  edit = (record) => {
    this.setState({
      visible: true,
      editItem: JSON.parse(JSON.stringify(record)),
      screenSegmentPopoverTitle: '编辑网段',
    });
  };

  // ip掩码验证规则
  validateIP = (rule, value, callback) => {
    if (!value) {
      callback();
    }
    const pattern = /^[0-9.,/]+$/;
    if (!pattern.test(value)) {
      callback('ip掩码格式有误，请重新输入');
    }
    const list = value.split(',');
    const error = list.some((item) => {
      const ip = [item.split('/')[0]];
      const range = parseInt(item.split('/')[1], 10);
      // console.log('range', item, range);
      const ipRight =
        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(
          ip
        ) ||
        /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(
          ip
        );
      const rangeRight = !!(range >= 0 && range <= 32);
      if (!ipRight || !rangeRight) {
        return true;
      }
      return false;
    });
    if (error) {
      callback('ip填写错误');
    } else {
      callback();
    }
  };

  // VPCID 数字验证规则
  numberValidator = (rule, value, callback) => {
    if (/[^\d]/g.test(value) || (value !== '' && parseInt(value, 10) > 4294967295)) {
      callback('vpcid格式输入不正确');
    }
    callback();
  };

  // 页码发生改变的时候触发
  pageOnChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const sort = (sorter && sorter.columnKey) || 'Fupdate_time';
    const dir = (sorter && sorter.order && sorter.order.slice(0, -3)) || 'desc';
    const { query } = this.state;
    const { dispatch } = this.props;

    const newQuery = { ...query, page: current, pageSize, sort, dir };
    this.setState({ query: newQuery });
    dispatch({ type: 'segment/fetchNetSegement', payload: { ...newQuery } });
  };

  // 网段属性选择
  changeNetworkSegmentAttributes = (e) => {
    const { value } = e.target;
    const { editItem } = this.state;

    editItem.Fis_dhcp = value;
    if (value === 'DHCP') {
      // 只有选择非DHCP才允许选择资产发现
      editItem.Fskip_recover_asset = 1;
      editItem.Fauto_register_asset = 0;
      this.setState({
        editItem,
      });
    }
  };

  // 资产发现选择
  assetDiscoveryOption = (e) => {
    const checked = e;
    const { editItem } = this.state;
    editItem.Fskip_recover_asset = checked ? 0 : 1;
    if (checked) {
      // 只有选择资产发现才允许选择是否自动注册
      editItem.Fauto_register_asset = 0;
    }
    this.setState({
      editItem,
    });
  };

  // 自动注册资产
  automaticRegisteredAssetSwitch = (e) => {
    const checked = e;
    const { editItem } = this.state;
    editItem.Fauto_register_asset = checked ? 1 : 0;
    this.setState({
      editItem,
    });
  };

  // 搜索字符串发生改变的时候
  searchChange = (value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { keyword: value });
    this.setState({ query: newQuery });
  };

  // 搜索按钮点击触发
  onSearchFn = (value) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = { ...query, page: 1, keyword: value };
    this.setState({ query: newQuery });
    dispatch({
      type: 'segment/fetchNetSegement',
      payload: newQuery,
    });
  };

  render() {
    const { editItem, visible, query, selectedRowKeys, screenSegmentPopoverTitle } = this.state;
    const {
      segment: { segementList, groups },
      hasVpc,
      form,
      tableLoading,
    } = this.props;
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

    // 判断删除按钮是否要禁用
    if (this.btnList) {
      this.btnList = this.btnList.map((item) => {
        if (item.label === '删除') {
          item.disabled = selectedRowKeys.length === 0;
        }
        return item;
      });
    }
    // 表格选中行的逻辑处理
    const rowSelection = {
      selectedRowKeys,
      onChange: this.slelectRowOnchange,
      getCheckboxProps: (record) => ({
        name: record.name,
        segmensInfoList: [
          {
            Fip_mask: record.Fip_mask,
            Fskip_recover_asset: record.Fskip_recover_asset,
          },
        ],
      }),
    };

    return (
      <div className={styles.addWrapper}>
        <SearchBlock
          style={{}}
          hideSearch={false}
          btnList={this.btnList}
          placeholder="搜索名称"
          searchChange={this.searchChange}
          onSearchFn={(value) => {
            this.onSearchFn(value);
          }}
        />
        <Table
          pagination={{
            current: query.page,
            total: segementList.recordsTotal,
            pageSize: query.pageSize,
            showQuickJumper: true,
            hideOnSinglePage: false,
            showTotal: (total) => `（${total}项）`,
            size: 'small',
            pageSizeOptions: configSettings.pageSizeOptions,
            showSizeChanger: true,
          }}
          onChange={this.pageOnChange}
          rowKey="Fid"
          rowSelection={rowSelection}
          loading={tableLoading}
          columns={hasVpc ? this.columns : this.columns.filter((item) => item.title !== 'VPCID')}
          dataSource={segementList.list}
          size="middle"
        />
        {/* 新建网段弹窗 */}
        <Modal
          destroyOnClose
          maskClosable={false}
          keyboard={false}
          title={screenSegmentPopoverTitle}
          visible={visible}
          onCancel={this.onCancel}
          onOk={this.onSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="网段名称">
              {getFieldDecorator('Fnet_segment_name', {
                initialValue: editItem.Fnet_segment_name,
                rules: [
                  { required: true, message: '请填写网段名称' },
                  { max: 64, message: '字符串长度不能超过64' },
                ],
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="IP掩码">
              {getFieldDecorator('Fip_mask', {
                initialValue: editItem.Fip_mask,
                rules: [
                  { required: true, message: '请填写IP掩码' },
                  { validator: this.validateIP },
                ],
              })(
                <TextArea
                  autosize={{ minRows: 2, maxRows: 6 }}
                  placeholder="例：192.168.0.0/24,172.16.0.0/30 使用‘,’分隔可输入多条内容"
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="网段类型">
              {getFieldDecorator('Fnet_type', {
                initialValue: editItem.Fnet_type,
              })(
                <Select>
                  <Option value="PC">生产网</Option>
                  <Option value="SERVER">办公网</Option>
                  <Option value="OTHER">其他</Option>
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="网段权重">
              {getFieldDecorator('Fnet_level', {
                initialValue: editItem.Fnet_level,
              })(
                <Select>
                  <Option value={1}>最低</Option>
                  <Option value={2}>低</Option>
                  <Option value={3}>中</Option>
                  <Option value={4}>高</Option>
                  <Option value={5}>最高</Option>
                </Select>
              )}
            </FormItem>

            {hasVpc ? (
              <FormItem {...formItemLayout} label="VPCID">
                {getFieldDecorator('Fvpcid', {
                  initialValue: editItem.Fvpcid,
                  rules: [
                    {
                      required: true,
                      message: '请填写VPCID',
                    },
                    { validator: this.numberValidator },
                  ],
                })(<Input placeholder="支持0~4294967295位整数" maxLength={10} />)}
              </FormItem>
            ) : (
              ''
            )}

            <FormItem
              {...formItemLayout}
              label={
                <span>
                  网段属性&nbsp;
                  <Tooltip title="如果所填网段使用了动态地址分配，请选择“DHCP”。资产发现中提供DHCP网段过滤功能。">
                    <QuestionCircleFilled style={{ fontSize: '15px', color: '#2662EE' }} />
                  </Tooltip>
                </span>
              }
            >
              {getFieldDecorator('Fis_dhcp', {
                initialValue: editItem.Fis_dhcp,
              })(
                <RadioGroup onChange={(e) => this.changeNetworkSegmentAttributes(e)}>
                  <Radio value="DHCP">DHCP</Radio>
                  <Radio value="非DHCP">非DHCP</Radio>
                </RadioGroup>
              )}
            </FormItem>

            {/* 资产发现, 只有选择非DHCP才允许选择资产发现，是否资产发现: 0-进行资产发现 1-跳过资产发现 */}
            <FormItem {...formItemLayout} label="资产发现">
              {getFieldDecorator('Fskip_recover_asset', {
                initialValue: editItem.Fskip_recover_asset === 0,
                // valuePropName: 'checked', initialValue: false
              })(
                // <Checkbox checked={editItem.Fskip_recover_asset === 0} disabled={editItem.Fis_dhcp === 'DHCP'} onChange={this.assetDiscoveryOption} />
                <Switch
                  checked={editItem.Fskip_recover_asset === 0}
                  disabled={editItem.Fis_dhcp === 'DHCP'}
                  onChange={this.assetDiscoveryOption}
                />
              )}
            </FormItem>

            {/* 自动注册资产， 只有选择资产发现才允许选择是否自动注册， 0-不注册, 1-自动注册 */}
            <FormItem {...formItemLayout} label="自动注册资产">
              {getFieldDecorator('Fauto_register_asset', {
                initialValue: editItem.Fauto_register_asset === 1,
              })(
                // <Checkbox checked={editItem.Fauto_register_asset === 1} disabled={editItem.Fskip_recover_asset === 1} onChange={this.automaticRegisteredAssetSwitch} />
                <Switch
                  checked={editItem.Fauto_register_asset === 1}
                  disabled={editItem.Fskip_recover_asset === 1}
                  onChange={this.automaticRegisteredAssetSwitch}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="资产组">
              {getFieldDecorator('Fgroup', {
                initialValue: editItem.Fgroup,
              })(
                <Select disabled={editItem.Fauto_register_asset === 0}>
                  {groups.map((item) => (
                    <Option key={item.Fgid} value={item.Fgid}>
                      {item.Fgroup_name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="描述">
              {getFieldDecorator('Fdesc', {
                initialValue: editItem.Fdesc || '',
                rules: [{ max: 256, message: '字符串长度不能超过256' }],
              })(
                <TextArea
                  disabled={editItem.Fnet_type === 'default'}
                  autosize={{ minRows: 2, maxRows: 6 }}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
export default connect(({ global, segment, loading }) => ({
  segment,
  hasVpc: global.hasVpc,
  tableLoading: loading.effects['segment/fetchNetSegement'],
}))(Form.create()(Segment));
