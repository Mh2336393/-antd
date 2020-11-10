// @ts-nocheck
import { IRoute } from '@umijs/core';
import { AnyAction } from 'redux';
import React from 'react';
import { EffectsCommandMap, SubscriptionAPI } from 'dva';
import { match } from 'react-router-dom';
import { Location, LocationState, History } from 'history';

export * from 'D:/UGit/yujie_web/client/src/models/advancedAnalysis';
export * from 'D:/UGit/yujie_web/client/src/models/attackChainDetail';
export * from 'D:/UGit/yujie_web/client/src/models/attackVictimProfile';
export * from 'D:/UGit/yujie_web/client/src/models/block';
export * from 'D:/UGit/yujie_web/client/src/models/config';
export * from 'D:/UGit/yujie_web/client/src/models/global';
export * from 'D:/UGit/yujie_web/client/src/models/iocDetail';
export * from 'D:/UGit/yujie_web/client/src/models/list';
export * from 'D:/UGit/yujie_web/client/src/models/login';
export * from 'D:/UGit/yujie_web/client/src/models/messageCenter';
export * from 'D:/UGit/yujie_web/client/src/models/msgNotify';
export * from 'D:/UGit/yujie_web/client/src/models/platform';
export * from 'D:/UGit/yujie_web/client/src/models/project';
export * from 'D:/UGit/yujie_web/client/src/models/setting';
export * from 'D:/UGit/yujie_web/client/src/models/sourceAccess';
export * from 'D:/UGit/yujie_web/client/src/models/user';
export * from 'D:/UGit/yujie_web/client/src/pages/Analysis/CaughtTask/models/caughtTask';
export * from 'D:/UGit/yujie_web/client/src/pages/Analysis/Search/models/search';
export * from 'D:/UGit/yujie_web/client/src/pages/Asset/models/asset';
export * from 'D:/UGit/yujie_web/client/src/pages/Asset/models/assetFind';
export * from 'D:/UGit/yujie_web/client/src/pages/Asset/models/assetGroup';
export * from 'D:/UGit/yujie_web/client/src/pages/Asset/models/assetList';
export * from 'D:/UGit/yujie_web/client/src/pages/Asset/models/segment';
export * from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/dashboardDns';
export * from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/dataLeakage';
export * from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/debugConfig';
export * from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/dnsViewAll';
export * from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/emailSafe';
export * from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/EmailViewAll';
export * from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/overview';
export * from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/sourceMonitor';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/alertDetail';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/aptDetail';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/aptUpload';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventAnalysis';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventFall';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventFile';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventInvasion';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventOverview';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventPropertyRisk';
export * from 'D:/UGit/yujie_web/client/src/pages/Event/models/scanRule';
export * from 'D:/UGit/yujie_web/client/src/pages/Exception/models/error';
export * from 'D:/UGit/yujie_web/client/src/pages/Messagecenter/models/noticeStrategy';
export * from 'D:/UGit/yujie_web/client/src/pages/Messagecenter/models/safety';
export * from 'D:/UGit/yujie_web/client/src/pages/Messagecenter/models/systemAccess';
export * from 'D:/UGit/yujie_web/client/src/pages/Report/models/eventHandle';
export * from 'D:/UGit/yujie_web/client/src/pages/Report/models/reportApt';
export * from 'D:/UGit/yujie_web/client/src/pages/Report/models/reportLists';
export * from 'D:/UGit/yujie_web/client/src/pages/Report/models/reportTasks';
export * from 'D:/UGit/yujie_web/client/src/pages/Report/models/templateFstPreview';
export * from 'D:/UGit/yujie_web/client/src/pages/Screen/models/safetyAware';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/audit';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/auth';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/ccsConfig';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/clound';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/networkSegment';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/propertyFind';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/propertyMgr';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/sandboxData';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/sysLog';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/userManger';
export * from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/version';
export * from 'D:/UGit/yujie_web/client/src/pages/Tactics/models/selfIoc';
export * from 'D:/UGit/yujie_web/client/src/pages/Tactics/models/tacticsInvasion';
export * from 'D:/UGit/yujie_web/client/src/pages/Tactics/models/tacticsSafeStrategy';
export * from 'D:/UGit/yujie_web/client/src/pages/Tactics/models/whiteListIpAndIoc';
export * from 'D:/UGit/yujie_web/client/src/pages/Topic/models/accountSecurity';
export * from 'D:/UGit/yujie_web/client/src/pages/Topic/models/accountViewAll';

export interface Action<T = any> {
  type: T
}

export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A
) => S;

export type ImmerReducer<S = any, A extends Action = AnyAction> = (
  state: S,
  action: A
) => void;

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap,
) => void;

/**
 * @type P: Type of payload
 * @type C: Type of callback
 */
export type Dispatch = <P = any, C = (payload: P) => void>(action: {
  type: string;
  payload?: P;
  callback?: C;
  [key: string]: any;
}) => any;

export type Subscription = (api: SubscriptionAPI, done: Function) => void | Function;

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    [key: string]: any;
  };
}

/**
 * @type P: Params matched in dynamic routing
 */
export interface ConnectProps<
  P extends { [K in keyof P]?: string } = {},
  S = LocationState,
  T = {}
> {
  dispatch?: Dispatch;
  // https://github.com/umijs/umi/pull/2194
  match?: match<P>;
  location: Location<S> & { query: T };
  history: History;
  route: IRoute;
}

export type RequiredConnectProps<
  P extends { [K in keyof P]?: string } = {},
  S = LocationState,
  T = {}
  > = Required<ConnectProps<P, S, T>>

/**
 * @type T: React props
 * @type U: match props types
 */
export type ConnectRC<
  T = {},
  U = {},
  S = {},
  Q = {}
> = React.ForwardRefRenderFunction<any, T & RequiredConnectProps<U, S, Q>>;

