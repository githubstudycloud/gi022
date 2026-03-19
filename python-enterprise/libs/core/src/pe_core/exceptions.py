"""Shared domain and application exceptions."""

from __future__ import annotations


class ApplicationError(Exception):
    """Base application error."""

    def __init__(self, message: str, code: str = "APPLICATION_ERROR") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


class DomainError(ApplicationError):
    """Domain rule violation."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="DOMAIN_ERROR")


class NotFoundError(ApplicationError):
    """Resource not found."""

    def __init__(self, resource: str, identifier: object) -> None:
        super().__init__(f"{resource} '{identifier}' not found", code="NOT_FOUND")
        self.resource = resource
        self.identifier = identifier


class ConflictError(ApplicationError):
    """Resource already exists / conflict."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="CONFLICT")


class ValidationError(ApplicationError):
    """Input validation failed."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="VALIDATION_ERROR")


class UnauthorizedError(ApplicationError):
    """Authentication required."""

    def __init__(self, message: str = "Unauthorized") -> None:
        super().__init__(message, code="UNAUTHORIZED")


class ForbiddenError(ApplicationError):
    """Insufficient permissions."""

    def __init__(self, message: str = "Forbidden") -> None:
        super().__init__(message, code="FORBIDDEN")
