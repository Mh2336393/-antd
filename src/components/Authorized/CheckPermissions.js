import React from 'react';
import PromiseRender from './PromiseRender';
import { CURRENT } from './renderAuthorize';

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

/**
 * 通用权限检查方法
 * Common check permissions method
 * @param { 权限判定 Permission judgment type string |array | Promise | Function } authority
 * @param { 你的权限 Your permission description  type:string} currentAuthority
 * @param { 通过的组件 Passing components } target
 * @param { 未通过的组件 no pass components } Exception
 */
const checkPermissions = (authority, currentAuthority, target, Exception) => {
  // console.log("checkPermissions==权限检查方法执行==参数打印==start")
  // console.log("authority：",authority)
  // console.log("currentAuthority：",currentAuthority)
  // console.log("target：",target)
  // console.log("Exception：",Exception)
  // console.log("checkPermissions==权限检查方法执行==参数打印==end")
  // 没有判定权限.默认查看所有
  // Retirement authority, return target;
  if (!authority) {
    return target;
  }

  // 数组处理
  if (Array.isArray(authority)) {
    // by finazhang 菜单权限验证使用 array string
    const { role } = currentAuthority;
    if (authority.indexOf(role) >= 0) {
      return target;
    }
    return Exception;
  }

  // string 处理
  if (typeof authority === 'string') {
    if (['r', 'rw'].indexOf(authority) > -1) {
      return target;
    }
    return Exception;
  }

  // Promise 处理
  if (isPromise(authority)) {
    return <PromiseRender ok={target} error={Exception} promise={authority} />;
  }

  // Function 处理
  if (typeof authority === 'function') {
    // by finazhang 登录验证使用hash
    const { hash } = currentAuthority;
    try {
      const bool = authority(hash);
      if (bool) {
        return target;
      }
      return Exception;
    } catch (error) {
      throw error;
    }
  }
  throw new Error('unsupported parameters');
};

export { checkPermissions };

const check = (authority, target, Exception) => checkPermissions(authority, CURRENT, target, Exception);

export default check;
