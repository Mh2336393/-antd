/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import { connect } from 'umi';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import _ from 'lodash';
import { Input, Row, Col, Select, Spin, Button, message, Modal } from 'antd';
import moment from 'moment';

import cloneDeep from 'lodash/cloneDeep';
import styles from './form.less';
import configSettings from '../../configSettings';
import authority from '@/utils/authority';
const { getAuth } = authority;
import RuleEditForm from './RuleEditForm';

/* eslint-disable camelcase */
/* eslint-disable prefer-const */

const FormItem = Form.Item;
const { Option } = Select;
const tiTags = configSettings.alertRuleCategory;

@connect(({ tacticsInvasion, global, loading }) => ({
  tacticsInvasion,
  hasVpc: global.hasVpc,
  loading: loading.effects['tacticsInvasion/fetchEditInfo'],
  ruleLoading: loading.effects['tacticsInvasion/validateRule'],
}))
/**
 * 用户自定义的规则详情
 */
class AlertManageFormPageDrawer extends Component {
  constructor(props) {
    super(props);
    this.rwAuth = getAuth('/tactics/invasion');
    this.state = {
      modalTitle: '新建',
      isDisable: true, // 默认为true 选择全局策略
      isProcessing: false,
      categoryVal: tiTags[0].value,
      ruleIds: [],
      ruleArr: [
        // {
        //   name: '',
        //   id: '',
        //   rule: '',
        // },
      ],
      ruleFromVisible: false,
      ruleItem: {},
      ruleTitle: '新建规则',
      // ruleCreateMode: 'guide',
      eid: 0, // 保存当前事件id
    };
  }

  componentWillMount() {
    const { dispatch, drawerObj } = this.props;
    // console.log(52, 'drawerObj=', drawerObj);
    let eid;
    let author;
    if (drawerObj.eid && drawerObj.author) {
      eid = Number(drawerObj.eid);
      author = drawerObj.author || '';
    }

    if (eid && author) {
      dispatch({ type: 'tacticsInvasion/fetchMaxids' });
      const reqObj = {
        id: eid,
        isUser: author === 'USER' ? 'yes' : 'no',
      };
      dispatch({
        type: 'tacticsInvasion/fetchEditInfo',
        payload: reqObj,
      }).then(() => {
        const {
          tacticsInvasion: { editInfo },
        } = this.props;
        const { ruleArr } = editInfo;
        const newRuleArr = [];
        const ruleIds = [];
        ruleArr.forEach((obj) => {
          ruleIds.push(obj.id);
          newRuleArr.push({
            id: obj.id,
            sid: obj.id,
            gid: eid,
            name: obj.name || '', // 规则名 等于 guideObj.msg
            // disable: true,
            rule: obj.signature,
            guideObj: {},
          });
        });
        let isDisable = true;
        if (editInfo.merge_switch) {
          isDisable = false;
        }
        const categoryVal = editInfo.category || '';

        this.setState({
          ruleArr: newRuleArr,
          ruleIds,
          isDisable,
          categoryVal,
          modalTitle: '编辑',
          eid,
        });
      });
    } else {
      // 新建事件
      dispatch({ type: 'tacticsInvasion/fetchMaxids' }).then(() => {
        const {
          tacticsInvasion: { maxids },
        } = this.props;
        const createEid = maxids.gid + 1;
        this.setState({ eid: createEid });
      });
    }
  }

  onOKSave = () => {
    const {
      form,
      tacticsInvasion: { editInfo: editItem },
    } = this.props;
    const { ruleArr, isProcessing, ruleIds, modalTitle, eid } = this.state;
    if (ruleArr.length <= 0) {
      message.error('至少要有一条规则信息');
      return;
    }
    form.validateFields((err, values) => {
      if (!err) {
        if (isProcessing) {
          return;
        }
        this.setState({ isProcessing: true });

        // 规则信息进行处理
        const ruleData = []; // 新建规则
        const editData = []; // 编辑规则
        const allRuleId = [];
        ruleArr.forEach((ruleObj, ruleIndex) => {
          if (ruleObj) {
            const { sid, rule, name = '', guideObj = {} } = ruleObj;
            allRuleId.push(sid);
            const ruleRule = form.getFieldValue(`ruleRule_${ruleIndex}`);

            // 规则id不能编辑修改，只是展示用
            const tmpItem = {
              name: name || guideObj.msg || values.name || '',
              signature: ruleRule || rule || '',
              id: sid,
            };
            if (ruleIds.indexOf(sid) < 0) {
              // 新建规则
              ruleData.push(tmpItem);
            } else {
              editData.push(tmpItem); // 编辑规则
            }
          }
        });
        const delData = ruleIds.filter((rid) => allRuleId.indexOf(rid) < 0); // 删除规则
        // console.log('ruleData==', ruleData);

        const {
          merge_minute,
          merge_field,
          mergeTime,
          name,
          category,
          merge_switch,
          process_suggest,
          description,
          sub_category,
          score,
        } = values;
        const scoreObj = configSettings.scoreColorMap(Number(score));
        const params = {
          name,
          category,
          level: scoreObj.ruleLevel,
          merge_switch,
          process_suggest,
          description,
          score: scoreObj.ruleSoce,
          id: eid,
        };
        const minuteVal = mergeTime === 'h' ? Number(merge_minute) * 60 : Number(merge_minute);
        const method = {
          minute: minuteVal,
          field: merge_field === 'rule_id' || merge_field === '' ? [] : merge_field.split(','),
        };
        params.merge_method = JSON.stringify(method);
        params.merge_switch = Number(params.merge_switch);
        params.level = Number(params.level);
        params.ruleArr = ruleData;

        if (modalTitle === '编辑') {
          params.id = editItem.id;
          params.author = editItem.author;
          params.editArr = editData;
          params.delArr = delData;
        } else {
          params.enable = 1;
        }
        if (sub_category) {
          if (Array.isArray(sub_category)) {
            const tmpSub1 = sub_category[0] ? sub_category[0] : '';
            const tmpSub = configSettings.trimStr(tmpSub1);
            if (!tmpSub) {
              message.error('子类不能为空');
              this.setState({ isProcessing: false });
              return;
            }
            params.sub_category = tmpSub || '';
          } else {
            params.sub_category = sub_category || '';
          }
        } else {
          params.sub_category = '';
        }
        this.onFormSave(params);
      } else if (err.sub_category) {
        this.onOKSave();
      }
    });
  };

  onFormSave = (values) => {
    const { modalTitle } = this.state;
    const { dispatch, backTablePage } = this.props;
    let obj = values;
    const curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    let successTip = '编辑成功';
    if (modalTitle === '新建') {
      successTip = '新建成功';
      obj = Object.assign({}, values, { author: 'USER', update_time: curTime });
    }

    dispatch({ type: 'tacticsInvasion/addEditHandleEvent', payload: { obj, modalTitle } })
      .then(() => {
        message.success(successTip);
        this.setState({ isProcessing: false }, () => {
          backTablePage();
          // this.goBack();
        });
        Modal.confirm({
          title: '是否将该事件添加到所有探针?',
          okText: '确认',
          cancelText: '取消',
          async onOk() {
            const { id } = values;
            const res = await dispatch({
              type: 'tacticsInvasion/addThisEventToAllProbes',
              payload: { id },
            });
            message.success(res.msg);
          },
        });
      })
      .catch((error) => {
        // this.setState({ formVisible: false, scanVisible: false, editItem: {}, reqing: false });
        message.error(error.msg);
        this.setState({ isProcessing: false });
      });
  };

  afterSelector = (defaultVal) => {
    const { isDisable } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;
    return getFieldDecorator('mergeTime', {
      initialValue: defaultVal || 'h',
    })(
      <Select style={{ width: 70 }} disabled={isDisable}>
        <Option value="s">分</Option>
        <Option value="h">时</Option>
      </Select>
    );
  };

  // 表单验证
  validateMInute = (rule, value, callback) => {
    const { form } = this.props;
    const switchVal = form.getFieldValue('merge_switch');
    if (switchVal === 1 || switchVal === '1') {
      try {
        const reg = /^[0-9]+$/;
        const numState = reg.test(value);
        const numFlag = numState && Number(value) >= 1 && Number(value) <= 999;
        if (!numFlag) {
          throw new Error('请填写1~999的数值');
        } else {
          callback();
        }
      } catch (e) {
        callback(e.message);
      }
    } else {
      try {
        const reg2 = /^[0-9]+$/;
        const numState2 = reg2.test(value);
        if (!numState2) {
          throw new Error('请填写数值');
        } else {
          callback();
        }
      } catch (e) {
        callback(e.message);
      }
    }
  };

  validateScore = (rule, value, callback) => {
    if (value !== '') {
      const reg = /^[0-9]+$/;
      const numState = reg.test(value);
      const numFlag = numState && Number(value) >= 1 && Number(value) <= 100;
      if (!numFlag) {
        callback('请填写1~100的数值');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  validateEventName = (rule, value, callback) => {
    if (value) {
      const strReg = new RegExp(
        "[`\";\\/!#$^&*=|{}%''\\[\\]<>?！#￥……&*——|{}【】‘；：”“'。，、？]"
      );

      if (strReg.test(value)) {
        callback('名称不能包含“!#$^&*=|{}%”等非法字符');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  validateSignature = (value, callback, ruleIndex) => {
    const { ruleArr } = this.state;
    const {
      dispatch,
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    if (value) {
      try {
        dispatch({
          type: 'tacticsInvasion/validateRule',
          payload: { signature: value },
        })
          .then(() => {
            ruleArr[ruleIndex].callbackRes = '';
            // 还要用正则检查一下
            //  这个 msg 是否跟事件名称匹配如果不匹配我们要替换
            // "alert http $HOME_NET any -> $HOME_NET any (msg:\"我是事件名123称\";.....
            ruleArr[ruleIndex].rule = value.replace(
              /msg:".*?";/,
              `msg:"${getFieldValue('name')}";`
            );

            const obj = {};
            obj[`ruleRule_${ruleIndex}`] = ruleArr[ruleIndex].rule;
            setFieldsValue(obj);

            this.setState({ ruleArr });
            callback();
          })
          .catch((error) => {
            ruleArr[ruleIndex].callbackRes = 'no';
            this.setState({ ruleArr });
            callback(`规则校验失败：${error.msg}`);
          });
      } catch (e) {
        ruleArr[ruleIndex].callbackRes = 'no';
        this.setState({ ruleArr });
        callback(e.message);
      }
    } else {
      ruleArr[ruleIndex].callbackRes = '';
      this.setState({ ruleArr });
      callback();
    }
  };

  switchSelectChange = (value) => {
    if (value === '0') {
      this.setState({ isDisable: true });
    } else {
      this.setState({ isDisable: false });
    }
  };

  addRuleArr = () => {
    const { ruleArr, modalTitle, eid } = this.state; // 新建的时候 最大 id 要比较ruleIds  ruleArr  maxids
    const {
      // form,
      tacticsInvasion: { maxids },
    } = this.props;
    let curMaxSid = maxids.sid;
    if (modalTitle === '新建') {
      // 新建事件-新建规则
      if (ruleArr.length) {
        const realRuleArr = ruleArr.filter((tmpObj) => !!tmpObj);
        const lastRuleObj = realRuleArr[realRuleArr.length - 1];
        curMaxSid = lastRuleObj.sid;
      }
    } else if (modalTitle === '编辑') {
      // 编辑事件-新建规则
      if (ruleArr.length) {
        const ruleArrIds = ruleArr.map((obj) => obj.sid);
        ruleArrIds.sort((a, b) => b - a);
        // console.log(401, 'ruleArrIds==', ruleArrIds);
        curMaxSid = curMaxSid >= ruleArrIds[0] ? curMaxSid : ruleArrIds[0];
      }
    }
    // console.log(403, 'curMaxSid==', curMaxSid);
    const curRuleId = curMaxSid + 1;

    ruleArr.push({
      mode: 'super',
      rule: '',
      sid: curRuleId,
      gid: eid,
      guideObj: {},
      disable: false,
    });
    this.setState({ ruleArr });
  };

  deleteRuleArr = (ruleIndex) => {
    let { ruleArr, ruleIds } = this.state;
    const {
      tacticsInvasion: { maxids },
    } = this.props;
    let curMaxSid = maxids.sid;

    ruleArr.splice(ruleIndex, 1);
    ruleArr = ruleArr.map((obj) => {
      const item = obj;
      if (ruleIds.indexOf(obj.sid) < 0) {
        curMaxSid += 1;
        item.rule = item.rule.replace(`sid:${item.sid}`, `sid:${curMaxSid}`);
        item.sid = curMaxSid; // sid:800003
      }
      return item;
    });
    this.setState({ ruleArr });
  };

  ruleGuideOpen = (ruleObj, ruleIndex) => {
    console.log(444444);
    const { ruleArr, ruleIds } = this.state;
    const { dispatch, form } = this.props;
    const { callbackRes = '', sid, gid } = ruleObj;
    const ruleTitle = ruleIds.indexOf(sid) < 0 ? '新建规则' : '编辑规则';

    const eventName = form.getFieldValue(`name`);
    if (!eventName) {
      message.warn('请填写事件名称');
      return;
    }

    // 获取当前最新规则内容
    const rule = form.getFieldValue(`ruleRule_${ruleIndex}`);
    if (callbackRes === 'no') {
      message.error('规则校验失败，请重新输入或者清空');
      return;
    }
    const category = form.getFieldValue('category');
    const sub_category = form.getFieldValue('sub_category');
    const score = form.getFieldValue('score');
    const scoreObj = configSettings.scoreColorMap(Number(score));
    const iniFiels = { gid, sid, priority: scoreObj.ruleLevel, classtype: category };
    if (sub_category) {
      // 子类可能为空
      iniFiels['sub-category'] = sub_category;
    }
    if (rule === '') {
      // 向导模式
      const ruleItem = { gid, sid, ...iniFiels };
      this.setState({ ruleFromVisible: true, ruleTitle, ruleItem });
    }

    // const guideStr = JSON.stringify(guideObj);
    if (rule) {
      // 规则解析
      const paramVal = Buffer.from(rule, 'utf8').toString('hex');
      const param = paramVal.toUpperCase();
      dispatch({
        type: 'tacticsInvasion/parseRule',
        payload: { param },
      })
        .then((json) => {
          if (json.error_code === 0) {
            const ruleItem = { ...json.msg, ...iniFiels };
            ruleArr[ruleIndex].guideObj = ruleItem;
            console.log(515, '规则向导传参_ruleItem==', ruleItem);
            this.setState({ ruleFromVisible: true, ruleTitle, ruleItem, ruleArr });
          } else {
            // ruleArr[ruleIndex].disable = false;
            message.error('规则解析失败，无法打开规则向导');
            this.setState({ ruleArr });
          }
        })
        .catch((error) => {
          console.log(473, error);
          message.error('规则解析失败，无法打开规则向导');
          this.setState({ ruleArr });
        });
    }
  };

  ruleArrReact = () => {
    const {
      form,
      tacticsInvasion: { editInfo: editItem },
    } = this.props;
    const { ruleArr, modalTitle } = this.state;
    const { getFieldDecorator } = form;
    // const modalTitle = _.isEmpty(editItem) ? '新建' : '编辑';
    let ruleNameDisable = false;
    if (modalTitle === '编辑' && editItem.author !== 'USER') {
      ruleNameDisable = true;
    }
    const ruleArrIndexArr = [];
    ruleArr.forEach((obj, i) => {
      if (obj) {
        ruleArrIndexArr.push(i);
      }
    });
    // console.log('ruleArrIndexArr', ruleArrIndexArr);

    const react = ruleArrIndexArr.map((ruleIndex, index) => {
      const ruleObj = ruleArr[ruleIndex];

      const resultElement = (
        <div key={ruleIndex} style={{ marginBottom: 30 }}>
          <div className={styles.filterDiv}>
            <div className={styles.filterTheme}>
              <h5 style={{ fontSize: '14px' }}>规则{index + 1}</h5>
              {((index >= 0 && !ruleNameDisable) || modalTitle === '编辑') && (
                <div className={styles.filterModal}>
                  <div className={styles.colPcapSize}>
                    <div className={styles.textDiv}>
                      {/* {modalTitle === '编辑' && ( */}
                      <a
                        style={{ marginRight: 20 }}
                        onClick={() => {
                          this.ruleGuideOpen(ruleObj, ruleIndex);
                        }}
                      >
                        创建向导
                      </a>
                      <a
                        style={{ color: '#f00' }}
                        onClick={() => {
                          this.deleteRuleArr(ruleIndex);
                        }}
                      >
                        删除该规则
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className={styles.filterGroupsDiv}>
                <div className={styles.filterMid}>
                  <div>
                    <Row className={styles.filterDataSource}>
                      <Col xs={4} sm={4}>
                        <span className={styles.filterSpan}>规则内容：</span>
                      </Col>
                      <Col xs={15} sm={15}>
                        <FormItem>
                          {getFieldDecorator(`ruleRule_${ruleIndex}`, {
                            initialValue: ruleObj.rule || '',
                            validateTrigger: 'onBlur',
                            rules: [
                              { required: true, message: '必填' },
                              {
                                validator: (rule, value, callback) =>
                                  this.validateSignature(value, callback, ruleIndex),
                              },
                            ],
                          })(
                            <Input.TextArea
                              disabled={ruleObj.disable === true}
                              style={{ height: 200 }}
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

      return resultElement;
    });
    return react;
  };

  categoryChange = (e) => {
    const categoryVal = e;
    const { form } = this.props;
    const subTigs = configSettings.eventSubCate[categoryVal];
    let setVal = '';
    if (subTigs && subTigs.length > 0) {
      if (categoryVal === '数据泄露') {
        setVal = [subTigs[0]];
      } else {
        setVal = subTigs[0] || '';
      }
    }
    form.setFieldsValue({
      sub_category: setVal,
    });
    this.setState({ categoryVal });
  };

  subCateValidate = (value) => {
    const { categoryVal } = this.state;
    const { form } = this.props;
    const pattern = new RegExp(
      "[`~!#$^&*()=|{}''\\[\\]<>%\"?~！#￥……&*（）——|{}【】‘；：”“'。，、？]"
    );
    const subTigs = configSettings.eventSubCate[categoryVal];

    if (subTigs && subTigs.length > 0) {
      if (categoryVal === '数据泄露') {
        if (value.length <= 0) {
          message.error('子类不能为空');
          // callback('必填');
        } else if (value.length === 1) {
          const newVal = configSettings.trimStr(value[0]);
          let setVal = [newVal];
          if (pattern.test(newVal)) {
            message.warn('输入项不能包含“!#$^&*=|{}%”等非法字符');
            setVal = [];
          }
          if (newVal.length > 16) {
            message.warn('输入项长度不能超过16个字符');
            setVal = [];
          }
          if (!newVal) {
            message.warn('输入项不能为空');
            setVal = [];
          }
          form.setFieldsValue({
            sub_category: setVal,
          });
          // callback();
        } else {
          message.warn('只允许选择或输入一项值');
          const newVal = configSettings.trimStr(value[value.length - 1]);
          let setVal = [newVal];
          if (pattern.test(newVal)) {
            message.warn('输入项不能包含“!#$^&*=|{}%”等非法字符');
            setVal = [];
          }
          if (newVal.length > 16) {
            message.warn('输入项长度不能超过16个字符');
            setVal = [];
          }
          if (!newVal) {
            message.warn('输入项不能为空');
            setVal = [];
          }
          form.setFieldsValue({
            sub_category: setVal,
          });
          // callback();
        }
      } else if (!value) {
        // callback('必填');
        message.error('子类不能为空');
        form.setFieldsValue({
          sub_category: subTigs[0],
        });
      } else {
        // callback();
      }
    } else {
      // callback();
    }
  };

  onRuleFormSave = (obj) => {
    const { form } = this.props;
    // const { ruleIds } = this.state;
    // const guideFlag = ruleIds.indexOf(obj.sid) < 0 ? '新建规则' : '编辑规则';
    let { ruleArr } = this.state;
    // console.log(718, 'onRuleFormSave_obj===', obj, 'obj.sid==', obj.sid);
    // if (guideFlag === '新建规则') {
    //   ruleArr.push(obj);
    // } else {
    let ruleIndex;
    ruleArr = ruleArr.map((tmp, tindex) => {
      let item = tmp;
      if (`${item.sid}` === `${obj.sid}`) {
        item = { ...tmp, ...obj };
        ruleIndex = tindex;
      }
      // console.log(718718, 'item.sid === obj.sid==', item.sid, obj.sid);
      return item;
    });
    form.setFieldsValue({ [`ruleRule_${ruleIndex}`]: obj.rule });
    // }
    // console.log(733718, 'ruleArr==', ruleArr);
    this.setState({ ruleArr, ruleFromVisible: false, ruleTitle: '', ruleItem: {} });
  };

  onRuleFormCancel = () => {
    this.setState({ ruleFromVisible: false, ruleTitle: '', ruleItem: {} });
  };

  handleEventNameBlur = (event) => {
    const { value } = event.target;
    const strReg = new RegExp("[`\";\\/!#$^&*=|{}%''\\[\\]<>?！#￥……&*——|{}【】‘；：”“'。，、？]");
    if (!strReg.test(value)) {
      console.log('事件名称检查通过');
      const {
        form: { setFieldsValue },
      } = this.props;
      // 规则信息数组的每一个元素 规则内容 都要替换为新得事件名称
      let { ruleArr } = this.state;
      ruleArr = ruleArr.map((item, ruleIndex) => {
        item.rule = item.rule.replace(/msg:".*?";/, `msg:"${value}";`);

        const obj = {};
        obj[`ruleRule_${ruleIndex}`] = item.rule;
        setFieldsValue(obj);
        return item;
      });
      this.setState(ruleArr);
    }
  };

  render() {
    const {
      isDisable,
      isProcessing,
      categoryVal,
      modalTitle,
      ruleFromVisible,
      ruleTitle,
      ruleItem,
    } = this.state;
    const { form, loading, tacticsInvasion, hasVpc, backTablePage } = this.props;
    const { editInfo } = tacticsInvasion;
    const editItem = modalTitle === '新建' ? {} : editInfo;
    // console.log('editItem==', editItem);
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 14 },
      },
    };

    const subTigs = configSettings.eventSubCate[categoryVal];
    let subTigsDis = true;
    let subMode = '';
    let subCataIni = '';
    if (subTigs && subTigs.length > 0) {
      subTigsDis = false;
      subCataIni = subTigs[0] || '';
      if (categoryVal === '数据泄露') {
        subMode = 'tags';
        subCataIni = subTigs[0] ? [subTigs[0]] : [];
      }
    }
    // console.log('subTigs==', subTigs);

    if (editItem.sub_category) {
      if (editItem.category === '数据泄露') {
        subCataIni = [editItem.sub_category];
      } else {
        subCataIni = editItem.sub_category;
      }
    }

    const scoreObj = configSettings.scoreColorMap(Number(editItem.score));
    editItem.score = scoreObj.ruleSoce;
    editItem.level = scoreObj.ruleLevel;

    const method = editItem.merge_method
      ? JSON.parse(editItem.merge_method)
      : { minute: 120, field: '' };

    let fieldInitialValue = '';
    if (method) {
      if (method.field) {
        fieldInitialValue = method.field.join(',');
      }
    }

    let minuteInitialValue = 2;
    let timeInitialValue = 'h';
    if (method && method.minute) {
      if (method.minute % 60 !== 0) {
        minuteInitialValue = method.minute;
        timeInitialValue = 's';
      } else {
        minuteInitialValue = method.minute / 60;
      }
    }

    const defaultSwitchVal = `${editItem.merge_switch || 0}`;
    // const modalTitle = _.isEmpty(editItem) ? '新建' : '编辑';

    if (loading) {
      return (
        <div className={styles.loadingStyle}>
          <Spin />
        </div>
      );
    }

    return (
      <div>
        <div>
          <div className={styles.drawerContent}>
            <Form className={styles.warnForm}>
              <Row className={styles.rowBlock}>
                <Col span={4}>
                  <h4 className={styles.title4}>事件信息</h4>
                </Col>
                <Col span={20}>
                  <FormItem {...formItemLayout} label="事件名称" extra="">
                    {getFieldDecorator('name', {
                      initialValue: editItem.name || '',
                      validateTrigger: 'onBlur',
                      rules: [
                        {
                          required: true,
                          message: '必填',
                        },
                        { max: 64, message: '最多填写64字符，请重新填写' },
                        {
                          validator: this.validateEventName,
                        },
                      ],
                    })(<Input onBlur={this.handleEventNameBlur} />)}
                  </FormItem>

                  <FormItem {...formItemLayout} label="分类">
                    {getFieldDecorator('category', {
                      initialValue: categoryVal,
                    })(
                      <Select mode="" onChange={this.categoryChange}>
                        {tiTags.map((tag) => (
                          <Option key={tag.value} value={tag.value}>
                            {tag.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="子类"
                    extra="当分类选择 数据泄露 时，子类允许手动输入"
                  >
                    {getFieldDecorator('sub_category', {
                      initialValue: subCataIni,
                      rules: [
                        {
                          validator: (rule, value, callback) => {
                            callback();
                            this.subCateValidate(value);
                          },
                        },
                      ],
                    })(
                      <Select mode={subMode} disabled={subTigsDis}>
                        {subTigs &&
                          subTigs.map((tag) => (
                            <Option key={tag} value={tag}>
                              {tag}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="事件级别" extra="">
                    {getFieldDecorator('score', {
                      initialValue: editItem.score || 80,
                    })(
                      <Select>
                        <Option value={100}>严重（100）</Option>
                        <Option value={80}>高危（80）</Option>
                        <Option value={60}>中危（60）</Option>
                        <Option value={40}>低危（40）</Option>
                        <Option value={20}>信息（20）</Option>
                      </Select>
                    )}
                  </FormItem>

                  <FormItem {...formItemLayout} label="事件描述" extra="">
                    {getFieldDecorator('description', {
                      initialValue: editItem.description || '',
                      rules: [{ max: 2048, message: '最多填写2048字符，请重新填写' }],
                    })(<Input.TextArea style={{ height: 100 }} />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="处置建议" extra="">
                    {getFieldDecorator('process_suggest', {
                      initialValue: editItem.process_suggest || '',
                      rules: [{ max: 2048, message: '最多填写2048字符，请重新填写' }],
                    })(<Input.TextArea style={{ height: 100 }} />)}
                  </FormItem>

                  <FormItem {...formItemLayout} label="归并策略" extra="">
                    {getFieldDecorator('merge_switch', {
                      initialValue: defaultSwitchVal,
                    })(
                      <Select onChange={this.switchSelectChange}>
                        <Option key="1" value="1">
                          内置策略
                        </Option>
                        <Option key="0" value="0">
                          全局策略
                        </Option>
                      </Select>
                    )}
                  </FormItem>

                  <FormItem {...formItemLayout} label="归并字段" extra="">
                    {getFieldDecorator('merge_field', {
                      initialValue: fieldInitialValue || '',
                    })(
                      <Select mode="" disabled={isDisable}>
                        <Option key="rule_id" value="">
                          事件
                        </Option>
                        <Option key="src_ip" value="src_ip">
                          {hasVpc ? '事件，源IP，VPCID' : '事件，源IP'}
                        </Option>
                        <Option key="dst_ip" value="dst_ip">
                          {hasVpc ? '事件，目的IP，VPCID' : '事件，目的IP'}
                        </Option>
                        <Option key="src_ip,dst_ip" value="src_ip,dst_ip">
                          {hasVpc ? '事件，源IP，目的IP，VPCID' : '事件，源IP，目的IP'}
                        </Option>
                        <Option key="src_ip,src_port" value="src_ip,src_port">
                          {hasVpc ? '事件，源IP，源端口，VPCID' : '事件，源IP，源端口'}
                        </Option>
                        <Option key="dst_ip,dst_port" value="dst_ip,dst_port">
                          {hasVpc ? '事件，目的IP，目的端口，VPCID' : '事件，目的IP，目的端口'}
                        </Option>
                        <Option
                          key="src_ip,src_port,dst_ip,dst_port"
                          value="src_ip,src_port,dst_ip,dst_port"
                        >
                          {hasVpc
                            ? '事件，源IP，源端口，目的IP，目的端口，VPCID'
                            : '事件，源IP，源端口，目的IP，目的端口'}
                        </Option>
                      </Select>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="归并时长" extra="">
                    {getFieldDecorator('merge_minute', {
                      initialValue: `${minuteInitialValue || 120}`,
                      rules: [
                        // {
                        //     required: true,
                        //     message: '必填',
                        // },
                        {
                          validator: this.validateMInute,
                        },
                      ],
                    })(
                      <Input
                        placeholder="请填写1~999的数值"
                        addonAfter={this.afterSelector(timeInitialValue)}
                        disabled={isDisable}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>

              <Row className={styles.rowBlock}>
                <Col span={4}>
                  <h4 className={styles.title4}>规则信息</h4>
                </Col>
                <Col span={20}>
                  {(modalTitle === '新建' || editItem.author === 'USER') && (
                    <div className={styles.modeDiv}>
                      <a
                        onClick={() => {
                          this.addRuleArr();
                        }}
                      >
                        <PlusOutlined />
                        新建规则
                      </a>
                    </div>
                  )}
                  <div>{this.ruleArrReact()}</div>
                </Col>
              </Row>
              <Row>
                <Col span={4} />
                <Col span={20}>
                  <Row>
                    <Col xs={4} sm={4} />
                    {this.rwAuth === 'rw' && (
                      <Col xs={14} sm={14}>
                        <Button
                          style={{ marginRight: 20 }}
                          onClick={() => {
                            // this.goBack();
                            backTablePage();
                          }}
                        >
                          取消
                        </Button>
                        <Button type="primary" onClick={this.onOKSave} loading={isProcessing}>
                          保存
                        </Button>
                      </Col>
                    )}
                  </Row>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
        {ruleFromVisible && (
          <RuleEditForm
            key="ruleFrom"
            editItem={ruleItem}
            title={ruleTitle}
            visible={ruleFromVisible}
            tiTags={[]}
            onCancel={this.onRuleFormCancel}
            onSave={this.onRuleFormSave}
            eventName={getFieldValue('name')}
          />
        )}
      </div>
    );
  }
}

export default Form.create()(AlertManageFormPageDrawer);
