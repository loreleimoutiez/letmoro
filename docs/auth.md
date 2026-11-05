# Account setup and current limits

Supabase Auth is the selected identity service. Authentication is required before game preferences. Testers only sign in or create an account in Letmoro; they never need access to the owner's Supabase or Google Cloud consoles.

## Application configuration

Copy `.env.example` to ignored `.env.local` and set the project HTTPS URL and public `sb_publishable_...` key. Actual project configuration stays outside Git. Public configuration is necessarily embedded in a client APK. Server secrets and Google client secrets must never be included.

Enable email/password and confirmation in Supabase. Add exactly `letmoro://auth/callback` to the allowed redirect URLs. Native Android registers only that return target. The client uses PKCE, exchanges the one-time return code for a session, and rejects other callback targets or token fragments. Email recovery reopens the app in password-change mode.

The configured test project's public settings were checked: email and Google enabled, signup enabled, email confirmation required. No real accounts or emails were created by the agent. Email delivery/rate limits and real confirmation/recovery must be tested by the user. Configure production SMTP and password policy before wider distribution.

## Google (owner configuration, once)

1. Create/select a Google Cloud project and its Google Auth Platform branding/audience.
2. Create an OAuth client of type **Web application**, because this app uses a browser-based Supabase OAuth exchange.
3. Add the Supabase callback `${SUPABASE_URL}/auth/v1/callback` as a Google authorized redirect URI.
4. In Supabase Authentication → Sign In / Providers → Google, enable Google and enter that client's ID and secret. Keep nonce skipping and users-without-email disabled for this flow. The secret belongs only in Supabase.
5. Keep `letmoro://auth/callback` in Supabase's redirect allow list. Google returns to Supabase; Supabase then returns to Android.

The player presses **Continue with Google**, chooses a Google account and authorizes the app. The system browser/Custom Tab is used, not an embedded Google login WebView. Google account passwords never enter Letmoro. The button is enabled only when Supabase's public settings announce Google support. Configure the Google audience/test-user settings for intended testers; they do not need developer-console access.

Google sign-in requests identity access through Supabase, not Gmail messages or health data. Health Connect is a separate local Android authorization.

## Session and game storage

Android sessions and PKCE verifiers use AES-GCM with an Android Keystore key and per-entry authenticated data. Encrypted values reside in private app preferences; backup/transfer and native logging are disabled. There is no plaintext native token fallback. Browser preview uses ephemeral session storage. Password fields clear after requests and are never written to a game save.

Game saves are keyed separately per authenticated user on the device. An older unscoped save is claimed once by the first authenticated user. Claim ownership precedes copying so a failed write cannot expose it to another account. Invalid saves remain for that owner until explicit reset. Sign-out hides the game and stops live observation; it does not delete game saves. Temporary reset erases only the signed-in account's local game, not the Supabase account.

No cloud game save, health upload, remote profile table or account-deletion endpoint exists. Before synchronization, define data ownership and conflict handling, then use server-enforced row-level policies. Never add a service-role key to work around client authorization.

## Validation

Unit tests cover public-only HTTPS configuration, exact callback acceptance and local account isolation/migration/reset. Browser tests intercept auth HTTP requests and verify signup, login/logout, recovery, Google browser launch and PKCE callbacks. Native encrypted storage compiles but still needs physical persistence/reinstall/key-loss checks. Actual Google consent, email delivery and recovery are device test tasks, not claimed as completed.

References: [Supabase password auth](https://supabase.com/docs/guides/auth/passwords), [native redirects](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).
