/* eslint-disable no-unused-expressions */
import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import { CloseOutlined, DownSquareOutlined, SettingTwoTone } from '@ant-design/icons';
import {
  Table,
  Modal,
  Row,
  Col,
  Tooltip,
  Badge,
  Button,
  Popover,
  Layout,
  message,
  Tag,
} from 'antd';
// import {  Sticky } from 'react-sticky';
import { Resizable } from 'react-resizable';
import moment from 'moment';
import { Link } from 'umi';
import classNames from 'classnames/bind';
import bus from '@/utils/event';
import cloneDeep from 'lodash/cloneDeep';
// import union from 'lodash/union';
import difference from 'lodash/difference';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import FilterBar from '@/components/FilterBar';
import ItemManageModal from '@/components/ItemManageModal';
// import ButtonBlock from '@/components/ButtonBlock';
// import { returnAtIndex } from '@/lodash-decorators/utils';
import HeatBrush from './Alarm/HeatBrush';
import styles from './Alarm/AlarmList.less';
import authority from '@/utils/authority';
const { getAuth } = authority;
import EventAlertDrawer from '../DrawerDetail/EventAlert';
import EventAptDrawer from '../DrawerDetail/EventApt';
import EventIocDrawer from '../DrawerDetail/EventIoc';
// import downloadFile from '@/tools/download';
// import AddSurvey from '../../Search/AddSurvey';
// import FormWrap from '../../WorkOrder/Platform/FormWrap';
// import TagEdit from '../Warn/TagEdit';

/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-shadow */

import configSettings from '../../../configSettings';
import {
  fieldNameList,
  defaultFilterListKey,
  defaultColumnKeys,
  setShowList,
  canOrderList,
  columnRender,
  timeKey,
} from './Alarm/FieldNameList';

const { Sider } = Layout;
const { alarmEventValueMap } = configSettings;

// const intentType = Object.keys(alarmEventValueMap.intent)
//     .map(key => alarmEventValueMap.intent[key])
//     .reverse();
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
class EventOverview extends Component {
  constructor(props) {
    super(props);
    this.alarmAuth = getAuth('/event/safeEvent/alarm');
    this.firstcolumns = [
      {
        title: '',
        width: 20,
        key: 'iconAction',
        dataIndex: '',
        render: (text, record, index) => {
          let actionStyle;
          const {
            eventOverview: { alarmList },
          } = this.props;
          const { showOperation } = this.state;
          const path = this.getEventDetailRoute(record.category_1);
          if (index < alarmList.list.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }
          return (
            <div style={{ width: 20 }}>
              <div className={styles.tableAction}>
                <DownSquareOutlined
                  onClick={() => {
                    this.setOperation();
                  }}
                  style={{ color: '#5cbaea' }} />
                {showOperation && (
                  <div className={styles.actionContent} style={actionStyle}>
                    {record.status === 'unhandled' && this.alarmAuth === 'rw' && (
                      <Fragment>
                        <p
                          onClick={() => {
                            this.dataHandler('handled', record.id);
                            this.setState({
                              showOperation: false,
                              isAllCheck: false,
                              selectedRowKeys: [],
                              ids: [],
                            });
                          }}
                        >
                          处理
                        </p>
                        {record.status === 'unhandled' && (
                          <p
                            onClick={() => {
                              this.dataHandler('ignore', record.id);
                              this.setState({
                                showOperation: false,
                                isAllCheck: false,
                                selectedRowKeys: [],
                                ids: [],
                              });
                            }}
                          >
                            忽略
                          </p>
                        )}
                      </Fragment>
                    )}
                    <Link
                      target="_blank"
                      to={`/event/safeEvent/${path}?id=${record.id}&tsOldest=${record.tsOldest}&tsLatest=${record.tsLatest}`}
                    >
                      详情
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
    ];
    this.lastcolumns = [
      {
        title: '操作',
        key: 'lastIocnAction',
        dataIndex: 'action',
        fixed: 'right',
        width: 100,
        render: (text, record) => {
          // const path = this.getEventDetailRoute(record.category_1);
          const popContent = (
            <div>
              {record.status === 'unhandled' && this.alarmAuth === 'rw' && (
                <Fragment>
                  <div style={{ width: '35px' }}>
                    <a
                      onClick={() => {
                        this.dataHandler('handled', record.id);
                        this.setState({
                          showOperation: false,
                          isAllCheck: false,
                          selectedRowKeys: [],
                          ids: [],
                        });
                      }}
                    >
                      处理
                    </a>
                  </div>
                  <div style={{ width: '35px' }}>
                    <a
                      onClick={() => {
                        this.dataHandler('ignore', record.id);
                        this.setState({
                          showOperation: false,
                          isAllCheck: false,
                          selectedRowKeys: [],
                          ids: [],
                        });
                      }}
                    >
                      忽略
                    </a>
                  </div>
                </Fragment>
              )}
              <div style={{ width: '35px' }}>
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
                width="200px"
                // visible={true}
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

    // if (props.hasVpc) {
    //   this.vpcidcolumns = [
    //     {
    //       title: 'VPCID',
    //       dataIndex: 'vpcid',
    //       key: 'vpcid',
    //       width: 90,
    //     },
    //   ];
    // }

    this.fixTableRender = {
      name: (text, record) => (
        <Tooltip placement="top" title={text}>
          <a
            className="ellipsis"
            onClick={() => {
              this.detailShowClick(record);
            }}
          >
            {text}
          </a>
        </Tooltip>
      ),
      originalIds: (text) => text.length,
      'affectedAssets.ip': (text, record) => {
        const { affectedAssets } = record;
        const arr = configSettings.ipsNoRepeat(affectedAssets);
        const popContent = (
          <div>
            {arr.map((item) => {
              if (item.assetName) {
                return (
                  <p key={item.ip} style={{ marginBottom: '4px' }}>
                    {`${item.assetName}(${item.ip})`}
                  </p>
                );
              }
              return <p key={item.ip}>{item.ip}</p>;
            })}
          </div>
        );
        return (
          <div className={styles.popoverLimitHei}>
            {arr.length > 1 ? (
              <Popover
                content={popContent}
                getPopupContainer={(triggerNode) => triggerNode}
                placement="bottomLeft"
                title="受影响资产"
              >
                <p>
                  多个( <span className="fontBlue"> {arr.length} </span>)
                </p>
              </Popover>
            ) : (
              <p>
                {arr[0] && arr[0].assetName ? (
                  <p>{`${arr[0].assetName}(${arr[0].ip})`}</p>
                ) : (
                  <p>{arr[0] ? `${arr[0].ip}` : ''}</p>
                )}
              </p>
            )}
          </div>
        );
      },
      'src.ip': (text, record) => {
        const { src, attackerIps, victimIps, iocType = '' } = record;
        const ipCateObj = {};
        // iocType:domain的威胁情报告警，不显示攻击者标签，仅显示受害者
        if (iocType !== 'domain') {
          attackerIps.forEach((tmp) => {
            ipCateObj[tmp] = '攻击者';
          });
        }
        victimIps.forEach((tmp) => {
          ipCateObj[tmp] = '受害者';
        });
        const { locationImgs } = this.props;

        const srcArr = configSettings.ipsNoRepeat(src);

        const urls = configSettings.urlKey('ip');
        const popContent = (
          <div>
            {srcArr.map((item) => (
              <div>
                {item.ipCountry === '内网' ? (
                  <p key={item.ip} className={styles.marginBtm}>
                    {item.ip}
                    {/* {item.ipCountry ? `(${item.ipCountry})` : ''} */}
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
                ) : (
                  <Popover
                    content={this.urlPopContent(item.ip, urls)}
                    getPopupContainer={(triggerNode) => triggerNode}
                    placement="bottomLeft"
                  >
                    <p key={item.ip} className={styles.marginBtm}>
                      {item.ipCountry && locationImgs.indexOf(item.ipCountry) > -1 && (
                        <span
                          title={`${item.ipCountry}${item.ipProvince ? ` ${item.ipProvince}` : ''}${
                            item.ipCity && configSettings.topCity.indexOf(item.ipCity) < 0
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
                getPopupContainer={(triggerNode) => triggerNode}
                placement="bottomLeft"
                title="源IP"
              >
                <p>
                  多个( <span className="fontBlue"> {srcArr.length} </span>)
                </p>
              </Popover>
            ) : (
              <div style={{ whiteSpace: 'noWrap' }}>
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
                                      `${
                                        ipCateObj[srcArr[0].ip] === '攻击者'
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
                            content={this.urlPopContent(srcArr[0].ip, urls)}
                            getPopupContainer={(triggerNode) => triggerNode}
                            placement="bottomLeft"
                          >
                            <div>
                              <Tooltip title={srcArr[0].ip}>
                                <p className={styles.ipShow}>
                                  {srcArr[0].ipCountry &&
                                    locationImgs.indexOf(srcArr[0].ipCountry) > -1 && (
                                      <span
                                        title={`${srcArr[0].ipCountry}${
                                          srcArr[0].ipProvince ? ` ${srcArr[0].ipProvince}` : ''
                                        }${
                                          srcArr[0].ipCity &&
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
                                        `${
                                          ipCateObj[srcArr[0].ip] === '攻击者'
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
        // iocType:domain的威胁情报告警，不显示攻击者标签，仅显示受害者
        if (iocType !== 'domain') {
          attackerIps.forEach((tmp) => {
            ipCateObj[tmp] = '攻击者';
          });
        }
        victimIps.forEach((tmp) => {
          ipCateObj[tmp] = '受害者';
        });
        const { locationImgs } = this.props;

        const dstArr = configSettings.ipsNoRepeat(dst);
        const urls = configSettings.urlKey('ip');
        const popContent = (
          <div>
            {dstArr.map((item) => (
              <div>
                {item.ipCountry === '内网' ? (
                  <p key={item.ip} className={styles.marginBtm}>
                    {item.ip}
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
                ) : (
                  <Popover
                    content={this.urlPopContent(item.ip, urls)}
                    getPopupContainer={(triggerNode) => triggerNode}
                    placement="bottomLeft"
                  >
                    <p key={item.ip} className={styles.marginBtm}>
                      {item.ipCountry && locationImgs.indexOf(item.ipCountry) > -1 && (
                        <span
                          title={`${item.ipCountry}${item.ipProvince ? ` ${item.ipProvince}` : ''}${
                            item.ipCity && configSettings.topCity.indexOf(item.ipCity) < 0
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
                getPopupContainer={(triggerNode) => triggerNode}
                placement="bottomLeft"
                title="目的IP"
              >
                <p>
                  多个( <span className="fontBlue"> {dstArr.length} </span>)
                </p>
              </Popover>
            ) : (
              <div style={{ whiteSpace: 'noWrap' }}>
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
                                      `${
                                        ipCateObj[dstArr[0].ip] === '攻击者'
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
                            content={this.urlPopContent(dstArr[0].ip, urls)}
                            getPopupContainer={(triggerNode) => triggerNode}
                            placement="bottomLeft"
                          >
                            <div>
                              <Tooltip title={dstArr[0].ip}>
                                <p className={styles.ipShow}>
                                  {dstArr[0].ipCountry &&
                                    locationImgs.indexOf(dstArr[0].ipCountry) > -1 && (
                                      <span
                                        title={`${dstArr[0].ipCountry}${
                                          dstArr[0].ipProvince ? ` ${dstArr[0].ipProvince}` : ''
                                        }${
                                          dstArr[0].ipCity &&
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
                                        `${
                                          ipCateObj[dstArr[0].ip] === '攻击者'
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
              {srcArr.map((item) => (
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
                getPopupContainer={(triggerNode) => triggerNode}
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
              {dstArr.map((item) => (
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
                getPopupContainer={(triggerNode) => triggerNode}
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
      'affectedAssets.ipMac': (text, record) => {
        const { affectedAssets } = record;
        const assetArr = affectedAssets.filter((tmp) => tmp.ipMac);
        if (assetArr.length > 1) {
          const popContent = (
            <div>
              {assetArr.map((item) => (
                <div>
                  <p key={item.ipMac}>{item.ipMac}</p>
                </div>
              ))}
            </div>
          );
          return (
            <div className={styles.popoverLimitHei}>
              <Popover
                content={popContent}
                getPopupContainer={(triggerNode) => triggerNode}
                placement="bottomLeft"
                title="受影响资产IPMAC"
              >
                <p>
                  多个( <span className="fontBlue"> {assetArr.length} </span>)
                </p>
              </Popover>
            </div>
          );
        }
        return assetArr[0] && assetArr[0].ipMac ? assetArr[0].ipMac : '';
      },
      attackStage: (text) => {
        const { color, bgColor, borderColor } = configSettings.attackStageMap(text);
        return (
          <span
            style={{
              padding: '2px 10px',
              color,
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
              whiteSpace: 'noWrap',
            }}
          >
            {text}
          </span>
        );
      },
      score: (text) => {
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
        src.forEach((tmp) => {
          ipCateObj[tmp.ip] = '源';
        });
        dst.forEach((tmp) => {
          ipCateObj[tmp.ip] = '目的';
        });

        const popContent = (
          <div className="popContentWrap" getPopupContainer={(triggerNode) => triggerNode}>
            {text.map((ip) => (
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
                getPopupContainer={(triggerNode) => triggerNode}
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
        src.forEach((tmp) => {
          ipCateObj[tmp.ip] = '源';
        });
        dst.forEach((tmp) => {
          ipCateObj[tmp.ip] = '目的';
        });

        const popContent = (
          <div className="popContentWrap" getPopupContainer={(triggerNode) => triggerNode}>
            {text.map((ip) => (
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
                getPopupContainer={(triggerNode) => triggerNode}
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
      attackResult: (text) => {
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
      status: (text) => {
        const {
          alarmEventValueMap: { status },
        } = configSettings;
        return <div style={{ whiteSpace: 'noWrap' }}>{status[text] || ''}</div>;
      },
      status_tmp_no_use: (text, record) => {
        if (text === 'unhandled') {
          return (
            <div>
              <Badge status="processing" />
              未处理&nbsp;|&nbsp;
              <a
                onClick={() => {
                  this.dataHandler('handled', record.id);
                }}
              >
                处理
              </a>
            </div>
          );
        }
        return (
          <div>
            <Badge status="default" />
            {text === 'handled' ? '已处理' : '已忽略'}
          </div>
        );
      },
    };

    this.localFilterKeys = localStorage.getItem(`alarmFilterKeys`);
    this.localColumnKeys = localStorage.getItem(`alarmColumnKeys`);
    this.columnKey = this.localColumnKeys ? this.localColumnKeys.split(',') : defaultColumnKeys;
    this.filterKey = this.localFilterKeys ? this.localFilterKeys.split(',') : defaultFilterListKey;
    this.columnDefaultList = []; // 左侧栏新增
    this.filterDefaultList = []; // 左侧栏新增
    this.state = {
      // btnDisabled: false,
      // selectedRowKeys: [],
      query: {
        startTime: moment().subtract(1, 'day').valueOf(),
        endTime: moment().valueOf(),
        pageSize: 20,
        page: 1,
        dir: 'desc',
        sort: 'tsLatest',
        search: '',
        // status: [], // 左侧栏新增
        filterObj: {}, // 保存每个子分类的checkbox选中状态
        dirObj: {}, // 初始排序状态
        mustObj: {}, // 左侧栏新增
      },
      actionStatus: {}, // 左侧栏新增
      mode: true, // 左侧栏新增
      isAllCheck: false,
      timeRange: 1, // 默认时间范围
      // columns: columnDefaultList, // table所需columns
      // tableScrollX: columnDefaultList.length * 160, // 动态增加显示列，需要增加scrollX
      columns: [], // 左侧栏新增
      tableScrollX: 0, // 左侧栏新增
      tableScrollY: 0,
      siderbarIsOpen: true,
      filterModalVisiable: false, // 筛选栏管理modal显示状态
      columnModalVisiable: false, // 显示列表管理modal显示状态
      // pickedFilterList: filterDefaultList, // 选中的筛选栏字段
      pickedFilterList: [], // 选中的筛选栏字段 左侧栏新增
      sideWidth: 306,
      currentHoverRow: '', // 当前hover的行
      showOperation: false, // 显示操作
      selectedRowKeys: [],
      ids: [],
      fullScreen: false,
      btnManageLeft: 0,
      filterArr: [], // 左侧栏新增
      preQuery: {
        // 左侧栏新增
        // 保存点击搜索前的
        preFilterObj: {},
        preMustObj: {},
      },
      // selectedRows: [], // 已选择的行
      // selectedNum: 0,
      // checkAllPage: [], // 记录全选的页数
      // unCheckedIds: [],
      drawerVisible: false,
      drawerTitle: '',
      drawerQuery: {},
      timeVisible: true,
      h: 0,
    };
    // 伸缩
    this.components = {
      header: {
        cell: ResizableTitle,
      },
    };

    this.moving = false;
    this.lastX = null;

    this.defaultQuery = cloneDeep(this.state.query);
  }

  componentWillMount = () => {
    const {
      location: { query },
      hasVpc,
    } = this.props;
    const { filterDefaultList, columnDefaultList } = setShowList(
      this.columnKey,
      this.filterKey,
      this.fixTableRender
    );
    this.columnDefaultList = columnDefaultList;
    this.filterDefaultList = filterDefaultList;
    const filterObj = this.getFilterObj(true, filterDefaultList);
    const dirObj = this.getDirStatus(true, filterDefaultList);
    const mustObj = this.getMustStatus(true, filterDefaultList);
    const actionStatus = this.getActionStatus(filterObj);
    const columns = [];
    columnDefaultList.map((item) => {
      columns.push(item);
    });

    if (hasVpc) {
      columns.push({
        title: 'VPCID',
        dataIndex: 'vpcid',
        key: 'vpcid',
        width: 90,
      });
    }
    const bodywidth = document.body.offsetWidth - 306;
    columns.map((item) => {
      if (item.title === '事件名称') {
        item.width = bodywidth / 9;
      } else if (item.title === '源IP') {
        item.width = bodywidth / 9.5;
      } else if (item.title === '目的IP') {
        item.width = bodywidth / 9.5;
      } else if (item.title === '攻击意图') {
        item.width = bodywidth / 10.5;
      } else if (item.title === '攻击结果') {
        item.width = bodywidth / 13;
      } else if (item.title === '告警次数') {
        item.width = bodywidth / 17;
      } else if (item.title === '感知类型') {
        item.width = bodywidth / 13.5;
      } else if (item.title === 'VPCID') {
        item.width = bodywidth / 18;
      } else if (item.title === '告警时间') {
        item.width = bodywidth / 13;
      } else {
        item.width = bodywidth / 12;
      }
      return item.width;
    });

    const tableScrollX = columns.length * 90;
    const pickedFilterList = filterDefaultList;

    const { query: stateQuery } = this.state;
    const queryKeys = Object.keys(query);

    // const paramFilterList = [];
    const newFilterObj = cloneDeep(filterObj);
    const newDirObj = cloneDeep(dirObj);
    const newMustObj = cloneDeep(mustObj);
    const newActionObj = cloneDeep(actionStatus);

    const paramFilterList = [...pickedFilterList];
    const pickedFilterListCurKeys = pickedFilterList.map((tmpobj) => tmpobj.key);
    queryKeys.forEach((key) => {
      const obj = fieldNameList.find(
        (item) =>
          item.key === key && !['startTime', 'endTime', 'search', 'sort', 'dir'].includes(key)
      );
      if (obj) {
        const filterIndex = pickedFilterListCurKeys.indexOf(key);

        if (filterIndex < 0) {
          paramFilterList.push(obj);
        } else {
          paramFilterList[filterIndex] = obj;
        }
        if (Array.isArray(query[key])) {
          newFilterObj[obj.key] = query[key];
        } else {
          try {
            const keyArr = JSON.parse(query[key]);
            if (Array.isArray(keyArr)) {
              newFilterObj[obj.key] = keyArr;
            } else {
              newFilterObj[obj.key] = [decodeURIComponent(query[key])];
            }
          } catch (error) {
            newFilterObj[obj.key] = [decodeURIComponent(query[key])];
          }
        }
        newDirObj[obj.key] = 'desc';
        newMustObj[obj.key] = true;
        newActionObj[obj.key] = newFilterObj[obj.key].length > 0;
      }
    });

    const list = paramFilterList;
    let otherObj = {};
    let range = 1;
    if (query.startTime && query.endTime) {
      otherObj = {
        startTime: parseInt(query.startTime, 10),
        endTime: parseInt(query.endTime, 10),
      };
      range = `${moment(parseInt(query.startTime, 10)).format('YYYY-MM-DD HH:mm:ss')} 至 ${moment(
        parseInt(query.endTime, 10)
      ).format('YYYY-MM-DD HH:mm:ss')}`;
    }

    if (query.search) {
      otherObj.search = decodeURIComponent(query.search);
    }
    if (query.sort) {
      otherObj.sort = decodeURIComponent(query.sort);
    }
    if (query.dir) {
      otherObj.dir = decodeURIComponent(query.dir);
    }
    if (query.timeRange) {
      range = parseInt(query.timeRange, 10);
      otherObj = Object.assign(otherObj, {
        startTime: moment().subtract(range, 'days').valueOf(),
        endTime: moment().valueOf(),
      });
    }

    this.setState(
      {
        pickedFilterList: list,
        columns,
        tableScrollX,
        query: Object.assign({}, stateQuery, {
          ...otherObj,
          filterObj: newFilterObj,
          dirObj: newDirObj,
          mustObj: newMustObj,
          eventid: query.eventid || '',
        }),
        timeRange: range,
        actionStatus: newActionObj,
        preQuery: {
          preFilterObj: newFilterObj,
          preMustObj: newMustObj,
        },
      },
      () => {
        this.defaultQuery = cloneDeep(this.state.query);
        this.fetchAlarmData();
        this.fetchFilterCount();
      }
    );
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'msgNotify/fetchLocationImg' });

    this.leftscroll();
    const self = this;
    const curscrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    if (curscrollLeft !== 0) {
      this.setState({ btnManageLeft: curscrollLeft });
    }
    window.onscroll = () => {
      const { btnManageLeft: stateLeft } = self.state;
      const btnManageLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
      if (stateLeft !== btnManageLeft) {
        this.setState({ btnManageLeft });
      }
    };
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
        window.location.pathname === '/event/safeEvent/alarm' &&
        document.getElementsByClassName('ant-table-row-level-0')[0]
      ) {
        // console.log( document.getElementsByClassName('ant-table-fixed-right')[0])
        const childrens = document.getElementsByClassName('ant-table-thead')[0].children[0]
          .children;
        document.getElementsByClassName('ant-table-fixed-right')[0].style.zIndex = 999;

        for (let index = 0; index < childrens.length; index++) {
          const item = document.getElementsByClassName('ant-table-column-title')[index].innerHTML;

          if (item === '操作') {
            const docItem = document.getElementsByClassName('ant-table-thead')[1];
            if (document.documentElement.scrollTop > this.state.h) {
              docItem.style.position = 'fixed';
              docItem.style.width = '50px';
              docItem.style.top = '48px';
              docItem.style.right = '33px';
              docItem.style.zIndex = 999;
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
        if (document.documentElement.scrollTop > this.state.h) {
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
        } else {
          fdocItem.style.position = 'static';
        }
      }

      this.newscroll();
      this.leftfixed();
    };
  }

  componentWillReceiveProps(nextProps) {
    const {
      filterLoading,
      eventOverview: { filterCount, drawerList },
    } = nextProps;
    const { filterLoading: old } = this.props;
    const {
      pickedFilterList,
      query: { dirObj },
      drawerQuery,
      drawerVisible,
      // selectedNum,
      // isAllCheck,
      // checkAllPage,
      // selectedRowKeys,
      // unCheckedIds,
    } = this.state;
    const { drawerID = '', drawerFLAG = 'alarm', id: oldDrawerId } = drawerQuery;
    // 左侧抽屉详情
    const curDrawerList = drawerList.alarm[drawerID];
    if (drawerVisible && drawerID && curDrawerList && curDrawerList.length) {
      const lastDrawerObj = curDrawerList[curDrawerList.length - 1];
      const lastId = lastDrawerObj.id;
      if (oldDrawerId !== lastId) {
        const newDrawerQuery = {
          drawerID,
          drawerFLAG,
          id: lastId,
          tsOldest: lastDrawerObj.tsOldest,
          tsLatest: lastDrawerObj.tsLatest,
          category_1: lastDrawerObj.category_1,
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

    if (!filterLoading && old) {
      const newList = [].concat(pickedFilterList);
      newList.forEach((item) => {
        const { key } = item;
        item.list = filterCount && filterCount[key] ? filterCount[key].buckets : [];
        if (alarmEventValueMap[key]) {
          item.list.forEach((element) => {
            const title = alarmEventValueMap[key][element.key];
            element.title = title;
          });
        }
        if (key === 'score') {
          const scoreArr = [...item.list];
          const scoreList = configSettings.scoreFilterListShow(scoreArr, dirObj.score);
          item.list = scoreList;
        }
      });
      this.setState({ pickedFilterList: newList });
    }
    // if (checkAllPage.includes(page) && isAllCheck && selectedNum >= 0) {
    //     const selectedRows = alarmList.list.filter(item => !unCheckedIds.includes(item.id));
    //     const ids = selectedRows.map(item => item.id);
    //     this.setState({
    //         selectedRowKeys: selectedRowKeys.concat(ids),
    //         selectedRows,
    //     });
    // }
  }

  componentWillUnmount() {
    // 左侧抽屉详情数据清空
    const {
      dispatch,
      eventOverview: { drawerList },
    } = this.props;
    drawerList.alarm = {};
    dispatch({ type: 'eventOverview/saveFilterCount', payload: { drawerList } });
  }

  getEventDetailRoute = (category) => {
    let path = '';
    switch (category) {
      case '入侵感知':
        path = 'alert';
        break;
      case '失陷感知':
        path = 'ioc';
        break;
      case '异常文件感知':
        path = 'apt';
        break;
      default:
        break;
    }
    return path;
  };

  leftscroll = () => {
    if (document.getElementsByClassName('ant-layout-sider-children')[0]) {
      const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
      const menutop = document.documentElement.clientHeight;
      leftmenu.style.height = `${menutop - 125}px`;
    }
  };

  changeH = () => {
    if (this.state.fullScreen) {
      this.setState({ h: 155 });
    } else {
      this.setState({ h: 419 });
    }
  };

  // 左侧 浮动
  leftfixed = () => {
    this.changeH();
    if (
      this.state.siderbarIsOpen &&
      document.getElementsByClassName('ant-layout-sider-children')[0] &&
      document.getElementsByClassName('ant-layout-sider')[0]
    ) {
      document.getElementsByClassName('ant-layout-sider')[0].style.zIndex = 999;
      const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
      const leftWidth = document.getElementsByClassName('ant-layout-sider')[0].style.width;
      const menutop = document.documentElement.clientHeight;
      if (document.documentElement.scrollTop > 115) {
        leftmenu.style.height = `${menutop - 125}px`;
        leftmenu.style.width = leftWidth;
        leftmenu.style.position = 'fixed';
        leftmenu.style.top = '48px';
        leftmenu.style.left = '12px';
      } else {
        leftmenu.style.position = 'static';
        leftmenu.style.overflow = 'hidden';
      }
    } else if (
      document.getElementsByClassName('ant-layout-sider-children')[0] &&
      document.getElementsByClassName('ant-layout-sider')[0]
    ) {
      const fdocConcent = document.getElementsByClassName('ant-table-content')[0];
      const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
      fdocConcent.style.width = '100%';
      leftmenu.style.position = 'static';
      leftmenu.style.overflow = 'hidden';
    }
  };

  // 滚动
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

          window.onmousemove = (e) => {
            if (e && e.preventDefault) {
              e.preventDefault();
            } else {
              window.event.returnValue = false;
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
      window.location.pathname === '/event/safeEvent/alarm' &&
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
          if (document.documentElement.scrollTop > this.state.h) {
            docItem.style.position = 'fixed';
            docItem.style.width = '50px';
            docItem.style.top = '48px';
            docItem.style.right = '33px';
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
      if (document.documentElement.scrollTop > this.state.h) {
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

  // 事件
  setOperation = () => {
    const { showOperation } = this.state;
    this.setState({ showOperation: !showOperation });
  };

  leftscroll = () => {
    if (document.getElementsByClassName('ant-layout-sider-children')[0]) {
      const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
      const menutop = document.documentElement.clientHeight;
      leftmenu.style.height = `${menutop - 125}px`;
    }
  };

  changeH = () => {
    if (this.state.fullScreen) {
      this.setState({ h: 155 });
    } else {
      this.setState({ h: 419 });
    }
  };

  // 左侧 浮动
  leftfixed = () => {
    this.changeH();
    if (
      this.state.siderbarIsOpen &&
      document.getElementsByClassName('ant-layout-sider-children')[0] &&
      document.getElementsByClassName('ant-layout-sider')[0]
    ) {
      document.getElementsByClassName('ant-layout-sider')[0].style.zIndex = 999;
      const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
      const leftWidth = document.getElementsByClassName('ant-layout-sider')[0].style.width;
      const menutop = document.documentElement.clientHeight;
      if (document.documentElement.scrollTop > 115) {
        leftmenu.style.height = `${menutop - 106}px`;
        leftmenu.style.width = leftWidth;
        leftmenu.style.position = 'fixed';
        leftmenu.style.top = '48px';
        leftmenu.style.left = '10px';
      } else {
        leftmenu.style.position = 'static';
        leftmenu.style.overflow = 'hidden';
      }
    } else if (
      document.getElementsByClassName('ant-layout-sider-children')[0] &&
      document.getElementsByClassName('ant-layout-sider')[0]
    ) {
      const fdocConcent = document.getElementsByClassName('ant-table-content')[0];
      const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
      fdocConcent.style.width = '100%';
      leftmenu.style.position = 'static';
      leftmenu.style.overflow = 'hidden';
    }
  };

  // 滚动
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
              window.event.returnValue = false; //兼容IE
            }
            const newe = e || event;
            const nx = newe.clientX;
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
      window.location.pathname === '/event/safeEvent/alarm' &&
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
          if (document.documentElement.scrollTop > this.state.h) {
            docItem.style.position = 'fixed';
            docItem.style.width = '50px';
            docItem.style.top = '48px';
            docItem.style.right = '33px';
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
      if (document.documentElement.scrollTop > this.state.h) {
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

  urlPopContent = (ip, urls) => (
    <div>
      {urls.map((item) => (
        <p>
          <a href={`${item.url}/${ip}`} target="blank">
            {item.name}
          </a>
        </p>
      ))}
    </div>
  );

  // 右侧详情
  detailShowClick = (record) => {
    const {
      dispatch,
      eventOverview: { drawerList },
      ccsData: { clusterNameIp = {} },
    } = this.props;
    drawerList.alarm[record.id] = [record];
    dispatch({ type: 'eventOverview/saveFilterCount', payload: { drawerList } });

    // 点击详情得时候把这条数据得设备名称也带过去ccsName（多设备切换在全部状态得时候，点击下级设备得数据，node那边需要用到设备名称）
    const { esIndex } = record;
    let ccsName = '';
    if (esIndex.indexOf(':') > -1) {
      const devid = esIndex.split(':')[0];
      ccsName = clusterNameIp[devid] || '';
    }

    this.setState({
      drawerVisible: true,
      drawerTitle: this.drawerTitleEle(record),
      drawerQuery: {
        drawerID: record.id,
        drawerFLAG: 'alarm',
        id: record.id,
        tsOldest: record.tsOldest,
        tsLatest: record.tsLatest,
        category_1: record.category_1,
        ccsName,
      },
    });
  };

  drawerTitleEle = (eventDetail) => {
    const { style, label } = configSettings.scoreTagMap(eventDetail.score);
    return (
      <div>
        <span className={styles.detailTopScore}>
          <span className={styles.detailScoreTag} style={style}>
            {label}
          </span>
        </span>
        <span className={styles.detailTopName}>{eventDetail.name}</span>
        <span className={styles.detailTopStatus}>
          {configSettings.statusMap[eventDetail.status]}
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
    const curList = drawerList.alarm[drawerQuery.drawerID];
    const len = curList.length;
    if (len > 1) {
      drawerList.alarm[drawerQuery.drawerID] = curList.slice(0, len - 1);
    } else {
      delete drawerList.alarm[drawerQuery.drawerID];
    }
    dispatch({ type: 'eventOverview/saveFilterCount', payload: { drawerList } });
    this.setState({ drawerVisible: false, drawerTitle: '', drawerQuery: {} });
  };

  // 左侧栏新增
  selctedItemsRender = () => {
    const {
      query: { filterObj, mustObj },
      filterArr,
    } = this.state;
    return (
      <Col span={21} className={styles.selectedList}>
        {Object.keys(filterObj).map((key) => {
          filterObj[key] = filterObj[key] || [];

          const mustFlag = mustObj[key];
          const valueArr = filterObj[key].map(
            (item) => {
              if (alarmEventValueMap[key]) {
                return alarmEventValueMap[key][item];
              }
              if (timeKey.indexOf(key) > -1) {
                return moment(Number(item)).format('YYYY-MM-DD HH:mm:ss');
              }

              // if (tenantIdKeys.indexOf(key) > -1) {
              //   return tenantMap[item] || item;
              // }

              // if (assetTypeKeys.indexOf(key) > -1) {
              //   return typeMap[item] || item;
              // }

              return item;
            }
            // alarmEventValueMap[key]
            //   ? alarmEventValueMap[key][item]
            //   : timeKey.indexOf(key) > -1
            //   ? moment(item).format('YYYY-MM-DD HH:mm:ss')
            //   : item,
          );
          const valueStr = valueArr.length > 1 ? valueArr.join('+') : valueArr.join('');
          return (
            <Fragment key={key}>
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
            </Fragment>
          );
        })}
        {/* </div> */}
        <div style={{ lineHeight: '28px', minWidth: '94px', paddingLeft: 10 }}>
          {filterArr.length !== 0 && (
            <div
              // style={{ margin: '4px' }}
              onClick={() => {
                this.clearSelect();
              }}
            >
              <a>清空筛选条件</a>
            </div>
          )}
        </div>
        {/* </div> */}
      </Col>
    );
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

  // 左侧栏新增
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

  // 显示列管理组件触发
  triggerColumnsManger = () => {
    const { columnModalVisiable } = this.state;
    this.setState({ columnModalVisiable: !columnModalVisiable });
  };

  triggerSiderbar = () => {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('resize', false, false);
    window.dispatchEvent(evt);
    const { siderbarIsOpen } = this.state;
    this.setState({ siderbarIsOpen: !siderbarIsOpen }, () => {
      this.leftfixed();
    });
  };

  //  排序切换
  sortAction = (key, dir) => {
    const {
      query,
      query: { dirObj },
      preQuery: { preFilterObj },
      mode,
    } = this.state;
    const newObj = Object.assign({}, dirObj, { [key]: dir });
    const newQuery = Object.assign({}, query, { dirObj: newObj });
    const sortQuery = Object.assign({}, query, { dirObj: newObj, filterObj: preFilterObj });
    this.setState({ query: newQuery });
    if (mode) {
      this.fetchFilterCount(sortQuery);
    } else {
      this.fetchFilterCount(newQuery);
    }
  };

  // 切换是非 左侧栏新增
  mustAction = (key, flag) => {
    const {
      query,
      query: { mustObj },
    } = this.state;
    const newObj = Object.assign({}, mustObj, { [key]: flag });
    const newQuery = Object.assign({}, query, { mustObj: newObj });
    this.setState({ query: newQuery });
    // this.fetchAlarmData(newQuery);
  };

  // 筛选条件选择 左侧栏新增
  checkboxOnchange = (key, data, checked) => {
    const {
      query,
      query: { filterObj, mustObj },
      filterArr,
      mode,
    } = this.state;
    const newObj = cloneDeep(filterObj);
    const newMustObj = cloneDeep(mustObj);
    let newFilterArr = cloneDeep(filterArr);
    if (checked) {
      newObj[key].push(data.key);
      newFilterArr.push(`${key}_${data.key}`);
    } else {
      newObj[key] = newObj[key].filter((item) => item !== data.key);
      newFilterArr = filterArr.filter((item) => item !== `${key}_${data.key}`);
    }
    const actionStatus = this.getActionStatus(newObj);
    if (!actionStatus[key]) {
      newMustObj[key] = true;
    }
    const newQuery = Object.assign({}, query, {
      filterObj: newObj,
      mustObj: newMustObj,
      page: 1,
      dir: 'desc',
      sort: 'tsLatest',
    });

    // 左侧栏新增
    if (mode) {
      this.setState({ query: newQuery, actionStatus, filterArr: newFilterArr });
      return;
    }

    this.setState(
      {
        query: newQuery,
        // selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        ids: [],
        actionStatus, // 左侧栏新增
        filterArr: newFilterArr, // 左侧栏新增
      },
      () => {
        this.fetchAlarmData(newQuery);
        this.fetchFilterCount(newQuery);
      }
    );
  };

  // 左侧栏新增
  fetchData = () => {
    const {
      query,
      query: { filterObj, mustObj },
    } = this.state;
    const newQuery = Object.assign({}, query, { page: 1 });
    this.setState({
      query: newQuery,
      preQuery: { preFilterObj: filterObj, preMustObj: mustObj },
      // selectedNum: 0,
      isAllCheck: false,
      selectedRowKeys: [],
      ids: [],
    });
    this.fetchAlarmData(newQuery);
    this.fetchFilterCount(newQuery);
  };

  // 管理栏筛选后处理
  fieldManage = (list, type) => {
    const fieldKey = type === 'filter' ? 'pickedFilterList' : 'columns';
    let handeldList = list;
    if (type === 'column') {
      const keyList = list.map((item) => item.key);
      handeldList = [];
      keyList.forEach((key) => {
        const obj = fieldNameList.find((item) => item.key === key);
        const column = {
          title: obj.title,
          dataIndex: obj.key,
          key: obj.key,
          // width: 140,
          sorter: obj.sort,
          render: columnRender(obj, this.fixTableRender),
        };
        if (alarmEventValueMap[obj.key]) {
          column.render = (text) => <span>{alarmEventValueMap[obj.key][text]}</span>;
        }
        handeldList.push(column);
      });
      localStorage.setItem('alarmColumnKeys', keyList.join(','));
      this.setState({
        [fieldKey]: handeldList,
        [`${type}ModalVisiable`]: false,
        tableScrollX: handeldList.length * 90,
      });
      if (this.props.hasVpc) {
        handeldList.push({
          title: 'VPCID',
          dataIndex: 'vpcid',
          key: 'vpcid',
          width: 90,
        });
      }
      const bodywidth = document.body.offsetWidth - 306;

      handeldList.map((item) => {
        if (item.title === '事件名称') {
          item.width = bodywidth / 9;
          console.log(item.width);
        } else if (item.title === '源IP') {
          item.width = bodywidth / 9.5;
        } else if (item.title === '目的IP') {
          item.width = bodywidth / 9.5;
        } else if (item.title === '攻击意图') {
          item.width = bodywidth / 10.5;
        } else if (item.title === '攻击结果') {
          item.width = bodywidth / 13;
        } else if (item.title === '告警次数') {
          item.width = bodywidth / 17;
        } else if (item.title === '感知类型') {
          item.width = bodywidth / 13.5;
        } else if (item.title === 'VPCID') {
          item.width = bodywidth / 18;
        } else if (item.title === '告警时间') {
          item.width = bodywidth / 13;
        } else {
          item.width = bodywidth / 12;
        }
        return item.width;
      });
    } else {
      // const { dispatch } = this.props;
      const { query } = this.state;
      const keyList = list.map((item) => item.key);
      const filterObj = this.getFilterObj(false, keyList);
      const dirObj = this.getDirStatus(false, keyList);
      const mustObj = this.getMustStatus(false, keyList);
      const filterArr = []; // 左侧栏 新增
      Object.keys(filterObj).forEach((key) => {
        if (filterObj[key].length > 0) {
          filterObj[key].forEach((item) => {
            filterArr.push(`${key}_${item}`);
          });
        }
      });
      handeldList = list.map((item) => {
        const render = (text) => {
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
      localStorage.setItem('alarmFilterKeys', keyList.join(','));
      const newQuery = Object.assign({}, query, { filterObj, dirObj, mustObj });
      this.fetchAlarmData(newQuery);
      this.fetchFilterCount(newQuery);
      this.setState({
        [fieldKey]: handeldList,
        [`${type}ModalVisiable`]: false,
        query: newQuery,
        preQuery: { preFilterObj: filterObj, preMustObj: mustObj },
        filterArr,
      });
    }
  };

  // 全局搜索
  globalSearch = (value) => {
    // const { dispatch } = this.props;
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { search: value, page: 1 });
    this.setState({ query: newQuery });

    this.fetchAlarmData(newQuery);
    this.fetchFilterCount(newQuery);
  };

  globalSearchChange = (value) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { search: value });
    this.setState({ query: newQuery });
  };

  // 管理弹框关闭
  onCancel = (type) => {
    this.setState({ [`${type}ModalVisiable`]: false });
  };

  deleteSelect = (key) => {
    // 左侧栏新增
    const { query, filterArr, actionStatus, mode } = this.state;
    const { filterObj, mustObj } = query;
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
    if (mode) {
      this.setState({ query: newQuery, actionStatus: newActionStatus, filterArr: newFilterArr });
      return;
    }
    this.setState(
      {
        query: newQuery,
        // selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        ids: [],
        // selectedRows: [],
        // checkAllPage: [],
        // unCheckedIds: [],
        actionStatus: newActionStatus,
        filterArr: newFilterArr,
      },
      () => {
        this.fetchAlarmData(newQuery);
        this.fetchFilterCount(newQuery);
      }
    );
  };

  clearSelect = () => {
    // 左侧栏新增
    const { query, mode } = this.state;
    const { filterObj, mustObj } = query;
    const newFilterObj = cloneDeep(filterObj);
    const newMustObj = cloneDeep(mustObj);
    Object.keys(filterObj).forEach((item) => {
      newFilterObj[item] = [];
      newMustObj[item] = true;
    });
    const actionStatus = this.getActionStatus(newFilterObj);
    const newQuery = Object.assign({}, query, { filterObj: newFilterObj, mustObj: newMustObj });
    if (mode) {
      this.setState({ query: newQuery, filterArr: [], actionStatus });
      return;
    }
    this.setState(
      {
        query: newQuery,
        isAllCheck: false,
        selectedRowKeys: [],
        ids: [],
        actionStatus,
        filterArr: [],
      },
      () => {
        this.fetchAlarmData(newQuery);
        this.fetchFilterCount(newQuery);
      }
    );
  };

  timePickerOnchange = (arr) => {
    const { query } = this.state;
    const newQuery = Object.assign({}, query, { startTime: arr[0], endTime: arr[1] });
    this.setState(
      {
        query: Object.assign({}, query, { startTime: arr[0], endTime: arr[1] }),
        preQuery: { preFilterObj: query.filterObj, preMustObj: query.mustObj },
        timeRange: arr[2],
        // selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        ids: [],
        // selectedRows: [],
        // checkAllPage: [],
        // unCheckedIds: [],
      },
      () => {
        this.fetchAlarmData(newQuery);
        this.fetchFilterCount(newQuery);
      }
    );
  };

  ontimePiker = (newQuery) => {
    const { startTime, endTime } = newQuery;
    this.setState(
      {
        query: newQuery,
        timeRange: `${moment(startTime).format(format)} 至 ${moment(endTime).format(format)}`,
        // selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        ids: [],
        // selectedRows: [],
        // checkAllPage: [],
        // unCheckedIds: [],
      },
      () => {
        this.fetchAlarmData(newQuery);
        this.fetchFilterCount(newQuery);
      }
    );
  };

  // 左侧栏新增
  onNewSearch = () => {
    const newQuery = cloneDeep(this.defaultQuery);
    this.setState(
      {
        query: newQuery,
        timeRange: 1,
        // selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        ids: [],
        // selectedRows: [],
        // checkAllPage: [],
        // unCheckedIds: [],
      },
      () => {
        this.fetchAlarmData(newQuery);
        this.fetchFilterCount(newQuery);
      }
    );
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { query } = this.state;
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
      if (order) {
        const dir = order.slice(0, -3);
        newQuery = Object.assign({}, query, {
          dir,
          sort: field,
          page: 1,
        });
      } else {
        const dir = 'desc';
        newQuery = Object.assign({}, query, {
          dir,
          sort: field,
          page: 1,
        });
      }
    }
    this.setState({
      query: newQuery,
    });
    this.fetchAlarmData(newQuery);
  };

  fetchAlarmData = (newQuery) => {
    const { dispatch } = this.props;
    const { query, timeRange } = this.state;
    const param = newQuery || query;
    param.timeRange = timeRange;
    dispatch({
      type: 'eventOverview/fetchAlarmList',
      payload: param,
    });
  };

  fetchFilterCount = (newQuery) => {
    const { dispatch } = this.props;
    const { query, timeRange } = this.state;
    const param = newQuery || query;
    const { dirObj, startTime, endTime, search, filterObj } = param;
    dispatch({
      type: 'eventOverview/fetchFilterCount',
      payload: { timeRange, dirObj, search, startTime, endTime, filterObj },
    });
  };

  mouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.moving = true;
    window.onmouseup = (e) => this.onMouseUp(e);
    window.onmousemove = (e) => this.onMouseMove(e);
  };

  onMouseMove = (e) => {
    if (this.moving) {
      this.onMove(e);
    }
  };

  onMouseUp = () => {
    this.moving = false;
    this.lastX = null;
  };

  onMove = (e) => {
    const { sideWidth } = this.state;
    if (this.lastX) {
      const dx = e.clientX - this.lastX;
      const newWidth = sideWidth + dx;
      if (newWidth >= 306 && newWidth <= 612) {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent('resize', false, false);
        window.dispatchEvent(evt);
        this.setState({ sideWidth: newWidth }, () => {
          if (document.getElementsByClassName('ant-layout-sider-children')[0]) {
            const leftmenu = document.getElementsByClassName('ant-layout-sider-children')[0];
            leftmenu.style.width = `${newWidth}px`;
          }
        });
      }
    }
    this.lastX = e.clientX;
  };

  filterQuickSelect = (filterValue) => {
    // 左侧栏新增

    const { query } = this.state;
    const { filterObj, mustObj, startTime, endTime, search, mode } = filterValue;
    const filterArr = [];
    const statefilterObjKeys = Object.keys(query.filterObj);
    const filterObjKeys = Object.keys(filterObj);
    const differenceKeys =
      statefilterObjKeys.length > filterObjKeys.length
        ? difference(statefilterObjKeys, filterObjKeys)
        : difference(filterObjKeys, statefilterObjKeys);

    let dirObj = Object.assign({}, query.dirObj);
    if (differenceKeys.length > 0) {
      const { filterDefaultList } = setShowList([], Object.keys(filterObj), this.fixTableRender);

      dirObj = this.getDirStatus(true, filterDefaultList);
      this.setState({ pickedFilterList: filterDefaultList });
    }

    filterObjKeys.forEach((key) => {
      if (filterObj[key].length > 0) {
        filterObj[key].forEach((item) => {
          filterArr.push(`${key}_${item}`);
        });
      }
    });
    const actionStatus = this.getActionStatus(filterObj);
    const diff = moment(endTime).diff(moment(startTime), 'days');
    let range = diff;
    if ([1, 7, 30, 90].indexOf(diff) < 0) {
      range = `${moment(startTime).format('YYYY-MM-DD HH:mm:ss')} 至 ${moment(endTime).format(
        'YYYY-MM-DD HH:mm:ss'
      )}`;
    }

    const newQuery = Object.assign(
      {},
      query,
      { filterObj },
      { dirObj, mustObj, startTime, endTime, search, page: 1, dir: 'desc', sort: 'tsLatest' }
    );
    // console.log('newQuery', newQuery);
    this.setState(
      {
        query: newQuery,
        // selectedNum: 0,
        isAllCheck: false,
        selectedRowKeys: [],
        ids: [],
        // selectedRows: [],
        // checkAllPage: [],
        // unCheckedIds: [],
        timeRange: range,
        mode,
        actionStatus,
        filterArr,
      },
      () => {
        this.fetchAlarmData(newQuery);
        this.fetchFilterCount(newQuery);
      }
    );
  };

  slelectRowOnchange = (selectedRowKeys, selectedRows) => {
    const ids = selectedRows.map((row) => row.id);
    this.setState({
      selectedRowKeys,
      ids,
    });
  };

  dataHandler = (status, id) => {
    const { query } = this.state;
    const data = { ids: [id.toString()] };
    const { dispatch } = this.props;
    const self = this;
    if (status === 'ignore') {
      confirm({
        title: '忽略后不可恢复，确定忽略吗',
        onOk() {
          dispatch({ type: 'eventOverview/ignoreEvent', payload: data })
            .then(() => {
              message.success('已将该事件标识为“已忽略”状态,有延时，请稍后刷新页面查看');
              self.fetchAlarmData(query);
              self.fetchFilterCount(query);
            })
            .catch((error) => {
              message.error(error.msg);
            });
        },
        onCancel() {},
      });
    } else {
      dispatch({ type: 'eventOverview/handleEvent', payload: data })
        .then(() => {
          message.success('已将该事件标识为“已处理”状态，有延时，请稍后刷新页面查看');
          self.fetchAlarmData(query);
          self.fetchFilterCount(query);
        })
        .catch((error) => {
          message.error(error.msg);
        });
    }
    return data;
  };

  mulitHandleEvent = () => {
    const { ids, query } = this.state;
    const {
      dispatch,
      eventOverview: { alarmList },
    } = this.props;

    if (ids.length === 0) {
      message.error('未选择事件');
      return;
    }
    const self = this;

    const handledList = alarmList.list.filter(
      (event) => ids.indexOf(event.id) > -1 && event.status === 'handled'
    );
    const ignoredList = alarmList.list.filter(
      (event) => ids.indexOf(event.id) > -1 && event.status === 'ignored'
    );

    if (handledList.length > 0 || ignoredList.length > 0) {
      message.error(
        '请检查已勾选事件中是否包含已处理、已忽略事件，已处理和已忽略事件不能再进行处理和忽略操作'
      );
      self.setState({ selectedRowKeys: [], ids: [] });
      return;
    }
    dispatch({ type: 'eventOverview/handleEvent', payload: { ids } })
      .then(() => {
        message.success('已将该事件标识为“已处理”状态，有延时，请稍后刷新页面查看');
        self.fetchAlarmData(query);
        self.fetchFilterCount(query);
      })
      .catch((error) => {
        message.error(error.msg);
      });
    this.setState({ selectedRowKeys: [], ids: [] });
  };

  mulitIgnoreEvent = () => {
    const { ids, query } = this.state;
    const {
      dispatch,
      eventOverview: { alarmList },
    } = this.props;
    const self = this;
    if (ids.length === 0) {
      message.error('未选择事件');
      return;
    }
    const handledList = alarmList.list.filter(
      (event) => ids.indexOf(event.id) > -1 && event.status === 'handled'
    );
    const ignoredList = alarmList.list.filter(
      (event) => ids.indexOf(event.id) > -1 && event.status === 'ignored'
    );

    if (handledList.length > 0 || ignoredList.length > 0) {
      message.error(
        '请检查已勾选事件中是否包含已处理、已忽略事件，已处理和已忽略事件不能再进行处理和忽略操作'
      );
      self.setState({ selectedRowKeys: [], ids: [] });
      return;
    }
    confirm({
      title: '忽略后不可恢复，确定忽略吗',
      onOk() {
        dispatch({ type: 'eventOverview/ignoreEvent', payload: { ids } })
          .then(() => {
            message.success('已将该事件标识为“已忽略”状态，有延时，请稍后刷新页面查看');
            self.fetchAlarmData(query);
            self.fetchFilterCount(query);
          })
          .catch((error) => {
            message.error(error.msg);
          });
        self.setState({ selectedRowKeys: [], ids: [] });
      },
      onCancel() {},
    });
  };

  exportPart = (e) => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      e.preventDefault();
      message.info('请选择导出的行');
    } else {
      // this.setState({ selectedRowKeys: [] });
    }
  };

  exportAll = (e) => {
    const {
      eventOverview: { alarmList },
    } = this.props;

    if (alarmList.list.length === 0) {
      e.preventDefault();
      message.info('无数据导出');
    }
  };

  setFullScreen = () => {
    const { fullScreen } = this.state;
    if (fullScreen) {
      this.setState({
        fullScreen: !fullScreen,
        siderbarIsOpen: true,
      });
    } else {
      this.setState({
        fullScreen: !fullScreen,
        siderbarIsOpen: false,
      });
    }
  };

  getExportParams = (filterObj, query, selectedRowKeys, tableColumns) => {
    const fieldList = [];
    const titleList = [];
    tableColumns.forEach((tobj) => {
      if (tobj.title && tobj.key !== 'lastIocnAction') {
        fieldList.push(tobj.dataIndex);
        titleList.push(tobj.title);
      }
    });

    const exportAllParams = {
      startTime: query.startTime,
      endTime: query.endTime,
      search: query.search,
      mustObj: query.mustObj,
      sort: query.sort,
      dir: query.dir,
      filterObj,
      fieldList,
      titleList,
      // ...filterExportObj,
      // filterObj: query.filterObj,
    };
    const exportPartParams = {
      startTime: query.startTime,
      endTime: query.endTime,
      ids: selectedRowKeys,
      fieldList,
      titleList,
    };
    return {
      exportAllParams,
      exportPartParams,
    };
  };

  // 模式切换 左侧栏新增
  changeMode = (mode, globalSearchInput) => {
    const { query } = this.state;
    if (mode) {
      const self = this;
      // 由高级模式切换到简单模式
      // Modal.confirm({
      //   title: '确认切换为简单搜索模式?',
      //   content: '切换到简单模式将会清除所有过滤条件，是否继续？',
      //   okText: '确认',
      //   cancelText: '取消',
      //   onOk: () => {
      if (globalSearchInput) {
        // 高级到简单-全局搜索内容要清空
        globalSearchInput.input.input.value = '';
      }
      const filterObj = self.getFilterObj(true, self.filterDefaultList);
      const dirObj = self.getDirStatus(true, self.filterDefaultList);
      const mustObj = self.getMustStatus(true, self.filterDefaultList);
      const actionStatus = self.getActionStatus(filterObj);
      const startTime = moment().subtract(1, 'day').valueOf();
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
        sort: 'tsLatest',
        search: '',
      });
      self.fetchAlarmData(newQuery);
      self.fetchFilterCount(newQuery);
      self.setState({
        query: newQuery,
        preQuery: { preFilterObj: filterObj, preMustObj: mustObj },
        filterArr: [],
        actionStatus,
        timeRange: 1,
        mode: !mode,
      });
      bus.emit('clearInput');
      //   },
      // });
      return;
    }
    this.setState({
      mode: !mode,
      preQuery: { preFilterObj: query.filterObj, preMustObj: query.mustObj },
    });
  };

  // 伸缩
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

  render() {
    const {
      tableLoading,
      tableLoading1,
      tableLoading2,
      eventOverview: { alarmList, alarmChart },
      ccsData: { ccsLevel = '', curCcsVal = '', clusterNameIp = {} },
    } = this.props;

    const {
      query,
      preQuery,
      timeRange,
      selectedRowKeys,
      tableScrollX,
      siderbarIsOpen,
      filterModalVisiable,
      columnModalVisiable,
      pickedFilterList,
      columns,
      currentHoverRow,
      fullScreen,
      sideWidth,
      btnManageLeft,
      isAllCheck,
      actionStatus, // 左侧栏新增
      mode,
      drawerVisible,
      drawerTitle,
      drawerQuery,
    } = this.state;

    let tableColumns = columns;

    // 如果当前是上级-事件列表增加来源一列
    if (ccsLevel === 'leader' && tableColumns[1].key !== 'devid') {
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
      // console.log('tableColumns==', tableColumns);
    }

    const { filterObj, startTime, endTime } = query;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.slelectRowOnchange,
    };
    const listPageStyle = cx({
      eventBlock: true,
    });

    const exportParams = this.getExportParams(filterObj, query, selectedRowKeys, tableColumns);

    // const filterObjKeyArr = Object.keys(filterObj);

    // 伸缩
    tableColumns = tableColumns.map((col, index) => ({
      ...col,
      onHeaderCell: (column) => ({
        width: column.width || 150,
        onResize: this.handleResize(index),
      }),
    }));
    const newTableColumns = [].concat(tableColumns, this.lastcolumns);

    // 新建空白列 填充表格

    newTableColumns.push({
      title: '',
      key: '',
      dataIndex: '',
    });
    return (
      <div className="container">
        <div className={listPageStyle}>
          <Row className={styles.titleBlock}>{this.selctedItemsRender()}</Row>
          <Layout className={styles.contentBlock}>
            <Sider
              width={sideWidth}
              style={{
                overflow: 'auto',
                position: 'relative',
                left: siderbarIsOpen ? 0 : `${-sideWidth}px`,
                margin: '10px 0 0 10px', // 左侧栏新增
                backgroundColor: '#ffffff', // 左侧栏新增
              }}
            >
              <FilterBar
                isOpen={siderbarIsOpen}
                filterObj={query.filterObj}
                width={sideWidth - 1}
                btnManageLeft={0 - btnManageLeft}
                dirObj={query.dirObj}
                filterList={pickedFilterList}
                globalSearch={this.globalSearch}
                globalSearchChange={this.globalSearchChange}
                sortAction={this.sortAction}
                checkboxOnchange={this.checkboxOnchange}
                hasManageBtn
                triggerFilterListManger={() => {
                  this.setState({ filterModalVisiable: true });
                }}
                filterPrefix="alarm"
                query={query}
                preQuery={preQuery}
                filterQuickSelect={this.filterQuickSelect}
                mustObj={query.mustObj}
                mode={mode}
                changeMode={this.changeMode}
                mustAction={this.mustAction}
                partActionStatus={actionStatus}
                fetchData={this.fetchData}
                rwAuth={this.alarmAuth}
                timeVisible
                customOptions={options}
                timeRange={timeRange}
                startTime={startTime}
                endTime={endTime}
                timePickerOnchange={this.timePickerOnchange}
              />
            </Sider>
            {siderbarIsOpen && (
              <div
                style={{
                  position: 'relative',
                  right: 0,
                  width: '5px',
                  borderLeft: '1px solid #DBDBDB',
                  zIndex: '10',
                  // height: '100%',
                  cursor: 'e-resize',
                }}
                onMouseDown={(e) => {
                  this.mouseDown(e);
                }}
              />
            )}
            <div
              className={styles.handlebtn}
              style={{ marginLeft: siderbarIsOpen ? -5 : `${-sideWidth}px` }}
            >
              <span
                onClick={this.triggerSiderbar}
                className={siderbarIsOpen ? styles.switch : styles.switchBlue}
              />
            </div>
            <Layout>
              {!fullScreen && (
                <HeatBrush
                  chartLoading={tableLoading}
                  chartData={alarmChart}
                  recordsTotal={alarmList.total}
                  query={query}
                  ontimePiker={this.ontimePiker}
                  onNewSearch={this.onNewSearch}
                  // intentType={intentType}
                />
              )}
              <div className={styles.tableBlock}>
                <div className={styles.handleBlock}>
                  <div className={styles.handleBar}>
                    <a
                      href={`/api/event/exportSafeEvent?params=${JSON.stringify(
                        exportParams.exportPartParams
                      )}`}
                      onClick={(e) => {
                        this.exportPart(e);
                      }}
                    >
                      <Button className="smallWhiteBtn" style={{ marginRight: 8 }}>
                        导出所选
                      </Button>
                    </a>
                    <a
                      href={`/api/event/exportSafeEvent?params=${JSON.stringify(
                        exportParams.exportAllParams
                      )}`}
                    >
                      <Button
                        className="smallWhiteBtn"
                        style={{ marginRight: 8 }}
                        onClick={(e) => {
                          this.exportAll(e);
                        }}
                      >
                        导出全部
                      </Button>
                    </a>
                    {this.alarmAuth === 'rw' && (
                      <Fragment>
                        <Button
                          className="smallWhiteBtn"
                          style={{ marginRight: 8 }}
                          onClick={this.mulitHandleEvent}
                        >
                          处理
                        </Button>
                        <Button
                          className="smallWhiteBtn"
                          style={{ marginRight: 8 }}
                          onClick={this.mulitIgnoreEvent}
                        >
                          忽略
                        </Button>
                      </Fragment>
                    )}
                    <Button className="smallWhiteBtn" onClick={this.setFullScreen}>
                      全屏切换
                    </Button>
                  </div>
                  <div
                    className={styles.settingBlock}
                    onClick={() => {
                      this.setState({ columnModalVisiable: true });
                    }}
                  >
                    <span className={styles.settingBtn} />
                    <span styles={{ marginLeft: 10 }}>管理</span>
                  </div>
                </div>
                <Table
                  rowKey="id"
                  id="ant-table-body"
                  loading={tableLoading || tableLoading1 || tableLoading2}
                  rowSelection={rowSelection}
                  scroll={{ x: tableScrollX }}
                  // 伸缩
                  bordered={false}
                  components={this.components}
                  pagination={{
                    showSizeChanger: !isAllCheck,
                    defaultPageSize: query.pageSize,
                    pageSizeOptions: ['20', '50', '100', '200'],
                    current: query.page,
                    total: alarmList.total,
                    showQuickJumper: true,
                    showTotal: (total) => `（${total}项）`,
                  }}
                  columns={newTableColumns}
                  dataSource={alarmList.list}
                  size="middle"
                  onChange={this.handleTableChange}
                  rowClassName={(record, index) =>
                    index === currentHoverRow ? styles.handleAction : ''
                  }
                  onRow={(record, index) => ({
                    onMouseEnter: () => {
                      this.setState({ currentHoverRow: index });
                    },
                    onMouseLeave: () => {
                      this.setState({ currentHoverRow: '', showOperation: false });
                    },
                  })}
                />

                {alarmList.gt10000 && (
                  <div className={styles.flexEnd}>{/* <span>页面最多展示10000条数据</span> */}</div>
                )}
              </div>
            </Layout>
            <ItemManageModal
              title="状态栏管理"
              type="filter"
              visible={filterModalVisiable}
              allList={canOrderList}
              pickedList={pickedFilterList}
              fieldManage={this.fieldManage}
              onCancel={this.onCancel}
            />
            <ItemManageModal
              title="显示列管理"
              type="column"
              visible={columnModalVisiable}
              allList={fieldNameList}
              pickedList={this.columnDefaultList}
              fieldManage={this.fieldManage}
              onCancel={this.onCancel}
            />
          </Layout>
        </div>
        <DrawerWidget
          visible={drawerVisible}
          title={drawerTitle}
          width={1100}
          onClose={this.drawerClose}
        >
          <div>
            {/* 失陷感知就是威胁情报 */}
            {drawerQuery.category_1 === '入侵感知' && <EventAlertDrawer query={drawerQuery} />}
            {drawerQuery.category_1 === '失陷感知' && <EventIocDrawer query={drawerQuery} />}
            {drawerQuery.category_1 === '异常文件感知' && <EventAptDrawer query={drawerQuery} />}
          </div>
        </DrawerWidget>
      </div>
    );
  }
}

export default connect(({ global, msgNotify, eventOverview, loading }) => ({
  eventOverview,
  hasVpc: global.hasVpc,
  ccsData: global.ccsData,
  locationImgs: msgNotify.locationImgs,
  filterLoading: loading.effects['eventOverview/fetchFilterCount'],
  tableLoading: loading.effects['eventOverview/fetchAlarmList'],
  tableLoading1: loading.effects['eventOverview/ignoreEvent'],
  tableLoading2: loading.effects['eventOverview/handleEvent'],
}))(EventOverview);
