import React, { PureComponent } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Checkbox, Tooltip, Divider, message } from 'antd';
import _ from 'lodash';
import styles from './index.less';
/* eslint-disable react/destructuring-assignment */
/* eslint-disable */
class MultiSortSelect extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      focus: false,
      checkAll: true,
      selectList: [], //选中的日志列表
      selectName: '选择日志类型',// 选中的日志列表字符串形式
      indexType: [],//日志的分类
    };
    this.allIndexList = [];
  }

  componentDidMount = () => {
    const { indexSelect, allIndex, sortOptions } = this.props;
    this.allIndexList = allIndex;
    const indexType = ['安全事件日志', '原始告警日志', "流量日志", '行为日志'].filter(index => sortOptions[index] && sortOptions[index].length > 0);
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
      const indexType = ['安全事件日志', '原始告警日志', "流量日志", '行为日志'].filter(index => sortOptions[index] && sortOptions[index].length > 0);
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
    const { selectList, focus } = this.state;
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

    var showSelectname = selectName
    showSelectname = showSelectname.replace(/\balert\b/g, '规则告警');
    showSelectname = showSelectname.replace(/\bioc_alert\b/g, '威胁情报告警');
    showSelectname = showSelectname.replace(/\bapt_black\b/g, '沙箱告警');
    showSelectname = showSelectname.replace(/\bdataleak\b/g, '数据泄露告警');
    showSelectname = showSelectname.replace(/\binfo\b/g, '信息');
    showSelectname = showSelectname.replace(/\blogin\b/g, '登录行为');
    showSelectname = showSelectname.replace(/\bfileinfo\b/g, '文件传输行为');
    showSelectname = showSelectname.replace(/\bai_alert\b/g, '高级分析事件');

    return (
      <div className={styles.selectWrapper}>
        <div className={styles.selectHeader} onClick={this.onClick} onBlur={this.onBlur}>
          {/* key === 'flow' ? 'tcp/udp' : */}
          <Tooltip
            placement="rightTop"
            title={selectList.map(key => (
              <div key={key}>{
                key === 'alert' ? '规则告警' :
                  key === 'ioc_alert' ? '威胁情报告警' :
                    key === 'apt_black' ? '沙箱告警' :
                      key === 'dataleak' ? '数据泄露告警' :
                        key === 'info' ? '信息' :
                          key === 'login' ? '登录行为' :
                            key === 'fileinfo' ? '文件传输行为' :
                              key === 'ai_alert' ? '高级分析事件' : key
              }</div>
            ))}
          >
            <span>{showSelectname}</span>
          </Tooltip>
          {focus ? (
            <UpOutlined className={styles.downIcon} />
          ) : (
              <DownOutlined className={styles.downIcon} />
            )}
        </div>
        {focus && (
          <div className={styles.selectContent}>
            <ul className={styles.selectList}>
              {indexType.map((key, idx) => (
                <li key={key}>
                  <span className={styles.selectItemHeader}>{key}</span>
                  <span className={styles.selectItemCkAll}>
                    <Checkbox
                      checked={!sortOptions[key].some(selectKey => selectList.indexOf(selectKey) < 0)}
                      onChange={this.onChildCheckAllChange.bind(this, key)}
                    >
                      全选
                    </Checkbox>
                  </span>
                  <Divider type="vertical" className={styles.verticalDivider} />
                  <ul className={styles.selectChildList} style={idx === indexType.length - 1 ? { border: 'none' } : {}}>
                    {sortOptions[key].map(childKey => (
                      <li className={styles.selectItemChild} key={childKey}>
                        <Checkbox value={childKey} onChange={this.onChange} checked={selectList.indexOf(childKey) > -1}>
                          {
                            childKey === 'alert' ? '规则告警' :
                              childKey === 'ioc_alert' ? '威胁情报告警' :
                                childKey === 'apt_black' ? '沙箱告警' :
                                  childKey === 'dataleak' ? '数据泄露告警' :
                                    childKey === 'info' ? '信息' :
                                      childKey === 'login' ? '登录行为' :
                                        childKey === 'fileinfo' ? '文件传输行为' :
                                          childKey === 'ai_alert' ? '高级分析事件' : childKey
                          }
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
            </div>
          </div>
        )}
        {focus && <div className={styles.maskLayer} onClick={this.handleOK} />}
      </div>
    );
  }
}

export default MultiSortSelect;
