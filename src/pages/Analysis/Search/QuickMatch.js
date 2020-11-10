import React from 'react';
import styles from './index.less';

//  搜索记录与字段快速匹配
class QuickMatch extends React.PureComponent {
    state = {
        tooltipShow: false,
    };

    render() {
        const { tooltipShow } = this.state;
        const { fieldsMatch, searchLogMatch, matchContentSelect } = this.props;
        const fm = fieldsMatch.length > 0;
        const sl = searchLogMatch.length > 0;
        return (
          <div className={`${styles['search-list']} ${styles.quickMatchWraper}`} style={{ display: `${fm || sl ? 'block' : 'none'}` }}>
            <div className={styles.quickMatchContent}>
              {fm && (
                <div>
                  <p className={styles.matchHeader} style={{ marginTop: '-10px' }}>
                                匹配字段
                  </p>
                  <ul className={styles.matchList}>
                    {fieldsMatch.map(key => (
                      <li
                        className={styles.matchItem}
                        key={key}
                        onClick={() => {
                                            matchContentSelect(key);
                                        }}
                      >
                        {key}
                      </li>
                                ))}
                  </ul>
                </div>
                    )}
              {sl && (
                <div>
                  <p className={styles.matchHeader}>匹配搜索</p>
                  <ul className={styles.matchList}>
                    {searchLogMatch.map((log, idx) => (
                      <li
                        className={styles.matchItem}
                        key={idx}
                        onClick={() => {
                                            matchContentSelect(log);
                                        }}
                      >
                        {log}
                      </li>
                                ))}
                  </ul>
                </div>
                    )}
            </div>
            {tooltipShow ? (
              <div className={styles.tooltipWrap}>
                <p className={styles.tpHeader}>搜索实例</p>
                <div className={styles.tpContent}>
                            1.&nbsp;<span>查看源IP为10.0.1.118的日志 src_ip:10.0.1.118</span>
                </div>
                <div className={styles.tpContent}>
                            2.&nbsp;<span>查看UDP的flow日志 event_type:flow AND proto:UDP</span>
                </div>
                <div className={styles.tpContent}>
                            3.&nbsp;
                  <span>查看协议为UDP，且源不为10.0.1.118的Flow日志 event_type:flow AND proto:UDP AND NOT src_ip:10.0.1.118</span>
                </div>
                <a
                  className={styles.tlToggle}
                  onClick={() => {
                                this.setState({ tooltipShow: false });
                            }}
                >
                            关闭提示
                </a>
              </div>
                ) : (
                  <a
                    className={styles.tlToggle}
                    onClick={() => {
                                this.setState({ tooltipShow: true });
                            }}
                  >
                            打开提示
                  </a>
                    )}
          </div>
        );
    }
}
export default QuickMatch;
