# Get Your Supabase Credentials - Step by Step

## 📍 Where to Find Everything in Supabase Dashboard

### Step 1: Go to Your Supabase Project

1. Visit https://supabase.com/dashboard
2. Sign in if needed
3. Click on your **SmartEato** project (or the project you're using)

---

## 🔑 Step 2: Get API Keys

### Location: Settings → API

1. Click **Settings** (gear icon at bottom left)
2. Click **API**
3. You'll see the **Project API keys** section

### What to Copy:

**For Mobile App (.env):**
- ✅ **anon public** key (starts with `eyJhbGc...`)
  - This is safe to use in the mobile app
  - Already configured in your `.env` file

**For Backend API (appsettings.json):**
- ⚠️ **service_role** key (starts with `eyJhbGc...`)
  - This is SECRET - never expose in mobile app!
  - Paste into `appsettings.json` → `Supabase:Key`
  - Click the "Reveal" button if hidden

---

## 🔐 Step 3: Get JWT Secret (MOST IMPORTANT!)

### Location: Same page, scroll down to JWT Settings

1. Still on Settings → API page
2. Scroll down to **JWT Settings** section
3. You'll see:
   - JWT Secret
   - JWT Expiry

### What to Copy:

- ⚠️ **JWT Secret** (long alphanumeric string)
  - This is SECRET!
  - NOT the same as the anon key or service_role key
  - Paste into `appsettings.json` → `Supabase:JwtSecret`

**Example of what it looks like:**
```
your-super-secret-jwt-token-signing-key-here
```

---

## 📝 Step 4: Update Your Configuration Files

### Mobile App: `.env`

Already configured, but verify:

```env
SUPABASE_URL=https://uaqluphxbjznheqeseyk.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (anon public key)
API_BASE_URL=http://10.0.2.2:5000
```

### Backend API: `appsettings.json`

**File:** `smarteato/src/SmartEato.Api/appsettings.json`

Replace the placeholders:

```json
{
  "Supabase": {
    "Url": "https://uaqluphxbjznheqeseyk.supabase.co",
    "Key": "PASTE_SERVICE_ROLE_KEY_HERE",     ← From Project API keys
    "JwtSecret": "PASTE_JWT_SECRET_HERE"       ← From JWT Settings
  }
}
```

---

## 🗄️ Step 5: Create Database Table

### Location: SQL Editor

1. Click **SQL Editor** in the left sidebar (looks like `</>` icon)
2. Click **New Query** button (top right)
3. Copy the entire contents of `smarteato/src/SmartEato.Api/database-setup.sql`
4. Paste into the SQL editor
5. Click **Run** or press `Ctrl+Enter`

### Expected Result:

You should see:
```
Success. No rows returned
```

### Verify Table Was Created:

Run this query:
```sql
SELECT * FROM user_profiles;
```

You should see an empty table with columns, not an error.

---

## ✅ Checklist

Before running the app, make sure you have:

### Mobile App
- ✅ `.env` file exists in `smarteato/src/SmartEato.Mobile/`
- ✅ `SUPABASE_URL` is set
- ✅ `SUPABASE_ANON_KEY` is set
- ✅ `API_BASE_URL` is set

### Backend API
- ✅ `appsettings.json` → `Supabase:Key` has **service_role** key (not anon key!)
- ✅ `appsettings.json` → `Supabase:JwtSecret` has the **JWT Secret**
- ✅ Both keys are NOT the placeholder text

### Database
- ✅ Ran `database-setup.sql` in Supabase SQL Editor
- ✅ `user_profiles` table exists
- ✅ No errors when running `SELECT * FROM user_profiles;`

---

## 🔄 After Configuration

1. **Restart the Backend API**
   ```bash
   # Stop the current API (Ctrl+C)
   cd smarteato/src/SmartEato.AppHost
   dotnet run
   ```

2. **Restart Mobile App** (if needed)
   ```bash
   # Stop current (Ctrl+C)
   cd smarteato/src/SmartEato.Mobile
   npm start
   ```

3. **Test Signup Flow**
   - Open the mobile app
   - Click "Sign Up"
   - Fill in email/password
   - Complete profile setup
   - Should see dashboard with "Hey {YourName}!"

---

## 🐛 Still Getting Errors?

### Error: "Could not find the table 'public.user_profiles'"
→ You didn't run the SQL script yet. Go back to Step 5.

### Error: "401 Unauthorized"
→ JWT Secret is wrong or missing. Double-check:
1. You copied the JWT Secret from JWT Settings (not from Project API keys)
2. You pasted it into `Supabase:JwtSecret` in `appsettings.json`
3. You restarted the API after making the change

### Error: "JWT Secret is not configured"
→ Backend can't find the JWT Secret. Check:
1. The key in `appsettings.json` is exactly `"JwtSecret"` (case-sensitive)
2. The value is not the placeholder text
3. The JSON is valid (no missing commas, quotes, etc.)

### Still Stuck?

Check the API logs in the terminal where you ran `dotnet run`. Look for:
- "Authentication failed: ..." - JWT token validation details
- "User authenticated - ID: ..." - Success message

---

## 📚 Visual Guide Summary

```
Supabase Dashboard
├── Settings (⚙️ bottom left)
│   └── API
│       ├── Project API keys
│       │   ├── anon public ─────────► Mobile .env (SUPABASE_ANON_KEY)
│       │   └── service_role ────────► Backend appsettings.json (Supabase:Key)
│       └── JWT Settings
│           └── JWT Secret ───────────► Backend appsettings.json (Supabase:JwtSecret)
└── SQL Editor (</>)
    └── Run database-setup.sql here
```

---

## 🎯 Quick Copy-Paste Guide

1. **Supabase → Settings → API**
   - Copy `service_role` key
   - Copy `JWT Secret`

2. **Open:** `smarteato/src/SmartEato.Api/appsettings.json`

3. **Paste:**
   ```json
   "Key": "paste service_role here",
   "JwtSecret": "paste JWT Secret here"
   ```

4. **Supabase → SQL Editor**
   - Copy all of `database-setup.sql`
   - Paste and Run

5. **Restart API**
   - `Ctrl+C` to stop
   - `dotnet run` to start

Done! 🎉

