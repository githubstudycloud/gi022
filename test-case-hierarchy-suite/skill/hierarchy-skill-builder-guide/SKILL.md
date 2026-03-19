---
name: hierarchy-skill-builder-guide
description: Meta guide for building or refactoring reusable hierarchy-domain Codex skills from local requirements, design docs, field specs, JSON fixtures, and existing example skills. Use when Codex needs to create another similar business skill for a tree or left-tree right-detail domain, extract stable node terminology and parent-child rules from documents, decide what belongs in SKILL.md versus references, or produce a focused skill that mirrors the test-case hierarchy patterns without copying the entire domain wholesale.
---

# Hierarchy Skill Builder Guide

## Overview

Use this skill to turn a set of hierarchy business documents into a reusable Codex skill.
Target a narrow, reusable job instead of "everything about the tree".

Good outputs usually contain:

- one focused `SKILL.md`
- one to three `references/` files holding the heavy domain material
- one aligned `agents/openai.yaml`

Use [../baseline-execution-case-guide/SKILL.md](../baseline-execution-case-guide/SKILL.md) as the reference example for the desired granularity of a focused business skill.

## Build Workflow

### 1. Narrow the problem before writing anything

Choose one stable slice of work, such as:

- case query and creation
- bilingual field conventions
- parent-child validation
- right-detail field grouping
- contract output for a specific page type

If the requested scope sounds like the whole domain, split it into a broad domain skill plus one or more focused sub-skills.

### 2. Extract four reusable layers from the source material

Read the source docs and capture only the parts another Codex instance would repeatedly need:

- stable terms and node types
- hard parent-child or uniqueness rules
- query, create, or detail behaviors
- reusable answer shapes, templates, or examples

Read [source-to-skill-map.md](references/source-to-skill-map.md) for a concrete mapping from local artifacts to skill files.

### 3. Decide what belongs in `SKILL.md`

Keep `SKILL.md` lean and procedural:

- overview of the job
- ordered workflow
- routing to specific reference files

Move heavy tables, examples, matrices, and templates into `references/`.
Add `scripts/` only when repeated validation or transformation must be deterministic.

### 4. Reuse patterns, not wording

Use the existing focused skill as a pattern:

- [../baseline-execution-case-guide/SKILL.md](../baseline-execution-case-guide/SKILL.md)
- [../baseline-execution-case-guide/references/case-context-rules.md](../baseline-execution-case-guide/references/case-context-rules.md)
- [../baseline-execution-case-guide/references/case-output-template.md](../baseline-execution-case-guide/references/case-output-template.md)

Mirror the structure only when it fits:

- short frontmatter description with strong trigger coverage
- concise overview
- workflow that tells Codex how to think
- references that hold the bulky domain content

Do not duplicate the exact terminology if the new domain differs.

### 5. Build from outside in

Write in this order:

1. frontmatter `description`
2. body workflow
3. reference files
4. `agents/openai.yaml`

Do not leave placeholders, TODOs, or empty resource directories unless they are actively used.

### 6. Validate before stopping

Run through the checks in [quality-gate.md](references/quality-gate.md).
Then run the validator script on the finished skill folder.

## Notes

When a source directory already contains a broad domain skill, prefer creating a focused companion skill instead of making the original skill bloated.
