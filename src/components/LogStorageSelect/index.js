/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { Checkbox, Divider, message, Button } from 'antd';
import _ from 'lodash';
import { connect } from 'umi';
import styles from './index.less';

@connect(({ loading }) => ({
  updateLoading: loading.effects['search/updateDenyAllFromDB'],
  fetchLoading: loading.effects['search/fetchDenyAll'],
}))
class LogStorageSelect extends PureComponent {
  constructor(props) {
    super(props);
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
    const { indexSelect, sortOptions } = this.props;
    this.allIndexList = [];

    Object.keys(sortOptions).forEach((key) => {
      this.allIndexList = this.allIndexList.concat(sortOptions[key]);
    });
    const indexType = Object.keys(sortOptions);
    this.setState({
      selectList: indexSelect,
      selectName: indexSelect.join(','),
      checkAll: indexSelect.length === this.allIndexList.length,
      indexType,
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { indexSelect } = nextProps;
    if (!_.isEqual(indexSelect, this.props.indexSelect)) {
      this.setState({
        selectList: _.cloneDeep(indexSelect),
        selectName: indexSelect.join(','),
        checkAll: indexSelect.length === this.allIndexList.length,
      });
    }
  };

  onCheckAllChange = (e) => {
    if (e.target.checked) {
      const selectList = [...this.allIndexList];
      this.setState({ selectList, checkAll: true, selectName: selectList.join(',') });
    } else {
      this.setState({ selectList: [], checkAll: false, selectName: '选择日志类型' });
    }
  };

  onChildCheckAllChange = (key, e) => {
    // console.log('key ', key, 'e ', e);
    const { selectList } = this.state;
    const { sortOptions } = this.props;
    let list = [...selectList];
    if (e.target.checked) {
      list.push(...sortOptions[key]);
      list = _.uniq(list);
    } else {
      _.pullAll(list, sortOptions[key]);
    }

    this.setState({
      selectList: list,
      checkAll: list.length === this.allIndexList.length,
      selectName: list.length === 0 ? '选择日志类型' : list.join(','),
    });
  };

  onChange = (e) => {
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
    if (!focus) {
      this.setState({ checkAll: selectList.length === this.allIndexList.length, focus: true });
    }
  };

  handleOK = () => {
    const { selectList } = this.state;

    const { selectChange } = this.props;
    selectChange(selectList);
  };

  handleCancle = () => {
    const { consoleWindows, indexSelect } = this.props;
    consoleWindows();
    // 还原数据
    this.setState({
      selectList: _.cloneDeep(indexSelect),
      selectName: indexSelect.join(','),
      checkAll: indexSelect.length === this.allIndexList.length,
    });
  };

  render() {
    const { checkAll, selectList, indexType } = this.state;
    const { sortOptions, focus, updateLoading, fetchLoading } = this.props;
    return (
      <div className={styles.selectWrapper}>
        {focus && (
          <div className={styles.selectContent}>
            <ul className={styles.selectList}>
              {indexType.map((key, idx) => (
                <li key={key}>
                  <span className={styles.selectItemHeader}>{key}</span>
                  <span className={styles.selectItemCkAll}>
                    <Checkbox
                      checked={
                        !sortOptions[key].some((selectKey) => selectList.indexOf(selectKey) < 0)
                      }
                      // eslint-disable-next-line react/jsx-no-bind
                      onChange={this.onChildCheckAllChange.bind(this, key)}
                    >
                      全选
                    </Checkbox>
                  </span>
                  <Divider type="vertical" className={styles.verticalDivider} />
                  <ul
                    className={styles.selectChildList}
                    style={idx === indexType.length - 1 ? { border: 'none' } : {}}
                  >
                    {sortOptions[key].map((childKey) => (
                      <li className={styles.selectItemChild} key={childKey}>
                        <Checkbox
                          value={childKey}
                          onChange={this.onChange}
                          checked={selectList.indexOf(childKey) > -1}
                        >
                          {childKey}
                        </Checkbox>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <div className={styles.checkAllBox}>
              <Checkbox checked={checkAll} onChange={this.onCheckAllChange}>
                全选
              </Checkbox>

              <div>
                <Button style={{ marginRight: '20px' }} onClick={this.handleCancle}>
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={this.handleOK}
                  loading={updateLoading || fetchLoading}
                >
                  禁用
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default LogStorageSelect;
