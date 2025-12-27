# Learnings: Auth Sync and Redirect Safety

_Temporary document - will be merged into knowledge base at end of feature_

## Gotchas

### Cloudflare env handling for Auth.js

- **Context**: SvelteKit on adapter-cloudflare
- **Issue**: Using only $env/dynamic/private can miss platform envs in some deployments
- **Solution**: Prefer event.platform.env for AUTH_SECRET and OAuth credentials

### Auth.js trustHost on Cloudflare Pages

- **Context**: Production deployments on CF_PAGES/VERCEL
- **Issue**: Overriding trustHost disables Auth.js platform auto-detection
- **Solution**: Treat CF_PAGES/VERCEL as trusted in resolveTrustHost

## Patterns That Worked

### Local D1 parity without touching prod

- **What**: Use wrangler dev + wrangler d1 migrations apply --local to keep a local-only DB
- **Why**: Local bindings mirror prod while keeping production data untouched

## Decisions Made

## Edge Cases
