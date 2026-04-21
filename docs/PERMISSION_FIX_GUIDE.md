# Permission Portal Access Fix - Complete Guide

## Problem Summary
Staff users with 'Manage Pricing' and other permissions couldn't access their assigned portals. The system would either:
- Redirect them to the home page
- Prevent access even with correct permissions
- Not show navigation items for their allowed portals

## Root Causes Fixed

### 1. **Incomplete Permission Normalization**
The `normalizePermissions()` function didn't properly handle edge cases:
- Null/undefined permissions from database
- Malformed JSON data
- Missing keys in partial objects

**Fix:** Enhanced normalization with explicit null/undefined handling and complete key validation.

### 2. **Unreliable Session-Token Permission Flow**
The session callback sometimes prioritized `user?.permissions` over `token.permissions`, but with JWT strategy, the token is the source of truth.

**Fix:** Session callback now reliably uses token values as the primary source.

### 3. **No Validation of Stored Permissions**
Staff permissions could be malformed in the database without any way to detect or fix them.

**Fix:** Added admin utilities to verify and repair permission data.

## How to Fix Your System

### Step 1: Verify Current Permission Status
As an admin user, navigate to:
```
/api/debug/permissions
```
This shows your current permission state from both session and database.

### Step 2: Check for Permission Issues (Admin Only)
```
GET /api/admin/permissions-verify
```
This endpoint checks all STAFF users for permission issues and shows which ones need fixing.

### Step 3: Auto-Fix Permission Issues (Admin Only)
```
POST /api/admin/permissions-verify
```
This will:
- Normalize all STAFF user permissions
- Fix any malformed data in the database
- Log the action in audit logs

### Step 4: Verify Staff User Can Access Their Portal
1. Have the staff user log out completely
2. Log them back in
3. They should now see their permitted portal options in the sidebar
4. They should be able to access their assigned pages (e.g., `/dashboard/pricing`)

## Manual Permission Assignment

### Using the Staff Management Interface
1. Go to **Dashboard** → **Staff Management**
2. Click **Edit** on a staff member
3. Toggle the permissions you want to grant:
   - ✅ **Cashier** - Access check-in/check-out portal
   - ✅ **View Bookings** - View reservations list
   - ✅ **Manage Bookings** - Modify booking details
   - ✅ **View Facilities** - View facility listings
   - ✅ **Manage Facilities** - Create/edit facilities
   - ✅ **View Reports** - Access analytics and reports
   - ✅ **Manage Pricing** - Manage facility pricing
   - ✅ **Manage Staff** - Manage staff accounts and permissions
4. Click **Save**

### Verifying Permission Changes
After saving:
1. The staff user must **log out and log back in** for changes to take effect
2. Navigate to `/api/debug/permissions` to verify the permission change took effect
3. The sidebar should now show the newly assigned portal

## Testing the Fix

### Quick Test for 'Manage Pricing' Access
1. Log in as admin
2. Create or edit a staff user with ONLY "Manage Pricing" enabled
3. Sign out and log in as that staff user
4. You should be automatically redirected to `/dashboard/pricing`
5. The sidebar should only show "Pricing" option
6. You should be able to view and manage pricing

### Complete Permission Test
For each permission type:
1. Create a test staff user with ONLY that permission
2. Log in as the test user
3. Verify:
   - Automatic redirect to the correct portal
   - Navigation shows only that menu item
   - You can access the portal without 403 errors
   - Other restricted portals redirect you back

## Files Modified

1. **src/lib/permissions.ts** - Enhanced `normalizePermissions()` function
2. **src/lib/auth.ts** - Fixed session callback to reliably use token values
3. **src/app/api/debug/permissions/route.ts** - New debugging endpoint (can be removed in production)
4. **src/app/api/admin/permissions-verify/route.ts** - New admin utility for verification/repair

## Removing Debug Endpoints (Production)

The debug endpoints are useful during troubleshooting but should be removed or properly secured before production:

### Option 1: Delete the endpoints
```bash
rm src/app/api/debug/permissions/route.ts
rm src/app/api/admin/permissions-verify/route.ts
```

### Option 2: Restrict to admin only (Recommended)
The `/api/admin/permissions-verify` endpoint already requires admin access.
The `/api/debug/permissions` endpoint should be removed or restricted.

## Troubleshooting Checklist

- [ ] Staff user can log in successfully
- [ ] `/api/debug/permissions` shows correct permissions in database
- [ ] `/api/debug/permissions` shows correct permissions in JWT token
- [ ] Staff user sees their permitted portals in sidebar navigation
- [ ] Staff user can access `/dashboard/pricing` if they have "Manage Pricing" permission
- [ ] Staff user is NOT redirected to home page
- [ ] Middleware doesn't show 403 errors in logs

## Common Issues and Solutions

### Issue: User still can't access portal after changes
**Solution:**
1. Verify permissions were saved (check database)
2. Run `/api/admin/permissions-verify` POST to normalize
3. User must log out and log back in
4. Check `/api/debug/permissions` to confirm

### Issue: Navigation doesn't show the portal option
**Solution:**
1. Check permissions in database are correct
2. Reload the page or close/reopen browser
3. Check browser console for JavaScript errors
4. Verify session was properly refreshed after login

### Issue: 403 Forbidden errors in browser console
**Solution:**
1. This shouldn't happen after the fixes
2. Check if the backend code was properly updated
3. Restart the Next.js application
4. Run `/api/admin/permissions-verify` POST

## Long-term Recommendations

1. **Add permission validation in admin UI** - Show a warning if permissions look invalid
2. **Add permission test buttons** - Let admins test a user's access before assigning
3. **Implement permission inheritance** - Some permissions could imply others (e.g., manage_X implies view_X)
4. **Add permission change notifications** - Notify staff when their permissions change
5. **Implement audit trail** - Better logging of permission changes (already partially done)
