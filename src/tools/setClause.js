const setClause = (value, field, opVal, boolVal, search) => {
  let clause = {};
  let query = {};
  let bool = boolVal;
  let op = opVal;
  if (op === 'match_all') {
    // console.log('op', op);
  } else if (op === 'query_string') {
    query.default_field = field;
    query.query = value;
  } else if (op === 'missing') {
    if (bool === 'must') {
      bool = 'must_not';
    } else if (bool === 'must_not') {
      bool = 'must';
    }
    op = 'exists';
    query.field = field;
  } else if (op === 'term') {
    op = 'match_phrase';
    query[field] = { query: value };
  } else {
    query[field] = value;
  }
  if (bool === 'should' && op === 'exists') {
    query = { bool: { must_not: { exists: { field } } } };
    clause = query;
    // console.log('clause', clause);
  } else {
    clause[op] = query;
  }
  search.bool[bool].unshift(clause);
  // return search;
};
export default setClause;
