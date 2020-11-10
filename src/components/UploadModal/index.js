import React, { PureComponent } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Modal, Upload, Button, message } from 'antd';
import Cookies from 'js-cookie';
import moment from 'moment';

class UploadModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      uploadResult: {},
      uploading: false,
      tipVisible: false,
      // fileData: [],
    };
   
    this.uploadHandleChange =  this.uploadHandleChange.bind(this)
  }

  uploadCancel = () => {
    const { cancel } = this.props;
    this.setState({ fileList: [], uploading: false, uploadResult: {} });
    cancel();
  };

  beforeUpload = file => {
    const { accept, packVersion, categry, updatetime, whetherToCheckTheFileSize = true } = this.props;
    const { fileList } = this.state;
    const curVersion = packVersion.replace(/[^0-9]/gi, '');
    let formatArr = [];
    let newVersion;
    let updateTip;
    if (!accept) {
      formatArr = ['csv', 'xls', 'xlsx'];
    } else {
      formatArr = accept.split(';').map(format => format.split('.').pop());
    }
    const type = file.name.split('.').pop();

    const isOK = accept === undefined ? true : formatArr.indexOf(type) > -1;
    if (!isOK) {
      message.error(`上传文件类型不合法，支持${accept || '*.csv;*.xls;*.xlsx'}文件`);
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



    if (categry === 'rule') {
      const fileName = file.name;
      newVersion = fileName.replace(/[^0-9]/gi, '');
      // console.log('cur', parseInt(curVersion, 10));
      // console.log('new', parseInt(newVersion, 10));
      updateTip = parseInt(newVersion, 10) < parseInt(curVersion, 10); // 当前版本个上传版本比较
    } else if (categry === 'weixie') {
      // 增量：d2993df6233f2a8070eccce507f501d1_1560219212_v1.0_inc
      // 全量：d2993df6233f2a8070eccce507f501d1_1560219212_v1.0
      const fileName = file.name;
      const fileNameArr = fileName.split('_');
      // const versionNum = fileNameArr[2].replace(/[^0-9]/gi, '');
      // const versionFlag = fileNameArr.length === 3 || /^\d{10}$/.test(fileNameArr[1]) || /^\d{2,}$/.test(versionNum);
      // if (!(fileNameArr.length === 3 || /^\d{10}$/.test(fileNameArr[1]) || /^\d{2,}$/.test(fileNameArr[2].replace(/[^0-9]/gi, '')))) {
      //   message.error('请选择正确格式的文件');
      //   return false;
      // }
      if ((fileNameArr.length !== 3 && fileNameArr.length !== 4) || (fileNameArr.length === 4 && fileNameArr[3] !== 'inc')) {
        message.error('请选择正确格式的文件');
        return false;
      }
      // xxx_时间戳_版本号做校验
      const versionNum = fileNameArr[2].replace(/[^0-9]/gi, '');
      // console.log('fnum', /^\d{10}$/.test(fileNameArr[1]));
      // console.log('vnum', /^\d{2,}$/.test(versionNum));
      // console.log('ggg', /^\d{10}$/.test(fileNameArr[1]) && /^\d{2,}$/.test(versionNum));
      if (!(/^\d{10}$/.test(fileNameArr[1]) && /^\d{2,}$/.test(versionNum))) {
        message.error('请选择正确格式的文件');
        return false;
      }
      const newtime = fileName.split('_')[1];
      newVersion = versionNum;
      const time = moment(updatetime).valueOf() / 1000; // moment.unix(Number)
      updateTip = newtime < time || newVersion < curVersion;
    }
    if (updateTip) {
      this.setState({ tipVisible: updateTip, fileList: [...fileList, file] });
      return false;
    }
    this.setState({ fileList: [...fileList, file], uploading: true });
    return true
  };

  // 旧版本覆盖--手动上传
  update = () => {
    const { manualUplod, categry, cmd, type, afterManual } = this.props;
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('file', file);
    });
    formData.append('cmd', cmd);
    formData.append('type', type);
    this.setState({ tipVisible: false, uploading: true });
    manualUplod(categry, formData)
      .then(data => {
        this.setState({ uploadResult: data[0], uploading: false, fileList });
        afterManual('succ');
        this.setState({ fileList: [], uploading: false, uploadResult: {} });
      })
      .catch(error => {
        fileList[fileList.length - 1].status = 'error';
        console.log(104, 'error==', error, 'fileList==', fileList);
        this.setState({ uploadResult: error, uploading: false, fileList });
        afterManual('faild');
      });
  };

  cancelTip = () => {
    this.setState({ tipVisible: false, fileList: [], uploading: false, uploadResult: {} });
  };

  // 自动上传--新版本
  uploadHandleChange = info => {

    const { file } = info;
    const result = file.response;
    if (!result) return;
    let { fileList } = this.state;
    const { handeUploadResut, categry, afterUpload } = this.props;
    fileList = fileList.slice();
    const fileArr = fileList.filter(item => item.uid === file.uid);
    let uploadMsg = '';
    console.log(result.error_code);
    if (result.error_code === 0) {
      uploadMsg = result.msg || '上传成功';
    } else {
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
      afterUpload(result);
      // this.setState({ fileList: [], uploading: false, uploadResult: {} });
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
    const { fileList, uploadResult, uploading, tipVisible } = this.state;
    const { title, fileFormat, action, accept, cmd, type, uploadVisible, categry } = this.props;
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
      <div>
        <Modal title={title} visible={uploadVisible} destroyOnClose maskClosable={false} onCancel={this.uploadCancel} footer={null}>
          <p>{fileFormat === undefined ? '请选择*.csv utf-8无BOM编码、*.xls，*.xlsx格式的文件。' : fileFormat}</p>
          <Upload {...uploadProps} fileList={fileList} disabled={uploading}>
            <Button loading={uploading}>
              <UploadOutlined />
              {uploading ? '正在上传' : '点击上传'}
            </Button>
            <div style={{ marginTop: '5px' }}>
              <p>
                {uploadResult.uploadMsg && uploadResult.uploadMsg.indexOf('失败') ? (
                  <span className="fontRed">{uploadResult.uploadMsg}</span>
                ) : (
                  <span>{uploadResult.uploadMsg}</span>
                  )}
              </p>
            </div>
          </Upload>
        </Modal>
        <Modal visible={tipVisible} title="提示" onOk={this.update} onCancel={this.cancelTip}>
          {categry === 'weixie' ? (
            <div>您上传的威胁情报版本较旧，是否强制覆盖系统中威胁情报版本？</div>
          ) : (
            <div>您上传的规则版本较旧，是否强制覆盖系统中安全规则版本？</div>
            )}
        </Modal>
      </div>
    );
  }
}

export default UploadModal;
