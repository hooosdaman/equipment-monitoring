# Role-Based Access Control Implementation

## Steps
- [x] 1. Sidebar.tsx - Restrict user role menu items to Dashboard, Weekly PM, Defect Reports only
- [x] 2. WeeklyPmView.tsx - Make user role read-only (hide add schedule, status as badge, no delete)
- [x] 3. DefectReportsView.tsx - Make user role read-only (hide log defect form)
- [x] 4. App.tsx - Pass currentUser to WeeklyPmView and DefectReportsView
- [x] 5. AccountsView.tsx - Allow admin to edit engineer accounts
- [x] 6. server.ts - Block user role from defect/weekly-pm writes; allow admin engineer edits

## Supabase Sync Enhancements (from feedback)
- [x] 7. supabaseSync.ts - Add deleteWeeklyPmFromSupabase + syncWeeklyPmToPmLogs functions
- [x] 8. server.ts - Weekly PM status updates always sync to weekly_pm_schedule; completed/cancelled also sync to pm_logs; added DELETE /api/weekly-pm/:id with Supabase deletion
- [x] 9. WeeklyPmView.tsx + App.tsx - Add delete schedule button & handler for non-read-only roles

## Verification
- [x] Build verified via `npm run build` (vite frontend + esbuild server bundle)
