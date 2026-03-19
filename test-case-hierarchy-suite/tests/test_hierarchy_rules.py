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

    def test_valid_tree_passes(self):
        errors = validate_tree(self.fixture("valid_tree.json"))
        self.assertEqual(errors, [])

    def test_execution_mode_conflict_fails(self):
        errors = validate_tree(self.fixture("invalid_execution_mode.json"))
        self.assertTrue(
            any("single_container mode requires exactly one container_version" in error for error in errors)
        )

    def test_scene_directory_without_conversion_fails(self):
        errors = validate_tree(self.fixture("invalid_scene_directory.json"))
        self.assertTrue(
            any("directory directly under test_scene must have meta.convertedFrom='feature'" in error for error in errors)
        )

    def test_case_context_mismatch_fails(self):
        errors = validate_tree(self.fixture("invalid_case_context.json"))
        self.assertTrue(
            any("cases under baseline_version context must be baseline_case" in error for error in errors)
        )


if __name__ == "__main__":
    unittest.main()
