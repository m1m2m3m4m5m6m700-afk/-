# Self-Heal Free-Tier Cost Controls

## Applied controls
- Self-Heal workflow timeout is 15 minutes.
- Self-Heal diagnostic artifacts are retained for 7 days.
- Experimental rate limiting is capped at 2 Self-Heal runs/hour and applies only to `test/self-heal-*` branches, so production failures are not silently suppressed.
- The main CI workflow already uses npm caching through `actions/setup-node@v4` with `cache: npm`.

## Vercel deployment boundary
The repository CI workflow does not contain a Vercel deployment step. Vercel is integrated externally, so setting `SKIP_DEPLOY=true` in `ci.yml` cannot disable that external deployment. Vercel quota mitigation must be handled in the Vercel/GitHub integration or with a staging/fork strategy.

## Safety
- `autoApplyAllowed` remains disabled.
- Auto-merge remains disabled.
- No new `src/**` auto-fix scope was added.
