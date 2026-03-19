# 领域规则速查

## 术语

| 类型 | 说明 |
| --- | --- |
| `space` | 空间 |
| `product` | 产品 |
| `container_version` | 容器版本 |
| `baseline_version` | 基线版本 |
| `execution_version` | 执行版本，当前默认与“测试版本”同义 |
| `case_container` | 用例容器 |
| `test_scene` | 测试场景 |
| `feature` | 特性，当前默认与“测试项”同义 |
| `directory` | 目录 |
| `baseline_case` | 基线用例 |
| `execution_case` | 执行用例 |

## 关键结构规则

- `space -> product | container_version | baseline_version`
- `product -> container_version | baseline_version`
- `baseline_version -> case_container + execution_version*`
- `container_version -> case_container? + execution_version*`
- `case_container -> directory | feature`
- `execution_version -> container_version XOR test_scene+`
- `directory | feature -> directory | feature | case`

## 关键流程规则

- 场景下初始只能创建特性
- 场景下目录必须来自特性转换
- 基线上下文中的用例是基线用例
- 执行上下文中的用例是执行用例

## 关键字段

- `longIdPath`
- `shortId`
- `currentLevelId`
- `type`
- `name`
- `number`
- `meta.executionMode`
- `meta.convertedFrom`
- `extFields`
