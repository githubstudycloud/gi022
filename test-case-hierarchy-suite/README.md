# Test Case Hierarchy Suite

This repository captures the test-case hierarchy domain across requirements, design notes, reusable skills, and a runnable validator.

## Structure

- `docs/`: source requirements, design notes, structure spec, and examples
- `scripts/`: hierarchy validator used by docs and skills
- `tests/`: unit tests and JSON fixtures for valid and invalid trees
- `skill/`: source skills
- `final-zh/`: Chinese delivery package and Chinese skill variants

## Quick Start

1. Read [docs/requirements.md](/D:/111111/test-case-hierarchy-suite/docs/requirements.md) for the business rules and [docs/design.md](/D:/111111/test-case-hierarchy-suite/docs/design.md) for the implementation shape.
2. Validate a sample tree:

```powershell
python scripts/validate_tree_hierarchy.py tests/fixtures/valid_tree.json
```

3. Run the automated checks:

```powershell
python -m unittest
```

## Chinese Deliverables

Start with [final-zh/README.md](/D:/111111/test-case-hierarchy-suite/final-zh/README.md).

Key Chinese materials:

- [final-zh/最终定稿-设计文档.md](/D:/111111/test-case-hierarchy-suite/final-zh/最终定稿-设计文档.md)
- [final-zh/补充文档/Skill 新手引导.md](/D:/111111/test-case-hierarchy-suite/final-zh/补充文档/Skill%20新手引导.md)
- [final-zh/baseline-execution-case-guide/SKILL.md](/D:/111111/test-case-hierarchy-suite/final-zh/baseline-execution-case-guide/SKILL.md)
- [final-zh/hierarchy-skill-builder-guide/SKILL.md](/D:/111111/test-case-hierarchy-suite/final-zh/hierarchy-skill-builder-guide/SKILL.md)

## Conventions

- Repository text assets should use UTF-8.
- The validator and tests are the executable source of truth for hierarchy rules.
