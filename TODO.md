# Role-Based Access Control Implementation

## Steps
- [x] 1. Sidebar.tsx - Restrict user role menu items to Dashboard, Weekly PM, Defect Reports only
- [x] 2. WeeklyPmView.tsx - Make user role read-only (hide add schedule, status as badge)
- [x] 3. DefectReportsView.tsx - Make user role read-only (hide log defect form)
- [x] 4. App.tsx - Pass currentUser to WeeklyPmView and DefectReportsView
- [x] 5. AccountsView.tsx - Allow admin to edit engineer accounts
- [x] 6. server.ts - Block user role from defect/weekly-pm writes; allow admin engineer edits

## Verification
- [x] Run type check / dev server to verify role-based behavior

## Security Remediation (GitGuardian Secret)
- [x] Removed hardcoded Supabase service-role JWT from src/server/supabaseSync.ts (now loads from env only)
- [x] Removed "Quick Demo Roles" section from LoginView.tsx
- [x] Removed "Powered by SQLite & Supabase Sync" footer text
- [x] Scrubbed the key from ALL git history (supabaseSync.ts AND .env.example) via filter-branch
- [x] Deleted leftover refs/original backup refs containing old history
- [x] Force-pushed scrubbed history to GitHub (main -> f06dae3)
- [x] Ran git gc --prune=now to purge dangling old objects
- [x] Deleted helper script scrub_secret.py
- [x] Verified working tree + full history contain zero occurrences of the exposed key
