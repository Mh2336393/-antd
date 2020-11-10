import React, { Component } from 'react';
// import _ from 'lodash';
import { Tabs, Divider, Select } from 'antd';
// import configSettings from '../../../configSettings';
import styles from './detail.less';
import dialogLeft from '../../../assets/image/dialogLeft.png';
import dialogRight from '../../../assets/image/dialogRight.png';

const { TabPane } = Tabs;
const { Option } = Select;

class DialogTabPage extends Component {
  constructor(props) {
    super(props);
    // const {
    //   editItem: { switch: defaultSwitch },
    // } = this.props;
    // const defaultIsDisable = !defaultSwitch;
    this.state = {
      codeType: [],
      pageWidth: 1400,
    };
  }

  componentWillMount() {
    // const { dispatch } = this.props;
    // dispatch({ type: 'eventFile/fetchCategory2', payload: { category_1: '异常文件感知' } });
  }


  componentDidMount() {
    const { dialogType = '' } = this.props;
    if (dialogType === 'Search') {
      // 检索页
      const self = this;
      const cWidth = document.documentElement.clientWidth || document.body.clientWidth;
      this.setState({ pageWidth: cWidth });
      window.onresize = () => {
        const { pageWidth: stateWid } = self.state;
        const sizecWidth = document.documentElement.clientWidth || document.body.clientWidth;
        if (stateWid !== sizecWidth) {
          this.setState({ pageWidth: sizecWidth });
        }
      };
    }
  }

  codeTypeChange = (index, val) => {
    const { codeType } = this.state;
    codeType[index] = val;
    this.setState({ codeType });
  };


  httpModalShow = httpData => {
    let reqHead = '';
    if (httpData.http_request_header) {
      reqHead = this.decodeStr(httpData.http_request_header, 0);
    }
    let reqBody = '';
    if (httpData.http_request_body) {
      reqBody = this.decodeStr(httpData.http_request_body, 0);
    }

    let resHead = '';
    if (httpData.http_response_header) {
      resHead = this.decodeStr(httpData.http_response_header, 1);
    }
    let resBody = '';
    if (httpData.http_response_body) {
      (()=>{
        if(this.props.showDesensitization===!localStorage.getItem("showDesensitization")){
          resBody = this.decodeStr(httpData.http_response_body, 1)
        }else{
          resBody = "敏感数据，如需查看可关闭数据脱敏展示"
        }
      })()
    }
    const { dialogType = '' } = this.props;
    let maxWidStyle = {};
    if (dialogType === 'Search') {
      // 检索页
      const { pageWidth } = this.state;
      const pWidth = pageWidth < 1400 ? 1400 : pageWidth;
      const maxTabWidth = pWidth - 236;
      maxWidStyle = { maxWidth: maxTabWidth, overflow: 'auto' };
    }

    const ele = (
      <div>
        <div className={styles.diaCard}>
          <div className={styles.diaHead}>
            <div style={{ float: 'right' }}>
              字符编码：&nbsp;&nbsp;
              <Select
                defaultValue="ascii"
                size="small"
                style={{ width: 100 }}
                onChange={val => {
                  this.codeTypeChange(0, val);
                }}
              >
                <Option value="ascii">ASCII</Option>
                <Option value="utf8">UTF-8</Option>
              </Select>
            </div>
            <div style={{ float: 'left' }}>
              <img alt="REQUEST" src={dialogRight} className={styles.diaIcon} />
              <b>REQUEST</b>
              <span className={styles.diaProto}>HTTP</span>
            </div>
          </div>
          <div className={styles.diaBody}>
            {reqHead || reqBody ? (
              <div style={maxWidStyle}>
                {reqHead && <pre className={styles.diaPre}>{reqHead}</pre>}
                <div>
                  {reqBody && (
                    <Tabs type="card">
                      <TabPane tab="数据" key="1">
                        <pre className={styles.diaPre}>{reqBody}</pre>
                      </TabPane>
                    </Tabs>
                  )}
                </div>
              </div>
            ) : (
                <div>暂无信息</div>
              )}
          </div>
        </div>
        <div className={styles.diaCard}>
          <div className={styles.diaHead}>
            <div style={{ float: 'right' }}>
              字符编码：&nbsp;&nbsp;
              <Select
                defaultValue="ascii"
                size="small"
                style={{ width: 100 }}
                onChange={val => {
                  this.codeTypeChange(1, val);
                }}
              >
                <Option value="ascii">ASCII</Option>
                <Option value="utf8">UTF-8</Option>
              </Select>
            </div>
            <div style={{ float: 'left' }}>
              <img alt="RESPONSE" src={dialogLeft} className={styles.diaIcon} />
              <b>RESPONSE</b>
              <span className={styles.diaProto}>HTTP</span>
            </div>
          </div>
          <div className={styles.diaBody}>
            {resHead || resBody ? (
              <div style={maxWidStyle}>
                {resHead && <pre className={styles.diaPre}>{resHead}</pre>}

                <div>
                  {resBody && (
                    <Tabs type="card">
                      <TabPane tab="数据" key="1">
                        {<pre className={styles.diaPre}>{resBody}</pre>}
                      </TabPane>
                    </Tabs>
                  )}
                </div>
              </div>
            ) : (
                <div>暂无信息</div>
              )}
          </div>
        </div>
      </div>
    );

    return ele;
  };


  payloadModalShow = record => {
    // toclient_payload，toserver_payload，flow_log.flow.pcap
    const cntArr = [];
    const payArr = [];
    if (record.toclient_payload) {
      record.toclient_payload.forEach(obj => {
        if (cntArr.indexOf(obj.cnt) < 0) {
          cntArr.push(obj.cnt);
          payArr.push(obj);
        }
      });
    }
    if (record.toserver_payload) {
      record.toserver_payload.forEach(obj => {
        if (cntArr.indexOf(obj.cnt) < 0) {
          cntArr.push(obj.cnt);
          payArr.push(obj);
        }
      });
    }
    if (record.flow_log && record.flow_log.flow && record.flow_log.flow.pcap) {
      record.flow_log.flow.pcap.forEach(obj => {
        if (cntArr.indexOf(obj.cnt) < 0) {
          cntArr.push(obj.cnt);
          payArr.push(obj);
        }
      });
    }
    if (payArr.length) {
      // cnt 从小到大排序
      payArr.sort((a, b) => a.cnt - b.cnt);
      let flag = '';
      payArr.forEach((cntObj, idx) => {
        if (idx === 0) {
          flag += idx;
        } else if (cntObj.dir === payArr[idx - 1].dir) {
          flag += `,${idx}`;
        } else {
          flag += `|${idx}`;
        }
      });
      const idxArr = flag.split('|');

      const ele = idxArr.map((idxStr, idxNum) => {
        const payIdxarr = idxStr.split(',');
        const payIdxNum = payIdxarr.map(num => parseInt(num, 10));
        const title = payArr[payIdxNum[0]].dir;
        // toClient  RESPONSE
        const imgSrc = title === 'ToServer' ? dialogRight : dialogLeft;
        const showTitle = title === 'ToServer' ? 'REQUEST' : 'RESPONSE';

        return (
          <div key={idxStr} className={styles.diaCard}>
            <div className={styles.diaHead}>
              <div style={{ float: 'right' }}>
                字符编码：&nbsp;&nbsp;
                <Select
                  defaultValue="ascii"
                  size="small"
                  style={{ width: 100 }}
                  onChange={val => {
                    this.codeTypeChange(idxNum, val);
                  }}
                >
                  <Option value="ascii">ASCII</Option>
                  <Option value="utf8">UTF-8</Option>
                </Select>
              </div>
              <div style={{ float: 'left' }}>
                <img alt={showTitle} src={imgSrc} className={styles.diaIcon} />
                <b>{showTitle}</b>
              </div>
            </div>
            <div className={styles.diaBody}>
              {payIdxNum.map((inInt, indexCount) => (
                <div key={inInt}>
                  <pre className={styles.diaPre}>{this.decodeStr(payArr[inInt].data, idxNum)}</pre>
                  {indexCount !== payIdxNum.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          </div>
        );
      });
      return ele;
    }

    return <div>{this.noDataModalShow()}</div>;
  };

  dnsModalShow = record => {
    const type = record.dns && record.dns.type ? record.dns.type : '';
    if (type) {
      let reqObj;
      let resObj;
      if (type === 'query') {
        reqObj = {
          rrname: record.dns.rrname,
          rrtype: record.dns.rrtype,
        };
      } else {
        reqObj = {
          rrname: record.dns.rrname,
          rrtype: record.dns.rrtype,
          rcode: record.dns.rcode,
        };
        const authorities = record.dns.authorities ? record.dns.authorities : [];
        const answers = record.dns.answers ? record.dns.answers : [];
        resObj = {
          answers: [].concat(answers, authorities),
        };
      }
      const ele = (
        <div>
          {reqObj && (
            <div className={styles.diaCard}>
              <div className={styles.diaHead}>
                <div style={{ float: 'right' }}>
                  字符编码：&nbsp;&nbsp;
                  <Select
                    defaultValue="ascii"
                    size="small"
                    style={{ width: 100 }}
                    onChange={val => {
                      this.codeTypeChange(0, val);
                    }}
                  >
                    <Option value="ascii">ASCII</Option>
                    <Option value="utf8">UTF-8</Option>
                  </Select>
                </div>
                <div style={{ float: 'left' }}>
                  <img alt="QUERY" src={dialogRight} className={styles.diaIcon} />
                  <b>QUERY</b>
                  <span className={styles.diaProto}>DNS</span>
                </div>
              </div>
              <div className={styles.diaBody}>
                <pre className={styles.diaPre}>{this.objShow(reqObj)}</pre>
              </div>
            </div>
          )}
          {resObj && resObj.answers.length > 0 && (
            <div className={styles.diaCard}>
              <div className={styles.diaHead}>
                <div style={{ float: 'right' }}>
                  字符编码：&nbsp;&nbsp;
                  <Select
                    defaultValue="ascii"
                    size="small"
                    style={{ width: 100 }}
                    onChange={val => {
                      this.codeTypeChange(1, val);
                    }}
                  >
                    <Option value="ascii">ASCII</Option>
                    <Option value="utf8">UTF-8</Option>
                  </Select>
                </div>
                <div style={{ float: 'left' }}>
                  <img alt="ANSWER" src={dialogLeft} className={styles.diaIcon} />
                  <b>ANSWER</b>
                  <span className={styles.diaProto}>DNS</span>
                </div>
              </div>
              <div className={styles.diaBody}>
                <pre className={styles.diaPre}>{this.answersShow(resObj.answers)}</pre>
              </div>
            </div>
          )}
        </div>
      );
      return ele;
    }
    return null;
  };

  objShow = obj => {
    const keys = Object.keys(obj);
    const eles = keys.map(name => {
      const cxt = Array.isArray(obj[name]) ? JSON.stringify(obj[name]) : obj[name];
      return (
        <div key={name} style={{ overflow: 'hidden' }}>
          <p style={{ float: 'left', width: '14%' }}>{`${name}：`}</p>
          <p style={{ float: 'left', width: '86%', wordBreak: 'break-all' }}>{cxt}</p>
        </div>
      );
    });
    return eles;
  };

  // { "rrname": "www.baidu.com", "rrtype": "CNAME", "ttl": 1075, "rdata": "www.a.shifen.com" }
  answersShow = answers => {
    const ele = answers.map((obj, idx) => {
      const { rrname, rrtype, rdata } = obj;
      // const item = { rrname, rrtype, rdata };
      const item = {};
      if (rrname) {
        item.rrname = rrname;
      }
      if (rrtype) {
        item.rrtype = rrtype;
      }
      if (rdata) {
        item.rdata = rdata;
      }
      const itemEle = (
        <div>
          {this.objShow(item)}
          {idx !== answers.length - 1 && <Divider />}
        </div>
      );
      return itemEle;
    });
    return ele;
  };

  filterStr = string => {
    const str = string.split('');
    for (let i = 0; i < str.length; i += 1) {
      const code = Number(str[i].charCodeAt());
      // console.log(122, i, str[i], 222, code);
      if ((code < 32 || code > 127) && code !== 10 && code !== 13) {
        str[i] = '.';
      }
    }
    const result = str.join('');
    return result;
  };

  decodeStr = (hexStr, codeIdx) => {
    const { codeType } = this.state;
    let curCode = 'ascii';
    if (codeType[codeIdx]) {
      curCode = codeType[codeIdx];
    }

    let utfStr = hexStr;
    try {
      const isEven = hexStr.length % 2 === 0;
      const hexVal = isEven ? hexStr : hexStr.substring(0, hexStr.length - 1);
      utfStr = Buffer.from(hexVal, 'hex').toString('utf8');
    } catch (error) {
      console.log(393, 'hexStr==', hexStr, 'decodeStr_error==', error);
    }
    if (curCode === 'utf8') {
      return utfStr;
    }

    const testStr = utfStr;
    const resultStr = this.filterStr(testStr);
    return resultStr;
  };

  noDataModalShow = proto => (
    <div>
      <div className={styles.diaCard}>
        <div className={styles.diaHead}>
          <div style={{ float: 'right' }}>
            字符编码：&nbsp;&nbsp;
            <Select
              defaultValue="ascii"
              size="small"
              style={{ width: 100 }}
              onChange={val => {
                this.codeTypeChange(0, val);
              }}
            >
              <Option value="ascii">ASCII</Option>
              <Option value="utf8">UTF-8</Option>
            </Select>
          </div>
          <div style={{ float: 'left' }}>
            <img alt="REQUEST" src={dialogRight} className={styles.diaIcon} />
            <b>REQUEST</b>
            {proto && <span className={styles.diaProto}>{proto}</span>}
          </div>
        </div>
        <div className={styles.diaBody}>
          <div>暂无信息</div>
        </div>
      </div>
      <div className={styles.diaCard}>
        <div className={styles.diaHead}>
          <div style={{ float: 'right' }}>
            字符编码：&nbsp;&nbsp;
            <Select
              defaultValue="ascii"
              size="small"
              style={{ width: 100 }}
              onChange={val => {
                this.codeTypeChange(1, val);
              }}
            >
              <Option value="ascii">ASCII</Option>
              <Option value="utf8">UTF-8</Option>
            </Select>
          </div>
          <div style={{ float: 'left' }}>
            <img alt="RESPONSE" src={dialogLeft} className={styles.diaIcon} />
            <b>RESPONSE</b>
            {proto && <span className={styles.diaProto}>{proto}</span>}
          </div>
        </div>
        <div className={styles.diaBody}>
          <div>暂无信息</div>
        </div>
      </div>
    </div>
  );

  render() {
    const { record } = this.props;

    let httpData = {};
    let proType = '';
    if (record.event_type) {
      if (record.event_type === 'alert' || record.event_type === 'dataleak') {
        if (record.app_proto === 'http') {
          proType = 'HTTP';
          // 取数据 Event_type=alert，并且app_proto=http，取http_log[1]中http日志
          if (record.http_log && record.http_log[0] && record.http_log[0].http) {
            httpData = record.http_log[0].http;
          } else {
            httpData = record.http || {};
          }
        } else {
          proType = 'payload';
        }
      }
      if (record.event_type === 'http') {
        proType = 'HTTP';
        // 取数据 Event_type=http，取整个http日志???
        httpData = record.http || {};
      }
      if (record.event_type === 'ioc_alert' && record.app_proto === 'dns') {
        proType = 'DNS';
      }
      if (record.event_type === 'apt_black' && record.app_proto === 'http') {
        proType = 'HTTP';
        // 异常文件会话还原
        if (record.http) {
          httpData = record.http;
        }
      }
      localStorage.setItem("httpData", JSON.stringify(httpData));
    }
    return (
      <div>
        {proType === 'HTTP' && <div>{this.httpModalShow(httpData)}</div>}
        {proType === 'payload' && <div>{this.payloadModalShow(record)}</div>}
        {proType === 'DNS' && <div>{this.dnsModalShow(record)}</div>}
        {!proType && <div>{this.noDataModalShow()}</div>}
      </div>
    );
  }
}

export default DialogTabPage;
