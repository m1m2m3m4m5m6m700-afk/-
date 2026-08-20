# FLIXO Main Governance Contract

Status: ENFORCEMENT-CONTRACT

## Required before production promotion
- Main branch protection must require passing status checks.
- Required checks: CI, Tool Platform, Early Detection, Engineering Completeness, Live AI Certification.
- Direct pushes to `main` must be disabled.
- Pull request review is required for production changes.
- Auto-merge may be enabled only after all required checks pass.
- Promotion must be blocked when Live AI evidence is missing or SHA-mismatched.

## Current integration boundary
This repository contains the executable promotion contract and required-check names. GitHub branch-protection settings are account/repository governance and must be verified in repository settings before declaring `main` operationally protected.
