import React, { PureComponent } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Modal, Upload, Button, message } from 'antd';
import Cookies from 'js-cookie';
import moment from 'moment';

class UploadPatch extends PureComponent {
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
    const { accept, whetherToCheckTheFileSize = true } = this.props;
    console.log(this.props)
    const { fileList } = this.state;
    let formatArr = [];
    if (!accept) {
      formatArr = [".bin"];
    } else {
      formatArr = accept.split(';').map(format => format.split('.').pop());
    }
    const type = file.name.split('.').pop();
    const isOK = accept === undefined ? true : formatArr.indexOf(type) > -1;
    if (!isOK) {
      message.error(`上传文件类型不合法`);
      return false;
    }
    // 判断是否如果要求进行文件大小检查
    if (whetherToCheckTheFileSize) {
      const is1G = file.size / 1024 / 1024 < 1024;
      if (!is1G) {
        message.error('文件大小超过1G,禁止上传');
        return false
      }
    }
    this.setState({ fileList: [...fileList, file], uploading: true });
  };

  uploadHandleChange = info => {
    const { file } = info;
    console.log(info.file)
    const result = file.response;
    if (!result) return;
    let { fileList } = this.state;
    const { handeUploadResut, afterUpload } = this.props;
    fileList = fileList.slice();
    const fileArr = fileList.filter(item => item.uid === file.uid);
    let uploadMsg = '';
    if (result.error_code === 0) {
      uploadMsg = result.msg || '上传成功';
    }else if(fileArr[0]){
      uploadMsg = `上传失败：${result.msg}`;
      fileArr[0].status = 'error';
      fileArr[0].response = `${result.msg}`;
      
    }
    if (handeUploadResut) {
      const customMsg = handeUploadResut(result, categry);
    
      this.setState({
        uploadResult: customMsg,
        uploading: false,
        fileList: []
      });
      afterUpload(result)
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
    const { title, fileFormat, action, accept, cmd, type, uploadVisible} = this.props;
    const uploadProps = {
      name: 'file',
      accept:accept,
      headers: { Authorization: Cookies.get('token') },
      action:action ,
      beforeUpload: this.beforeUpload,
      data: {
        cmd,
        type,
      },
      onChange: this.uploadHandleChange,
      onRemove: this.onRemove,
    };
    console.log(uploadProps)
    return (
      <Modal title={title} visible={uploadVisible} destroyOnClose onCancel={this.uploadCancel} footer={null}>
        <p>{fileFormat === undefined ? '请选择*bin格式的文件。' : fileFormat}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Upload {...uploadProps} fileList={fileList} disabled={uploading}>
              <Button loading={uploading}>
                <UploadOutlined />
                {uploading ? '正在上传' : '点击上传'}
              </Button>
             
            </Upload>
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

export default UploadPatch;
