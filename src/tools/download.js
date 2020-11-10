import { fetch } from 'dva';

import { history, getDvaApp } from 'umi';
import { message } from 'antd';
import download from '../../public/js/download';

export default function downloadFile({ uri, data, filename = '', method = 'POST' }) {
  let options;
  const url = uri;
  if (method === 'POST') {
    options = {
      method,
      body: JSON.stringify(data),
      headers: {
        Authorization: localStorage.getItem('token'),
        'content-type': 'application/json; charset=utf-8',
      },
      credentials: 'include', // 兼容chrome 42-67版本，默认credentials为omit（阻止发送和接受cookie）
    };
  } else {
    options = {
      method,
      headers: {
        Authorization: localStorage.getItem('token'),
      },
      credentials: 'include',
    };
  }
  return fetch(url, options)
    .then((resp) => {
      const isfile = resp.headers.get('content-disposition');
      if (!isfile) {
        resp
          .json()
          .then((json) => {
            if (json.returnMessage || json.error_code) {
              message.error(json.returnMessage || json.msg);
              const { dispatch } = getDvaApp()._store;
              if (json.returnCode === -3) {
                dispatch(history.push('/user/login'));
              }
            }
          })
          .catch(() => {
            message.error('对不起，文件下载失败');
          });
      } else {
        resp
          .blob()
          .then((blob) => {
            // console.log('isfile::', isfile);
            // console.log('filename', filename);
            download(blob, filename || isfile.split('filename=')[1]);
          })
          .catch(() => {
            message.error('对不起，文件下载失败');
          });
      }
    })
    .finally(() => Promise.resolve(true));
}
