# Self-Heal checkout integrity

The self-heal workflow must checkout `workflow_run.head_sha`, verify `git rev-parse HEAD` equals that SHA, and only then run diagnosis or mutation.
