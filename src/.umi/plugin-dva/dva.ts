// @ts-nocheck
import { Component } from 'react';
import { ApplyPluginsType } from 'umi';
import dva from 'dva';
// @ts-ignore
import createLoading from 'D:/UGit/yujie_web/client/node_modules/@umijs/plugin-dva/node_modules/dva-loading/dist/index.esm.js';
import { plugin, history } from '../core/umiExports';
import ModelAdvancedAnalysis0 from 'D:/UGit/yujie_web/client/src/models/advancedAnalysis.js';
import ModelAttackChainDetail1 from 'D:/UGit/yujie_web/client/src/models/attackChainDetail.js';
import ModelAttackVictimProfile2 from 'D:/UGit/yujie_web/client/src/models/attackVictimProfile.js';
import ModelBlock3 from 'D:/UGit/yujie_web/client/src/models/block.js';
import ModelConfig4 from 'D:/UGit/yujie_web/client/src/models/config.js';
import ModelGlobal5 from 'D:/UGit/yujie_web/client/src/models/global.js';
import ModelIocDetail6 from 'D:/UGit/yujie_web/client/src/models/iocDetail.js';
import ModelList7 from 'D:/UGit/yujie_web/client/src/models/list.js';
import ModelLogin8 from 'D:/UGit/yujie_web/client/src/models/login.js';
import ModelMessageCenter9 from 'D:/UGit/yujie_web/client/src/models/messageCenter.js';
import ModelMsgNotify10 from 'D:/UGit/yujie_web/client/src/models/msgNotify.js';
import ModelPlatform11 from 'D:/UGit/yujie_web/client/src/models/platform.js';
import ModelProject12 from 'D:/UGit/yujie_web/client/src/models/project.js';
import ModelSetting13 from 'D:/UGit/yujie_web/client/src/models/setting.js';
import ModelSourceAccess14 from 'D:/UGit/yujie_web/client/src/models/sourceAccess.js';
import ModelUser15 from 'D:/UGit/yujie_web/client/src/models/user.js';
import ModelCaughtTask16 from 'D:/UGit/yujie_web/client/src/pages/Analysis/CaughtTask/models/caughtTask.js';
import ModelSearch17 from 'D:/UGit/yujie_web/client/src/pages/Analysis/Search/models/search.js';
import ModelAsset18 from 'D:/UGit/yujie_web/client/src/pages/Asset/models/asset.js';
import ModelAssetFind19 from 'D:/UGit/yujie_web/client/src/pages/Asset/models/assetFind.js';
import ModelAssetGroup20 from 'D:/UGit/yujie_web/client/src/pages/Asset/models/assetGroup.js';
import ModelAssetList21 from 'D:/UGit/yujie_web/client/src/pages/Asset/models/assetList.js';
import ModelSegment22 from 'D:/UGit/yujie_web/client/src/pages/Asset/models/segment.js';
import ModelDashboardDns23 from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/dashboardDns.js';
import ModelDataLeakage24 from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/dataLeakage.js';
import ModelDebugConfig25 from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/debugConfig.js';
import ModelDnsViewAll26 from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/dnsViewAll.js';
import ModelEmailSafe27 from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/emailSafe.js';
import ModelEmailViewAll28 from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/EmailViewAll.js';
import ModelOverview29 from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/overview.js';
import ModelSourceMonitor30 from 'D:/UGit/yujie_web/client/src/pages/Dashboard/models/sourceMonitor.js';
import ModelAlertDetail31 from 'D:/UGit/yujie_web/client/src/pages/Event/models/alertDetail.js';
import ModelAptDetail32 from 'D:/UGit/yujie_web/client/src/pages/Event/models/aptDetail.js';
import ModelAptUpload33 from 'D:/UGit/yujie_web/client/src/pages/Event/models/aptUpload.js';
import ModelEventAnalysis34 from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventAnalysis.js';
import ModelEventFall35 from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventFall.js';
import ModelEventFile36 from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventFile.js';
import ModelEventInvasion37 from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventInvasion.js';
import ModelEventOverview38 from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventOverview.js';
import ModelEventPropertyRisk39 from 'D:/UGit/yujie_web/client/src/pages/Event/models/eventPropertyRisk.js';
import ModelScanRule40 from 'D:/UGit/yujie_web/client/src/pages/Event/models/scanRule.js';
import ModelError41 from 'D:/UGit/yujie_web/client/src/pages/Exception/models/error.js';
import ModelNoticeStrategy42 from 'D:/UGit/yujie_web/client/src/pages/Messagecenter/models/noticeStrategy.js';
import ModelSafety43 from 'D:/UGit/yujie_web/client/src/pages/Messagecenter/models/safety.js';
import ModelSystemAccess44 from 'D:/UGit/yujie_web/client/src/pages/Messagecenter/models/systemAccess.js';
import ModelEventHandle45 from 'D:/UGit/yujie_web/client/src/pages/Report/models/eventHandle.js';
import ModelReportApt46 from 'D:/UGit/yujie_web/client/src/pages/Report/models/reportApt.js';
import ModelReportLists47 from 'D:/UGit/yujie_web/client/src/pages/Report/models/reportLists.js';
import ModelReportTasks48 from 'D:/UGit/yujie_web/client/src/pages/Report/models/reportTasks.js';
import ModelTemplateFstPreview49 from 'D:/UGit/yujie_web/client/src/pages/Report/models/templateFstPreview.js';
import ModelSafetyAware50 from 'D:/UGit/yujie_web/client/src/pages/Screen/models/safetyAware.js';
import ModelAudit51 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/audit.js';
import ModelAuth52 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/auth.js';
import ModelCcsConfig53 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/ccsConfig.js';
import ModelClound54 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/clound.js';
import ModelNetworkSegment55 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/networkSegment.js';
import ModelPropertyFind56 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/propertyFind.js';
import ModelPropertyMgr57 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/propertyMgr.js';
import ModelSandboxData58 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/sandboxData.js';
import ModelSysLog59 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/sysLog.js';
import ModelUserManger60 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/userManger.js';
import ModelVersion61 from 'D:/UGit/yujie_web/client/src/pages/SystemSetting/models/version.js';
import ModelSelfIoc62 from 'D:/UGit/yujie_web/client/src/pages/Tactics/models/selfIoc.js';
import ModelTacticsInvasion63 from 'D:/UGit/yujie_web/client/src/pages/Tactics/models/tacticsInvasion.js';
import ModelTacticsSafeStrategy64 from 'D:/UGit/yujie_web/client/src/pages/Tactics/models/tacticsSafeStrategy.js';
import ModelWhiteListIpAndIoc65 from 'D:/UGit/yujie_web/client/src/pages/Tactics/models/whiteListIpAndIoc.js';
import ModelAccountSecurity66 from 'D:/UGit/yujie_web/client/src/pages/Topic/models/accountSecurity.js';
import ModelAccountViewAll67 from 'D:/UGit/yujie_web/client/src/pages/Topic/models/accountViewAll.js';

let app:any = null;

export function _onCreate(options = {}) {
  const runtimeDva = plugin.applyPlugins({
    key: 'dva',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });
  app = dva({
    history,
    
    ...(runtimeDva.config || {}),
    // @ts-ignore
    ...(typeof window !== 'undefined' && window.g_useSSR ? { initialState: window.g_initialProps } : {}),
    ...(options || {}),
  });
  
  app.use(createLoading());
  
  (runtimeDva.plugins || []).forEach((plugin:any) => {
    app.use(plugin);
  });
  app.model({ namespace: 'advancedAnalysis', ...ModelAdvancedAnalysis0 });
app.model({ namespace: 'attackChainDetail', ...ModelAttackChainDetail1 });
app.model({ namespace: 'attackVictimProfile', ...ModelAttackVictimProfile2 });
app.model({ namespace: 'block', ...ModelBlock3 });
app.model({ namespace: 'config', ...ModelConfig4 });
app.model({ namespace: 'global', ...ModelGlobal5 });
app.model({ namespace: 'iocDetail', ...ModelIocDetail6 });
app.model({ namespace: 'list', ...ModelList7 });
app.model({ namespace: 'login', ...ModelLogin8 });
app.model({ namespace: 'messageCenter', ...ModelMessageCenter9 });
app.model({ namespace: 'msgNotify', ...ModelMsgNotify10 });
app.model({ namespace: 'platform', ...ModelPlatform11 });
app.model({ namespace: 'project', ...ModelProject12 });
app.model({ namespace: 'setting', ...ModelSetting13 });
app.model({ namespace: 'sourceAccess', ...ModelSourceAccess14 });
app.model({ namespace: 'user', ...ModelUser15 });
app.model({ namespace: 'caughtTask', ...ModelCaughtTask16 });
app.model({ namespace: 'search', ...ModelSearch17 });
app.model({ namespace: 'asset', ...ModelAsset18 });
app.model({ namespace: 'assetFind', ...ModelAssetFind19 });
app.model({ namespace: 'assetGroup', ...ModelAssetGroup20 });
app.model({ namespace: 'assetList', ...ModelAssetList21 });
app.model({ namespace: 'segment', ...ModelSegment22 });
app.model({ namespace: 'dashboardDns', ...ModelDashboardDns23 });
app.model({ namespace: 'dataLeakage', ...ModelDataLeakage24 });
app.model({ namespace: 'debugConfig', ...ModelDebugConfig25 });
app.model({ namespace: 'dnsViewAll', ...ModelDnsViewAll26 });
app.model({ namespace: 'emailSafe', ...ModelEmailSafe27 });
app.model({ namespace: 'EmailViewAll', ...ModelEmailViewAll28 });
app.model({ namespace: 'overview', ...ModelOverview29 });
app.model({ namespace: 'sourceMonitor', ...ModelSourceMonitor30 });
app.model({ namespace: 'alertDetail', ...ModelAlertDetail31 });
app.model({ namespace: 'aptDetail', ...ModelAptDetail32 });
app.model({ namespace: 'aptUpload', ...ModelAptUpload33 });
app.model({ namespace: 'eventAnalysis', ...ModelEventAnalysis34 });
app.model({ namespace: 'eventFall', ...ModelEventFall35 });
app.model({ namespace: 'eventFile', ...ModelEventFile36 });
app.model({ namespace: 'eventInvasion', ...ModelEventInvasion37 });
app.model({ namespace: 'eventOverview', ...ModelEventOverview38 });
app.model({ namespace: 'eventPropertyRisk', ...ModelEventPropertyRisk39 });
app.model({ namespace: 'scanRule', ...ModelScanRule40 });
app.model({ namespace: 'error', ...ModelError41 });
app.model({ namespace: 'noticeStrategy', ...ModelNoticeStrategy42 });
app.model({ namespace: 'safety', ...ModelSafety43 });
app.model({ namespace: 'systemAccess', ...ModelSystemAccess44 });
app.model({ namespace: 'eventHandle', ...ModelEventHandle45 });
app.model({ namespace: 'reportApt', ...ModelReportApt46 });
app.model({ namespace: 'reportLists', ...ModelReportLists47 });
app.model({ namespace: 'reportTasks', ...ModelReportTasks48 });
app.model({ namespace: 'templateFstPreview', ...ModelTemplateFstPreview49 });
app.model({ namespace: 'safetyAware', ...ModelSafetyAware50 });
app.model({ namespace: 'audit', ...ModelAudit51 });
app.model({ namespace: 'auth', ...ModelAuth52 });
app.model({ namespace: 'ccsConfig', ...ModelCcsConfig53 });
app.model({ namespace: 'clound', ...ModelClound54 });
app.model({ namespace: 'networkSegment', ...ModelNetworkSegment55 });
app.model({ namespace: 'propertyFind', ...ModelPropertyFind56 });
app.model({ namespace: 'propertyMgr', ...ModelPropertyMgr57 });
app.model({ namespace: 'sandboxData', ...ModelSandboxData58 });
app.model({ namespace: 'sysLog', ...ModelSysLog59 });
app.model({ namespace: 'userManger', ...ModelUserManger60 });
app.model({ namespace: 'version', ...ModelVersion61 });
app.model({ namespace: 'selfIoc', ...ModelSelfIoc62 });
app.model({ namespace: 'tacticsInvasion', ...ModelTacticsInvasion63 });
app.model({ namespace: 'tacticsSafeStrategy', ...ModelTacticsSafeStrategy64 });
app.model({ namespace: 'whiteListIpAndIoc', ...ModelWhiteListIpAndIoc65 });
app.model({ namespace: 'accountSecurity', ...ModelAccountSecurity66 });
app.model({ namespace: 'accountViewAll', ...ModelAccountViewAll67 });
  return app;
}

export function getApp() {
  return app;
}

export class _DvaContainer extends Component {
  constructor(props: any) {
    super(props);
    // run only in client, avoid override server _onCreate()
    if (typeof window !== 'undefined') {
      _onCreate();
    }
  }

  componentWillUnmount() {
    let app = getApp();
    app._models.forEach((model:any) => {
      app.unmodel(model.namespace);
    });
    app._models = [];
    try {
      // 释放 app，for gc
      // immer 场景 app 是 read-only 的，这里 try catch 一下
      app = null;
    } catch(e) {
      console.error(e);
    }
  }

  render() {
    const app = getApp();
    app.router(() => this.props.children);
    return app.start()();
  }
}
