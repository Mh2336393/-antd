import React, { PureComponent, Fragment } from 'react';
import { connect } from 'umi';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, Select, Spin, Tooltip } from 'antd';
import _ from 'lodash';
import styles from './index.less';
import setClause from '../../tools/setClause';
import esSearch from '../../tools/esSearch';
/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
/* eslint no-param-reassign: ["error", { "props": false }] */

// TODO: es日志筛选
const FormItem = Form.Item;
const { Option } = Select;
class EditFilterSearch extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tempLogFilters: [
        {
          id: Math.floor(Math.random() * 1000000000000),
          condition: 'must',
          patternsField: '_id',
          selectedtype: 'term',
          selectedTypeList: ['term'],
          third_cat: 'input',
        },
      ],
    };
    this.condition = [
      {
        name: '必须包含',
        value: 'must',
      },
      {
        name: '至少包含其一',
        value: 'should',
      },
      {
        name: '不能包含',
        value: 'must_not',
      },
    ];
    this.popoverContent = (
      <div style={{ width: '400px' }}>
        <p>“精确匹配”：用于精确匹配哪些值，比如数字，日期，布尔值或文本数据。</p>
        <p>
          “通配符匹配”：可使用*或者?作为通配符。*可作为多个字符的通配符（含空字符）。？仅为单个字符的通配符。
        </p>
        <p>“开始于”：用于匹配以所输入的字符串开头的内容。</p>
        <p>“缺省”：该字段无值。</p>
        <p>“范围”：数值范围。</p>
      </div>
    );
  }

  componentWillReceiveProps = (nextProps) => {
    const { logFilters } = nextProps;
    if (!_.isEqual(logFilters, this.props.logFilters)) {
      let tempLogFilters;
      if (logFilters.length === 0) {
        tempLogFilters = [
          {
            id: Math.floor(Math.random() * 1000000000000),
            condition: 'must',
            patternsField: '_id',
            selectedtype: 'term',
            selectedTypeList: ['term'],
            third_cat: 'input',
          },
        ];
      } else {
        tempLogFilters = _.cloneDeep(logFilters);
      }
      this.setState({ tempLogFilters });
    }
  };

  getFilterQuery = (values) => {
    const { tempLogFilters } = this.state;
    const { query, filterBlockQuery } = this.props;
    const filter = query.body.query.bool.filter.bool.filter;
    const search = { bool: { filter, must: [], must_not: [], should: [] } };
    // const must = query.body.query.bool.must;
    // search.bool.must.push(must[must.length - 1]);
    tempLogFilters.forEach((item) => {
      const id = item.id;
      const bool = item.condition || 'should';
      const field = item.patternsField || '_all';
      let op = item.selectedtype || 'match_all';
      let value = {};
      if (field === 'match_all') {
        op = 'match_all';
      } else if (op === 'range') {
        const lowqual = values[`lowqual_${id}`];
        const highqual = values[`highqual_${id}`];
        if (lowqual) {
          value[values[`lowop_${id}`]] = lowqual;
        }
        if (highqual) {
          value[values[`highop_${id}`]] = highqual;
        }
      } else {
        value = values[`qual_${id}`];
      }
      item.value = value;
      setClause(value, field, op, bool, search);
    });
    if (filterBlockQuery) {
      filterBlockQuery(tempLogFilters, search);
    }
  };

  deleteFilter = (index) => {
    const { tempLogFilters } = this.state;
    // if (tempLogFilters.length === 1) {
    //   message.error('至少需要一条规则');
    // } else {
    //   tempLogFilters.splice(index, 1);
    //   this.setState({ tempLogFilters });
    // }
    tempLogFilters.splice(index, 1);
    this.setState({ tempLogFilters: [].concat(tempLogFilters) });
  };

  changePatternsField = (value, id) => {
    const { tempLogFilters } = this.state;
    const logFilter = tempLogFilters.filter((item) => item.id === id);
    console.log('logFilter', logFilter);
    const { fieldType } = this.props;
    const type = fieldType[value];
    const newSelectedType = esSearch.getSelectedType(type);
    logFilter[0].patternsField = value;
    logFilter[0].selectedTypeList = newSelectedType;
    logFilter[0].selectedtype = newSelectedType[0];
    logFilter[0].third_cat = esSearch.changeQueryOpHandler(newSelectedType[0]);
    logFilter[0].value = '';
    //  通过setState()不管用是因为 initialValue 设置只执行一次，需要手动设置级联内容的值
    this.setState({ tempLogFilters });
    this.props.form.setFieldsValue({
      [`selectedtype_${id}`]: newSelectedType[0],
    });
  };

  changeSelectType = (value, id) => {
    const { tempLogFilters } = this.state;
    const logFilter = tempLogFilters.filter((item) => item.id === id);
    logFilter[0].selectedtype = value;
    logFilter[0].third_cat = esSearch.changeQueryOpHandler(value);
    this.setState({ tempLogFilters });
  };

  changeCondition = (condition, index) => {
    const { tempLogFilters } = this.state;
    tempLogFilters[index].condition = condition;
    this.setState({ tempLogFilters });
  };

  addFilter = () => {
    const { searchArr, fieldType } = this.props;
    const patternsField = searchArr[0];
    const type = fieldType[patternsField];
    const selectedTypeList = esSearch.getSelectedType(type);
    const addItem = [
      {
        id: Math.floor(Math.random() * 1000000000000),
        condition: 'must',
        patternsField,
        selectedtype: selectedTypeList[0],
        selectedTypeList,
        third_cat: esSearch.changeQueryOpHandler(selectedTypeList[0]),
      },
    ];
    this.setState((preState) => ({
      tempLogFilters: preState.tempLogFilters.concat(addItem),
    }));
  };

  submitFilter = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.getFilterQuery(values);
      }
    });
  };

  render() {
    const { visible, onCancel, searchArr: fieldArr, form } = this.props;
    const { tempLogFilters } = this.state;
    const { getFieldDecorator } = form;

    // console.log("tempLogFilters~~~~~~~~", tempLogFilters);
    // console.log('条件搜索渲染了');
    return (
      <Modal
        title="编辑搜索条件"
        visible={visible}
        onOk={this.submitFilter}
        onCancel={onCancel}
        width={1000}
      >
        <div>
          <Form>
            <div className={styles.addFilterWrap}>
              <a onClick={this.addFilter} className={styles['add-filter']}>
                <PlusOutlined /> 添加新的筛选项
              </a>
              <Tooltip
                placement="rightTop"
                title={this.popoverContent}
                overlayClassName="helpTooltip"
              >
                <span className={styles.iconHelp} />
              </Tooltip>
            </div>
            <div className={styles['filter-block']}>
              {fieldArr.length > 0 ? (
                tempLogFilters.map((item, index) => (
                  <div key={`${item.patternsField}_${item.id}`} className={styles['filter-item']}>
                    <div className={styles['filter-content']}>
                      <FormItem style={{ marginRight: 10 }}>
                        {getFieldDecorator(`condition_${item.id}`, {
                          initialValue: item.condition || this.condition[0].value,
                        })(
                          <Select
                            onChange={(value) => {
                              this.changeCondition(value, index);
                            }}
                          >
                            {this.condition.map((con) => (
                              <Option key={con.value} value={con.value}>
                                {con.name}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                      <FormItem style={{ marginRight: 10, width: 300 }}>
                        {getFieldDecorator(`patternsField_${item.id}`, {
                          initialValue: item.patternsField || fieldArr[0] || '',
                        })(
                          <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            onChange={(value) => {
                              this.changePatternsField(value, item.id);
                            }}
                          >
                            {fieldArr.map((field) => (
                              <Option key={field} value={field}>
                                {field}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                      {item.selectedTypeList.length && (
                        <FormItem key={item.patternsField} style={{ marginRight: 10 }}>
                          {getFieldDecorator(`selectedtype_${item.id}`, {
                            initialValue:
                              item.selectedTypeList.indexOf(item.selectedtype) >= 0
                                ? item.selectedtype
                                : item.selectedTypeList[0],
                          })(
                            <Select
                              style={{ width: 120 }}
                              key={item.patternsField}
                              onChange={(value) => {
                                this.changeSelectType(value, item.id);
                              }}
                            >
                              {item.selectedTypeList.map((type) => (
                                <Option key={type} value={type}>
                                  {esSearch.logTypeName[type]}
                                </Option>
                              ))}
                            </Select>
                          )}
                        </FormItem>
                      )}
                      {item.third_cat === 'input' && (
                        <FormItem style={{ marginRight: 10 }}>
                          {getFieldDecorator(`qual_${item.id}`, {
                            initialValue: item.value || '',
                            rules: [{ required: true, message: '请填写内容' }],
                          })(<Input style={{ width: 260 }} />)}
                        </FormItem>
                      )}
                      {item.third_cat === 'range' && (
                        <Fragment>
                          <FormItem style={{ marginRight: 10 }}>
                            {getFieldDecorator(`lowop_${item.id}`, {
                              initialValue:
                                item.value && typeof item.value === 'object'
                                  ? Object.keys(item.value)[0]
                                  : 'gt',
                            })(
                              <Select style={{ width: 80 }}>
                                <Option value="gt">大于</Option>
                                <Option value="gte">大于等于</Option>
                              </Select>
                            )}
                          </FormItem>
                          <FormItem style={{ marginRight: 10 }}>
                            {getFieldDecorator(`lowqual_${item.id}`, {
                              initialValue: item.value ? item.value.gt || item.value.gte : '',
                              rules: [{ required: true, message: '请填写内容' }],
                            })(<Input />)}
                          </FormItem>
                          <FormItem style={{ marginRight: 10 }}>
                            {getFieldDecorator(`highop_${item.id}`, {
                              initialValue:
                                item.value && typeof item.value === 'object'
                                  ? Object.keys(item.value)[1]
                                  : 'lt',
                            })(
                              <Select style={{ width: 80 }}>
                                <Option value="lt">小于</Option>
                                <Option value="lte">小于等于</Option>
                              </Select>
                            )}
                          </FormItem>
                          <FormItem style={{ marginRight: 10 }}>
                            {getFieldDecorator(`highqual_${item.id}`, {
                              initialValue: item.value ? item.value.lt || item.value.lte : '',
                              rules: [{ required: true, message: '请填写内容' }],
                            })(<Input />)}
                          </FormItem>
                        </Fragment>
                      )}
                    </div>
                    <div
                      className={styles['delete-btn']}
                      onClick={() => {
                        this.deleteFilter(index);
                      }}
                    >
                      移除
                    </div>
                  </div>
                ))
              ) : (
                <Spin />
              )}
            </div>
          </Form>
        </div>
      </Modal>
    );
  }
}

export default connect(({ search }) => ({
  search,
}))(Form.create()(EditFilterSearch));
