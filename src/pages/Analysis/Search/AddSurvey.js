import React, { PureComponent, Fragment } from 'react';
import { connect } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, message, Input, Select, Table, Popover } from 'antd';
import moment from 'moment';
import CommonDetailHeader from '@/components/CommonDetailHeader';
import styles from './AddSurvey.less';

const format = 'YYYY-MM-DD HH:mm:ss';
const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;

@connect(({ addSurvey, loading }) => ({
  addSurvey,
}))
class AddSurvey extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false, // 防止二次点击
      logList: [],
    };
    this.operate = props.operate;
    this.columns = [
      {
        title: '时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 100,
        render: (text) => moment(text).format(format),
      },
      {
        title: '日志类型',
        dataIndex: 'index',
        key: 'index',
        width: 100,
        render: (text) => text.split('-')[1],
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        // render: text => (
        //   <span className="ellipsis limitWidthFst" title={text}>
        //     {text}
        //   </span>
        // ),
      },
      {
        title: '告警名称',
        dataIndex: 'alarm_name',
        key: 'alarm_name',
        width: 200,
        // render: text => (
        //   <span className="ellipsis limitWidthFst" title={text}>
        //     {text}
        //   </span>
        // ),
      },
      {
        title: '源IP',
        dataIndex: 'src_ip',
        key: 'src_ip',
        width: 120,
        render: (text) => this.showMultiValue(text),
      },
      {
        title: '目的IP',
        dataIndex: 'dst_ip',
        key: 'dst_ip',
        width: 120,
        render: (text, record) => this.showMultiValue(record.dest_ip || record.dst_ip),
      },
    ];
  }

  componentWillMount = () => {
    const { dispatch, list, type } = this.props;
    // const logList = list.map(item => ({ _id: item._id, _index: item._index, ...item._source }));
    console.log('list:::', list);
    if (type === 1) {
      // 事件
      this.columns = this.columns.filter((item, idx) => idx !== 1 && idx !== 3);
    } else if (type === 2) {
      // 告警
      this.columns = this.columns.filter((item, idx) => idx === 0 || idx === 3);
      this.columns = this.columns.concat([
        {
          title: '攻击者IP',
          dataIndex: 'attacker_ip',
          key: 'attacker_ip',
          width: 120,
          render: (text) => this.showMultiValue(text),
        },
        {
          title: '受害者IP',
          dataIndex: 'victim_ip',
          key: 'victim_ip',
          width: 120,
          render: (text) => this.showMultiValue(text),
        },
      ]);
    } else {
      this.columns.splice(2, 2);
    }
    dispatch({ type: 'addSurvey/getExistSurvey' });
    this.setState({ logList: list });
  };

  showMultiValue = (text) => {
    if (Array.isArray(text)) {
      if (text.length > 1) {
        const popContent = (
          <div className="popContentWrap">
            {text.map((key, idx) => (
              <p key={`${key}_${idx}`}>{key}</p>
            ))}
          </div>
        );
        return (
          <Popover content={popContent} placement="bottomLeft">
            <p>
              多个(<span className="fontBlue">{text.length}</span>)
            </p>
          </Popover>
        );
      }
      return text[0] || '';
    }
    return text || '';
  };

  nameValidator = (rule, value, callback) => {
    const { form, dispatch } = this.props;
    if (value) {
      dispatch({ type: 'addSurvey/checkSurveyName', payload: value }).then((exist) => {
        if (exist) {
          message.warn('该调查任务名称已存在,请重新输入');
          form.setFieldsValue({ Fsurvey_name: '' });
        }
      });
    }
    callback();
  };

  handleChange = (value, option) => {
    console.log('value::', value, 'option::', option);
  };

  //   (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
  filterOption = (input, option) =>
    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  editSave = () => {
    const { logList } = this.state;
    const {
      form: { validateFields },
      dispatch,
      type,
      back,
    } = this.props;
    const { isProcessing } = this.state;
    if (isProcessing) return;
    this.setState({ isProcessing: true });
    validateFields((err, values) => {
      if (!err) {
        const doclist = logList.map((log) => ({ doc_id: log.id, index_id: log.index }));
        let uri, body, messageStr;
        if (this.operate === 'add') {
          // 新建一个调查
          uri = 'survey/addSurveyWithList';
          messageStr = '新增调查任务';
        } else {
          // 添加到一个调查
          uri = 'survey/addrelation';
          messageStr = '添加到调查任务';
        }
        // console.log('doclist:::', doclist);
        // console.log('values:::', values);
        // 添加/保存
        dispatch({
          type: 'addSurvey/addOrUpdateSurvey',
          payload: { uri, body: { doclist, Ftype: type.toString(), ...values } },
        })
          .then(() => {
            message.success(`${messageStr}成功`);
            back && back();
            this.setState({ isProcessing: false });
          })
          .catch(() => {
            this.setState({ isProcessing: false });
          });
      }
    });
  };

  getContent = (scroll = {}) => {
    const {
      form,
      operate,
      addSurvey: { surveyExist },
    } = this.props;
    const { logList } = this.state;
    const { getFieldDecorator } = form;
    const defaultSurvey = surveyExist[0] ? surveyExist[0].Fsurvey_id : '';
    const formHeaderLayout = {
      labelCol: { xs: { span: 5 }, sm: { span: 3 } },
      wrapperCol: { xs: { span: 12 }, sm: { span: 10 } },
    };
    const formItemLayout = {
      labelCol: { xs: { span: 5 }, sm: { span: 3 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 20 } },
    };
    return (
      <div className={styles.surveyContent}>
        <Form>
          {operate === 'add' ? (
            <Fragment>
              <FormItem {...formHeaderLayout} label="任务名称">
                {getFieldDecorator('Fsurvey_name', {
                  initialValue: '',
                  validateTrigger: 'onBlur',
                  rules: [
                    { required: true, message: '请填写调查任务名称' },
                    { validator: this.nameValidator },
                  ],
                })(<Input maxLength={32} placeholder="请输入任务名称" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="任务说明">
                {getFieldDecorator('Fdesc', { initialValue: '' })(
                  <TextArea rows="6" maxLength={1024} placeholder="请输入任务说明" />
                )}
              </FormItem>
            </Fragment>
          ) : (
            <FormItem {...formHeaderLayout} label="任务名称">
              {getFieldDecorator('Fsurvey_id', {
                initialValue: defaultSurvey,
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={this.handleChange}
                  filterOption={this.filterOption}
                >
                  {surveyExist.map((item) => (
                    <Option key={item.Fsurvey_id} value={item.Fsurvey_id}>
                      {item.Fsurvey_name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          )}
          <FormItem {...formItemLayout} label="相关日志">
            <Table
              size="small"
              rowKey="_id"
              columns={this.columns}
              dataSource={logList}
              scroll={scroll}
            />
          </FormItem>
        </Form>
      </div>
    );
  };

  render() {
    const { logList } = this.state;
    const {
      isPage, // 判断是页面还是弹窗形式
      visible,
      back,
    } = this.props;

    return (
      <div className={styles.addSurveyWrap}>
        {isPage ? (
          <div>
            <CommonDetailHeader
              title={this.operate === 'add' ? '新增调查' : '添加到调查任务'}
              url="#"
              onClick={() => {
                back();
                return false;
              }}
            />
            <div className={styles.pageContentWrap}>{this.getContent()}</div>
            <div className={styles.operateBtn}>
              {/* <a key="preview" className="smallWhiteBtn" style={{ marginRight: '10px' }} onClick={back}>
                                取消
                            </a> */}
              <a key="submit" className="smallBlueBtn" onClick={this.editSave}>
                保存
              </a>
            </div>
          </div>
        ) : (
          <Modal
            title={this.operate === 'add' ? '新增调查' : '添加到调查任务'}
            visible={visible}
            onCancel={back}
            width={900}
            bodyStyle={{ padding: '20px 30px' }}
            footer={[
              <a
                key="preview"
                className="smallWhiteBtn"
                style={{ marginRight: '10px' }}
                onClick={back}
              >
                取消
              </a>,
              <a key="submit" className="smallBlueBtn" onClick={this.editSave}>
                确定
              </a>,
            ]}
            destroyOnClose
          >
            <div>{this.getContent({ y: 300 })}</div>
          </Modal>
        )}
      </div>
    );
  }
}

const WrappedAddSurvey = Form.create()(AddSurvey);
export default WrappedAddSurvey;
