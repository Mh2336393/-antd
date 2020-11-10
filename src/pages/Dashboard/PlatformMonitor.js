import React, { Component } from 'react';
import { connect } from 'umi';
// import _ from 'lodash';
import { Spin } from 'antd';
import ListCard from '@/components/ListCard';
import styles from './platformMonitor.less';
import LogModal from '@/components/Modal';

@connect(({ platform, loading, global }) => ({
  platform,
  global,
  // loading1: loading.effects['platform/fetchHardwareList'],
  loading2: loading.effects['platform/fetchPlatRun'],
  loading3: loading.effects['platform/fetchSandboxList'],
  loading4: loading.effects['platform/fetchIpsInfo'],
}))
class PlatformMonitor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: [],
    };
  }

  componentDidMount = () => {
    const {
      dispatch,
      global: { isKVM },
    } = this.props;
    dispatch({
      type: 'platform/fetchIpsInfo',
    });
    dispatch({ type: 'platform/fetchPlatRun' });
    if (!isKVM) {
      dispatch({
        type: 'platform/fetchSandboxList',
      });
    }
  };

  setModalVisable = (value, dataArr) => {
    this.setState({
      visible: value,
      data: dataArr,
    });
  };

  render() {
    const {
      platform: { platRunList, sandboxList, ipsInfo },
      global: { show_win10_vm: showVmWin10, isKVM },
      // loading,
      // loading1,
      loading2,
      loading3,
      loading4,
    } = this.props;
    const { visible, data } = this.state;
    return (
      <div>
        <div className={styles.wrapper}>
          <p>平台运行监控 </p>
          {loading2 || loading4 ? (
            <div>
              <Spin />
            </div>
          ) : (
            <ListCard
              ipsInfo={ipsInfo}
              listData={platRunList.list}
              listType={platRunList.type}
              setModalVisable={this.setModalVisable}
            />
          )}
        </div>
        {!isKVM && (
          <div className={styles.wrapper}>
            <p>沙箱监控</p>
            {loading3 ? (
              <div>
                <Spin />
              </div>
            ) : (
              <ListCard
                ipsInfo={ipsInfo}
                listData={sandboxList.list}
                showVmWin10={showVmWin10}
                listType={sandboxList.type}
              />
            )}
          </div>
        )}
        <LogModal
          visible={visible}
          data={data}
          title="日志诊断"
          setModalVisable={this.setModalVisable}
        />
      </div>
    );
  }
}
export default PlatformMonitor;
