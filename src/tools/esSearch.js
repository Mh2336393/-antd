// import moment from 'moment';
/**
 * 功能：用于es搜索的分页逻辑判断，返回合理的total用于分页
 * @param {Number} pageSize 直方图下钻的时间范围
 * @param {Number} total 搜索查询获得的总日志数
 */
const fetchPaginationTotal = (pageSize, total) => {
  if (total > 10000) {
    const remainder = 10000 % pageSize;
    if (remainder === 0) {
      return 10000;
    }
    return 10000 - remainder;
  }
  const remainderNew = total % pageSize;
  if (remainderNew === 0) {
    return total;
  }
  if ((Math.floor(total / pageSize) + 1) * pageSize <= 10000) {
    return total;
  }
  return total - remainderNew;
};

// 用于es简单查询（filter block）
const logTypeName = {
  term: '精确匹配',
  wildcard: '通配符匹配',
  prefix: '开始于',
  missing: '缺省',
  range: '范围',
};

const getSelectedType = type => {
  let ops = [];
  if (type === '_all') {
    ops = ['query_string'];
  } else if (type === 'string' || type === 'text' || type === 'keyword') {
    ops = ['term', 'wildcard', 'prefix', 'missing'];
  } else if (type === 'long' || type === 'integer' || type === 'float' || type === 'byte' || type === 'short' || type === 'double') {
    ops = ['term', 'range', 'missing'];
  } else if (type === 'date') {
    ops = ['term', 'range', 'missing'];
  } else if (type === 'geo_point') {
    ops = ['missing'];
  } else if (type === 'ip') {
    ops = ['term', 'range', 'missing'];
  } else if (type === 'boolean') {
    ops = ['term'];
  } else {
    ops = ['term'];
  }
  return ops;
};

const changeQueryOpHandler = opv => {
  if (opv === 'range') {
    return 'range';
  }
  if (opv === 'missing') {
    return 'missing';
  }
  return 'input';
};

const categoryMapping = {
  入侵感知事件: '入侵感知',
  失陷感知事件: '失陷感知',
  异常文件事件: '异常文件感知',
};

/**
 * 功能：通过选择的索引，与当前选择的时间范围，计算出真实用于检索的索引,及计算出query查询条件中should子句的查询条件（兼容'入侵感知告警', '失陷感知告警', '异常文件告警'索引的选择）
 * @param {object} startTime 检索查询的开始时间，moment对象
 * @param {object} endTime 检索查询的结束时间，moment对象
 * @param {Object} indexSelect 数组类型，存放已选的索引
 * @param {Object} indexStore 现存的所有索引
 * @param {Object} query 查询query
 */
const getFinalQuery = (indexSelect, queryObj) => {
  const query = queryObj;
  const categoryArr = ['入侵感知事件', '失陷感知事件', '异常文件事件'];

  const categorySelected = [];

  const categoryExceptSeleted = [];
  indexSelect.forEach(index => {
    if (categoryArr.indexOf(index) > -1) {
      categorySelected.push(index);
    } else {
      categoryExceptSeleted.push(index);
    }
  });
  const indexQuery = [...categoryExceptSeleted];
  console.log('categoryExceptSeleted::', categoryExceptSeleted);
  const conditionMustArr = query.body.query.bool.filter.bool.must.filter(item => {
    if (item.bool) {
      return false;
    }
    return true;
  });

  if (categorySelected.length > 0) {
    const shouldArr = categorySelected.map(index => ({ term: { category_1: categoryMapping[index] } }));
    if (categoryExceptSeleted.length > 0) {
      shouldArr.push({ bool: { must_not: { exists: { field: 'category_1' } } } });
    }
    const mustObj = { bool: { should: [] } };
    mustObj.bool.should = shouldArr;
    conditionMustArr.unshift(mustObj);
    indexQuery.push('event');
  }
  // console.log('conditionMustArr:', conditionMustArr);
  query.index = indexQuery; // 索引
  query.body.query.bool.filter.bool.must = conditionMustArr; // should查询语句
  return query;
};

const fieldParsing = (key, val, fieldObj) => {
  const fieldVal = fieldObj[key];
  const obj = fieldObj;
  if (Array.isArray(val)) {
    // for (let i = 0; i < val.length; i += 1) {
    //     if (typeof val[i] !== 'object') {
    //         obj[key] = val;
    //         break;
    //     }
    //     fieldParsing(key, val[i], fieldObj);
    // }
    for (let i = 0; i < 30; i += 1) {
      if (typeof val[i] !== 'object') {
        // obj[key] = val;
        obj[key] = val.slice(0, 30);
        break;
      }
      fieldParsing(key, val[i], fieldObj);
    }
  } else if (typeof val === 'object' && val !== null) {
    Object.keys(val).forEach(objKey => {
      fieldParsing(`${key}.${objKey}`, val[objKey], fieldObj);
    });
  } else if (typeof val === 'object' && val === null) {
    obj[key] = val;
  } else if (fieldVal !== undefined) {
    if (Array.isArray(fieldVal) && fieldVal.indexOf(val) < 0) {
      fieldVal.push(val);
    } else if (fieldVal !== val) {
      obj[key] = [fieldVal, val];
    }
  } else {
    obj[key] = val;
  }
  // console.log("key::::",key, "       val::::: ", val);
  return obj;
};
/**
 * 功能：解析日志的_source字段，返回_source下所有字段的细化结果。对象、数组中的字段也要全部细化进行展示
 * @param {object} _source 待解析日志的_source字段
 */
const sourceFieldParsing = record => {
  const { _id, _index, _score, _type, _source } = record;
  let obj = { _id, _index, _score, _type };
  Object.keys(_source).forEach(key => {
    obj = fieldParsing(key, _source[key], obj);
  });
  return obj;
};

const fieldParsingInTable = (key, val, objArr) => {
  if (Array.isArray(val)) {
    // val.forEach(item => {
    //     fieldParsingInTable(key, item, objArr);
    // });
    val.slice(0, 30).forEach(item => {
      fieldParsingInTable(key, item, objArr);
    });
  } else if (typeof val === 'object') {
    Object.keys(val).forEach(objKey => {
      fieldParsingInTable(`${key}.${objKey}`, val[objKey], objArr);
    });
  } else {
    const included = objArr.some(ele => ele.key === key && ele.val === val);
    if (!included) {
      objArr.push({ key, val });
    }
  }
  // console.log("key::::",key, "       val::::: ", val);
  return objArr;
};

/**
 * 功能：解析日志的_source字段在table中进行展示，返回_source下所有字段的细化结果，存于对象数组中。
 * @param {object} _source 待解析日志的_source字段
 */
const sourceFieldParseInTable = record => {
  const { _id, _index, _score, _type, _source } = record;
  let objArr = [{ key: '_id', val: _id }, { key: '_index', val: _index }, { key: '_score', val: _score }, { key: '_type', val: _type }];
  Object.keys(_source).forEach(key => {
    objArr = fieldParsingInTable(key, _source[key], objArr);
  });
  return objArr;
};

export default {
  fetchPaginationTotal,
  logTypeName,
  getSelectedType,
  changeQueryOpHandler,
  getFinalQuery,
  sourceFieldParsing,
  sourceFieldParseInTable,
};
