---
name: hierarchy-skill-builder-guide
description: 面向层级领域的元向导，用于根据本地需求文档、设计文档、字段规格、JSON 样例和现有 skill，构建或重构可复用的 Codex skill。适用于 Codex 需要为树结构或左树右详情类领域创建新的同类业务 skill、从文档中抽取稳定术语和父子规则、判断哪些内容应放在 SKILL.md 与 references 中，或产出一个借鉴测试层级模式但不照搬整个领域的聚焦 skill 时。
---

# 层级 Skill 构建向导

## 概述

使用这个 skill，把一组层级业务文档整理成一个可复用的 Codex skill。
目标应是“聚焦、可复用的单一工作面”，而不是“关于整棵树的一切”。

较好的输出通常包含：

- 一个聚焦的 `SKILL.md`
- 一到三个承载重型领域材料的 `references/` 文件
- 一个与之对齐的 `agents/openai.yaml`

把 [../baseline-execution-case-guide/SKILL.md](../baseline-execution-case-guide/SKILL.md) 作为聚焦业务 skill 的参考粒度。

## 构建流程

### 1. 写之前先收窄问题

优先选择一个稳定的工作切片，例如：

- 用例查询与新建
- 双语字段约定
- 父子关系校验
- 右侧详情字段分组
- 某一类页面的契约输出

如果请求范围看起来像整个领域，就先拆成一个宽领域 skill，再拆出一个或多个聚焦子 skill。

### 2. 从源材料里抽出四层可复用信息

阅读源文档时，只保留另一个 Codex 实例会反复需要的部分：

- 稳定术语和节点类型
- 硬性的父子关系或唯一性约束
- 查询、新建或详情行为
- 可复用的回答骨架、模板或示例

需要具体映射方法时，读取 [source-to-skill-map.md](references/source-to-skill-map.md)。

### 3. 决定哪些内容应该放进 `SKILL.md`

让 `SKILL.md` 保持精简、偏流程化：

- 这份 skill 解决什么问题
- 推荐的思考顺序
- 何时跳转去读某个 reference 文件

把大表格、示例、矩阵和模板移到 `references/`。
只有当重复校验或转换必须依赖确定性执行时，才加入 `scripts/`。

### 4. 复用模式，不复用原文

可以把现有聚焦 skill 当作结构样板：

- [../baseline-execution-case-guide/SKILL.md](../baseline-execution-case-guide/SKILL.md)
- [../baseline-execution-case-guide/references/case-context-rules.md](../baseline-execution-case-guide/references/case-context-rules.md)
- [../baseline-execution-case-guide/references/case-output-template.md](../baseline-execution-case-guide/references/case-output-template.md)

只有在新领域也适配时，才复用这些结构：

- 覆盖触发场景的精简 frontmatter 描述
- 简洁概述
- 告诉 Codex 如何思考的工作流
- 承载厚重领域内容的参考文件

如果新领域术语不同，不要机械照搬原有词汇。

### 5. 按由外到内的顺序写

推荐按这个顺序落文件：

1. frontmatter 的 `description`
2. 正文工作流
3. reference 文件
4. `agents/openai.yaml`

不要留下占位符、TODO，或没有实际用途的空资源目录。

### 6. 收尾前必须校验

先按 [quality-gate.md](references/quality-gate.md) 做一轮自查。
然后对完成后的 skill 目录运行校验脚本。

## 备注

如果源目录里已经有一个宽领域 skill，优先补一个聚焦 companion skill，而不是继续把原 skill 堆胖。
