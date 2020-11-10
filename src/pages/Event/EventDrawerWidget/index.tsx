import React, {
  ForwardRefRenderFunction,
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
  ReactNode,
} from 'react';
import DrawerWidget from '@/components/Widget/DrawerWidget';
import { omit, pick } from 'lodash';
import Header from './Header';
import Description from './Description';
import Asset from './Asset';
import AssetException from './AssetException';
import AssetStatus from './AssetStatus';
import { IEvent } from './interface/event';

export interface IEventDrawerWidgetAction {
  open: () => void;
  close: () => void;
  setTitle: (value: string) => void;
  setRecord: (record: IEvent) => void;
}

export interface IEventDrawerWidgetProp {
  onClose?: () => void;
  // dispatch?: any;
}
// 函数类型（用接口来描述函数类型）
// 当你想规范函数行为的时候可用，（规范参数列表和返回值）
const EventDrawerWidget: ForwardRefRenderFunction<
  IEventDrawerWidgetAction,
  IEventDrawerWidgetProp> = ({
    onClose = () => { },
    // dispatch,
  }, ref) => {
    const [visibile, setVisible] = useState<boolean>(false);
    const [title, setTitle] = useState<string | ReactNode>('');
    const [record, setRecord] = useState<Partial<IEvent>>({});

    useEffect(() => {
      if (!visibile) {
        onClose();
      }
      return () => { };
    }, [visibile]);

    // useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值。
    // 在大多数情况下，应当避免使用 ref 这样的命令式代码。useImperativeHandle 应当与 forwardRef 一起使用：
    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
      },
      close: () => {
        setVisible(false);
      },
      setTitle: (value: string) => {
        setTitle(value);
      },
      setRecord: (value: IEvent) => {
        setRecord(value);
      },
    }));



    return (
      <DrawerWidget
        width={960}
        visible={visibile}
        title={title}
        contentStyle={{ padding: 20 }}
        onClose={() => {
          setVisible(false);
        }}
      >
        <Header
          ip={record?.asset_ip}
          threshold={record.alert?.threshold}
          actual_value={record?.alert?.actual_value}
          over_range={record?.alert?.over_range}
          app_proto={record?.app_proto || record?.proto}
        />
        <Description
          asset_ip={record?.asset_ip}
          level={record?.score}
          app_proto={record?.app_proto || record?.proto}
          proto={record?.proto}
          alert_mode={record?.alert_mode}
          suggestion={record?.alert?.suggestion}
          time={record?.timestamp}
        />
        <Asset
          dataSource={omit(record?.alert?.statistic, ['ip_list', 'actual_curve', 'baseline_curve', 'threshold'])}
          app_proto={record?.app_proto || record?.proto}
          asset_ip={record?.asset_ip}
          timestamp={record?.timestamp}
        />
        <AssetException
          dataSource={pick(record?.alert?.statistic, ['actual_curve', 'baseline_curve', 'threshold'])}
          timestamp={record?.timestamp}
        />
        <AssetStatus
          asset_ip={record?.asset_ip}
          scene={record?.ai_scene}
          alertMode={record?.alert_mode}
          ccsName={record?.ccsName || ''}
        />


      </DrawerWidget>
    );
  };

export default forwardRef(EventDrawerWidget);
