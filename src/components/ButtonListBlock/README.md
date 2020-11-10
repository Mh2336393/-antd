| category   | subtitle   | type     | title            |
| ---------- | ---------- | -------- | ---------------- |
| Components | 操作按钮集合 | 数据录入 | ButtonListBlock |

操作按钮集合，内部使用 antdesign Button 组件。

## 何时使用

- 对多个操作选项，提供统一布局
- 可设置是否显示

## API

### ButtonListBlock

| 参数                | 说明                            | 类型                                                  | 默认值   |
| ------------------ | ------------------------------- | ----------------------------------------------------- | -------- |
| btnList            | 按钮数组                          | array                                                 | []     | 
| btnStyle           | 自定义按钮样式                     | Obj                                                   |  -      |
| wrapperStyle       | 自定义最外层样式                    | Obj                                                  |  -      |
| mode               | 控制模式, Ant 或者 Tea 封装        | string                                                | ant      |

### btnList

| 参数                | 说明                            | 类型                                                  | 默认值   |
| ------------------ | ------------------------------- | ----------------------------------------------------- | -------- |
| label               | 按钮文案                         | string                                                |   -      |
| type                | 按钮类型,支持button,dropdown,默认button|string(button,dropdown)                           |   -       |
| menu               | type为dropdown时的菜单列表        | array                                                  | []      |
| selectedKeys       | type为dropdown时的已选中项目        | array                                                  | []      |
| hide               | 是否隐藏                       | boolean ,true:隐藏，false:显示                             | false      |
| func                | button/dropdown 点击回调                 | function({key}),参考antd dropdown用法           |    -      |
| customRender        | 自定义render函数，返回ReactNode           | func                                            |      -    |




### menu

| 参数                | 说明                            | 类型                                                  | 默认值   |
| ------------------ | ------------------------------- | ----------------------------------------------------- | -------- |
| key            | 标识符                         | string                                                 |         |
| value        | 按钮类型,支持button,dropdown,
| disable               | 是否隐藏        | boolean ,true:隐藏，false:显示                                               |     false  |

