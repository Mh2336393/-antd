import React from 'react';
import { Select, Spin } from 'antd';
import styles from './index.less';

interface ICardPanelProp {
  width?: number|string;
  height?: number|string;
  title: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  wrapperStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  onExtraChange?: (value: string) => void;
  loading?: boolean;
}

const CardPanel: React.FC<ICardPanelProp> = ({
  title,
  extra,
  children,
  width = "49.2%",
  height = 300,
  wrapperStyle,
  bodyStyle,
  onExtraChange = () => { },
  loading = false,
}) => {
  function renderExtra() {
    if (typeof extra === 'function') {
      return (
        <div className={styles.extra}>{extra()}</div>
      );
    }

    if (typeof extra === 'boolean') {
      if (!extra) {
        return null;
      }
    }

    return (
      <Select
        className={styles.extra}
        defaultValue="up"
        onChange={value => {
          onExtraChange(value);
        }}
      >
        <Select.Option value="up">上行</Select.Option>
        <Select.Option value="down">下行</Select.Option>
      </Select>
    );
  }

  return (
    <div
      className={styles.card_wrapper}
      style={{
        width,
        height,
        ...wrapperStyle,
      }}
    >
      <Spin spinning={loading}>
        <header className={styles.card_header}>
          <p className={styles.card_title}>{title}</p>
          {renderExtra()}
        </header>
        <section className={styles.card_content} style={{ ...bodyStyle }}>
          {children}
        </section>
      </Spin>
    </div>
  );
};

export default CardPanel;
