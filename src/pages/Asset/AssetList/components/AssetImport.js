import React, { Component } from 'react';
import { connect } from 'umi';
import { CloseOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { Modal, Row, Col, Button, Radio, message } from 'antd';
// import ImportRecord from './ImportRecord';
import downloadFile from '@/tools/download';
import styles from './AssetImport.less';

@connect(({ assetList }) => ({
  assetList,
}))
class AssetImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      // importTip: false, // 导入的资产
      // importType: 0,
    };
  }

  footer = () => (
    <div className={styles.footerWrapper}>
      <div className={styles.actionBtn}>
        <Button onClick={this.onCancel}>取消</Button>
        <Button type="primary" onClick={this.uploadFile}>
          确认
        </Button>
      </div>
    </div>
  );

  getFile = (e) => {
    const file = e.target.files[0];
    const filename = e.target.value;
    const { fileList } = this.state;
    if (filename.indexOf('.xls') < 0) {
      message.error('请上传.xls文件');
      return;
    }
    const is1G = file.size / 1024 / 1024 < 1024;
    if (!is1G) {
      message.error('文件大小超过1G,禁止上传');
      return;
    }
    this.setState({ fileList: [...fileList, file] });
    this.upload.value = '';
  };

  uploadFile = () => {
    const { fileList } = this.state;
    const data = new FormData();
    data.append('file', fileList[0]);
    // data.append('mode', 0);
    fetch('/api/asset/load', {
      method: 'POST',
      body: data,
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    }).then((response) => {
      response
        .json()
        .then((json) => {
          if (!json) return;
          if (json.error_code === 0) {
            if (json.data.result.length === 0) {
              message.success('导入资产成功');
              this.onCancel('load');
            } else {
              const { result } = json.data;
              const msg = result.map((item) => `第${item.idx}行${item.msg}`);
              const msgReact = (
                <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                  <div style={{ display: 'inline-block', verticalAlign: 'top' }}>导入失败:</div>
                  <div style={{ display: 'inline-block' }}>
                    {msg.map((item) => (
                      <p>{item}</p>
                    ))}
                  </div>
                </div>
              );
              // message.error(`导入失败：${msg.join('\n')}`);
              message.error(msgReact);
            }
          } else {
            message.error(`${json.msg}`);
          }
        })
        .catch((error) => {
          console.log('error', error);
        });
    });
  };

  onCancel = (type) => {
    this.setState({ fileList: [] });
    if (this.props.cancel) {
      this.props.cancel(type);
    }
  };

  handleDownload = () => {
    const options = {
      uri: '/api/asset/downloadTemplate',
      // data: {},
      filename: `资产表模板.xls`,
    };
    downloadFile(options);
  };

  removeFile = (file) => {
    this.setState(({ fileList }) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      return {
        fileList: newFileList,
      };
    });
  };

  render() {
    const { visible, accept, btntext } = this.props;
    const { fileList } = this.state;
    console.log('accept', accept);
    return (
      <div>
        <Modal
          bodyStyle={{ padding: 0 }}
          visible={visible}
          title="导入资产"
          onCancel={this.onCancel}
          footer={this.footer()}
        >
          <div className={styles.bodyWrapper}>
            <div className={styles.tips}>
              <div>资产导入列表填写帮助:</div>
              <div>1、端口填写多个时，请用逗号分隔，如:端口1,端口2。</div>
              <div>2、带“*”为必填项，其余为非必填项。</div>
              <div>
                3、资产类型等字段，请参照系统中新建资产页中的预置值填写，否则可能会导致导入失败。
              </div>
            </div>
            <div className={styles.actionCon}>
              <Row type="flex" align="bottom" justify="space-between">
                <Col span={4}>选择文件:</Col>
                <Col span={12}>
                  <div>
                    <span>
                      <input
                        ref={(input) => {
                          this.upload = input;
                        }}
                        style={{ display: 'inline-block', width: '200px' }}
                        className={styles.uplaod}
                        type="file"
                        accept={accept}
                        onChange={(e) => {
                          this.getFile(e);
                        }}
                      />
                      <Button>
                        <UploadOutlined />
                        <span>{btntext || '上传文件'}</span>
                      </Button>
                    </span>
                  </div>
                </Col>
                <Col span={8}>
                  <a
                    onClick={() => {
                      this.handleDownload();
                    }}
                  >
                    下载模板
                  </a>
                </Col>
              </Row>
              <Row>
                <Col span={4} />
                <Col span={12}>
                  {fileList.map((item, index) => {
                    const { name } = item;
                    return (
                      <div key={index.toString()}>
                        <PaperClipOutlined />
                        <a>{name}</a>
                        <CloseOutlined
                          onClick={() => {
                            this.removeFile(item);
                          }} />
                      </div>
                    );
                  })}
                </Col>
              </Row>
            </div>
          </div>
        </Modal>
        {/* <Modal
          destroyOnClose
          visible={importTip}
          title="提示"
          onOk={this.changeUploadMode}
          onCancel={() => {
            this.setState({ importTip: false, importType: 0 });
          }}
        >
          <div>
            <div>导入资产有冲突，请选择导入方式</div>
            <Radio.Group
              defaultValue={importType}
              onChange={e => {
                this.setState({ importType: e.target.value });
              }}
            >
              <Radio value={1}>撤销导入</Radio>
              <Radio value={2}>仅导入新资产</Radio>
              <Radio value={3}>覆盖原资产（不建议）</Radio>
            </Radio.Group>
          </div>
        </Modal> */}
      </div>
    );
  }
}

export default AssetImport;
