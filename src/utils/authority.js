import crypto from 'crypto';
import Cookies from 'js-cookie';
import _ from 'lodash';
import { getDvaApp } from 'umi';

function md5check(string) {
  const hash = Cookies.get('hash') || '';
  return crypto.createHash('md5').update(string).digest('hex') === hash;
}
function getAuthority() {
  const username = Cookies.get('username') || '';
  const role = Cookies.get('role') || '';
  const expire = Cookies.get('expire') || '';
  const string = username + role + expire;
  // finazhang modify currentAuthority type String=> Object
  // 登录需要验证hash，但是菜单权限验证需要知道role
  const AuthorityValue = {
    hash: string,
    role,
  };
  console.log('getAuthority===', AuthorityValue);
  return AuthorityValue;
}

/**
 * set cookie sign for cookie data safe
 *
 */
function setCookieSign() {
  const includes = ['username', 'role'];
  const cookies = _.merge({}, Cookies.get());
  const hash = crypto.createHash('sha1');
  const params = [];
  Object.keys(cookies)
    .sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    })
    .forEach((key) => {
      if (includes.indexOf(key) >= 0) {
        params.push(`${key}=${cookies[key]}`);
      }
    });
  Cookies.set('sign', hash.update(params.join('\n')).digest('hex'));
}

function setAuthority(authority) {
  const baseOpts = { exports: 2, path: '/' };
  const keys = Object.keys(authority);
  if (keys.length) {
    keys.forEach((key) => {
      Cookies.set(key, authority[key], baseOpts);
    });
    // create cookie sign and check auth for api request
    setCookieSign();
  }

  // Cookies.set('username', authority.username, { expires: 2, path: '/' });
  // Cookies.set('role', authority.role, { expires: 2, path: '/' });
  // Cookies.set('expire', authority.expire, { expires: 2, path: '/' });
  // Cookies.set('hash', authority.hash, { expires: 2, path: '/' });
  // Cookies.set('token', authority.token, { expires: 2, path: '/' });
}

function clearListCookies() {
  // 不需要清理的cookie的key可加到excepts中过滤
  const excepts = [];
  const cookies = Cookies.get();
  Object.keys(cookies).forEach((key) => {
    if (excepts.indexOf(key) < 0) {
      Cookies.remove(key);
    }
  });
  // Cookies.remove('username', { path: '' });
  // Cookies.remove('expire', { path: '' });
  // Cookies.remove('role', { path: '' });
  // Cookies.remove('hash', { path: '' });
  // Cookies.remove('token', { path: '' });
}

/**
 *
 * @param {string} path 页面路径
 *
 */
function getAuth(path) {
  const { _store } = getDvaApp();
  const { authMap } = _store.getState().global;
  return authMap[path] || '';
}

function setDomain(domain) {
  document.domain = domain;
}

export default {
  md5check,
  getAuthority,
  setAuthority,
  clearListCookies,
  setDomain,
  getAuth,
};
