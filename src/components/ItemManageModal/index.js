import React, { Component } from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Modal, Input, Checkbox, Row, Col } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import DragableTable from '../DragableTable';
import styles from './index.less';

/* eslint-disable camelcase */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */

const { Search } = Input;
const CheckboxGroup = Checkbox.Group;
class ItemManageModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      /** 右侧已选中的值 */
      pickedList: props.pickedList,
      /** 左侧复选框默认值 */
      checkedList: props.pickedList.map(item => item.key),
      /** 左侧复选框原始数据 */
      selectList: props.allList.map(item => ({
        label: `${item.title}(${item.key})`,
        value: `${item.key}`,
      })),
      /** 搜索框输入后删选的值 */
      showSelectList: props.allList
        .filter(item => item.key !== 'action')
        .map(item => ({
          label: `${item.title}(${item.key})`,
          value: `${item.key}`,
        })),
    };
    this.colums = [
      {
        key: 'action',
        dataIndex: 'action',
        render: (text, record) => (
          <CloseCircleOutlined
            onClick={() => {
              this.cancelCheck(record.key);
            }} />
        ),
      },
      {
        key: 'title',
        dataIndex: 'title',
      },
    ];
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.visible !== this.props.visible) {
      this.setState({
        keyword: '',
        showSelectList: this.props.allList
          .filter(item => item.key !== 'action')
          .map(item => ({
            label: `${item.title}(${item.key})`,
            value: `${item.key}`,
          })), // 搜索框输入后删选的值
      });
    }
    if (prevProps.pickedList !== this.props.pickedList) {
      this.setState({
        pickedList: this.props.pickedList,
        checkedList: this.props.pickedList.map(item => item.key),
      });
    }
  }

  cancelCheck = key => {
    const { pickedList } = this.state;
    const newList = pickedList.filter(item => item.key !== key);
    this.setState({ pickedList: newList });
  };

  searchOnchange = value => {
    const { selectList } = this.state;
    // const regx = new RegExp(value);
    // const list = selectList.filter(item => regx.test(item.label));

    const list = selectList.filter(item => item.label.indexOf(value) > -1);
    this.setState({ showSelectList: list, keyword: value });
  };

  onDrag = list => {
    // console.log('onDrag', list);
    // const pickedList = list.map(item=>item.key);
    this.setState({ pickedList: list });
    // this.selectedListWithOrder = list;
  };

  cancelCheck = key => {
    const { pickedList } = this.state;
    const newList = pickedList.filter(item => item.key !== key);
    const newCheckedList = newList.map(item => item.key);
    this.setState({ pickedList: newList, checkedList: newCheckedList });
  };

  /**
   * 可选类目操作得时候
   * @param {*} checkedValues  可选类目勾选得值["Fip", "Fmac", "Fvpcid",....]
   */
  checkboxOnChange = checkedValues => {
    const { allList } = this.props;
    const { pickedList, showSelectList, selectList } = this.state;
    const pickedListKey = pickedList.map(item => item.key);
    const list = allList.filter(item => checkedValues.includes(item.key));

    let intersection;
    // 独立新加得代码*******start
    // 代表是搜索后进行的点选
    if (showSelectList.length !== selectList.length) {
      const 没有勾选的 = showSelectList.filter(item => !checkedValues.includes(item.value));
      const 当前勾选的 = showSelectList.filter(item => checkedValues.includes(item.value));
      // 过滤掉没有勾选的
      intersection = pickedList.filter(item_a => {
        const index = 没有勾选的.findIndex(item_b => { return item_b.value === item_a.key })
        return index === -1
      })
      // push当前勾选的列元素
      const 当前勾选的列元素 = allList.filter(item_a => {
        const index = 当前勾选的.findIndex(item_b => { return item_b.value === item_a.key })
        return index !== -1
      })
      for (let i = 0; i < 当前勾选的列元素.length; i++) {
        const element = 当前勾选的列元素[i];
        const index = intersection.findIndex(item => { return element.key === item.key })
        if(index===-1){
          intersection.push(element)
        }
      }
    }
    // 独立新加得代码*******end


    // 如果右侧已选中的值列表长度 大于 可选类目勾选得值列表得长度???????这是什么判断 
    else if (pickedList.length > checkedValues.length) {
      intersection = pickedList.filter(item => checkedValues.includes(item.key));
    } else {
      const tmp = list.filter(item => !pickedListKey.includes(item.key));
      intersection = pickedList.concat(tmp);
    }
    const newCheckedList = intersection.map(item => item.key);
    this.setState({
      pickedList: intersection,
      checkedList: newCheckedList,
    });
  };

  handleOk = () => {
    const { pickedList } = this.state;
    const { fieldManage, type } = this.props;
    // console.log('pickedList', pickedList);
    fieldManage(pickedList, type);
  };

  handleCancel = () => {
    const { onCancel, type } = this.props;
    onCancel(type);
    this.setState({
      checkedList: this.props.pickedList.map(item => item.key),
      pickedList: this.props.pickedList
    })
  };

  render() {
    const { title, visible } = this.props;
    const { pickedList, showSelectList, checkedList, keyword } = this.state;
    return (
      <Modal
        title={title}
        width={800}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Row className={styles.content}>
          <Col span={12} className={styles.allList}>
            <p>可选类目</p>
            <Search
              placeholder="搜索字段名"
              value={keyword}
              onChange={e => {
                this.searchOnchange(e.target.value);
              }}
              style={{ width: "100%", marginTop: 10 }}
            />
            <CheckboxGroup
              options={showSelectList}
              value={checkedList}
              onChange={this.checkboxOnChange}
            />
          </Col>
          <Col span={12} className={styles.pickedList}>
            <p>已选择的类目</p>
            <DragableTable
              dataSource={pickedList}
              onDrag={this.onDrag}
              cancelCheck={this.cancelCheck}
            />
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ItemManageModal;
