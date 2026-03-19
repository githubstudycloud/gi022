# 测试树场景设计文档

## 1. 设计目标

本设计目标是把复杂业务树拆解为：

- 稳定的核心节点模型
- 可配置的父子关系规则
- 可扩展的动态字段机制
- 可单独执行的树规则校验能力
- 可复用的技能化分析模板

## 2. 设计原则

### 2.1 核心字段稳定，扩展字段外置

固定字段只承载树运转最小集，业务重字段通过扩展字段表或扩展字段对象承载。

### 2.2 关系规则显式配置

不要把父子关系散落在多个接口或多个组件中，应由统一规则源定义：

- 哪些父节点允许哪些子节点
- 哪些节点需要数量限制
- 哪些节点存在模式互斥
- 哪些节点存在流程性约束

### 2.3 结构规则和流程规则分离

例如“场景下不能直接创建目录，只能先建特性再转目录”属于流程规则，不是普通静态结构规则。
因此需要通过额外字段记录转换来源，而不是只看 `type`。

## 3. 总体方案

建议采用四层模型：

1. 树节点核心模型
2. 节点类型规则模型
3. 动态字段定义模型
4. 操作与校验服务

## 4. 数据模型设计

### 4.1 树节点核心模型

建议核心节点结构如下：

```json
{
  "id": "internal-db-id",
  "longIdPath": "space-1/product-1/baseline-1",
  "shortId": "BL-001",
  "currentLevelId": "baseline-1",
  "parentLongIdPath": "space-1/product-1",
  "type": "baseline_version",
  "name": "回归基线 V1",
  "number": "BL-V1",
  "sortOrder": 100,
  "status": "active",
  "meta": {
    "convertedFrom": null,
    "executionMode": null
  },
  "extFields": {}
}
```

### 4.2 关键字段说明

| 字段 | 说明 |
| --- | --- |
| `longIdPath` | 树路径主键，逻辑上唯一，按 `/` 切分 |
| `currentLevelId` | 当前节点自身 ID，应与 `longIdPath` 最后一段一致 |
| `type` | 节点类型 |
| `meta.convertedFrom` | 用于表达目录是否由特性转换而来 |
| `meta.executionMode` | 表达执行版本当前模式，建议值为 `single_container` 或 `multi_scene` |
| `extFields` | 额外业务字段容器 |

## 5. 节点类型与关系矩阵

建议的允许子节点关系如下：

| 父类型 | 允许子类型 |
| --- | --- |
| `space` | `product`, `container_version`, `baseline_version` |
| `product` | `container_version`, `baseline_version` |
| `container_version` | `case_container`, `execution_version` |
| `baseline_version` | `case_container`, `execution_version` |
| `case_container` | `directory`, `feature` |
| `execution_version` | `container_version`, `test_scene` |
| `test_scene` | `feature`, `directory` |
| `directory` | `directory`, `feature`, `baseline_case`, `execution_case` |
| `feature` | `directory`, `feature`, `baseline_case`, `execution_case` |

### 5.1 附加约束

- `baseline_version` 下面必须且仅能有一个 `case_container`
- `execution_version` 必须满足模式互斥：
  - `single_container`：只能有一个 `container_version`
  - `multi_scene`：只能有一个或多个 `test_scene`
- `test_scene` 直接子目录必须满足 `meta.convertedFrom = feature`
- `baseline_case` 与 `execution_case` 必须和最近的版本上下文一致

## 6. 上下文判定设计

### 6.1 用例类型判定

建议按最近版本上下文判定用例类型：

- 若向上最近可判定上下文是 `execution_version`，则目录/特性下的用例必须为 `execution_case`
- 若向上最近可判定上下文是 `baseline_version`，则目录/特性下的用例必须为 `baseline_case`

若节点路径中既没有 `baseline_version` 也没有 `execution_version`，则当前设计不自动推断用例类型，应判定为待确认分支。

### 6.2 场景目录转换

为了表达“场景下目录必须来自特性转换”，建议：

- 保留 `directory` 作为最终类型
- 在 `meta.convertedFrom` 中记录原始类型
- 当目录直接位于 `test_scene` 之下时，校验 `meta.convertedFrom == "feature"`

## 7. 动态字段设计

### 7.1 字段定义模型

建议额外维护一份字段定义：

```json
{
  "type": "baseline_version",
  "fieldKey": "owner",
  "label": "负责人",
  "component": "user-select",
  "required": false,
  "group": "basic",
  "visibleInTree": false,
  "visibleInDetail": true
}
```

### 7.2 字段渲染策略

- 树上仅渲染极少数字段：名称、编号、状态、类型标识
- 右侧详情区按 `type + fieldDefinitions` 动态渲染
- 扩展字段统一落在 `extFields`
- 增加字段时优先新增定义，不直接改核心结构

## 8. API 设计建议

当前接口较多，建议按能力分组，而不是按页面零散拆分。

### 8.1 树能力

| 能力 | 建议接口 |
| --- | --- |
| 查询树 | `GET /tree/nodes` |
| 懒加载子节点 | `GET /tree/nodes/{path}/children` |
| 查询节点摘要 | `GET /tree/nodes/{path}/summary` |

### 8.2 节点详情能力

| 能力 | 建议接口 |
| --- | --- |
| 查询详情 | `GET /tree/nodes/{path}/detail` |
| 查询动态字段定义 | `GET /tree/node-types/{type}/fields` |
| 查询节点可执行动作 | `GET /tree/nodes/{path}/actions` |

### 8.3 写操作能力

| 能力 | 建议接口 |
| --- | --- |
| 创建节点 | `POST /tree/nodes` |
| 修改节点 | `PATCH /tree/nodes/{path}` |
| 删除节点 | `DELETE /tree/nodes/{path}` |
| 移动节点 | `POST /tree/nodes/{path}/move` |
| 排序节点 | `POST /tree/nodes/{path}/reorder` |
| 特性转目录 | `POST /tree/nodes/{path}/convert-feature-to-directory` |

### 8.4 校验能力

| 能力 | 建议接口 |
| --- | --- |
| 校验父子关系 | `POST /tree/validate/parent-child` |
| 校验执行版本模式 | `POST /tree/validate/execution-mode` |
| 校验整棵树 | `POST /tree/validate/tree` |

## 9. 前端交互设计建议

左树右详情页面建议拆成三块状态：

1. 树状态
2. 当前节点详情状态
3. 动态字段定义状态

### 9.1 树状态

- 当前选中节点路径
- 展开节点集合
- 搜索关键字
- 懒加载缓存

### 9.2 详情状态

- 当前节点基础字段
- `extFields`
- 当前节点可执行动作
- 当前节点子对象列表

### 9.3 右侧动作栏

根据 `type` 和上下文决定按钮显隐：

- 新建
- 编辑
- 删除
- 移动
- 转目录

## 10. 校验实现设计

建议把核心校验独立成无 UI 依赖的脚本或服务模块，保证：

- 后端可复用
- 前端提交前可复用
- 单测可直接调用

本次交付中会提供：

- 一个 Python 规则校验脚本
- 一组 JSON 树结构夹具
- 一组单元测试

## 11. 当前设计假设

为便于先落盘，当前设计采用以下假设：

1. `测试版本` 与 `执行版本` 暂时等同
2. `测试项` 与 `特性` 暂时等同
3. 基线版本下的用例统一认定为基线用例
4. 执行版本下的用例统一认定为执行用例
5. 场景下的目录若直接出现，必须带 `convertedFrom=feature`

如果后续业务确认不同，优先调整规则配置和校验逻辑，不优先重写整体模型。
