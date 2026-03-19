# 测试树模型结构确认稿

## 1. 这份文档的作用

这份文档只做一件事：

- 用你刚确认的规则，把这棵树的大致模型结构写清楚
- 尽量用“结构树”而不是 JSON 来表达
- 把我理解到的硬约束单独列出来，方便你逐条确认

## 2. 已确认的统一口径

以下内容按你刚刚的反馈，作为当前确认版本：

1. `测试版本 = 执行版本`
2. `测试项 = 目录`
3. `容器版本` 在结构层面等价于 `基线版本`
4. `容器版本` 的下挂内容与 `基线版本` 类似
5. `用例容器` 不能出现在 `场景` 下
6. `基线版本`、`容器版本`、`执行版本` 都只能直接挂一个 `用例容器`
7. `执行版本` 下面先挂 `用例容器`
8. `用例容器` 下面可以挂 `场景`
9. 一旦 `用例容器` 下挂了 `场景`，后续 `目录 / 特性 / 用例` 只能建在 `场景` 下，不能再直接建在 `用例容器` 下
10. `执行版本` 不能切换模式
11. `特性` 和 `目录` 等价，可以互相改 `type`

## 3. 当前节点类型

先按这个集合理解：

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

先把最大框架用树表示出来。

```text
space
├─ product
│  ├─ baseline_version
│  │  └─ case_container
│  │     ├─ directory
│  │     ├─ feature
│  │     ├─ baseline_case
│  │     └─ execution_version
│  │        └─ case_container
│  │           ├─ directory / feature / execution_case
│  │           └─ test_scene
│  │              ├─ directory
│  │              ├─ feature
│  │              └─ execution_case
│  └─ container_version
│     └─ case_container
│        ├─ directory
│        ├─ feature
│        ├─ baseline_case
│        └─ execution_version
│           └─ case_container
│              ├─ directory / feature / execution_case
│              └─ test_scene
│                 ├─ directory
│                 ├─ feature
│                 └─ execution_case
├─ baseline_version
│  └─ case_container
├─ container_version
│  └─ case_container
└─ product
```

上面这棵树只表达“能出现在哪一层”，不表达所有细约束。
下面分场景拆开。

## 6. 结构例子一：空间下直接挂基线版本

```text
space(主空间)
└─ baseline_version(基线版本A)
   └─ case_container(基线用例容器)
      ├─ directory(一级目录)
      │  ├─ directory(二级目录)
      │  │  └─ baseline_case(基线用例1)
      │  └─ feature(登录特性)
      │     └─ baseline_case(基线用例2)
      ├─ feature(支付特性)
      │  └─ baseline_case(基线用例3)
      └─ execution_version(执行版本A)
         └─ case_container(执行用例容器)
            ├─ directory(执行目录A)
            ├─ feature(执行特性A)
            └─ execution_case(执行用例1)
```

### 这个例子的约束

- `space` 可以直接挂 `baseline_version`
- `baseline_version` 只能直接挂一个 `case_container`
- `baseline_version` 的 `case_container` 下可以挂：
  - `directory`
  - `feature`
  - `baseline_case`
  - `execution_version`
- 这个上下文里，目录和特性下面的用例应是 `baseline_case`

## 7. 结构例子二：产品下挂容器版本

因为你确认了“容器版本等价于基线版本”，所以结构上按同一套理解。

```text
space(主空间)
└─ product(产品A)
   └─ container_version(容器版本A)
      └─ case_container(容器用例容器)
         ├─ directory(冒烟目录)
         │  └─ baseline_case(基线类用例1)
         ├─ feature(核心链路特性)
         │  └─ baseline_case(基线类用例2)
         └─ execution_version(执行版本B)
            └─ case_container(执行用例容器B)
               └─ execution_case(执行用例1)
```

### 这个例子的约束

- `product` 可以挂 `container_version`
- `container_version` 只能直接挂一个 `case_container`
- `container_version` 下的挂法与 `baseline_version` 类似
- 当前草案把 `container_version` 分支里的直接用例也暂按基线侧处理

这里有一个仍建议你最终再确认的点：

- `container_version` 分支下的直接用例，是否真的应该归为 `baseline_case`

## 8. 结构例子三：执行版本的“容器直挂内容”形态

你说“执行版本不能切模式”，我这里的理解是：

- 执行版本存在两种组织形态
- 但一旦走了其中一种，就锁定，不能互相切换

第一种形态是：`执行版本 -> 用例容器 -> 直接挂目录/特性/执行用例`

```text
execution_version(执行版本A)
└─ case_container(执行用例容器)
   ├─ directory(回归目录)
   │  └─ execution_case(执行用例1)
   ├─ feature(支付特性)
   │  └─ execution_case(执行用例2)
   └─ execution_case(执行用例3)
```

### 这个例子的约束

- `execution_version` 只能直接挂一个 `case_container`
- 这里的 `case_container` 没有挂 `test_scene`
- 因此允许直接在 `case_container` 下挂：
  - `directory`
  - `feature`
  - `execution_case`

## 9. 结构例子四：执行版本的“场景分组”形态

第二种形态是：`执行版本 -> 用例容器 -> 场景 -> 目录/特性/执行用例`

```text
execution_version(执行版本B)
└─ case_container(执行用例容器)
   ├─ test_scene(登录场景)
   │  ├─ directory(登录目录)
   │  │  └─ execution_case(执行用例1)
   │  ├─ feature(验证码特性)
   │  │  └─ execution_case(执行用例2)
   │  └─ execution_case(执行用例3)
   └─ test_scene(支付场景)
      ├─ directory(支付目录)
      └─ feature(退款特性)
```

### 这个例子的约束

- `execution_version` 只能直接挂一个 `case_container`
- `case_container` 一旦挂了 `test_scene`
- 那么后续 `directory / feature / execution_case` 只能建在 `test_scene` 下
- 不能再直接建在 `case_container` 下

也就是说，下面这种结构应视为非法：

```text
execution_version
└─ case_container
   ├─ test_scene
   └─ directory   <- 非法
```

## 10. 结构例子五：目录和特性的互转与递归

你确认了“特性和目录等价，可以互相改 type”，那当前可理解成：

- 两者结构能力一致
- 两者都可以继续嵌套目录、特性、用例
- 区别主要体现在业务语义和展示文案

```text
case_container
├─ directory(目录A)
│  ├─ feature(特性B)
│  │  └─ baseline_case(用例1)
│  └─ directory(目录C)
│     └─ baseline_case(用例2)
└─ feature(特性A)
   ├─ feature(特性C)
   ├─ directory(目录D)
   └─ baseline_case(用例3)
```

### 这个例子的约束

- `directory` 可挂 `directory`
- `directory` 可挂 `feature`
- `feature` 可挂 `directory`
- `feature` 可挂 `feature`
- 两者都可挂用例
- 两者允许互改 `type`

## 11. 我目前理解的硬约束

下面这些我建议后续直接变成程序规则。

### 11.1 顶层与中层关系

```text
space -> product | baseline_version | container_version
product -> baseline_version | container_version
baseline_version -> case_container(唯一)
container_version -> case_container(唯一)
execution_version -> case_container(唯一)
```

### 11.2 基线侧关系

```text
baseline_version
└─ case_container
   ├─ directory
   ├─ feature
   ├─ baseline_case
   └─ execution_version
```

```text
container_version
└─ case_container
   ├─ directory
   ├─ feature
   ├─ baseline_case
   └─ execution_version
```

### 11.3 执行侧关系

```text
execution_version
└─ case_container
   ├─ directory / feature / execution_case
   └─ test_scene
      ├─ directory
      ├─ feature
      └─ execution_case
```

但这里有一个强约束：

- `case_container` 下如果已经出现 `test_scene`
- 就不能再在 `case_container` 下直接建 `directory / feature / execution_case`

### 11.4 场景约束

- `test_scene` 下不能再挂 `case_container`
- `test_scene` 下可以挂：
  - `directory`
  - `feature`
  - `execution_case`

### 11.5 目录/特性约束

- `directory` 和 `feature` 等价
- 两者可以互改 `type`
- 两者都可继续挂：
  - `directory`
  - `feature`
  - 用例

## 12. 仍建议你最后再确认的点

这几个点我已经尽量按你的反馈收敛了，但最好你再拍一下：

1. `baseline_version` / `container_version` 的 `case_container` 下，是否允许直接挂 `execution_version`
2. `baseline_version` / `container_version` 分支下，直接挂的用例是否统一都算 `baseline_case`
3. `execution_version` 的两种组织形态是否都存在：
   - 容器直挂内容
   - 容器挂场景
4. 如果一个 `execution_version` 已经在“容器直挂内容”形态下创建了内容，是否明确禁止后续再加 `test_scene`
5. `feature` 和 `directory` 互转时，是否只改 `type`，其余 `id/path` 保持不变

## 13. 下一步建议

如果这版结构树你确认了，我建议下一步继续补这三份内容：

1. 父子关系矩阵表
2. 右侧详情字段分组模型
3. 接口入参与返回结构草案
