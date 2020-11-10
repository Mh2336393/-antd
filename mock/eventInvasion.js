import common from './common';

function getCategory2(req, res) {
  const list = [{ name: '网络攻击', value: '网络攻击' }];
  const result = {
    error_code: 0,
    msg: 'ok',
    data: list,
    recordsTotal: 8,
  };
  res.json(result);
}
export default {
  'POST /api/event/delInvasionEvent': common.ok,
  'POST /api/event/enableInvasionEvent': common.ok,
  'POST /api/event/disableInvasionEvent': common.ok,
  'POST /api/event/getCategory2': getCategory2,
};
