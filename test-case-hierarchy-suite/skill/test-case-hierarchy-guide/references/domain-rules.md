# 领域规则速查

## 术语

| 类型 | 说明 |
| --- | --- |
| `space` | 空间 |
| `product` | 产品 |
| `baseline_version` | 基线版本 |
| `container_version` | 容器版本，当前按基线侧结构处理 |
| `execution_version` | 执行版本，当前与“测试版本”同义 |
| `case_container` | 用例容器 |
| `test_scene` | 测试场景 |
| `directory` | 目录，当前与“测试项”同义 |
| `feature` | 特性 |
| `baseline_case` | 基线用例 |
| `execution_case` | 执行用例 |

## 关键结构规则

- `space -> product | baseline_version | container_version`
- `product -> baseline_version | container_version`
- `baseline_version -> case_container(唯一) + execution_version*`
- `container_version -> case_container(唯一) + execution_version*`
- `execution_version -> case_container(唯一)`
- `case_container -> directory | feature | test_scene`
- `test_scene -> directory | feature`
- `directory | feature -> directory | feature | case`

## 关键语义规则

- 基线版本和容器版本的用例容器下都是基线侧内容
- 用例容器下面不能直接建用例
- 场景下面不能直接建用例
- 用例只能建在目录或特性下
- 目录和特性等价，可互改 `type`

## 执行版本形态

- `container_direct`
  - `execution_version -> case_container -> directory | feature -> execution_case`
- `scene_grouped`
  - `execution_version -> case_container -> test_scene -> directory | feature -> execution_case`

执行版本一旦选定形态，不允许切换。

## 关键字段

- `longIdPath`
- `shortId`
- `currentLevelId`
- `type`
- `name`
- `number`
- `meta.lockedMode`
- `meta.sourceVersionType`
- `extFields`
