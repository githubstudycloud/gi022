---
name: tree-detail-crud-bilingual
description: 为左树右详情类后台页面提供中英双语 CRUD 设计、参数梳理和模板约定。Use when Codex needs bilingual initial params, tree/detail mappings, localized field labels, or query/create/update/delete flows for categories, departments, menus, permissions, and similar hierarchical UIs.
---

# 左树右详情 CRUD 双语向导

## 概述

使用这个 skill，把“左侧树，右侧详情”的需求整理成可落地的数据契约、交互流程和中英双语配置。
将左侧树视为导航和作用域选择器，将右侧区域视为当前节点详情、子列表、混合布局或汇总视图。

## 适用场景

在这些场景触发本 skill：

- 需要为左树右详情页面设计中英双语字段和界面文案
- 需要梳理树节点、详情面板、子列表之间的数据映射
- 需要定义查询、新增、修改、删除、移动或排序规则
- 需要输出可复用的参数模板、接口契约或前端配置模型
- 需要明确 `zhCN` 和 `enUS` 的落位方式，而不是把翻译直接写死在业务键上

典型请求包括：

- “新建一个部门管理页面，左边树右边详情，字段要支持中文和英文”
- “给菜单树做一套双语配置模板，后面我自己改”
- “当前节点切换后，右侧表单、子表和按钮文案怎么做双语”
- “把删除确认、空状态、搜索占位符都做成中英双语”

## 工作流

### 1. 先锁定结构模型

先把页面归一化成两个模型：

- 树模型：层级、节点主键、父子关系、显示名称、排序、懒加载、展开、选中
- 详情模型：当前节点详情、子列表、页签、统计信息、表单字段、操作按钮

如果用户没有提供完整上下文，从 [tree-detail-bilingual-contract.md](references/tree-detail-bilingual-contract.md) 收集最小参数。
只追问阻塞信息。其余信息可以给出默认假设，但必须显式标明。

### 2. 分离稳定键和双语文案

始终区分：

- 稳定业务键：`deptId`、`parentDeptId`、`status`
- 双语展示文案：`label.zhCN`、`label.enUS`
- 运行时状态键：`selectedNodeId`、`activeTab`
- 后端持久化字段：树节点字段、详情字段、关联字段

不要用中文或英文标签直接充当字段 key。
不要把翻译字符串写死到组件逻辑里，优先收敛到双语配置对象。

### 3. 定义右侧详情模式

在开始写代码或接口前，必须确定右侧属于哪一种：

- 当前节点详情：右侧编辑当前选中节点
- 子列表：右侧显示当前节点下属记录
- 混合布局：顶部当前节点详情，底部子记录列表
- 汇总视图：当前节点的统计、摘要或关联信息

这个决定会直接影响查询参数、按钮位置、保存动作和刷新策略。

### 4. 选择操作模式

按用户意图整理对应操作：

- 查询：默认选中节点、搜索范围、切换节点后的刷新行为
- 新增：新增根节点、子节点还是同级节点；是否继承父节点字段
- 修改：哪些字段是树节点字段，哪些属于详情字段；哪些文案要支持双语
- 删除：删除策略、确认文案、删除后选中谁、是否级联
- 移动或排序：是否允许拖拽、是否允许跨分支移动、路径字段是否需要重算

### 5. 输出结构化结果

优先按照这个顺序输出：

1. 场景摘要
2. 假设与缺失信息
3. 初始参数块
4. 树与详情映射
5. 双语文案约定
6. 请求操作的流程说明
7. API、状态或表单建议
8. 风险、边界条件和待确认项

### 6. 应用双语约束

涉及双语时，始终显式说明：

- 业务主键不做本地化
- 节点显示名称可做 `nameI18n.zhCN/enUS`
- 字段标签、占位符、空状态、确认文案应统一采用 `LocalizedText`
- 如果用户只提供中文，可先生成简洁英文占位文案，并标记为待业务确认
- 如果项目已有 i18n 体系，优先复用现有 key 规则，不额外发明一套

## 参考资源

读取 [tree-detail-bilingual-contract.md](references/tree-detail-bilingual-contract.md) 获取：

- 最小参数清单
- 双语输出模板
- CRUD 关键问题清单
- 双语字段命名建议

读取 [tree-detail-bilingual-template.ts](references/tree-detail-bilingual-template.ts) 和 [tree-detail-bilingual-template.json](references/tree-detail-bilingual-template.json) 获取：

- 可直接改造的 TypeScript 类型与示例
- 可直接复制的 JSON 配置模板
- `zhCN/enUS` 的推荐落位方式
