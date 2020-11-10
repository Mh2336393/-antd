import React, { PureComponent } from 'react';
import { Upload, Button, message } from 'antd';

class UploadTml extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      // uploadResult: {},
      uploading: false,
    };
  }

  uploadCancel = () => {
    const { cancel } = this.props;
    this.setState({ fileList: [], uploading: false });
    // uploadResult: {}
    cancel();
  };

  beforeUpload = file => {
    const { accept, error } = this.props;
    const { fileList } = this.state;
    let formatArr = [];
    if (!accept) {
      formatArr = ['csv', 'xls', 'xlsx'];
    } else {
      formatArr = accept.split(';').map(format => format.split('.').pop());
    }
    const type = file.name.split('.').pop();
    const isOK = accept === undefined ? true : formatArr.indexOf(type) > -1;
    const maxSize = file.size / 1024 / 1024 < 3;
    if (!maxSize) {
      // message.error('文件大小超过3M,禁止上传');
      if (error) {
        error('文件过大，请重试');
      }
    }
    if (!isOK) {
      // message.error(`上传文件类型不合法，支持${accept || '*.csv;*.xls;*.xlsx'}文件`);
      if (error) {
        error(`上传文件不合法，支持${accept || '*.csv;*.xls;*.xlsx'}文件`);
      }
      return false;
    }
    this.setState({ fileList: [...fileList, file], uploading: true });
    return maxSize && isOK;
  };

  uploadHandleChange = info => {
    const { success, error,showUploadError } = this.props;
    const { file } = info;
    const result = file.response;
    console.log('result', result);
    if (!result) return;
    let { fileList } = this.state;
    fileList = fileList.slice();
    const fileArr = fileList.filter(item => item.uid === file.uid);
    // let uploadMsg = '';
    if (result.error_code === 0) {
      message.success('许可证导入成功!请登录');
      if (success) {
        success();
      }
      // console.log('uploasMsg', uploadMsg);
    } else {
      fileArr[0].status = 'error';
      fileArr[0].response = `${result.msg}`;
      if (error) {
        error(result.msg);
      }
    }

    this.setState({
      // uploadResult: { uploadMsg },
      uploading: false,
      fileList,
    });
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
  };

  render() {
    const { fileList, uploading } = this.state;
    const { action, accept, type } = this.props;
    const uploadProps = {
      name: 'file',
      accept: accept || '*.csv;*.xls;*.xlsx',
      headers: { Authorization: localStorage.getItem('token') },
      action: action || '/api/upload',
      beforeUpload: this.beforeUpload,
      data: {
        // cmd,
        type,
      },
      onChange: this.uploadHandleChange,
      onRemove: this.onRemove,
    };
    return (
      <Upload  {...uploadProps} fileList={fileList} showUploadList={false} disabled={uploading}>
        <Button className="uploadBtn" style={{height:"40px", background:"#2A62D1",padding:"0px 100px",color:"#fff"}} loading={uploading}>
          {this.props.showUploadError ? '重新上传' : '上传'}
        </Button>
      </Upload>
    );
  }
}

export default UploadTml;
