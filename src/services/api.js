/* eslint-disable  consistent-return  */
/* eslint-disable  prefer-promise-reject-errors */
/* eslint-disable  no-underscore-dangle */

import { stringify } from 'qs';
import request from '@/utils/request';
import { message } from 'antd';
import Cookies from 'js-cookie';
import { history, getDvaApp } from 'umi';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'update',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function removeFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'delete',
    },
  });
}

export async function addFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'post',
    },
  });
}

export async function updateFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'update',
    },
  });
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/captcha?mobile=${mobile}`);
}

export async function configRequest() {
  const url = '/api/getConfig';
  const showTce = Cookies.get('showTce');
  return request(url, {
    method: 'GET',
  })
    .then((response) => {
      // tce 代码
      if (showTce === '1' && response.error_code !== 0) {
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        } else {
          // dispatch(history.push('/user/login'));
        }
        return;
      }
      return response;
    })
    .catch((err) => {
      // console.log('getConfig err:', err);
      message.error(`操作失败：${err.msg}`);
    });
}
/**
 * @param {String} path url地址
 * @param {Object} data 参数
 * @param {Boolean} shouldReturnError 是否需要返回错误信息
 */
export async function apiRequest(path, data, shouldReturnError) {
  const url = `/api/${path}`;
  return request(url, {
    method: 'POST',
    body: data,
    // 添加csrf header头部
    // headers: { Authorization: Cookies.get('token') },
  })
    .then((response) => {
      if (response.error_code !== 0) {
        if (response.error_code === -2) {
          Cookies.remove('SESSION_ID');
          Cookies.remove('SESSION_ID_HTTPS');

          const curPath = window.location.href.split('/').pop();

          const showTce = Cookies.get('showTce');
          // console.log(182, '166showTce==', showTce);
          if (response.redirectUrl) {
            // tce 环境下 redirectUrl才有值
            window.location.href = response.redirectUrl;
            return;
          }

          if (curPath !== 'login') {
            const { dispatch, getState } = getDvaApp()._store;
            const urlParams = new URL(window.location.href);
            const { pathname } = getState().router.location;
            urlParams.searchParams.set('redirect', pathname);
            // add the parameters in the url
            window.history.replaceState(null, 'login', urlParams.href);
            if (showTce !== '1') {
              dispatch(history.push('/user/login'));
            }
          }
          return;
        }
        // message.error(`接口状态码异常：${response.msg}`);
        return Promise.reject({
          error_code: response.error_code,
          msg: response.msg,
        });
      }
      return response;
    })
    .catch((err) => {
      if (!shouldReturnError) {
        message.error(`操作失败：${err.msg}`);
      } else {
        return Promise.reject(err);
      }
    });
}
export async function esRequest(method = 'GET', url, data) {
  const options = {
    method,
    // headers: { Authorization: Cookies.get('token') }, // 添加csrf header头部
  };
  let uri = url;
  if (method === 'GET') {
    uri = `/api/es`;
  } else {
    Object.assign(options, { body: data });
  }
  return request(uri, options)
    .then((response) => {
      if (!response.data || response.error_code !== 0) {
        if (response.error_code === -2) {
          const curPath = window.location.href.split('/').pop();
          if (curPath !== 'login') {
            Cookies.remove('SESSION_ID');
            Cookies.remove('SESSION_ID_HTTPS');
            debugger;
            const { dispatch, getState } = getDvaApp()._store;
            const showTce = Cookies.get('showTce');
            // console.log('240showTce==', showTce);
            // console.log('xx', window.location.hash);
            // const oldPathname = window.location.hash.split('#').pop();
            // get location pathname
            const urlParams = new URL(window.location.href);
            const { pathname } = getState().routing.location;
            urlParams.searchParams.set('redirect', pathname);
            // add the parameters in the url
            window.history.replaceState(null, 'login', urlParams.href);
            if (showTce !== '1') {
              dispatch(history.push('/user/login'));
            }
          }
          return;
        }
        return Promise.reject({
          error_code: response.error_code,
          msg: response.msg,
        });
      }
      return response;
    })
    .catch((err) => {
      // console.log('err:', err);
      message.error(`操作失败：${err.msg}`);
    });
}
export async function uploadRequest(data) {
  const url = `/api/upload`;
  return request(url, {
    method: 'POST',
    body: data,
  })
    .then((response) => {
      if (!response.data || response.error_code !== 0) {
        // console.log('true');
        return Promise.reject(response);
      }
      return response;
    })
    .catch((err) => Promise.reject(err));
}

export async function cgiRequestMany(data) {
  const { cmd, ids } = data;
  const url = `/api/cgiserver/${cmd}`;

  const fetchList = ids.map((item) => {
    const params = {
      cmd,
      id: item,
    };
    return request(url, {
      method: 'POST',
      body: params,
    });
  });
  return Promise.all(fetchList)
    .then((response) => response)
    .catch((err) => {
      // console.log(`${cmd} err:`, err);
      message.error(`操作失败：${err.msg}`);
    });
}

export async function errorReport(data) {
  const url = `/api/error/reportError`;
  request(url, { method: 'POST', body: data });
}
