import React, { useState, useEffect } from 'react';
import { connect} from 'umi';
import { Select } from 'antd';
import styles from './index.less';
import CardPanel from '../CardPanel';
import LineChart, { IColor } from '../LineChart';

interface IAssetFlowPanelProp {
  state?: any;
  dispatch?: any;
  loading?: any;
}

type IStatus = 'up' | 'down';

const AssetFlowPanel: React.FC<IAssetFlowPanelProp> = ({ state, dispatch, loading }) => {
  const [time, setTime] = useState<string>('');
  const [status, setStatus] = useState<IStatus>('up');
  const [type, setType] = useState<string>(''); // 当前操作的flow类型

  function renderChart(dataSource, legend: boolean, color?: IColor) {
    return (
      <LineChart
        moduleName="资产流量状态"
        color={color}
        tickCount={5}
        format="MM/DD HH:mm"
        dataSource={
          dataSource?.map(item => {
            if (legend) {
              return {
                time: item.time,
                count: item.sum,
                type: item.type.toUpperCase(),
              };
            }
            return {
              time: item.time,
              count: item.sum,
            };
          }) ?? []
        }
      />
    );
  }

  const panels = [
    {
      title: '总体流量上行趋势',
      type: 'flow_up',
      extra: false,
      component: renderChart(state.statics?.flow_up?.rows, false, 'flow'),
    },
    {
      title: '总体流量下行趋势',
      type: 'flow_down',
      extra: false,
      component: renderChart(state.statics?.flow_down?.rows, false, 'flow'),
    },
    {
      title: '四层上下行流量趋势',
      type: 'four',
      extra: true,
      component: renderChart(state.statics?.four?.rows, true, 'four'),
    },
    {
      title: '七层上下行流量趋势',
      type: 'seven',
      extra: true,
      component: renderChart(state.statics?.seven?.rows, true, 'seven'),
    },
    {
      title: '报文速率趋势',
      type: 'message',
      extra: true,
      component: renderChart(state.statics?.message?.rows, false, 'message'),
    },
    {
      title: '会话频率趋势',
      type: 'conversation',
      extra: false,
      component: renderChart(state.statics?.conversation?.rows, true, 'coversation'),
    },
  ];

  useEffect(() => {
    if (time && state.asset?.Fip) {
      const types = panels.map(item => item.type);
      // debugger
      types.forEach(item => {
        dispatch({
          type: 'asset/fetchAssetFlowStatic',
          payload: {
            Ftype: item,
            Fip: state.asset?.Fip,
            Ftime: time,
            Fstatus: status,
          },
        });
      });
    }
  }, [state.asset?.Fip, time]);


  useEffect(() => {
    setTime(state.config?.flow?.[0]?.key);
  }, [JSON.stringify(state.config?.flow)]);

  useEffect(() => {
    if (type && time) {
      dispatch({
        type: 'asset/fetchAssetFlowStatic',
        payload: {
          Ftype: type,
          Fip: state.asset?.Fip,
          Ftime: time,
          Fstatus: status,
        },
      });
    }
  }, [type, status]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h4 className={styles.title}>资产流量状态</h4>
        <Select
          value={time}
          className={styles.time_panel}
          onChange={value => {
            setTime(value);
          }}
        >
          {state.config?.flow?.map(item => {
            return (
              <Select.Option value={item.key} key={item.key}>
                {item.value}
              </Select.Option>
            );
          })}
        </Select>
      </header>
      <section className={styles.content}>
        {panels.map(item => {
          return (
            <CardPanel
              width={item.type === 'four' || item.type === 'seven' ? '100%' : '49.2%'}
              key={`${item.type}_${item.title}`}
              loading={loading.effects['asset/fetchAssetFlowStatic'] && item.type === type}
              title={item.title}
              extra={item.extra}
              onExtraChange={value => {
                setStatus(value as IStatus);
                setType(item.type);
              }}
            >
              {item.component}
            </CardPanel>
          );
        })}
      </section>
    </div>
  );
};

export default connect(({ asset, loading }: any) => ({
  state: asset,
  loading,
}))(AssetFlowPanel);
