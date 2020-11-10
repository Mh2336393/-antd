import React, { Component, Fragment } from 'react';
import { connect } from 'umi';
import moment from 'moment';
import { DownSquareOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
// import { Table, message, Icon, Select, Form, Modal, Switch, Input, Popover, Tooltip } from 'antd';
import { Table, message, Popover, Switch, Select, Modal, Input, DatePicker } from 'antd';
import configSettings from '../../configSettings';
import EditAutoTaskForm from './EditAutoTaskForm';
import styles from './index.less';
import ButtonBlock from '@/components/ButtonBlock';
import authority from '@/utils/authority';
const { getAuth } = authority;

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const weekDay = {
  Mon: 1,
  Tues: 2,
  Wed: 3,
  Thur: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0,
};
@connect(({ reportTasks, login, loading }) => ({
  reportTasks,
  login,
  loading: loading.effects['reportTasks/fetchAutoList'],
}))
class reportTask extends Component {
  constructor(props) {
    super(props);
    this.taskAuth = getAuth('/reports/tasks');
    this.state = {
      query: {
        page: 1,
        pageSize: parseInt(configSettings.pageSizeOptions[0], 10),
        task_name: '',
        sort: '', // 排序项
        dir: '', // 正序 倒叙
      },
      taskName: '',
      taskDes: '',
      taskTml: [],
      timePickerShow: false,
      timeRange: [
        {
          key: '近24小时',
          // start_time: moment()
          //   .subtract(24, 'hours')
          //   .valueOf(),
          end_time: moment().valueOf(),
        },
        {
          key: '近一周',
          // start_time: moment()
          //   .subtract(7, 'days')
          //   .valueOf(),
          end_time: moment().valueOf(),
        },
        {
          key: '近一月',
          // start_time: moment()
          //   .subtract(1, 'months')
          //   .valueOf(),
          end_time: moment().valueOf(),
        },
        {
          key: '近一季度',
          // start_time: moment()
          //   .subtract(4, 'months')
          //   .valueOf(),
          end_time: moment().valueOf(),
        },
        {
          key: '近一年',
          // start_time: moment()
          //   .subtract(1, 'years')
          //   .valueOf(),
          end_time: moment().valueOf(),
        },
        {
          key: '自定义',
        },
      ],
      groups: [],
      rank: [
        {
          key: 'Top10',
          value: 10,
        },
        {
          key: 'Top50',
          value: 50,
        },
      ],
      tmlSelected: '',
      timeSelected: '近24小时',
      groupSelected: '',
      rankSelected: 10,
      // showOperation: '',
      taskModal: false,
      currentHoverRow: '', // 当前hover的行
      taskOperation: false, // 显示操作
      formVisible: false, // 新建编辑表单
      editItem: {}, // 新建编辑表单
      modalTitle: '',
      modalType: '',
      hisList: [],
      commonValue: {}, // 存放外层表单的数据
      userId: '', // 用户
      isProcessing: false, // 点击标志
      definedStart: moment().subtract(1, 'months'), // 自定义的开始时间
      definedEnd: moment(), // 自定义的结束时间
    };

    this.columns = [
      {
        title: '',
        width: 20,
        key: 'action',
        dataIndex: '',
        render: (text, record, index) => {
          if (this.taskAuth !== 'rw') {
            return null;
          }
          let actionStyle;
          const {
            reportTasks: {
              autoList: { list },
            },
          } = this.props;
          const { taskOperation } = this.state;
          if (index < list.length - 1) {
            actionStyle = { top: 20 };
          } else {
            actionStyle = { bottom: 0 };
          }
          return (
            <div style={{ width: 20 }}>
              <div className={styles.tableAction}>
                <DownSquareOutlined
                  onClick={() => {
                    this.setState({ taskOperation: !taskOperation });
                  }}
                  style={{ color: '#5cbaea' }} />
                {taskOperation && (
                  <div className={styles.actionContent} style={actionStyle}>
                    <Fragment>
                      <p
                        onClick={() => {
                          this.setState({
                            taskOperation: false,
                            formVisible: true,
                            editItem: record,
                            modalTitle: '编辑自动任务',
                            modalType: 'editor',
                          });
                        }}
                      >
                        编辑
                      </p>
                      <p
                        onClick={() => {
                          this.setState({ taskOperation: false });
                          this.delHandleEvent(record.id);
                        }}
                      >
                        删除
                      </p>
                    </Fragment>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: '任务名称',
        dataIndex: 'task_name',
        width: 200,
        key: 'task_name',
        render: (text) => (
          <span>
            {text.length > 10 ? (
              <span
                style={{ display: 'inline-block', maxWidth: 140 }}
                title={text}
                className="ellipsis"
              >
                {text}
              </span>
            ) : (
              <span style={{ display: 'inline-block', maxWidth: 140 }} className="ellipsis">
                {text}
              </span>
            )}
          </span>
        ),
      },
      {
        title: '报表模板',
        width: 200,
        dataIndex: 'template_name',
        key: 'template_name',
      },

      {
        title: '时间范围',
        width: 100,
        dataIndex: 'time_start',
        key: 'time_start',
        render: (text, record) => {
          const periodStr = this.timeToPeriod(record.time_start, record.time_end);
          return periodStr;
        },
      },
      {
        title: '包含资产组',
        width: 100,
        dataIndex: 'Fgroup_name',
        key: 'Fgroup_name',
        render: (text) => {
          if (text) {
            const list = text.split(',');
            const popContent = (
              <div>
                {list.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            );
            return (
              <div>
                {list.length > 1 ? (
                  <Popover content={popContent} placement="bottomLeft" title="包含资产组">
                    <div>
                      多个（
                      <span className="fontBlue">{list.length}</span>）
                    </div>
                  </Popover>
                ) : (
                  <div>{text}</div>
                )}
              </div>
            );
          }
          return '所有分组';
        },
      },
      {
        title: '创建人',
        width: 100,
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: '下一次启动时间',
        width: 200,
        dataIndex: 'next_working_time',
        key: 'next_working_time',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '重复',
        width: 100,
        dataIndex: 'period',
        key: 'period',
        render: (text) => {
          if (text === 'hourly') return '每小时一次';
          if (text === 'daily') return '每天一次';
          if (text === 'weekly') return '每周一次';
          return '每月一次';
        },
      },
      {
        title: '任务启停',
        width: 100,
        dataIndex: 'enable',
        key: 'enable',
        // render: text => <Switch checkedChildren="开" unCheckedChildren="关" checked={text === '1'} />,
        render: (text, record) => (
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            checked={text === '1'}
            onChange={() => {
              if (this.taskAuth !== 'rw') {
                return;
              }
              this.changeState(record);
            }}
          />
        ),
      },
    ];

    this.taskColumes = [
      {
        title: '任务名称',
        dataIndex: 'task_name',
        key: 'task_name',
        render: (text) => (
          <span>
            {text.length > 10 ? (
              <span
                title={text}
                style={{ display: 'inline-block', maxWidth: 100 }}
                className="ellipsis"
              >
                {text}
              </span>
            ) : (
              <span
                title={text}
                style={{ display: 'inline-block', maxWidth: 100 }}
                className="ellipsis"
              >
                {text}
              </span>
            )}
          </span>
        ),
      },
      {
        title: '报表模板',
        dataIndex: 'template_name',
        key: 'template_name',
      },
      {
        title: '时间范围',
        dataIndex: 'time_start',
        key: 'time_start',
        render: (text, record) => {
          const periodStr = this.timeToPeriod(record.time_start, record.time_end);
          return periodStr;
        },
      },
      {
        title: '包含资产组',
        dataIndex: 'Fgroup_name',
        key: 'Fgroup_name',
        render: (text) => text || '所有分组',
      },
      {
        title: '数据展示',
        dataIndex: 'topn',
        key: 'topn',
        render: (text) => (text === 10 ? 'Top10' : 'Top50'),
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        key: 'create_time',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <span
            style={{ padding: '5px 15px', color: '#5089fa', cursor: 'pointer' }}
            onClick={() => {
              this.filling(record);
            }}
          >
            导入
          </span>
        ),
      },
    ];

    this.btnList = [
      {
        type: 'primary',
        label: '生成报表',
        hide: this.taskAuth !== 'rw',
        func: () => {
          const { form, dispatch } = this.props;
          const { isProcessing } = this.state;
          form.validateFields((err, values) => {
            if (!err) {
              const formQuery = {};
              const period = this.getPeriod(values.timeSelected);
              formQuery.cmd = 'generate_report';
              formQuery.task_name = values.taskName;
              formQuery.description = values.taskDes;
              formQuery.template_id = values.tmlSelected;
              formQuery.time_start = moment(period.start_time).format('YYYY-MM-DD HH:mm:ss');
              formQuery.time_end = moment(period.end_time).format('YYYY-MM-DD HH:mm:ss');
              formQuery.asset = values.groupSelected;
              formQuery.topn = values.rankSelected;
              // console.log('生成报表', formQuery);
              if (isProcessing) return;
              this.setState({ isProcessing: true });
              dispatch({
                type: 'reportTasks/generaterReoprt',
                payload: formQuery,
              })
                .then(() => {
                  message.success('生成报表生成成功，稍后在报表列表查看!');
                  this.setState({ isProcessing: false });
                })
                .catch((error) => {
                  message.error(`生成报表失败：${error.msg}！`);
                  this.setState({ isProcessing: false });
                });
            }
          });
        },
      },
      {
        type: '',
        label: '保存为自动任务',
        hide: this.taskAuth !== 'rw',
        func: () => {
          const { form } = this.props;
          form.validateFields((err, values) => {
            if (!err) {
              // console.log('autovalues', values);
              this.setState({
                commonValue: values,
                formVisible: true,
                modalTitle: '保存为自动任务',
                modalType: 'save',
                editItem: {
                  period: 'daily',
                },
              });
            }
          });
        },
      },
      {
        type: '',
        label: '导入历史',
        // hide: this.taskAuth !== 'rw',
        func: () => {
          const { dispatch } = this.props;
          dispatch({
            type: 'reportTasks/getReportHisList',
          }).then((res) => {
            if (res.error_code === 0) {
              this.setState({ hisList: res.data });
              this.setState({ taskModal: true });
            }
          });
        },
      },
    ];
  }

  componentDidMount() {
    const {
      dispatch,
      location,
      login: { currentUser },
    } = this.props;
    const { query } = this.state;
    let newQuery = { ...query };
    if (Object.keys(location.query).length > 0) {
      newQuery = Object.assign({}, query, location.query);
    }
    this.setState({ query: newQuery });
    this.setState({ userId: currentUser });
    dispatch({
      type: 'reportTasks/fetchAutoList',
      payload: newQuery,
    });
    dispatch({
      type: 'reportTasks/getTemplateLists',
    }).then((temls) => {
      if (temls.error_code === 0) {
        this.setState({ taskTml: temls.data });
        this.setState({ tmlSelected: temls.data[0].id });
        // console.log('temls', temls.data);
      }
    });
    dispatch({
      type: 'reportTasks/getAssetLists',
    }).then((asset) => {
      if (asset.error_code === 0) {
        const ids = [];
        asset.data.forEach((item) => {
          ids.push(item.Fgid);
        });
        let assetArr = [];
        const obj = { Fgid: -1, Fgroup_name: '所有分组' };
        assetArr[0] = obj;
        assetArr = assetArr.concat(asset.data);
        this.setState({ groups: assetArr });
        this.setState({ groupSelected: assetArr[0].Fgid });
        // console.log('asset', assetArr);
      }
    });
  }

  // 删除
  delHandleEvent = (singleID) => {
    const { dispatch } = this.props;
    const { query } = this.state;
    confirm({
      title: '删除后不可恢复，确定删除吗',
      onOk() {
        dispatch({
          type: 'reportTasks/delAutoList',
          payload: { id: `${singleID}` },
        })
          .then(() => {
            message.success('删除成功');
            dispatch({
              type: 'reportTasks/fetchAutoList',
              payload: query,
            });
          })
          .catch((error) => {
            message.error(error.msg);
          });
      },
      onCancel() {},
    });
  };

  onFormCancel = () => {
    this.setState({ formVisible: false, editItem: {} });
  };

  // 表单 -- 确定保存按钮
  onFormSave = (values) => {
    this.setState({ formVisible: false });
    const { dispatch } = this.props;
    const { query, modalType, commonValue, userId } = this.state;
    // console.log('onFormSave', values);
    if (modalType === 'editor') {
      // console.log('editor', values);
      const nextWorkingTime = this.getNextWorkingTime(
        values.period,
        values.generate_date,
        values.generate_time
      );
      // console.log('next', nextWorkingTime);
      const newQuery = Object.assign({}, values);
      newQuery.next_working_time = nextWorkingTime;
      // console.log('newQuery', newQuery);
      dispatch({ type: 'reportTasks/updateAutoList', payload: newQuery })
        .then(() => {
          message.success('编辑成功');
          this.setState({ editItem: {} });
          dispatch({
            type: 'reportTasks/fetchAutoList',
            payload: query,
          });
        })
        .catch((error) => {
          message.error(error.msg);
        });
    } else if (modalType === 'save') {
      // console.log('common', commonValue);
      // console.log('value', values);
      const formQuery = {};
      const period = this.getPeriod(commonValue.timeSelected);
      formQuery.time_start = moment(period.start_time).format('YYYY-MM-DD HH:mm:ss');
      formQuery.time_end = moment(period.end_time).format('YYYY-MM-DD HH:mm:ss');
      formQuery.task_name = commonValue.taskName;
      formQuery.description = commonValue.taskDes;
      formQuery.asset = commonValue.groupSelected;
      formQuery.topn = commonValue.rankSelected;
      formQuery.template_id = commonValue.tmlSelected;
      formQuery.period = values.period;
      formQuery.generate_date = values.date;
      formQuery.generate_time = values.time;
      formQuery.enable = '1';
      formQuery.cmd = 'auto_report';
      formQuery.creator = userId;
      // console.log('query', formQuery);
      dispatch({
        type: 'reportTasks/generateAutoTask',
        payload: formQuery,
      })
        .then(() => {
          dispatch({
            type: 'reportTasks/fetchAutoList',
            payload: query,
          });
          message.success('自动任务保存成功 !');
        })
        .catch((err) => {
          message.error(err.msg);
        });
    }
  };

  validateTaskName = (rule, value, callback) => {
    if (value) {
      const patternReprt = new RegExp(
        "[`~!@#$^&*()={}\\/\\\\'.:,+\";'\\[\\]%<>?~！@#￥……&*（）+《》——{}【】‘；：”“'。，、？]"
      );
      // console.log('strReg==', strReg, 'strReg.test(value)==', strReg.test(value));
      if (patternReprt.test(value)) {
        callback('名称不能包含“!#$^&*=|{}%”等非法字符');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  // closeModal = () => {
  //   this.setState({ autoModal: false });
  // };

  closeTaskModal = () => {
    this.setState({ taskModal: false });
  };

  // 改变状态
  changeState = (item) => {
    // console.log('item', item);
    const { dispatch } = this.props;
    const { query, isProcessing } = this.state;
    if (isProcessing) return;
    this.setState({ isProcessing: true });
    dispatch({
      type: 'reportTasks/updateListState',
      payload: {
        id: item.id,
        enable: item.enable,
      },
    })
      .then(() => {
        message.success('修改成功');
        dispatch({
          type: 'reportTasks/fetchAutoList',
          payload: query,
        });
        this.setState({ isProcessing: false });
      })
      .catch((error) => {
        message.error(error.msg);
        this.setState({ isProcessing: false });
      });
  };

  filling = (item) => {
    // console.log('item', item);
    const { form } = this.props;
    const period = this.timeToPeriod(item.time_start, item.time_end);
    form.setFieldsValue({
      taskName: item.task_name,
      taskDes: item.description,
      tmlSelected: item.template_id,
      timeSelected: period,
      groupSelected: item.asset,
      rankSelected: item.topn,
    });
    // console.log('period', period);
    // this.setState({ taskName: item.task_name });
    // this.setState({ taskDes: item.description });
    // this.setState({ tmlSelected: item.template_id });
    // this.setState({ timeSelected: period });
    // this.setState({ groupSelected: item.asset });
    // this.setState({ rankSelected: item.topn });
    this.setState({ taskModal: false });
  };

  timeToPeriod = (start, end) => {
    let periodStr = '';
    const range = moment(end).diff(moment(start), 'days');
    // console.log('range', range);
    if (range <= 1) {
      periodStr = '近24小时';
    } else if (range > 1 && range <= 7) {
      periodStr = '近一周';
    } else if (range > 7 && range <= 31) {
      periodStr = '近一月';
    } else if (range > 31 && range <= 92) {
      periodStr = '近一季度';
    } else if (range > 92) {
      periodStr = '近一年';
    }
    return periodStr;
  };

  getPeriod = (value) => {
    // console.log('value', value);
    const { definedStart, definedEnd } = this.state;
    let period = {};
    if (value === '近24小时') {
      period = {
        start_time: moment().subtract(24, 'hours').valueOf(),
        end_time: moment().valueOf(),
      };
    } else if (value === '近一周') {
      period = {
        start_time: moment().subtract(7, 'days').valueOf(),
        end_time: moment().valueOf(),
      };
    } else if (value === '近一月') {
      period = {
        start_time: moment().subtract(1, 'months').valueOf(),
        end_time: moment().valueOf(),
      };
    } else if (value === '近一季度') {
      period = {
        start_time: moment().subtract(3, 'months').valueOf(),
        end_time: moment().valueOf(),
      };
    } else if (value === '近一年') {
      period = {
        start_time: moment().subtract(1, 'years').valueOf(),
        end_time: moment().valueOf(),
      };
    } else {
      period = {
        start_time: moment(definedStart).valueOf(),
        end_time: moment(definedEnd).valueOf(),
      };
    }
    return period;
  };

  getNextWorkingTime = (period, date, time) => {
    let nextWorkingTime = '';
    const currentTime = moment().valueOf(); // 当前时间的时间戳
    const todayGenerTime = moment(`${moment().format('YYYY-MM-DD')} ${time}:00:00`).valueOf(); // 今天生成日期的时间戳
    const currentDate = moment().format('YYYY-MM-DD'); // 今天的日期
    if (period === 'daily') {
      if (todayGenerTime < currentTime) {
        // 生成时间小于当前时间取明天的生成时间
        nextWorkingTime = `${moment().subtract(-1, 'days').format('YYYY-MM-DD')} ${time}:00:00`;
      } else {
        // 生成时间大于当前时间取今天的时间
        nextWorkingTime = `${moment().format('YYYY-MM-DD')} ${time}:00:00`;
      }
    } else if (period === 'weekly') {
      const weekFlag = weekDay[date];
      const weekDate = moment().day(weekFlag).format('YYYY-MM-DD'); // 本周几的日期
      // const currentDate = moment().format('YYYY-MM-DD'); // 今天的日期
      const nextWeekDate = moment().subtract(-1, 'weeks').day(weekFlag).format('YYYY-MM-DD'); // 获取下周几的日期
      if (moment(weekDate).isBefore(currentDate)) {
        // 这周一过了取下周一的生成时间
        nextWorkingTime = ` ${nextWeekDate} ${time}:00:00`;
      } else if (moment(currentDate).isSame(weekDate)) {
        // 今天刚好是周一
        if (todayGenerTime < currentTime) {
          // 今天生成时间小于当前时间
          nextWorkingTime = ` ${nextWeekDate} ${time}:00:00`;
        } else {
          nextWorkingTime = `${moment().format('YYYY-MM-DD')} ${time}:00:00`;
        }
      } else if (moment(weekDate).isAfter(currentDate)) {
        nextWorkingTime = `${weekDate} ${time}:00:00`;
      }
    } else if (period === 'monthly') {
      const monthDate = this.getMonthDate(date); // 获取这个月第一天/15号/最后一天的日期
      // console.log('monthDate', monthDate);
      // const currentDate = moment().format('YYYY-MM-DD'); // 获取今天的日期
      const nextMonthDate = this.getNextMonthDate(date); // 获取下个月的第一天/15号/最后一天的日期
      if (moment(monthDate).isBefore(currentDate)) {
        nextWorkingTime = `${nextMonthDate} ${time}:00:00`;
      } else if (moment(monthDate).isSame(currentDate)) {
        // 当天就是所选月份的那个日期要比较生成时间和当前时间的时间戳
        if (todayGenerTime < currentTime) {
          nextWorkingTime = `${nextMonthDate} ${time}:00:00`;
        } else {
          nextWorkingTime = `${moment().format('YYYY-MM-DD')} ${time}:00:00`;
        }
      } else if (moment(monthDate).isAfter(currentDate)) {
        nextWorkingTime = `${monthDate} ${time}:00:00`;
      }
    }
    return nextWorkingTime;
  };

  getMonthDate = (dateStr) => {
    let monthDate = '';
    if (dateStr === 'start') {
      monthDate = moment().startOf('month').format('YYYY-MM-DD');
    } else if (dateStr === 'middle') {
      monthDate = `${moment().format('YYYY-MM')}-15`;
    } else if (dateStr === 'finish') {
      monthDate = moment().endOf('month').format('YYYY-MM-DD');
    }
    return monthDate;
  };

  getNextMonthDate = (dateStr) => {
    let nextMonthDate = '';
    if (dateStr === 'start') {
      nextMonthDate = moment().subtract(-1, 'months').startOf('month').format('YYYY-MM-DD'); // 获取下个月的第一天
    } else if (dateStr === 'middle') {
      nextMonthDate = `${moment().subtract(-1, 'months').format('YYYY-MM')}-15`; // 获取下个月的15号
    } else if (dateStr === 'finish') {
      nextMonthDate = moment().subtract(-1, 'months').endOf('month').format('YYYY-MM-DD'); // 获取下个月的最后一天
    }
    return nextMonthDate;
  };

  timePickerChange = (moments) => {
    // console.log('select', moments);
    this.setState({ definedStart: moments[0], definedEnd: moments[1] });
  };

  ontimePiker = (timeStart, timeEnd) => {
    const { form } = this.props;
    // console.log('自定义', moment(timeStart).valueOf(), moment(timeEnd).valueOf());
    this.setState({
      timePickerShow: false,
      definedStart: timeStart,
      definedEnd: timeEnd,
    });
    form.setFieldsValue({
      timeSelected: `${moment(timeStart).format('YYYY-MM-DD HH:mm:ss')}至${moment(timeEnd).format(
        'YYYY-MM-DD HH:mm:ss'
      )}`,
    });
  };

  render() {
    const {
      query,
      taskName,
      taskDes,
      taskTml,
      timeRange,
      groups,
      rank,
      tmlSelected,
      timeSelected,
      groupSelected,
      rankSelected,
      // autoModal,
      taskModal,
      currentHoverRow,
      formVisible,
      editItem,
      hisList,
      modalTitle,
      modalType,
      timePickerShow,
      definedStart,
      definedEnd,
      // commonValue,
    } = this.state;

    const {
      form,
      reportTasks: { autoList },
      loading,
    } = this.props;
    const { recordsTotal, list } = autoList;

    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 3 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 10 },
        sm: { span: 6 },
      },
    };
    return (
      <div className="contentWraper">
        <div className="commonHeader">报表任务</div>
        <div className="TableTdPaddingWrap">
          <div className={styles.contentFirst}>
            <div className={styles.taskTitle}>生成报表</div>
            <div>
              <Form>
                <div>
                  <FormItem {...formItemLayout} label="任务名称">
                    {getFieldDecorator('taskName', {
                      initialValue: taskName || '',
                      rules: [
                        { required: true, message: '请填写任务名称' },
                        { max: 64, message: '名称不能超过64个字符' },
                        { validator: this.validateTaskName },
                      ],
                    })(<Input placeholder="请输入" />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label="报告描述">
                    {getFieldDecorator('taskDes', {
                      initialValue: taskDes || '',
                      rules: [{ max: 512, message: '不能超过512个字符' }],
                    })(
                      <TextArea
                        autosize={{ minRows: 2, maxRows: 6 }}
                        placeholder="描述内容在报告中展示"
                      />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="报表模板">
                    {getFieldDecorator('tmlSelected', {
                      initialValue: tmlSelected || '',
                    })(
                      <Select onChange={this.changeSelect}>
                        {taskTml.map((card) => (
                          <Option key={card.id} value={card.id}>
                            {card.template_name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="时间范围">
                    {getFieldDecorator('timeSelected', {
                      initialValue: timeSelected || '',
                    })(
                      <Select
                        onChange={(e) => {
                          // console.log('e', e);
                          if (e === '自定义') {
                            this.setState({ timePickerShow: 'true', timeSelected: e });
                          }
                        }}
                      >
                        {timeRange.map((card) => (
                          <Option key={card.key} value={card.key}>
                            {card.key}
                          </Option>
                        ))}
                      </Select>
                    )}
                    {timePickerShow && timeSelected === '自定义' && (
                      <div>
                        <RangePicker
                          disabledDate={(current) => current > moment().endOf('day')}
                          // popupClassName={styles['timeRange-picker']}
                          allowClear={false}
                          defaultValue={[moment().subtract(1, 'months'), moment()]}
                          // value={[timeStart, timeEnd]}
                          showTime={{
                            defaultValue: [
                              moment('00:00:00', 'HH:mm:ss'),
                              moment('23:59:59', 'HH:mm:ss'),
                            ],
                          }}
                          format="YYYY-MM-DD HH:mm:ss"
                          onChange={this.timePickerChange}
                          onOk={() => {
                            this.ontimePiker(definedStart, definedEnd);
                          }}
                          onOpenChange={(status) => {
                            if (!status) {
                              this.ontimePiker(definedStart, definedEnd);
                            }
                          }}
                          open
                        />
                      </div>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="包含资产">
                    {getFieldDecorator('groupSelected', {
                      initialValue: groupSelected || 0,
                    })(
                      <Select>
                        {groups.map((card) => (
                          <Option key={card.Fgid} value={card.Fgid}>
                            {card.Fgroup_name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="数据展示">
                    {getFieldDecorator('rankSelected', {
                      initialValue: rankSelected || '',
                    })(
                      <Select onChange={this.changeSelect}>
                        {rank.map((card) => (
                          <Option key={card.key} value={card.value}>
                            {card.key}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </div>
              </Form>
            </div>
            <ButtonBlock btnList={this.btnList} hidePage />
          </div>
          <div className={styles.contentSecond}>
            <div className={styles.taskTitle}>自动任务列表</div>
            <Table
              rowKey="id"
              loading={loading}
              columns={this.columns}
              scroll={{ x: 1100 }}
              dataSource={list}
              pagination={{
                pageSize: query.pageSize,
                current: query.page,
                total: recordsTotal,
              }}
              // pagination={false}
              rowClassName={(record, index) =>
                index === currentHoverRow ? styles.handleAction : ''
              }
              onRow={(record, index) => ({
                onMouseEnter: () => {
                  this.setState({ currentHoverRow: index });
                },
                onMouseLeave: () => {
                  this.setState({ currentHoverRow: '', taskOperation: false });
                },
              })}
            />
            <EditAutoTaskForm
              key={formVisible}
              editItem={editItem}
              tml={taskTml}
              groups={groups}
              visible={formVisible}
              onCancel={this.onFormCancel}
              onSave={this.onFormSave}
              modalTitle={modalTitle}
              modalType={modalType}
              // common={commonValue}
            />
          </div>
          <Modal title="历史任务" width={900} visible={taskModal} onCancel={this.closeTaskModal}>
            <Table rowKey="id" columns={this.taskColumes} dataSource={hisList} />
          </Modal>
        </div>
      </div>
    );
  }
}

const reportTaskForm = Form.create()(reportTask);
export default reportTaskForm;
