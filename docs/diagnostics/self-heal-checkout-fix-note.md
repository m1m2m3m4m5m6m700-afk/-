# Self-Heal checkout fix

The self-heal workflow must checkout `workflow_run.head_sha`, not `main`, and verify `git rev-parse HEAD` matches the failed run SHA before diagnosis or mutation.

This change is intentionally isolated to the self-heal workflow and its verification guard.
