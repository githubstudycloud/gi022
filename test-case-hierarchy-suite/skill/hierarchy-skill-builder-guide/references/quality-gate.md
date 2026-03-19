# Quality Gate

## Trigger quality

Check these before finalizing the skill:

- The `description` says both what the skill does and when to use it.
- The trigger examples are covered by the frontmatter, not only by the body.
- The skill scope is narrow enough to be reusable.

## Progressive disclosure

Check these content boundaries:

- `SKILL.md` contains workflow, not giant domain tables.
- Every large matrix or template lives in `references/`.
- Every reference file is explicitly mentioned from `SKILL.md`.
- No unused resource directories remain.

## Example reuse

When using an existing local skill as a template:

- copy the structure only when it matches the new domain
- keep the new domain terms accurate
- avoid cargo-culting example headings that do not apply
- confirm the new skill can stand on its own without the old skill loaded

## Repo-specific review

For hierarchy skills in this repository, verify:

- source docs used are the minimum set needed
- hard parent-child rules are preserved
- right-detail behavior is not mixed with tree-structure rules unless needed
- validation or fixture files are referenced only when they add real value

## Final checks

Run all of these:

1. Remove TODOs and placeholder prose.
2. Read the skill top to bottom once as if another agent will use it cold.
3. Confirm `agents/openai.yaml` still matches the skill scope.
4. Run `quick_validate.py` on the skill folder.
