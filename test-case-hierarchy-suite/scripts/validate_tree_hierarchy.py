from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

RULES: Dict[str, set[str]] = {
    "space": {"product", "container_version", "baseline_version"},
    "product": {"container_version", "baseline_version"},
    "container_version": {"case_container", "execution_version"},
    "baseline_version": {"case_container", "execution_version"},
    "case_container": {"directory", "feature"},
    "execution_version": {"container_version", "test_scene"},
    "test_scene": {"feature", "directory"},
    "directory": {"directory", "feature", "baseline_case", "execution_case"},
    "feature": {"directory", "feature", "baseline_case", "execution_case"},
    "baseline_case": set(),
    "execution_case": set(),
}

REQUIRED_FIELDS = ["longIdPath", "shortId", "currentLevelId", "type", "name", "number"]


class ValidationError(Exception):
    pass


def load_tree(path: str | Path) -> Dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def validate_tree(tree: Dict[str, Any]) -> List[str]:
    errors: List[str] = []
    _validate_node(
        node=tree,
        parent=None,
        ancestors=[],
        errors=errors,
    )
    return errors


def _validate_node(
    node: Dict[str, Any],
    parent: Optional[Dict[str, Any]],
    ancestors: List[Dict[str, Any]],
    errors: List[str],
) -> None:
    node_type = node.get("type")
    path = node.get("longIdPath", "<missing-path>")

    for field in REQUIRED_FIELDS:
        value = node.get(field)
        if value is None or value == "":
            errors.append(f"{path}: missing required field '{field}'")

    if not isinstance(path, str) or not path or path.startswith("/") or path.endswith("/"):
        errors.append(f"{path}: longIdPath must be a non-empty path without leading or trailing '/'")
    else:
        last_segment = path.split("/")[-1]
        if not last_segment:
            errors.append(f"{path}: longIdPath contains an empty segment")
        elif node.get("currentLevelId") != last_segment:
            errors.append(
                f"{path}: currentLevelId '{node.get('currentLevelId')}' does not match "
                f"last path segment '{last_segment}'"
            )

    short_id = node.get("shortId")
    if isinstance(short_id, str) and "/" in short_id:
        errors.append(f"{path}: shortId must not contain '/'")

    if parent is None:
        if node_type != "space":
            errors.append(f"{path}: root node must be of type 'space'")
    else:
        parent_path = parent.get("longIdPath", "")
        if not isinstance(path, str) or not path.startswith(f"{parent_path}/"):
            errors.append(f"{path}: child path must start with parent path '{parent_path}/'")

        allowed = RULES.get(parent.get("type"), set())
        if node_type not in allowed:
            errors.append(
                f"{path}: type '{node_type}' is not allowed under parent type '{parent.get('type')}'"
            )

    children = node.get("children", [])
    if not isinstance(children, list):
        errors.append(f"{path}: children must be a list")
        return

    _validate_special_rules(node=node, children=children, ancestors=ancestors, errors=errors)

    next_ancestors = ancestors + [node]
    for child in children:
        _validate_node(child, node, next_ancestors, errors)


def _validate_special_rules(
    node: Dict[str, Any],
    children: List[Dict[str, Any]],
    ancestors: List[Dict[str, Any]],
    errors: List[str],
) -> None:
    node_type = node.get("type")
    path = node.get("longIdPath", "<missing-path>")
    child_types = [child.get("type") for child in children]

    if node_type == "baseline_version":
        case_container_count = child_types.count("case_container")
        if case_container_count != 1:
            errors.append(
                f"{path}: baseline_version must contain exactly one case_container, got {case_container_count}"
            )

    if node_type == "execution_version":
        mode = (node.get("meta") or {}).get("executionMode")
        container_count = child_types.count("container_version")
        scene_count = child_types.count("test_scene")

        if mode not in {"single_container", "multi_scene"}:
            errors.append(
                f"{path}: execution_version meta.executionMode must be "
                "'single_container' or 'multi_scene'"
            )
        elif mode == "single_container":
            if container_count != 1 or scene_count != 0:
                errors.append(
                    f"{path}: single_container mode requires exactly one container_version "
                    "and zero test_scene children"
                )
        elif mode == "multi_scene":
            if scene_count < 1 or container_count != 0:
                errors.append(
                    f"{path}: multi_scene mode requires one or more test_scene "
                    "and zero container_version children"
                )

    if node_type == "test_scene":
        for child in children:
            if child.get("type") == "directory":
                meta = child.get("meta") or {}
                if meta.get("convertedFrom") != "feature":
                    errors.append(
                        f"{child.get('longIdPath', '<missing-path>')}: directory directly under "
                        "test_scene must have meta.convertedFrom='feature'"
                    )

    if node_type in {"baseline_case", "execution_case"}:
        version_context = _find_version_context(ancestors)
        if version_context == "baseline_version" and node_type != "baseline_case":
            errors.append(f"{path}: cases under baseline_version context must be baseline_case")
        if version_context == "execution_version" and node_type != "execution_case":
            errors.append(f"{path}: cases under execution_version context must be execution_case")
        if version_context is None:
            errors.append(
                f"{path}: unable to infer case context because no baseline_version or execution_version "
                "ancestor was found"
            )


def _find_version_context(ancestors: List[Dict[str, Any]]) -> Optional[str]:
    for ancestor in reversed(ancestors):
        ancestor_type = ancestor.get("type")
        if ancestor_type in {"baseline_version", "execution_version"}:
            return ancestor_type
    return None


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Validate the test tree hierarchy JSON structure.")
    parser.add_argument("tree_json", help="Path to the JSON tree fixture")
    args = parser.parse_args()

    tree = load_tree(args.tree_json)
    errors = validate_tree(tree)
    if errors:
        for error in errors:
            print(error)
        return 1

    print("Tree is valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
