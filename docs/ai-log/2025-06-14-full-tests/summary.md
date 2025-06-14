# Full Test Suite Run - June 14, 2025

This log captures the results of running `npm run test:all` after recent refactoring.

## Summary

| Test Type | Status | Notes |
|-----------|--------|-------|
| Baseline  | ✅ Pass | Azure authentication succeeded |
| DAO       | ✅ Pass | AI connection test executed |
| Services  | ✅ Pass | User GUID and spec selection tests passed |
| Endpoints | ⚠️ Skipped | Skipped in Codex environment |
| UI        | ✅ Pass | Agent flow and validation tests passed |
| E2E       | ❌ Fail | Server not running on port 3000 |

See `test-results.log` for the full console output.
