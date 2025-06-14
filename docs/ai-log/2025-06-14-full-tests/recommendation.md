# Connection Issues Recommendations

This document summarizes key recommendations for resolving recurring connection issues observed in the development logs.

## Observed Issues
- Repeated failures fetching font CSS from Google Fonts.
- 500 errors returned from `/api/agent/generate-design-concepts` during tests.
- Warning about unknown `http-proxy` setting during npm commands.

## Recommendations
1. **Confirm Proxy Settings** – Review environment variables and `.npmrc` for proxy configuration to ensure they align with the outbound network policy.
2. **Allow Network Traffic to OpenAI** – Verify that outbound DNS and TLS traffic to `openai.com` (or the configured Azure OpenAI endpoint) is permitted so API calls succeed.
3. **Use Fallback or Local Fonts** – Consider hosting required fonts in the `public/` directory or providing CSS fallbacks so the UI does not rely on external font servers.

These steps should help resolve the connection issues impacting AI calls and optional font loading.
