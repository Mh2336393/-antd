import React from 'react';
import moment from 'moment';
import { Descriptions } from 'antd';
import { connect} from 'umi';
import styles from './index.less';
import configSettings from '@/configSettings';

interface IAssetRegisterPanelProp {
  state?: any;
}

const AssetRegisterPanel: React.FC<IAssetRegisterPanelProp> = ({ state }) => {
  return (
    <div className={styles.wrapper}>
      <Descriptions title="资产注册信息" size="middle" column={3} bordered>
        <Descriptions.Item label="资产类型" >
          {configSettings.assetValueMap.Fcategory[state.asset?.Fcategory]}
        </Descriptions.Item>
        <Descriptions.Item label="资产分组">{state.asset?.Fgroup_name}</Descriptions.Item>
        <Descriptions.Item label="资产来源">
          {configSettings.assetValueMap.Fsource[state.asset?.Fsource]}
        </Descriptions.Item>
        <Descriptions.Item label="操作系统">
          {state.asset?.Fos_type?.split(',')
            .filter(item => item)
            .join(',')}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {moment(state.asset?.Finsert_time).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {moment(state.asset?.Fupdate_time).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default connect(({ asset }: any) => ({
  state: asset,
}))(AssetRegisterPanel);
