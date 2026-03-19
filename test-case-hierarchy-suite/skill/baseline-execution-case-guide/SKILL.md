---
name: baseline-execution-case-guide
description: Guide baseline-case and execution-case query, validation, and creation flows inside the test-case hierarchy suite. Use when Codex needs to decide whether a node belongs to baseline or execution context, identify the correct parent for a new case, explain where a case can or cannot be created, design case-focused left-tree right-detail behavior, or answer questions about baseline_case and execution_case fields, actions, and search scope.
---

# Baseline Execution Case Guide

## Overview

Use this skill for questions centered on `baseline_case` and `execution_case` instead of re-deriving the full hierarchy every time.
Reduce the task to three decisions:

- What is the nearest version context
- Whether the current node is a legal case parent
- What query, create, and detail behavior follows from that context

## Workflow

### 1. Resolve the nearest version context first

Find the nearest ancestor that is one of these node types:

- `baseline_version`
- `container_version`
- `execution_version`

Apply these rules:

- `baseline_version` and `container_version` both produce `baseline_case`
- `execution_version` produces `execution_case`
- If the nearest version context cannot be proven, stop and mark that as a blocker instead of guessing

Read [case-context-rules.md](references/case-context-rules.md) when you need the full parent/context matrix.

### 2. Validate the candidate parent before discussing case behavior

Only `directory` and `feature` can directly contain cases.
Always reject or flag these invalid parents:

- `baseline_version`
- `container_version`
- `execution_version`
- `case_container`
- `test_scene`

For execution branches, also check the locked shape:

- `container_direct`: case must be under `case_container -> directory|feature`
- `scene_grouped`: case must be under `case_container -> test_scene -> directory|feature`

### 3. Separate query from create

For query tasks, define:

- selected node and effective search scope
- inferred case type
- filters tied to the current branch or scene
- what refreshes when the user switches nodes

For create tasks, define:

- exact target parent
- inherited version context
- resulting case type
- required fields and safe defaults
- tree/detail refresh after creation

Do not mix "find the right case" with "create a new case" in one vague answer. Split them explicitly.

### 4. Keep the detail model case-focused

When the selected node is a case, keep the right pane centered on the case itself:

- stable identity fields such as path, type, name, and code
- business fields such as level, priority, owner, and description
- execution-only fields such as result or run status when the node is `execution_case`
- allowed actions such as edit, move, convert parent type, or delete

If the user is actually asking about the parent directory or feature, say so instead of treating the whole panel as case detail.

### 5. Answer in a fixed output shape

Prefer this order:

1. Scenario summary
2. Resolved version context and assumptions
3. Allowed parent and resulting case type
4. Query or create flow
5. Detail fields and UI actions
6. Risks, invalid states, and open questions

Read [case-output-template.md](references/case-output-template.md) when you need a ready-made answer skeleton.

## Notes

Use [../../scripts/validate_tree_hierarchy.py](../../scripts/validate_tree_hierarchy.py) when the task includes a real tree JSON and the question depends on whether the structure is valid.
