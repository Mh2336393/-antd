/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-return-assign */
/* eslint-disable consistent-return */

import React from 'react';
import { Input, Select, InputNumber, Progress } from 'antd';
import styles from './index.less';

const { TextArea } = Input;
const { Option } = Select;

class CardWrap extends React.PureComponent {
  state = {
    editing: false,
    isHover: false,
    // state: this.props.defaultValue
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.defaultValue });
  }

  onChange = value => {
    this.setState({ value });
  };

  getComponentByType = (type, formItem) => {
    if (!type || type === 'input') {
      return (
        <Input value={this.state.value} onChange={this.onChange} placeholder={formItem.placeholder} disabled={formItem.disabled || false} />
      );
    }
    if (type === 'inputNumber') {
      const formatter = formItem.formatter ? formItem.formatter : null;
      return (
        <InputNumber
          value={this.state.value}
          onChange={this.onChange}
          ref={ref => (this.componentRef = ref)}
          placeholder={formItem.placeholder}
          disabled={formItem.disabled || false}
          min={formItem.min || 0}
          max={formItem.max || 100}
          step={formItem.step || 1}
          parser={value => value.replace(/[,.$@]/g, '')}
          formatter={formatter}
        />
      );
    }
    if (type === 'select') {
      return (
        <Select disabled={formItem.disabled || false} value={this.state.value} onChange={this.onChange}>
          {formItem.options.map(item => (
            <Option key={item.key} value={item.key}>
              {item.value}
            </Option>
          ))}
        </Select>
      );
    }
    if (type === 'textArea') {
      return <TextArea value={this.state.value} onChange={this.onChange} placeholder={formItem.placeholder} row={formItem.row || 4} />;
    }
  };

  edit = () => {
    this.setState({ editing: true });
  };

  save = () => {
    const { onSave, data } = this.props;
    // console.log('this.value::::::', this.componentRef.inputNumberRef);
    console.log(this.state.value);
    onSave({ [data.key]: this.state.value || 0 }, () => {
      this.setState({ editing: false });
    });
  };

  cancel = () => {
    this.setState({ editing: false });
  };

  onmouseenter = () => {
    const { disabled } = this.props;
    if (!disabled) {
      this.setState({ isHover: true });
    }
  };

  onmouseleave = () => {
    this.setState({ isHover: false });
  };

  render() {
    const { editing, isHover } = this.state;
    const { data, defaultValue, wrapstyle, footerType = 'progress' } = this.props;
    const percentVal = data.label === 'cpu负载告警阈值' ? (defaultValue / data.max) * 100 : defaultValue;
    // console.log(94, percentVal);
    return (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px 24px',
          border: '1px solid #EAEDF3',
          height: '142px',
          ...wrapstyle,
        }}
      >
        <p className={styles.title}>{data.label}</p>
        <div className={styles.valueWrap} onMouseEnter={this.onmouseenter} onMouseLeave={this.onmouseleave}>
          {editing ? (
            <span className={styles.component}>{this.getComponentByType(data.type, data)}</span>
          ) : (
            <span className={styles.value}>{defaultValue}</span>
          )}
          <span className={styles.unit}>{data.unit}</span>
          <span className={styles.edit}>
            {editing ? (
              <span>
                <span onClick={this.cancel} style={{ paddingRight: '10px' }}>
                  取消
                </span>
                <span onClick={this.save}>完成</span>
              </span>
            ) : isHover ? (
              <span onClick={this.edit}>编辑</span>
            ) : (
              ''
            )}
          </span>
        </div>
        {footerType && (
          <div className={styles.footer}>
            {footerType === 'progress' && (
              <Progress size="small" percent={percentVal} format={() => ''} strokeLinecap="square" strokeColor="#5075FF " />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default CardWrap;
