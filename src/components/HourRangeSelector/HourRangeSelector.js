import React, { Component } from 'react';
import { Row, Col, Button, message, Card, InputNumber } from 'antd';
// import moment from 'moment';
import styles from './HourRangeSelector.less';
// const format = 'YYYY-MM-DD HH:mm:ss';

class HourRangeSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeStart: 0,
      timeEnd: 24,
    };
  }



  /**
   * @param {number} value
   * @param {string} mode 模式字符串
   */
  onChange = (value, mode) => {
    if (mode === "开始") {
      this.setState({ timeStart: value })
    } else if (mode === "结束") {
      this.setState({ timeEnd: value })
    }
  }

  handleClose = () => {
    const { measurementItemKey, onClose } = this.props
    const { timeStart, timeEnd } = this.state
    const re = /^[0-9]{1,2}$/
    if (!re.test(timeStart) || !re.test(timeEnd)) {
      message.error("请输入数字类型")
      return
    }
    // 开始时间在结束时间之后或者相等不允许这样设置
    if (timeStart >= timeEnd) {
      message.error("开始时间必须小于结束时间！")
      return
    }


    onClose(measurementItemKey, timeStart, timeEnd)
    
  }
  // let flag=false
  // const timeDiv =document.getElementsByClassName("select-range-time")[0]

  // console.log(timeDiv.className)
  // if(timeDiv.className!=="select-range-time"){
  // flag=false
  // }

  render() {
    const { timeStart, timeEnd } = this.state
    return (
      <div className="select-range-time" onMouseLeave={() => { this.handleClose('开始')}}> 
        <Card title="请选择时间" extra={<Button size="small" type="primary" onClick={() => { this.handleClose('开始') }}>确定</Button>}>
          <Row>
            <Col style={{ lineHeight: "32px" }} span={5} className={styles.a}>
              <p>时间段：</p>
            </Col>
            <Col span={8} className={styles.b}>
              <InputNumber
                style={{ width: "100%" }}
                value={timeStart}
                min={0}
                max={23}
                step={1}
                onChange={(value) => { this.onChange(value, '开始') }}
              />
            </Col>
            <Col style={{ lineHeight: "32px", textAlign: "center" }} span={3} className={styles.a}>
              <p>至</p>
            </Col>
            <Col span={8} className={styles.c}>
              <InputNumber
                style={{ width: "100%" }}
                value={timeEnd}
                min={1}
                max={24}
                step={1}
                onChange={(value) => { this.onChange(value, '结束') }}
              />
            </Col>
          </Row>
        </Card>

      </div>
    );
  }
}

export default HourRangeSelector;
