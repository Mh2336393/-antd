/* eslint-disable react/jsx-no-undef */
import React, { Fragment, PureComponent } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Modal, Upload, Button, message } from 'antd';
import Cookies from 'js-cookie';

class UploadTemplate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      uploadResult: {},
      uploading: false,
    };
  }

  uploadCancel = () => {
    const { cancel } = this.props;
    this.setState({ fileList: [], uploading: false, uploadResult: {} });
    cancel();
  };

  beforeUpload = file => {
    const { accept, sizeLimit, sizeError, beforeUploadFn } = this.props;
    const { fileList } = this.state;
    if (beforeUploadFn) {
      const beforeFlag = beforeUploadFn();
      if (!beforeFlag) {
        return false;
      }
    }
    let formatArr = [];
    if (!accept) {
      formatArr = ['csv', 'xls', 'xlsx'];
    } else {
      formatArr = accept.split(';').map(format => format.split('.').pop());
    }
    console.log('formatArr', formatArr);
    const type = file.name.split('.').pop();
    const isOK = accept === undefined ? true : formatArr.indexOf(type) > -1;
    const sizelimit = sizeLimit || 1024;
    const sizeErr = sizeError || '文件大小超过1G,禁止上传';
    const is1G = file.size / 1024 / 1024 <= sizelimit;
    if (!is1G) {
      message.error(sizeErr);
      return false;
    }
    if (!isOK) {
      const content = (
        <Fragment>
          {
            formatArr.length===60?<p style={{width:'1100px',wordWrap: 'break-word',overflow:"hidden"}}>{`上传文件类型不合法,支持${accept || '*.csv;*.xls;*.xlsx'}文件`}</p>:<p>{`上传文件类型不合法,支持${accept || '*.csv;*.xls;*.xlsx'}文件`}</p>
          }
        </Fragment>
      );
      message.error({
        ...content,
      });
      return false;
    }
    this.setState({ fileList: [...fileList, file], uploading: true });
    return is1G && isOK;
  };

  uploadHandleChange = info => {
    const { file } = info;
    const result = file.response;
    if (!result) return;
    let { fileList } = this.state;
    const { handeUploadResut, uploadResultFn } = this.props;
    fileList = fileList.slice();
    const fileArr = fileList.filter(item => item.uid === file.uid);
    let uploadMsg = '';
    // console.log(result.error_code);
    if (result.error_code === 0) {
      uploadMsg = result.msg || '上传成功';
      // console.log('uploasMsg', uploadMsg);
    } else {
      uploadMsg = `上传失败：${result.msg}`;
      fileArr[0].status = 'error';
      fileArr[0].response = `${result.msg}`;
    }
    if (uploadResultFn) {
      uploadResultFn();
    }
    if (handeUploadResut) {
      const customMsg = handeUploadResut(result);
      // console.log('customMsg', customMsg);
      this.setState({ uploadResult: customMsg, uploading: false, fileList });
    } else {
      this.setState({ uploadResult: { uploadMsg }, uploading: false, fileList });
    }
  };

  onRemove = file => {
    this.setState(({ fileList }) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      return {
        fileList: newFileList,
      };
    });
    this.setState({ uploading: false });
  };

  render() {
    const { fileList, uploadResult, uploading } = this.state;
    const {
      title,
      fileFormat,
      action,
      accept,
      cmd,
      type,
      uploadVisible,
      TipEle = null,
      mouldDown = '',
    } = this.props;
    const uploadProps = {
      name: 'file',
      accept: accept || '*.csv;*.xls;*.xlsx',
      headers: { Authorization: Cookies.get('token') },
      action: action || '/api/upload',
      beforeUpload: this.beforeUpload,
      data: {
        cmd,
        type,
      },
      onChange: this.uploadHandleChange,
      onRemove: this.onRemove,
    };
    return (
      <Modal
        title={title}
        visible={uploadVisible}
        destroyOnClose
        onCancel={this.uploadCancel}
        footer={null}
      >
        {TipEle && (
          <div
            style={{
              padding: '24px',
              color: '#0050b3',
              backgroundColor: '#bae7ff',
              margin: '-24px -24px 24px -24px',
            }}
          >
            {TipEle}
          </div>
        )}
        <p>
          {fileFormat === undefined
            ? '请选择*.csv utf-8无BOM编码、*.xls，*.xlsx格式的文件。'
            : fileFormat}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Upload {...uploadProps} fileList={fileList} disabled={uploading}>
              <Button loading={uploading}>
                <UploadOutlined />
                {uploading ? '正在上传' : '点击上传'}
              </Button>
              {/* {uploadResult.uploadError &&
            uploadResult.uploadError.map(item => (
              <p key={item} className="fontRed">
                第{item}行
              </p>
            ))} */}
            </Upload>
          </div>
          <div>
            {mouldDown && (
              <a style={{ paddingRight: '30px' }} href={mouldDown}>
                模板下载
              </a>
            )}
          </div>
        </div>

        <div style={{ marginTop: '5px' }}>
          <p>
            {uploadResult.uploadMsg && uploadResult.uploadMsg.indexOf('失败') ? (
              <span className="fontRed">{uploadResult.uploadMsg}</span>
            ) : (
              <span>{uploadResult.uploadMsg}</span>
            )}
          </p>
        </div>
      </Modal>
    );
  }
}

export default UploadTemplate;
