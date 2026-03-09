# VMS-Frontend (React + MUI)

## Run
1. `npm install`
2. `npm run dev`
3. If backend auth setup changed, clear browser local storage key `vms_auth` and login again.

Frontend runs on `http://localhost:5173` and proxies `/api` to backend `http://localhost:8080`.

## Features implemented
- Session login/logout with `X-Session-Token`
- Backend uses custom `user_session` table (not `SPRING_SESSION`)
- Protected routing
- Dashboard (effective widgets): `/api/v1/access/dashboard-configs/effective/me`
- Company list with filter/sort fields
- Employee list with company/branch/department and HR filters
- Admin Dashboard Config UI (toggle widget visibility)

## Key pages
- `/login`
- `/`
- `/companies`
- `/employees`
- `/dashboard-config` (admin only)
