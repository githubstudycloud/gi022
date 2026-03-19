---
name: test-case-hierarchy-guide
description: 针对测试树、基线版本、执行版本、用例容器、场景、特性、目录和用例关系的中文分析与设计向导。Use when Codex needs to parse, design, validate, or implement a complex test hierarchy tree with node rules, version modes, feature-to-directory conversion, dynamic fields, and left-tree right-detail behavior.
---

# 测试层级树中文向导

## 概述

使用本 skill，把复杂测试树场景整理成统一术语、层级规则、详情模型、操作约束和输出模板。
优先保证“树关系、流程约束、动态字段、详情行为”四部分不混淆。

## 何时使用

在这些场景使用本 skill：

- 需要解析空间、产品、容器版本、基线版本、执行版本之间的树关系
- 需要明确基线分支和执行分支的用例类型归属
- 需要设计“场景下先建特性再转目录”的流程
- 需要处理 100+ 动态字段和右侧详情区
- 需要输出需求文档、设计文档、接口建议或校验规则

典型请求包括：

- “帮我梳理这棵测试树的层级关系和节点规则”
- “把这套基线版本/执行版本关系写成设计文档”
- “根据这个树模型设计左树右详情的接口和校验逻辑”
- “帮我检查某个新增节点是否违反层级规则”

## 工作流

### 1. 先统一术语

先统一这些概念：

- `space`
- `product`
- `container_version`
- `baseline_version`
- `execution_version`
- `case_container`
- `test_scene`
- `feature`
- `directory`
- `baseline_case`
- `execution_case`

如果用户同时使用“测试版本”和“执行版本”，默认先合并为 `execution_version`，并显式写成假设。

### 2. 区分结构规则和流程规则

把需求拆成两类：

- 结构规则：父子关系、同级关系、唯一性约束、模式互斥
- 流程规则：场景下先建特性再转目录、删除前校验、模式切换约束

不要只看最终树快照就忽略流程来源。
例如场景下直接出现目录时，需要检查它是否由特性转换而来。

### 3. 识别关键上下文

处理用例节点时，优先寻找最近的版本上下文：

- 最近上下文是 `baseline_version`，则目录/特性下的用例应为 `baseline_case`
- 最近上下文是 `execution_version`，则目录/特性下的用例应为 `execution_case`

如果无法确定上下文，把它列为待确认项，不要擅自归类。

### 4. 建立左树右详情模型

输出时至少包含这四块：

1. 树节点最小字段
2. 详情区字段分层
3. 动态字段扩展方式
4. 操作按钮和校验点

固定核心字段至少包括：

- `longIdPath`
- `shortId`
- `currentLevelId`
- `type`
- `name`
- `number`

扩展字段统一放在独立的动态字段容器或字段定义模型中。

### 5. 处理关键约束

必须显式检查这些规则：

- 空间下可直接挂产品、容器版本、基线版本
- 产品下可挂容器版本、基线版本
- 基线版本下必须且仅能有一个用例容器，可有多个执行版本
- 执行版本只能二选一：
  - 单容器版本模式
  - 多场景模式
- 场景下目录若直接出现，必须带“由特性转换而来”的来源标记
- 目录和特性下可继续嵌套目录、特性和用例

## 输出模板

优先按这个顺序回答：

1. 场景摘要
2. 术语与假设
3. 节点类型清单
4. 父子关系矩阵
5. 模式约束与流程约束
6. 节点核心字段与动态字段设计
7. 左树右详情建议
8. 接口与校验建议
9. 风险与待确认项

## 参考资源

读取 [domain-rules.md](references/domain-rules.md) 获取：

- 术语表
- 树关系
- 模式约束
- 用例归类规则

读取 [output-template.md](references/output-template.md) 获取：

- 需求文档写法
- 设计文档写法
- 左树右详情输出骨架
