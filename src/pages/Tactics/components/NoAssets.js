import React, { Component, } from 'react';
import { Button } from 'antd';
import styles from './NoAssets.less';

class NoAssets extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    };

    handelClick = () => {
        const { handleImmediatelyAddClick } = this.props
        handleImmediatelyAddClick();
    };

    render() {
        return (
          <div className={styles.noAssets}>
            <span className={styles.circle} />
            <p className={styles.des}>暂未添加高级分析的资产</p>
            <Button type="primary" onClick={this.handelClick}>立即添加</Button>
          </div>
        );
    }
}

export default NoAssets
