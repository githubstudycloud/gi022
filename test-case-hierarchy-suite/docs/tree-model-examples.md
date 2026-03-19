# 测试树模型结构草案

## 1. 文档目的

这份文档不是最终实现，而是把当前理解下的“模型树数据结构”先用 Markdown 方式展开，方便你确认：

- 节点公共结构是否合理
- 不同类型节点的层级关系是否符合你的业务
- 哪些约束需要固化成规则
- 哪些地方仍然需要你拍板

当前草案默认：

- `测试版本` 先视为 `执行版本`
- `测试项` 先视为 `特性`

如果这两个假设不成立，后面要拆类型。

## 2. 节点公共结构

先不管节点属于哪一种类型，所有树节点先统一成一个公共结构。

```ts
type TreeNode = {
  longIdPath: string;
  shortId: string;
  currentLevelId: string;
  type: NodeType;
  name: string;
  number: string;
  parentLongIdPath?: string | null;
  sortOrder?: number;
  status?: string;
  meta?: {
    executionMode?: "single_container" | "multi_scene";
    convertedFrom?: "feature" | null;
    sourceVersionType?: "baseline_version" | "execution_version" | null;
    dynamicFieldSchemaId?: string | null;
    [key: string]: unknown;
  };
  extFields?: Record<string, unknown>;
  children?: TreeNode[];
};
```

## 3. 节点类型建议

```ts
type NodeType =
  | "space"
  | "product"
  | "container_version"
  | "baseline_version"
  | "execution_version"
  | "case_container"
  | "test_scene"
  | "feature"
  | "directory"
  | "baseline_case"
  | "execution_case";
```

## 4. 不同类型的额外语义

| 类型 | 说明 | 典型额外字段 |
| --- | --- | --- |
| `space` | 顶层业务空间 | 空间编码、负责人 |
| `product` | 产品节点 | 产品线、产品状态 |
| `container_version` | 容器版本 | 来源、版本号、适用范围 |
| `baseline_version` | 基线版本 | 基线状态、生效时间 |
| `execution_version` | 执行版本 | `meta.executionMode` |
| `case_container` | 用例容器 | 容器类型、规则模板 |
| `test_scene` | 测试场景 | 场景标签、入口条件 |
| `feature` | 特性/测试项 | 特性描述、归属模块 |
| `directory` | 目录 | `meta.convertedFrom` |
| `baseline_case` | 基线用例 | 基线来源、冻结状态 |
| `execution_case` | 执行用例 | 执行状态、结果、执行人 |

## 5. 例子一：空间 -> 产品 -> 基线版本 -> 用例容器 -> 目录/特性 -> 基线用例

这是“产品下面挂基线版本”的典型结构。

```json
{
  "longIdPath": "space-1",
  "shortId": "SP-1",
  "currentLevelId": "space-1",
  "type": "space",
  "name": "主空间",
  "number": "SPACE-001",
  "children": [
    {
      "longIdPath": "space-1/product-1",
      "shortId": "PD-1",
      "currentLevelId": "product-1",
      "type": "product",
      "name": "产品A",
      "number": "PROD-001",
      "children": [
        {
          "longIdPath": "space-1/product-1/baseline-1",
          "shortId": "BL-1",
          "currentLevelId": "baseline-1",
          "type": "baseline_version",
          "name": "基线版本A",
          "number": "BL-001",
          "children": [
            {
              "longIdPath": "space-1/product-1/baseline-1/container-1",
              "shortId": "CC-1",
              "currentLevelId": "container-1",
              "type": "case_container",
              "name": "基线用例容器",
              "number": "CC-001",
              "children": [
                {
                  "longIdPath": "space-1/product-1/baseline-1/container-1/dir-1",
                  "shortId": "DIR-1",
                  "currentLevelId": "dir-1",
                  "type": "directory",
                  "name": "一级目录",
                  "number": "DIR-001",
                  "children": [
                    {
                      "longIdPath": "space-1/product-1/baseline-1/container-1/dir-1/feature-1",
                      "shortId": "FT-1",
                      "currentLevelId": "feature-1",
                      "type": "feature",
                      "name": "登录特性",
                      "number": "FEAT-001",
                      "children": [
                        {
                          "longIdPath": "space-1/product-1/baseline-1/container-1/dir-1/feature-1/case-1",
                          "shortId": "BC-1",
                          "currentLevelId": "case-1",
                          "type": "baseline_case",
                          "name": "基线用例1",
                          "number": "CASE-001"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 这个例子的约束

- `space` 可以挂 `product`
- `product` 可以挂 `baseline_version`
- `baseline_version` 必须有且仅有一个 `case_container`
- `case_container` 下允许 `directory` 和 `feature`
- `directory` 和 `feature` 下都允许继续挂 `directory`、`feature`、`baseline_case`
- 在 `baseline_version` 上下文下，用例必须是 `baseline_case`

## 6. 例子二：空间直接挂基线版本，再挂多个执行版本

这是“空间下直接挂基线版本”的结构。

```yaml
space
└─ baseline_version
   ├─ case_container
   │  ├─ directory
   │  ├─ feature
   │  └─ baseline_case
   ├─ execution_version(exec-A)
   ├─ execution_version(exec-B)
   └─ execution_version(exec-C)
```

### 这个例子的约束

- `space` 可以直接挂 `baseline_version`
- 一个 `baseline_version` 下可以挂多个 `execution_version`
- 但同一个 `baseline_version` 下只能有一个直属 `case_container`

## 7. 例子三：执行版本单容器模式

这是“执行版本下面挂单个容器版本”的模式。

```json
{
  "type": "execution_version",
  "name": "执行版本A",
  "meta": {
    "executionMode": "single_container"
  },
  "children": [
    {
      "type": "container_version",
      "name": "执行容器版本A",
      "children": []
    }
  ]
}
```

### 这个例子的约束

- `execution_version.meta.executionMode = "single_container"`
- 该模式下只能有一个 `container_version`
- 该模式下不能再有 `test_scene`
- 也不能同时出现“一个容器版本 + 多个场景”

## 8. 例子四：执行版本多场景模式

这是“执行版本下面挂多个场景”的模式。

```json
{
  "type": "execution_version",
  "name": "执行版本B",
  "meta": {
    "executionMode": "multi_scene"
  },
  "children": [
    {
      "type": "test_scene",
      "name": "支付场景",
      "children": [
        {
          "type": "feature",
          "name": "支付特性",
          "children": [
            {
              "type": "directory",
              "name": "支付目录",
              "meta": {
                "convertedFrom": "feature"
              },
              "children": [
                {
                  "type": "execution_case",
                  "name": "执行用例1"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "test_scene",
      "name": "退款场景",
      "children": []
    }
  ]
}
```

### 这个例子的约束

- `execution_version.meta.executionMode = "multi_scene"`
- 该模式下至少有一个 `test_scene`
- 该模式下不能有 `container_version`
- `test_scene` 下初始只能先建 `feature`
- 如果 `test_scene` 下面直接出现 `directory`，需要满足：

```json
{
  "type": "directory",
  "meta": {
    "convertedFrom": "feature"
  }
}
```

- 在 `execution_version` 上下文下，用例必须是 `execution_case`

## 9. 例子五：目录和特性的递归嵌套

当前理解下，目录和特性都可以继续嵌套目录、特性、用例。

```yaml
case_container
├─ directory(dir-A)
│  ├─ directory(dir-B)
│  │  └─ baseline_case(case-1)
│  └─ feature(feature-A)
│     └─ baseline_case(case-2)
└─ feature(feature-B)
   ├─ feature(feature-C)
   └─ directory(dir-C)
      └─ baseline_case(case-3)
```

### 这个例子的约束

- `directory` 可嵌套 `directory`
- `directory` 可嵌套 `feature`
- `feature` 可嵌套 `feature`
- `feature` 可嵌套 `directory`
- 最底层用例类型由最近版本上下文决定，不由目录或特性本身决定

## 10. 动态字段的大致落位

你说每个节点有 100+ 字段并且还会继续扩，这里建议不要都平铺在根节点。

建议结构：

```json
{
  "longIdPath": "space-1/product-1/baseline-1",
  "shortId": "BL-1",
  "currentLevelId": "baseline-1",
  "type": "baseline_version",
  "name": "基线版本A",
  "number": "BL-001",
  "extFields": {
    "owner": "u-1001",
    "priority": "P1",
    "milestone": "M3",
    "custom_001": "xxx",
    "custom_002": 123,
    "custom_003": true
  }
}
```

## 11. 我建议先固化的硬约束

这些约束建议后面直接进入规则引擎或后端校验：

### 11.1 结构约束

1. `space -> product | container_version | baseline_version`
2. `product -> container_version | baseline_version`
3. `baseline_version -> case_container(唯一) | execution_version(*)`
4. `container_version -> case_container(?) | execution_version(*)`
5. `case_container -> directory | feature`
6. `execution_version -> container_version XOR test_scene+`
7. `directory | feature -> directory | feature | case`

### 11.2 语义约束

1. `longIdPath` 最后一段必须等于 `currentLevelId`
2. `shortId` 不能包含 `/`
3. 每个节点都必须有 `type/name/number`
4. 基线上下文中的用例必须是 `baseline_case`
5. 执行上下文中的用例必须是 `execution_case`
6. 场景下直接出现的目录必须记录 `meta.convertedFrom = "feature"`

### 11.3 模式约束

1. `execution_version` 只能处于一种模式
2. `single_container` 模式下只能有一个 `container_version`
3. `multi_scene` 模式下只能有一个或多个 `test_scene`
4. 两种模式不能混用

## 12. 当前最需要你确认的点

这几个点你一确认，后面模型就能基本定下来：

1. `测试版本` 是否就是 `执行版本`
2. `测试项` 是否就是 `特性`
3. `container_version` 下如果直接挂 `case_container`，其中的用例最终属于哪类
4. `case_container` 是否只允许出现在 `container_version` / `baseline_version` 下面，还是 `execution_version` 或 `test_scene` 下面也可能出现
5. `test_scene` 下是否真的允许“最终形态”出现直接子 `directory`
6. `baseline_version` 下“唯一用例容器”是强约束，还是当前业务习惯
7. `execution_version` 切模式时，旧子树是禁止保留、自动迁移，还是允许脏状态存在

## 13. 如果你确认无误，我下一步建议

如果这份树模型你认可，我建议下一步继续补这三块：

1. 父子关系矩阵表
2. 各类型节点详情字段分组模型
3. 接口入参与返回结构草案
