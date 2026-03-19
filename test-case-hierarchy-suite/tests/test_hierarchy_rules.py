from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from validate_tree_hierarchy import load_tree, validate_tree  # noqa: E402


class HierarchyRuleTests(unittest.TestCase):
    def fixture(self, name: str):
        return load_tree(ROOT / "tests" / "fixtures" / name)

    def assertContainsError(self, errors, message: str):
        self.assertTrue(any(message in error for error in errors), msg=f"Missing error: {message}\n{errors}")

    def test_valid_tree_passes(self):
        errors = validate_tree(self.fixture("valid_tree.json"))
        self.assertEqual(errors, [])

    def test_execution_mode_conflict_fails(self):
        errors = validate_tree(self.fixture("invalid_execution_mode.json"))
        self.assertContainsError(errors, "scene_grouped execution version cannot contain direct directory/feature children")

    def test_scene_direct_case_fails(self):
        errors = validate_tree(self.fixture("invalid_scene_directory.json"))
        self.assertContainsError(errors, "test_scene cannot contain cases directly")

    def test_container_direct_case_fails(self):
        errors = validate_tree(self.fixture("invalid_container_direct_case.json"))
        self.assertContainsError(errors, "case_container cannot contain cases directly")

    def test_case_context_mismatch_fails(self):
        errors = validate_tree(self.fixture("invalid_case_context.json"))
        self.assertContainsError(errors, "cases under baseline/container context must be baseline_case")

    def test_root_type_must_be_space(self):
        tree = {
            "longIdPath": "product-1",
            "shortId": "P-1",
            "currentLevelId": "product-1",
            "type": "product",
            "name": "Product",
            "number": "P-1",
            "children": [],
        }

        errors = validate_tree(tree)
        self.assertContainsError(errors, "root node must be of type 'space'")

    def test_execution_version_requires_locked_mode(self):
        tree = {
            "longIdPath": "space-1",
            "shortId": "SP-1",
            "currentLevelId": "space-1",
            "type": "space",
            "name": "Space",
            "number": "SP-1",
            "children": [
                {
                    "longIdPath": "space-1/baseline-1",
                    "shortId": "BL-1",
                    "currentLevelId": "baseline-1",
                    "type": "baseline_version",
                    "name": "Baseline",
                    "number": "BL-1",
                    "children": [
                        {
                            "longIdPath": "space-1/baseline-1/case-container-1",
                            "shortId": "CC-1",
                            "currentLevelId": "case-container-1",
                            "type": "case_container",
                            "name": "Container",
                            "number": "CC-1",
                            "children": [],
                        },
                        {
                            "longIdPath": "space-1/baseline-1/execution-1",
                            "shortId": "EX-1",
                            "currentLevelId": "execution-1",
                            "type": "execution_version",
                            "name": "Execution",
                            "number": "EX-1",
                            "children": [
                                {
                                    "longIdPath": "space-1/baseline-1/execution-1/case-container-1",
                                    "shortId": "ECC-1",
                                    "currentLevelId": "case-container-1",
                                    "type": "case_container",
                                    "name": "Execution Container",
                                    "number": "ECC-1",
                                    "children": [],
                                }
                            ],
                        },
                    ],
                }
            ],
        }

        errors = validate_tree(tree)
        self.assertContainsError(errors, "execution_version meta.lockedMode must be 'container_direct' or 'scene_grouped'")

    def test_baseline_case_container_cannot_contain_test_scene(self):
        tree = {
            "longIdPath": "space-1",
            "shortId": "SP-1",
            "currentLevelId": "space-1",
            "type": "space",
            "name": "Space",
            "number": "SP-1",
            "children": [
                {
                    "longIdPath": "space-1/baseline-1",
                    "shortId": "BL-1",
                    "currentLevelId": "baseline-1",
                    "type": "baseline_version",
                    "name": "Baseline",
                    "number": "BL-1",
                    "children": [
                        {
                            "longIdPath": "space-1/baseline-1/case-container-1",
                            "shortId": "CC-1",
                            "currentLevelId": "case-container-1",
                            "type": "case_container",
                            "name": "Container",
                            "number": "CC-1",
                            "children": [
                                {
                                    "longIdPath": "space-1/baseline-1/case-container-1/scene-1",
                                    "shortId": "SC-1",
                                    "currentLevelId": "scene-1",
                                    "type": "test_scene",
                                    "name": "Scene",
                                    "number": "SC-1",
                                    "children": [],
                                }
                            ],
                        }
                    ],
                }
            ],
        }

        errors = validate_tree(tree)
        self.assertContainsError(errors, "case_container under baseline_version cannot contain test_scene children")


if __name__ == "__main__":
    unittest.main()
