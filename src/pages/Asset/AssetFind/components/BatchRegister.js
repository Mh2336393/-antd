import React, { Component } from 'react';
import { history } from 'umi';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Row, Col, Button, message, Select } from 'antd';
import styles from './BatchRegister.less';

const { Option } = Select;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 8 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 16 },
    sm: { span: 18 },
  },
};

@connect(({ assetFind, assetList }) => ({
  assetFind,
  assetList,
}))
class BatchRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
    };
  }

  componentWillMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'assetList/getAssetConfig',
    }).then(() => {
      const {
        assetList: { configInfo },
      } = this.props;
      if (configInfo.assetGroup) {
        this.setState({
          groups: configInfo.assetGroup,
        });
      }
    });
  };

  onCancel = () => {
    if (this.props.cancel) {
      this.props.cancel();
    }
  };

  submit = () => {
    const { form, dispatch, selectedRowKeys, isAllCheck, unCheckedIds, query } = this.props;
    const { keyword, filterObj, dirObj, mustObj, startTime, endTime, timeType } = query;
    console.log('selectedRowKeys', selectedRowKeys);
    console.log('isAllCheck', isAllCheck);
    console.log('unCheckedIds', unCheckedIds);
    if (!isAllCheck && selectedRowKeys.length === 0) {
      message.error('未选择事件');
      return;
    }
    const selectGroup = form.getFieldValue('Fgroup');
    let data;
    if (isAllCheck) {
      // 选中全部
      if (unCheckedIds.length > 0) {
        // 全选有去掉了
        data = {
          isAll: false,
          keyword,
          filterObj,
          mustObj,
          unCheckedIds,
          startTime,
          endTime,
          timeType,
          Fgroup: selectGroup,
        };
      } else {
        data = {
          isAll: isAllCheck,
          keyword,
          filterObj,
          mustObj,
          startTime,
          endTime,
          timeType,
          Fgroup: selectGroup,
        };
      }
    } else {
      // 没有选中全部以selectedRowKeys为主
      data = { isAll: isAllCheck, Fids: selectedRowKeys, Fgroup: selectGroup };
    }
    console.log('data', data);
    dispatch({
      type: 'assetFind/batchRegister',
      payload: {
        ...data,
      },
    })
      .then(() => {
        message.success('所选资产已注册成功，可点击资产列表编辑补充信息');
        this.props.success();
        history.push('/asset/assetList');
      })
      .catch((error) => {
        message.error(`${error.returnMessage}`);
      });
  };

  render() {
    const { visible, form } = this.props;
    const { groups } = this.state;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        bodyStyle={{ padding: 0 }}
        visible={visible}
        title="批量注册"
        onCancel={this.onCancel}
        onOk={this.submit}
      >
        <div className={styles.bodyWrapper}>
          <div className={styles.tips}>
            批量注册资产后，资产相关信息均为空，如需调整，需您在注册后逐一更改，是否继续进行批量注册？
          </div>
          <div className={styles.actionCon}>
            <FormItem {...formItemLayout} label="资产分组">
              {getFieldDecorator('Fgroup', {
                initialValue: 0,
                rules: [{ required: true, message: '必填' }],
              })(
                <Select style={{ width: '80%' }}>
                  {groups.map((group) => (
                    <Option key={group.Fgid} value={group.Fgid}>
                      {group.Fgroup_name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </div>
        </div>
      </Modal>
    );
  }
}

const BatchRegisterForm = Form.create()(BatchRegister);
export default BatchRegisterForm;
