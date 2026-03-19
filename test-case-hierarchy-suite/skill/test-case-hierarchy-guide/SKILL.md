---
name: test-case-hierarchy-guide
description: 针对测试树、基线版本、容器版本、执行版本、用例容器、场景、目录、特性和用例关系的中文分析与设计向导。Use when Codex needs to parse, design, validate, or implement a complex test hierarchy tree with unique case containers, execution shapes, dynamic fields, directory-feature conversion, and left-tree right-detail behavior.
---

# 测试层级树中文向导

## 概述

使用本 skill，把复杂测试树场景整理成统一术语、层级规则、详情模型、操作约束和输出模板。
优先保证“树关系、执行版本形态、动态字段、详情行为”四部分不混淆。

## 何时使用

在这些场景使用本 skill：

- 需要解析空间、产品、基线版本、容器版本、执行版本之间的树关系
- 需要明确基线侧和执行侧的用例归属
- 需要校验用例容器和场景下面能否直接建用例
- 需要处理目录与特性的互转
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
- `baseline_version`
- `container_version`
- `execution_version`
- `case_container`
- `test_scene`
- `directory`
- `feature`
- `baseline_case`
- `execution_case`

默认采用这些映射：

- `测试版本 = execution_version`
- `测试项 = directory`
- `container_version` 按基线侧结构处理

### 2. 先锁定直属关系

先检查这些直属关系是否被满足：

- `space -> product | baseline_version | container_version`
- `product -> baseline_version | container_version`
- `baseline_version -> case_container(唯一) + execution_version(*)`
- `container_version -> case_container(唯一) + execution_version(*)`
- `execution_version -> case_container(唯一)`

### 3. 再判断执行版本形态

执行版本只允许一种锁定形态：

- `container_direct`
- `scene_grouped`

约束如下：

- `container_direct`：用例容器下直接挂目录和特性，再由目录/特性挂执行用例
- `scene_grouped`：用例容器下直接挂场景，再由场景挂目录和特性，再由目录/特性挂执行用例
- 不允许先建一套再切换为另一套

### 4. 检查禁止直接挂用例的层级

必须显式检查：

- `case_container` 下不能直接挂用例
- `test_scene` 下不能直接挂用例
- 用例只能挂在 `directory` 或 `feature` 下

### 5. 处理目录与特性

把目录和特性视为等价节点：

- 两者都能继续挂目录、特性和用例
- 两者可互改 `type`
- 默认只改 `type`，路径和 ID 保持稳定

## 输出模板

优先按这个顺序回答：

1. 场景摘要
2. 术语与已确认口径
3. 节点类型清单
4. 父子关系矩阵
5. 执行版本形态约束
6. 节点核心字段与动态字段设计
7. 左树右详情建议
8. 接口与校验建议
9. 风险与待确认项

## 参考资源

读取 [domain-rules.md](references/domain-rules.md) 获取：

- 术语表
- 树关系
- 形态约束
- 用例归类规则

读取 [output-template.md](references/output-template.md) 获取：

- 需求文档写法
- 设计文档写法
- 左树右详情输出骨架
