# 测试树模型结构确认稿

## 1. 这份文档的作用

这份文档只做一件事：

- 用当前已经确认的规则，把这棵树的大致模型结构写清楚
- 主要用“结构树”表达，而不是 JSON
- 把硬约束单独列出来，方便继续核对

## 2. 已确认的统一口径

以下内容按当前最新确认版本整理：

1. `测试版本 = 执行版本`
2. `测试项 = 目录`
3. `容器版本` 在结构能力上等价于 `基线版本`
4. `基线版本` 和 `容器版本` 的直接下级都只允许：
   - 一个 `用例容器`
   - 零个或多个并列的 `执行版本`
5. `基线版本` 和 `容器版本` 的直属 `用例容器` 下都是基线侧内容
6. `执行版本` 的直接下级只允许一个 `用例容器`
7. `执行版本` 有两种组织形态，但创建后不能切换
8. `用例容器` 不能出现在 `场景` 下
9. `用例容器` 和 `场景` 下都不能直接建用例
10. 必须先建 `目录` 或 `特性`，再在其下级建用例
11. `目录` 与 `特性` 等价，可以互改 `type`
12. `目录/特性` 互转时，默认只改 `type`，`id/path` 保持不变

## 3. 当前节点类型

```ts
type NodeType =
  | "space"
  | "product"
  | "baseline_version"
  | "container_version"
  | "execution_version"
  | "case_container"
  | "test_scene"
  | "directory"
  | "feature"
  | "baseline_case"
  | "execution_case";
```

补充说明：

- 这里不再单独保留 `test_item`
- 如果业务里出现“测试项”这个说法，当前先映射成 `directory`
- `feature` 和 `directory` 视为同层级、同能力、可互转

## 4. 节点公共结构

虽然下面主要用结构树举例，但节点本体仍建议统一成一个公共结构。

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
    lockedMode?: "container_direct" | "scene_grouped";
    sourceVersionType?: "baseline_version" | "container_version" | "execution_version" | null;
    [key: string]: unknown;
  };
  extFields?: Record<string, unknown>;
  children?: TreeNode[];
};
```

## 5. 总体结构树

```text
space
├─ product
│  ├─ baseline_version
│  │  ├─ case_container
│  │  │  ├─ directory
│  │  │  │  └─ baseline_case
│  │  │  └─ feature
│  │  │     └─ baseline_case
│  │  └─ execution_version
│  │     └─ case_container
│  │        ├─ directory
│  │        │  └─ execution_case
│  │        ├─ feature
│  │        │  └─ execution_case
│  │        └─ test_scene
│  │           ├─ directory
│  │           │  └─ execution_case
│  │           └─ feature
│  │              └─ execution_case
│  └─ container_version
│     ├─ case_container
│     │  ├─ directory
│     │  │  └─ baseline_case
│     │  └─ feature
│     │     └─ baseline_case
│     └─ execution_version
│        └─ case_container
│           ├─ directory
│           │  └─ execution_case
│           └─ test_scene
│              └─ feature
│                 └─ execution_case
├─ baseline_version
│  ├─ case_container
│  └─ execution_version
└─ container_version
   ├─ case_container
   └─ execution_version
```

## 6. 结构例子一：空间下直接挂基线版本

```text
space(主空间)
└─ baseline_version(基线版本A)
   ├─ case_container(基线用例容器)
   │  ├─ directory(一级目录)
   │  │  ├─ directory(二级目录)
   │  │  │  └─ baseline_case(基线用例1)
   │  │  └─ feature(登录特性)
   │  │     └─ baseline_case(基线用例2)
   │  └─ feature(支付特性)
   │     └─ baseline_case(基线用例3)
   └─ execution_version(执行版本A)
      └─ case_container(执行用例容器)
         ├─ directory(执行目录A)
         │  └─ execution_case(执行用例1)
         └─ feature(执行特性A)
            └─ execution_case(执行用例2)
```

### 这个例子的约束

- `space` 可以直接挂 `baseline_version`
- `baseline_version` 只能直接挂一个 `case_container`
- `baseline_version` 的其他直接子节点只能是并列的 `execution_version`
- `baseline_version` 的 `case_container` 下只能先挂 `directory` 或 `feature`
- `baseline_case` 必须挂在 `directory` 或 `feature` 下

## 7. 结构例子二：产品下挂容器版本

```text
space(主空间)
└─ product(产品A)
   └─ container_version(容器版本A)
      ├─ case_container(容器用例容器)
      │  ├─ directory(冒烟目录)
      │  │  └─ baseline_case(基线类用例1)
      │  └─ feature(核心链路特性)
      │     └─ baseline_case(基线类用例2)
      └─ execution_version(执行版本B)
         └─ case_container(执行用例容器B)
            └─ directory(执行目录B)
               └─ execution_case(执行用例1)
```

### 这个例子的约束

- `product` 可以挂 `container_version`
- `container_version` 只能直接挂一个 `case_container`
- `container_version` 的其他直接子节点只能是并列的 `execution_version`
- `container_version` 分支里的目录/特性下面的用例都是 `baseline_case`

## 8. 结构例子三：执行版本的容器直挂内容形态

```text
execution_version(执行版本A)
└─ case_container(执行用例容器)
   ├─ directory(回归目录)
   │  └─ execution_case(执行用例1)
   ├─ feature(支付特性)
   │  └─ execution_case(执行用例2)
   └─ directory(退款目录)
      └─ execution_case(执行用例3)
```

### 这个例子的约束

- `execution_version` 只能直接挂一个 `case_container`
- 这里的 `case_container` 没有挂 `test_scene`
- `case_container` 下可以直接挂 `directory` 和 `feature`
- `case_container` 下不能直接挂 `execution_case`
- `execution_case` 必须挂在 `directory` 或 `feature` 下

## 9. 结构例子四：执行版本的场景分组形态

```text
execution_version(执行版本B)
└─ case_container(执行用例容器)
   ├─ test_scene(登录场景)
   │  ├─ directory(登录目录)
   │  │  └─ execution_case(执行用例1)
   │  ├─ feature(验证码特性)
   │  │  └─ execution_case(执行用例2)
   │  └─ directory(短信目录)
   │     └─ execution_case(执行用例3)
   └─ test_scene(支付场景)
      ├─ directory(支付目录)
      │  └─ execution_case(执行用例4)
      └─ feature(退款特性)
         └─ execution_case(执行用例5)
```

### 这个例子的约束

- `execution_version` 只能直接挂一个 `case_container`
- `case_container` 一旦挂了 `test_scene`
- 后续 `directory / feature / execution_case` 只能建在 `test_scene` 下
- 不能再直接建在 `case_container` 下
- `test_scene` 下也不能直接挂 `execution_case`
- `execution_case` 必须挂在 `directory` 或 `feature` 下

下面这种结构应视为非法：

```text
execution_version
└─ case_container
   ├─ test_scene
   └─ directory   <- 非法
```

下面这种也应视为非法：

```text
execution_version
└─ case_container
   └─ execution_case   <- 非法
```

## 10. 结构例子五：目录和特性的互转与递归

```text
case_container
├─ directory(目录A)
│  ├─ feature(特性B)
│  │  └─ baseline_case(用例1)
│  └─ directory(目录C)
│     └─ baseline_case(用例2)
└─ feature(特性A)
   ├─ feature(特性C)
   │  └─ baseline_case(用例3)
   └─ directory(目录D)
      └─ baseline_case(用例4)
```

### 这个例子的约束

- `directory` 可挂 `directory`
- `directory` 可挂 `feature`
- `feature` 可挂 `directory`
- `feature` 可挂 `feature`
- 两者都可挂用例
- 两者允许互改 `type`
- 当前理解下，互转时只改 `type`，节点 `id/path` 保持不变

## 11. 我目前理解的硬约束

### 11.1 顶层与中层关系

```text
space -> product | baseline_version | container_version
product -> baseline_version | container_version
baseline_version -> case_container(唯一) | execution_version(*)
container_version -> case_container(唯一) | execution_version(*)
execution_version -> case_container(唯一)
```

### 11.2 基线侧关系

```text
baseline_version
├─ case_container
│  ├─ directory
│  │  └─ baseline_case
│  └─ feature
│     └─ baseline_case
└─ execution_version(*)
```

```text
container_version
├─ case_container
│  ├─ directory
│  │  └─ baseline_case
│  └─ feature
│     └─ baseline_case
└─ execution_version(*)
```

### 11.3 执行侧关系

```text
execution_version
└─ case_container
   ├─ directory / feature
   │  └─ execution_case
   └─ test_scene
      ├─ directory
      │  └─ execution_case
      └─ feature
         └─ execution_case
```

但这里有一个强约束：

- `case_container` 下如果已经出现 `test_scene`
- 就不能再在 `case_container` 下直接建 `directory / feature / execution_case`
- 无论哪种形态，`case_container` 下都不能直接建用例

### 11.4 场景约束

- `test_scene` 下不能再挂 `case_container`
- `test_scene` 下可以挂：
  - `directory`
  - `feature`
- `test_scene` 下不能直接挂用例

### 11.5 目录/特性约束

- `directory` 和 `feature` 等价
- 两者可以互改 `type`
- 两者都可继续挂：
  - `directory`
  - `feature`
  - 用例

## 12. 当前版本不再作为待确认的点

以下内容本轮已经明确，不再保留为待确认项：

1. `baseline_version` / `container_version` 的 `case_container` 外的直接子节点可以是并列的 `execution_version`
2. `baseline_version` / `container_version` 分支下，目录和特性下面的用例统一按 `baseline_case` 处理
3. `execution_version` 的两种组织形态都存在
4. 如果一个 `execution_version` 已经在“容器直挂内容”形态下创建了内容，就不能再加 `test_scene`
5. `feature` 和 `directory` 互转时，只改 `type`，其余 `id/path` 保持不变

## 13. 下一步建议

如果这版结构树你确认了，我建议下一步继续补这三份内容：

1. 父子关系矩阵表
2. 右侧详情字段分组模型
3. 接口入参与返回结构草案
