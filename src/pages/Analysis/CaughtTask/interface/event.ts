export type Task = {
  tid?: number,
  name: string,
  user: string,
  node: { id: string, ip: string },
  rule: {
    type: string,
    tuple: [string, string, string, string, string],
    time: number,
    size: number
  },
  status?:string,
  // 这俩个都是启动时间 查表回来得数据用start_time参数，编辑新建得时候用start参数
  start?: string,
  start_time?: string
};

export type node = {
  desc: string,
  id: string,
  ip: string,
  name: string,
  status: boolean
};