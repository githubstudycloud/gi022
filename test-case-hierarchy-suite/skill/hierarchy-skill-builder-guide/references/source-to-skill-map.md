# Source To Skill Map

## Extraction model

Map local source artifacts into skill assets with this rule:

| Source artifact type | What to extract | Where it should go |
| --- | --- | --- |
| `docs/requirements.md` | stable terms, hard constraints, unique-child rules | `SKILL.md` overview or `references/` rule sheet |
| `docs/design.md` | data model, API shape, interaction rules | `references/` design checklist or template |
| `docs/tree-structure-spec.md` | alias tables, field semantics, long-form matrices | `references/` only |
| `docs/detail-field-grouping-example.md` | right-detail grouping and dynamic fields | `references/` only |
| `tests/fixtures/*.json` | valid and invalid examples | short examples in `references/` |
| existing `skill/*` folders | proven skill structure and phrasing patterns | structural inspiration only |

## Suggested build sequence

1. Read the request and name the narrow job.
2. Read the minimum set of docs that explain that job.
3. List the rules that must survive into the new skill.
4. Decide whether those rules are workflow guidance or reference material.
5. Write the new `SKILL.md`.
6. Add only the reference files that the workflow actually points to.

## Concrete local example

For the current repository, a focused case skill can be assembled like this:

| Local source | Extracted idea | Resulting destination |
| --- | --- | --- |
| `docs/requirements.md` | case placement restrictions | `references/case-context-rules.md` |
| `docs/design.md` | query/create/detail behaviors | `SKILL.md` workflow |
| `docs/tree-model-examples.md` | example paths | `references/` examples |
| `tests/fixtures/valid_tree.json` | positive example tree | short example snippet or validation note |
| `skill/test-case-hierarchy-guide/` | broad domain wording | narrower focused skill wording |

## Scope split heuristic

Create a separate companion skill when all of these are true:

- the subdomain has repeat questions of its own
- the answer workflow is shorter than the broad skill
- the core rules can fit in one reference sheet
- the broad skill would otherwise accumulate unrelated examples
