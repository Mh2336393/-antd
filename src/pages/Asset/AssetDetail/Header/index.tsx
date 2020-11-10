import React from 'react';
import { Typography } from 'antd';
import { connect} from 'umi';
import styles from './index.less';
import IconIp from '../../images/icon_ip.svg';
import IconMac from '../../images/icon_mac.svg';
import IconVpc from '../../images/icon_vpcid.svg';

interface IAssetHeaderProp {
  hasVpc?: number,
  Fip?:string,
  Fmac?:string,
  Fvpcid?:number
}

const AssetHeader: React.FC<IAssetHeaderProp> = ({ hasVpc,Fip,Fmac,Fvpcid }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <img src={IconIp} alt="" width="48" height="48" />
        <div className={styles.card_content}>
          <p className={styles.title}>资产IP</p>
          <Typography.Paragraph copyable className={styles.desc}>
            {Fip}
          </Typography.Paragraph>
        </div>
      </div>
      <div className={styles.card}>
        <img src={IconMac} alt="" width="48" height="48" />
        <div className={styles.card_content}>
          <p className={styles.title}>MAC</p>
          <Typography.Paragraph copyable className={styles.desc}>
            {Fmac}
          </Typography.Paragraph>
        </div>
      </div>
      {hasVpc === 1 ? (
        <div className={styles.card}>
          <img src={IconVpc} alt="" width="48" height="48" />
          <div className={styles.card_content}>
            <p className={styles.title}>VPCID</p>
            <Typography.Paragraph ellipsis copyable className={styles.desc}>
              {Fvpcid}
            </Typography.Paragraph>
          </div>
        </div>
      ) : null}

    </div>
  );
};

export default connect(({ global }: any) => ({
  hasVpc: global.hasVpc
}))(AssetHeader);


