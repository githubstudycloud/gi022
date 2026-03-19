# 左树右详情双语契约

当用户要求左树右详情页面支持中文和英文时，使用这份参考文档来锁定稳定数据键和本地化文案结构。

## 最小参数清单

在进入实现前，至少要明确这些参数：

| 参数 | 作用 | 示例 |
| --- | --- | --- |
| `sceneName` | 业务场景名 | `department-management` |
| `treeEntity` | 左侧树代表的实体 | `department` |
| `nodeIdField` | 节点唯一标识 | `deptId` |
| `parentIdField` | 父节点字段 | `parentDeptId` |
| `nodeNameField` | 节点稳定字段名 | `deptName` |
| `nodeNameI18nField` | 节点双语展示字段 | `deptNameI18n` |
| `detailMode` | 右侧面板模式 | `current-node-detail` |
| `detailEntity` | 右侧主实体 | `departmentProfile` |
| `detailIdField` | 右侧主键字段 | `deptId` |
| `labelStrategy` | 字段标签双语策略 | `label.zhCN/enUS` |
| `placeholderStrategy` | 占位符双语策略 | `placeholder.zhCN/enUS` |
| `confirmMessageStrategy` | 确认文案双语策略 | `confirmMessage.zhCN/enUS` |
| `deletePolicy` | 删除策略 | `block-when-children-exist` |
| `selectionBehavior` | 节点切换行为 | `fetch-detail-and-refresh-children` |

常见补充参数：

| 参数 | 作用 | 示例 |
| --- | --- | --- |
| `searchPlaceholderI18n` | 搜索框占位文案 | `{"zhCN":"搜索部门","enUS":"Search departments"}` |
| `emptyStateI18n` | 空状态文案 | `{"zhCN":"暂无数据","enUS":"No data"}` |
| `buttonTextI18n` | 按钮文案集合 | `create/edit/delete/save/cancel` |
| `tabTitleI18n` | 页签双语标题 | `basic/members/audit` |
| `permissionRules` | 权限控制规则 | `only admins can delete nodes` |
| `moveSupport` | 是否支持移动/拖拽 | `false` |

## 双语建模原则

### 1. 稳定键和展示文案分离

- 稳定键用于接口、存储、状态和逻辑判断
- 展示文案用于 UI，放在 `zhCN/enUS` 对象中
- 不要把中文文案作为代码中的唯一来源

### 2. 优先使用统一结构

推荐统一使用：

```ts
type LocalizedText = {
  zhCN: string;
  enUS: string;
};
```

适用范围：

- 字段标签
- 字段占位符
- 按钮文案
- 删除确认文案
- 空状态文案
- 页签标题
- 页面标题

### 3. 处理缺失翻译

如果用户只提供中文：

1. 保留稳定字段 key
2. 填入 `zhCN`
3. 生成简洁 `enUS` 占位值
4. 标注该英文为待业务确认

## CRUD 关键问题

### 查询

1. 默认选中哪个节点
2. 搜索框是否同时支持中文和英文命中
3. 切换节点后右侧刷新详情、子列表，还是两者都刷新
4. 空状态文案是否双语

### 新增

1. 新增根节点、子节点还是同级节点
2. 节点名称是否要求同时填写中文和英文
3. 新建成功后树节点显示哪个语言版本
4. 是否自动选中新建节点

### 修改

1. 名称修改是改稳定字段还是改 `nameI18n`
2. 哪些字段需要双语，哪些字段保持单语
3. 表单校验提示是否需要双语

### 删除

1. 删除确认文案是否提供双语版本
2. 存在子节点时是阻止、级联还是软删除
3. 删除后左侧树和右侧详情如何回退

### 移动与排序

1. 是否允许拖拽排序
2. 是否允许跨层级移动
3. 节点显示名称变化是否影响路径展示

## 推荐输出模板

```md
场景摘要 / Scene Summary

假设 / Assumptions
- ...

初始参数 / Initial Params
| key | value | note |
| --- | --- | --- |

树与详情映射 / Tree-Detail Mapping
- ...

双语文案约定 / Localization Rules
- ...

操作流程 / Operation Flow
- ...

接口或状态建议 / API and State Suggestions
- ...

风险与待确认项 / Risks and Open Questions
- ...
```

## 调用示例

- `Use $tree-detail-crud-bilingual to design a bilingual department tree with detail form.`
- `Use $tree-detail-crud-bilingual to output zhCN/enUS labels for a menu tree page.`
- `使用 $tree-detail-crud-bilingual 设计一套支持中英文的分类树和右侧详情模板。`
