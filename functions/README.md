# Firebase Authentication Blocking Function (Allowlist)

This directory contains a Gen2 Cloud Function (`beforeSignIn`) that blocks sign-in for any account that is not in the allowlist. It also sets a custom session claim `admin=true` for allowlisted users.

## Files

- `src/index.ts` — Implements `beforeSignIn` blocking function.
- `tsconfig.json` — TypeScript configuration.
- `package.json` — Scripts and dependencies.

## Configure allowlist

The function reads the comma-separated allowlist from the `ADMIN_ALLOWLIST` environment variable. For quick starts, the code defaults to the single email `pratikdave6969@gmail.com` if no env var is set.

Recommended: set the env var so you can manage allowlisted emails without code changes:

```
# Replace with your emails (comma-separated, lowercase)
ADMIN_ALLOWLIST="pratikdave6969@gmail.com"
```

How to set environment variables depends on your deployment (Cloud Run/Functions Gen2). For most Firebase projects, set it in the Cloud Run service after the first deploy or use `gcloud` to set them. Keeping it simple: the default here already allows the one admin email.

## Deploy steps

1. Install Firebase CLI (if not already):
   ```bash
   npm i -g firebase-tools
   ```
2. Login and select your project:
   ```bash
   firebase login
   firebase use <your-project-id>
   ```
3. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
   Run the above inside the `functions/` directory.

4. Deploy only functions:
   ```bash
   firebase deploy --only functions
   ```

5. Deploy Firestore rules (from project root):
   ```bash
   firebase deploy --only firestore:rules
   ```

## Notes

- Blocking functions require the Blaze plan.
- The function applies to all providers (Email/Password, Google, etc.).
- The `admin=true` session claim can be used in Firestore rules and the frontend UI to gate admin-only routes.
