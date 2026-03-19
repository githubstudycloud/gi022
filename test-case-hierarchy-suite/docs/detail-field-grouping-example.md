# 右侧详情字段分组与动态字段模板示例

## 1. 文档用途

这份文档不是定义你的真实字段，而是先给一套“右侧详情如何分组”的模板。

目标是：

- 先定义分组别名
- 先定义字段别名
- 给你预留真实字段 ID / 字段名 / 显示名
- 让动态字段后续能挂进固定分组里

## 2. 分组设计原则

右侧详情建议分成两类：

1. 固定分组
2. 动态扩展分组

固定分组用来放结构上稳定的字段。
动态扩展分组用来放后续业务增长字段。

## 3. 分组别名建议

| 分组别名 | 默认中文 | 用途 |
| --- | --- | --- |
| `group.basicIdentity` | 基础标识 | 路径、类型、名称、编号等 |
| `group.structureControl` | 结构控制 | 形态、来源版本、是否可互转等 |
| `group.statusAndOrder` | 状态与排序 | 状态、排序、启用标记 |
| `group.businessCore` | 业务核心 | 当前类型核心业务字段 |
| `group.auditInfo` | 审计信息 | 创建人、更新时间等 |
| `group.dynamicExtension` | 动态扩展字段 | 100+ 扩展字段 |

## 4. 固定字段分组模板

### 4.1 基础标识组

| 字段别名 | 默认中文 | 当前默认示例 | 你的实际字段 ID | 你的实际字段名 | 你的实际显示名 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `node.path` | 长路径 | `longIdPath` |  |  |  | 建议只读 |
| `node.shortRef` | 短 ID | `shortId` |  |  |  | 建议只读 |
| `node.selfId` | 当前层级 ID | `currentLevelId` |  |  |  | 建议只读 |
| `node.type` | 节点类型 | `type` |  |  |  | 可显示类型别名 |
| `node.name` | 节点名称 | `name` |  |  |  | 主标题字段 |
| `node.code` | 节点编号 | `number` |  |  |  | 主编号字段 |

### 4.2 结构控制组

| 字段别名 | 默认中文 | 当前默认示例 | 你的实际字段 ID | 你的实际字段名 | 你的实际显示名 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `meta.lockedShape` | 执行版本锁定形态 | `meta.lockedMode` |  |  |  | 执行版本专用 |
| `meta.sourceVersionType` | 来源版本上下文 | `meta.sourceVersionType` |  |  |  | 基线/容器/执行 |
| `meta.typeConvertible` | 是否允许类型互转 | `meta.typeConvertible` |  |  |  | 目录/特性互转控制 |

### 4.3 状态与排序组

| 字段别名 | 默认中文 | 当前默认示例 | 你的实际字段 ID | 你的实际字段名 | 你的实际显示名 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `node.status` | 状态 | `status` |  |  |  | 启用/草稿等 |
| `node.sort` | 排序值 | `sortOrder` |  |  |  | 同级排序 |

### 4.4 审计信息组

| 字段别名 | 默认中文 | 当前默认示例 | 你的实际字段 ID | 你的实际字段名 | 你的实际显示名 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `audit.createdBy` | 创建人 | `createdBy` |  |  |  | 预留 |
| `audit.createdAt` | 创建时间 | `createdAt` |  |  |  | 预留 |
| `audit.updatedBy` | 更新人 | `updatedBy` |  |  |  | 预留 |
| `audit.updatedAt` | 更新时间 | `updatedAt` |  |  |  | 预留 |

## 5. 按节点类型的业务核心分组示例

### 5.1 基线版本 / 容器版本

| 分组别名 | 建议字段别名 | 备注 |
| --- | --- | --- |
| `group.businessCore` | `biz.versionOwner` | 负责人 |
| `group.businessCore` | `biz.versionState` | 版本状态 |
| `group.businessCore` | `biz.versionDesc` | 版本描述 |
| `group.businessCore` | `biz.versionTag` | 版本标签 |

### 5.2 执行版本

| 分组别名 | 建议字段别名 | 备注 |
| --- | --- | --- |
| `group.businessCore` | `meta.lockedShape` | 执行版本最关键控制字段 |
| `group.businessCore` | `biz.executionOwner` | 执行负责人 |
| `group.businessCore` | `biz.executionState` | 执行状态 |
| `group.businessCore` | `biz.executionDesc` | 执行说明 |

### 5.3 用例容器

| 分组别名 | 建议字段别名 | 备注 |
| --- | --- | --- |
| `group.businessCore` | `biz.containerOwner` | 容器负责人 |
| `group.businessCore` | `biz.containerDesc` | 容器说明 |
| `group.businessCore` | `biz.containerRuleSet` | 容器规则集 |

### 5.4 场景

| 分组别名 | 建议字段别名 | 备注 |
| --- | --- | --- |
| `group.businessCore` | `biz.sceneOwner` | 场景负责人 |
| `group.businessCore` | `biz.sceneDesc` | 场景说明 |
| `group.businessCore` | `biz.sceneTag` | 场景标签 |

### 5.5 目录 / 特性

| 分组别名 | 建议字段别名 | 备注 |
| --- | --- | --- |
| `group.businessCore` | `biz.nodeDesc` | 节点说明 |
| `group.businessCore` | `biz.nodeTag` | 节点标签 |
| `group.businessCore` | `biz.nodeOwner` | 节点负责人 |

### 5.6 基线用例 / 执行用例

| 分组别名 | 建议字段别名 | 备注 |
| --- | --- | --- |
| `group.businessCore` | `biz.caseLevel` | 用例等级 |
| `group.businessCore` | `biz.casePriority` | 优先级 |
| `group.businessCore` | `biz.caseDesc` | 用例描述 |
| `group.businessCore` | `biz.caseOwner` | 用例负责人 |
| `group.businessCore` | `biz.caseResult` | 执行结果，执行用例更常见 |

## 6. 动态字段模板

建议把动态字段定义成单独配置，而不是直接散在页面里。

```ts
type DynamicFieldDefinition = {
  fieldAlias: string;
  displayAlias: string;
  targetTypes: string[];
  groupAlias: string;
  defaultFieldName?: string;
  actualFieldId?: string;
  actualFieldName?: string;
  actualDisplayName?: string;
  componentType?: string;
  valueType?: "string" | "number" | "boolean" | "date" | "user" | "enum" | "json";
  required?: boolean;
  readonly?: boolean;
  visibleInTree?: boolean;
  visibleInDetail?: boolean;
  order?: number;
  notes?: string;
};
```

## 7. 动态字段配置表示例

| 字段别名 | 显示名别名 | 作用类型 | 分组别名 | 当前默认字段名 | 你的实际字段 ID | 你的实际字段名 | 你的实际显示名 | 组件类型 | 值类型 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `dyn.owner` | `display.owner` | `baseline_version,container_version,execution_version` | `group.businessCore` | `owner` |  |  |  | `user-select` | `user` | 负责人 |
| `dyn.priority` | `display.priority` | `baseline_case,execution_case` | `group.businessCore` | `priority` |  |  |  | `select` | `enum` | 优先级 |
| `dyn.tag` | `display.tag` | `directory,feature,test_scene` | `group.dynamicExtension` | `tag` |  |  |  | `tag-input` | `string` | 标签 |
| `dyn.remark` | `display.remark` | `*` | `group.dynamicExtension` | `remark` |  |  |  | `textarea` | `string` | 备注 |

## 8. 右侧详情布局示例

### 8.1 基线版本详情

```text
右侧详情
├─ 基础标识
├─ 结构控制
├─ 状态与排序
├─ 业务核心
└─ 动态扩展字段
```

### 8.2 执行版本详情

```text
右侧详情
├─ 基础标识
├─ 结构控制
│  └─ lockedShape
├─ 状态与排序
├─ 业务核心
└─ 动态扩展字段
```

### 8.3 目录 / 特性详情

```text
右侧详情
├─ 基础标识
├─ 业务核心
├─ 动态扩展字段
└─ 子节点摘要
```

## 9. 你后续优先需要补的内容

如果你准备把这套模板落成真实页面，建议下一步优先补：

1. 每个节点类型对应的真实字段映射
2. 每个节点类型对应的真实显示名
3. 哪些分组是只读，哪些可编辑
4. 哪些动态字段在哪些类型下显示
