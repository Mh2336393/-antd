import React, { PureComponent } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Checkbox, Tooltip, message } from 'antd';
import _ from 'lodash';
import styles from './index.less';
/* eslint-disable react/destructuring-assignment */
class MultiIndexSelect extends PureComponent {
    constructor(props) {
        super(props);
        console.log('props', props);
        this.state = {
            focus: false,
            checkAll: true,
            selectList: [],
            selectName: '选择日志类型',
            indexType: [],
        };
        this.allIndexList = [];
    }

    componentDidMount = () => {
        const { indexSelect, allIndex, sortOptions } = this.props;
        this.allIndexList = allIndex;
        const indexType = ['告警', '事件', '全流量日志'].filter(index => sortOptions[index] && sortOptions[index].length > 0);
        this.setState({
            selectList: indexSelect,
            selectName: indexSelect.join(','),
            checkAll: indexSelect.length === this.allIndexList.length,
            indexType,
        });
    };

    componentWillReceiveProps = nextProps => {
        const { indexSelect, allIndex, sortOptions } = nextProps;
        if (this.props.allIndex !== allIndex) {
            this.allIndexList = allIndex;
            const indexType = ['告警', '事件', '全流量日志'].filter(index => sortOptions[index] && sortOptions[index].length > 0);
            this.setState({ indexType });
        }
        if (!_.isEqual(indexSelect, this.props.indexSelect)) {
            this.setState({
                selectList: _.cloneDeep(indexSelect),
                selectName: indexSelect.join(','),
                checkAll: indexSelect.length === this.allIndexList.length,
            });
        }
    };

    onCheckAllChange = e => {
        if (e.target.checked) {
            const selectList = [...this.allIndexList];
            this.setState({ selectList, checkAll: true, selectName: selectList.join(',') });
        } else {
            this.setState({ selectList: [], checkAll: false, selectName: '选择日志类型' });
        }
    };

    onChange = e => {
        const { selectList } = this.state;
        const index = selectList.indexOf(e.target.value);
        if (index > -1) {
            selectList.splice(index, 1);
        } else {
            selectList.push(e.target.value);
        }
        const { length } = selectList;
        this.setState({
            selectList,
            checkAll: length === this.allIndexList.length,
            selectName: length > 0 ? selectList.join(',') : '选择日志类型',
        });
    };

    onClick = () => {
        const { focus, selectList } = this.state;
        const { allIndex } = this.props;
        if (allIndex.length === 0) {
            return;
        }
        if (!focus) {
            this.setState({ checkAll: selectList.length === this.allIndexList.length, focus: true });
        }
    };

    handleOK = () => {
        const {selectList, focus } = this.state;
        if (focus) {
            if (selectList.length === 0) {
                message.warning('请选择查询的日志类型');
            } else {
                const { selectChange } = this.props;
                selectChange(selectList);
                this.setState({ focus: false });
            }
        }
    };

    render() {
        const { focus, checkAll, selectList, selectName, indexType } = this.state;
        const { sortOptions } = this.props;
        // console.log('索引选择渲染了~~~~~~~~~~~~~~');

        return (
            <div className={styles.selectWrapper}>
              <Tooltip
                placement="rightBottom"
                title={selectList.map(key => (
                  <div key={key}>{key}</div>
                      ))}
              >
                <div className={styles.selectHeader} onClick={this.onClick} onBlur={this.onBlur}>
                  <span>{selectName}</span>
                  {focus ? (
                    <UpOutlined className={styles.downIcon} />
                          ) : (
                            <DownOutlined className={styles.downIcon} />
                          )}
                </div>
              </Tooltip>
              {focus && (
              <div className={styles.selectContent}>
                <ul className={styles.selectList}>
                  <li style={{ color: '#1890ff', textAlign: 'left', padding: '8px 8px 0 20px' }}>
                    <Checkbox checked={checkAll} onChange={this.onCheckAllChange}>
                                      全选
                    </Checkbox>
                  </li>
                  {indexType.map(key => (
                    <li key={key}>
                      <div className={styles.selectItemHeader}>{key}</div>
                      <ul>
                        {sortOptions[key].map(childKey => (
                          <li className={styles.selectItemChild} key={childKey}>
                            <Tooltip placement="right" title={childKey}>
                              <Checkbox
                                value={childKey}
                                onChange={this.onChange}
                                checked={selectList.indexOf(childKey) > -1}
                              >
                                {childKey}
                              </Checkbox>
                            </Tooltip>
                          </li>
                                          ))}
                      </ul>
                    </li>
                              ))}
                </ul>
              </div>
                  )}
              {focus && <div className={styles.maskLayer} onClick={this.handleOK} />}
            </div>
        );
    }
}

export default MultiIndexSelect;
