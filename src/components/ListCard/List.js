import React, { Fragment } from 'react';
import { Card, Progress, Popover } from 'antd';
// import classNames from 'classnames';
// import { Link } from 'umi';
import numeral from 'numeral';
import styles from './index.less';

// const renderCount = (total, value) => {
//     let totalDom;
//     switch (typeof total) {
//         case 'undefined':
//             totalDom = value;
//             break;
//         case 'function':
//             totalDom = <span className={styles.total}>{total(value)}</span>;
//             break;
//         default:
//             totalDom = <span className={styles.total}>{total}</span>;
//     }
//     return totalDom;
// };

class ListCardList extends React.PureComponent {
  // renderContent = () => {
  //     const {
  //         list,
  //         type = 'standard',
  //         name = 'key',
  //         value = 'count',
  //         valueRender,
  //         showInfo = false,
  //         strokeColor = '#5075FF',
  //         // title,
  //         loading,
  //         isJump = true,
  //         jumpUrl,
  //         jumpKey,
  //         blank
  //     } = this.props;
  //     if (loading) {
  //         return false;
  //     }
  //     return (
  //         <div className={styles.ListCardWrap}>
  //             {list.length > 0 ? (
  //                 <ul className={styles.ulist}>
  //                     {list.map((item, idx) => (
  //                         <li key={`${item[name]}_${idx}`} className={styles.listItem}>
  //                             <div className={styles.header}>
  //                                 {isJump ? (
  //                                     <Link
  //                                         target={blank}
  //                                         to={`${jumpUrl}${jumpKey ? item[jumpKey] : item[name]}`}
  //                                         className={styles.title}
  //                                         title={item[name]}
  //                                     >
  //                                         {item[name]}
  //                                     </Link>
  //                                 ) : (
  //                                         <span className={styles.title} title={item[name]}>
  //                                             {item[name]}
  //                                         </span>
  //                                     )}
  //                                 <span className={styles.count}>{renderCount(valueRender, item[value])}</span>
  //                             </div>
  //                             {type === 'progress' && (
  //                                 <div className={styles.progress}>
  //                                     <Progress
  //                                         strokeLinecap="square"
  //                                         percent={+item.percent}
  //                                         showInfo={showInfo}
  //                                         strokeColor={strokeColor}
  //                                         strokeWidth={12}
  //                                     />
  //                                 </div>
  //                             )}
  //                         </li>
  //                     ))}
  //                 </ul>
  //             ) : (
  //                     <div style={{ textAlign: 'center', paddingRight: '14px' }}>暂无数据</div>
  //                 )}
  //         </div>
  //     );
  // };

  render() {
    const {
      loading = false,
      // contentHeight,
      title,
      pageWidth = 1400,
      data = [],
      spanClick,
      // avatar,
      // action,
      // total,
      // footer,
      // children,
      // valueRender,
      // jumpUrl,
      // showInfo,
      // strokeColor,
      // isJump,
      // jumpKey,
      ...rest
    } = this.props;

    const pWidth = pageWidth < 1400 ? 1400 : pageWidth;
    const progressWid = ((pWidth - 12) / 24) * 6 - 72;
    // console.log('pWidth==', pWidth, 'progressWid==', progressWid);

    return (
      <Card
        className={styles.ListCard}
        title={title}
        loading={loading}
        headStyle={{ padding: '0 20px', height: '48px', lineHeight: '48px', fontSize: '14px' }}
        bodyStyle={{ padding: '10px 10px 10px 48px', height: 307 }}
        {...rest}
      >
        {data.map((obj, index) => {
          // obj.tags = ['电话号码', '银行卡', '邮箱', '身份证'];
          let showTags = obj.tags;
          let showUrl = obj.url;
          const urlStrLen = obj.url.length * 6.4;
          const tagsLen = obj.tags.length;
          let tagsFirstLen = 0;
          if (obj.tags[0]) {
            tagsFirstLen = obj.tags[0].length * 12 + 15;
          }
          // tag长度 = 个数*12+15；
          // console.log('obj.url.length', obj.url.length, 'urlStrLen==', urlStrLen, 'tagsLen', tagsLen, 'tagsFirstLen', tagsFirstLen);
          const diffLen = progressWid - (tagsFirstLen + urlStrLen);
          // console.log('diffLen==', diffLen);
          if (diffLen < 0) {
            if (tagsLen <= 1) {
              const disStr = Math.ceil((0 - diffLen) / 6.4) + 1;
              // console.log('disStr==', disStr);
              const str1 = obj.url.substring(0, obj.url.length - 5 - disStr);
              const str2 = obj.url.substring(obj.url.length - 5, obj.url.length);
              showUrl = `${str1}...${str2}`;
            } else if (tagsLen > 1) {
              // 22.82 为...的tag长度 6.4为url单个平均长度 +1 为url中...号长度
              showTags = [obj.tags[0], '...'];
              const disStr = Math.ceil((0 - diffLen + 22.82) / 6.4) + 1;
              // console.log('disStr==', disStr);
              const str1 = obj.url.substring(0, obj.url.length - 5 - disStr);
              const str2 = obj.url.substring(obj.url.length - 5, obj.url.length);
              showUrl = `${str1}...${str2}`;
            }
          } else if (diffLen === 0) {
            if (tagsLen > 1) {
              showTags = [obj.tags[0], '...'];
              const disStr = Math.ceil((0 - diffLen + 22.82) / 6.4) + 1;
              // console.log('disStr==', disStr);
              const str1 = obj.url.substring(0, obj.url.length - 5 - disStr);
              const str2 = obj.url.substring(obj.url.length - 5, obj.url.length);
              showUrl = `${str1}...${str2}`;
            }
          } else if (diffLen > 0) {
            //
            // console.log('当总长度 大于 1个url he 1个flag时', tagsLen);

            if (tagsLen > 1) {
              const tagLenArr = [];
              let showTagsLen = 0;
              let tmpLen = urlStrLen;
              obj.tags.forEach((tag) => {
                const curTagLen = tag.length * 12 + 15;
                tmpLen += curTagLen;
                const tmpDiffLen = progressWid - tmpLen;
                // console.log('tagidx,tagidx,', tagidx, tmpDiffLen, 'tmpLen', tmpLen, 'curTagLen', curTagLen);
                if (tmpDiffLen > 0) {
                  tagLenArr.push(tag);
                  showTagsLen += curTagLen;
                }
              });
              // console.log(175, tagLenArr, obj.tags, tagsLen);
              if (tagLenArr.length < tagsLen) {
                const diffLen2 = progressWid - (showTagsLen + urlStrLen) - 22.82;
                if (diffLen2 >= 0) {
                  showTags = [...tagLenArr, '...'];
                } else {
                  tagLenArr[tagLenArr.length - 1] = '...';
                  showTags = tagLenArr;
                }
              }
            }
          }

          return (
            <div key={obj.url}>
              <Popover
                content={
                  <div className={styles.itemPopover}>
                    <p>
                      <b>接口：</b>
                      <span>{obj.url}</span>
                    </p>
                    <p>
                      <b>泄露事件类型：</b>
                      {obj.tags &&
                        obj.tags.map((tag) => (
                          <span key={tag} className={styles.blueBorder}>
                            {tag}
                          </span>
                        ))}
                    </p>
                    <p>
                      <b>泄露事件数：</b>
                      <span>{`${numeral(obj.count).format('0,0')}`}</span>
                    </p>
                  </div>
                }
                // title="Title"
                trigger="hover"
                getPopupContainer={(triggerNode) => triggerNode}
              >
                <div className={styles.listItemDiv}>
                  <div className={styles.listItemNum}>{index + 1}</div>
                  <div className={styles.listItemCxt}>
                    <div className={styles.listItemTop}>
                      <span
                        className={styles.urlTxt}
                        onClick={() => {
                          spanClick(obj.url);
                        }}
                      >
                        {/* {obj.url} */}
                        {showUrl}
                      </span>
                      <Fragment>
                        {showTags &&
                          showTags.map((tag) => (
                            <span key={tag} className={styles.blueBorder}>
                              {tag}
                            </span>
                          ))}
                      </Fragment>
                    </div>
                    <div>
                      <Progress
                        strokeLinecap="square"
                        percent={obj.percent}
                        // type="line"
                        showInfo={false}
                        strokeColor="#5075FF"
                        strokeWidth={8}
                      />
                    </div>
                  </div>
                </div>
              </Popover>
            </div>
          );
        })}
        {/* {this.renderContent()} */}
      </Card>
    );
  }
}

export default ListCardList;
