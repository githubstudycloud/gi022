---
name: baseline-execution-case-guide
description: 面向测试层级套件中基线用例与执行用例的查询、校验和新建流程向导。适用于 Codex 需要判断某个节点属于基线侧还是执行侧上下文、识别新建用例的正确父节点、说明哪些位置允许或禁止创建用例、设计聚焦用例的左树右详情行为，或回答 `baseline_case` 与 `execution_case` 的字段、动作和查询范围问题时。
---

# 基线与执行用例向导

## 概述

当问题聚焦在 `baseline_case` 与 `execution_case` 时，使用这个 skill，而不是每次都重新推导整棵层级树。
先把任务收敛成三个判断：

- 最近的版本上下文是什么
- 当前节点是否是合法的用例父节点
- 在这个上下文下应采用什么查询、新建和详情行为

## 工作流

### 1. 先解析最近的版本上下文

先向上寻找最近的祖先节点，要求它属于以下类型之一：

- `baseline_version`
- `container_version`
- `execution_version`

应用这些规则：

- `baseline_version` 和 `container_version` 都产出 `baseline_case`
- `execution_version` 产出 `execution_case`
- 如果无法证明最近版本上下文，就把它标成阻塞项，不要猜

需要完整的父节点和上下文矩阵时，读取 [case-context-rules.md](references/case-context-rules.md)。

### 2. 在讨论用例行为前先校验候选父节点

只有 `directory` 和 `feature` 可以直接挂用例。
以下类型一律视为非法直接父节点：

- `baseline_version`
- `container_version`
- `execution_version`
- `case_container`
- `test_scene`

如果是执行侧分支，还要额外检查锁定形态：

- `container_direct`：用例必须落在 `case_container -> directory|feature` 下
- `scene_grouped`：用例必须落在 `case_container -> test_scene -> directory|feature` 下

### 3. 把查询和新建分开说明

对查询类问题，明确：

- 当前选中节点和生效查询范围
- 推导出的用例类型
- 与当前分支或场景绑定的过滤条件
- 用户切换节点时哪些内容需要刷新

对新建类问题，明确：

- 精确的目标父节点
- 继承到的版本上下文
- 最终生成的用例类型
- 必填字段和安全默认值
- 新建后树和详情面板的刷新方式

不要把“查用例”和“建用例”混成一段模糊说明，必须拆开写。

### 4. 让右侧详情始终以用例本身为中心

当选中的节点本身就是用例时，右侧面板应围绕该用例展开：

- 路径、类型、名称、编号等稳定标识字段
- 等级、优先级、负责人、描述等业务字段
- 仅 `execution_case` 才常见的执行结果、运行状态等字段
- 编辑、移动、父节点类型转换、删除等允许动作

如果用户实际问的是父级目录或特性，不要硬把整个右侧面板解释成用例详情。

### 5. 按固定输出顺序回答

优先使用这个顺序：

1. 场景摘要
2. 已解析的版本上下文和假设
3. 合法父节点与推导出的用例类型
4. 查询流或新建流
5. 详情字段与界面动作
6. 风险、非法状态和待确认项

需要现成答题骨架时，读取 [case-output-template.md](references/case-output-template.md)。

## 备注

如果任务里带了真实树 JSON，并且问题依赖结构是否合法，就使用 [../../scripts/validate_tree_hierarchy.py](../../scripts/validate_tree_hierarchy.py)。
