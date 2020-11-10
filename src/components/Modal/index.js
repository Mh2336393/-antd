import { Modal } from 'antd';
import React from 'react';

const LogModal = props => {
  const { title, visible, data, setModalVisable } = props;
  return (
    <Modal
      title={title}
      visible={visible}
      onOk={() => {
        setModalVisable(false, data);
      }}
      onCancel={() => {
        setModalVisable(false, data);
      }}
    >
      <ul>
        {data.map(item => (
          <li key={item}>
            <a href={`/api/dashboard/platformLog?key=${item.key}&name=${item.file}`}>
              日志详情
              <span style={{ padding: '0px 5px' }}>{item.key}</span>
              <span style={{ padding: '0px 5px' }}>{item.time}</span>
            </a>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default LogModal;
