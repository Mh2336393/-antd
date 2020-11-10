// @ts-nocheck
import React from 'react';
import { ApplyPluginsType, dynamic } from 'D:/UGit/yujie_web/client/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';
import LoadingComponent from '@/components/PageLoading/index';

export function getRoutes() {
  const routes = [
  {
    "path": "/auth/noAuth",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Auth__NoAuth' */'D:/UGit/yujie_web/client/src/pages/Auth/NoAuth'), loading: LoadingComponent}),
    "name": "无授权",
    "hideInMenu": true,
    "exact": true
  },
  {
    "path": "/user",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'layouts__UserLayout' */'D:/UGit/yujie_web/client/src/layouts/UserLayout'), loading: LoadingComponent}),
    "routes": [
      {
        "path": "/user",
        "redirect": "/user/login",
        "exact": true
      },
      {
        "path": "/user/login",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__User__Login' */'D:/UGit/yujie_web/client/src/pages/User/Login'), loading: LoadingComponent}),
        "exact": true
      },
      {
        "path": "/user/modifyPwd",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__User__ModifyPwd' */'D:/UGit/yujie_web/client/src/pages/User/ModifyPwd'), loading: LoadingComponent}),
        "exact": true
      }
    ]
  },
  {
    "path": "/report",
    "name": "报表",
    "icon": "dashboard",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Report__ReportPreview__TemplateFst__' */'D:/UGit/yujie_web/client/src/pages/Report/ReportPreview/TemplateFst/'), loading: LoadingComponent}),
    "routes": [
      {
        "path": "/report/templateFst",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Report__ReportPreview__TemplateFst__' */'D:/UGit/yujie_web/client/src/pages/Report/ReportPreview/TemplateFst/'), loading: LoadingComponent}),
        "exact": true
      }
    ]
  },
  {
    "path": "/screen",
    "name": "态势大屏",
    "routes": [
      {
        "path": "/screen/safetyAware",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Screen__SafetyAware' */'D:/UGit/yujie_web/client/src/pages/Screen/SafetyAware.js'), loading: LoadingComponent}),
        "exact": true
      }
    ]
  },
  {
    "path": "/",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'layouts__BasicLayout' */'D:/UGit/yujie_web/client/src/layouts/BasicLayout'), loading: LoadingComponent}),
    "Routes": [
      "src/pages/Authorized"
    ],
    "routes": [
      {
        "path": "/",
        "redirect": "/dashboard/overview",
        "exact": true
      },
      {
        "path": "/dashboard",
        "name": "仪表板",
        "icon": "dashboard",
        "routes": [
          {
            "path": "/dashboard/overview",
            "name": "安全总览",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Dashboard__Overview' */'D:/UGit/yujie_web/client/src/pages/Dashboard/Overview'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/dashboard/systemMonitor",
            "name": "系统监控",
            "hideChildrenInMenu": true,
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Dashboard__SystemMonitor' */'D:/UGit/yujie_web/client/src/pages/Dashboard/SystemMonitor'), loading: LoadingComponent}),
            "routes": [
              {
                "path": "/dashboard/systemMonitor",
                "redirect": "/dashboard/systemMonitor/platform",
                "exact": true
              },
              {
                "name": "平台运行监控",
                "path": "/dashboard/systemMonitor/platform",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Dashboard__PlatformMonitor' */'D:/UGit/yujie_web/client/src/pages/Dashboard/PlatformMonitor'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "采集源运行监控",
                "path": "/dashboard/systemMonitor/source",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Dashboard__SourceMonitor' */'D:/UGit/yujie_web/client/src/pages/Dashboard/SourceMonitor'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "高级管理模式",
                "path": "/dashboard/systemMonitor/debugConfig",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Dashboard__DebugConfig' */'D:/UGit/yujie_web/client/src/pages/Dashboard/DebugConfig'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/dashboard/safetyAware",
            "name": "态势大屏",
            "target": "_blank",
            "routes": [
              {
                "path": "/dashboard/safetyAware",
                "redirect": "/screen/safetyAware",
                "exact": true
              }
            ]
          }
        ]
      },
      {
        "path": "/topic",
        "icon": "appstore",
        "name": "专题分析",
        "routes": [
          {
            "path": "/topic/dns",
            "name": "域名解析",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Dashboard__DNSOverview' */'D:/UGit/yujie_web/client/src/pages/Dashboard/DNSOverview'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "name": "邮件安全",
            "path": "/topic/email",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Dashboard__EmailSafe' */'D:/UGit/yujie_web/client/src/pages/Dashboard/EmailSafe'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/topic/account",
            "name": "账号安全",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Topic__AccountSecurity' */'D:/UGit/yujie_web/client/src/pages/Topic/AccountSecurity'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "name": "数据泄露",
            "path": "/topic/dataLeakage",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Dashboard__DataLeakage' */'D:/UGit/yujie_web/client/src/pages/Dashboard/DataLeakage'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "path": "/event",
        "icon": "/image/event_icon.png",
        "name": "事件",
        "routes": [
          {
            "path": "/event/safeEvent",
            "name": "安全事件",
            "hideChildrenInMenu": true,
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Event__SafeEvent' */'D:/UGit/yujie_web/client/src/pages/Event/SafeEvent'), loading: LoadingComponent}),
            "routes": [
              {
                "path": "/event/safeEvent",
                "redirect": "/event/safeEvent/alarm",
                "exact": true
              },
              {
                "name": "总体感知",
                "path": "/event/safeEvent/alarm",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Event__SafeEvent__AlarmList' */'D:/UGit/yujie_web/client/src/pages/Event/SafeEvent/AlarmList'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "入侵感知",
                "path": "/event/safeEvent/alarmAlert",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Event__SafeEvent__AlarmListAlert' */'D:/UGit/yujie_web/client/src/pages/Event/SafeEvent/AlarmListAlert'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "威胁情报",
                "path": "/event/safeEvent/alarmIoc",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Event__SafeEvent__AlarmListIoc' */'D:/UGit/yujie_web/client/src/pages/Event/SafeEvent/AlarmListIoc'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "异常文件感知",
                "path": "/event/safeEvent/alarmFile",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Event__SafeEvent__AlarmListFile' */'D:/UGit/yujie_web/client/src/pages/Event/SafeEvent/AlarmListFile'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "name": "高级分析事件",
            "path": "/event/analysis",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Event__Analysis' */'D:/UGit/yujie_web/client/src/pages/Event/Analysis'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "path": "/tactics",
        "icon": "/image/event_icon.png",
        "name": "策略",
        "routes": [
          {
            "name": "安全策略下发",
            "path": "/tactics/safetyStrategy",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__SafetyStrategy' */'D:/UGit/yujie_web/client/src/pages/Tactics/SafetyStrategy'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "name": "入侵感知管理",
            "path": "/tactics/invasion",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__Invasion' */'D:/UGit/yujie_web/client/src/pages/Tactics/Invasion'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "name": "自定义IOC管理",
            "path": "/tactics/threatIntelligence",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__ThreatIntelligence' */'D:/UGit/yujie_web/client/src/pages/Tactics/ThreatIntelligence'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "name": "阻断策略管理",
            "path": "/tactics/blockStrategy",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__BlockStrategy' */'D:/UGit/yujie_web/client/src/pages/Tactics/BlockStrategy'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/tactics/whites",
            "name": "白名单管理",
            "hideChildrenInMenu": true,
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__WhiteList' */'D:/UGit/yujie_web/client/src/pages/Tactics/WhiteList'), loading: LoadingComponent}),
            "routes": [
              {
                "path": "/tactics/whites",
                "redirect": "/tactics/whites/currency",
                "exact": true
              },
              {
                "name": "通用白名单",
                "path": "/tactics/whites/currency",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__WhiteList__IpWhitelist' */'D:/UGit/yujie_web/client/src/pages/Tactics/WhiteList/IpWhitelist'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "IOC白名单",
                "path": "/tactics/whites/iocWhitelist",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__WhiteList__IocWhitelist' */'D:/UGit/yujie_web/client/src/pages/Tactics/WhiteList/IocWhitelist'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "阻断白名单",
                "path": "/tactics/whites/blockWhite",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__WhiteList__BlockWhite' */'D:/UGit/yujie_web/client/src/pages/Tactics/WhiteList/BlockWhite'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "name": "高级分析策略管理",
            "path": "/tactics/advancedAnalysis",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Tactics__AdvancedAnalysis' */'D:/UGit/yujie_web/client/src/pages/Tactics/AdvancedAnalysis'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "name": "资产",
        "path": "/asset",
        "routes": [
          {
            "name": "资产列表",
            "path": "/asset/assetList",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Asset__AssetList__AssetList' */'D:/UGit/yujie_web/client/src/pages/Asset/AssetList/AssetList'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "name": "资产发现",
            "path": "/asset/assetfind",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Asset__AssetFind__' */'D:/UGit/yujie_web/client/src/pages/Asset/AssetFind/'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "name": "资产组管理",
            "path": "/asset/assetgroup",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Asset__AssetGroup__' */'D:/UGit/yujie_web/client/src/pages/Asset/AssetGroup/'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "path": "/analysis",
        "icon": "/image/search_icon.png",
        "name": "分析",
        "routes": [
          {
            "path": "/analysis",
            "redirect": "/analysis/search",
            "exact": true
          },
          {
            "path": "/analysis/search",
            "name": "日志检索",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Analysis__Search' */'D:/UGit/yujie_web/client/src/pages/Analysis/Search'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/analysis/caughtTask",
            "name": "抓包任务",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Analysis__CaughtTask' */'D:/UGit/yujie_web/client/src/pages/Analysis/CaughtTask'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "path": "/reports",
        "icon": "/image/report_icon.png",
        "name": "报表",
        "routes": [
          {
            "path": "/reports",
            "redirect": "/reports/lists",
            "exact": true
          },
          {
            "path": "/reports/lists",
            "name": "报表列表",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Report__Lists' */'D:/UGit/yujie_web/client/src/pages/Report/Lists'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/reports/tasks",
            "name": "报表任务",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Report__Tasks' */'D:/UGit/yujie_web/client/src/pages/Report/Tasks'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "path": "/systemSetting",
        "icon": "/image/setting_icon.png",
        "name": "系统设置",
        "routes": [
          {
            "path": "/systemSetting/dataAccess",
            "name": "数据接入",
            "hideChildrenInMenu": true,
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__DataAccess' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/DataAccess'), loading: LoadingComponent}),
            "routes": [
              {
                "path": "/systemSetting/dataAccess",
                "redirect": "/systemSetting/dataAccess/source",
                "exact": true
              },
              {
                "name": "流量源接入",
                "path": "/systemSetting/dataAccess/source",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__DataAccess__sourceAccess' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/DataAccess/sourceAccess'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "沙箱配置",
                "path": "/systemSetting/dataAccess/sandbox",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__DataAccess__sandboxData' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/DataAccess/sandboxData'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "云端智能接入",
                "path": "/systemSetting/dataAccess/clound",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__DataAccess__clound' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/DataAccess/clound'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "阻断模块接入",
                "path": "/systemSetting/dataAccess/block",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__DataAccess__BlockModuleSet' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/DataAccess/BlockModuleSet'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "编辑数据",
                "path": "/systemSetting/dataAccess/editor",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__DataAccess__sourceEditor' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/DataAccess/sourceEditor'), loading: LoadingComponent}),
                "hideInMenu": true,
                "exact": true
              },
              {
                "name": "新建数据",
                "path": "/systemSetting/dataAccess/add",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__DataAccess__sourceAdd' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/DataAccess/sourceAdd'), loading: LoadingComponent}),
                "hideInMenu": true,
                "exact": true
              }
            ]
          },
          {
            "path": "/systemSetting/user",
            "name": "用户及权限",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__User' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/User'), loading: LoadingComponent}),
            "hideChildrenInMenu": true,
            "routes": [
              {
                "path": "/systemSetting/user",
                "redirect": "/systemSetting/user/userList",
                "exact": true
              },
              {
                "name": "用户管理",
                "path": "/systemSetting/user/userList",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__User__UserList' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/User/UserList'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "权限管理",
                "path": "/systemSetting/user/authList",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__User__AuthList' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/User/AuthList'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/systemSetting/version",
            "name": "版本及授权管理",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__version' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/version'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/systemSetting/audit",
            "name": "审计管理",
            "hideChildrenInMenu": true,
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__Audit' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/Audit'), loading: LoadingComponent}),
            "routes": [
              {
                "path": "/systemSetting/audit",
                "redirect": "/systemSetting/audit/operateLogs",
                "exact": true
              },
              {
                "name": "操作日志",
                "path": "/systemSetting/audit/operateLogs",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__Audit__OperateLogs' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/Audit/OperateLogs'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "系统日志",
                "path": "/systemSetting/audit/sysLogs",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__Audit__SysLogs' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/Audit/SysLogs'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "阻断日志",
                "path": "/systemSetting/audit/blockLogs",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__Audit__BlockLogs' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/Audit/BlockLogs'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "name": "配置",
                "path": "/systemSetting/audit/configuration",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__Audit__Configuration' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/Audit/Configuration'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/systemSetting/msg",
            "name": "消息管理",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Messagecenter' */'D:/UGit/yujie_web/client/src/pages/Messagecenter'), loading: LoadingComponent}),
            "hideChildrenInMenu": true,
            "routes": [
              {
                "path": "/systemSetting/msg",
                "redirect": "/systemSetting/msg/messageCenter",
                "exact": true
              },
              {
                "path": "/systemSetting/msg/messageCenter",
                "name": "消息中心",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Messagecenter__MessageCenter' */'D:/UGit/yujie_web/client/src/pages/Messagecenter/MessageCenter'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/systemSetting/msg/strategy",
                "name": "通知策略",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Messagecenter__Strategy' */'D:/UGit/yujie_web/client/src/pages/Messagecenter/Strategy'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/systemSetting/msg/systemAccess",
                "name": "通知系统接入",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Messagecenter__SystemAccess' */'D:/UGit/yujie_web/client/src/pages/Messagecenter/SystemAccess'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/systemSetting/ccsConfig",
            "name": "分级配置",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__SystemSetting__CcsConfig' */'D:/UGit/yujie_web/client/src/pages/SystemSetting/CcsConfig'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/systemSetting/safety",
            "name": "安全性与其他设置",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Messagecenter__Safety' */'D:/UGit/yujie_web/client/src/pages/Messagecenter/Safety'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__404' */'D:/UGit/yujie_web/client/src/pages/404'), loading: LoadingComponent}),
        "exact": true
      }
    ]
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
