# Tree Detail Contract

Use this reference when the user has a left-tree right-detail scene but has not yet made the data contract explicit.

## Minimum Parameter Checklist

Capture or infer these fields before committing to a design or implementation:

| Parameter | Purpose | Typical example |
| --- | --- | --- |
| `scene_name` | Business scene name | `department-management` |
| `tree_entity` | Entity represented by the left tree | `department` |
| `node_id_field` | Unique node identifier | `deptId` |
| `parent_id_field` | Parent identifier | `parentDeptId` |
| `node_label_field` | Text shown in the tree | `deptName` |
| `node_sort_field` | Sibling order field | `sortOrder` |
| `root_parent_value` | Value representing root level | `0` or `null` |
| `tree_query_scope` | How the tree is loaded | full tree, lazy load, filtered root |
| `detail_mode` | What the right pane shows | current node detail, child list, mixed |
| `detail_entity` | Primary entity shown on the right | `departmentProfile` or `employee` |
| `detail_id_field` | Identifier for right-side data | `deptId` or `employeeId` |
| `detail_fields` | Fields shown or edited on the right | `name,status,owner,remark` |
| `required_fields_on_create` | Required fields for creation | `deptName,parentDeptId` |
| `editable_fields_on_update` | Fields editable after creation | `deptName,leaderId,status` |
| `delete_policy` | Behavior when deleting a node | block, cascade, soft-delete, unbind |
| `uniqueness_rules` | Unique constraints | sibling name unique |
| `selection_behavior` | What happens after node selection | fetch detail, refresh child list |

Add these when relevant:

| Parameter | Purpose | Typical example |
| --- | --- | --- |
| `status_field` | Enable/disable state | `status` |
| `path_field` | Full ancestor path | `deptPath` |
| `leaf_flag_field` | Whether the node is a leaf | `isLeaf` |
| `permission_rules` | Visibility or edit restrictions | only admins can delete |
| `move_support` | Whether node re-parenting is allowed | drag-and-drop enabled |
| `audit_fields` | Created/updated metadata | `createdBy,updatedAt` |

## Operation Templates

### Query

Clarify these points:

1. Which node is selected by default
2. Whether the right pane shows the node itself or the node's children
3. Which filters come from the tree selection versus right-side form inputs
4. Whether changing the selected node resets pagination, tabs, and draft form state

### Create

Clarify these points:

1. Create at root, as child, or as sibling
2. Whether parent node must be selected before creation
3. Which fields are inherited from parent
4. Which defaults are auto-filled
5. What node becomes selected after successful creation

### Update

Clarify these points:

1. Which fields belong to the tree node header
2. Which fields belong to the detail form
3. Whether path, code, or sort fields are editable
4. Whether optimistic locking or version checks are required

### Delete

Clarify these points:

1. Whether deletion is hard, soft, or blocked
2. What happens when children exist
3. What happens to right-side related records
4. Which node becomes selected after deletion

### Move Or Reorder

Clarify these points:

1. Whether drag-and-drop is allowed
2. Whether cross-branch moves are allowed
3. Which fields persist the new parent and sort order
4. Whether moving a node updates path-derived fields

## Recommended Answer Template

Use this structure in responses when the user is still shaping the scene:

```md
Scene summary

Assumptions
- ...

Initial parameters
| key | value | note |
| --- | --- | --- |

Tree/detail mapping
- ...

Requested operation
- ...

Suggested API or data contract
- ...

Risks and open questions
- ...
```

## Common Mappings

### Department Tree + Department Detail

- Tree entity: department
- Right pane: current department detail form
- Create: add root department or child department
- Delete: usually block when child departments or employees still exist

### Category Tree + Product List

- Tree entity: category
- Right pane: child products filtered by selected category
- Create: add category or add product under selected category
- Delete: category deletion often requires product reassignment or empty category check

### Menu Tree + Permission Detail

- Tree entity: menu
- Right pane: current menu detail form or permission bindings
- Update: distinguish menu display properties from action permissions
- Delete: usually cascade to descendant menus only when explicitly allowed

## Example Invocation

Use this skill explicitly with prompts such as:

- `Use $tree-detail-crud-guide to define the initial parameters for a department tree page.`
- `Use $tree-detail-crud-guide to design create/update/delete rules for a menu tree with a detail form.`
- `Use $tree-detail-crud-guide to separate tree node metadata from the right-side child list in a category screen.`
