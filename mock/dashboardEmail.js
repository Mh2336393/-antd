import mockjs from 'mockjs';

function getMailCountData(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        name: 'London',
        'Jan.': 18.9,
        'Feb.': 28.8,
        'Mar.': 39.3,
        'Apr.': 81.4,
        May: 47,
        'Jun.': 20.3,
        'Jul.': 24,
        'Aug.': 35.6,
      },
      {
        name: 'Berlin',
        'Jan.': 12.4,
        'Feb.': 23.2,
        'Mar.': 34.5,
        'Apr.': 99.7,
        May: 52.6,
        'Jun.': 35.5,
        'Jul.': 37.4,
        'Aug.': 42.4,
      },
    ],
  };
  return res.json(result);
}

function getSourceCountryData(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        country: '委内瑞拉',
        count: 88,
        percent: 2,
      },
      {
        country: '委内瑞拉',
        count: 88,
        percent: 2,
      },
      {
        country: '委内瑞拉',
        count: 88,
        percent: 2,
      },
      {
        country: '委内瑞拉',
        count: 88,
        percent: 2,
      },
      {
        country: '委内瑞拉',
        count: 88,
        percent: 2,
      },
    ],
  };
  return res.json(result);
}

function getSendData(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        send: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
      {
        send: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
      {
        send: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
      {
        send: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
      {
        send: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
    ],
  };
  return res.json(result);
}

function getReciveData(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        recive: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
      {
        recive: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
      {
        recive: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
      {
        recive: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
      {
        recive: 'billing@true-telecom.com',
        count: 8888,
        percent: 2,
      },
    ],
  };
  return res.json(result);
}

function getFishMailData(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        domain: '1104.tech',
        tag: 'CC',
        count: 8888,
        recive: 'user@111.com',
        time: '2018-09-06 19:22:31',
        reqCount: 66,
      },
      {
        domain: '1104.tech',
        tag: 'CC',
        count: 8888,
        recive: 'user@111.com',
        time: '2018-09-06 19:22:31',
        reqCount: 66,
      },
      {
        domain: '1104.tech',
        tag: 'CC',
        count: 8888,
        recive: 'user@111.com',
        time: '2018-09-06 19:22:31',
        reqCount: 66,
      },
      {
        domain: '1104.tech',
        tag: 'CC',
        count: 8888,
        recive: 'user@111.com',
        time: '2018-09-06 19:22:31',
        reqCount: 66,
      },
      {
        domain: '1104.tech',
        tag: 'CC',
        count: 8888,
        recive: 'user@111.com',
        time: '2018-09-06 19:22:31',
        reqCount: 66,
      },
    ],
  };
  return res.json(result);
}

function getMaliciousMail(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        score: 90,
        eventName: 'xxx',
        type: '木马',
        virusName: 'trojan',
        time: '2018-09-06 19:22:31',
      },
      {
        score: 90,
        eventName: 'xxx',
        type: '木马',
        virusName: 'trojan',
        time: '2018-09-06 19:22:31',
      },
      {
        score: 90,
        eventName: 'xxx',
        type: '木马',
        virusName: 'trojan',
        time: '2018-09-06 19:22:31',
      },
      {
        score: 90,
        eventName: 'xxx',
        type: '木马',
        virusName: 'trojan',
        time: '2018-09-06 19:22:31',
      },
      {
        score: 90,
        eventName: 'xxx',
        type: '木马',
        virusName: 'trojan',
        time: '2018-09-06 19:22:31',
      },
    ],
  };
  return res.json(result);
}

function getMailAttach(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [],
  };
  return res.json(result);
}

export default {
  'POST /api/topic/getMailCount': getMailCountData,
  'POST /api/topic/getSourceCountry': getSourceCountryData,
  'POST /api/topic/getSendData': getSendData,
  'POST /api/topic/getReciveData': getReciveData,
  'POST /api/topic/getFishMailData': getFishMailData,
  'POST /api/topic/getMaliciousMailData': getMaliciousMail,
  'POST /api/topic/getMailAttachData': getMailAttach,
};
