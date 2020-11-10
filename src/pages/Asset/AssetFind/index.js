import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import cloneDeep from 'lodash/cloneDeep';
import { CloseOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, message, Modal, Divider, Drawer, Switch, Select, Tooltip, Tag } from 'antd';

import { Resizable } from 'react-resizable';
import moment from 'moment';
import bus from '@/utils/event';
import union from 'lodash/union';
import difference from 'lodash/difference';
import configSettings from '../../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
import BatchRegister from './components/BatchRegister';
import AddAssetForm from '../AssetList/components/AddAsset';
import Segment from './components/Segment';
import ItemManageModal from '@/components/ItemManageModal';
import { LineChartMul } from '@/components/Charts';
import CommonPage from '@/components/CommonPage';
import Detail from './components/Detail';
import AssetDetail from '../AssetDetail';
import TimeRangePicker from '@/components/TimeRangePicker';
import downloadFile from '@/tools/download';
import styles from './index.less';

import {
  assetFields,
  defaultFilterListKey,
  defaultColumnKeys,
  setShowList,
  columnRender,
  notInFilterKey,
} from './FieldNameList';

const format = 'YYYY-MM-DD HH:mm:ss';
const { assetValueMap } = configSettings;
// const FsourceKeyObj = assetValueMap.Fsource;

// 自动刷新时间
// const AUTO_REFRESH_TIMEOUT = 60;

const { confirm } = Modal;
const { Option } = Select;
const options = [
  {
    name: '今天',
    value: '今天',
  },
  {
    name: '近7天',
    value: 7,
  },
  {
    name: '近30天',
    value: 30,
  },
  {
    name: '近90天',
    value: 90,
  },
  {
    name: '自定义',
    value: '自定义',
  },
];
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

const timeMap = [
  { key: 'Finsert_time', value: '新发现时间' },
  { key: 'Fupdate_time', value: '活跃时间' },
];

const titleMap = {
  configFlag: '网段配置',
  addFlag: '注册资产',
  detailFlag: '资产详情',
};

@connect(({ global, assetFind, loading, asset }) => ({
  assetFind,
  asset,
  hasVpc: global.hasVpc,
  loading: loading.effects['assetFind/fetchList'],
}))
class AssetFind extends Component {
  constructor(props) {
    super(props);
    this.auth = getAuth('/asset/assetfind');
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
      ? localStorage.getItem(`assetfindFilterKeys`)
      : localStorage.getItem(`assetfindFilterKeys`) &&
        localStorage
          .getItem(`assetfindFilterKeys`)
          .split(',')
          .filter((item) => item !== 'Fvpcid')
          .join(',');
    this.localColumnKeys = props.hasVpc
      ? localStorage.getItem(`assetfindColumnKeys`)
      : localStorage.getItem(`assetfindColumnKeys`) &&
        localStorage
          .getItem(`assetfindColumnKeys`)
          .split(',')
          .filter((item) => item !== 'Fvpcid')
          .join(',');
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

    // const filterObj = this.getFilterObj(true, filterList);
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 20),
        sort: 'Finsert_time',
        dir: 'desc',
        keyword: '',
        filterObj, // 保存每个子分类的checkbox选中状态
        dirObj: this.getDirStatus(true, filterDefaultList), // 初始排序状态
        mustObj: this.getMustStatus(true, filterDefaultList),
        startTime: moment().subtract(7, 'day').format(format),
        endTime: moment().format(format),
        timeType: 'Finsert_time',
      },
      filterArr: [],
      actionStatus: this.getActionStatus(filterObj),
      pickedFilterList: filterDefaultList,
      columnModalVisiable: false,
      filterModalVisiable: false, // 筛选栏管理modal显示状态
      columns:
        this.auth === 'rw'
          ? newColumnDefaultList.concat([
              {
                title: '操作',
                dataIndex: '',
                key: 'action',
                fixed: 'right',
                width: 100,
                render: (text, record) => (
                  <div className="action" style={{ minWidth: '200px' }}>
                    {record.Fis_registered === 0 ? (
                      <a
                        onClick={() => {
                          this.showDrawer('addFlag', true, record);
                          // this.registerAsset(record.Fid);
                        }}
                      >
                        注册
                      </a>
                    ) : (
                      <span style={{ marginRight: '13px' }}>已注册</span>
                    )}
                    <span>
                      {record.Fis_registered === 0 && (
                        <Divider type="vertical" style={{ height: 14, margin: '0 12px' }} />
                      )}
                      <a
                        // style={{ marginLeft: 10 }}
                        onClick={() => {
                          this.delAsset(record.Fid);
                        }}
                      >
                        删除
                      </a>
                    </span>
                  </div>
                ),
              },
            ])
          : newColumnDefaultList,
      tableScrollX: columnDefaultList.length * 60, // 动态增加显示列，需要增加scrollX
      mode: true,
      selectedRowKeys: [],
      selectedRows: [], // 已选择的行
      selectedNum: 0, // 全量选择数量
      isAllCheck: false,
      checkAllPage: [], // 记录全选的页数
      unCheckedIds: [], // 没选中的id
      timeRange: 7, // 默认时间范围
      timeRangeReset: false,
      exportLoading: false,
      // checkAllPage: [], // 记录全选的页数
      drawerVisible: false, // 右侧抽屉显示
      drawerTitle: '', // 右侧抽屉标题
      addFlag: false, // 注册资产配置
      configFlag: false, // 网段配置
      /** 是否显示资产详情 */
      detailFlag: false,
      editItem: {}, // 新建编辑资产信息
      registerVisible: false,
      chartDisplay: true,
      // refreshOpen: localStorage.getItem('assetFind_auto_refresh'),
      preQuery: {
        // 保存点击搜索前的
        preFilterObj: this.getFilterObj(true, filterDefaultList),
        preMustObj: this.getMustStatus(true, filterDefaultList),
      },
    };
    // this.assetFindTimer = null;

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
          label: '批量注册',
          type: 'primary',
          color: 'blue',
          func: () => {
            this.beginBatchRegister();
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
          label: '导出',
          type: 'primary',
          func: () => {
            this.export();
          },
        },
      ]);
    }
  }

  componentWillMount() {
    const { columns } = this.state;
    const bodywidth = document.body.offsetWidth - 306;
    columns.map((item) => {
      if (item.title === 'MAC') {
        item.width = bodywidth / 9;
      } else if (item.title === 'VPCID') {
        item.width = bodywidth / 20;
      } else if (item.title === '今日事件数') {
        item.width = bodywidth / 14;
      } else if (item.title === 'IP') {
        item.width = bodywidth / 9;
      } else if (item.title === '发现时间') {
        item.width = bodywidth / 8;
      } else if (item.title === '更新时间') {
        item.width = bodywidth / 8;
      } else if (item.title === '操作') {
        item.width = 100;
      } else {
        item.width = bodywidth / 11;
      }
      return item.width;
    });
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    this.fetchAssetListData();
    this.fetchFilterCount();
    this.fetchChartData();
    dispatch({
      type: 'assetFind/fetchStatus',
    });
    // }
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
        window.location.pathname === '/asset/assetfind' &&
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
              docItem.children[0].children[0].style.width = '100px';
              docItem.style.position = 'fixed';
              docItem.style.width = '105px';
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
  };

  componentWillReceiveProps(nextProps) {
    const {
      assetFind: { assetFindList },
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
      const selectedRows = assetFindList.list.filter((item) => !unCheckedIds.includes(item.Fid));
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
          const newe = e || event;
          const x = newe.clientX;
          const l = scchild.children[0].offsetLeft;
          window.onmousemove = (e) => {
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

          window.onmouseup = (e) => {
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
      window.location.pathname === '/asset/assetfind' &&
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
            docItem.style.width = '105px';
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
      window.location.pathname === '/asset/assetfind' &&
      document.getElementsByClassName('ant-table-row-level-0')[0]
    ) {
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
            docItem.style.width = '105px';
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

  // 重写Fip render
  reWriteRender = (columnList) => {
    const column = columnList.map((item) => {
      if (item.key === 'Fip') {
        item.render = (text, record) => (
          <a
            title={text}
            onClick={() => {
              // 如果是已经注册过的
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

  fetchData = () => {
    const {
      query,
      query: { filterObj, mustObj },
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
    this.fetchFilterCount(newQuery);
    this.fetchChartData(newQuery);
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

  // 模式切换
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
            keyword: '',
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

  // 初始排序状态
  getDirStatus = (isFirst, list) => {
    const obj = {};
    if (isFirst) {
      list.forEach((item) => {
        obj[item.key] = 'desc';
      });
    } else {
      const {
        query: { dirObj },
      } = this.state;
      list.forEach((item) => {
        obj[item] = dirObj[item] ? dirObj[item] : 'desc';
      });
    }
    return obj;
  };

  getMustStatus = (isFirst, list) => {
    const obj = {};
    if (isFirst) {
      list.forEach((item) => {
        obj[item.key] = true;
      });
    } else {
      const {
        query: { mustObj },
      } = this.state;
      list.forEach((item) => {
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

  // 导出
  export = () => {
    const { selectedNum, selectedRowKeys, query, isAllCheck, unCheckedIds } = this.state;
    this.setState({ exportLoading: true });
    const {
      assetFind: { assetFindList },
    } = this.props;
    const isAll = assetFindList.recordsTotal === selectedNum;
    const { keyword, filterObj, startTime, endTime, mustObj, timeType } = query;
    if (selectedRowKeys.length === 0 && selectedNum === 0) {
      message.warn('请选择需要导出的资产');
      return;
    }
    const uri = !isAll ? 'exportPart' : 'exportAll';
    let data;
    if (!isAll) {
      if (isAllCheck) {
        // 点了全部选择并且又去掉了一部分
        data = { keyword, filterObj, unCheckedIds, startTime, endTime, mustObj, timeType };
      } else {
        // 没有点全部选择，只选了部分几项，以 selectedRowKeys为准
        data = { ids: selectedRowKeys };
      }
    } else {
      data = { keyword, filterObj, startTime, endTime, mustObj, timeType };
    }
    const option = {
      uri: `/api/assetfind/${uri}`,
      data,
      filename: `新发现资产${moment().format('YYYYMMDD')}.xls`,
    };
    downloadFile(option).finally(() => {
      this.setState({ exportLoading: false });
    });
  };

  fetchAssetListData = (newQuery) => {
    const { dispatch } = this.props;
    const { query } = this.state;
    const param = newQuery || query;
    const {
      dir,
      filterObj,
      page,
      pageSize,
      keyword,
      sort,
      startTime,
      endTime,
      mustObj,
      timeType,
    } = param;
    dispatch({
      type: 'assetFind/fetchList',
      payload: {
        dir,
        filterObj,
        page,
        pageSize,
        keyword,
        sort,
        startTime,
        endTime,
        mustObj,
        timeType,
      },
    });
  };

  fetchFilterCount = (newQuery) => {
    const { dispatch } = this.props;
    const { query, pickedFilterList } = this.state;
    const param = newQuery || query;
    const { dirObj, startTime, endTime, keyword, filterObj, mustObj, timeType } = param;

    const newList = cloneDeep(pickedFilterList);

    dispatch({
      type: 'assetFind/fetchFilterCount',
      payload: { dirObj, startTime, endTime, keyword, filterObj, mustObj, timeType },
    })
      .then((res) => {
        newList.forEach((item) => {
          item.list = res[item.key].filter((resItem) => resItem.key !== '');
        });
        this.setState({ pickedFilterList: newList });
      })
      .catch((err) => {
        message.error(`拉取数据失败：${err.msg}`);
      });
  };

  fetchChartData = (newQuery) => {
    const { dispatch } = this.props;
    const { query } = this.state;
    const param = newQuery || query;
    const { filterObj, keyword, startTime, endTime, mustObj } = param;
    dispatch({
      type: 'assetFind/fetchChartData',
      payload: { filterObj, keyword, startTime, endTime, mustObj },
    });
  };

  // 批量注册弹窗
  beginBatchRegister = () => {
    // this.registerAsset();
    this.setState({ registerVisible: true });
  };

  registerAssetSucc = () => {
    const {
      query,
      query: { keyword, filterObj, dirObj, startTime, endTime, mustObj, timeType },
    } = this.state;
    this.fetchAssetListData(query);
    this.fetchFilterCount({ keyword, filterObj, dirObj, startTime, endTime, mustObj, timeType });
    this.fetchChartData({ keyword, filterObj, mustObj, startTime, endTime });
    this.closeDrawer(false);
  };

  // 管理弹框关闭
  onCancel = (type) => {
    this.setState({ [`${type}ModalVisiable`]: false });
  };

  // 关闭批量注册弹窗
  endBatchRegister = () => {
    this.setState({ registerVisible: false });
  };

  delAsset = (singleId) => {
    const { selectedRowKeys, selectedNum, query, isAllCheck, unCheckedIds } = this.state;
    const {
      keyword,
      filterObj,
      dirObj,
      mustObj,
      page,
      pageSize,
      startTime,
      endTime,
      timeType,
    } = query;
    const {
      assetFind: { assetFindList },
      dispatch,
    } = this.props;
    const self = this;
    let newPage = page;
    const contentReact = <div className={styles.tipsWrapper}>删除后该资产将无法被发现</div>;
    if (singleId) {
      if (assetFindList.list.length === 1) {
        newPage = page - 1 < 1 ? 1 : page - 1;
      }
      const data = { Fids: [singleId] };
      confirm({
        title: '确定删除资产吗？',
        content: contentReact,
        onOk() {
          dispatch({
            type: 'assetFind/delAsset',
            payload: { isAll: false, ...data },
          })
            .then(() => {
              const newQuery = Object.assign({}, query, { page: newPage });
              message.success('删除成功');
              self.setState({ query: newQuery }, () => {
                self.fetchAssetListData(newQuery);
                self.fetchFilterCount({
                  keyword,
                  filterObj,
                  dirObj,
                  startTime,
                  endTime,
                  mustObj,
                  timeType,
                });
                self.fetchChartData({ keyword, filterObj, mustObj, startTime, endTime });
              });
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() {},
      });
    } else {
      const isAll = assetFindList.recordsTotal === selectedNum;
      let data;
      if (!isAll) {
        if (isAllCheck) {
          // 点了全部选择并且又去掉了一部分
          data = {
            keyword,
            filterObj,
            mustObj,
            unCheckedIds,
            startTime,
            endTime,
            timeType,
          };
          const checkedCount = unCheckedIds.length;
          const unCheckedPages = Math.ceil(checkedCount / pageSize);
          newPage = page < unCheckedPages ? page : unCheckedPages;
        } else {
          // 没有点全部选择，只选了部分几项，以 selectedRowKeys为准
          data = { Fids: selectedRowKeys };
          const checkedCount = assetFindList.recordsTotal - selectedRowKeys.length;
          const unCheckedPages = Math.ceil(checkedCount / pageSize);
          newPage = page < unCheckedPages ? page : unCheckedPages;
        }
      } else {
        newPage = 1;
        data = { keyword, filterObj, mustObj, startTime, endTime, timeType };
      }
      confirm({
        title: '确定删除资产吗？',
        content: contentReact,
        onOk() {
          dispatch({
            type: 'assetFind/delAsset',
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
                  self.fetchFilterCount({
                    keyword,
                    filterObj,
                    dirObj,
                    startTime,
                    endTime,
                    mustObj,
                    timeType,
                  });
                  self.fetchChartData({ filterObj, mustObj, keyword, startTime, endTime });
                }
              );
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() {},
      });
    }
  };

  selectRowOnchange = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys,
    });
  };

  handleTableChange = (params) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, params);
    this.setState({ query: newQuery });
    this.fetchAssetListData(newQuery);
    this.fetchFilterCount(newQuery);
    this.fetchChartData(newQuery);
  };

  onSearchFn = (value) => {
    const { query } = this.state;
    const { dispatch } = this.props;
    const newQuery = { ...query, page: 1, keyword: value };
    this.setState({ query: newQuery });
    dispatch({
      type: 'assetFind/fetchList',
      payload: newQuery,
    });
  };

  chartRender = () => {
    const {
      assetFind: { chartData },
    } = this.props;
    const { chartDisplay } = this.state;
    return (
      <div className={styles.chartBlock}>
        <Row type="flex" justify="space-between">
          <Col span={8}>
            <span>新发现资产趋势图</span>
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
            height={230}
            hasArea
            hasLegend
            color={['key', ['#0A4BCC', '#3CAB98']]}
            transform={(dv) => {
              dv.transform({
                type: 'fold',
                fields: ['新发现资产', '新注册资产'],
                key: 'key',
                value: 'value',
              });
            }}
            showToolTip
            legendPosition="bottom"
            padding={[22, 40, 60, 50]}
          />
        </div>
      </div>
    );
  };

  changeTimeType = (value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { timeType: value });
    this.setState({ query: newQuery });
    this.fetchAssetListData(newQuery);
    this.fetchFilterCount(newQuery);
  };

  titleRender = () => {
    const {
      query: { filterObj, mustObj, timeType },
      pickedFilterList,
      filterArr,
    } = this.state;
    const {
      assetFind: { status },
    } = this.props;
    return (
      <Row className={styles.titleBlock}>
        <Col span={2} style={{ height: 64, lineHeight: '64px' }}>
          <span className={styles.titleStyle}>资产发现</span>
        </Col>
        <Col span={2}>
          <Select style={{ width: '95%' }} value={timeType} onChange={this.changeTimeType}>
            {timeMap.map((item) => (
              <Option key={item.key} value={item.key}>
                {item.value}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={2}>
          <TimeRangePicker
            customOptions={options}
            timeRange={this.state.timeRange}
            startTime={this.state.query.startTime}
            endTime={this.state.query.endTime}
            reset={this.state.timeRangeReset}
            timePickerOnchange={this.timePickerOnchange}
          />
        </Col>
        <Col span={15} className={styles.selectedList}>
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
                  } else if (key === 'Fsource') {
                    valueArr = filterObj[key].map(
                      (item) => item
                      // handleFsource(item) ? handleFsource(item) : item,
                    );
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
                            {/* <span>{obj.title}:</span> */}
                            {!mustFlag && <span style={{ color: '#f5222d' }}>[非]</span>}
                            <Tooltip placement="bottomLeft" title={valueStr}>
                              <Tag>{valueStr}</Tag>
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
        <Col span={1}>
          <Switch
            checked={status === 'on'}
            checkedChildren="开"
            unCheckedChildren="关"
            onChange={() => {
              this.changeState(status);
            }}
          />
          {/* checked={} */}
        </Col>
        <Col
          span={2}
          // offset={18}
          className={styles.settingBlock}
          style={{ marginRight: '10px', width: '100px' }}
          onClick={async () => {
            const { dispatch } = this.props;
            // 1. 网段配置时必须先添加探针，如果没有添加探针，则网段配置页面不可用。
            const listNode = await dispatch({ type: 'segment/fetchListNode' });
            if (Array.isArray(listNode) && listNode.length > 0) {
              this.showDrawer('configFlag', true);
            } else {
              message.warn('网段配置时必须先添加探针, 系统设置》数据接入》流量源接入 进行添加');
            }
          }}
        >
          <span className={styles.settingBtn} />
          <span styles={{ marginLeft: 10 }}>网段配置</span>
        </Col>
      </Row>
    );
  };

  timePickerOnchange = (arr) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, {
      startTime: moment(arr[0]).format(format),
      endTime: moment(arr[1]).format(format),
      page: 1,
    });
    this.setState(
      {
        query: Object.assign({}, query, {
          startTime: moment(arr[0]).format(format),
          endTime: moment(arr[1]).format(format),
        }),
        preQuery: { preFilterObj: query.filterObj, preMustObj: query.mustObj },
        timeRange: arr[2],
        selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        selectedRows: [],
        checkAllPage: [],
        unCheckedIds: [],
      },
      () => {
        this.fetchAssetListData(newQuery);
        this.fetchFilterCount(newQuery);
        this.fetchChartData(newQuery);
      }
    );
  };

  // 全局搜索
  globalSearch = (value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { keyword: value, page: 1 });
    const { filterObj, dirObj, keyword, startTime, endTime, mustObj, timeType } = newQuery;
    this.setState({ query: newQuery });
    this.fetchAssetListData(newQuery);
    this.fetchFilterCount({ filterObj, dirObj, keyword, startTime, endTime, mustObj, timeType });
    this.fetchChartData({ filterObj, keyword, startTime, endTime, mustObj });
  };

  // 筛选条件选择
  checkboxOnchange = (key, data, checked, mode) => {
    const {
      query,
      query: { filterObj, mustObj, dirObj, keyword, timeType },
      // timeRange,
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
      // startTime: moment()
      //   .subtract(timeRange, 'days')
      //   .format(format),
      // endTime: moment().format(format),
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
        this.fetchFilterCount({
          dirObj,
          filterObj: newObj,
          keyword,
          startTime: newQuery.startTime,
          endTime: newQuery.endTime,
          mustObj: newMustObj,
          timeType,
        });
        this.fetchChartData({
          filterObj: newObj,
          dirObj,
          keyword,
          startTime: newQuery.startTime,
          endTime: newQuery.endTime,
          mustObj: newMustObj,
        });
      }
    );
  };

  //  排序切换
  sortAction = (key, dir) => {
    const {
      query,
      query: { dirObj, filterObj, mustObj, keyword, startTime, endTime, timeType },
      preQuery: { preFilterObj },
      mode,
    } = this.state;
    const newObj = Object.assign({}, dirObj, { [key]: dir });
    const newQuery = Object.assign({}, query, { dirObj: newObj });
    this.setState({ query: newQuery });
    if (mode) {
      this.fetchFilterCount({
        dirObj: newObj,
        filterObj: preFilterObj,
        keyword,
        startTime,
        endTime,
        mustObj,
        timeType,
      });
      this.fetchChartData({ filterObj: preFilterObj, mustObj, keyword, startTime, endTime });
    } else {
      this.fetchFilterCount({
        dirObj: newObj,
        filterObj,
        keyword,
        startTime,
        endTime,
        mustObj,
        timeType,
      });
      this.fetchChartData({ filterObj, mustObj, keyword, startTime, endTime });
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
    // this.fetchFilterCount({ mustObj: newObj, filterObj, keyword, startTime, endTime });
    // this.fetchChartData({ filterObj, keyword, startTime, endTime, mustObj: newObj });
  };

  deleteSelect = (key) => {
    const {
      query,
      actionStatus,
      mode,
      query: { filterObj, dirObj, keyword, startTime, endTime, mustObj, timeType },
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
          this.fetchChartData({
            filterObj: newObj,
            keyword,
            startTime,
            endTime,
            mustObj: newMustObj,
          });
          this.fetchFilterCount({
            dirObj,
            filterObj: newObj,
            keyword,
            startTime,
            endTime,
            mustObj: newMustObj,
            timeType,
          });
        }
      }
    );
  };

  // 清空筛选条件
  clearSelect = () => {
    const {
      query,
      query: { filterObj, dirObj, keyword, startTime, endTime, mustObj, timeType },
      mode,
    } = this.state;
    const newFilterObj = cloneDeep(filterObj);
    const newMustObj = cloneDeep(mustObj);
    Object.keys(filterObj).forEach((item) => {
      newFilterObj[item] = [];
    });
    const actionStatus = this.getActionStatus(newFilterObj);
    const newQuery = Object.assign({}, query, { filterObj: newFilterObj, mustObj: newMustObj });
    this.setState({ query: newQuery, filterArr: [], actionStatus }, () => {
      if (!mode) {
        this.fetchAssetListData(newQuery);
        this.fetchFilterCount({
          dirObj,
          filterObj: newFilterObj,
          keyword,
          startTime,
          endTime,
          mustObj,
          timeType,
        });
        this.fetchChartData({
          filterObj: newFilterObj,
          keyword,
          startTime,
          endTime,
          mustObj: newMustObj,
        });
      }
    });
  };

  filterQuickSelect = (filterValue) => {
    const { filterObj, mustObj, startTime, endTime, mode, timeType } = filterValue;
    const {
      query,
      query: { keyword },
      // timeRange,
    } = this.state;
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
    // const newObj = cloneDeep(filterObj);
    // const newMustObj = cloneDeep(mustObj);

    const newFilterArr = [];
    const actionStatus = this.getActionStatus(filterObj);

    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key].length > 0) {
        filterObj[key].forEach((item) => {
          newFilterArr.push(`${key}_${item}`);
        });
      }
    });
    const newQuery = Object.assign({}, query, {
      filterObj,
      page: 1,
      dir: '',
      sort: '',
      startTime,
      endTime,
      mustObj,
      timeType,
    });

    const newPreQuery = {
      preFilterObj: filterObj,
      preMustObj: mustObj,
    };
    const diff = moment(endTime).diff(moment(startTime), 'days');
    let range = diff;
    if ([7, 30, 90].indexOf(diff) < 0) {
      if (startTime === moment().format('YYYY-MM-DD 00:00:00')) {
        range = '今天';
      } else {
        range = `${moment(startTime).format('YYYY-MM-DD HH:mm:ss')} 至 ${moment(endTime).format(
          'YYYY-MM-DD HH:mm:ss'
        )}`;
      }
    }
    this.setState(
      {
        query: newQuery,
        timeRange: range,
        actionStatus,
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
        this.fetchFilterCount({
          dirObj,
          filterObj,
          keyword,
          startTime,
          endTime,
          mustObj,
          timeType,
        });
        this.fetchChartData({ filterObj, keyword, startTime, endTime, mustObj });
      }
    );
  };

  triggerFilterListManger = () => {
    this.setState({
      filterModalVisiable: true,
    });
  };

  showDrawer = (type, flag, record) => {
    this.setState({
      [type]: true,
      drawerTitle: titleMap[type],
      drawerVisible: !!flag,
      editItem: record,
    });
  };

  closeDrawer = (flag) => {
    this.setState({
      configFlag: false,
      addFlag: false,
      detailFlag: false,
      drawerTitle: '',
      drawerVisible: !!flag,
      editItem: {},
    });
  };

  batchRegisterSuccess = () => {
    const {
      query,
      query: { filterObj, mustObj, dirObj, keyword, startTime, endTime, timeType },
    } = this.state;
    this.fetchAssetListData(query);
    this.fetchFilterCount({ dirObj, filterObj, keyword, startTime, endTime, mustObj, timeType });
    this.fetchChartData({ filterObj, mustObj, keyword, startTime, endTime });
    // this.closeDrawer(false);
    this.endBatchRegister();
    this.setState({
      selectedNum: 0,
      selectedRowKeys: [],
      selectedRows: [],
      checkAllPage: [],
      unCheckedIds: [],
      isAllCheck: false,
    });
  };

  slelectRowOnSelect = (record, selected) => {
    const { selectedNum, unCheckedIds } = this.state;
    // console.log('slelectRowOnSelect', record, selected, selectedRows);
    // const newKeys = selectedRows.map(item => item.Funiqid);
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

  checkAll = () => {
    const {
      assetFind: { assetFindList },
    } = this.props;
    const number = Math.ceil(assetFindList.recordsTotal / this.state.query.pageSize);
    const arr = [];
    for (let i = 1; i <= number; i++) {
      arr.push(i);
    }
    this.setState({
      isAllCheck: true,
      selectedRowKeys: assetFindList.list.map((item) => item.Fid),
      selectedRows: assetFindList.list,
      selectedNum: assetFindList.recordsTotal,
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

  changeState = (status) => {
    const { dispatch } = this.props;
    const newStatus = status === 'on' ? 'off' : 'on';
    dispatch({
      type: 'assetFind/changeStatus',
      payload: { status: newStatus },
    })
      .then(() => {
        dispatch({
          type: 'assetFind/fetchStatus',
        });
      })
      .catch((error) => {
        message.error(`${error.msg}`);
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
          width: 140,
          sorter: obj.sort,
          render: columnRender(obj),
        };
        handeldList.push(column);
        const bodywidth = document.body.offsetWidth - 306;
        handeldList.map((item) => {
          if (item.title === 'MAC') {
            item.width = bodywidth / 9;
          } else if (item.title === 'VPCID') {
            item.width = bodywidth / 20;
          } else if (item.title === '今日事件数') {
            item.width = bodywidth / 14;
          } else if (item.title === 'IP') {
            item.width = bodywidth / 9;
          } else if (item.title === '发现时间') {
            item.width = bodywidth / 8;
          } else if (item.title === '更新时间') {
            item.width = bodywidth / 8;
          } else if (item.title === '操作') {
            item.width = 100;
          } else {
            item.width = bodywidth / 11;
          }
          return item.width;
        });
      });
      handeldList = this.reWriteRender(handeldList);
      const action = {
        title: '操作',
        dataIndex: '',
        key: 'action',
        fixed: 'right',
        width: 100,
        render: (text, record) => (
          <div className="action" style={{ minWidth: '200px' }}>
            {record.Fis_registered === 0 && (
              <a
                onClick={() => {
                  this.showDrawer('addFlag', true, record);
                  // this.registerAsset(record.Fid);
                }}
              >
                注册
              </a>
            )}
            <span>
              {record.Fis_registered === 0 && (
                <Divider type="vertical" style={{ height: 14, margin: '0 12px' }} />
              )}
              <a
                style={{ marginLeft: 10 }}
                onClick={() => {
                  this.delAsset(record.Fid);
                }}
              >
                删除
              </a>
            </span>
          </div>
        ),
      };
      if (this.auth === 'rw') {
        handeldList.push(action);
      }

      localStorage.setItem('assetfindColumnKeys', keyList.join(','));
      this.setState({
        [fieldKey]: handeldList,
        [`${type}ModalVisiable`]: false,
        tableScrollX: handeldList.length * 60,
      });
    } else {
      const {
        query,
        // query: {keyword },
        // timeRange,
      } = this.state;
      // const startTime = moment()
      //   .subtract(timeRange, 'days')
      //   .format('YYYY-MM-DD');
      // const endTime = moment().format('YYYY-MM-DD');
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
      localStorage.setItem('assetfindFilterKeys', keyList.join(','));
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
          this.fetchFilterCount(newQuery);
          this.fetchChartData(newQuery);
        }
      );
    }
  };

  globalSearchChange = (value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { keyword: value });
    this.setState({ query: newQuery });
  };

  handleMenuClick = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      message.warn('请先选择新发现资产');
    }
  };

  render() {
    const {
      assetFind: { assetFindList },
      loading: listLoading,
    } = this.props;
    const {
      query,
      preQuery,
      selectedRowKeys,
      selectedNum,
      // dphcStatus,
      exportLoading,
      pickedFilterList,
      addFlag,
      configFlag,
      editItem,
      drawerTitle,
      drawerVisible,
      isAllCheck,
      unCheckedIds,
      registerVisible,
      actionStatus,
      mode,
      columnModalVisiable,
      filterModalVisiable,
      tableScrollX,
      columns,
      detailFlag,
    } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onSelect: this.slelectRowOnSelect,
      onSelectAll: this.onSelectAll,
      // onChange: this.slelectRowOnchange,
    };

    if (this.btnList) {
      this.btnList = this.btnList.map((item) => {
        if (
          item.label === '批量注册' ||
          item.label === '删除' ||
          item.label === '导出' ||
          item.label === '编辑标签'
        ) {
          item.disabled = selectedRowKeys.length === 0 && selectedNum === 0;
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
        width: column.width || 150,
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
          titleName="资产发现"
          query={query}
          preQuery={preQuery}
          actionStatus={actionStatus}
          mode={mode}
          deleteSelect={this.deleteSelect}
          pickedFilterList={pickedFilterList}
          titleRender={this.titleRender}
          timeRangeRender={false}
          // selctedItemsRender={this.selctedItemsRender}
          selectedFlag
          filterBar={{
            hasManageBtn: true,
            filterPrefix: 'assetFind',
            globalSearch: this.globalSearch,
            globalSearchChange: this.globalSearchChange,
            checkboxOnchange: this.checkboxOnchange,
            sortAction: this.sortAction,
            mustAction: this.mustAction,
            filterQuickSelect: this.filterQuickSelect,
            placeholder: '支持IP/CIDR方式搜索',
            triggerFilterListManger: this.triggerFilterListManger,
            changeMode: this.changeMode,
            fetchData: this.fetchData,
            rwAuth: this.auth,
          }}
          chartRender={this.chartRender}
          selctedItemsRender={false}
          table={{
            wrapperClass: styles.tableBlock,
            operationProps: {
              btnList: this.btnList,
              extra: (
                <div
                  className={styles.settingBlock}
                  onClick={() => {
                    this.localFilterKeys = localStorage.getItem(`assetfindFilterKeys`);
                    this.localColumnKeys = localStorage.getItem(`assetfindColumnKeys`);
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
                  <span className={styles.settingBtn} />
                  <span styles={{ marginLeft: 10 }}>管理</span>
                </div>
              ),
            },
            tableProps: {
              rowKey: 'Fid',
              tableScrollX,
              rowSelection,
              loading: listLoading,
              columns: newColumns,
              components: this.components,
              showFlag: true,
              page: query.page,
              pageSize: query.pageSize,
              sort: query.sort,
              dir: query.dir,
              data: { total: assetFindList.recordsTotal, list: assetFindList.list },
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
        <BatchRegister
          visible={registerVisible}
          isAllCheck={isAllCheck}
          unCheckedIds={unCheckedIds}
          query={query}
          selectedRowKeys={selectedRowKeys}
          cancel={this.endBatchRegister}
          success={this.batchRegisterSuccess}
        />
        {!detailFlag && (
          <Drawer
            destroyOnClose
            title={drawerTitle}
            placement="right"
            width={960}
            closable
            onClose={() => {
              this.closeDrawer(false);
            }}
            visible={drawerVisible}
          >
            {/* 网段配置内容 */}
            {configFlag && (
              <Segment
                onCancel={() => {
                  this.closeDrawer(false);
                }}
              />
            )}
            {addFlag && (
              <AddAssetForm
                onCancel={() => {
                  this.closeDrawer(false);
                }}
                editItem={editItem}
                success={this.registerAssetSucc}
                isRegister
              />
            )}
          </Drawer>
        )}

        {detailFlag && (
          <Fragment>
            {/* 已完成注册的资产详情 */}
            {editItem.Fis_registered === 1 && (
              <AssetDetail
                Fasset_id={editItem.Fasset_id}
                isvisible={drawerVisible}
                auth={this.auth}
                onClose={() => {
                  this.closeDrawer(false);
                  const { dispatch } = this.props;
                  dispatch({
                    type: 'asset/MERGE_STATE_BY_KEY',
                    payload: {
                      key: 'asset',
                      value: {},
                    },
                  });
                }}
              />
            )}
            {/* 未注册的资产详情 */}
            {editItem.Fis_registered === 0 && (
              <Detail
                Fid={editItem.Fid}
                isvisible={drawerVisible}
                onClose={() => {
                  this.closeDrawer(false);
                }}
              />
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

const WrappedForm = Form.create({ name: 'basicInfo' })(AssetFind);
export default WrappedForm;
