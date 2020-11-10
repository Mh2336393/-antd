/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */

import React, { PureComponent } from 'react';
import { Input, Checkbox, Row, Col } from 'antd';
import DragableTable from '../DragableTable';
import styles from './ItemTransfer.less';

const { Search } = Input;
const CheckboxGroup = Checkbox.Group;
class ItemTransfer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      pickedList: props.pickedList, // 右侧已选中的值
      checkedList: props.pickedList.map(item => item.key), // 左侧复选框默认值
      selectList: props.allList, // 左侧复选框所有可选数据
      showSelectList: [].concat(props.allList), // 搜索框输入后筛选的值
      selectNum: props.pickedList.length,
    };
  }

  componentWillReceiveProps = nextProps => {
    const { allList } = nextProps;
    if (allList !== this.props.allList) {
      this.setState({ selectList: allList, showSelectList: [].concat(allList) });
    }
  };

  searchOnchange = value => {
    const { selectList } = this.state;
    const regx = new RegExp(value);
    const list = selectList.filter(item => regx.test(item.label));
    this.setState({ showSelectList: list, keyword: value });
  };

  onDrag = list => {
    // console.log('onDrag::::', list);
    // const pickedList = list.map(item=>item.key);
    this.setState({ pickedList: list });
    // this.selectedListWithOrder = list;
  };

  cancelCheck = key => {
    const { pickedList } = this.state;
    const { pickChange } = this.props;
    const newList = pickedList.filter(item => item.key !== key);
    const newCheckedList = newList.map(item => item.key);
    this.setState({ pickedList: newList, checkedList: newCheckedList });
    pickChange && pickChange(newList);
  };

  checkboxOnChange = checkedValues => {
    console.log('checkedValues:::', checkedValues);
    const { selectValidator, pickChange } = this.props;
    const { pickedList, selectList } = this.state;
    const pickedListKey = pickedList.map(item => item.key);
    let intersection;
    if (pickedList.length > checkedValues.length) {
      intersection = pickedList.filter(item => checkedValues.includes(item.key));
    } else {
      const newKey = checkedValues.filter(key => !pickedListKey.includes(key))[0];
      if (selectValidator && !selectValidator(newKey)) {
        const newCheckedList = checkedValues.filter(key => key !== newKey);
        this.setState({ checkedList: newCheckedList });
        return;
      }
      const newKeyItem = selectList.filter(item => item.value === newKey);
      intersection = pickedList.concat([Object.assign(newKeyItem[0], { title: newKeyItem[0].label, key: newKey })]);
    }
    this.setState({ pickedList: intersection, checkedList: checkedValues, selectNum: intersection.length });
    pickChange && pickChange(intersection);
  };

  getHoverContent = record => {
    return (
      <div>
        <Row gutter={6}>
          <Col span={5} className={styles.infoLabel}>
            邮箱：
          </Col>
          <Col span={18} className={styles.infoVal} title={record.mail}>
            {record.mail}
          </Col>
        </Row>
        <Row gutter={6}>
          <Col span={5} className={styles.infoLabel}>
            手机：
          </Col>
          <Col span={18} className={styles.infoVal} title={record.phone}>
            {record.phone}
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    const { title, sPlaceholder = '搜索通知责任人名称', selectLabel = '个责任人', hasNumTp = true, bodyStyle = {} } = this.props;
    const { pickedList, showSelectList, checkedList, keyword, selectNum } = this.state;
    // console.log('pickedList::', pickedList);
    return (
      <div className={styles.contentWrap} style={{ ...bodyStyle }}>
        <Row className={styles.content}>
          <Col span={12} className={styles.allList}>
            <p style={{ lineHeight: '30px' }}>{title}</p>
            <Search
              placeholder={sPlaceholder}
              value={keyword}
              onChange={e => {
                this.searchOnchange(e.target.value);
              }}
              style={{ width: 250 }}
            />
            <CheckboxGroup options={showSelectList} value={checkedList} onChange={this.checkboxOnChange} />
          </Col>
          <Col span={12} className={styles.pickedList}>
            <p>
              已选择 <span className={styles.selectNum}>{hasNumTp ? selectNum : ''} </span>
              {selectLabel}
            </p>
            <DragableTable
              dataSource={pickedList}
              onDrag={this.onDrag}
              cancelCheck={this.cancelCheck}
              getHoverContent={this.getHoverContent}
              overlayStyle={{ width: '276px' }}
              hasHover
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default ItemTransfer;
