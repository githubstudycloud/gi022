# 测试树完整结构规格文档

## 1. 文档目标

这份文档用于沉淀一份“可长期维护”的结构规格，而不是只描述当前一次性的树例子。

重点解决四件事：

1. 先定义稳定的字段别名层
2. 再定义显示名称别名层
3. 给你预留“实际字段 ID / 实际字段名”的映射位
4. 把当前确认的业务关系和限制规则完整梳理清楚

这意味着：

- 你的真实字段名后面可以改
- 你的真实字段 ID 后面可以变
- 结构规则后面可以扩充
- 但这份文档里的“别名层”尽量保持稳定

## 2. 使用原则

后续无论是文档、接口、前端页面、后端校验，建议都先引用这份文档里的“别名”，再映射到你的真实字段。

建议分三层理解：

1. 结构别名
2. 显示名称别名
3. 实际字段映射

不要让代码、文档、接口直接绑定真实字段名，否则后续字段改名会导致整套材料一起失真。

## 3. 节点类型别名

这层建议长期稳定。

| 类型别名 | 显示名称别名 | 当前含义 | 备注 |
| --- | --- | --- | --- |
| `space` | `node.space` | 空间 | 顶层业务空间 |
| `product` | `node.product` | 产品 | 产品节点 |
| `baseline_version` | `node.baselineVersion` | 基线版本 | 基线侧版本节点 |
| `container_version` | `node.containerVersion` | 容器版本 | 当前按基线侧能力处理 |
| `execution_version` | `node.executionVersion` | 执行版本 | 与测试版本同义 |
| `case_container` | `node.caseContainer` | 用例容器 | 版本下直属容器 |
| `test_scene` | `node.testScene` | 测试场景 | 执行版本分组节点 |
| `directory` | `node.directory` | 目录 | 与测试项同义 |
| `feature` | `node.feature` | 特性 | 与目录等价，可互转 |
| `baseline_case` | `node.baselineCase` | 基线用例 | 基线侧用例 |
| `execution_case` | `node.executionCase` | 执行用例 | 执行侧用例 |

## 4. 核心字段别名

这层定义“结构语义”，不是你的真实字段名。

| 字段别名 | 显示名称别名 | 含义 | 是否核心 | 备注 |
| --- | --- | --- | --- | --- |
| `node.path` | `field.path` | 节点全路径 | 是 | 对应长 ID 路径 |
| `node.shortRef` | `field.shortRef` | 短 ID / 短引用 | 是 | 不允许包含 `/` |
| `node.selfId` | `field.selfId` | 当前层级 ID | 是 | 应与路径最后一段一致 |
| `node.parentPath` | `field.parentPath` | 父路径 | 否 | 可由路径推导 |
| `node.type` | `field.type` | 节点类型 | 是 | 引用类型别名 |
| `node.name` | `field.name` | 节点名称 | 是 | 展示主标题 |
| `node.code` | `field.code` | 节点编号 | 是 | 对应 number |
| `node.sort` | `field.sort` | 排序值 | 否 | 同级排序 |
| `node.status` | `field.status` | 状态 | 否 | 启用、草稿等 |
| `node.ext` | `field.ext` | 扩展字段容器 | 是 | 100+ 动态字段挂载位 |
| `node.children` | `field.children` | 子节点集合 | 是 | 树下级 |

## 5. 元信息字段别名

这层用于表达结构控制信息。

| 字段别名 | 显示名称别名 | 含义 | 当前用途 |
| --- | --- | --- | --- |
| `meta.lockedShape` | `field.lockedShape` | 执行版本锁定形态 | `container_direct` / `scene_grouped` |
| `meta.sourceVersionType` | `field.sourceVersionType` | 来源版本上下文 | `baseline_version` / `container_version` / `execution_version` |
| `meta.typeConvertible` | `field.typeConvertible` | 是否允许目录/特性互转 | `true/false` |
| `meta.reserved` | `field.reserved` | 保留扩展元数据 | 未来扩展位 |

## 6. 显示名称别名

显示名称别名不要直接写死成中文文本，建议也做一层键名，后续你可以接 i18n 或字典。

| 显示名称别名 | 默认中文 | 默认说明 |
| --- | --- | --- |
| `label.treeTitle` | 测试树 | 左侧树标题 |
| `label.detailTitle` | 节点详情 | 右侧详情标题 |
| `label.baselineBranch` | 基线侧结构 | 基线与容器分支 |
| `label.executionBranch` | 执行侧结构 | 执行分支 |
| `label.containerDirect` | 容器直挂内容 | 执行版本形态一 |
| `label.sceneGrouped` | 场景分组 | 执行版本形态二 |
| `label.onlyCaseContainer` | 唯一直属用例容器 | 直属关系限制 |
| `label.caseMustUnderLeafHolder` | 用例必须挂在目录或特性下 | 用例创建限制 |
| `label.typeConvertible` | 目录与特性可互转 | 类型转换限制 |

## 7. 实际字段映射预留表

下面这张表专门留给你填真实字段。
建议后续先填这张表，再去写接口和代码。

| 字段别名 | 当前默认示例 | 你的实际字段 ID | 你的实际字段名 | 备注 |
| --- | --- | --- | --- | --- |
| `node.path` | `longIdPath` |  |  | 长 ID 路径 |
| `node.shortRef` | `shortId` |  |  | 短 ID |
| `node.selfId` | `currentLevelId` |  |  | 当前层级 ID |
| `node.parentPath` | `parentLongIdPath` |  |  | 父路径 |
| `node.type` | `type` |  |  | 节点类型 |
| `node.name` | `name` |  |  | 节点名称 |
| `node.code` | `number` |  |  | 节点编号 |
| `node.sort` | `sortOrder` |  |  | 排序字段 |
| `node.status` | `status` |  |  | 状态字段 |
| `node.ext` | `extFields` |  |  | 扩展字段对象 |
| `node.children` | `children` |  |  | 子节点字段 |
| `meta.lockedShape` | `meta.lockedMode` |  |  | 执行版本锁定形态 |
| `meta.sourceVersionType` | `meta.sourceVersionType` |  |  | 来源版本上下文 |
| `meta.typeConvertible` | `meta.typeConvertible` |  |  | 是否允许互转 |

## 8. 实际显示名称映射预留表

下面这张表留给你填你系统里的真实显示名、字段标题、页面文案。

| 显示名称别名 | 当前默认中文 | 你的实际显示名 | 备注 |
| --- | --- | --- | --- |
| `node.space` | 空间 |  | 节点类型显示名 |
| `node.product` | 产品 |  | 节点类型显示名 |
| `node.baselineVersion` | 基线版本 |  | 节点类型显示名 |
| `node.containerVersion` | 容器版本 |  | 节点类型显示名 |
| `node.executionVersion` | 执行版本 |  | 节点类型显示名 |
| `node.caseContainer` | 用例容器 |  | 节点类型显示名 |
| `node.testScene` | 测试场景 |  | 节点类型显示名 |
| `node.directory` | 目录 |  | 节点类型显示名 |
| `node.feature` | 特性 |  | 节点类型显示名 |
| `node.baselineCase` | 基线用例 |  | 节点类型显示名 |
| `node.executionCase` | 执行用例 |  | 节点类型显示名 |
| `field.path` | 长路径 |  | 字段显示名 |
| `field.shortRef` | 短 ID |  | 字段显示名 |
| `field.selfId` | 当前层级 ID |  | 字段显示名 |
| `field.type` | 节点类型 |  | 字段显示名 |
| `field.name` | 节点名称 |  | 字段显示名 |
| `field.code` | 节点编号 |  | 字段显示名 |
| `field.ext` | 扩展字段 |  | 字段显示名 |

## 9. 建议的标准节点结构

这里的结构仍然使用“别名层”，不是实际字段层。

```ts
type StandardTreeNode = {
  "node.path": string;
  "node.shortRef": string;
  "node.selfId": string;
  "node.parentPath"?: string | null;
  "node.type": NodeType;
  "node.name": string;
  "node.code": string;
  "node.sort"?: number;
  "node.status"?: string;
  "meta.lockedShape"?: "container_direct" | "scene_grouped";
  "meta.sourceVersionType"?: "baseline_version" | "container_version" | "execution_version" | null;
  "meta.typeConvertible"?: boolean;
  "node.ext"?: Record<string, unknown>;
  "node.children"?: StandardTreeNode[];
};
```

## 10. 当前确认的业务结构关系

### 10.1 顶层关系

```text
space
├─ product
├─ baseline_version
└─ container_version
```

约束：

- `space` 下允许直接挂 `product`
- `space` 下允许直接挂 `baseline_version`
- `space` 下允许直接挂 `container_version`

### 10.2 产品下关系

```text
product
├─ baseline_version
└─ container_version
```

约束：

- `product` 下允许直接挂 `baseline_version`
- `product` 下允许直接挂 `container_version`

### 10.3 基线版本与容器版本下关系

```text
baseline_version
├─ case_container(唯一)
└─ execution_version(*)
```

```text
container_version
├─ case_container(唯一)
└─ execution_version(*)
```

约束：

- 基线版本和容器版本都只能有一个直属 `case_container`
- 除直属 `case_container` 外，其余直属子节点只能是并列的 `execution_version`
- 不能直接挂目录
- 不能直接挂特性
- 不能直接挂场景
- 不能直接挂用例

### 10.4 基线版本与容器版本的用例容器关系

```text
case_container
├─ directory
│  └─ baseline_case
└─ feature
   └─ baseline_case
```

约束：

- 基线版本和容器版本的 `case_container` 下是基线侧内容
- `case_container` 下可以直接挂 `directory`
- `case_container` 下可以直接挂 `feature`
- `case_container` 下不能直接挂 `baseline_case`
- `baseline_case` 必须挂在 `directory` 或 `feature` 下

### 10.5 执行版本下关系

```text
execution_version
└─ case_container(唯一)
```

约束：

- 执行版本的直属子节点只允许一个 `case_container`
- 执行版本不能直接挂目录
- 执行版本不能直接挂特性
- 执行版本不能直接挂场景
- 执行版本不能直接挂用例

## 11. 执行版本的两种锁定形态

### 11.1 形态一：容器直挂内容

```text
execution_version
└─ case_container
   ├─ directory
   │  └─ execution_case
   └─ feature
      └─ execution_case
```

约束：

- `meta.lockedShape = container_direct`
- `case_container` 下可以直接挂 `directory`
- `case_container` 下可以直接挂 `feature`
- `case_container` 下不能直接挂 `execution_case`
- `execution_case` 必须挂在 `directory` 或 `feature` 下
- 该形态下不能再新增 `test_scene`

### 11.2 形态二：场景分组

```text
execution_version
└─ case_container
   ├─ test_scene
   │  ├─ directory
   │  │  └─ execution_case
   │  └─ feature
   │     └─ execution_case
   └─ test_scene
```

约束：

- `meta.lockedShape = scene_grouped`
- `case_container` 下一旦挂了 `test_scene`
- 后续目录、特性、执行用例都只能建在 `test_scene` 下
- `case_container` 下不能再直接建 `directory`
- `case_container` 下不能再直接建 `feature`
- `case_container` 下不能再直接建 `execution_case`
- `test_scene` 下不能直接建 `execution_case`
- `execution_case` 必须挂在 `directory` 或 `feature` 下

### 11.3 锁定规则

执行版本一旦形成某种结构，就视为锁定，不允许切换。

建议通过：

- `meta.lockedShape`

明确标记当前形态。

## 12. 目录与特性的关系

```text
directory <-> feature
```

当前口径：

- `directory` 与 `feature` 等价
- 两者都可以继续挂：
  - `directory`
  - `feature`
  - 用例
- 两者可以互改 `type`
- 当前默认只改 `type`
- 节点路径、主键、短 ID、当前层级 ID 保持不变

## 13. 当前限制规则清单

### 13.1 唯一限制

1. `baseline_version` 必须且仅有一个直属 `case_container`
2. `container_version` 必须且仅有一个直属 `case_container`
3. `execution_version` 必须且仅有一个直属 `case_container`

### 13.2 禁止直接挂载规则

1. `baseline_version` 不能直接挂目录
2. `baseline_version` 不能直接挂特性
3. `baseline_version` 不能直接挂场景
4. `baseline_version` 不能直接挂用例
5. `container_version` 不能直接挂目录
6. `container_version` 不能直接挂特性
7. `container_version` 不能直接挂场景
8. `container_version` 不能直接挂用例
9. `execution_version` 不能直接挂目录
10. `execution_version` 不能直接挂特性
11. `execution_version` 不能直接挂场景
12. `execution_version` 不能直接挂用例
13. `case_container` 不能直接挂用例
14. `test_scene` 不能直接挂用例

### 13.3 用例归属规则

1. `baseline_version` 上下文中的目录/特性下面的用例是 `baseline_case`
2. `container_version` 上下文中的目录/特性下面的用例是 `baseline_case`
3. `execution_version` 上下文中的目录/特性下面的用例是 `execution_case`

### 13.4 结构互斥规则

1. `container_direct` 与 `scene_grouped` 两种形态不能混用
2. 进入 `scene_grouped` 后，`case_container` 下不能再直接出现目录或特性
3. 进入 `container_direct` 后，`case_container` 下不能再直接出现场景

## 14. 你后续建议填充的内容

如果你准备把这份规格继续推进到可实现阶段，建议优先补这三块：

1. 实际字段映射表
2. 实际显示名称映射表
3. 右侧详情字段分组定义

## 15. 文档落地建议

后续如果进入代码阶段，建议这样使用：

1. 文档和评审先看别名层
2. 接口定义维护“别名 -> 实际字段”的映射
3. 前端显示层维护“显示名称别名 -> 实际显示名”的映射
4. 校验脚本基于别名规则工作，不直接绑定真实字段名
