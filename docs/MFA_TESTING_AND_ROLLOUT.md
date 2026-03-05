# MFA Testing and Rollout

## Testing Strategy

### Unit tests (API)

- **MfaTotpService** (`src/app/mfa/mfa-totp.service.spec.ts`): TOTP secret generation, token generation/verification, URI format, backup code format. Run with: `pnpm test` (after adding Jest – see below).
- **MfaService**: Recommended tests for setup flow, verifyAndEnable, verifyToken (success/failure), verifyBackupCode, disable, generateNewBackupCodes, and lockout after 5 failed attempts.

### Integration tests (API)

- Login with MFA disabled: same behavior as before (cookie set, user returned).
- Login with MFA enabled, no `mfaToken`: response `{ requiresMfa: true, userId }`, no cookie.
- Login with MFA enabled and valid TOTP: cookie set, `twoFactorVerified: true` on session.
- Login with invalid TOTP: 400, failed attempts incremented; after 5 attempts, 429 lockout.

### Frontend / manual QA

- Full login flow: email/password → MFA step → code → redirect.
- Profile Security: enable 2FA (QR + backup codes + verify), disable 2FA (with password), regenerate backup codes.
- Use backup code at login and confirm it is consumed.

## Adding Jest to lenbow-api

To run the unit tests, add Jest and NestJS testing utilities:

```bash
pnpm add -D jest @nestjs/testing ts-jest @types/jest
```

Add to `package.json`:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

Create `jest.config.js` at the project root (or use `nest g config` if using Nest CLI) with appropriate `modulePathIgnorePatterns` and `testMatch` for `*.spec.ts`.

## Rollout

- MFA is **off by default**; existing users are unchanged.
- Enable 2FA only when the user completes the setup flow in Security Settings.
- Optional: feature flag or env var to hide MFA UI until rollout.

## Monitoring

- Log MFA events: setup started, enabled, disabled, failed attempts, lockouts.
- Metrics: count of users with MFA enabled, failed verification attempts per user, lockout count.
- Alerts: spike in failed MFA attempts or lockouts.
