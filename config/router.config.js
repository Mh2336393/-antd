import authority from '../src/utils/authority';
const { md5check } = authority;

export default [
  {
    path: '/auth/noAuth',
    component: './Auth/NoAuth',
    name: '无授权',
    hideInMenu: true,
  },

  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        path: '/user/login',
        component: './User/Login',
      },
      {
        path: '/user/modifyPwd',
        component: './User/ModifyPwd',
      },
    ],
  },
  {
    path: '/report',
    name: '报表',
    icon: 'dashboard',
    component: './Report/ReportPreview/TemplateFst/',
    routes: [
      {
        path: '/report/templateFst', // 模板一
        component: './Report/ReportPreview/TemplateFst/',
      },
    ],
  },
  {
    path: '/screen',
    name: '态势大屏',
    routes: [
      {
        path: '/screen/safetyAware', // 模板一
        component: './Screen/SafetyAware.js',
      },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: md5check,
    routes: [
      // dashboard
      { path: '/', redirect: '/dashboard/overview' },
      {
        path: '/dashboard',
        name: '仪表板',
        icon: 'dashboard',
        // authority: ['1', '2'],
        routes: [
          {
            path: '/dashboard/overview',
            name: '安全总览',
            component: './Dashboard/Overview',
          },
          {
            path: '/dashboard/systemMonitor',
            name: '系统监控',
            hideChildrenInMenu: true,
            component: './Dashboard/SystemMonitor',
            routes: [
              {
                path: '/dashboard/systemMonitor',
                redirect: '/dashboard/systemMonitor/platform',
              },
              {
                name: '平台运行监控',
                path: '/dashboard/systemMonitor/platform',
                component: './Dashboard/PlatformMonitor',
              },
              {
                name: '采集源运行监控',
                path: '/dashboard/systemMonitor/source',
                component: './Dashboard/SourceMonitor',
              },
              {
                name: '高级管理模式',
                path: '/dashboard/systemMonitor/debugConfig',
                component: './Dashboard/DebugConfig',
              },
            ],
          },
          {
            path: '/dashboard/safetyAware',
            name: '态势大屏',
            target: '_blank',
            routes: [
              {
                path: '/dashboard/safetyAware',
                redirect: '/screen/safetyAware',
              },
            ],
          },
        ],
      },
      {
        path: '/topic',
        icon: 'appstore',
        name: '专题分析',
        // authority: ['1', '2'],
        routes: [
          {
            path: '/topic/dns',
            name: '域名解析',
            component: './Dashboard/DNSOverview',
          },
          {
            name: '邮件安全',
            path: '/topic/email',
            component: './Dashboard/EmailSafe',
          },
          {
            path: '/topic/account',
            name: '账号安全',
            component: './Topic/AccountSecurity',
          },
          {
            name: '数据泄露',
            path: '/topic/dataLeakage',
            component: './Dashboard/DataLeakage',
          },
        ],
      },
      {
        path: '/event',
        icon: '/image/event_icon.png',
        name: '事件',
        // authority: ['1', '2'],
        routes: [
          {
            path: '/event/safeEvent',
            name: '安全事件',
            hideChildrenInMenu: true,
            component: './Event/SafeEvent',
            routes: [
              {
                path: '/event/safeEvent',
                redirect: '/event/safeEvent/alarm',
              },
              {
                name: '总体感知',
                path: '/event/safeEvent/alarm',
                component: './Event/SafeEvent/AlarmList',
              },
              {
                name: '入侵感知',
                path: '/event/safeEvent/alarmAlert',
                component: './Event/SafeEvent/AlarmListAlert',
              },
              {
                name: '威胁情报',
                path: '/event/safeEvent/alarmIoc',
                component: './Event/SafeEvent/AlarmListIoc',
              },
              {
                name: '异常文件感知',
                path: '/event/safeEvent/alarmFile',
                component: './Event/SafeEvent/AlarmListFile',
              },
            ],
          },
          {
            name: '高级分析事件',
            path: '/event/analysis',
            component: './Event/Analysis',
          },
        ],
      },
      {
        path: '/tactics',
        icon: '/image/event_icon.png',
        name: '策略',
        // authority: ['1', '2'],
        routes: [
          {
            name: '安全策略下发',
            path: '/tactics/safetyStrategy',
            component: './Tactics/SafetyStrategy',
          },
          {
            name: '入侵感知管理',
            path: '/tactics/invasion',
            component: './Tactics/Invasion',
          },
          {
            name: '自定义IOC管理',
            path: '/tactics/threatIntelligence',
            component: './Tactics/ThreatIntelligence',
          },
          {
            name: '阻断策略管理',
            path: '/tactics/blockStrategy',
            component: './Tactics/BlockStrategy',
          },
          {
            path: '/tactics/whites',
            name: '白名单管理',
            hideChildrenInMenu: true,
            component: './Tactics/WhiteList',
            routes: [
              {
                path: '/tactics/whites',
                redirect: '/tactics/whites/currency',
              },
              {
                name: '通用白名单',
                path: '/tactics/whites/currency',
                component: './Tactics/WhiteList/IpWhitelist',
              },
              {
                name: 'IOC白名单',
                path: '/tactics/whites/iocWhitelist',
                component: './Tactics/WhiteList/IocWhitelist',
              },
              {
                name: '阻断白名单',
                path: '/tactics/whites/blockWhite',
                component: './Tactics/WhiteList/BlockWhite',
              },
            ],
          },
          {
            name: '高级分析策略管理',
            path: '/tactics/advancedAnalysis',
            component: './Tactics/AdvancedAnalysis',
          },
        ],
      },
      {
        name: '资产',
        path: '/asset',
        routes: [
          {
            name: '资产列表',
            path: '/asset/assetList',
            component: './Asset/AssetList/AssetList',
          },
          {
            name: '资产发现',
            path: '/asset/assetfind',
            component: './Asset/AssetFind/',
            // component: './AssetFind/',
          },
          {
            name: '资产组管理',
            path: '/asset/assetgroup',
            component: './Asset/AssetGroup/',
          },
        ],
      },
      {
        path: '/analysis',
        icon: '/image/search_icon.png',
        name: '分析',
        // component: './Search/',
        // authority: ['1', '2'],
        // levelTop: true,
        routes: [
          {
            path: '/analysis',
            redirect: '/analysis/search',
          },
          {
            path: '/analysis/search',
            name: '日志检索',
            component: './Analysis/Search',
          },
          {
            path: '/analysis/caughtTask',
            name: '抓包任务',
            component: './Analysis/CaughtTask',
          },
        ],
      },
      {
        path: '/reports',
        icon: '/image/report_icon.png',
        name: '报表',
        // authority: ['1', '2', '3'],
        routes: [
          {
            path: '/reports',
            redirect: '/reports/lists',
          },
          {
            path: '/reports/lists',
            name: '报表列表',
            component: './Report/Lists',
          },
          {
            path: '/reports/tasks',
            name: '报表任务',
            component: './Report/Tasks',
          },
        ],
      },
      {
        path: '/systemSetting',
        icon: '/image/setting_icon.png',
        name: '系统设置',
        routes: [
          {
            path: '/systemSetting/dataAccess',
            name: '数据接入',
            hideChildrenInMenu: true,
            // authority: ['1', '2'],
            component: './SystemSetting/DataAccess',
            routes: [
              {
                path: '/systemSetting/dataAccess',
                redirect: '/systemSetting/dataAccess/source',
              },
              {
                name: '流量源接入',
                path: '/systemSetting/dataAccess/source',
                component: './SystemSetting/DataAccess/sourceAccess',
              },
              {
                name: '沙箱配置',
                path: '/systemSetting/dataAccess/sandbox',
                component: './SystemSetting/DataAccess/sandboxData',
              },
              {
                name: '云端智能接入',
                path: '/systemSetting/dataAccess/clound',
                component: './SystemSetting/DataAccess/clound',
              },
              {
                name: '阻断模块接入',
                path: '/systemSetting/dataAccess/block',
                component: './SystemSetting/DataAccess/BlockModuleSet',
              },
              {
                name: '编辑数据',
                path: '/systemSetting/dataAccess/editor',
                component: './SystemSetting/DataAccess/sourceEditor',
                hideInMenu: true,
              },
              {
                name: '新建数据',
                path: '/systemSetting/dataAccess/add',
                component: './SystemSetting/DataAccess/sourceAdd',
                hideInMenu: true,
              },
            ],
          },
          {
            path: '/systemSetting/user',
            name: '用户及权限',
            component: './SystemSetting/User',
            hideChildrenInMenu: true,
            routes: [
              {
                path: '/systemSetting/user',
                redirect: '/systemSetting/user/userList',
              },
              {
                name: '用户管理',
                path: '/systemSetting/user/userList',
                component: './SystemSetting/User/UserList',
              },
              {
                name: '权限管理',
                path: '/systemSetting/user/authList',
                component: './SystemSetting/User/AuthList',
              },
            ],
          },
          {
            path: '/systemSetting/version',
            name: '版本及授权管理',
            // authority: ['1', '2'],
            component: './SystemSetting/version',
          },
          {
            path: '/systemSetting/audit',
            name: '审计管理',
            // authority: ['1', '2', '3'],
            hideChildrenInMenu: true,
            component: './SystemSetting/Audit',
            routes: [
              {
                path: '/systemSetting/audit',
                redirect: '/systemSetting/audit/operateLogs',
              },
              {
                name: '操作日志',
                path: '/systemSetting/audit/operateLogs',
                component: './SystemSetting/Audit/OperateLogs',
              },
              {
                name: '系统日志',
                path: '/systemSetting/audit/sysLogs',
                component: './SystemSetting/Audit/SysLogs',
              },
              {
                name: '阻断日志',
                path: '/systemSetting/audit/blockLogs',
                component: './SystemSetting/Audit/BlockLogs',
              },
              {
                name: '配置',
                path: '/systemSetting/audit/configuration',
                component: './SystemSetting/Audit/Configuration',
              },
            ],
          },
          // 消息管理
          {
            path: '/systemSetting/msg',
            name: '消息管理',
            component: './Messagecenter',
            hideChildrenInMenu: true,
            // authority: ['1', '2'],
            routes: [
              {
                path: '/systemSetting/msg',
                redirect: '/systemSetting/msg/messageCenter',
              },
              {
                path: '/systemSetting/msg/messageCenter',
                name: '消息中心',
                component: './Messagecenter/MessageCenter',
              },
              {
                path: '/systemSetting/msg/strategy',
                name: '通知策略',
                component: './Messagecenter/Strategy',
              },
              {
                path: '/systemSetting/msg/systemAccess',
                name: '通知系统接入',
                component: './Messagecenter/SystemAccess',
              },
            ],
          },
          {
            path: '/systemSetting/ccsConfig',
            name: '分级配置',
            component: './SystemSetting/CcsConfig',
          },
          {
            path: '/systemSetting/safety',
            name: '安全性与其他设置',
            component: './Messagecenter/Safety',
            // authority: ['1', '2'],
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
