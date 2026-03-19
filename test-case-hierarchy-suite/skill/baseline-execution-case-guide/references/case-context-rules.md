# Case Context Rules

## Core resolution rule

Infer the case type from the nearest version ancestor:

| Nearest version ancestor | Case type under `directory` / `feature` |
| --- | --- |
| `baseline_version` | `baseline_case` |
| `container_version` | `baseline_case` |
| `execution_version` | `execution_case` |

If no version ancestor is available, treat the context as unresolved.

## Parent legality

Only these nodes may directly contain cases:

| Parent type | Direct case child allowed |
| --- | --- |
| `directory` | Yes |
| `feature` | Yes |

All of these are illegal direct case parents:

- `baseline_version`
- `container_version`
- `execution_version`
- `case_container`
- `test_scene`
- `space`
- `product`

## Execution-branch shape check

When the nearest version ancestor is `execution_version`, validate the locked shape before proposing create or search behavior.

### `container_direct`

Allowed path:

```text
execution_version
└─ case_container
   ├─ directory
   │  └─ execution_case
   └─ feature
      └─ execution_case
```

Reject:

- direct cases under `case_container`
- any `test_scene` branch in the same execution version

### `scene_grouped`

Allowed path:

```text
execution_version
└─ case_container
   └─ test_scene
      ├─ directory
      │  └─ execution_case
      └─ feature
         └─ execution_case
```

Reject:

- direct cases under `case_container`
- direct cases under `test_scene`
- direct `directory` or `feature` under `case_container`

## Query checklist

Use this list when the user asks how to search, locate, or switch between cases:

1. Identify the selected node and nearest version ancestor.
2. Decide whether the query is for the selected case, sibling cases, or descendant cases.
3. State the inferred case type.
4. State whether scene scope is required for execution branches.
5. State which node change should refresh the list or detail panel.

## Create checklist

Use this list when the user asks how to add a new case:

1. Confirm the target parent is `directory` or `feature`.
2. Confirm the nearest version ancestor.
3. Confirm the execution shape if the branch is execution-side.
4. Produce the resulting case type.
5. List required fields and inherited defaults.
6. State the post-create tree refresh target.

## Common failure patterns

- Inferring `execution_case` from a `container_version` branch
- Allowing cases directly under `case_container`
- Allowing cases directly under `test_scene`
- Forgetting that `container_version` still behaves like baseline-side context
- Designing a case detail panel when the selected node is actually a directory or feature
