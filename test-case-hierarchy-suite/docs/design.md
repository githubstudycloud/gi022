# 测试树场景设计文档

## 1. 设计目标

本设计目标是把复杂业务树拆解为：

- 稳定的核心节点模型
- 明确的父子关系规则
- 可扩展的动态字段机制
- 可单独运行的树校验模块
- 与文档一致的技能化输出模板

## 2. 设计原则

### 2.1 核心字段稳定，扩展字段外置

固定字段只承载树结构最小集，重业务字段统一放在扩展字段中。

### 2.2 关系规则显式配置

不要把树规则散落在多个接口或组件里，应由统一规则源定义：

- 哪些父节点允许哪些子节点
- 哪些节点必须唯一
- 哪些节点存在锁定形态
- 哪些节点禁止直接挂用例

### 2.3 结构规则优先于交互规则

当前版本的重点不是“场景下目录必须从特性转换”。
当前版本的重点是：

- 目录与特性等价
- 两者可互改 `type`
- 用例只能挂在目录或特性下

## 3. 总体方案

建议采用四层模型：

1. 树节点核心模型
2. 节点关系规则模型
3. 动态字段定义模型
4. 校验与操作服务

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
    "lockedMode": null,
    "sourceVersionType": "baseline_version"
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
| `meta.lockedMode` | 执行版本锁定形态，建议值为 `container_direct` 或 `scene_grouped` |
| `meta.sourceVersionType` | 用于表达当前节点处于基线/容器/执行上下文 |
| `extFields` | 扩展字段容器 |

## 5. 节点类型与关系矩阵

建议的允许子节点关系如下：

| 父类型 | 允许子类型 |
| --- | --- |
| `space` | `product`, `baseline_version`, `container_version` |
| `product` | `baseline_version`, `container_version` |
| `baseline_version` | `case_container`, `execution_version` |
| `container_version` | `case_container`, `execution_version` |
| `execution_version` | `case_container` |
| `case_container` | `directory`, `feature`, `test_scene` |
| `test_scene` | `directory`, `feature` |
| `directory` | `directory`, `feature`, `baseline_case`, `execution_case` |
| `feature` | `directory`, `feature`, `baseline_case`, `execution_case` |

### 5.1 附加约束

- `baseline_version` 下面必须且仅能有一个 `case_container`
- `container_version` 下面必须且仅能有一个 `case_container`
- `execution_version` 下面必须且仅能有一个 `case_container`
- `baseline_version` 和 `container_version` 的其他直属子节点都必须是 `execution_version`
- `case_container` 下面不能直接挂用例
- `test_scene` 下面不能直接挂用例
- `feature` 和 `directory` 下面才允许挂用例

## 6. 上下文判定设计

### 6.1 用例类型判定

按最近版本上下文判定用例类型：

- 最近上下文是 `baseline_version` 或 `container_version`，则目录/特性下的用例必须为 `baseline_case`
- 最近上下文是 `execution_version`，则目录/特性下的用例必须为 `execution_case`

### 6.2 执行版本的锁定形态

执行版本存在两种组织形态：

1. `container_direct`
2. `scene_grouped`

建议把该信息固定在：

```json
{
  "meta": {
    "lockedMode": "container_direct"
  }
}
```

或：

```json
{
  "meta": {
    "lockedMode": "scene_grouped"
  }
}
```

规则如下：

- `container_direct`
  - `execution_version -> case_container -> directory | feature -> execution_case`
  - `case_container` 下不能出现 `test_scene`
- `scene_grouped`
  - `execution_version -> case_container -> test_scene -> directory | feature -> execution_case`
  - `case_container` 下不能再直接挂 `directory` 或 `feature`

执行版本一旦形成某种形态，不允许切换。

## 7. 动态字段设计

### 7.1 字段定义模型

建议额外维护字段定义：

```json
{
  "type": "execution_version",
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

- 树上仅渲染少量字段：名称、编号、状态、类型
- 右侧详情区按 `type + fieldDefinitions` 动态渲染
- 扩展字段统一落在 `extFields`
- 增加字段时优先新增定义，不直接改核心结构

## 8. API 设计建议

### 8.1 树能力

| 能力 | 建议接口 |
| --- | --- |
| 查询树 | `GET /tree/nodes` |
| 查询子节点 | `GET /tree/nodes/{path}/children` |
| 查询节点摘要 | `GET /tree/nodes/{path}/summary` |

### 8.2 节点详情能力

| 能力 | 建议接口 |
| --- | --- |
| 查询详情 | `GET /tree/nodes/{path}/detail` |
| 查询字段定义 | `GET /tree/node-types/{type}/fields` |
| 查询可执行动作 | `GET /tree/nodes/{path}/actions` |

### 8.3 写操作能力

| 能力 | 建议接口 |
| --- | --- |
| 创建节点 | `POST /tree/nodes` |
| 修改节点 | `PATCH /tree/nodes/{path}` |
| 删除节点 | `DELETE /tree/nodes/{path}` |
| 移动节点 | `POST /tree/nodes/{path}/move` |
| 排序节点 | `POST /tree/nodes/{path}/reorder` |
| 目录改特性 | `POST /tree/nodes/{path}/convert-to-feature` |
| 特性改目录 | `POST /tree/nodes/{path}/convert-to-directory` |

### 8.4 校验能力

| 能力 | 建议接口 |
| --- | --- |
| 校验父子关系 | `POST /tree/validate/parent-child` |
| 校验执行版本形态 | `POST /tree/validate/execution-shape` |
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

### 9.3 右侧动作控制

根据 `type` 和上下文决定按钮显隐：

- 新建目录
- 新建特性
- 新建用例
- 新建执行版本
- 目录改特性
- 特性改目录

其中“新建用例”按钮只应出现在 `directory` 或 `feature` 节点下。

## 10. 校验实现设计

建议把核心校验独立成无 UI 依赖的脚本或服务模块，保证：

- 后端可复用
- 前端提交前可复用
- 单测可直接调用

本次交付中将提供：

- 一个 Python 规则校验脚本
- 多个 JSON 树结构夹具
- 一组单元测试

## 11. 当前设计结论

当前设计采用以下已确认结论：

1. `测试版本` 与 `执行版本` 等同
2. `测试项` 按 `directory` 处理
3. `container_version` 按基线侧上下文处理
4. `baseline_version`、`container_version`、`execution_version` 都必须唯一直属 `case_container`
5. `case_container` 和 `test_scene` 下都不能直接建用例
6. `feature` 与 `directory` 等价且允许互改 `type`
7. `execution_version` 的组织形态一旦确定，不允许切换
