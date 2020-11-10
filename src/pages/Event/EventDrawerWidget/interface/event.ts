export type IEvent = {
  ai_scene: string;
  alert: IEventAlert;
  alert_id: number;
  alert_mode: string;
  app_proto: string;
  asset_ip: string;
  attack_result: string;
  attack_state: string;
  attacker_ip: string;
  confidence: number;
  direction: string;
  dst_info: string;
  dst_ip: string[];
  dst_mac: string;
  dst_port: number;
  event_type: string;
  flow_id: number;
  original_id: string;
  proto: string;
  score: number;
  sensor_id: string;
  severity: number;
  src_info: string;
  src_ip: string;
  src_mac: string;
  src_port: number;
  store_pkt: boolean;
  timestamp: string;
  tx_id: number;
  victim_ip: string;
  ccsName: string;
};

export type IEventAlert = {
  actual_value: number;
  category: string;
  gid: number;
  over_range: number;
  rule_type: string;
  signature: string;
  signature_id: number;
  statistic: Record<string, any>;
  sub_category: string;
  suggestion: string;
  threshold: number;
};

export type IEventByte = {
  bytes_in: number;
  bytes_out: number;
  fps: number;
  pkts_in: number;
  pkts_out: number;
};
