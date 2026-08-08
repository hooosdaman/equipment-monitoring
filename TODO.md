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
