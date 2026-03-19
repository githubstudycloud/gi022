"""Unit tests for User aggregate."""

import pytest
from user_service.domain.entities.user import User, UserStatus
from user_service.domain.events.user_events import UserCreated, UserRoleAssigned
from pe_core.exceptions import ConflictError, DomainError


@pytest.mark.unit
class TestUserAggregate:
    def test_create_user_emits_event(self):
        user = User.create(
            email="alice@example.com",
            hashed_password="$2b$12$hash",
            full_name="Alice",
        )
        events = user.pull_events()
        assert len(events) == 1
        assert isinstance(events[0], UserCreated)
        assert events[0].email == "alice@example.com"

    def test_create_user_default_role(self):
        user = User.create(
            email="bob@example.com",
            hashed_password="$2b$12$hash",
            full_name="Bob",
        )
        assert "user" in user.roles

    def test_assign_role_emits_event(self):
        user = User.create("c@example.com", "$2b$12$hash", "Carol")
        user.pull_events()
        user.assign_role("admin")
        events = user.pull_events()
        assert len(events) == 1
        assert isinstance(events[0], UserRoleAssigned)
        assert events[0].role == "admin"

    def test_assign_duplicate_role_raises(self):
        user = User.create("d@example.com", "$2b$12$hash", "Dave")
        with pytest.raises(DomainError):
            user.assign_role("user")

    def test_deactivate_user(self):
        user = User.create("e@example.com", "$2b$12$hash", "Eve")
        user.deactivate()
        assert user.status == UserStatus.INACTIVE

    def test_deactivate_twice_raises(self):
        user = User.create("f@example.com", "$2b$12$hash", "Frank")
        user.deactivate()
        with pytest.raises(DomainError):
            user.deactivate()
