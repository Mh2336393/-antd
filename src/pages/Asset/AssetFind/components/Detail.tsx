import React, { useState, useEffect } from 'react';
import { connect} from 'umi';
import { Drawer, Spin, Tag } from 'antd';
import AssetHeader from '../../AssetDetail/Header';
import AssetDiscoverPanel from '../../AssetDetail/AssetDiscoverPanel';

interface IAssetDetailProp {
  Fid: string;
  width?: number;
  isvisible: boolean;
  onClose?: () => void;
  state?: any;
  dispatch?: any;
  loading?: any;
}

const AssetFindDetail: React.FC<IAssetDetailProp> = ({
  Fid,
  width = 960,
  isvisible,
  onClose = () => { },
  state,
  dispatch,
  loading,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string | React.ReactNode>('');

  useEffect(() => {
    setTitle(
      <div className="v2-yujie-flex row">
        <p>{state.detailItem?.Fip ?? ''}</p>
        {state.detailItem?.Fis_dhcp ? (
          <Tag style={{ marginLeft: 12 }} color="geekblue">
            {state.detailItem?.Fis_dhcp}
          </Tag>
        ) : null}
      </div>
    );
  }, [JSON.stringify(state.detailItem)]);

  useEffect(() => {
    setVisible(isvisible);
  }, [isvisible]);

  useEffect(() => {
    if (Fid) {
      dispatch({
        type: 'assetFind/getAssetDetail',
        payload: {
          Fid,
        },
      });
    }
  }, [Fid]);

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
      destroyOnClose
    >
      <Spin spinning={loading.effects['assetFind/getAssetDetail']}>
        <AssetHeader
          Fip={state.detailItem?.Fip}
          Fmac={state.detailItem?.Fmac}
          Fvpcid={state.detailItem?.Fvpcid}
        />
        <AssetDiscoverPanel
          Fhost_name={state.detailItem?.Fhost_name}
          Fdomain_name={state.detailItem?.Fdomain_name}
          Fport={state.detailItem?.Fport}
          Fos_type={state.detailItem?.Fos_type}
          Finsert_time={state.asset?.dicover?.Finsert_time}
          Fupdate_time={state.detailItem?.Fupdate_time}
          Fcomponent_info={state.detailItem?.Fcomponent_info}
        />
      </Spin>
    </Drawer>
  );
};

export default connect(({ loading, assetFind }: any) => ({
  state: assetFind,
  loading,
}))(AssetFindDetail);
