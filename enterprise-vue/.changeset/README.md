# Changesets

这个目录由 [Changesets](https://github.com/changesets/changesets) 管理。

## 工作流

1. 开发完功能后运行 `pnpm changeset`
2. 交互式选择受影响的包和版本递增类型
3. 填写变更描述（会出现在 CHANGELOG）
4. 提交 `.changeset/*.md` 文件与代码一起 PR

## 版本发布

CI 会自动创建 "Version Packages" PR，合并后自动发布。
