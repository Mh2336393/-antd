import React, { Component } from 'react';
import { connect } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Spin, Table, Modal, Tree } from 'antd';
// import _ from 'lodash';
import styles from './BasicInfo.less';

const { TreeNode } = Tree;

class FileBehaviorAptUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAll: false,
      allData: {
        theme: '',
        allList: [],
      },
      showTree: false,
      treeData: [],
      expandedKeys: [],
      selectedKeys: [],
      autoExpandParent: true,
      defaultExpandedKeys: [],
      expandAll: true,
      // treeNodeData: [],
    };

    this.tableColumns = [
      {
        title: '行为描述',
        dataIndex: 'desc',
        key: 'desc',
      },
      {
        title: '行为数',
        dataIndex: 'count',
        width: 216,
        key: 'count',
        render: (text) => <div style={{ width: 200 }}>{text}</div>,
      },
      {
        title: '恶意级别',
        dataIndex: 'level',
        width: 296,
        key: 'level',
        render: (text) => {
          let color = '#7F7F7F';
          let bgColor = '#F1F1F1';
          let borderColor = '#ACACAC';
          if (text === '可疑行为') {
            color = '#F5222D';
            bgColor = '#FFF1F0';
            borderColor = '#FFA39E';
          }
          if (text === '恶意行为') {
            color = '#FFF';
            bgColor = '#F5222D';
            borderColor = '#F5222D';
          }
          if (text === '恶意行为' || text === '可疑行为') {
            return (
              <div style={{ width: 280 }}>
                <span
                  style={{
                    padding: '2px 10px',
                    color,
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '6px',
                  }}
                >
                  {text}
                </span>
              </div>
            );
          }
          return '';
        },
      },
    ];
  }

  componentDidMount() {
    // const { dispatch, md5 } = this.props;
    // dispatch({ type: 'aptDetail/fetchUoloadFileBehavior', payload: { md5: 'e3486d23e4fae4f1d45433cee4fb6f01' } });
  }

  expandedRowRender = (record) => {
    console.log(record, record.extra);
    const { extra } = record;
    return (
      <div>
        {extra.map((obj) => {
          let color = '#54576A';
          if (obj.Level === (4 || 5)) {
            color = '#f00';
          }
          return (
            <div key={obj.ProcName} style={{ marginBottom: 10, color }}>
              <p>
                <span>被检测程序：</span>
                <span>{obj.ProcName}</span>
              </p>
              <p>
                <span>详细信息：</span>
                <span>{obj.Detail}</span>
              </p>
              <p>
                {obj.ActionId && (
                  <a onClick={() => this.showProcessTree(obj.ActionId)}>查看进程树</a>
                )}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  renderTreeNodes = (data, highlightKeys) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.name}>
            {this.renderTreeNodes(item.children, highlightKeys)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          title={
            highlightKeys.length > 0 && highlightKeys[0] === item.name ? (
              <span style={{ color: 'red' }}>{item.name}</span>
            ) : (
              item.name
            )
          }
          key={item.name}
        />
      );
    });

  showProcessTree = (id) => {
    const {
      aptDetail: { behaviorObjUpload },
    } = this.props;
    const { ProcessTree } = behaviorObjUpload;
    // const selectedArr = [];
    this.loop(ProcessTree.list, id);
    this.setState({ showTree: true, treeData: ProcessTree.list });
  };

  onTreeExpand = (expandedKeys) => {
    console.log('expandedKeys', expandedKeys);
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onTreeSelect = (selectedKeys) => {
    console.log('select', selectedKeys);
  };

  // 选中的分支
  loop = (data, id) => {
    const arr = [];
    data.forEach((item) => {
      if (item.children) {
        this.loop(item.children, id);
      } else if (item.actionid) {
        if (item.actionid.indexOf(id) >= 0) {
          arr.push(item.name);
          this.setState({ defaultExpandedKeys: arr });
        }
      }
    });
  };

  render() {
    const {
      aptDetail: { behaviorObjUpload },
      loading,
      // allLoading,
    } = this.props;
    const { File, Hook, Net, Other, Process, Reg } = behaviorObjUpload;
    const fileList = File && File.length > 5 ? File.slice(0, 5) : File;
    const hookList = Hook && Hook.length > 5 ? Hook.slice(0, 5) : Hook;
    const netList = Net && Net.length > 5 ? Net.slice(0, 5) : Net;
    const otherList = Other && Other.length > 5 ? Other.slice(0, 5) : Other;
    const processList = Process && Process.length > 5 ? Process.slice(0, 5) : Process;
    const regList = Reg && Reg.length > 5 ? Reg.slice(0, 5) : Reg;

    const {
      showAll,
      allData: { theme, allList },
      showTree,
      treeData,
      expandedKeys,
      selectedKeys,
      autoExpandParent,
      defaultExpandedKeys,
      expandAll,
    } = this.state;
    if (loading)
      return (
        <div>
          <Spin />
        </div>
      );
    // if (allNotData)
    //   return (
    //     <div>
    //       <div>该文件没有异常文件日志</div>
    //     </div>
    //   );
    return (
      <div>
        {!showAll ? (
          <div>
            <div className={styles['info-block']}>
              <h4 className={styles.title2}>文件行为</h4>
              <Table
                rowKey="id"
                columns={this.tableColumns}
                dataSource={fileList}
                expandedRowRender={this.expandedRowRender}
                size="middle"
                pagination={false}
              />
              {File.length > 5 && (
                <Button
                  type="default"
                  className={styles.showMore}
                  onClick={() => {
                    this.setState({
                      showAll: true,
                      allData: { theme: '文件行为', allList: behaviorObjUpload.File },
                    });
                  }}
                >
                  查看完整行为
                </Button>
              )}
            </div>
            <div className={styles['info-block']}>
              <h4 className={styles.title2}>进程行为</h4>
              <Table
                rowKey="id"
                columns={this.tableColumns}
                dataSource={processList}
                expandedRowRender={this.expandedRowRender}
                size="middle"
                pagination={false}
              />
              {Process.length > 5 && (
                <Button
                  type="default"
                  className={styles.showMore}
                  onClick={() => {
                    this.setState({
                      showAll: true,
                      allData: { theme: '进程行为', allList: behaviorObjUpload.Process },
                    });
                  }}
                >
                  查看完整行为
                </Button>
              )}
            </div>
            <div className={styles['info-block']}>
              <h4 className={styles.title2}>注册表行为</h4>
              <Table
                rowKey="id"
                columns={this.tableColumns}
                dataSource={regList}
                expandedRowRender={this.expandedRowRender}
                size="middle"
                pagination={false}
              />
              {Reg.length > 5 && (
                <Button
                  type="default"
                  className={styles.showMore}
                  onClick={() => {
                    this.setState({
                      showAll: true,
                      allData: { theme: '注册表行为', allList: behaviorObjUpload.Reg },
                    });
                  }}
                >
                  查看完整行为
                </Button>
              )}
            </div>
            <div className={styles['info-block']}>
              <h4 className={styles.title2}>网络行为</h4>
              <Table
                rowKey="id"
                columns={this.tableColumns}
                dataSource={netList}
                expandedRowRender={this.expandedRowRender}
                size="middle"
                pagination={false}
              />
              {Net.length > 5 && (
                <Button
                  type="default"
                  className={styles.showMore}
                  onClick={() => {
                    this.setState({
                      showAll: true,
                      allData: { theme: '网络行为', allList: behaviorObjUpload.Net },
                    });
                  }}
                >
                  查看完整行为
                </Button>
              )}
            </div>
            <div className={styles['info-block']}>
              <h4 className={styles.title2}>Hook行为</h4>
              <Table
                rowKey="id"
                columns={this.tableColumns}
                dataSource={hookList}
                expandedRowRender={this.expandedRowRender}
                size="middle"
                pagination={false}
              />
              {Hook.length > 5 && (
                <Button
                  type="default"
                  className={styles.showMore}
                  onClick={() => {
                    this.setState({
                      showAll: true,
                      allData: { theme: 'Hook行为', allList: behaviorObjUpload.Hook },
                    });
                  }}
                >
                  查看完整行为
                </Button>
              )}
            </div>
            <div className={styles['info-block']}>
              <h4 className={styles.title2}>其他行为</h4>
              <Table
                rowKey="id"
                columns={this.tableColumns}
                dataSource={otherList}
                expandedRowRender={this.expandedRowRender}
                size="middle"
                pagination={false}
              />
              {Other.length > 5 && (
                <Button
                  type="default"
                  className={styles.showMore}
                  onClick={() => {
                    this.setState({
                      showAll: true,
                      allData: { theme: '其他行为', allList: behaviorObjUpload.Other },
                    });
                  }}
                >
                  查看完整行为
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ minHeight: 600 }}>
            <div style={{ margin: '20px 0 10px', fontWeight: 'bold', fontSize: '16px' }}>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  this.setState({ showAll: false, allData: { theme: '', allList: [] } });
                }}
              >
                <LeftOutlined />
                返回
              </span>
              <span>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                {theme}
              </span>
            </div>
            <Table
              rowKey="id"
              // loading={allLoading}
              columns={this.tableColumns}
              dataSource={allList}
              expandedRowRender={this.expandedRowRender}
              pagination={false}
              // size="middle"
              // pagination={{
              //   defaultPageSize: query.size,
              //   current: query.page,
              //   total,
              //   showSizeChanger: true,
              //   pageSizeOptions: configSettings.pageSizeOptions,
              //   showTotal: totalNum => `（${totalNum}项）`,
              // }}
              // onChange={this.handleTableChange}
            />
          </div>
        )}
        <Modal
          visible={showTree}
          title="完整进程树"
          footer={null}
          onCancel={() => {
            this.setState({ showTree: false, expandedKeys: [], autoExpandParent: true });
          }}
        >
          <Tree
            showLine
            onExpand={this.onTreeExpand}
            expandedKeys={expandedKeys.length === 0 ? defaultExpandedKeys : expandedKeys}
            // defaultExpandedKeys={defaultExpandedKeys}
            autoExpandParent={autoExpandParent}
            onSelect={this.onTreeSelect}
            selectedKeys={selectedKeys}
            defaultExpandAll={expandAll}
          >
            {this.renderTreeNodes(treeData, defaultExpandedKeys)}
          </Tree>
        </Modal>
      </div>
    );
  }
}

export default connect(({ aptDetail, loading }) => ({
  aptDetail,
  loading: loading.effects['aptDetail/fetchUoloadFileBehavior'],
}))(FileBehaviorAptUpload);
