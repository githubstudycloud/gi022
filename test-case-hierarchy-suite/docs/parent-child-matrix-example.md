# 父子关系矩阵总表示例

## 1. 文档用途

这份文档把当前已确认的树结构，压缩成一张“父子关系矩阵总表”。
适合用来做：

- 评审关系规则
- 生成后端校验规则
- 生成前端节点创建菜单
- 做权限控制或节点动作控制

## 2. 矩阵说明

表中几列含义如下：

- `允许直接子类型`：当前父节点下允许直接出现的节点类型
- `数量限制`：直属子节点数量限制
- `禁止直接出现`：绝对不能直接出现的类型
- `补充约束`：需要附加判断的业务规则

## 3. 父子关系矩阵

| 父类型 | 允许直接子类型 | 数量限制 | 禁止直接出现 | 补充约束 |
| --- | --- | --- | --- | --- |
| `space` | `product`, `baseline_version`, `container_version` | 无固定数量限制 | `case_container`, `test_scene`, `baseline_case`, `execution_case`, `directory`, `feature` | 顶层根节点建议唯一 |
| `product` | `baseline_version`, `container_version` | 无固定数量限制 | `case_container`, `test_scene`, `baseline_case`, `execution_case`, `directory`, `feature` | 产品下不直接挂执行版本 |
| `baseline_version` | `case_container`, `execution_version` | `case_container` 必须且仅有 1 个 | `baseline_case`, `execution_case`, `directory`, `feature`, `test_scene` | 除 `case_container` 外，其他直属子节点只能是并列 `execution_version` |
| `container_version` | `case_container`, `execution_version` | `case_container` 必须且仅有 1 个 | `baseline_case`, `execution_case`, `directory`, `feature`, `test_scene` | 当前按基线侧结构处理 |
| `execution_version` | `case_container` | `case_container` 必须且仅有 1 个 | `baseline_case`, `execution_case`, `directory`, `feature`, `test_scene`, `baseline_version`, `container_version` | 直属只允许一个容器，形态锁定后不可切换 |
| `case_container` | `directory`, `feature`, `test_scene` | 由父上下文决定 | `baseline_case`, `execution_case`, `case_container`, `baseline_version`, `container_version`, `execution_version`, `product`, `space` | 在基线/容器上下文下不能挂 `test_scene`；在执行版本 `scene_grouped` 形态下只能挂 `test_scene`；在 `container_direct` 下只能挂 `directory/feature` |
| `test_scene` | `directory`, `feature` | 无固定数量限制 | `baseline_case`, `execution_case`, `case_container`, `baseline_version`, `container_version`, `execution_version`, `product`, `space` | 场景下不能直接建用例 |
| `directory` | `directory`, `feature`, `baseline_case`, `execution_case` | 无固定数量限制 | `space`, `product`, `baseline_version`, `container_version`, `execution_version`, `case_container`, `test_scene` | 用例类型由最近版本上下文决定 |
| `feature` | `directory`, `feature`, `baseline_case`, `execution_case` | 无固定数量限制 | `space`, `product`, `baseline_version`, `container_version`, `execution_version`, `case_container`, `test_scene` | 与 `directory` 等价，可互改 `type` |
| `baseline_case` | 无 | 叶子节点 | 所有类型 | 不再挂子节点 |
| `execution_case` | 无 | 叶子节点 | 所有类型 | 不再挂子节点 |

## 4. 执行版本形态补充矩阵

### 4.1 形态一：`container_direct`

```text
execution_version
└─ case_container
   ├─ directory
   └─ feature
```

| 父类型 | 允许直接子类型 | 禁止直接子类型 | 备注 |
| --- | --- | --- | --- |
| `execution_version` | `case_container` | 其他所有类型 | 直属唯一 |
| `case_container` | `directory`, `feature` | `test_scene`, `baseline_case`, `execution_case` | 用例只能在目录/特性下 |

### 4.2 形态二：`scene_grouped`

```text
execution_version
└─ case_container
   └─ test_scene
      ├─ directory
      └─ feature
```

| 父类型 | 允许直接子类型 | 禁止直接子类型 | 备注 |
| --- | --- | --- | --- |
| `execution_version` | `case_container` | 其他所有类型 | 直属唯一 |
| `case_container` | `test_scene` | `directory`, `feature`, `baseline_case`, `execution_case` | 一旦进入场景分组，容器下只允许场景 |
| `test_scene` | `directory`, `feature` | `baseline_case`, `execution_case`, `case_container` | 用例仍然只能在目录/特性下 |

## 5. 可转成程序规则的建议字段

如果后面要把这张表程序化，建议按下面这组字段来表达：

```ts
type RelationRule = {
  parentType: string;
  allowedChildTypes: string[];
  forbiddenChildTypes?: string[];
  uniqueChildTypes?: string[];
  requiredChildTypes?: string[];
  mode?: "default" | "container_direct" | "scene_grouped";
  notes?: string[];
};
```

## 6. 你后续可直接补充的列

如果你要继续把这张表往“落库配置”推进，建议补这几列：

- 规则 ID
- 是否启用
- 是否可通过配置关闭
- 失败提示文案别名
- 前端按钮控制键
- 后端校验错误码
