/* eslint-disable react/sort-comp */
import { connect } from 'umi';
import React, { Component } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { CloseOutlined, DownOutlined, InfoCircleFilled, UpOutlined } from '@ant-design/icons';
import { Select, message, Modal, Divider, Row, Col, Tooltip, Drawer } from 'antd';

import { Resizable } from 'react-resizable';
import moment from 'moment';
import bus from '@/utils/event';
import union from 'lodash/union';
import difference from 'lodash/difference';
import { Link } from 'umi';
import downloadFile from '@/tools/download';
import CommonPage from '@/components/CommonPage';
import ItemManageModal from '@/components/ItemManageModal';
import { LineChartMul } from '@/components/Charts';
import styles from './AssetList.less';
import {
  assetFields,
  defaultFilterListKey,
  defaultColumnKeys,
  setShowList,
  columnRender,
  notInFilterKey,
} from './FieldNameList';
import configSettings from '../../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
import AddAssetForm from './components/AddAsset';
import AssetDetail from '../AssetDetail';
import AssetImport from './components/AssetImport';

const { assetValueMap } = configSettings;
const FsourceKeyObj = assetValueMap.Fsource;

const { Option } = Select;
const { confirm } = Modal;
// 伸缩
const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  if (!width) {
    return <th {...restProps} />;
  }
  return (
    <Resizable
      width={width}
      height={50}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};
class AssetList extends Component {
  constructor(props) {
    super(props);
    this.detailAuth = getAuth('/asset/assetDetail');
    this.groupAuth = getAuth('/asset/assetgroup');
    this.auth = getAuth('/asset/assetList');
    this.eventAuth = ['r', 'rw'].includes(getAuth('/event/safeEvent/alarm'));
    this.assetFields = props.hasVpc
      ? assetFields
      : assetFields.filter((item) => item.key !== 'Fvpcid');
    this.defaultFilterListKey = props.hasVpc
      ? defaultFilterListKey
      : defaultFilterListKey.filter((item) => item !== 'Fvpcid');
    this.defaultColumnKeys = props.hasVpc
      ? defaultColumnKeys
      : defaultColumnKeys.filter((item) => item !== 'Fvpcid');
    this.localFilterKeys = props.hasVpc
      ? localStorage.getItem(`assetFilterKeys`)
      : localStorage.getItem(`assetFilterKeys`) &&
        localStorage
          .getItem(`assetFilterKeys`)
          .split(',')
          .filter((item) => item !== 'Fvpcid')
          .join(',');
    this.localColumnKeys = props.hasVpc
      ? localStorage.getItem(`assetColumnKeys`)
      : localStorage.getItem(`assetColumnKeys`) &&
        localStorage
          .getItem(`assetColumnKeys`)
          .split(',')
          .filter((item) => item !== 'Fvpcid')
          .join(',');
    this.startTime = moment(moment().subtract(1, 'days')).format('YYYY-MM-DD 00:00:00');
    this.endTime = moment().format('YYYY-MM-DD HH:mm:ss');
    this.columnKey = this.localColumnKeys
      ? this.localColumnKeys.split(',')
      : this.defaultColumnKeys;
    this.filterKey = this.localFilterKeys
      ? this.localFilterKeys.split(',')
      : this.defaultFilterListKey;
    const { filterDefaultList, columnDefaultList } = setShowList(this.columnKey, this.filterKey);
    this.columnDefaultList = columnDefaultList;
    this.filterDefaultList = filterDefaultList;
    const newColumnDefaultList = this.reWriteRender(columnDefaultList);
    const filterObj = this.getFilterObj(true, filterDefaultList);
    // newColumnDefaultList = columnDefaultList.filter(item => ['Ftags'].indexOf(item.key) < 0);
    this.state = {
      query: {
        page: 1,
        pageSize: 20,
        sort: '',
        dir: '',
        search: '',
        filterObj,
        dirObj: this.getDirStatus(true, filterDefaultList),
        mustObj: this.getMustStatus(true, filterDefaultList),
        // startTime: '',
        // endTime: '',
      },
      filterArr: [],
      actionStatus: this.getActionStatus(filterObj),
      pickedFilterList: filterDefaultList,
      columnModalVisiable: false,
      filterModalVisiable: false, // 筛选栏管理modal显示状态
      columns:
        ['rw'].indexOf(this.auth) > -1
          ? newColumnDefaultList.concat([
              {
                title: '操作',
                dataIndex: '',
                fixed: 'right',
                key: 'action',
                width: 184,
                render: (text, record) => {
                  return (
                    <div style={{ minWidth: '200px' }}>
                      <a
                        style={{ marginLeft: 10 }}
                        onClick={() => {
                          this.showDrawer('addFlag', true, record);
                        }}
                      >
                        编辑
                      </a>
                      {/* )} */}
                      <span>
                        <Divider type="vertical" style={{ height: 14, margin: '0 12px' }} />
                        <a
                          style={{ marginLeft: 10 }}
                          onClick={() => {
                            this.delAsset(record.Fid);
                          }}
                        >
                          删除
                        </a>
                      </span>
                      <span>
                        <Divider type="vertical" style={{ height: 14, margin: '0 12px' }} />
                        {/* <span>查看事件</span> */}
                        {this.eventAuth && (
                          <Link
                            target="_blank"
                            to={`/event/safeEvent/alarm?affectedAssets.ipMac=${record.Fip}-${
                              record.Fvpcid
                            }&startTime=${moment()
                              .subtract(90, 'days')
                              .valueOf()}&endTime=${moment().valueOf()}&status=unhandled`}
                          >
                            查看事件
                          </Link>
                        )}
                        {/* <Dropdown
                          overlay={this.actionMenu(record)}
                          disabled={!this.eventAuth && !this.alarmAuth && !this.vulAuth}
                        >
                          <a className="ant-dropdown-link">
                            更多操作 <Icon type="down" />
                          </a>
                        </Dropdown> */}
                      </span>
                    </div>
                  );
                },
              },
            ])
          : newColumnDefaultList.concat([
              {
                title: '操作',
                dataIndex: '',
                fixed: 'right',
                key: 'action',
                width: 184,
                render: (text, record) => (
                  <div>
                    {/* <span>查看事件</span> */}
                    {this.eventAuth && (
                      <Link
                        target="_blank"
                        to={`/event/safeEvent/alarm?affectedAssets.ipMac=${record.Fip}-${
                          record.Fvpcid
                        }&startTime=${moment()
                          .subtract(90, 'days')
                          .valueOf()}&endTime=${moment().valueOf()}&status=unhandled`}
                      >
                        查看事件
                      </Link>
                    )}
                  </div>
                ),
              },
            ]), // table所需columns
      tableScrollX: columnDefaultList.length * 60, // 动态增加显示列，需要增加scrollX
      selectedRowKeys: [],
      selectedRows: [], // 已选择的行
      timeRange: 30,
      groupVisible: false, // 添加到组modal
      gid: null,
      // formData: {},
      // editVisible: false,
      // showMore: false,
      groupList: [],
      // tag: '',
      exportLoading: false,
      // 全量选择
      selectedNum: 0, // 全量选择数量
      isAllCheck: false,
      checkAllPage: [], // 记录全选的页数
      unCheckedIds: [], // 没选中的id
      drawerVisible: false, // 右侧抽屉显示
      drawerTitle: '', // 右侧抽屉标题
      // detailFlag: false, // 是否显示详情
      // configFlag: false, // 是否显示资产配置
      // addFlag: false, // 新增资产配置
      detailItem: {}, // 详情Item
      // other: '', // 其他字段编辑
      importVisible: false, // 导入上传
      editItem: {}, // 新建编辑资产信息
      chartDisplay: true, // 是否展示图
      mode: true,
      preQuery: {
        // 保存点击搜索前的
        preFilterObj: this.getFilterObj(true, filterDefaultList),
        preMustObj: this.getMustStatus(true, filterDefaultList),
      },

      // 资产组页面点资产数跳过来的时候存一下组名，（资产数字为0的时候 要显示一下）
      // 代码太复杂了...........................随便整吧弄出来他的要求就好
      Fgroup_name: '',
    };

    // 伸缩
    this.components = {
      header: {
        cell: ResizableTitle,
      },
    };

    this.btnList = [];
    if (this.auth === 'rw') {
      this.btnList = this.btnList.concat([
        {
          label: '新建',
          type: 'primary',
          color: 'blue',
          func: () => {
            this.showDrawer('addFlag', true, {});
          },
        },
        {
          label: '删除',
          type: 'primary',
          func: () => {
            this.delAsset();
          },
        },
        {
          label: '导入',
          type: 'primary',
          func: () => {
            this.assetImport();
          },
        },
      ]);
    }

    this.btnList = this.btnList.concat([
      {
        label: '导出',
        type: 'primary',
        func: () => {
          this.export();
        },
      },
    ]);
    if (this.auth === 'rw') {
      this.btnList = this.btnList.concat([
        {
          label: '添加到组',
          type: 'primary',
          func: this.addGroup,
        },
      ]);
    }
  }

  componentWillMount() {
    const { columns } = this.state;

    const bodywidth = document.body.offsetWidth - 306;
    console.log(columns);
    columns.map((item) => {
      if (item.title === 'IP') {
        item.width = bodywidth / 12;
      } else if (item.title === 'MAC') {
        item.width = bodywidth / 13;
      } else if (item.title === 'VPCID') {
        item.width = bodywidth / 20;
      } else if (item.title === '今日事件数') {
        item.width = bodywidth / 14;
      } else if (item.title === '类型') {
        item.width = bodywidth / 18;
      } else if (item.title === '来源') {
        item.width = bodywidth / 18;
      } else if (item.title === '注册时间') {
        item.width = bodywidth / 11;
      } else if (item.title === '更新时间') {
        item.width = bodywidth / 11;
      } else if (item.title === '名称') {
        item.width = bodywidth / 14;
      } else if (item.title === '分组') {
        item.width = bodywidth / 16;
      } else if (item.title === '操作') {
        item.width = 200;
      } else {
        item.width = bodywidth / 12;
      }
      return item.width;
    });
  }

  componentDidMount() {
    const {
      location: { query: param },
    } = this.props;
    const { dispatch } = this.props;
    const { query } = this.state;

    if (param.search) {
      const newQuery = Object.assign({}, query, { search: param.search });
      const { dirObj, filterObj, search } = newQuery;
      this.setState({ query: newQuery });
      this.fetchAssetListData(newQuery);
      this.fetchFilterCount({ dirObj, filterObj, search });
    } else if (param.Fgid) {
      dispatch({
        type: 'assetList/fetchAllGroups',
        payload: { Fgid: Number(param.Fgid) },
      })
        .then((data) => {
          const Fgids = data;
          const newFilterObj = Object.assign({}, query.filterObj, { Fgroup: Fgids });
          const newQuery = Object.assign({}, query, { filterObj: newFilterObj });
          const newFilterArr = [];
          Object.keys(newFilterObj).forEach((key) => {
            if (newFilterObj[key].length > 0) {
              newFilterObj[key].forEach((item) => {
                newFilterArr.push(`${key}_${item}`);
              });
            }
          });
          console.log('newQuery', newQuery, newFilterArr);
          const { filterObj, mustObj, dirObj, search } = newQuery;
          const newPreQuery = { preFilterObj: filterObj, preMustObj: mustObj };
          this.setState({ query: newQuery, filterArr: newFilterArr, preQuery: newPreQuery }, () => {
            this.fetchAssetListData(newQuery);
            this.fetchFilterCount({ filterObj, mustObj, dirObj, search });
          });
        })
        .catch(() => {
          message.info('获取分组失败');
        });

      if (param.Fgroup_name) {
        this.setState({ Fgroup_name: param.Fgroup_name });
      }
    } else {
      this.fetchAssetListData();
      this.fetchFilterCount();
    }
    // 拉取所有分组
    dispatch({
      type: 'assetList/fetchGroup',
      payload: { sort: 'Finsert_time', dir: 'desc' },
    })
      .then((list) => {
        this.setState({
          groupList: list,
          gid: list[0] ? list[0].Fgid : null,
        });
      })
      .catch((err) => {
        message.error(err.returnMessage || '拉取分组失败');
      });
    this.fetchChartData();

    window.onscroll = () => {
      // 隐藏antd滚动条
      if (
        document.getElementsByClassName('ant-table-body')[0] &&
        document.getElementsByClassName('ant-table-content')[0]
      ) {
        document.getElementsByClassName('ant-table-body')[0].style.overflow = 'hidden';
        document.getElementsByClassName('ant-table-content')[0].style.overflow = 'hidden';
      }
      if (
        document.getElementsByClassName('ant-table-thead')[0] &&
        window.location.pathname === '/asset/assetList' &&
        document.getElementsByClassName('ant-table-row-level-0')[0]
      ) {
        const childrens = document.getElementsByClassName('ant-table-thead')[0].children[0]
          .children;
        document.getElementsByClassName('ant-table-fixed-right')[0].style.zIndex = 998;
        document.getElementsByClassName('ant-table-thead')[1].children[0].style.height = '45px';
        for (let index = 0; index < childrens.length; index++) {
          const item = document.getElementsByClassName('ant-table-column-title')[index].innerHTML;

          if (item === '操作') {
            const docItem = document.getElementsByClassName('ant-table-thead')[1];
            if (document.documentElement.scrollTop > 485) {
              docItem.children[0].children[0].style.width = '183px';
              docItem.style.position = 'fixed';
              docItem.style.width = '190px';
              docItem.style.top = '48px';
              docItem.style.right = '36px';
              docItem.style.zIndex = 1200;
            } else {
              docItem.style.position = 'static';
            }
          } else if (item === '') {
            childrens[index].style.width = ``;
          } else {
            childrens[index].style.width = this.getWindow(index);
          }
        }
        const fdocItem = document.getElementsByClassName('ant-table-thead')[0];
        if (document.documentElement.scrollTop > 485) {
          // fdocItem.style.width=`${document.getElementsByClassName("ant-table-content")[0].offsetWidth}px`
          // fdocItem.style.overflow="hidden"
          fdocItem.style.width = '500%';
          fdocItem.style.backgroundColor = '#f0f2f5';
          // fdocItem.style.lineHeight="1"
          fdocItem.style.height = '45px';
          fdocItem.style.paddingRight = '24px';
          fdocItem.style.position = 'fixed';
          fdocItem.style.top = '48px';
          // fdocItem.style.left="354px"
          fdocItem.style.width = this.state.tableScrollX;
          fdocItem.style.zIndex = 888;
        } else if (document.documentElement.scrollTop < 485) {
          fdocItem.style.position = 'static';
        }
      }

      this.newscroll();
      this.leftfixed();
    };
    this.leftscroll();
  }

  componentWillReceiveProps(nextProps) {
    const {
      assetList: { assetList },
    } = nextProps;
    const {
      query: { page },
      selectedNum,
      isAllCheck,
      checkAllPage,
      selectedRowKeys,
      unCheckedIds,
    } = this.state;
    if (checkAllPage.includes(page) && isAllCheck && selectedNum >= 0) {
      const selectedRows = assetList.list.filter((item) => !unCheckedIds.includes(item.Fid));
      const ids = selectedRows.map((item) => item.Fid);
      this.setState({
        selectedRowKeys: selectedRowKeys.concat(ids),
        selectedRows,
      });
    }
  }

  leftscroll = () => {
    if (document.getElementsByClassName('ant-layout-sider-children')[0]) {
      const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
      const menutop = document.documentElement.clientHeight;
      leftmenu.style.height = `${menutop - 125}px`;
    }
  };

  leftfixed = () => {
    if (
      document.getElementsByClassName('ant-layout-sider-children')[0] &&
      document.getElementsByClassName('ant-layout-sider')[0]
    ) {
      document.getElementsByClassName('ant-layout-sider')[0].style.zIndex = 998;
      const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
      const leftWidth = document.getElementsByClassName('ant-layout-sider')[0].style.width;
      const menutop = document.documentElement.clientHeight;
      leftmenu.style.height = `${menutop - 125}px`;
      leftmenu.style.width = leftWidth;
      if (document.documentElement.scrollTop > 115) {
        leftmenu.style.position = 'fixed';
        leftmenu.style.top = '48px';
      } else if (document.getElementsByClassName('ant-layout-sider-children')[0]) {
        leftmenu.style.position = 'static';
        leftmenu.style.overflow = 'hidden';
      }
    }
  };

  newscroll = () => {
    //  添加滚动条
    if (document.getElementsByClassName('ant-table-content')[0]) {
      const docFater = document.getElementsByClassName('ant-table-content')[0];
      const childel = document.createElement('div');
      childel.className = 'scroll_child';
      if (!document.getElementsByClassName('scroll_child')[0]) {
        childel.innerHTML = '<p><P>';
        docFater.appendChild(childel);
      } else if (
        document.getElementsByClassName('ant-table-row-level-0')[0] &&
        document.getElementsByClassName('ant-table-content')[0]
      ) {
        const a = document.getElementsByClassName('ant-table-row-level-0')[0].offsetWidth;
        const b = document.getElementsByClassName('ant-table-content')[0].offsetWidth;
        const scchild = document.getElementsByClassName('scroll_child')[0];
        scchild.style.position = 'fixed';
        scchild.style.bottom = '0px';
        scchild.style.backgroundColor = '#eee';
        scchild.style.width = `${
          document.getElementsByClassName('ant-table-content')[0].offsetWidth
        }px`;
        scchild.style.height = '8px';
        scchild.style.zIndex = '1111';

        scchild.children[0].style.position = 'relative';
        scchild.children[0].style.width = `${b - (a - b)}px`;
        scchild.children[0].style.height = '8px';
        scchild.children[0].style.backgroundColor = '#aaa';
        scchild.children[0].style.zIndex = '1112';
        scchild.children[0].onmousedown = (e) => {
          const x = e.clientX;
          const l = scchild.children[0].offsetLeft;
          window.onmousemove = () => {
            if (e && e.preventDefault) {
              e.preventDefault();
            } else {
              window.event.returnValue = false; // 兼容IE
            }
            const nx = e.clientX;
            let nl = nx - (x - l);
            if (nl <= 0) {
              nl = 0;
            }
            // 获取最大滑动距离
            const max = scchild.offsetWidth - scchild.children[0].offsetWidth;
            if (nl >= max) {
              nl = max;
            }
            scchild.children[0].style.left = `${nl}px`;
            document.getElementsByClassName('ant-table-content')[0].style.overflow = 'hidden';
            document.getElementsByClassName('ant-table-scroll')[0].style.marginLeft = `${-nl}px`;
          };

          window.onmouseup = () => {
            window.onmousemove = null;
            window.onmouseup = null;
          };
        };
      }
    }
  };

  getWindow = (index) => {
    return window.getComputedStyle(
      document.getElementsByClassName('ant-table-row-level-0')[0].children[index]
    ).width;
  };

  // 吸顶
  ceiling = () => {
    if (
      document.getElementsByClassName('ant-table-thead')[0] &&
      window.location.pathname === '/asset/assetList' &&
      document.getElementsByClassName('ant-table-row-level-0')[0]
    ) {
      console.log('22222');

      // 隐藏antd滚动条
      document.getElementsByClassName('ant-table-body')[0].style.overflow = 'hidden';
      document.getElementsByClassName('ant-table-content')[0].style.overflow = 'hidden';

      document.getElementsByClassName('ant-table-content')[0].style.width = window.getComputedStyle(
        document.getElementsByClassName('ant-table-content')[0]
      ).width;

      const childrens = document.getElementsByClassName('ant-table-thead')[0].children[0].children;

      for (let index = 0; index < childrens.length; index++) {
        const item = document.getElementsByClassName('ant-table-column-title')[index].innerHTML;
        if (item === '操作') {
          const docItem = document.getElementsByClassName('ant-table-thead')[1];
          if (document.documentElement.scrollTop > 485) {
            docItem.style.position = 'fixed';
            docItem.style.width = '190px';
            docItem.style.top = '48px';
            docItem.style.right = '36px';
            docItem.style.zIndex = 999;
          } else {
            docItem.style.position = 'relative';
          }
        } else if (item === '') {
          childrens[index].style.width = '';
          // console.log(childrens[index].style.width)
        } else {
          childrens[index].style.width = this.getWindow(index);
        }
      }
      const fdocItem = document.getElementsByClassName('ant-table-thead')[0];
      if (document.documentElement.scrollTop > 485) {
        fdocItem.style.width = '500%';
        fdocItem.style.backgroundColor = '#f0f2f5';
        // fdocItem.children[0].style.width=window.getComputedStyle(document.getElementsByClassName("ant-table-row-level-0")[0]).width
        // fdocItem.style.lineHeight="1"
        fdocItem.style.height = '45px';
        fdocItem.style.paddingRight = '24px';
        fdocItem.style.position = 'fixed';
        fdocItem.style.top = '48px';

        fdocItem.style.width = this.state.tableScrollX;
        // fdocItem.style.zIndex=888
      } else {
        fdocItem.style.position = 'relative';
      }
    }
    this.newscroll();
  };

  // 初始排序状态
  getDirStatus = (isFirst, filterList) => {
    const obj = {};
    if (isFirst) {
      filterList.forEach((item) => {
        obj[item.key] = 'desc';
      });
    } else {
      const {
        query: { dirObj },
      } = this.state;
      filterList.forEach((item) => {
        obj[item] = dirObj[item] ? dirObj[item] : 'desc';
      });
    }
    return obj;
  };

  getMustStatus = (isFirst, filterList) => {
    const obj = {};
    if (isFirst) {
      filterList.forEach((item) => {
        obj[item.key] = true;
      });
    } else {
      const {
        query: { mustObj },
      } = this.state;
      filterList.forEach((item) => {
        obj[item] = mustObj[item] ? mustObj[item] : true;
      });
    }
    return obj;
  };

  getActionStatus = (filterObj) => {
    const statusObj = {};
    Object.keys(filterObj).forEach((item) => {
      if (filterObj[item].length > 0) {
        statusObj[item] = true;
      } else {
        statusObj[item] = false;
      }
    });
    return statusObj;
  };

  getFilterObj = (isFirst, list) => {
    const obj = {};
    if (isFirst) {
      list.forEach((item) => {
        obj[item.key] = [];
      });
    } else {
      const {
        query: { filterObj },
      } = this.state;
      list.forEach((key) => {
        obj[key] = filterObj[key] ? filterObj[key] : [];
      });
    }
    return obj;
  };

  // 重写Finner_ip render
  reWriteRender = (columnList) => {
    const column = columnList.map((item) => {
      if (item.key === 'Fip') {
        item.render = (text, record) => (
          <a
            title={text}
            onClick={() => {
              this.showDrawer('detailFlag', true, record);
            }}
          >
            {text}
          </a>
        );
      }
      return item;
    });
    return column;
  };

  // 管理弹框关闭
  onCancel = (type) => {
    this.setState({ [`${type}ModalVisiable`]: false });
  };

  fetchAssetListData = (newQuery) => {
    const { dispatch } = this.props;
    if (!newQuery) {
      const { query } = this.state;
      const { dir, filterObj, mustObj, page, pageSize, search, sort } = query;
      dispatch({
        type: 'assetList/fetchAssetList',
        payload: { dir, filterObj, mustObj, page, pageSize, search, sort },
      });
    } else {
      const { dir, filterObj, mustObj, page, pageSize, search, sort } = newQuery;
      dispatch({
        type: 'assetList/fetchAssetList',
        payload: { dir, filterObj, mustObj, page, pageSize, search, sort },
      });
    }
  };

  fetchFilterCount = (obj) => {
    const { dispatch } = this.props;
    const { pickedFilterList, columns, query } = this.state;
    const newList = cloneDeep(pickedFilterList);
    const newColumn = cloneDeep(columns);
    const param = obj || query;
    const { dirObj, search, filterObj, mustObj, startTime, endTime } = param;
    dispatch({
      type: 'assetList/fetchFilterCount',
      payload: { dirObj, startTime, endTime, search, filterObj, mustObj },
    })
      .then((res) => {
        newList.forEach((item) => {
          item.list = res[item.key];
        });
        const groupKey = {};
        if (res.Fgroup) {
          res.Fgroup.forEach((item) => {
            groupKey[item.Fgid] = item.Fgroup_name;
          });
        }

        const render = (text) => groupKey[text];
        const index2 = newList.findIndex((filter) => filter.key === 'Fgroup');
        const index3 = newList.findIndex((filter) => filter.key === 'Fsource');

        if (index2 > -1) {
          newList[index2].render = render;
        }
        // Fsource render重写
        const FsourceMap = {};
        if (res.Fsource) {
          res.Fsource.forEach((item) => {
            const sourceArr = [];
            const binaryArr = parseInt(item.key, 10).toString(2).split('').reverse();
            binaryArr.forEach((b, idx) => {
              if (b === '1') {
                // eslint-disable-next-line no-restricted-properties
                const sourceKey = Math.pow(2, idx);
                sourceArr.push(FsourceKeyObj[sourceKey]);
              }
              if (b === '0' && idx === binaryArr.length - 1) {
                sourceArr.push(FsourceKeyObj[0]);
              }
            });
            FsourceMap[item.key] = sourceArr.join('&');
          });
        }

        if (index3 > -1) {
          newList[index3].render = (text) => FsourceMap[text];
        }
        this.setState({ pickedFilterList: newList, columns: newColumn });
      })
      .catch((err) => {
        console.log('err', err);
        message.error(`拉取数据失败：${err.returnMessage}`);
      });
  };

  fetchChartData = () => {
    const { timeRange } = this.state;
    const { dispatch } = this.props;
    const startTime = moment().subtract(timeRange, 'days').valueOf();
    const endTime = moment().valueOf();

    dispatch({
      type: 'assetList/fetchAssetChartData',
      payload: { startTime, endTime },
    });
  };

  // 添加到组
  addGroup = () => {
    const { groupList } = this.state;
    if (groupList.length === 0) {
      message.warn('系统中无自定义分组，请先创建分组。');
      return;
    }
    console.log('groupList', groupList);
    this.setState({ groupVisible: true });
  };

  // 导出
  export = () => {
    const { selectedNum, selectedRowKeys, query, isAllCheck, unCheckedIds } = this.state;
    this.setState({ exportLoading: true });
    const {
      assetList: { assetList },
    } = this.props;
    const isAll = assetList.total === selectedNum;
    const { search, filterObj, mustObj } = query;
    if (selectedRowKeys.length === 0 && selectedNum === 0) {
      message.warn('请选择需要导出的资产');
      return;
    }
    const uri = !isAll ? 'exportPart' : 'exportAll';
    let data;
    if (!isAll) {
      if (isAllCheck) {
        // 点了全部选择并且又去掉了一部分
        data = { search, filterObj, unCheckedIds, mustObj };
      } else {
        // 没有点全部选择，只选了部分几项，以 selectedRowKeys为准
        data = { ids: selectedRowKeys };
      }
    } else {
      data = { search, filterObj, mustObj };
    }
    const options = {
      uri: `/api/asset/${uri}`,
      data,
      filename: `资产${moment().format('YYYYMMDD')}.xlsx`,
    };
    downloadFile(options).finally(() => {
      this.setState({ exportLoading: false });
    });
  };

  //  排序切换
  sortAction = (key, dir) => {
    const {
      query,
      query: { dirObj, filterObj, search, mustObj },
      preQuery: { preFilterObj },
      mode,
    } = this.state;
    const newObj = Object.assign({}, dirObj, { [key]: dir });
    const newQuery = Object.assign({}, query, { dirObj: newObj });
    this.setState({ query: newQuery });
    if (mode) {
      this.fetchFilterCount({ dirObj: newObj, filterObj: preFilterObj, search, mustObj });
    } else {
      this.fetchFilterCount({ dirObj: newObj, filterObj, search, mustObj });
    }
  };

  mustAction = (key, flag) => {
    const {
      query,
      query: { mustObj },
    } = this.state;
    const newObj = Object.assign({}, mustObj, { [key]: flag });
    const newQuery = Object.assign({}, query, { mustObj: newObj });
    this.setState({
      query: newQuery,
      selectedNum: 0,
      isAllCheck: false,
      selectedRowKeys: [],
      selectedRows: [],
      checkAllPage: [],
      unCheckedIds: [],
    });
    // this.fetchAssetListData(newQuery);
  };

  // 筛选条件选择
  checkboxOnchange = (key, data, checked, mode) => {
    // const { dispatch } = this.props;
    const {
      query,
      query: { filterObj, mustObj, dirObj, search },
      filterArr,
    } = this.state;
    const newObj = cloneDeep(filterObj);
    const newMustObj = cloneDeep(mustObj);
    let newFilterArr = cloneDeep(filterArr);
    let label = data.key;
    if (key === 'Fgroup') {
      label = data.Fgid;
    }
    if (checked) {
      newObj[key].push(label);
      newFilterArr.push(`${key}_${label}`);
    } else {
      newObj[key] = newObj[key].filter((item) => item !== label);
      newFilterArr = filterArr.filter((item) => item !== `${key}_${label}`);
    }

    const actionStatus = this.getActionStatus(newObj);
    if (!actionStatus[key]) {
      newMustObj[key] = true;
    }
    const newQuery = Object.assign({}, query, {
      filterObj: newObj,
      mustObj: newMustObj,
      page: 1,
      // pageSize: 20,
      // sort: '',
      // dir: '',
    });
    if (mode) {
      this.setState({ query: newQuery, actionStatus, filterArr: newFilterArr });
      return;
    }
    this.setState(
      {
        query: newQuery,
        actionStatus,
        selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        selectedRows: [],
        checkAllPage: [],
        unCheckedIds: [],
        filterArr: newFilterArr,
      },
      () => {
        this.fetchAssetListData(newQuery);
        this.fetchFilterCount({ dirObj, filterObj: newObj, search, mustObj: newMustObj });
      }
    );
  };

  slelectRowOnSelect = (record, selected) => {
    const { selectedNum, unCheckedIds } = this.state;
    let newKeys = this.state.selectedRows.map((item) => item.Fid);
    // 记录选中又勾掉的id
    const newUnCheckIds = [].concat(unCheckedIds);
    let newSelectedRows;
    if (!selected) {
      // 未选中，加入
      newUnCheckIds.push(record.Fid);
      newKeys = newKeys.filter((item) => item !== record.Fid);
      newSelectedRows = this.state.selectedRows.filter((item) => item.Fid !== record.Fid);
    } else {
      // 选中，去掉
      const idx = newUnCheckIds.findIndex((item) => item === record.Fid);
      if (idx > -1) {
        newUnCheckIds.splice(idx, 1);
      }
      newKeys = newKeys.concat(record.Fid);
      newSelectedRows = this.state.selectedRows.concat(record);
    }
    this.setState({ unCheckedIds: newUnCheckIds });
    if (selectedNum > 0) {
      const newNum = selected ? selectedNum + 1 : selectedNum - 1;
      this.setState({
        selectedNum: newNum,
        selectedRowKeys: newKeys,
        selectedRows: newSelectedRows,
      });
    } else {
      this.setState({
        selectedRowKeys: newKeys,
        selectedRows: newSelectedRows,
      });
    }
  };

  deleteSelect = (key) => {
    const {
      query,
      actionStatus,
      mode,
      query: { filterObj, mustObj, dirObj, search },
      filterArr,
    } = this.state;
    const newObj = cloneDeep(filterObj);
    const newActionStatus = cloneDeep(actionStatus);
    const newMustObj = cloneDeep(mustObj);
    newObj[key] = [];
    if (newObj[key].length === 0) {
      newActionStatus[key] = false;
      newMustObj[key] = true;
    }
    const newFilterArr = filterArr.filter((item) => item.indexOf(key) < 0);
    const newQuery = Object.assign({}, query, { filterObj: newObj, mustObj: newMustObj });
    this.setState(
      {
        query: newQuery,
        actionStatus: newActionStatus,
        selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        selectedRows: [],
        checkAllPage: [],
        unCheckedIds: [],
        filterArr: newFilterArr,
      },
      () => {
        if (!mode) {
          this.fetchAssetListData(newQuery);
          this.fetchFilterCount({ dirObj, filterObj: newObj, search, mustObj: newMustObj });
        }
      }
    );
  };

  // 管理栏筛选后处理
  fieldManage = (list, type) => {
    const fieldKey = type === 'filter' ? 'pickedFilterList' : 'columns';
    let handeldList = list;
    if (type === 'column') {
      const keyList = list.map((item) => item.key);
      handeldList = [];
      keyList.forEach((key) => {
        const obj = this.assetFields.find((item) => item.key === key);
        const column = {
          title: obj.title,
          dataIndex: obj.key,
          key: obj.key,
          sorter: obj.sort,
          render: columnRender(obj),
        };
        handeldList.push(column);
      });
      const bodywidth = document.body.offsetWidth - 306;
      handeldList.map((item) => {
        if (item.title === 'IP') {
          item.width = bodywidth / 12;
        } else if (item.title === 'MAC') {
          item.width = bodywidth / 13;
        } else if (item.title === 'VPCID') {
          item.width = bodywidth / 20;
        } else if (item.title === '今日事件数') {
          item.width = bodywidth / 14;
        } else if (item.title === '类型') {
          item.width = bodywidth / 18;
        } else if (item.title === '来源') {
          item.width = bodywidth / 18;
        } else if (item.title === '注册时间') {
          item.width = bodywidth / 11;
        } else if (item.title === '更新时间') {
          item.width = bodywidth / 11;
        } else if (item.title === '名称') {
          item.width = bodywidth / 14;
        } else if (item.title === '分组') {
          item.width = bodywidth / 16;
        } else if (item.title === '操作') {
          item.width = 200;
        } else {
          item.width = bodywidth / 12;
        }
        return item.width;
      });
      handeldList = this.reWriteRender(handeldList);
      const action =
        ['rw'].indexOf(this.auth) > -1
          ? {
              title: '操作',
              dataIndex: '',
              fixed: 'right',
              key: 'action',
              width: '184px',
              render: (text, record) => {
                const { Fsource } = record;
                return (
                  <div style={{ minWidth: '200px' }}>
                    {Fsource !== 8 && (
                      <a
                        style={{ marginLeft: 10 }}
                        onClick={() => {
                          this.showDrawer('addFlag', true, { ...record });
                        }}
                      >
                        编辑
                      </a>
                    )}
                    <span>
                      <Divider type="vertical" style={{ height: 14, margin: '0 12px' }} />
                      <a
                        style={{ marginLeft: 10 }}
                        onClick={() => {
                          this.delAsset(record.Fid);
                        }}
                      >
                        删除
                      </a>
                    </span>
                    <span>
                      <Divider type="vertical" style={{ height: 14, margin: '0 12px' }} />
                      {/* <span>查看事件</span> */}
                      {this.eventAuth && (
                        <Link
                          target="_blank"
                          to={`/event/safeEvent/alarm?affectedAssets.ipMac=${record.Fip}-${
                            record.Fvpcid
                          }&startTime=${moment()
                            .subtract(90, 'days')
                            .valueOf()}&endTime=${moment().valueOf()}&status=unhandled`}
                        >
                          查看事件
                        </Link>
                      )}
                    </span>
                  </div>
                );
              },
            }
          : {
              title: '操作',
              dataIndex: '',
              fixed: 'right',
              key: 'action',
              width: 202,
              render: (text, record) => (
                <div>
                  {/* <span>查看事件</span> */}
                  {this.eventAuth && (
                    <Link
                      target="_blank"
                      to={`/event/safeEvent/alarm?affectedAssets.ipMac=${record.Fip}-${
                        record.Fvpcid
                      }&startTime=${moment()
                        .subtract(90, 'days')
                        .valueOf()}&endTime=${moment().valueOf()}&status=unhandled`}
                    >
                      查看事件
                    </Link>
                  )}
                </div>
              ),
            };
      handeldList.push(action);
      localStorage.setItem('assetColumnKeys', keyList.join(','));
      this.setState({
        [fieldKey]: handeldList,
        [`${type}ModalVisiable`]: false,
        tableScrollX: handeldList.length * 60,
      });
    } else {
      const { dispatch } = this.props;
      const {
        query,
        query: { search },
        timeRange,
      } = this.state;
      const startTime = moment().subtract(timeRange, 'days').format('YYYY-MM-DD');
      const endTime = moment().format('YYYY-MM-DD');
      const keyList = list.map((item) => item.key);
      const filterObj = this.getFilterObj(false, keyList);
      const filterArr = [];
      const dirObj = this.getDirStatus(false, keyList);
      const mustObj = this.getMustStatus(false, keyList);
      Object.keys(filterObj).forEach((key) => {
        if (filterObj[key].length > 0) {
          filterObj[key].forEach((item) => {
            filterArr.push(`${key}_${item}`);
          });
        }
      });
      const newQuery = Object.assign({}, query, { filterObj, dirObj, mustObj });
      localStorage.setItem('assetFilterKeys', keyList.join(','));
      const { filterDefaultList } = setShowList([], Object.keys(filterObj));
      this.setState(
        {
          [fieldKey]: filterDefaultList,
          [`${type}ModalVisiable`]: false,
          query: newQuery,
          preQuery: { preFilterObj: filterObj, preMustObj: mustObj },
          filterArr,
        },
        () => {
          this.fetchAssetListData(newQuery);
          this.fetchFilterCount({ dirObj, filterObj, search, mustObj });
          dispatch({
            type: 'assetList/fetchAssetChartData',
            payload: {
              startTime: moment(startTime).valueOf(),
              endTime: moment(endTime).valueOf(),
            },
          });
        }
      );
    }
  };

  onSearch = () => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState(
      {
        query: newQuery,
        selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        selectedRows: [],
        checkAllPage: [],
        unCheckedIds: [],
      },
      () => {
        this.fetchAssetListData(newQuery);
      }
    );
  };

  searchOnChange = (e) => {
    const { query } = this.state;
    const { value } = e.target;
    const newQuery = Object.assign({}, query, { search: value });
    this.setState({ query: newQuery });
  };

  // 添加到分组提交函数
  handleOk = () => {
    const { gid, selectedRowKeys, selectedNum, query, isAllCheck, unCheckedIds } = this.state;
    const { search, filterObj, mustObj } = query;
    const {
      assetList: { assetList },
    } = this.props;
    const isAll = assetList.total === selectedNum;
    const { dispatch } = this.props;
    let data;
    if (!isAll) {
      if (isAllCheck) {
        // 点了全部选择并且又去掉了一部分
        data = {
          gid,
          search,
          filterObj,
          mustObj,
          unCheckedIds,
        };
      } else {
        // 没有点全部选择，只选了部分几项，以 selectedRowKeys为准
        data = { gid, Fids: selectedRowKeys };
      }
    } else {
      data = { gid, search, filterObj, mustObj };
    }
    dispatch({ type: 'assetList/addGroup', payload: { isAll, ...data } })
      .then(() => {
        message.success('添加分组成功');
        this.fetchAssetListData();
        this.fetchFilterCount();
        this.setState({
          groupVisible: false,
          selectedRowKeys: [],
          selectedRows: [],
        });
      })
      .catch((err) => {
        message.error(err.returnMessage);
      });
  };

  handleTableChange = (params) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, params);
    this.setState({ query: newQuery });
    this.fetchAssetListData(newQuery);
  };

  handleMenuClick = ({ key: menuKey }) => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      message.warn('请先选择资产');
    }
    const arr = menuKey.split('_');
    const key = arr[0];
    const value = arr[1];
    this.setState({ [key]: value });
  };

  goBack = (key) => {
    console.log('key', key);
    this.setState({ [key]: '' });
  };

  fetchData = () => {
    const {
      query,
      query: { dirObj, filterObj, mustObj, search },
    } = this.state;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({
      query: newQuery,
      preQuery: { preFilterObj: filterObj, preMustObj: mustObj },
      selectedNum: 0,
      isAllCheck: false,
      selectedRowKeys: [],
      selectedRows: [],
      checkAllPage: [],
      unCheckedIds: [],
    });
    this.fetchAssetListData(newQuery);
    this.fetchFilterCount({ dirObj, filterObj, search, mustObj });
  };

  fetchAllData = () => {
    this.fetchAssetListData();
    this.fetchFilterCount();
  };

  filterQuickSelect = (filterValue) => {
    const { filterObj, mustObj, mode } = filterValue;
    const { dispatch } = this.props;
    const {
      query,
      query: { search },
      timeRange,
    } = this.state;
    const startTime = moment().subtract(timeRange, 'days').format('YYYY-MM-DD');
    const endTime = moment().format('YYYY-MM-DD');
    const statefilterObjKeys = Object.keys(query.filterObj);
    const filterObjKeys = Object.keys(filterObj);
    const differenceKeys =
      statefilterObjKeys.length > filterObjKeys.length
        ? difference(statefilterObjKeys, filterObjKeys)
        : difference(filterObjKeys, statefilterObjKeys);
    let dirObj = Object.assign({}, query.dirObj);
    if (differenceKeys.length > 0) {
      const { filterDefaultList } = setShowList([], Object.keys(filterObj));
      this.filterDefaultList = filterDefaultList;
      dirObj = this.getDirStatus(true, filterDefaultList);
      this.setState({ pickedFilterList: filterDefaultList });
    }
    const newFilterArr = [];
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key].length > 0) {
        filterObj[key].forEach((item) => {
          newFilterArr.push(`${key}_${item}`);
        });
      }
    });
    const newQuery = Object.assign({}, query, {
      filterObj,
      dirObj,
      mustObj,
      page: 1,
      // pageSize: 20,
      dir: '',
      sort: '',
    });

    const newPreQuery = {
      preFilterObj: filterObj,
      preMustObj: mustObj,
    };

    this.setState(
      {
        query: newQuery,
        mode,
        selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        selectedRows: [],
        checkAllPage: [],
        unCheckedIds: [],
        filterArr: newFilterArr,
        preQuery: newPreQuery,
      },
      () => {
        this.fetchAssetListData(newQuery);
        this.fetchFilterCount({ dirObj, filterObj, search, mustObj });
        dispatch({
          type: 'assetList/fetchAssetChartData',
          payload: {
            // timeRange,
            startTime: moment(startTime).valueOf(),
            endTime: moment(endTime).valueOf(),
            // filterObj,
          },
        });
      }
    );
  };

  checkAll = () => {
    const {
      assetList: { assetList },
    } = this.props;
    const number = Math.ceil(assetList.total / this.state.query.pageSize);
    const arr = [];
    for (let i = 1; i <= number; i++) {
      arr.push(i);
    }
    this.setState({
      isAllCheck: true,
      selectedRowKeys: assetList.list.map((item) => item.Fid),
      selectedRows: assetList.list,
      selectedNum: assetList.total,
      checkAllPage: arr,
    });
  };

  cancelCheck = () => {
    this.setState({
      isAllCheck: false,
      selectedNum: 0,
      selectedRowKeys: [],
      selectedRows: [],
      checkAllPage: [],
      unCheckedIds: [],
    });
  };

  onSelectAll = (selected, selectedRows, changeRows) => {
    const {
      selectedRowKeys,
      selectedNum,
      checkAllPage,
      query: { page },
      unCheckedIds,
    } = this.state;
    const len = changeRows.length;
    const changeRowKeys = changeRows.map((item) => item.Fid);
    let newUnCheckIds = [].concat(unCheckedIds);
    let num;
    let newKeys;
    let checkAllPageArr = [].concat(checkAllPage);
    let newSelectedRows;
    if (!selected) {
      num = selectedNum - len;
      checkAllPageArr = checkAllPage.filter((item) => item !== page);
      newKeys = difference(selectedRowKeys, changeRowKeys);
      newUnCheckIds = num > 0 ? newUnCheckIds.concat(changeRowKeys) : [];
      // 当全部选择态都勾选掉，其实也相当与不是全量选择。需要设置isCheckAll的状态
      if (num === 0) {
        this.setState({ isAllCheck: false });
      }
      newSelectedRows = this.state.selectedRows.filter(
        (item) => changeRowKeys.indexOf(item.Fid) < 0
      );
    } else {
      const unionArray = union(changeRowKeys, selectedRowKeys);
      newKeys = unionArray;
      num = selectedNum + len > newKeys.length ? selectedNum + len : newKeys.length;
      checkAllPageArr.push(page);
      newUnCheckIds = difference(newUnCheckIds, changeRowKeys);
      newSelectedRows = this.state.selectedRows.concat(changeRows);
    }
    this.setState({
      selectedRowKeys: newKeys,
      selectedRows: newSelectedRows,
      selectedNum: num,
      checkAllPage: checkAllPageArr,
      unCheckedIds: newUnCheckIds,
    });
  };

  // 清空筛选条件
  clearSelect = () => {
    const {
      query,
      query: { filterObj, mustObj, dirObj, search },
      // timeRange,
      mode,
    } = this.state;
    const newFilterObj = cloneDeep(filterObj);
    const newMustObj = cloneDeep(mustObj);
    Object.keys(filterObj).forEach((item) => {
      newFilterObj[item] = [];
      newMustObj[item] = true;
    });
    const actionStatus = this.getActionStatus(newFilterObj);
    const newQuery = Object.assign({}, query, { filterObj: newFilterObj, mustObj: newMustObj });
    this.setState({ query: newQuery, filterArr: [], actionStatus }, () => {
      if (!mode) {
        this.fetchAssetListData(newQuery);
        this.fetchFilterCount({ dirObj, filterObj: newFilterObj, search, mustObj: newMustObj });
      }
    });
  };

  triggerFilterListManger = () => {
    this.setState({
      filterModalVisiable: true,
    });
  };

  showDrawer = (type, flag, record) => {
    this.setState({
      [type]: true,
      drawerTitle: '资产管理',
      drawerVisible: !!flag,
      detailItem: record || {},
      editItem: record,
    });
  };

  closeDrawer = (flag) => {
    this.setState({
      addFlag: false,
      drawerTitle: '',
      drawerVisible: !!flag,
      detailItem: {},
      editItem: {},
    });
  };

  delAsset = (singleId) => {
    const { selectedRowKeys, selectedNum, query, isAllCheck, unCheckedIds, timeRange } = this.state;
    const { search, filterObj, dirObj, page, pageSize, mustObj } = query;
    const {
      assetList: { assetList },
      dispatch,
    } = this.props;
    const self = this;
    let newPage = page;
    const contentReact = <div className={styles.tipsWrapper}>一旦删除不可恢复</div>;
    const startTime = moment().subtract(timeRange, 'days').valueOf();
    const endTime = moment().valueOf();
    if (singleId) {
      if (assetList.list.length === 1) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      const data = { Fids: [singleId] };
      confirm({
        title: '确定删除资产吗？',
        content: contentReact,
        onOk() {
          dispatch({
            type: 'assetList/delAsset',
            payload: { isAll: false, ...data },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState({ query: newQuery }, () => {
                self.fetchAssetListData(newQuery);
                self.fetchFilterCount({ search, filterObj, dirObj, mustObj });
                dispatch({
                  type: 'assetList/fetchAssetChartData',
                  payload: {
                    // timeRange,
                    startTime,
                    endTime,
                    // filterObj,
                  },
                });
              });
            })
            .catch((error) => {
              message.error(error.returnMessage);
            });
        },
        onCancel() {},
      });
    } else {
      const isAll = assetList.total === selectedNum;
      let data;
      if (!isAll) {
        if (isAllCheck) {
          // 点了全部选择并且又去掉了一部分
          data = {
            search,
            filterObj,
            mustObj,
            unCheckedIds,
          };
          const checkedCount = unCheckedIds.length;
          const unCheckedPages = Math.ceil(checkedCount / pageSize);
          newPage = page < unCheckedPages ? page : unCheckedPages;
        } else {
          // 没有点全部选择，只选了部分几项，以 selectedRowKeys为准
          data = { Fids: selectedRowKeys };
          const checkedCount = assetList.total - selectedRowKeys.length;
          const unCheckedPages = Math.ceil(checkedCount / pageSize);
          newPage = page < unCheckedPages ? page : unCheckedPages;
        }
      } else {
        newPage = 1;
        data = { search, filterObj, mustObj };
      }
      confirm({
        title: '确定删除资产吗？',
        content: contentReact,
        onOk() {
          dispatch({
            type: 'assetList/delAsset',
            payload: { isAll, ...data },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState(
                {
                  selectedNum: 0,
                  selectedRowKeys: [],
                  selectedRows: [],
                  checkAllPage: [],
                  unCheckedIds: [],
                  isAllCheck: false,
                  query: newQuery,
                },
                () => {
                  self.fetchAssetListData(newQuery);
                  self.fetchFilterCount({ search, filterObj, dirObj, mustObj });
                  dispatch({
                    type: 'assetList/fetchAssetChartData',
                    payload: {
                      // timeRange,
                      startTime: moment(startTime).valueOf(),
                      endTime: moment(endTime).valueOf(),
                      // filterObj,
                    },
                  });
                }
              );
            })
            .catch((error) => {
              message.error(error.returnMessage);
            });
        },
        onCancel() {},
      });
    }
  };

  // 导入弹窗
  assetImport = () => {
    this.setState({ importVisible: true });
  };

  // 关闭导入
  closeUpload = (type) => {
    console.log('type', type);
    if (type === 'load') {
      this.fetchAssetListData();
      this.fetchFilterCount();
      this.fetchChartData();
    }
    this.setState({ importVisible: false });
  };

  titleRender = () => {
    const {
      filterArr,
      query: { filterObj, mustObj },
      pickedFilterList,
      Fgroup_name,
    } = this.state;
    return (
      <Row className={styles.titleBlock}>
        <Col span={2} className={styles.titleStyle} style={{ height: 65, lineHeight: '65px' }}>
          资产列表
        </Col>
        <Col span={20}>
          <div style={{ width: '100%', display: 'flex' }}>
            {filterArr.length > 0 && (
              <div className={styles.filteredList}>
                {Object.keys(filterObj).map((key) => {
                  filterObj[key] = filterObj[key] || [];
                  const obj = pickedFilterList.find((item) => item.key === key);
                  const mustFlag = mustObj[key];
                  let valueArr = [];
                  if (key === 'Fgroup') {
                    valueArr = filterObj[key].map((item) => obj.render(item));
                    if (valueArr.length === 1 && !valueArr[0]) {
                      valueArr = [Fgroup_name];
                    }
                  } else {
                    valueArr = filterObj[key].map((item) =>
                      assetValueMap[key] ? assetValueMap[key][item] : item
                    );
                  }
                  const valueStr = valueArr.length > 1 ? valueArr.join('+') : valueArr.join('');
                  return (
                    <div key={key}>
                      {filterObj[key].length > 0 && (
                        <div className={styles.selected}>
                          <p className={styles.selectItem}>
                            <span>{obj.title}:</span>
                            {!mustFlag && <span style={{ color: '#f5222d' }}>[非]</span>}
                            <Tooltip placement="bottomLeft" title={valueStr}>
                              <span>{valueStr}</span>
                            </Tooltip>
                          </p>
                          <CloseOutlined
                            className={styles.closeStyle}
                            onClick={() => {
                              this.deleteSelect(key);
                            }} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {filterArr.length > 0 && (
                  <div
                    style={{ lineHeight: '35px' }}
                    onClick={() => {
                      this.clearSelect();
                    }}
                  >
                    <a>清空筛选条件</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
    );
  };

  selctedItemsRender = () => {
    const {
      filterArr,
      query: { filterObj },
      pickedFilterList,
    } = this.state;
    return (
      <div>
        {filterArr.length > 0 && (
          <div className={styles.filteredCon}>
            <div className={styles.filteredList}>
              {Object.keys(filterObj).map((key) => {
                filterObj[key] = filterObj[key] || [];
                const obj = pickedFilterList.find((item) => item.key === key);
                return (
                  <div key={key} className={styles.selectedList}>
                    {filterObj[key].map((select) => {
                      const str = assetValueMap[key] ? assetValueMap[key][select] : select;
                      return (
                        <div key={`${key}_${select}`} className={styles.selectItem}>
                          <span className={styles.selelctName}>
                            {obj.title}:{str}
                          </span>
                          <CloseOutlined
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              this.deleteSelect(key, select);
                            }} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {filterArr.length > 0 && (
              <div
                onClick={() => {
                  this.clearSelect();
                }}
              >
                <a>清空筛选条件</a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  chartRender = () => {
    const {
      assetList: { chartData },
    } = this.props;
    const { chartDisplay } = this.state;
    return (
      <div className={styles.chartBlock}>
        <Row type="flex" justify="space-between">
          <Col span={8}>
            <div>近30天告警资产趋势</div>
          </Col>
          <Col
            span={2}
            onClick={() => {
              this.setState({ chartDisplay: !chartDisplay });
            }}
          >
            <a style={{ marginRight: '5px' }}>{chartDisplay ? '收起图表' : '展开图表'}</a>
            {chartDisplay ? (
              <a>
                <UpOutlined />
              </a>
            ) : (
              <a>
                <DownOutlined />
              </a>
            )}
          </Col>
        </Row>
        <div style={{ display: chartDisplay ? 'block' : 'none' }}>
          <LineChartMul
            data={chartData}
            height={240}
            hasArea
            hasLegend
            color={['key', ['#0A4BCC', '#3CAB98']]}
            transform={(dv) => {
              dv.transform({
                type: 'fold',
                fields: ['资产注册数量', '告警资产数量'],
                key: 'key',
                value: 'value',
              });
            }}
            showToolTip
            legendPosition="right-center"
            scale={{
              time: {
                tickCount: 8,
                formatter: (key) => moment(key).format('YYYY-MM-DD'),
              },
              value: {
                formatter: (value) => {
                  if (value > 1000 * 1000) {
                    return `${(value / (1000 * 1000)).toFixed(1)}M`;
                  }
                  if (value > 1000) {
                    return `${(value / 1000).toFixed(1)}K`;
                  }
                  return value ? `${value}` : 0;
                },
              },
            }}
            offsetY={100}
            offsetX={50}
            padding={[50, 200, 30, 50]}
          />
        </div>
      </div>
    );
  };

  tipsRender = () => {
    const {
      assetList: { registerCount },
    } = this.props;
    const date = localStorage.getItem(`assetMessage`);
    const hasTips = date && date === moment().format('YYYY-MM-DD');
    if (registerCount && !hasTips) {
      return (
        <div className={styles.tipsCon}>
          {!hasTips && (
            <div className={styles.tips}>
              <div>
                <InfoCircleFilled style={{ color: '#40a9ff' }} />
                <span style={{ margin: '0 5px' }}>
                  {this.endTime}新注册{registerCount}个新资产
                </span>
                <a onClick={this.filterNewRegister}>查看详情</a>
              </div>
              <div onClick={this.closeTips}>
                <CloseOutlined />
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // 全局搜索
  globalSearch = (value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { search: value, page: 1 });
    const { filterObj, dirObj, search, mustObj } = newQuery;
    this.setState({ query: newQuery });
    this.fetchAssetListData(newQuery);
    this.fetchFilterCount({ filterObj, dirObj, search, mustObj });
  };

  globalSearchChange = (value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { search: value });
    this.setState({ query: newQuery });
  };

  addAssetSucc = () => {
    const {
      query,
      query: { filterObj, dirObj, search, mustObj },
    } = this.state;
    this.fetchAssetListData(query);
    this.fetchFilterCount({ dirObj, filterObj, search, mustObj });
    this.fetchChartData();
    this.closeDrawer(false);
  };

  filterNewRegister = () => {
    const {
      query,
      query: { filterObj, dirObj, mustObj },
      // timeRange,
    } = this.state;
    const newFilterObj = cloneDeep(filterObj);
    Object.keys(filterObj).forEach((key) => {
      newFilterObj[key] = [];
    });
    const newQuery = Object.assign({}, query, {
      filterObj: newFilterObj,
      search: '',
      page: 0,
      startTime: this.startTime,
      endTime: this.endTime,
    });
    this.setState({ query: newQuery }, () => {
      this.fetchAssetListData(newQuery);
      this.fetchFilterCount({
        dirObj,
        filterObj: newFilterObj,
        search: '',
        startTime: this.startTime,
        endTime: this.endTime,
        mustObj,
      });
    });
  };

  closeTips = () => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { startTime: '', endTime: '' });
    const { dirObj, filterObj, search, startTime, endTime, mustObj } = newQuery;
    localStorage.setItem('assetMessage', moment().format('YYYY-MM-DD'));
    this.setState({ query: newQuery }, () => {
      this.fetchAssetListData(newQuery);
      this.fetchFilterCount({
        dirObj,
        filterObj,
        search,
        startTime,
        endTime,
        mustObj,
      });
    });
  };

  handleResize = (index) => (e, { size }) => {
    this.setState(
      ({ columns }) => {
        const nextColumns = [...columns];
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width,
        };
        return { columns: nextColumns };
      },
      () => {
        this.ceiling();
      }
    );
  };

  changeMode = (mode) => {
    const self = this;
    const { query } = this.state;
    if (mode) {
      Modal.confirm({
        title: '确认切换为简单搜索模式?',
        content: '切换到简单模式将会清除所有过滤条件，是否继续？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          const filterObj = self.getFilterObj(true, self.filterDefaultList);
          const mustObj = self.getMustStatus(true, self.filterDefaultList);
          const actionStatus = self.getActionStatus(filterObj);
          const newQuery = Object.assign(query, {
            page: 1,
            pageSize: parseInt(configSettings.pageSizeOptions[0], 20),
            search: '',
            filterObj: self.getFilterObj(true, self.filterDefaultList),
            dirObj: self.getDirStatus(true, self.filterDefaultList),
            mustObj: self.getMustStatus(true, self.filterDefaultList),
          });
          self.setState(
            {
              mode: !mode,
              query: newQuery,
              preQuery: { preFilterObj: filterObj, preMustObj: mustObj },
              actionStatus,
              filterArr: [],
            },
            () => {
              self.fetchAssetListData();
              self.fetchFilterCount();
              self.fetchChartData();
            }
          );
          bus.emit('clearInput');
        },
        width: '450px',
      });
      return;
    }
    this.setState({
      mode: !mode,
      preQuery: { preFilterObj: query.filterObj, preMustObj: query.mustObj },
    });
  };

  render() {
    const {
      tableLoading,
      assetList: { assetList },
    } = this.props;
    const {
      query,
      preQuery,
      selectedRowKeys,
      pickedFilterList,
      columnModalVisiable,
      filterModalVisiable,
      columns,
      tableScrollX,
      groupVisible,
      // formData,
      // editVisible,
      // showMore,
      groupList,
      // selectedRows,
      // tag,
      selectedNum,
      exportLoading,
      isAllCheck,
      // unCheckedIds,
      // filterArr,
      drawerVisible,
      drawerTitle,
      // detailFlag, // 是否显示详情
      // configFlag, // 是否显示资产配置
      addFlag,
      detailItem,
      // other,
      importVisible,
      editItem,
      actionStatus,
      mode,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onSelect: this.slelectRowOnSelect,
      onSelectAll: this.onSelectAll,
      // onChange: this.slelectRowOnchange,
    };
    // const tags = [];
    // let record = {};
    // if (selectedRows.length === 1) {
    //   record = selectedRows[0];
    // }
    if (this.btnList) {
      this.btnList = this.btnList.map((item) => {
        if (
          item.label === '删除' ||
          item.label === '导出' ||
          item.label === '添加到组' ||
          item.label === '更多操作'
        ) {
          item.disabled = selectedRowKeys.length === 0 && selectedNum === 0;
        }
        if (item.label === '更多操作') {
          item.menu = item.menu.map((menuItem) => {
            if (menuItem.key === 'other_edit') {
              menuItem.disable = selectedRowKeys.length > 1 || (isAllCheck && selectedNum !== 1);
            }
            return menuItem;
          });
        }
        if (item.label === '导出') {
          item.loading = exportLoading;
        }
        return item;
      });
    }
    // 伸缩
    const newColumns = columns.map((col, index) => ({
      ...col,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: this.handleResize(index),
      }),
    }));
    newColumns.push({
      title: '',
      dataIndex: '',
      key: '',
    });
    return (
      <div className="container">
        <CommonPage
          titleName="资产列表"
          query={query}
          preQuery={preQuery}
          actionStatus={actionStatus}
          mode={mode}
          pickedFilterList={pickedFilterList}
          deleteSelect={this.deleteSelect}
          titleRender={this.titleRender}
          timeRangeRender={false}
          selctedItemsRender={false}
          // selctedItemsRender={this.selctedItemsRender}
          selectedFlag
          filterBar={{
            placeholder: '支持IP、资产名称搜索',
            hasManageBtn: true,
            filterPrefix: 'asset',
            globalSearch: this.globalSearch,
            globalSearchChange: this.globalSearchChange,
            checkboxOnchange: this.checkboxOnchange,
            sortAction: this.sortAction,
            mustAction: this.mustAction,
            filterQuickSelect: this.filterQuickSelect,
            triggerFilterListManger: this.triggerFilterListManger,
            changeMode: this.changeMode,
            fetchData: this.fetchData,
            rwAuth: this.auth,
          }}
          // tipsRender={this.tipsRender}
          chartRender={this.chartRender}
          table={{
            wrapperClass: styles.tableBlock,
            operationProps: {
              btnList: this.btnList,
              extra: (
                <div
                  className={styles.settingBlock}
                  onClick={() => {
                    this.localFilterKeys = localStorage.getItem(`assetFilterKeys`);
                    this.localColumnKeys = localStorage.getItem(`assetColumnKeys`);
                    this.columnKey = this.localColumnKeys
                      ? this.localColumnKeys.split(',')
                      : this.defaultColumnKeys;
                    this.filterKey = this.localFilterKeys
                      ? this.localFilterKeys.split(',')
                      : this.defaultFilterListKey;
                    const { filterDefaultList, columnDefaultList } = setShowList(
                      this.columnKey,
                      this.filterKey
                    );
                    this.columnDefaultList = columnDefaultList;
                    this.filterDefaultList = filterDefaultList;
                    this.setState({
                      columnModalVisiable: true,
                    });
                  }}
                >
                  <div className={styles.settingBtn} />
                  <div styles={{ marginLeft: 10 }}>管理</div>
                </div>
              ),
            },
            tableProps: {
              showFlag: true,
              rowKey: 'Fid',
              tableScrollX,
              rowSelection,
              loading: tableLoading,
              columns: newColumns,
              components: this.components,
              page: query.page,
              pageSize: query.pageSize,
              sort: query.sort,
              dir: query.dir,
              data: { total: assetList.total, list: assetList.list },
              handleTableChange: this.handleTableChange,
              handleResize: this.handleResize,
              checkAllBlock: {
                selectedNum,
                checkAll: this.checkAll,
                cancelCheck: this.cancelCheck,
              },
            },
          }}
        />

        <AssetImport
          visible={importVisible}
          accept=".xls,.xlsx"
          cancel={this.closeUpload}
          btntext="上传.xls,.xlsx文件"
        />
        <ItemManageModal
          title="状态栏管理"
          type="filter"
          visible={filterModalVisiable}
          allList={this.assetFields.filter((item) => notInFilterKey.indexOf(item.key) < 0)}
          pickedList={pickedFilterList}
          fieldManage={this.fieldManage}
          onCancel={this.onCancel}
        />
        <ItemManageModal
          title="显示列管理"
          type="column"
          visible={columnModalVisiable}
          allList={this.assetFields}
          pickedList={this.columnDefaultList}
          fieldManage={this.fieldManage}
          onCancel={this.onCancel}
        />
        {groupList.length > 0 && (
          <Modal
            title="选择资产组"
            visible={groupVisible}
            onOk={this.handleOk}
            onCancel={() => {
              this.setState({ groupVisible: false });
            }}
          >
            <span>资产组:</span>
            <Select
              style={{ width: 200, marginLeft: 10 }}
              defaultValue={groupList[0].Fgid}
              onChange={(value) => {
                this.setState({ gid: value });
              }}
            >
              {groupList.map((item) => (
                <Option key={item.Fgid} value={item.Fgid}>
                  {item.Fgroup_name}
                </Option>
              ))}
            </Select>
          </Modal>
        )}
        {addFlag && (
          <Drawer
            destroyOnClose
            title={drawerTitle}
            placement="right"
            width={500}
            closable
            onClose={() => {
              this.closeDrawer(false);
            }}
            visible={drawerVisible}
          >
            <AddAssetForm
              onCancel={() => {
                this.closeDrawer(false);
              }}
              editItem={editItem}
              success={this.addAssetSucc}
            />
          </Drawer>
        )}
        {!addFlag && (
          <AssetDetail
            Fasset_id={detailItem.Fasset_id}
            isvisible={drawerVisible}
            auth={this.auth}
            onClose={() => {
              this.closeDrawer(false);
            }}
          />
        )}
      </div>
    );
  }
}

export default connect(({ global, assetList, loading }) => ({
  hasVpc: global.hasVpc,
  assetList,
  tableLoading: loading.effects['assetList/fetchAssetList'],
}))(AssetList);
