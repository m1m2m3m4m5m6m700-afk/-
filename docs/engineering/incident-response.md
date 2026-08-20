# FLIXO Incident Response

Status: IMPLEMENTED / DRILL-PENDING

## Incident loop
`Detect → Classify → Contain → Diagnose → Fix → Verify → Remember → Prevent → Postmortem`

## Required evidence
- incident ID / correlation ID
- exact SHA or deployment identifier
- sanitized error report
- impact and affected tools
- root cause
- mitigation and permanent fix
- regression guard added when recurrence is possible
- owner and follow-up date

## Human control
AI may summarize, classify, and recommend. It may not close an incident, promote code, or apply a fix automatically.
