# final-zh

`final-zh/` is the Chinese delivery package for this repository.

## What Is Here

- [最终定稿-设计文档.md](/D:/111111/test-case-hierarchy-suite/final-zh/最终定稿-设计文档.md): Chinese long-form structure spec
- [补充文档/Skill 新手引导.md](/D:/111111/test-case-hierarchy-suite/final-zh/补充文档/Skill%20新手引导.md): entry guide for first-time users
- [补充文档/结构与接口对比指南.md](/D:/111111/test-case-hierarchy-suite/final-zh/补充文档/结构与接口对比指南.md): human-facing comparison and API guide
- [baseline-execution-case-guide/](/D:/111111/test-case-hierarchy-suite/final-zh/baseline-execution-case-guide): Chinese focused case skill
- [hierarchy-skill-builder-guide/](/D:/111111/test-case-hierarchy-suite/final-zh/hierarchy-skill-builder-guide): Chinese meta skill for building hierarchy skills

## Recommended Reading Order

1. Read [补充文档/Skill 新手引导.md](/D:/111111/test-case-hierarchy-suite/final-zh/补充文档/Skill%20新手引导.md).
2. Read [最终定稿-设计文档.md](/D:/111111/test-case-hierarchy-suite/final-zh/最终定稿-设计文档.md).
3. Use the two skill directories as executable guidance.

## Runtime Dependencies

`final-zh/` is a Chinese documentation and skill package, not a standalone runtime copy.
Validator code and test fixtures remain in the repository root:

- [scripts/validate_tree_hierarchy.py](/D:/111111/test-case-hierarchy-suite/scripts/validate_tree_hierarchy.py)
- [tests/](/D:/111111/test-case-hierarchy-suite/tests)

Run validation from the repository root:

```powershell
python scripts/validate_tree_hierarchy.py tests/fixtures/valid_tree.json
python -m unittest
```

## Encoding

All text files under `final-zh/` should use UTF-8.
