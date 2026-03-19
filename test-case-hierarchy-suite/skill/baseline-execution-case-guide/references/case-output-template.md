# Case Output Template

## Query answer template

```md
Scenario summary

Resolved context
- Selected node:
- Nearest version ancestor:
- Inferred case type:
- Assumptions:

Query flow
- Effective search scope:
- Required filters:
- Detail refresh rule:

Case detail focus
- Stable fields:
- Business fields:
- Context-specific fields:

Risks / open questions
- ...
```

## Create answer template

```md
Scenario summary

Resolved context
- Target parent:
- Parent type:
- Nearest version ancestor:
- Inferred case type:
- Assumptions:

Create flow
- Whether creation is allowed:
- Required preconditions:
- Required fields:
- Safe defaults:
- Post-create refresh:

Right-detail behavior
- Which panel opens after create:
- Which actions become available:

Risks / open questions
- ...
```

## Short examples

### Example A: baseline-side create

```md
Resolved context
- Target parent: `.../case_container/feature-a`
- Parent type: `feature`
- Nearest version ancestor: `container_version`
- Inferred case type: `baseline_case`

Create flow
- Whether creation is allowed: Yes
- Required fields: `name`, `number`, business core fields
- Safe defaults: inherit branch context from the parent feature
```

### Example B: execution-side query

```md
Resolved context
- Selected node: `.../execution_version/case_container/scene-a/feature-a`
- Nearest version ancestor: `execution_version`
- Inferred case type: `execution_case`

Query flow
- Effective search scope: descendants of the selected feature
- Required filters: current scene path and current feature path
- Detail refresh rule: refresh list and summary when scene or feature changes
```
