/* eslint-disable  consistent-return  */
/* eslint-disable  prefer-promise-reject-errors */
/* eslint-disable  no-underscore-dangle */

import request from '../utils/request';

export default async function userRequest(data) {
  const { cmd, ...other } = data;
  const url = `/api/user/${cmd}`;
  return request(url, { method: 'POST', body: other })
    .then(response => response)
    .catch(err => {
      console.log(`${cmd} err:`, err);
      // return Promise.reject(err);
    });
}
