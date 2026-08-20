# FLIXO Disaster Recovery

Status: IMPLEMENTED / DRILL-PENDING

## Recovery objectives
- RPO: 24h for non-critical content; tighter only where the backing store supports it.
- RTO: 4h target for production service restoration.

## Required controls
- Database backups are encrypted and access-controlled.
- Restore procedure is documented and versioned.
- Recovery requires validated schema/migrations before application start.
- Secrets can be rotated independently from application rollback.
- Previous known-good application artifact can be redeployed by exact commit SHA.

## Drill rule
A DR claim is not production-certified until a restore drill succeeds and produces evidence (timestamp, source backup, restore duration, verification result).
