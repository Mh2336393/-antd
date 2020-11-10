/* eslint-disable no-unused-expressions */
/* eslint-disable no-unreachable */
/* eslint-disable react/no-this-in-sfc */
/* eslint-disable no-console */
import React, { useEffect, useState, Fragment, useRef } from 'react';
import { connect, Link } from 'umi';
import { CloseOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Table, Modal, Row, Col, Tooltip, Button, Popover, Layout, message } from 'antd';
import { Resizable } from 'react-resizable';
import moment from 'moment';
import classNames from 'classnames/bind';
import bus from '@/utils/event';
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import FilterBar from '@/components/FilterBar';
import ItemManageModal from '@/components/ItemManageModal';
import TimeRangePicker from '@/components/TimeRangePicker';
import { LineChartMul } from '@/components/Charts';
import styles from './index.less';
import authority from '@/utils/authority';
const { getAuth } = authority
import EventDrawerWidget from '../EventDrawerWidget';
import configSettings from '../../../configSettings';
import {
  fieldNameList,
  defaultFilterListKey,
  defaultColumnKeys,
  setShowList,
  canOrderList,
  columnRender,
  timeKey,
} from './FieldNameAnalysis';

const { Sider } = Layout;
const { alarmEventValueMap } = configSettings;

const cx = classNames.bind(styles);
const { confirm } = Modal;

const options = [
  {
    name: '近24小时',
    value: 1,
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
const format = 'YYYY-MM-DD HH:mm:ss';
// 伸缩
const ResizableTitle = props => {
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
          onClick={e => {
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
interface IEventAnalysisProp {
  dispatch?: any;
  location?: any;
  filterLoading?: boolean;
  eventAnalysis?: any;
  ccsData?: any;
  tableLoading?: boolean;
  tableLoading1?: boolean;
  locationImgs?: any;
}

const EventAnalysis: React.FC<IEventAnalysisProp> = ({
  dispatch,
  location,
  filterLoading,
  eventAnalysis,
  ccsData,
  tableLoading,
  tableLoading1,
  locationImgs,
}) => {
  const analysisAuth = getAuth('/event/analysis');
  const localFilterKeys = localStorage.getItem(`analysisFilterKeys`);
  const localColumnKeys = localStorage.getItem(`analysisColumnKeys`);
  const columnKey = localColumnKeys ? localColumnKeys.split(',') : defaultColumnKeys;// 获取表格要展示列的key
  const filterKey = localFilterKeys ? localFilterKeys.split(',') : defaultFilterListKey;
  const [columnDefaultList, setColumnDefaultList] = useState([]);
  const [filterDefaultList, setFilterDefaultList] = useState([]);
  const components = {
    header: {
      cell: ResizableTitle,
    },
  };
  const [query, setQuery] = useState({
    pageSize: 20,
    page: 1,
    dir: 'desc',
    sort: 'timestamp',
    search: '',
    filterObj: {},
    dirObj: {} as any,
    mustObj: {},
    startTime: moment()
      .subtract(1, 'day')
      .valueOf(),
    endTime: moment().valueOf(),
  });
  const [actionStatus, setActionStatus] = useState({});
  const [mode, setMode] = useState(true);
  const [isAllCheck, setIsAllCheck] = useState(false);
  const [columns, setColumns] = useState([]);
  const [tableScrollX, setTableScrollX] = useState(0);
  const [siderbarIsOpen, setSiderbarIsOpen] = useState(true);
  const [filterModalVisiable, setFilterModalVisiable] = useState(false);
  const [columnModalVisiable, setColumnModalVisiable] = useState(false);

  const fixTableRender = {
    'alert.signature': (text, record) => (
      <a style={{ maxWidth: 300, display: 'inline-block' }} onClick={() => detailShowClick(record)}>
        {text}
      </a>
    ),
    'alert.threshold': (text) => (
      <span>{Number((text / 300).toFixed(2))}</span>
    ),
    'alert.actual_value': (text) => (
      <span>{Number((text / 300).toFixed(2))}</span>
    ),

    'originalIds': text => text.length,
    'src.ip': (text, record) => {
      const { src, attackerIps, victimIps, iocType = '' } = record;
      const ipCateObj = {};
      if (iocType !== 'domain') {
        attackerIps.forEach(tmp => {
          ipCateObj[tmp] = '攻击者';
        });
      }
      victimIps.forEach(tmp => {
        ipCateObj[tmp] = '受害者';
      });

      const srcArr = configSettings.ipsNoRepeat(src);

      const urls = configSettings.urlKey('ip');
      const popContent = (
        <div>
          {srcArr.map(item => (
            <div>
              {item.ipCountry === '内网' ? (
                <p key={item.ip} className={styles.marginBtm}>
                  {item.ip}
                  &nbsp;
                  {ipCateObj[item.ip] && (
                    <span
                      className={
                        styles[`${ipCateObj[item.ip] === '攻击者' ? 'spanAttacker' : 'spanVictim'}`]
                      }
                    >
                      {ipCateObj[item.ip]}
                    </span>
                  )}
                </p>
              ) : (
                  <Popover
                    content={urlPopContent(item.ip, urls)}
                    getPopupContainer={triggerNode => triggerNode}
                    placement="bottomLeft"
                  >
                    <p key={item.ip} className={styles.marginBtm}>
                      {item.ipCountry && locationImgs.indexOf(item.ipCountry) > -1 && (
                        <span
                          title={`${item.ipCountry}${item.ipProvince ? ` ${item.ipProvince}` : ''}${item.ipCity && configSettings.topCity.indexOf(item.ipCity) < 0
                            ? ` ${item.ipCity}`
                            : ''
                            }`}
                          className={styles.locationSpan}
                          style={{
                            backgroundImage: `url('/image/location/${item.ipCountry}.svg')`,
                          }}
                        />
                      )}
                      {item.ip}
                      {item.ipCountry && locationImgs.indexOf(item.ipCountry) < 0 && (
                        <span> ({item.ipCountry})</span>
                      )}
                    &nbsp;
                    {ipCateObj[item.ip] && (
                        <span
                          className={
                            styles[
                            `${ipCateObj[item.ip] === '攻击者' ? 'spanAttacker' : 'spanVictim'}`
                            ]
                          }
                        >
                          {ipCateObj[item.ip]}
                        </span>
                      )}
                    </p>
                  </Popover>
                )}
            </div>
          ))}
        </div>
      );
      return (
        <div className={styles.popoverLimitHei} style={{ minWidth: 140 }}>
          {srcArr.length > 1 ? (
            <Popover
              content={popContent}
              getPopupContainer={triggerNode => triggerNode}
              placement="bottomLeft"
              title="源IP"
            >
              <p>
                多个( <span className="fontBlue"> {srcArr.length} </span>)
              </p>
            </Popover>
          ) : (
              <div style={{ whiteSpace: 'nowrap' }}>
                {srcArr[0] ? (
                  <div>
                    {srcArr[0].ipCountry ? (
                      <div>
                        {srcArr[0].ipCountry === '内网' ? (
                          <div>
                            <Tooltip title={srcArr[0].ip}>
                              <p className={styles.ipShow}>{srcArr[0].ip}</p>
                            </Tooltip>
                            {ipCateObj[srcArr[0].ip] && (
                              <p>
                                <span
                                  className={
                                    styles[
                                    `${ipCateObj[srcArr[0].ip] === '攻击者'
                                      ? 'spanAttacker'
                                      : 'spanVictim'
                                    }`
                                    ]
                                  }
                                >
                                  {ipCateObj[srcArr[0].ip]}
                                </span>
                              </p>
                            )}
                          </div>
                        ) : (
                            <Popover
                              content={urlPopContent(srcArr[0].ip, urls)}
                              getPopupContainer={triggerNode => triggerNode}
                              placement="bottomLeft"
                            >
                              <div>
                                <Tooltip title={srcArr[0].ip}>
                                  <p className={styles.ipShow}>
                                    {srcArr[0].ipCountry &&
                                      locationImgs.indexOf(srcArr[0].ipCountry) > -1 && (
                                        <span
                                          title={`${srcArr[0].ipCountry}${srcArr[0].ipProvince ? ` ${srcArr[0].ipProvince}` : ''
                                            }${srcArr[0].ipCity &&
                                              configSettings.topCity.indexOf(srcArr[0].ipCity) < 0
                                              ? ` ${srcArr[0].ipCity}`
                                              : ''
                                            }`}
                                          className={styles.locationSpan}
                                          style={{
                                            backgroundImage: `url('/image/location/${srcArr[0].ipCountry}.svg')`,
                                          }}
                                        />
                                      )}
                                    {srcArr[0].ip}
                                    {srcArr[0].ipCountry &&
                                      locationImgs.indexOf(srcArr[0].ipCountry) < 0 && (
                                        <span> ({srcArr[0].ipCountry})</span>
                                      )}
                                  </p>
                                </Tooltip>

                                {ipCateObj[srcArr[0].ip] && (
                                  <p>
                                    <span
                                      className={
                                        styles[
                                        `${ipCateObj[srcArr[0].ip] === '攻击者'
                                          ? 'spanAttacker'
                                          : 'spanVictim'
                                        }`
                                        ]
                                      }
                                    >
                                      {ipCateObj[srcArr[0].ip]}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </Popover>
                          )}
                      </div>
                    ) : (
                        <Tooltip title={srcArr[0].ip}>
                          <p className={styles.ipShow}>{srcArr[0].ip}</p>
                        </Tooltip>
                      )}
                  </div>
                ) : (
                    ''
                  )}
              </div>
            )}
        </div>
      );
    },
    'dst.ip': (text, record) => {
      const { dst, attackerIps, victimIps, iocType = '' } = record;
      const ipCateObj = {};
      if (iocType !== 'domain') {
        attackerIps.forEach(tmp => {
          ipCateObj[tmp] = '攻击者';
        });
      }
      victimIps.forEach(tmp => {
        ipCateObj[tmp] = '受害者';
      });

      const dstArr = configSettings.ipsNoRepeat(dst);
      const urls = configSettings.urlKey('ip');
      const popContent = (
        <div>
          {dstArr.map(item => (
            <div>
              {item.ipCountry === '内网' ? (
                <p key={item.ip} className={styles.marginBtm}>
                  {item.ip}
                  &nbsp;
                  {ipCateObj[item.ip] && (
                    <span
                      className={
                        styles[`${ipCateObj[item.ip] === '攻击者' ? 'spanAttacker' : 'spanVictim'}`]
                      }
                    >
                      {ipCateObj[item.ip]}
                    </span>
                  )}
                </p>
              ) : (
                  <Popover
                    content={urlPopContent(item.ip, urls)}
                    getPopupContainer={triggerNode => triggerNode}
                    placement="bottomLeft"
                  >
                    <p key={item.ip} className={styles.marginBtm}>
                      {item.ipCountry && locationImgs.indexOf(item.ipCountry) > -1 && (
                        <span
                          title={`${item.ipCountry}${item.ipProvince ? ` ${item.ipProvince}` : ''}${item.ipCity && configSettings.topCity.indexOf(item.ipCity) < 0
                            ? ` ${item.ipCity}`
                            : ''
                            }`}
                          className={styles.locationSpan}
                          style={{
                            backgroundImage: `url('/image/location/${item.ipCountry}.svg')`,
                          }}
                        />
                      )}
                      {item.ip}
                      {item.ipCountry && locationImgs.indexOf(item.ipCountry) < 0 && (
                        <span> ({item.ipCountry})</span>
                      )}
                    &nbsp;
                    {ipCateObj[item.ip] && (
                        <span
                          className={
                            styles[
                            `${ipCateObj[item.ip] === '攻击者' ? 'spanAttacker' : 'spanVictim'}`
                            ]
                          }
                        >
                          {ipCateObj[item.ip]}
                        </span>
                      )}
                    </p>
                  </Popover>
                )}
            </div>
          ))}
        </div>
      );
      return (
        <div className={styles.popoverLimitHei} style={{ minWidth: 140 }}>
          {dstArr.length > 1 ? (
            <Popover
              content={popContent}
              getPopupContainer={triggerNode => triggerNode}
              placement="bottomLeft"
              title="目的IP"
            >
              <p>
                多个( <span className="fontBlue"> {dstArr.length} </span>)
              </p>
            </Popover>
          ) : (
              <div style={{ whiteSpace: 'nowrap' }}>
                {dstArr[0] ? (
                  <div>
                    {dstArr[0].ipCountry ? (
                      <div>
                        {dstArr[0].ipCountry === '内网' ? (
                          <div>
                            <Tooltip title={dstArr[0].ip}>
                              <p className={styles.ipShow}>{dstArr[0].ip}</p>
                            </Tooltip>

                            {ipCateObj[dstArr[0].ip] && (
                              <p>
                                <span
                                  className={
                                    styles[
                                    `${ipCateObj[dstArr[0].ip] === '攻击者'
                                      ? 'spanAttacker'
                                      : 'spanVictim'
                                    }`
                                    ]
                                  }
                                >
                                  {ipCateObj[dstArr[0].ip]}
                                </span>
                              </p>
                            )}
                          </div>
                        ) : (
                            <Popover
                              content={urlPopContent(dstArr[0].ip, urls)}
                              getPopupContainer={triggerNode => triggerNode}
                              placement="bottomLeft"
                            >
                              <div>
                                <Tooltip title={dstArr[0].ip}>
                                  <p className={styles.ipShow}>
                                    {dstArr[0].ipCountry &&
                                      locationImgs.indexOf(dstArr[0].ipCountry) > -1 && (
                                        <span
                                          title={`${dstArr[0].ipCountry}${dstArr[0].ipProvince ? ` ${dstArr[0].ipProvince}` : ''
                                            }${dstArr[0].ipCity &&
                                              configSettings.topCity.indexOf(dstArr[0].ipCity) < 0
                                              ? ` ${dstArr[0].ipCity}`
                                              : ''
                                            }`}
                                          className={styles.locationSpan}
                                          style={{
                                            backgroundImage: `url('/image/location/${dstArr[0].ipCountry}.svg')`,
                                          }}
                                        />
                                      )}
                                    {dstArr[0].ip}
                                    {dstArr[0].ipCountry &&
                                      locationImgs.indexOf(dstArr[0].ipCountry) < 0 && (
                                        <span> ({dstArr[0].ipCountry})</span>
                                      )}
                                  </p>
                                </Tooltip>
                                {ipCateObj[dstArr[0].ip] && (
                                  <p>
                                    <span
                                      className={
                                        styles[
                                        `${ipCateObj[dstArr[0].ip] === '攻击者'
                                          ? 'spanAttacker'
                                          : 'spanVictim'
                                        }`
                                        ]
                                      }
                                    >
                                      {ipCateObj[dstArr[0].ip]}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </Popover>
                          )}
                      </div>
                    ) : (
                        <Tooltip title={dstArr[0].ip}>
                          <p className={styles.ipShow}>{dstArr[0].ip}</p>
                        </Tooltip>
                      )}
                  </div>
                ) : (
                    ''
                  )}
              </div>
            )}
        </div>
      );
    },
    'src.port': (text, record) => {
      const { src } = record;
      const srcArr = configSettings.portsNoRepeat(src);
      if (srcArr.length > 1) {
        const popContent = (
          <div>
            {srcArr.map(item => (
              <div>
                <p key={item.port}>{item.port}</p>
              </div>
            ))}
          </div>
        );
        return (
          <div className={styles.popoverLimitHei}>
            <Popover
              content={popContent}
              getPopupContainer={triggerNode => triggerNode}
              placement="bottomLeft"
              title="源端口"
            >
              <p>
                多个( <span className="fontBlue"> {srcArr.length} </span>)
              </p>
            </Popover>
          </div>
        );
      }
      return srcArr[0] && srcArr[0].port ? srcArr[0].port : '';
    },
    'dst.port': (text, record) => {
      const { dst } = record;
      const dstArr = configSettings.portsNoRepeat(dst);
      if (dstArr.length > 1) {
        const popContent = (
          <div>
            {dstArr.map(item => (
              <div>
                <p key={item.port}>{item.port}</p>
              </div>
            ))}
          </div>
        );
        return (
          <div className={styles.popoverLimitHei}>
            <Popover
              content={popContent}
              getPopupContainer={triggerNode => triggerNode}
              placement="bottomLeft"
              title="目的端口"
            >
              <p>
                多个( <span className="fontBlue"> {dstArr.length} </span>)
              </p>
            </Popover>
          </div>
        );
      }
      return dstArr[0] && dstArr[0].port ? dstArr[0].port : '';
    },
    'alert.over_range': text => {
      const range = (text * 100).toFixed(2) as any;
      let textStyle;
      if (range > 0 && range <= 20) {
        textStyle = styles.textRange_0;
      } else if (range > 20 && range <= 50) {
        textStyle = styles.textRange_1;
      } else if (range > 50 && range <= 75) {
        textStyle = styles.textRange_2;
      } else {
        textStyle = styles.textRange_3;
      }
      return (
        <span className={`${textStyle}`} style={{ fontSize: 14 }}>
          {range || 0}%
        </span>
      );
    },
    alert_mode: text => {
      return configSettings.alertMode[text];
    },
    score: text => {
      const scoreTag = configSettings.scoreTagMap(text);
      return (
        <span className={styles.scoreTagSpan} style={scoreTag.style}>
          {scoreTag.label}
        </span>
      );
    },
    attackerIps: (text, record) => {
      const { src, dst } = record;
      const ipCateObj = {};
      src.forEach(tmp => {
        ipCateObj[tmp.ip] = '源';
      });
      dst.forEach(tmp => {
        ipCateObj[tmp.ip] = '目的';
      });

      const popContent = (
        <div className="popContentWrap" getPopupContainer={triggerNode => triggerNode}>
          {text.map(ip => (
            <p key={ip} className={styles.marginBtm}>
              {ip || ''}
              &nbsp;
              {ipCateObj[ip] && (
                <span className={styles[`${ipCateObj[ip] === '源' ? 'spanSrc' : 'spanDst'}`]}>
                  {ipCateObj[ip]}
                </span>
              )}
            </p>
          ))}
        </div>
      );

      return (
        <div className={styles.popoverLimitHei}>
          {text.length > 1 ? (
            <Popover
              content={popContent}
              getPopupContainer={triggerNode => triggerNode}
              placement="rightTop"
              title="攻击者IP"
            >
              <p>
                多个( <span className="fontBlue"> {text.length} </span>)
              </p>
            </Popover>
          ) : (
              <div>
                <p> {text[0] ? text[0] : ''} </p>
                {ipCateObj[text[0]] && (
                  <p>
                    <span
                      className={styles[`${ipCateObj[text[0]] === '源' ? 'spanSrc' : 'spanDst'}`]}
                    >
                      {ipCateObj[text[0]]}
                    </span>
                  </p>
                )}
              </div>
            )}
        </div>
      );
    },
    victimIps: (text, record) => {
      const { src, dst } = record;
      const ipCateObj = {};
      src.forEach(tmp => {
        ipCateObj[tmp.ip] = '源';
      });
      dst.forEach(tmp => {
        ipCateObj[tmp.ip] = '目的';
      });

      const popContent = (
        <div className="popContentWrap">
          {text.map(ip => (
            <p key={ip} className={styles.marginBtm}>
              {ip || ''}
              &nbsp;
              {ipCateObj[ip] && (
                <span className={styles[`${ipCateObj[ip] === '源' ? 'spanSrc' : 'spanDst'}`]}>
                  {ipCateObj[ip]}
                </span>
              )}
            </p>
          ))}
        </div>
      );

      return (
        <div className={styles.popoverLimitHei}>
          {text.length > 1 ? (
            <Popover
              content={popContent}
              getPopupContainer={triggerNode => triggerNode}
              placement="rightTop"
              title="受害者IP"
            >
              <p>
                多个( <span className="fontBlue"> {text.length} </span>)
              </p>
            </Popover>
          ) : (
              <div>
                <p> {text[0] ? text[0] : ''} </p>
                {ipCateObj[text[0]] && (
                  <p>
                    <span
                      className={styles[`${ipCateObj[text[0]] === '源' ? 'spanSrc' : 'spanDst'}`]}
                    >
                      {ipCateObj[text[0]]}
                    </span>
                  </p>
                )}
              </div>
            )}
        </div>
      );
    },
    attackResult: text => {
      if (!text) {
        return '';
      }
      let typeName = 'spanSucc';
      if (text === '失败') {
        typeName = 'spanErr';
      }
      if (text === '尝试') {
        typeName = 'spanTry';
      }
      return <span className={styles[typeName]}>{text}</span>;
    },
    status: text => {
      const {
        alarmEventValueMap: { status },
      } = configSettings;
      return <div style={{ whiteSpace: 'nowrap' }}>{status[text] || ''}</div>;
    },
  };

  const { filterDefaultList: filterList1 } = setShowList(columnKey, filterKey, fixTableRender);

  const [pickedFilterList, setPickedFilterList] = useState([...filterList1]);
  const [sideWidth, setSideWidth] = useState(306);
  const [timeVisible] = useState(true);
  const [currentHoverRow, setCurrentHoverRow] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [ids, setIds] = useState([]);
  const [btnManageLeft, setBtnManageLeft] = useState(0);
  const [filterArr, setFilterArr] = useState([]);
  const [preQuery, setPreQuery] = useState({
    preFilterObj: {},
    preMustObj: {},
  });

  const [moving, setMoving] = useState(false);
  const [lastX, setLastX] = useState(null);
  window.onmouseup = () => onMouseUp();
  window.onmousemove = e => onMouseMove(e);

  // useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。
  // 返回的 ref 对象在组件的整个生命周期内保持不变。
  const drawerRef = useRef(null);
  const [timeRange, setTimeRange] = useState(1);
  const [descriptionOfMeasurementOptions, setdescriptionOfMeasurementOptions] = useState([]);
  // 伸缩
  const handleResize = index => (e, { size }) => {
    const nextColumns = [...columns];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    setColumns(nextColumns)


  };
  const lastcolumns = [
    {
      title: '操作',
      key: 'lastIocnAction',
      dataIndex: '',
      fixed: 'right',
      width: 70,
      render: (text, record) => {
        return (
          record.status !== 'ignored' &&
          analysisAuth === 'rw' && (
            <Fragment>
              <a
                onClick={() => {
                  dataHandler(record.id);
                  setIsAllCheck(false);
                  setSelectedRowKeys([]);
                  setIds([]);
                }}
              >
                忽略
              </a>
            </Fragment>
          )
        );
      },
    },
  ];

  useEffect(() => {
    const { query: locationQuery } = location;
    const { filterDefaultList: filterList, columnDefaultList: columnList } = setShowList(
      columnKey,
      filterKey,
      fixTableRender
    );
    setColumnDefaultList(columnList);
    setFilterDefaultList(filterList);
    const filterObj = getFilterObj(true, filterList);
    const dirObj = getDirStatus(true, filterList);
    const mustObj = getMustStatus(true, filterList);
    const newActionStatus = getActionStatus(filterObj);
    const newColumns = columnList;
    const newTableScrollX = columnList.length * 60;
    const newPickedFilterList = filterList;
    const queryKeys = Object.keys(locationQuery);
    const newFilterObj = cloneDeep(filterObj);
    const newDirObj = cloneDeep(dirObj);
    const newMustObj = cloneDeep(mustObj);
    const newActionObj = cloneDeep(newActionStatus);
    const paramFilterList = [...newPickedFilterList];
    const pickedFilterListCurKeys = newPickedFilterList.map(tmpobj => tmpobj.key);

    queryKeys.forEach(key => {
      const obj = fieldNameList.find(
        item => item.key === key && !['startTime', 'endTime', 'search', 'sort', 'dir'].includes(key)
      );
      if (obj) {
        const filterIndex = pickedFilterListCurKeys.indexOf(key);
        if (filterIndex < 0) {
          paramFilterList.push(obj);
        } else {
          paramFilterList[filterIndex] = obj;
        }
        if (Array.isArray(locationQuery[key])) {
          newFilterObj[obj.key] = locationQuery[key];
        } else {
          try {
            const keyArr = JSON.parse(locationQuery[key]);
            console.log(2, 'keyArr', keyArr, Array.isArray(keyArr));
            if (Array.isArray(keyArr)) {
              newFilterObj[obj.key] = keyArr;
            } else {
              newFilterObj[obj.key] = [decodeURIComponent(locationQuery[key])];
            }
          } catch (error) {
            console.log(3, error);
            newFilterObj[obj.key] = [decodeURIComponent(locationQuery[key])];
          }
        }
        newDirObj[obj.key] = 'desc';
        newMustObj[obj.key] = true;
        newActionObj[obj.key] = newFilterObj[obj.key].length > 0;
      }
    });
    setPickedFilterList(paramFilterList);
    let otherObj = {} as any;
    let range = 1 as any;
    if (locationQuery.startTime && locationQuery.endTime) {
      const diff = moment(parseInt(locationQuery.endTime, 10)).diff(
        moment(parseInt(locationQuery.startTime, 10)),
        'days'
      );
      otherObj = { startTime: parseInt(locationQuery.startTime, 10), endTime: parseInt(locationQuery.endTime, 10) };
      if (diff !== 1) {
        range = `${moment(parseInt(locationQuery.startTime, 10)).format('YYYY-MM-DD HH:mm:ss')} 至 ${moment(
          parseInt(locationQuery.endTime, 10)
        ).format('YYYY-MM-DD HH:mm:ss')}`;
      }
    }
    if (locationQuery.search) {
      otherObj.search = decodeURIComponent(locationQuery.search);
    }
    if (locationQuery.sort) {
      otherObj.sort = decodeURIComponent(locationQuery.sort);
    }
    if (locationQuery.dir) {
      otherObj.dir = decodeURIComponent(locationQuery.dir);
    }
    if (locationQuery.timeRange) {
      range = parseInt(locationQuery.timeRange, 10);
      otherObj = Object.assign(otherObj, {
        startTime: moment()
          .subtract(range, 'days')
          .valueOf(),
        endTime: moment().valueOf(),
      });
    }
    const newQuery = Object.assign({}, query, {
      ...otherObj,
      filterObj: newFilterObj,
      dirObj: newDirObj,
      mustObj: newMustObj,
    });
    setColumns(newColumns);
    setTableScrollX(newTableScrollX);
    setQuery(newQuery);
    setTimeRange(range);
    setActionStatus(newActionObj);
    setPreQuery({
      preFilterObj: newFilterObj,
      preMustObj: newMustObj,
    });
    fetchAlarmData(newQuery);
    fetchFilterCount(newQuery);
  }, []);

  useEffect(() => {
    dispatch({ type: 'msgNotify/fetchLocationImg' });
    // 获取测算选项的描述
    fetchDescriptionOfMeasurementOptions()
    const curscrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    if (curscrollLeft !== 0) {
      setBtnManageLeft(curscrollLeft);
    }
    window.onscroll = () => {
      const value = document.documentElement.scrollLeft || document.body.scrollLeft;
      if (btnManageLeft !== value) {
        setBtnManageLeft(value);
      }
    };
  }, []);

  useEffect(() => {
    const { filterCount } = eventAnalysis;
    if (!filterLoading) {
      const newList = [].concat(pickedFilterList);
      newList.forEach(item => {
        const { key } = item;
        item.list = filterCount && filterCount[key] ? filterCount[key].buckets : [];
        if (alarmEventValueMap[key]) {
          item.list.forEach(element => {
            const title = alarmEventValueMap[key][element.key];
            element.title = title;
          });
        }
        if (key === 'score') {
          const scoreArr = [...item.list];
          const scoreList = configSettings.scoreFilterListShow(scoreArr, query?.dirObj?.score);
          item.list = scoreList;
        }
      });
      setPickedFilterList(newList);

      const { columnDefaultList: columnList } = setShowList(
        columnKey,
        filterKey,
        fixTableRender
      );
      setColumnDefaultList(columnList);
      setColumns(columnList);
    }
  }, [filterLoading, JSON.stringify(eventAnalysis)]);

  function fetchDescriptionOfMeasurementOptions() {
    dispatch({
      type: 'advancedAnalysis/fetchDescriptionOfMeasurementOptions',
      payload: {},
    }).then(res => {
      setdescriptionOfMeasurementOptions(res)
    })
  }


  function getDirStatus(isFirst, filterList) {
    const obj = {};
    if (isFirst) {
      filterList.forEach(item => {
        obj[item.key] = 'desc';
      });
    } else {
      const { dirObj } = query;
      filterList.forEach(item => {
        obj[item] = dirObj[item] ? dirObj[item] : 'desc';
      });
    }
    return obj;
  }

  function getMustStatus(isFirst, filterList) {
    const obj = {};
    if (isFirst) {
      filterList.forEach(item => {
        obj[item.key] = true;
      });
    } else {
      const { mustObj } = query;
      filterList.forEach(item => {
        obj[item] = mustObj[item] ? mustObj[item] : true;
      });
    }
    return obj;
  }

  function getActionStatus(filterObj) {
    const statusObj = {};
    Object.keys(filterObj).forEach(item => {
      if (filterObj[item].length > 0) {
        statusObj[item] = true;
      } else {
        statusObj[item] = false;
      }
    });
    return statusObj;
  }

  function getFilterObj(isFirst, list) {
    const obj = {};
    if (isFirst) {
      list.forEach(item => {
        obj[item.key] = [];
      });
    } else {
      const { filterObj } = query;
      list.forEach(key => {
        obj[key] = filterObj[key] ? filterObj[key] : [];
      });
    }
    return obj;
  }

  function mouseDown(e) {
    e.stopPropagation();
    e.preventDefault();
    setMoving(true);
  }

  function onMouseMove(e) {
    if (moving) {
      onMove(e);
    }
  }

  function onMouseUp() {
    setMoving(false);
    setLastX(null);
  }

  function onMove(e) {
    if (lastX) {
      const dx = e.clientX - lastX;
      const newWidth = sideWidth + dx;
      if (newWidth >= 306 && newWidth <= 612) {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent('resize', false, false);
        window.dispatchEvent(evt);
        setSideWidth(newWidth);
      }
    }
    setLastX(e.clientX);
  }

  function fetchAlarmData(newQuery?: any) {
    const param = newQuery || query;
    param.timeRange = timeRange;
    dispatch({
      type: 'eventAnalysis/fetchAlarmList',
      payload: param,
    });
  }

  function fetchFilterCount(newQuery?: any) {
    const param = newQuery || query;
    const { dirObj, startTime, endTime, search, filterObj } = param;
    dispatch({
      type: 'eventAnalysis/fetchFilterCount',
      payload: { dirObj, search, filterObj, startTime, endTime },
    });
  }


  function dataHandler(id) {
    const data = { ids: [id.toString()] };
    confirm({
      title: '忽略后不可恢复，确定忽略吗',
      onOk() {
        dispatch({ type: 'eventAnalysis/ignoreEvent', payload: data })
          .then(() => {
            message.success('已将该事件标识为“已忽略”状态,有延时，请稍后刷新页面查看');
            fetchAlarmData(query);
            fetchFilterCount(query);
          })
          .catch(error => {
            message.error(error.msg);
          });
      },
      onCancel() { },
    });
    return data;
  }

  function detailShowClick(record) {
    const { clusterNameIp = {} } = ccsData;
    // 点击详情得时候把这条数据得设备名称也带过去ccsName（多设备切换在全部状态得时候，点击下级设备得数据，node那边需要用到设备名称）
    const { esIndex } = record;
    let ccsName = '';
    if (esIndex.indexOf(':') > -1) {
      const devid = esIndex.split(':')[0];
      ccsName = clusterNameIp[devid] || '';
    }
    console.log('事件详情点击ccsName（设备名）===', ccsName);
    // TODO
    drawerRef.current?.open();
    drawerRef.current?.setTitle(
      <p>
        {record?.alert?.signature ?? ''}&nbsp;
        <Tooltip title={descriptionOfMeasurementOptions.find(item => {
          return item.Fscene_name === record.ai_scene
        })?.Fstatement} placement="rightTop">
          <QuestionCircleFilled className="fontBlue" />
        </Tooltip>
      </p>
    );
    drawerRef.current?.setRecord({ ...record, ccsName });
  }

  function urlPopContent(ip, urls) {
    return (
      <div>
        {urls.map(item => (
          <p>
            <a href={`${item.url}/${ip}`} target="blank">
              {item.name}
            </a>
          </p>
        ))}
      </div>
    );
  }

  const deleteSelect = key => {
    const { filterObj, mustObj } = query;
    const newObj = cloneDeep(filterObj);
    const newActionStatus = cloneDeep(actionStatus);
    const newMustObj = cloneDeep(mustObj);
    newObj[key] = [];
    if (newObj[key].length === 0) {
      newActionStatus[key] = false;
      newMustObj[key] = true;
    }
    const newFilterArr = filterArr.filter(item => item.indexOf(key) < 0);
    const newQuery = Object.assign({}, query, { filterObj: newObj, mustObj: newMustObj });
    if (mode) {
      setQuery(newQuery);
      setActionStatus(newActionStatus);
      setFilterArr(newFilterArr);
      return;
    }
    setQuery(newQuery);
    setIsAllCheck(false);
    setSelectedRowKeys([]);
    setIds([]);
    setActionStatus(newActionStatus);
    setFilterArr(newFilterArr);
    fetchAlarmData(newQuery);
    fetchFilterCount(newQuery);
  };

  const clearSelect = () => {
    const { filterObj, mustObj } = query;
    const newFilterObj = cloneDeep(filterObj);
    const newMustObj = cloneDeep(mustObj);
    Object.keys(filterObj).forEach(item => {
      newFilterObj[item] = [];
      newMustObj[item] = true;
    });
    const newActionStatus = getActionStatus(newFilterObj);
    const newQuery = Object.assign({}, query, { filterObj: newFilterObj, mustObj: newMustObj });
    if (mode) {
      setQuery(newQuery);
      setFilterArr([]);
      setActionStatus(newActionStatus);
      return;
    }
    setQuery(newQuery);
    setIsAllCheck(false);
    setSelectedRowKeys([]);
    setIds([]);
    setActionStatus(newActionStatus);
    setFilterArr([]);
    fetchAlarmData(newQuery);
    fetchFilterCount(newQuery);
  };

  function selctedItemsRender() {
    const { filterObj, mustObj } = query;
    return (
      <Col span={21} className={styles.selectedList}>
        {Object.keys(filterObj).map(key => {
          filterObj[key] = filterObj[key] || [];
          const obj = pickedFilterList.find(item => item.key === key);
          const mustFlag = mustObj[key];
          const valueArr = filterObj[key].map(item => {
            if (alarmEventValueMap[key]) {
              return alarmEventValueMap[key][item];
            }
            if (timeKey.indexOf(key) > -1) {
              return moment(item).format('YYYY-MM-DD HH:mm:ss');
            }
            return item;
          });
          const valueStr = valueArr.length > 1 ? valueArr.join('+') : valueArr.join('');
          return (
            <Fragment key={key}>
              {filterObj[key].length > 0 && (
                <div className={styles.selected}>
                  <p className={styles.selectItem}>
                    <span>{obj.title}:</span>
                    {!mustFlag && <span style={{ color: '#f5222d' }}>[非]</span>}
                    <Tooltip placement="bottomLeft" title={valueStr}>
                      <span>{valueStr}</span>
                    </Tooltip>
                  </p>
                  <CloseOutlined className={styles.closeStyle} onClick={() => deleteSelect(key)} />
                </div>
              )}
            </Fragment>
          );
        })}
        <div style={{ lineHeight: '28px', minWidth: '94px', paddingLeft: 10 }}>
          {filterArr.length !== 0 && (
            <div onClick={() => clearSelect()}>
              <a>清空筛选条件</a>
            </div>
          )}
        </div>
      </Col>
    );
  }

  const triggerSiderbar = () => {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('resize', false, false);
    window.dispatchEvent(evt);
    setSiderbarIsOpen(!siderbarIsOpen);
  };

  const sortAction = (key, dir) => {
    const { dirObj } = query;
    const { preFilterObj } = preQuery;
    const newObj = Object.assign({}, dirObj, { [key]: dir });
    const newQuery = Object.assign({}, query, { dirObj: newObj });
    const sortQuery = Object.assign({}, query, { dirObj: newObj, filterObj: preFilterObj });
    setQuery(newQuery);
    if (mode) {
      fetchFilterCount(sortQuery);
    } else {
      fetchFilterCount(newQuery);
    }
  };

  const mustAction = (key, flag) => {
    const { mustObj } = query;
    const newObj = Object.assign({}, mustObj, { [key]: flag });
    const newQuery = Object.assign({}, query, { mustObj: newObj });
    setQuery(newQuery);
  };

  const checkboxOnchange = (key, data, checked) => {
    const { filterObj, mustObj } = query;
    const newObj = cloneDeep(filterObj);
    const newMustObj = cloneDeep(mustObj);
    let newFilterArr = cloneDeep(filterArr);
    if (checked) {
      newObj[key].push(data.key);
      newFilterArr.push(`${key}_${data.key}`);
    } else {
      newObj[key] = newObj[key].filter(item => item !== data.key);
      newFilterArr = filterArr.filter(item => item !== `${key}_${data.key}`);
    }
    const newActionStatus = getActionStatus(newObj);
    if (!newActionStatus[key]) {
      newMustObj[key] = true;
    }
    const newQuery = Object.assign({}, query, {
      filterObj: newObj,
      mustObj: newMustObj,
      page: 1,
      dir: 'desc',
      sort: 'timestamp',
    });
    if (mode) {
      setQuery(newQuery);
      setActionStatus(newActionStatus);
      setFilterArr(newFilterArr);
      return;
    }
    setQuery(newQuery);
    setIsAllCheck(false);
    setSelectedRowKeys([]);
    setIds([]);
    setActionStatus(newActionStatus);
    setFilterArr(newFilterArr);
    fetchAlarmData(newQuery);
    fetchFilterCount(newQuery);
  };

  const fetchData = () => {
    const { filterObj, mustObj } = query;
    const newQuery = Object.assign({}, query, { page: 1 });
    setQuery(newQuery);
    setPreQuery({ preFilterObj: filterObj, preMustObj: mustObj });
    setIsAllCheck(false);
    setSelectedRowKeys([]);
    setIds([]);
    fetchAlarmData(newQuery);
    fetchFilterCount(newQuery);
  };

  const fieldManage = (list, type) => {
    let handeldList = list;
    if (type === 'column') {
      const keyList = list.map(item => item.key);
      handeldList = [];
      keyList.forEach(key => {
        const obj = fieldNameList.find(item => item.key === key);
        const column = {
          title: obj.title,
          dataIndex: obj.key,
          key: obj.key,
          sorter: obj.sort,
          render: columnRender(obj, fixTableRender),
        };
        if (alarmEventValueMap[obj.key]) {
          column.render = text => <span>{alarmEventValueMap[obj.key][text]}</span>;
        }
        handeldList.push(column);
      });
      localStorage.setItem('analysisColumnKeys', keyList.join(','));
      if (type === 'filter') {
        setPickedFilterList(handeldList);
        setFilterModalVisiable(false);
      } else {
        setColumns(handeldList);
        setColumnModalVisiable(false);
      }
      const bodywidth = document.body.offsetWidth - 306
      console.log(bodywidth)

      handeldList.map((item, index) => {
        if (item.title === "告警事件名称") {
          item.width = bodywidth / 8
        } else if (item.title === "资产IP") {
          item.width = bodywidth / 8
        } else {
          item.width = bodywidth / 12
        }
        return item.width
      })
      setTableScrollX(handeldList.length * 90);
    } else {
      const keyList = list.map(item => item.key);
      const filterObj = getFilterObj(false, keyList);
      const dirObj = getDirStatus(false, keyList);
      const mustObj = getMustStatus(false, keyList);
      const newFilterArr = [];
      Object.keys(filterObj).forEach(key => {
        if (filterObj[key].length > 0) {
          filterObj[key].forEach(item => {
            newFilterArr.push(`${key}_${item}`);
          });
        }
      });

      handeldList = list.map(item => {
        const render = text => {
          if (timeKey.includes(item.key)) {
            return moment(text).format(format);
          }
          const str = alarmEventValueMap[item.key] ? alarmEventValueMap[item.key][text] : text;
          return str;
        };
        return {
          ...item,
          render,
        };

      });
      localStorage.setItem('analysisFilterKeys', keyList.join(','));
      const newQuery = Object.assign({}, query, { filterObj, dirObj, mustObj });
      fetchAlarmData(newQuery);
      fetchFilterCount(newQuery);
      if (type === 'filter') {
        setPickedFilterList(handeldList);
        setFilterModalVisiable(false);
      } else {
        setColumns(handeldList);
        setColumnModalVisiable(false);
      }
      setQuery(newQuery);
      setPreQuery({ preFilterObj: filterObj, preMustObj: mustObj });
      setFilterArr(newFilterArr);
    }
  };

  const globalSearch = value => {
    const newQuery = Object.assign({}, query, { search: value, page: 1 });
    setQuery(newQuery);
    fetchAlarmData(newQuery);
    fetchFilterCount(newQuery);
  };

  const globalSearchChange = value => {
    setQuery(Object.assign({}, query, { search: value }));
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    //  如果current,pagesize 发生变化，sort相关不改变，但是排序相关改变，page要变为1
    let newQuery;
    if (current !== query.page || pageSize !== query.pageSize) {
      newQuery = Object.assign({}, query, {
        page: current,
        pageSize,
      });
    } else {
      const { field, order } = sorter;
      if (!field) return;
      const dir = order?.slice(0, -3);
      newQuery = Object.assign({}, query, {
        dir,
        sort: field,
        page: 1,
      });
    }
    setQuery(newQuery);
    fetchAlarmData(newQuery);
  };

  const filterQuickSelect = filterValue => {
    const { filterObj, mustObj, search, startTime, endTime, mode: newmode } = filterValue;
    const newFilterArr = [];
    const statefilterObjKeys = Object.keys(query.filterObj);
    const filterObjKeys = Object.keys(filterObj);
    const differenceKeys =
      statefilterObjKeys.length > filterObjKeys.length
        ? difference(statefilterObjKeys, filterObjKeys)
        : difference(filterObjKeys, statefilterObjKeys);

    let dirObj = Object.assign({}, query.dirObj);
    if (differenceKeys.length > 0) {
      const { filterDefaultList: newFilterDefaultList } = setShowList(
        [],
        Object.keys(filterObj),
        fixTableRender
      );

      dirObj = getDirStatus(true, newFilterDefaultList);
      setPickedFilterList(newFilterDefaultList);
    }

    filterObjKeys.forEach(key => {
      if (filterObj[key].length > 0) {
        filterObj[key].forEach(item => {
          newFilterArr.push(`${key}_${item}`);
        });
      }
    });
    const newActionStatus = getActionStatus(filterObj);
    const diff = moment(endTime).diff(moment(startTime), 'days');
    let range = diff as any;
    if ([1, 7, 30, 90].indexOf(diff) < 0) {
      range = `${moment(startTime).format('YYYY-MM-DD HH:mm:ss')} 至 ${moment(endTime).format(
        'YYYY-MM-DD HH:mm:ss'
      )}`;
    }

    const newQuery = Object.assign(
      {},
      query,
      { filterObj },
      { dirObj, mustObj, startTime, endTime, search, page: 1, dir: 'desc', sort: 'timestamp' }
    );
    setQuery(newQuery);
    setIsAllCheck(false);
    setSelectedRowKeys([]);
    setIds([]);
    setTimeRange(range);
    setMode(newmode);
    setActionStatus(newActionStatus);
    setFilterArr(newFilterArr);
    fetchAlarmData(newQuery);
    fetchFilterCount(newQuery);
  };

  const selectRowOnchange = (selectRowKeys, selectedRows) => {
    const newIds = selectedRows.map(row => row.id);
    setSelectedRowKeys(selectRowKeys);
    setIds(newIds);
  };

  const mulitIgnoreEvent = () => {
    const { alarmList } = eventAnalysis;
    if (ids.length === 0) {
      message.error('未选择事件');
      return;
    }
    const ignoredList = alarmList.list.filter(
      event => ids.indexOf(event.id) > -1 && event.status === 'ignored'
    );
    if (ignoredList.length > 0) {
      message.error('请检查已勾选告警事件中是否包含已忽略事件，已忽略事件不能再进行忽略操作');
      setSelectedRowKeys([]);
      setIds([]);
      return;
    }
    confirm({
      title: '忽略后不可恢复，确定忽略吗',
      onOk() {
        dispatch({ type: 'eventAnalysis/ignoreEvent', payload: { ids } })
          .then(() => {
            message.success('已将该告警事件标识为“已忽略”状态，有延时，请稍后刷新页面查看');
            fetchAlarmData(query);
            fetchFilterCount(query);
          })
          .catch(error => {
            message.error(error.msg);
          });
        setSelectedRowKeys([]);
        setIds([]);
      },
      onCancel() { },
    });
  };

  const changeMode = (modeParam, globalSearchInput) => {
    if (modeParam) {
      // 由高级模式切换到简单模式
      if (globalSearchInput) {
        // 高级到简单-全局搜索内容要清空
        globalSearchInput.input.input.value = '';
      }
      const filterObj = getFilterObj(true, filterDefaultList);
      const dirObj = getDirStatus(true, filterDefaultList);
      const mustObj = getMustStatus(true, filterDefaultList);
      const newActionStatus = getActionStatus(filterObj);
      const startTime = moment()
        .subtract(1, 'day')
        .valueOf();
      const endTime = moment().valueOf();
      const newQuery = Object.assign({}, query, {
        filterObj,
        dirObj,
        mustObj,
        startTime,
        endTime,
        pageSize: 20,
        page: 1,
        dir: 'desc',
        sort: 'timestamp',
        search: '',
      });
      fetchAlarmData(newQuery);
      fetchFilterCount(newQuery);
      setQuery(newQuery);
      setPreQuery({ preFilterObj: filterObj, preMustObj: mustObj });
      setFilterArr([]);
      setTimeRange(1);
      setActionStatus(newActionStatus);
      setMode(!modeParam);
      bus.emit('clearInput');
      return;
    }
    setMode(!modeParam);
    setPreQuery({ preFilterObj: query.filterObj, preMustObj: query.mustObj });
  };

  const timePickerOnchange = arr => {
    const newQuery = Object.assign({}, query, { startTime: arr[0], endTime: arr[1] });
    setQuery(Object.assign({}, query, { startTime: arr[0], endTime: arr[1] }));
    setPreQuery({ preFilterObj: query.filterObj, preMustObj: query.mustObj });
    setTimeRange(arr[2]);
    setIsAllCheck(false);
    setSelectedRowKeys([]);
    setIds([]);
    fetchAlarmData(newQuery);
    fetchFilterCount(newQuery);
  };

  const { ccsLevel = '', curCcsVal = '', clusterNameIp = {} } = ccsData;
  const { alarmList, alarmChart } = eventAnalysis;
  let tableColumns = columns
  if (ccsLevel === 'leader' && tableColumns[1] && tableColumns[1].key && tableColumns[1].key !== 'devid') {
    const devidCloumn = {
      title: '设备',
      key: 'devid',
      dataIndex: 'devid',
      width: 120,
      render: (text, record) => {
        const { esIndex } = record;
        if (esIndex.indexOf(':') > -1) {
          const devid = esIndex.split(':')[0];
          return clusterNameIp[devid] || '';
        }
        return curCcsVal;
      },
    };
    tableColumns.splice(1, 0, devidCloumn);
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: selectRowOnchange,
  };
  const listPageStyle = cx({
    eventBlock: true,
  });
  // 伸缩
  tableColumns = tableColumns.map((col, index) => ({
    ...col,
    onHeaderCell: column => ({
      width: column.width || 150,
      onResize: handleResize(index),
    }),
  }));
  const newTableColumns = [].concat(tableColumns, lastcolumns);
  newTableColumns.push({
    title: '',
    key: '',
    dataIndex: '',
  })
  return (
    <div className="contentWraper">
      <div className="commonHeader" style={{ position: 'relative', display: "flex" }}>
        <span className={styles.headerTitle}>高级分析事件</span>
        <Link className={styles.headerRoute} style={{ fontSize: "14px", color: '#2662EE', cursor: "pointer" }} to="/tactics/advancedAnalysis">高级分析策略管理</Link>
      </div>
      <div className="container">
        <div className={listPageStyle}>
          <Row className={styles.titleBlock}>
            {/* <Col span={2}>
              <TimeRangePicker
                customOptions={options}
                timeRange={timeRange}
                startTime={query.startTime}
                endTime={query.endTime}
                timePickerOnchange={timePickerOnchange}
              />
            </Col> */}
            {selctedItemsRender()}
          </Row>
          <Layout className={styles.contentBlock}>
            <Sider
              width={sideWidth}
              style={{
                overflow: 'auto',
                position: 'relative',
                left: siderbarIsOpen ? 0 : `${-sideWidth}px`,
                margin: '10px 0 0 10px',
                backgroundColor: '#ffffff',
              }}
            >{Object.keys(query.filterObj).length > 0 && (
              <FilterBar
                isOpen={siderbarIsOpen}
                filterObj={query.filterObj}
                width={sideWidth - 1}
                btnManageLeft={0 - btnManageLeft}
                dirObj={query.dirObj}
                filterList={pickedFilterList}
                globalSearch={globalSearch}
                globalSearchChange={globalSearchChange}
                sortAction={sortAction}
                checkboxOnchange={checkboxOnchange}
                hasManageBtn
                triggerFilterListManger={() => setFilterModalVisiable(true)}
                filterPrefix="analysis"
                query={query}
                preQuery={preQuery}
                filterQuickSelect={filterQuickSelect}
                mustObj={query.mustObj}
                mode={mode}
                changeMode={changeMode}
                mustAction={mustAction}
                partActionStatus={actionStatus}
                fetchData={fetchData}
                rwAuth={analysisAuth}
                customOptions={options}
                timeVisible={timeVisible}
                timeRange={timeRange}
                startTime={query.startTime}
                endTime={query.endTime}
                timePickerOnchange={timePickerOnchange}
              />
            )}
            </Sider>
            {siderbarIsOpen && (
              <div
                style={{
                  position: 'relative',
                  right: 0,
                  width: '5px',
                  borderLeft: '1px solid #DBDBDB',
                  zIndex: 10,
                  cursor: 'e-resize',
                }}
                onMouseDown={e => {
                  mouseDown(e);
                }}
              />
            )}
            <div
              className={styles.handlebtn}
              style={{ marginLeft: siderbarIsOpen ? -5 : `${-sideWidth}px` }}
            >
              <span
                onClick={triggerSiderbar}
                className={siderbarIsOpen ? styles.switch : styles.switchBlue}
              />
            </div>
            <Layout>
              <div style={{ paddingTop: 10 }}>
                <p style={{ backgroundColor: "#fff", padding: 20 }}>{`高级分析事件趋势 ${moment(query.startTime).format('YYYY-MM-DD HH:mm')} 至 ${moment(query.endTime).format('YYYY-MM-DD HH:mm')}`} </p>
              </div>
              <LineChartMul
                style={{ backgroundColor: '#ffffff' }}
                data={alarmChart.list}
                height={240}
                hasLegend
                color={['key', ['#2A62D1', '#4BB6EB', '#e07b3a', '#3ea888', '#eec850']]}
                transform={dv => {
                  dv.transform({
                    type: 'fold',
                    fields: alarmChart.typeList,
                    key: 'key',
                    value: 'value',
                  });
                }}
                showToolTip
                scale={{
                  time: {
                    tickCount: 20,
                    formatter: key => moment(key).format('MM/DD HH:mm'),
                  },
                  value: {
                    formatter: value => {
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
                padding={[50, 100, 80, 100]}
              />
              <div className={styles.tableBlock}>
                <div className={styles.handleBlock}>
                  <div className={styles.handleBar}>
                    {analysisAuth === 'rw' && (
                      <Button
                        className="smallWhiteBtn"
                        style={{ marginRight: 8 }}
                        onClick={mulitIgnoreEvent}
                      >
                        忽略
                      </Button>
                    )}
                  </div>
                  <div className={styles.settingBlock} onClick={() => setColumnModalVisiable(true)}>
                    <span className={styles.settingBtn} />
                    <span style={{ marginLeft: 10 }}>管理</span>
                  </div>
                </div>
                <Table
                  rowKey="id"
                  loading={tableLoading || tableLoading1}
                  rowSelection={rowSelection}
                  scroll={{ x: tableScrollX }}
                  bordered={false}
                  components={components}
                  pagination={{
                    showSizeChanger: !isAllCheck,
                    defaultPageSize: query.pageSize,
                    pageSizeOptions: ['20', '30', '50'],
                    current: query.page,
                    total: alarmList.total,
                    showQuickJumper: true,
                    showTotal: total => `（${total}项）`,
                  }}
                  columns={newTableColumns}
                  dataSource={alarmList.list}
                  size="middle"
                  onChange={handleTableChange}
                  rowClassName={(record, index) =>
                    index.toString() === currentHoverRow ? styles.handleAction : ''
                  }
                  onRow={(record, index) => ({
                    onMouseEnter: () => setCurrentHoverRow(index.toString()),
                    onMouseLeave: () => setCurrentHoverRow(''),
                  })}
                />
                {alarmList.gt10000 && (
                  <div className={styles.flexEnd}>
                    {/* <span>页面最多展示10000条数据</span> */}
                  </div>
                )}
              </div>
            </Layout>
            <ItemManageModal
              title="状态栏管理"
              type="filter"
              visible={filterModalVisiable}
              allList={canOrderList}
              pickedList={pickedFilterList}
              fieldManage={fieldManage}
              onCancel={() => setFilterModalVisiable(false)}
            />
            <ItemManageModal
              title="显示列管理"
              type="column"
              visible={columnModalVisiable}
              allList={fieldNameList}
              pickedList={columnDefaultList}
              fieldManage={fieldManage}
              onCancel={() => setColumnModalVisiable(false)}
            />
          </Layout>
        </div>
        <EventDrawerWidget ref={drawerRef} />
      </div>
    </div>
  );
};

export default connect(({ global, msgNotify, eventAnalysis, loading }) => ({
  ccsData: global.ccsData,
  eventAnalysis,
  locationImgs: msgNotify.locationImgs,
  filterLoading: loading.effects['eventAnalysis/fetchFilterCount'],
  tableLoading: loading.effects['eventAnalysis/fetchAlarmList'],
  tableLoading1: loading.effects['eventAnalysis/ignoreEvent'],
}))(EventAnalysis);

