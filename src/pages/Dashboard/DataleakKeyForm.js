import React, { Component } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import _ from 'lodash';
import { Modal, Input, message, Button, Spin } from 'antd';

/* eslint-disable camelcase */

const FormItem = Form.Item;
const { TextArea } = Input;
@connect(({ dataLeakage, loading }) => ({
  dataLeakage,
  loading1: loading.effects['dataLeakage/fetchDataleakKey'],
  loading2: loading.effects['dataLeakage/updateDataleakKey'],
}))
class DataleakKeyForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // isDisable: defaultIsDisable,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'dataLeakage/fetchDataleakKey' });
  }

  onOKSave = () => {
    const { form, onCancel, dispatch } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { value1 = '' } = values;
        const arr = value1.split(';');
        const resArr = [];
        arr.forEach((key) => {
          const tmpKey = key.replace(/(^\s*)|(\s*$)/g, '');
          if (tmpKey) {
            resArr.push(tmpKey);
          }
        });
        const reqObj = { type: 'usrSet', value1: JSON.stringify(resArr) };
        dispatch({ type: 'dataLeakage/updateDataleakKey', payload: reqObj })
          .then((json) => {
            const { reloadRes = {}, error_code = 0 } = json;
            if (error_code === 0 && reloadRes.error_code === 0) {
              message.success(`授权关键词设置成功，配置生效`);
              onCancel();
            } else if (error_code === 0 && reloadRes.error_code !== 0) {
              message.error(`重载失败，配置未生效`);
            } else {
              message.error(json.msg);
            }
          })
          .catch((error) => {
            message.error(error.msg);
          });
      }
    });
  };

  setIniVal = () => {
    const { onCancel, dispatch } = this.props;
    const reqObj = { type: 'iniSet', value1: JSON.stringify([]) };
    dispatch({ type: 'dataLeakage/updateDataleakKey', payload: reqObj })
      .then((json) => {
        const { reloadRes = {}, error_code = 0 } = json;
        if (error_code === 0 && reloadRes.error_code === 0) {
          message.success(`恢复默认设置成功，配置生效`);
          onCancel();
        } else if (error_code === 0 && reloadRes.error_code !== 0) {
          message.error(`重载失败，配置未生效`);
        } else {
          message.error(json.msg);
        }
      })
      .catch((error) => {
        console.log('error=', error);
        message.error('恢复默认设置失败');
      });
  };

  render() {
    const {
      loading1,
      loading2,
      visible,
      form,
      onCancel,
      dataLeakage: { dataleakKeys = [] },
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 17 },
        sm: { span: 17 },
      },
    };

    return (
      <Modal
        title="授权关键词配置"
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            取消
          </Button>,
          <Button key="ini" loading={loading2} onClick={this.setIniVal}>
            恢复默认
          </Button>,
          <Button key="submit" type="primary" loading={loading2} onClick={this.onOKSave}>
            确定
          </Button>,
        ]}
      >
        {loading1 ? (
          <Spin />
        ) : (
          <Form className="formStyle">
            <FormItem {...formItemLayout} label="授权关键词" extra="">
              {getFieldDecorator('value1', {
                initialValue: dataleakKeys.join(';') || '',
              })(
                // <TextArea rows={5} placeholder="允许输入多个，以“,”或者换行分隔" />
                <TextArea rows={5} placeholder="允许输入多个，以“;”分隔" />
              )}
            </FormItem>
            {/* <Row>
            <Col offset={5} span={17}>
              <Button>恢复默认配置</Button>
            </Col>
            <Col span={2} />
          </Row> */}
          </Form>
        )}
      </Modal>
    );
  }
}

export default Form.create()(DataleakKeyForm);
