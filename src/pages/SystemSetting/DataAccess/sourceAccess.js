/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { connect } from 'umi';
import Cookies from 'js-cookie';
import { Button, Table, Switch, Modal, message } from 'antd';
import { Link } from 'umi';
import { history } from 'umi';
import authority from '@/utils/authority';
const { getAuth } = authority;

const { confirm } = Modal;
@connect(({ sourceAccess, loading }) => ({
  sourceAccess,
  loading: loading.effects['sourceAccess/fetchSourceData'],
  loading2: loading.effects['sourceAccess/updateSourceState'],
}))
class SourceAccess extends Component {
  constructor(props) {
    super(props);
    this.dataAuth = getAuth('/systemSetting/dataAccess/source');
    this.addCount = getAuth('_systemSetting_dataAccess_source_add');
    this.state = {
      reqing: false,
      loading: {},
    };
    this.columns = [
      {
        title: '流量源名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '流量源IP',
        dataIndex: 'ip',
        key: 'ip',
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
      },
      {
        title: '启停状态',
        dataIndex: '',
        key: 'switch',
        render: (item) => {
          const { loading } = this.state;
          const {
            sourceAccess: { brokenSourceData },
          } = this.props;
          // 查找该元素是否在坏掉的探针列表存在
          const idx = brokenSourceData.findIndex((element) => element.id === item.id);
          return (
            <Switch
              loading={loading[item.ip] || false}
              checkedChildren="开"
              unCheckedChildren="关"
              checked={item.status}
              disabled={idx !== -1}
              onChange={() => {
                if (this.dataAuth !== 'rw') {
                  return;
                }
                this.changeStatus(item);
              }}
            />
          );
        },
      },
      {
        title: '操作',
        dataIndex: '',
        key: 'action',
        render: (item) => {
          if (this.dataAuth !== 'rw') {
            return null;
          }
          const {
            sourceAccess: { brokenSourceData },
          } = this.props;
          // 查找该元素是否在坏掉的探针列表存在
          const idx = brokenSourceData.findIndex((element) => element.id === item.id);
          return (
            <div>
              {idx === -1 ? (
                <Link
                  style={{ padding: '0 5px' }}
                  to={`/systemSetting/dataAccess/editor?id=${item.id}&ip=${item.ip}&name=${item.name}&desc=${item.desc}`}
                >
                  编辑
                </Link>
              ) : (
                <span style={{ color: 'rgba(0,0,0,.25)', padding: '0 5px' }}>编辑</span>
              )}

              <span
                style={{ color: '#2662EE', padding: '0 5px', cursor: 'pointer' }}
                onClick={() => {
                  this.deleteList(item);
                }}
              >
                删除
              </span>
            </div>
          );
        },
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    const sourceEditChange = Cookies.get('sourceEditChange');
    dispatch({ type: 'sourceAccess/fetchSourceData' });

    // 当编辑页数据有变化时，弹窗--是否要重启？
    // console.log('sourceEditChange==', sourceEditChange);
    if (sourceEditChange) {
      const changeArr = sourceEditChange.split('_');
      const changip = changeArr[0];
      const isChange = changeArr[1];
      // console.log('changip==', changip, 'isChange==', isChange);
      Cookies.remove('sourceEditChange');
      if (isChange === 'true') {
        this.reStart(changip);
      }
    }
  };

  componentDidUpdate(prevProps) {
    // 出一个提示那些探针是坏的
    if (
      this.props.sourceAccess.brokenSourceData.length !==
        prevProps.sourceAccess.brokenSourceData.length &&
      this.props.sourceAccess.brokenSourceData.length > 0
    ) {
      const ips = this.props.sourceAccess.brokenSourceData.map((item) => item.ip);
      message.error(`探针名(${ips.toString()})网络通信异常`);
    }
  }

  create = () => {
    console.log('新建');
    history.push(`/systemSetting/dataAccess/add`);
  };

  editor = (list) => {
    console.log('list', list);
  };

  deleteList = (list) => {
    const { dispatch } = this.props;
    confirm({
      title: '删除后不可恢复，确定删除吗',
      onOk() {
        dispatch({
          type: 'sourceAccess/deleteSourceList',
          payload: { ip: list.ip, id: list.id },
        })
          .then((res) => {
            // console.log('res', res);
            if (res.error_code === 0) {
              message.info('删除节点成功!');
              dispatch({ type: 'sourceAccess/fetchSourceData' });
            }
          })
          .catch((error) => {
            message.error(error.msg);
          });
      },
      onCancel() {},
    });
  };

  changeStatus = (list) => {
    // console.log('list', list);
    const { reqing, loading } = this.state;
    const { dispatch } = this.props;
    let uri;
    if (list.status) {
      uri = 'systemset/stopSource';
    } else {
      uri = 'systemset/startSource';
    }
    if (reqing) {
      return;
    }
    loading[list.ip] = true;
    this.setState({ reqing: true, loading });
    dispatch({
      type: 'sourceAccess/updateSourceState',
      payload: { uri, body: { ip: list.ip } },
    })
      .then((res) => {
        console.log('status', res);
        if (res.error_code === 0) {
          message.info('修改状态成功');
        } else {
          message.info(res.msg);
        }
        loading[list.ip] = false;
        this.setState({ reqing: false, loading });
        dispatch({ type: 'sourceAccess/fetchSourceData' });
      })
      .catch((error) => {
        console.log('error', error);
        message.error(error.msg);
        loading[list.ip] = false;
        this.setState({ reqing: false, loading });
      });
  };

  reStart = (ip) => {
    const { dispatch } = this.props;
    const { loading } = this.state;
    const self = this;
    confirm({
      title: '流量引擎配置修改，是否重启？',
      onOk() {
        loading[ip] = true;
        self.setState({ loading });
        dispatch({
          type: 'sourceAccess/updateSourceState',
          payload: { uri: 'systemset/stopSource', body: { ip } },
        })
          .then(() => {
            dispatch({
              type: 'sourceAccess/updateSourceState',
              payload: { uri: 'systemset/startSource', body: { ip } },
            })
              .then(() => {
                message.success('重启成功');
                loading[ip] = false;
                self.setState({ loading });
                dispatch({ type: 'sourceAccess/fetchSourceData' });
              })
              .catch((error) => {
                console.log(2, 'error', error);
                message.error('重启失败');
                loading[ip] = false;
                self.setState({ loading });
                dispatch({ type: 'sourceAccess/fetchSourceData' });
              });
          })
          .catch((error) => {
            console.log(1, 'error', error);
            message.error('重启失败');
            loading[ip] = false;
            self.setState({ loading });
          });
      },
      onCancel() {},
    });
  };

  render() {
    const {
      sourceAccess: { sourceData, recordsTotal },
      loading,
    } = this.props;

    let addAuth = true;
    if (this.addCount) {
      addAuth = recordsTotal < Number(this.addCount);
    }

    // console.log('this.addCount==', this.addCount);
    return (
      <div className="TableTdPaddingWrap">
        {addAuth && this.dataAuth === 'rw' && (
          <Button className="smallBlueBtn" style={{ marginBottom: 14 }} onClick={this.create}>
            新建
          </Button>
        )}
        <Table loading={loading} columns={this.columns} dataSource={sourceData} rowKey="id" />
      </div>
    );
  }
}

export default SourceAccess;
