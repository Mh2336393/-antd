import mockjs from 'mockjs';
// import moment from 'moment';

function getPropertyList(req, res) {
  const { body } = req;
  const list = mockjs.mock({
    'list|100': [
      {
        'id|+1': mockjs.mock('@increment(1)'),
        Fupdate_time: '2018-09-10',
        Fasset_name: '事件名称',
        Fip: mockjs.mock('@ip'),
        Fmac: mockjs.mock('@mac'),
        'Fport|1': ['90', '80'],
        'Fcategory|1': [0, 1, 2],
        'Fgroup|1': ['a', 'b'],
        'Fsource|1': [0, 1, 2],
      },
    ],
  });
  const result = {
    error_code: 0,
    msg: 'ok',
    data: {
      list: list.list.slice((body.page - 1) * body.pageSize, body.page * body.pageSize),
      total: 100,
    },
  };
  res.json(result);
}
export default {
  'POST /api/propertyMgr/getPropertyList': getPropertyList,
};
