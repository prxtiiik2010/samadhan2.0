import { beforeSignIn } from "firebase-functions/v2/identity";
import * as logger from "firebase-functions/logger";

// Allowlist parsing - prefer environment variable set for Cloud Functions
// Set with: gcloud functions deploy ... --set-env-vars=ADMIN_ALLOWLIST="email1,email2"
// Or if using Firebase Gen2 via CLI, set on Cloud Run service after first deploy
function getAllowlist(): string[] {
  const raw = (process.env.ADMIN_ALLOWLIST || "pratikdave6969@gmail.com").toLowerCase();
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export const enforceAdminAllowlist = beforeSignIn((event) => {
  const email = event.data?.email?.toLowerCase();
  const allowlist = getAllowlist();

  logger.info("beforeSignIn check", { email, allowlistSize: allowlist.length });

  if (!email || !allowlist.includes(email)) {
    // Block sign-in completely for non-allowlisted users
    throw new Error("Access restricted: only authorized accounts may sign in.");
  }

  // Optionally mark the session with an admin claim for use in rules/UI
  return {
    sessionClaims: {
      admin: true,
    },
  };
});
