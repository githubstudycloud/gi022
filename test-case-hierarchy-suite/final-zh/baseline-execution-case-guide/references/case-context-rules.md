# 用例上下文规则

## 核心判定规则

根据最近的版本祖先来推导用例类型：

| 最近版本祖先 | `directory` / `feature` 下的用例类型 |
| --- | --- |
| `baseline_version` | `baseline_case` |
| `container_version` | `baseline_case` |
| `execution_version` | `execution_case` |

如果不存在可用的版本祖先，则把上下文视为未解析状态。

## 父节点合法性

只有以下节点允许直接包含用例：

| 父节点类型 | 是否允许直接挂用例 |
| --- | --- |
| `directory` | 是 |
| `feature` | 是 |

以下类型都属于非法直接父节点：

- `baseline_version`
- `container_version`
- `execution_version`
- `case_container`
- `test_scene`
- `space`
- `product`

## 执行分支形态校验

当最近版本祖先是 `execution_version` 时，在给出新建或查询建议前，先校验锁定形态。

### `container_direct`

允许的路径：

```text
execution_version
└─ case_container
   ├─ directory
   │  └─ execution_case
   └─ feature
      └─ execution_case
```

需要拒绝：

- `case_container` 下直接出现用例
- 同一个执行版本里混入 `test_scene` 分支

### `scene_grouped`

允许的路径：

```text
execution_version
└─ case_container
   └─ test_scene
      ├─ directory
      │  └─ execution_case
      └─ feature
         └─ execution_case
```

需要拒绝：

- `case_container` 下直接出现用例
- `test_scene` 下直接出现用例
- `case_container` 下直接出现 `directory` 或 `feature`

## 查询检查清单

当用户问如何搜索、定位或切换用例时，用这个清单：

1. 确定当前选中节点和最近版本祖先。
2. 判断本次查询是针对当前用例、兄弟用例还是后代用例。
3. 明确推导出的用例类型。
4. 明确执行分支是否需要场景级范围。
5. 明确切换哪个节点会触发列表或详情刷新。

## 新建检查清单

当用户问如何新增用例时，用这个清单：

1. 确认目标父节点是 `directory` 或 `feature`。
2. 确认最近版本祖先。
3. 如果在执行侧，确认执行形态。
4. 产出最终用例类型。
5. 列出必填字段和可继承默认值。
6. 说明新建后的树刷新目标。

## 常见错误模式

- 在 `container_version` 分支里误判成 `execution_case`
- 允许在 `case_container` 下直接建用例
- 允许在 `test_scene` 下直接建用例
- 忘记 `container_version` 仍然属于基线侧上下文
- 选中节点其实是目录或特性，却错误地把右侧面板设计成用例详情
