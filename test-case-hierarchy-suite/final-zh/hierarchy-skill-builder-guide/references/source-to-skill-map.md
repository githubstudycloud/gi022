# 从源材料到 Skill 的映射

## 提取模型

按下面这个规则，把本地源材料映射到 skill 资产中：

| 源材料类型 | 应抽取的内容 | 建议放置位置 |
| --- | --- | --- |
| `docs/requirements.md` | 稳定术语、硬性约束、唯一子节点规则 | `SKILL.md` 概述或 `references/` 规则表 |
| `docs/design.md` | 数据模型、API 形态、交互规则 | `references/` 里的设计清单或模板 |
| `docs/tree-structure-spec.md` | 别名表、字段语义、长矩阵 | 只放进 `references/` |
| `docs/detail-field-grouping-example.md` | 右侧详情分组和动态字段 | 只放进 `references/` |
| `tests/fixtures/*.json` | 正反样例 | `references/` 里的简短示例 |
| 现有 `skill/*` 目录 | 已验证的 skill 结构和措辞模式 | 只借鉴结构，不直接照抄 |

## 建议构建顺序

1. 读用户请求，给这个 skill 的窄任务命名。
2. 只读能解释这个任务的最小文档集合。
3. 列出必须保留下来的规则。
4. 判断这些规则属于工作流指导还是参考材料。
5. 写新的 `SKILL.md`。
6. 只补当前工作流真正会引用到的 reference 文件。

## 当前仓库里的具体例子

对当前仓库来说，一个聚焦的“用例 skill”可以这样拼出来：

| 本地来源 | 提炼出的思想 | 目标落点 |
| --- | --- | --- |
| `docs/requirements.md` | 用例挂载位置限制 | `references/case-context-rules.md` |
| `docs/design.md` | 查询/新建/详情行为 | `SKILL.md` 工作流 |
| `docs/tree-model-examples.md` | 示例路径 | `references/` 示例段落 |
| `tests/fixtures/valid_tree.json` | 正向树结构示例 | 简短示例或校验说明 |
| `skill/test-case-hierarchy-guide/` | 宽领域表述方式 | 更窄、更聚焦的 skill 表述 |

## 拆分范围的启发式

当以下条件同时成立时，应该新建一个 companion skill：

- 子领域本身会反复被单独提问
- 它的回答流程明显短于宽领域 skill
- 核心规则可以压缩进一份参考规则表
- 如果不拆，原来的宽领域 skill 会不断积累无关示例
