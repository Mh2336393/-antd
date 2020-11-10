import React, { useState, useEffect } from 'react';
import { connect} from 'umi';
import { Drawer, Spin, Tag } from 'antd';
import AssetHeader from './Header';
import AssetRegisterPanel from './AssetRegisterPanel';
import AssetDiscoverPanel from './AssetDiscoverPanel';
import AssetFlowPanel from './AssetFlowPanel';
import AssetSafePanal from './AssetSafePanal';

interface IAssetDetailProp {
  Fasset_id: string;
  width?: number;
  isvisible: boolean;
  onClose?: () => void;
  state?: any;
  dispatch?: any;
  loadingFetchAssetInfo?: boolean;
  auth:string;// 页面调用者的权限 必传
}

const AssetDetail: React.FC<IAssetDetailProp> = ({
  Fasset_id,
  width = 960,
  isvisible,
  onClose = () => { },
  state,
  dispatch,
  loadingFetchAssetInfo,
  auth,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string | React.ReactNode>('');

  useEffect(() => {
    dispatch({
      type: 'asset/fetchAssetConfig',
    });
  }, []);

  useEffect(() => {
    setTitle(
      <div className="v2-yujie-flex row">
        <p>{state.asset?.Fasset_name ?? ''}</p>
        {state.asset?.discover?.Fis_dhcp ? (
          <Tag style={{ marginLeft: 12 }} color="geekblue">
            {state.asset?.discover?.Fis_dhcp}
          </Tag>
        ) : null}
      </div>
    );
  }, [JSON.stringify(state.asset)]);

  useEffect(() => {
    setVisible(isvisible);
  }, [isvisible]);

  useEffect(() => {
    if (Fasset_id) {
      dispatch({
        type: 'asset/fetchAssetInfo',
        payload: {
          Fasset_id,
        },
      });
    }
  }, [Fasset_id]);

  function handleOnClose() {
    onClose();
  }

  return (
    <Drawer
      bodyStyle={{ padding: 18 }}
      title={title}
      width={width}
      visible={visible}
      onClose={handleOnClose}
      // destroyOnClose
    >
      <Spin spinning={loadingFetchAssetInfo}>
        <AssetHeader
          Fip={state.asset?.Fip}
          Fmac={state.asset?.Fmac}
          Fvpcid={state.asset?.Fvpcid}
        />
        {/* 资产注册信息一定展示 */}
        <AssetRegisterPanel />

        {/* 有资产发现得数据才会展示 */}
        {state.asset?.discover ? <AssetDiscoverPanel
          Fhost_name={state.asset?.discover?.Fhost_name}
          Fdomain_name={state.asset?.discover?.Fdomain_name}
          Fport={state.asset?.discover?.Fport}
          Fos_type={state.asset?.discover?.Fos_type}
          Finsert_time={state.asset?.dicover?.Finsert_time}
          Fupdate_time={state.asset?.discover?.Fupdate_time}
          Fcomponent_info={state.asset?.discover?.Fcomponent_info}
        /> : null}
        <AssetSafePanal auth={auth}/>
        <AssetFlowPanel />
      </Spin>
    </Drawer>
  );
};

export default connect(({ loading, asset }: any) => ({
  state: asset,
  loadingFetchAssetInfo: loading.effects['asset/fetchAssetInfo'] || false,
}))(AssetDetail);
