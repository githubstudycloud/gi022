---
name: tree-detail-crud-guide
description: Guide left-tree right-detail CRUD workflows for hierarchical admin UIs. Use when Codex needs to define initial parameters, map tree nodes to detail data, or guide query/create/update/delete flows for catalogs, departments, menus, permissions, classifications, or similar tree-based screens.
---

# Tree Detail Crud Guide

## Overview

Use this skill to turn a vague left-tree right-detail request into a concrete data contract and operation flow.
Treat the tree as the navigation and scope selector, and treat the right pane as the canonical detail, form, or child-record area.

## Quick Trigger Check

Apply this skill when the user is doing one or more of these tasks:

- Design a new left-tree right-detail page
- Clarify required initialization parameters for a tree screen
- Define how the selected node drives the detail panel
- Design or refine query, create, update, or delete flows
- Explain how to separate tree node metadata from right-side detail data
- Produce API contracts, SQL hints, or form-field rules for hierarchical CRUD

Typical user requests include:

- "Design a department management page with a tree on the left and detail on the right"
- "Define the initialization params and API contract for a menu tree"
- "Explain how the right-side form and child list should react to node changes"
- "Fill in the create, update, and delete rules for tree nodes"

## Workflow

### 1. Lock the minimum model

Start by normalizing the scene into two areas:

- Tree model: hierarchy, node identity, parent-child relation, label, ordering, lazy loading, expansion, selection
- Detail model: the data shown on the right after a node is selected, including form fields, tabs, child tables, or summaries

If the request is underspecified, collect or propose the minimum required parameters from [tree-detail-contract.md](references/tree-detail-contract.md).
Ask only for blocker information. If a parameter is missing but a safe default is common, propose the default and label it as an assumption.

### 2. Decide what the right pane represents

Resolve this before generating code or CRUD logic:

- Current node detail: a form or profile for the selected node itself
- Child records under current node: a table/list filtered by the selected node
- Mixed layout: node metadata at the top, child records below
- Read-only summary: aggregate metrics or linked records derived from the selected node

Do not blur these modes. Many bad designs come from mixing "edit the selected node" with "list the selected node's children" without making the distinction explicit.

### 3. Choose the operation mode

Handle the request according to the user's intent:

- Query: define selection path, filter scope, default node, and detail refresh behavior
- Create: specify whether creation happens at root, as a child, or as a sibling; define required fields and defaults
- Update: separate editable tree fields from editable detail fields; define save rules and concurrency rules if needed
- Delete: define delete target, confirmation text, cascade policy, soft-delete policy, and node refresh behavior
- Move or reorder: define drag-and-drop or explicit parent/sort updates when the scene implies tree maintenance

### 4. Produce a concrete output

When answering, prefer this output shape:

1. Scene summary
2. Assumptions and missing parameters
3. Initial parameter block
4. Tree/detail data mapping
5. Operation flow for the requested action
6. Suggested API, SQL, state, or form rules
7. Risks, edge cases, and open questions

If the user asks for implementation, carry the same structure into component props, API DTOs, backend tables, or validation rules.

### 5. Apply guardrails

Always make these distinctions explicit:

- Tree node identity vs detail record identity
- Parent-child relation vs filter relation
- Rename node vs edit node detail
- Delete node vs delete children vs unbind child records
- Current selection state vs persisted data state

When the user asks for delete behavior, always state one of these policies:

- Block deletion when children exist
- Cascade deletion to descendants
- Soft delete and hide from tree
- Unbind related detail records but keep them

When the user asks for code in an existing project, preserve the project's framework, naming, and UI conventions instead of inventing a new abstraction.

## Reference

Read [tree-detail-contract.md](references/tree-detail-contract.md) when you need:

- A minimum parameter checklist
- A reusable response template
- Operation-specific prompts for query/create/update/delete/move
- Example mappings for common hierarchical business objects

Read [tree-detail-template.ts](references/tree-detail-template.ts) and [tree-detail-template.json](references/tree-detail-template.json) when you need a ready-to-edit scaffold for implementation or API design.
