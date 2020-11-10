/* eslint-disable  no-underscore-dangle */
/* eslint-disable  no-param-reassign */

import _ from 'lodash';

export default function handleEsData(data) {
  const handledData = data.map(item => {
    const { dst, src } = item._source;
    const uniqDst = _.uniqBy(dst, 'ip');
    const uniqSrc = _.uniqBy(src, 'ip');
    item._source.dst = uniqDst;
    item._source.src = uniqSrc;
    return {
      ...item._source,
      id: item._id,
      esIndex: item._index,
    };
  });
  return handledData;
}
