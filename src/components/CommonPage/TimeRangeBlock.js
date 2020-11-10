import React from 'react';
import moment from 'moment';
import { Col } from 'antd';
import TimeRangePicker from '@/components/TimeRangePicker';

const TimeRangeBLock = ({ query: { startTime, endTime }, timeRange, timePickerOnchange, customOptions }) => (
  <Col span={2}>
    <TimeRangePicker
      timeRange={timeRange}
      startTime={startTime}
      endTime={endTime}
      timePickerOnchange={timePickerOnchange}
      customOptions={customOptions}
    />
  </Col>
);
export default TimeRangeBLock;
