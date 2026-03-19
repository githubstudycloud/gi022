# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2026-03-18

### Added
- Initial monorepo setup with Nx 19 + pnpm + Vite
- `packages/ui`: Button, Input, Modal, Table, Form, Badge, Spinner, Tooltip components with Storybook 8
- `packages/utils`: date, http, storage, validator, format utilities (zero dependencies)
- `apps/web`: Main React application with React Router v6 + Zustand auth store
- `apps/admin`: Admin panel with RBAC permission system (usePermission + PermissionGuard)
- `configs/typescript`: Shared tsconfig (base/react/node)
- `configs/eslint`: Shared ESLint 9 flat config (base/react/storybook)
- `configs/vite`: Shared Vite config factory (app/lib modes)
- CI/CD: GitHub Actions workflows (ci.yml + release.yml) with Nx affected optimization
- Docs: Full SDLC documentation (Architecture, PRD, Tech Design, ADR, Coding Standards, Testing, Release, Runbook)
